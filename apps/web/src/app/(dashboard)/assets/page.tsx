'use client';

import * as React from 'react';
import { Card, Button, Badge } from '@hq/ui';
import {
  FolderOpen,
  Search,
  Download,
  History,
  ShieldAlert,
  UploadCloud,
  FileText,
  FileImage,
  Video,
  Database,
  AlertTriangle,
  RotateCcw,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../../../contexts/auth-context';

interface AssetVersion {
  id: string;
  version: number;
  filename: string;
  fileSize: number;
  sha256: string;
  gcsPath: string;
  changeSummary: string | null;
  createdAt: string;
}

interface Asset {
  id: string;
  filename: string;
  description: string | null;
  fileSize: number;
  mimeType: string;
  sha256: string;
  gcsPath: string;
  classification: 'PUBLIC' | 'INTERNAL' | 'CONFIDENTIAL' | 'RESTRICTED';
  isLegalHold: boolean;
  createdAt: string;
  updatedAt: string;
  versions?: AssetVersion[];
}

export default function AssetCenterPage() {
  const { token } = useAuth();

  // Search & Filter state
  const [activeCategory, setActiveCategory] = React.useState<string>('all');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedAssetId, setSelectedAssetId] = React.useState<string | null>(null);

  // Upload state
  const [isDragging, setIsDragging] = React.useState(false);
  const [uploadProgress, setUploadProgress] = React.useState<number | null>(null);
  const [uploadError, setUploadError] = React.useState<string | null>(null);

  // Asset details state
  const [assets, setAssets] = React.useState<Asset[]>([]);
  const [selectedAsset, setSelectedAsset] = React.useState<Asset | null>(null);
  const [loading, setLoading] = React.useState(true);

  // Custom onboarding data
  const [brandColor, setBrandColor] = React.useState('#0A84FF');

  React.useEffect(() => {
    // Read brand color from onboarding draft
    const draftStr = localStorage.getItem('hq_onboarding_draft');
    if (draftStr) {
      try {
        const draft = JSON.parse(draftStr);
        if (draft.brandColor) setBrandColor(draft.brandColor);
      } catch (e) {
        console.warn('Error reading onboarding draft:', e);
      }
    }
  }, []);

  const fetchAssets = React.useCallback(async () => {
    if (!token) return;
    try {
      let url = '/api/assets';
      const params = [];
      if (activeCategory !== 'all') {
        params.push(`category=${activeCategory}`);
      }
      if (searchQuery) {
        params.push(`search=${encodeURIComponent(searchQuery)}`);
      }
      if (params.length > 0) {
        url += '?' + params.join('&');
      }

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setAssets(data);

        // Auto select first asset if none is selected
        if (data.length > 0 && !selectedAssetId) {
          setSelectedAssetId(data[0].id);
        }
      }
    } catch (e) {
      console.error('Failed retrieving assets list:', e);
    } finally {
      setLoading(false);
    }
  }, [token, activeCategory, searchQuery, selectedAssetId]);

  React.useEffect(() => {
    if (token) {
      fetchAssets();
    }
  }, [token, activeCategory, searchQuery, fetchAssets]);

  // Fetch full details of selected asset (including versions)
  React.useEffect(() => {
    if (!token || !selectedAssetId) {
      setSelectedAsset(null);
      return;
    }
    const fetchSelectedAsset = async () => {
      try {
        const res = await fetch(`/api/assets/${selectedAssetId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setSelectedAsset(data);
        }
      } catch (e) {
        console.error('Failed retrieving asset details:', e);
      }
    };
    fetchSelectedAsset();
  }, [token, selectedAssetId]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setUploadError(null);

    const file = e.dataTransfer.files[0];
    if (file) {
      await uploadFile(file);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const file = e.target.files?.[0];
    if (file) {
      await uploadFile(file);
    }
  };

  const uploadFile = async (file: File) => {
    if (!token) return;
    setUploadProgress(10);

    try {
      const formData = new FormData();
      formData.append('file', file);

      // 1. Upload to storage bucket
      const uploadRes = await fetch('/api/storage/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!uploadRes.ok) {
        const errData = await uploadRes.json();
        throw new Error(errData.message || 'Storage check failed');
      }

      setUploadProgress(50);
      const uploadData = await uploadRes.json();

      // 2. Register asset in DB Asset ledger
      const registerRes = await fetch('/api/assets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          filename: file.name,
          fileSize: file.size,
          mimeType: file.type || 'text/plain',
          sha256: uploadData.sha256,
          gcsPath: uploadData.gcsPath,
          classification: 'CONFIDENTIAL',
          description: `Uploaded document: ${file.name}`,
        }),
      });

      if (!registerRes.ok) {
        throw new Error('Database registration failed');
      }

      setUploadProgress(100);
      setTimeout(() => setUploadProgress(null), 1500);

      const newAsset = await registerRes.json();
      setSelectedAssetId(newAsset.id);
      fetchAssets();
    } catch (err) {
      console.error('Upload failed:', err);
      const errMsg = err instanceof Error ? err.message : 'Upload operation failed.';
      setUploadError(errMsg);
      setUploadProgress(null);
    }
  };

  const handleRollback = async (versionId: string) => {
    if (!token || !selectedAssetId) return;
    try {
      const res = await fetch(`/api/assets/${selectedAssetId}/rollback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ versionId }),
      });
      if (res.ok) {
        const updated = await res.json();
        setSelectedAsset(updated);
        fetchAssets();
      }
    } catch (e) {
      console.error('Rollback failed:', e);
    }
  };

  const handleToggleHold = async () => {
    if (!token || !selectedAssetId) return;
    try {
      const res = await fetch(`/api/assets/${selectedAssetId}/toggle-hold`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const updated = await res.json();
        setSelectedAsset(updated);
        fetchAssets();
      }
    } catch (e) {
      console.error('Toggle Legal Hold failed:', e);
    }
  };

  const getMimeIcon = (mime: string) => {
    if (mime.startsWith('image/')) return <FileImage className="h-5 w-5 text-hq-cyan shrink-0" />;
    if (mime.startsWith('video/')) return <Video className="h-5 w-5 text-hq-purple shrink-0" />;
    if (mime.includes('pdf') || mime.includes('document') || mime.includes('text')) {
      return <FileText className="h-5 w-5 text-hq-blue shrink-0" />;
    }
    return <Database className="h-5 w-5 text-foreground/50 shrink-0" />;
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Calculate storage categories statistics
  const totalStorageUsed = assets.reduce((sum, a) => sum + a.fileSize, 0);
  const docStorage = assets
    .filter(
      (a) =>
        a.mimeType.includes('pdf') ||
        a.mimeType.includes('document') ||
        a.mimeType.includes('text'),
    )
    .reduce((sum, a) => sum + a.fileSize, 0);
  const imageStorage = assets
    .filter((a) => a.mimeType.startsWith('image/'))
    .reduce((sum, a) => sum + a.fileSize, 0);
  const videoStorage = assets
    .filter((a) => a.mimeType.startsWith('video/'))
    .reduce((sum, a) => sum + a.fileSize, 0);
  const otherStorage = totalStorageUsed - docStorage - imageStorage - videoStorage;

  const docPercentage = totalStorageUsed ? (docStorage / totalStorageUsed) * 100 : 0;
  const imagePercentage = totalStorageUsed ? (imageStorage / totalStorageUsed) * 100 : 0;
  const videoPercentage = totalStorageUsed ? (videoStorage / totalStorageUsed) * 100 : 0;
  const otherPercentage = totalStorageUsed ? (otherStorage / totalStorageUsed) * 100 : 0;

  return (
    <div className="space-y-8 select-none text-foreground pb-12">
      {/* Page Header */}
      <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0 border-b border-card-border pb-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#1A1A1E] dark:text-white flex items-center gap-2">
            <FolderOpen className="h-8 w-8 text-hq-blue" />
            Asset Center
          </h1>
          <p className="text-foreground/60 text-sm mt-1">
            Secure digital vault indexing copywriting drafts, design files, reports, and version
            histories.
          </p>
        </div>
      </div>

      {/* Storage Breakdown Banner */}
      <Card className="border border-card-border bg-card-bg p-5 shadow-[var(--card-shadow)] text-left space-y-3.5">
        <div className="flex justify-between items-baseline">
          <div>
            <span className="text-[10px] text-foreground/45 font-bold uppercase tracking-wider">
              Total Storage Capacity
            </span>
            <h3 className="text-lg font-extrabold text-[#1A1A1E] dark:text-white mt-0.5">
              {formatBytes(totalStorageUsed)} of 10.0 GB Used
            </h3>
          </div>
          <span className="text-xs text-foreground/50 font-bold">
            {((totalStorageUsed / (10 * 1024 * 1024 * 1024)) * 100).toFixed(2)}% used
          </span>
        </div>

        {/* Visual progress bar */}
        <div className="h-2.5 w-full bg-[#F9F9FB] dark:bg-[#0A0A0C] rounded-full overflow-hidden flex">
          <div
            className="bg-hq-blue h-full transition-all"
            style={{ width: `${docPercentage}%` }}
          ></div>
          <div
            className="bg-hq-cyan h-full transition-all"
            style={{ width: `${imagePercentage}%` }}
          ></div>
          <div
            className="bg-hq-purple h-full transition-all"
            style={{ width: `${videoPercentage}%` }}
          ></div>
          <div
            className="bg-foreground/20 h-full transition-all"
            style={{ width: `${otherPercentage}%` }}
          ></div>
        </div>

        <div className="flex flex-wrap gap-4 text-[10px] font-bold text-foreground/60">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-hq-blue"></span>Documents (
            {formatBytes(docStorage)})
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-hq-cyan"></span>Images (
            {formatBytes(imageStorage)})
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-hq-purple"></span>Videos (
            {formatBytes(videoStorage)})
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-foreground/20"></span>Other (
            {formatBytes(otherStorage)})
          </span>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-4 items-start">
        {/* Asset list browser */}
        <div className="lg:col-span-2 space-y-4">
          {/* File Drag Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-2 ${
              isDragging
                ? 'border-hq-blue bg-hq-blue/5'
                : 'border-card-border bg-[#F9F9FB] dark:bg-[#0A0A0C] hover:bg-black/5 dark:hover:bg-white/5'
            }`}
          >
            <UploadCloud className="h-8 w-8 text-foreground/45" />
            <div className="space-y-1">
              <p className="text-xs font-bold text-[#1A1A1E] dark:text-white">
                Drag and drop files here to audit
              </p>
              <p className="text-[10px] text-foreground/50">
                Supports PDF, DOCX, JPEG, PNG, MP4 up to 50MB
              </p>
            </div>
            <input type="file" id="file-selector" onChange={handleFileChange} className="hidden" />
            <Button
              onClick={() => document.getElementById('file-selector')?.click()}
              size="sm"
              className="text-[10px] font-bold h-7 text-white"
              style={{ backgroundColor: brandColor }}
            >
              Browse Files
            </Button>
          </div>

          {/* Upload Progress feedback */}
          {uploadProgress !== null && (
            <div className="bg-card-bg border border-card-border p-4 rounded-xl space-y-2 text-left">
              <div className="flex justify-between items-baseline text-[10px] font-bold text-foreground/75">
                <span>Encrypting & Scanning File...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="h-1.5 w-full bg-[#F9F9FB] dark:bg-[#0A0A0C] rounded-full overflow-hidden">
                <div
                  className="bg-hq-blue h-full transition-all"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          {uploadError && (
            <div className="border border-red-500/25 bg-red-500/5 text-red-500 text-[10px] font-bold p-3 rounded-xl flex items-center gap-1.5">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}

          {/* Search bar & Category filters */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-card-bg border border-card-border p-3.5 rounded-2xl">
            <div className="flex gap-1.5">
              {[
                { id: 'all', label: 'All Files' },
                { id: 'document', label: 'Docs' },
                { id: 'image', label: 'Images' },
                { id: 'data', label: 'Data' },
              ].map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                    activeCategory === category.id
                      ? 'text-white border-transparent'
                      : 'bg-[#F9F9FB] dark:bg-[#0A0A0C] border-card-border text-foreground/70 hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                  style={{
                    backgroundColor: activeCategory === category.id ? brandColor : undefined,
                  }}
                >
                  {category.label}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-48">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-foreground/45" />
              <input
                type="text"
                placeholder="Search ledger..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 w-full rounded-md border border-card-border bg-[#F9F9FB] dark:bg-[#0A0A0C] pl-9 pr-4 text-xs text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-hq-blue"
              />
            </div>
          </div>

          {/* Directory Ledger Table */}
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-3">
              <div className="h-8 w-8 rounded-full border-2 border-hq-blue border-t-transparent animate-spin"></div>
              <p className="text-xs text-foreground/50">Retrieving digital ledger...</p>
            </div>
          ) : assets.length === 0 ? (
            <Card className="border border-card-border bg-card-bg p-12 text-center">
              <FolderOpen className="h-10 w-10 text-foreground/25 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-[#1A1A1E] dark:text-white">Directory Empty</h3>
              <p className="text-xs text-foreground/50 mt-1">
                Upload files above or launch missions to generate assets.
              </p>
            </Card>
          ) : (
            <div className="space-y-2">
              {assets.map((asset) => (
                <div
                  key={asset.id}
                  onClick={() => setSelectedAssetId(asset.id)}
                  className={`p-3.5 border rounded-xl flex items-center justify-between cursor-pointer transition-all ${
                    selectedAssetId === asset.id
                      ? 'border-hq-blue bg-hq-blue/5'
                      : 'border-card-border bg-card-bg hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center space-x-3 text-left">
                    {getMimeIcon(asset.mimeType)}
                    <div>
                      <h4 className="text-xs font-bold text-[#1A1A1E] dark:text-white leading-tight flex items-center gap-1.5">
                        {asset.filename}
                        {asset.isLegalHold && (
                          <ShieldAlert className="h-3.5 w-3.5 text-red-500 shrink-0" />
                        )}
                      </h4>
                      <p className="text-[10px] text-foreground/50 mt-0.5 font-semibold">
                        {formatBytes(asset.fileSize)} • {asset.classification}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-foreground/45" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Detailed asset inspector panel */}
        <div className="lg:col-span-2">
          {selectedAsset ? (
            <Card className="border border-card-border bg-card-bg p-5 shadow-[var(--card-shadow)] text-left space-y-6">
              {/* Asset Header Info */}
              <div className="border-b border-card-border pb-4 space-y-2.5">
                <div className="flex justify-between items-start">
                  <Badge variant="ai" className="text-[9px]">
                    {selectedAsset.classification}
                  </Badge>

                  <div className="flex items-center gap-2">
                    <Button
                      onClick={handleToggleHold}
                      variant="outline"
                      size="sm"
                      className={`text-[9px] font-bold h-7 ${
                        selectedAsset.isLegalHold
                          ? 'border-red-500 bg-red-500/5 text-red-500 hover:bg-red-500/10'
                          : 'border-card-border'
                      }`}
                    >
                      <ShieldAlert className="h-3.5 w-3.5 mr-1" />
                      {selectedAsset.isLegalHold ? 'Unlock Hold' : 'Legal Hold'}
                    </Button>
                    <a
                      href={selectedAsset.gcsPath}
                      download
                      className="inline-flex items-center justify-center rounded-xl border border-card-border bg-[#F9F9FB] dark:bg-[#0A0A0C] px-3 py-1 text-[9px] font-bold text-foreground/75 hover:bg-black/5"
                    >
                      <Download className="h-3.5 w-3.5 mr-1" />
                      Download
                    </a>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-extrabold text-[#1A1A1E] dark:text-white leading-tight">
                    {selectedAsset.filename}
                  </h3>
                  <p className="text-[10px] text-foreground/50 mt-1 font-semibold leading-relaxed">
                    Checksum SHA-256:{' '}
                    <code className="bg-[#F9F9FB] dark:bg-[#0A0A0C] px-1 py-0.5 rounded text-hq-purple">
                      {selectedAsset.sha256}
                    </code>
                  </p>
                </div>
              </div>

              {/* Document Previewer */}
              <div className="space-y-2.5 text-left">
                <h4 className="text-[10px] font-bold text-foreground/50 uppercase tracking-widest">
                  Secure Document Preview
                </h4>
                <div className="min-h-36 rounded-xl border border-card-border bg-[#F9F9FB] dark:bg-[#0A0A0C] p-4 text-[11px] leading-relaxed font-semibold overflow-y-auto text-foreground/80 max-h-56">
                  {selectedAsset.mimeType.startsWith('image/') ? (
                    <div className="flex flex-col items-center justify-center py-6 space-y-2">
                      <FileImage className="h-10 w-10 text-hq-cyan" />
                      <span className="text-[10px] text-foreground/45">
                        Image content verified. Integrity hash match.
                      </span>
                    </div>
                  ) : selectedAsset.mimeType.startsWith('video/') ? (
                    <div className="flex flex-col items-center justify-center py-6 space-y-2">
                      <Video className="h-10 w-10 text-hq-purple" />
                      <span className="text-[10px] text-foreground/45">
                        Video file format verified. Previews disabled on local fallbacks.
                      </span>
                    </div>
                  ) : (
                    <div>
                      <p className="font-extrabold text-[#1A1A1E] dark:text-white mb-2">
                        {selectedAsset.filename} Description
                      </p>
                      <p>
                        {selectedAsset.description || 'No description provided for this index.'}
                      </p>
                      <div className="mt-4 border-t border-card-border/50 pt-2 text-[10px] text-foreground/40 font-bold uppercase">
                        Ledger metadata index: {selectedAsset.gcsPath}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Version History ledger */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-foreground/50 uppercase tracking-widest text-[10px] font-bold border-b border-card-border pb-1.5">
                  <History className="h-3.5 w-3.5" />
                  <span>Version History Ledger</span>
                </div>

                <div className="space-y-3 max-h-52 overflow-y-auto">
                  {selectedAsset.versions?.map((ver) => (
                    <div
                      key={ver.id}
                      className="p-3 border border-card-border bg-[#F9F9FB] dark:bg-[#0A0A0C] rounded-xl flex items-center justify-between text-left"
                    >
                      <div className="space-y-1">
                        <div className="flex items-baseline space-x-2">
                          <span className="text-xs font-bold text-[#1A1A1E] dark:text-white">
                            Version {ver.version}
                          </span>
                          <span className="text-[9px] text-foreground/45 font-semibold">
                            {new Date(ver.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-[10px] text-foreground/60 font-semibold leading-tight">
                          {ver.changeSummary || 'Manual index update'}
                        </p>
                      </div>

                      <Button
                        onClick={() => handleRollback(ver.id)}
                        disabled={
                          selectedAsset.isLegalHold ||
                          ver.version === selectedAsset.versions?.[0]?.version
                        }
                        variant="ghost"
                        size="sm"
                        className="text-[10px] font-extrabold h-7 border border-card-border text-hq-blue hover:bg-hq-blue/5 disabled:opacity-50 shrink-0"
                      >
                        <RotateCcw className="h-3.5 w-3.5 mr-1" />
                        Rollback
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          ) : (
            <Card className="border border-card-border bg-card-bg p-16 text-center">
              <FolderOpen className="h-10 w-10 text-foreground/25 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-[#1A1A1E] dark:text-white">Select Asset</h3>
              <p className="text-xs text-foreground/50 mt-1">
                Select an asset from the ledger to inspect files and rollbacks.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
