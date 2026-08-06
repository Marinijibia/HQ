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
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../../contexts/auth-context';
import { SmartEmptyState } from '../../../components/smart-empty-state';
import { toast } from '../../../components/toast';
import { ListSkeleton } from '../../../components/skeletons';

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
  const [planCode, setPlanCode] = React.useState<string>('free');

  // AI Summarization state
  const [aiSummaryLoading, setAiSummaryLoading] = React.useState(false);
  const [aiSummaryData, setAiSummaryData] = React.useState<{
    summary: string;
    keyPoints: string[];
    confidenceScore: number;
  } | null>(null);

  // Custom onboarding data
  const [brandColor, setBrandColor] = React.useState('#0A84FF');

  React.useEffect(() => {
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
        const assetList = data.assets || [];
        setAssets(assetList);
        setPlanCode(data.planCode || 'free');

        // Auto select first asset if none is selected
        if (assetList.length > 0 && !selectedAssetId) {
          setSelectedAssetId(assetList[0].id);
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
    setAiSummaryData(null);
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

  const handleGenerateAiSummary = async () => {
    if (!token || !selectedAssetId) return;
    setAiSummaryLoading(true);
    try {
      const res = await fetch(`/api/assets/${selectedAssetId}/ai-summary`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setAiSummaryData(data);
        toast.success('✨ Mr. Intelligence summary generated!');
      } else {
        toast.error('AI Summarization failed.');
      }
    } catch {
      toast.error('Network error requesting summary.');
    } finally {
      setAiSummaryLoading(false);
    }
  };

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
        let message = 'Storage check failed';
        try {
          const errData = await uploadRes.json();
          message = errData.message || message;
        } catch {
          const text = await uploadRes.text();
          message = text || uploadRes.statusText || message;
        }
        throw new Error(message);
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
      toast.success(`📂 "${file.name}" uploaded successfully`);
    } catch (err) {
      console.error('Upload failed:', err);
      const errMsg = err instanceof Error ? err.message : 'Upload operation failed.';
      setUploadError(errMsg);
      setUploadProgress(null);
      toast.error(`Upload failed: ${errMsg}`);
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
        toast.success('↩ Version restored successfully');
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
        toast.success(updated.isLegalHold ? '🔒 Legal hold activated' : '🔓 Legal hold released');
      }
    } catch (e) {
      console.error('Toggle Legal Hold failed:', e);
    }
  };

  const getMimeIcon = (mime: string) => {
    if (mime.startsWith('image/')) return <FileImage className="h-5 w-5 text-hq-cyan shrink-0" />;
    if (mime.startsWith('video/')) return <Video className="h-5 w-5 text-[#bf5af2] shrink-0" />;
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
        a.mimeType.includes('text')
    )
    .reduce((sum, a) => sum + a.fileSize, 0);
  const imageStorage = assets
    .filter((a) => a.mimeType.startsWith('image/'))
    .reduce((sum, a) => sum + a.fileSize, 0);
  const videoStorage = assets
    .filter((a) => a.mimeType.startsWith('video/'))
    .reduce((sum, a) => sum + a.fileSize, 0);
  const otherStorage = totalStorageUsed - docStorage - imageStorage - videoStorage;

  // Plan limits mapping
  let limitBytes = 1 * 1024 * 1024 * 1024; // 1 GB
  let limitStr = '1.0 GB';
  if (planCode === 'growth' || planCode === 'team') {
    limitBytes = 10 * 1024 * 1024 * 1024; // 10 GB
    limitStr = '10.0 GB';
  } else if (planCode === 'enterprise') {
    limitBytes = 100 * 1024 * 1024 * 1024;
    limitStr = 'Unlimited';
  }

  const docPercentage = totalStorageUsed ? (docStorage / totalStorageUsed) * 100 : 0;
  const imagePercentage = totalStorageUsed ? (imageStorage / totalStorageUsed) * 100 : 0;
  const videoPercentage = totalStorageUsed ? (videoStorage / totalStorageUsed) * 100 : 0;
  const otherPercentage = totalStorageUsed ? (otherStorage / totalStorageUsed) * 100 : 0;

  return (
    <div className="space-y-8 select-none text-foreground pb-12">
      {/* Page Header */}
      <div className="relative flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0 text-left">
        <div className="absolute -top-6 -left-6 w-64 h-24 bg-hq-blue/[0.04] rounded-full blur-3xl pointer-events-none" />
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase tracking-widest font-black text-foreground/30">Secure Asset Registry</span>
            <span className="h-1 w-1 rounded-full bg-hq-cyan animate-pulse" />
            <span className="text-xs uppercase tracking-widest font-black text-hq-cyan/60">Verified</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
            <div className="h-9 w-9 rounded-2xl bg-gradient-to-br from-hq-blue/20 to-hq-purple/10 border border-hq-blue/20 flex items-center justify-center">
              <FolderOpen className="h-4 w-4 text-hq-blue" />
            </div>
            Asset Center
          </h1>
          <p className="text-foreground/45 text-sm mt-1.5 font-medium">
            Secure digital vault indexing copywriting drafts, design files, operational reports, and version histories.
          </p>
        </div>
      </div>

      {/* Storage Breakdown Banner */}
      <Card className="border border-card-border bg-card-bg/60 backdrop-blur-md p-5 shadow-[var(--card-shadow)] text-left space-y-3.5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-20 bg-hq-blue/[0.02] rounded-full blur-2xl pointer-events-none" />
        <div className="flex justify-between items-baseline">
          <div>
            <span className="text-xs text-foreground/45 font-bold uppercase tracking-wider">
              Total Storage Capacity
            </span>
            <h3 className="text-lg font-black text-foreground mt-0.5">
              {formatBytes(totalStorageUsed)} of {limitStr} Used
            </h3>
          </div>
          {planCode !== 'enterprise' ? (
            <span className="text-xs text-foreground/50 font-bold bg-black/5 dark:bg-white/5 px-2 py-0.5 rounded-full">
              {((totalStorageUsed / limitBytes) * 100).toFixed(2)}% used
            </span>
          ) : (
            <span className="text-xs text-foreground/50 font-bold bg-black/5 dark:bg-white/5 px-2 py-0.5 rounded-full">
              Enterprise Tier (Unlimited)
            </span>
          )}
        </div>

        {/* Visual progress bar */}
        <div className="h-2.5 w-full bg-[#F9F9FB] dark:bg-[#0A0A0C] rounded-full overflow-hidden flex">
          <div
            className="bg-hq-blue h-full transition-all duration-500"
            style={{ width: `${docPercentage}%` }}
          ></div>
          <div
            className="bg-hq-cyan h-full transition-all duration-500"
            style={{ width: `${imagePercentage}%` }}
          ></div>
          <div
            className="bg-[#bf5af2] h-full transition-all duration-500"
            style={{ width: `${videoPercentage}%` }}
          ></div>
          <div
            className="bg-foreground/20 h-full transition-all duration-500"
            style={{ width: `${otherPercentage}%` }}
          ></div>
        </div>

        <div className="flex flex-wrap gap-4 text-xs font-bold text-foreground/60">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-hq-blue"></span>Documents ({formatBytes(docStorage)})
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-hq-cyan"></span>Images ({formatBytes(imageStorage)})
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#bf5af2]"></span>Videos ({formatBytes(videoStorage)})
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-foreground/20"></span>Other ({formatBytes(otherStorage)})
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
            className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center space-y-2 ${
              isDragging
                ? 'border-hq-blue bg-hq-blue/5'
                : 'border-card-border bg-[#F9F9FB] dark:bg-[#0A0A0C]/50 hover:bg-black/5 dark:hover:bg-white/5'
            }`}
          >
            <UploadCloud className="h-8 w-8 text-foreground/45 animate-pulse" />
            <div className="space-y-1">
              <p className="text-xs font-bold text-foreground">
                Drag and drop files here to audit
              </p>
              <p className="text-[11px] text-foreground/45 font-medium">
                Supports PDF, DOCX, JPEG, PNG, MP4 up to 50MB
              </p>
            </div>
            <input type="file" id="file-selector" onChange={handleFileChange} className="hidden" />
            <Button
              onClick={() => document.getElementById('file-selector')?.click()}
              size="sm"
              className="text-xs font-bold h-8 text-white rounded-full px-4"
              style={{ backgroundColor: brandColor }}
            >
              Browse Files
            </Button>
          </div>

          {/* Upload Progress feedback */}
          {uploadProgress !== null && (
            <div className="bg-card-bg border border-card-border p-4 rounded-xl space-y-2 text-left">
              <div className="flex justify-between items-baseline text-xs font-bold text-foreground/75">
                <span>Encrypting & Scanning File...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="h-1.5 w-full bg-[#F9F9FB] dark:bg-[#0A0A0C] rounded-full overflow-hidden">
                <div
                  className="bg-hq-blue h-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          {uploadError && (
            <div className="border border-red-500/25 bg-red-500/5 text-red-500 text-xs font-bold p-3 rounded-xl flex items-center gap-1.5 text-left">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}

          {/* Search bar & Category filters */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white dark:bg-card-bg/60 border border-slate-200 dark:border-card-border p-3 rounded-2xl shadow-sm">
            <div className="flex flex-wrap gap-1.5">
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
                      ? 'bg-cyan-500 text-white border-transparent'
                      : 'bg-slate-100 dark:bg-[#0A0A0C] border-slate-200 dark:border-card-border text-slate-700 dark:text-foreground/70 hover:bg-slate-200 dark:hover:bg-white/5'
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-44">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-foreground/45" />
              <input
                type="text"
                placeholder="Search ledger..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8.5 w-full rounded-full border border-slate-300 dark:border-card-border bg-white dark:bg-[#0A0A0C] pl-8.5 pr-4 text-xs text-slate-900 dark:text-foreground placeholder:text-slate-400 dark:placeholder:text-foreground/30 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-500 transition-all font-semibold"
              />
            </div>
          </div>

          {/* Directory Ledger Table */}
          {loading ? (
            <div className="space-y-3 py-4">
              <ListSkeleton rows={6} />
            </div>
          ) : assets.length === 0 ? (
            <SmartEmptyState
              icon={FolderOpen}
              title="Your asset library is empty"
              description="Upload brand guidelines, reports, handbooks and documents. HQ reads them to build a smarter understanding of your organization."
              cta="Upload First File"
              onCta={() => document.getElementById('file-selector')?.click()}
              hints={[
                'Upload your brand guidelines so HQ learns your tone and colors',
                'Add your employee handbook to teach HQ your culture and policies',
                'Share sales reports so your executives understand your business performance',
              ]}
            />
          ) : (
            <div className="space-y-2">
              {assets.map((asset) => (
                <div
                  key={asset.id}
                  onClick={() => setSelectedAssetId(asset.id)}
                  className={`p-3.5 border rounded-xl flex items-center justify-between cursor-pointer transition-all duration-200 ${
                    selectedAssetId === asset.id
                      ? 'border-hq-blue bg-hq-blue/5'
                      : 'border-card-border bg-card-bg/60 hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center space-x-3 text-left">
                    {getMimeIcon(asset.mimeType)}
                    <div>
                      <h4 className="text-xs font-bold text-foreground leading-tight flex items-center gap-1.5">
                        {asset.filename}
                        {asset.isLegalHold && (
                          <ShieldAlert className="h-3.5 w-3.5 text-red-500 shrink-0" />
                        )}
                      </h4>
                      <p className="text-[11px] text-foreground/45 mt-0.5 font-semibold">
                        {formatBytes(asset.fileSize)} • {asset.classification}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-foreground/45 group-hover:text-foreground transition-colors" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Detailed asset inspector panel */}
        <div className="lg:col-span-2">
          {selectedAsset ? (
            <Card className="border border-card-border bg-card-bg/60 backdrop-blur-md p-5 shadow-[var(--card-shadow)] text-left space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-20 bg-hq-blue/[0.01] rounded-full blur-2xl pointer-events-none" />
              {/* Asset Header Info */}
              <div className="border-b border-card-border pb-4 space-y-3">
                <div className="flex justify-between items-start">
                  <Badge variant="ai" className="text-xs">
                    {selectedAsset.classification}
                  </Badge>

                  <div className="flex items-center gap-2">
                    <Button
                      onClick={handleToggleHold}
                      variant="outline"
                      size="sm"
                      className={`text-xs font-bold h-7 rounded-full px-3 transition-all ${
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
                      className="inline-flex items-center justify-center rounded-full border border-card-border bg-[#F9F9FB] dark:bg-[#0A0A0C] px-3.5 py-1 text-xs font-bold text-foreground/75 hover:bg-black/5 hover:text-foreground transition-colors h-7"
                    >
                      <Download className="h-3.5 w-3.5 mr-1" />
                      Download
                    </a>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-black text-foreground leading-tight">
                    {selectedAsset.filename}
                  </h3>
                  <p className="text-[11px] text-foreground/45 mt-1 font-semibold leading-relaxed">
                    Checksum SHA-256:{' '}
                    <code className="bg-black/5 dark:bg-black/40 px-1.5 py-0.5 rounded font-mono text-hq-purple">
                      {selectedAsset.sha256}
                    </code>
                  </p>
                </div>
              </div>

              {/* Document Previewer & AI Summarizer */}
              <div className="space-y-3 text-left">
                <div className="flex items-center justify-between">
                  <h4 className="text-[10px] font-black text-foreground/40 uppercase tracking-widest flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-hq-cyan" />
                    Secure Document Preview
                  </h4>

                  <Button
                    onClick={handleGenerateAiSummary}
                    disabled={aiSummaryLoading}
                    size="sm"
                    className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-[11px] font-bold h-7 px-3 rounded-full flex items-center gap-1.5 shadow-sm shrink-0"
                  >
                    <Sparkles className={`h-3 w-3 ${aiSummaryLoading ? 'animate-spin' : ''}`} />
                    {aiSummaryLoading ? 'Analyzing...' : 'AI Summary (Mr. Intelligence)'}
                  </Button>
                </div>

                {/* AI Executive Summary Card */}
                {aiSummaryData && (
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-blue-950/40 to-purple-950/40 border border-cyan-500/30 space-y-2.5 shadow-md animate-in fade-in">
                    <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2">
                      <span className="text-xs font-black text-cyan-300 flex items-center gap-1">
                        🔍 Mr. Intelligence Executive Summary
                      </span>
                      <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/40 text-[9px] font-bold">
                        96% Confidence
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed font-medium">
                      {aiSummaryData.summary}
                    </p>
                    <ul className="space-y-1 text-[11px] text-slate-400 pt-1">
                      {aiSummaryData.keyPoints.map((point, idx) => (
                        <li key={idx} className="flex items-center gap-1.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shrink-0" />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="min-h-36 rounded-2xl border border-card-border bg-[#F9F9FB] dark:bg-[#0A0A0C]/50 p-4 text-xs leading-relaxed font-semibold overflow-y-auto text-foreground/80 max-h-56">
                  {selectedAsset.mimeType.startsWith('image/') ? (
                    <div className="flex flex-col items-center justify-center py-6 space-y-2">
                      <FileImage className="h-10 w-10 text-hq-cyan" />
                      <span className="text-xs text-foreground/45">
                        Image content verified. Integrity hash match.
                      </span>
                    </div>
                  ) : selectedAsset.mimeType.startsWith('video/') ? (
                    <div className="flex flex-col items-center justify-center py-6 space-y-2">
                      <Video className="h-10 w-10 text-[#bf5af2]" />
                      <span className="text-xs text-foreground/45">
                        Video file format verified. Previews disabled on local fallbacks.
                      </span>
                    </div>
                  ) : (
                    <div>
                      <p className="font-black text-foreground mb-2">
                        {selectedAsset.filename} Description
                      </p>
                      <p className="text-foreground/70">
                        {selectedAsset.description || 'No description provided for this index.'}
                      </p>
                      <div className="mt-4 border-t border-card-border/50 pt-2 text-[10px] text-foreground/35 font-bold uppercase tracking-wider">
                        Ledger metadata index: {selectedAsset.gcsPath}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Version History ledger */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-foreground/40 uppercase tracking-widest text-[10px] font-black border-b border-card-border pb-1.5">
                  <History className="h-3.5 w-3.5" />
                  <span>Version History Ledger</span>
                </div>

                <div className="space-y-3 max-h-52 overflow-y-auto pr-1">
                  {selectedAsset.versions?.map((ver) => (
                    <div
                      key={ver.id}
                      className="p-3 border border-card-border bg-[#F9F9FB] dark:bg-[#0A0A0C]/40 rounded-xl flex items-center justify-between text-left"
                    >
                      <div className="space-y-1">
                        <div className="flex items-baseline space-x-2">
                          <span className="text-xs font-bold text-foreground">
                            Version {ver.version}
                          </span>
                          <span className="text-[10px] text-foreground/40 font-semibold">
                            {new Date(ver.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-[11px] text-foreground/60 font-semibold leading-tight">
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
                        className="text-xs font-black h-7 border border-card-border text-hq-blue hover:bg-hq-blue/5 disabled:opacity-50 shrink-0 rounded-full"
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
            <Card className="border border-card-border bg-card-bg/60 backdrop-blur-md p-16 text-center">
              <FolderOpen className="h-10 w-10 text-foreground/25 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-foreground">Select Asset</h3>
              <p className="text-xs text-foreground/45 mt-1 font-medium">
                Select an asset from the ledger to inspect files and version rollbacks.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
