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
  Trash2,
  Copy,
  Check,
  ExternalLink,
  FileCode,
  Maximize2,
  Minimize2,
  Eye,
  Code,
  Table,
  Volume2,
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

function parseCsv(csvText: string): { headers: string[]; rows: string[][] } {
  const lines = csvText.trim().split('\n').map((l) => l.trim()).filter(Boolean);
  if (lines.length === 0) return { headers: [], rows: [] };
  const headers = lines[0].split(',').map((h) => h.replace(/^["']|["']$/g, '').trim());
  const rows = lines.slice(1).map((line) => line.split(',').map((c) => c.replace(/^["']|["']$/g, '').trim()));
  return { headers, rows };
}

function RenderMarkdownView({ content }: { content: string }) {
  const lines = content.split('\n');
  return (
    <div className="space-y-2.5 text-left text-xs leading-relaxed select-text p-2">
      {lines.map((line, idx) => {
        if (line.startsWith('# ')) {
          return (
            <h1 key={idx} className="text-base font-black text-foreground pt-3 pb-1 border-b border-card-border/60">
              {line.replace('# ', '')}
            </h1>
          );
        }
        if (line.startsWith('## ')) {
          return (
            <h2 key={idx} className="text-sm font-black text-foreground pt-2.5 pb-0.5">
              {line.replace('## ', '')}
            </h2>
          );
        }
        if (line.startsWith('### ')) {
          return (
            <h3 key={idx} className="text-xs font-bold text-foreground pt-2">
              {line.replace('### ', '')}
            </h3>
          );
        }
        if (line.startsWith('> ')) {
          return (
            <blockquote key={idx} className="border-l-2 border-hq-blue pl-3 py-1 bg-hq-blue/5 rounded-r-lg text-foreground/85 italic font-medium">
              {line.replace('> ', '')}
            </blockquote>
          );
        }
        if (line.startsWith('- ') || line.startsWith('* ')) {
          return (
            <div key={idx} className="flex items-start gap-2 pl-2">
              <span className="h-1.5 w-1.5 rounded-full bg-hq-blue mt-1.5 shrink-0" />
              <span className="text-foreground/80 font-medium">{line.replace(/^[-*]\s+/, '')}</span>
            </div>
          );
        }
        if (!line.trim()) {
          return <div key={idx} className="h-1" />;
        }
        return (
          <p key={idx} className="text-foreground/80 font-medium leading-relaxed">
            {line}
          </p>
        );
      })}
    </div>
  );
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

  // Document full content & viewer state
  const [assetContent, setAssetContent] = React.useState<{
    content: string;
    isText: boolean;
    mimeType: string;
    filename: string;
  } | null>(null);
  const [previewBlobUrl, setPreviewBlobUrl] = React.useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = React.useState<boolean>(false);
  const [viewTab, setViewTab] = React.useState<'preview' | 'source' | 'table'>('preview');
  const [contentLoading, setContentLoading] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

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

  // Fetch full details, text content, and binary blob preview for selected asset
  React.useEffect(() => {
    setAiSummaryData(null);
    setAssetContent(null);
    setCopied(false);
    setViewTab('preview');

    if (!token || !selectedAssetId) {
      setSelectedAsset(null);
      setPreviewBlobUrl((prev) => {
        if (prev) window.URL.revokeObjectURL(prev);
        return null;
      });
      return;
    }

    let isMounted = true;

    const fetchSelectedAsset = async () => {
      try {
        const res = await fetch(`/api/assets/${selectedAssetId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok && isMounted) {
          const data = await res.json();
          setSelectedAsset(data);
        }
      } catch (e) {
        console.error('Failed retrieving asset details:', e);
      }
    };

    const fetchAssetContent = async () => {
      setContentLoading(true);
      try {
        const [contentRes, rawRes] = await Promise.allSettled([
          fetch(`/api/assets/${selectedAssetId}/content`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`/api/assets/${selectedAssetId}/raw`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (contentRes.status === 'fulfilled' && contentRes.value.ok && isMounted) {
          const data = await contentRes.value.json();
          setAssetContent(data);
        }

        if (rawRes.status === 'fulfilled' && rawRes.value.ok && isMounted) {
          const blob = await rawRes.value.blob();
          const url = window.URL.createObjectURL(blob);
          setPreviewBlobUrl((prev) => {
            if (prev) window.URL.revokeObjectURL(prev);
            return url;
          });
        }
      } catch (e) {
        console.error('Failed retrieving document preview:', e);
      } finally {
        if (isMounted) setContentLoading(false);
      }
    };

    fetchSelectedAsset();
    fetchAssetContent();

    return () => {
      isMounted = false;
    };
  }, [token, selectedAssetId]);

  const handleDownload = async () => {
    if (!token || !selectedAsset) return;
    try {
      toast.info(`Downloading "${selectedAsset.filename}"...`);
      const res = await fetch(`/api/assets/${selectedAsset.id}/download`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Download request failed');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = selectedAsset.filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success(`📥 "${selectedAsset.filename}" downloaded successfully`);
    } catch {
      toast.error('Failed downloading document asset.');
    }
  };

  const handleCopyContent = () => {
    if (assetContent?.content) {
      navigator.clipboard.writeText(assetContent.content);
      setCopied(true);
      toast.success('📋 Document content copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    }
  };

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
      const ext = file.name.split('.').pop()?.toLowerCase();
      let mime = file.type || 'text/plain';
      if (!file.type || file.type === 'application/octet-stream') {
        if (ext === 'pdf') mime = 'application/pdf';
        else if (ext === 'docx') mime = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        else if (ext === 'doc') mime = 'application/msword';
        else if (ext === 'md' || ext === 'markdown') mime = 'text/markdown';
        else if (ext === 'json') mime = 'application/json';
        else if (ext === 'csv') mime = 'text/csv';
        else if (ext === 'png') mime = 'image/png';
        else if (ext === 'jpg' || ext === 'jpeg') mime = 'image/jpeg';
        else if (ext === 'svg') mime = 'image/svg+xml';
        else if (ext === 'webp') mime = 'image/webp';
        else if (ext === 'mp4') mime = 'video/mp4';
        else mime = 'text/plain';
      }

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
          mimeType: mime,
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

  const handleDeleteAsset = async () => {
    if (!token || !selectedAssetId) return;
    if (selectedAsset?.isLegalHold) {
      toast.error('Asset is under Legal Hold. Unlock hold before deletion.');
      return;
    }
    try {
      const res = await fetch(`/api/assets/${selectedAssetId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        toast.success(`🗑️ "${selectedAsset?.filename}" deleted successfully`);
        setSelectedAssetId(null);
        setSelectedAsset(null);
        fetchAssets();
      } else {
        toast.error('Failed to delete asset');
      }
    } catch {
      toast.error('Network error deleting asset');
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

      <div className="grid gap-6 lg:grid-cols-12 items-start">
        {/* Asset list browser (Left Sidebar) */}
        <div className="lg:col-span-4 xl:col-span-4 space-y-4">
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

        {/* Detailed asset inspector panel (Right Main Canvas) */}
        <div className="lg:col-span-8 xl:col-span-8 space-y-4">
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
                    <Button
                      onClick={handleDownload}
                      variant="outline"
                      size="sm"
                      className="inline-flex items-center justify-center rounded-full border border-card-border bg-[#F9F9FB] dark:bg-[#0A0A0C] px-3.5 text-xs font-bold text-foreground/75 hover:bg-black/5 hover:text-foreground transition-colors h-7"
                    >
                      <Download className="h-3.5 w-3.5 mr-1" />
                      Download
                    </Button>
                    <Button
                      onClick={handleDeleteAsset}
                      disabled={selectedAsset.isLegalHold}
                      variant="outline"
                      size="sm"
                      className="text-xs font-bold h-7 rounded-full px-2.5 border-card-border text-red-500 hover:bg-red-500/10 hover:border-red-500/30 transition-all"
                      title="Archive asset"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
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
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-card-border/60 pb-2">
                  <div className="flex items-center gap-2">
                    <h4 className="text-[10px] font-black text-foreground/40 uppercase tracking-widest flex items-center gap-1.5">
                      <Eye className="h-3.5 w-3.5 text-hq-cyan" />
                      Live In-App Document Preview
                    </h4>

                    {/* View mode toggle tabs for text/markdown/csv */}
                    {assetContent?.isText && (
                      <div className="flex items-center gap-1 bg-black/5 dark:bg-white/5 p-0.5 rounded-lg text-[10px] font-bold">
                        {(selectedAsset.filename.endsWith('.md') || selectedAsset.mimeType.includes('markdown')) && (
                          <button
                            onClick={() => setViewTab('preview')}
                            className={`px-2 py-0.5 rounded-md transition-colors ${
                              viewTab === 'preview' ? 'bg-hq-blue text-white' : 'text-foreground/60 hover:text-foreground'
                            }`}
                          >
                            Rendered
                          </button>
                        )}
                        {(selectedAsset.filename.endsWith('.csv') || selectedAsset.mimeType.includes('csv')) && (
                          <button
                            onClick={() => setViewTab('table')}
                            className={`px-2 py-0.5 rounded-md transition-colors flex items-center gap-1 ${
                              viewTab === 'table' ? 'bg-hq-blue text-white' : 'text-foreground/60 hover:text-foreground'
                            }`}
                          >
                            <Table className="h-3 w-3" />
                            Table
                          </button>
                        )}
                        <button
                          onClick={() => setViewTab('source')}
                          className={`px-2 py-0.5 rounded-md transition-colors flex items-center gap-1 ${
                            viewTab === 'source' ? 'bg-hq-blue text-white' : 'text-foreground/60 hover:text-foreground'
                          }`}
                        >
                          <Code className="h-3 w-3" />
                          Source
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Button
                      onClick={handleGenerateAiSummary}
                      disabled={aiSummaryLoading}
                      size="sm"
                      className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-[11px] font-bold h-7 px-3 rounded-full flex items-center gap-1.5 shadow-sm shrink-0"
                    >
                      <Sparkles className={`h-3 w-3 ${aiSummaryLoading ? 'animate-spin' : ''}`} />
                      {aiSummaryLoading ? 'Analyzing...' : 'AI Summary (Mr. Intelligence)'}
                    </Button>

                    <Button
                      onClick={() => setIsFullscreen(true)}
                      variant="outline"
                      size="sm"
                      className="h-7 px-2.5 rounded-full text-xs font-bold border-card-border text-foreground/70 hover:text-foreground flex items-center gap-1"
                      title="Expand Fullscreen Preview"
                    >
                      <Maximize2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
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

                {/* Live In-App Preview Container */}
                <div className="rounded-2xl border border-card-border bg-[#F9F9FB] dark:bg-[#0A0A0C]/50 p-4 text-xs leading-relaxed font-semibold overflow-hidden text-foreground/80">
                  {contentLoading ? (
                    <div className="py-16 flex flex-col items-center justify-center space-y-2 text-foreground/40">
                      <Sparkles className="h-6 w-6 animate-spin text-hq-blue" />
                      <span className="text-xs font-bold">Loading Live In-App Document Preview...</span>
                    </div>
                  ) : selectedAsset.mimeType === 'application/pdf' || selectedAsset.filename.endsWith('.pdf') ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[11px] text-foreground/50 font-bold px-1 pb-1">
                        <span className="flex items-center gap-1.5 text-red-500">
                          <FileText className="h-3.5 w-3.5" />
                          Multi-Page Interactive PDF Reader
                        </span>
                        <span className="text-[10px] text-foreground/40">Native In-App Scroll & Zoom</span>
                      </div>
                      {previewBlobUrl ? (
                        <iframe
                          src={`${previewBlobUrl}#view=FitH&toolbar=1`}
                          className="w-full h-[520px] rounded-xl border border-card-border bg-white dark:bg-[#0A0A0C] shadow-inner"
                          title={selectedAsset.filename}
                        />
                      ) : (
                        <div className="h-64 flex flex-col items-center justify-center text-foreground/40 text-xs space-y-2">
                          <Sparkles className="h-5 w-5 animate-spin text-hq-blue" />
                          <span>Loading PDF reader...</span>
                        </div>
                      )}
                    </div>
                  ) : selectedAsset.mimeType.startsWith('video/') ? (
                    <div className="p-2 flex flex-col items-center justify-center space-y-2">
                      <video
                        src={previewBlobUrl || `/api/assets/${selectedAsset.id}/raw`}
                        controls
                        className="w-full max-h-[460px] rounded-xl bg-black border border-card-border shadow-lg"
                      />
                      <span className="text-[11px] text-foreground/50 font-semibold">
                        In-App Video Stream • {formatBytes(selectedAsset.fileSize)}
                      </span>
                    </div>
                  ) : selectedAsset.mimeType.startsWith('audio/') ? (
                    <div className="p-8 flex flex-col items-center justify-center space-y-4 bg-black/5 dark:bg-black/30 rounded-xl">
                      <Volume2 className="h-10 w-10 text-hq-blue animate-pulse" />
                      <audio
                        src={previewBlobUrl || `/api/assets/${selectedAsset.id}/raw`}
                        controls
                        className="w-full max-w-md"
                      />
                      <span className="text-xs text-foreground/50 font-semibold">{selectedAsset.filename}</span>
                    </div>
                  ) : selectedAsset.mimeType.startsWith('image/') ? (
                    <div className="flex flex-col items-center justify-center p-2 space-y-3">
                      <div className="max-h-[480px] w-full overflow-auto rounded-xl bg-black/5 dark:bg-black/40 border border-card-border flex items-center justify-center p-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={previewBlobUrl || `/api/assets/${selectedAsset.id}/raw`}
                          alt={selectedAsset.filename}
                          className="max-h-[440px] w-auto object-contain rounded-lg shadow-sm"
                        />
                      </div>
                      <div className="flex items-center justify-between w-full text-[11px] text-foreground/50 font-bold px-1">
                        <span>Verified Graphic Asset • {formatBytes(selectedAsset.fileSize)}</span>
                        <Button
                          onClick={handleDownload}
                          size="sm"
                          variant="ghost"
                          className="h-6 text-[11px] font-bold text-hq-blue hover:underline p-0"
                        >
                          Download High-Res
                        </Button>
                      </div>
                    </div>
                  ) : (selectedAsset.filename.endsWith('.csv') || selectedAsset.mimeType.includes('csv')) && viewTab === 'table' ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between pb-1 border-b border-card-border/40">
                        <span className="text-[11px] font-bold text-foreground/60 flex items-center gap-1.5">
                          <Table className="h-3.5 w-3.5 text-hq-blue" />
                          Interactive Data Table View
                        </span>
                        <Button
                          onClick={handleCopyContent}
                          variant="outline"
                          size="sm"
                          className="h-6 px-2.5 rounded-full text-[10px] font-bold border-card-border flex items-center gap-1"
                        >
                          {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                          <span>{copied ? 'Copied' : 'Copy CSV'}</span>
                        </Button>
                      </div>
                      <div className="max-h-[480px] overflow-auto rounded-xl border border-card-border bg-white dark:bg-black/30">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="bg-slate-100 dark:bg-white/5 border-b border-card-border">
                              {parseCsv(assetContent?.content || '').headers.map((h, i) => (
                                <th key={i} className="p-2.5 font-black text-foreground border-r border-card-border/50 text-[11px] whitespace-nowrap">
                                  {h}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {parseCsv(assetContent?.content || '').rows.map((row, rIdx) => (
                              <tr key={rIdx} className="border-b border-card-border/30 hover:bg-black/5 dark:hover:bg-white/5">
                                {row.map((cell, cIdx) => (
                                  <td key={cIdx} className="p-2.5 text-foreground/80 border-r border-card-border/20 font-medium text-[11px] whitespace-nowrap">
                                    {cell}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : assetContent?.isText ? (
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between border-b border-card-border/60 pb-2">
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-foreground/60">
                          <FileCode className="h-3.5 w-3.5 text-hq-blue" />
                          <span>Full Document Content ({assetContent.content.length} characters)</span>
                        </div>
                        <Button
                          onClick={handleCopyContent}
                          variant="outline"
                          size="sm"
                          className="h-6 px-2.5 rounded-full text-[10px] font-bold border-card-border flex items-center gap-1 hover:bg-black/5 dark:hover:bg-white/5"
                        >
                          {copied ? (
                            <>
                              <Check className="h-3 w-3 text-green-500" />
                              <span>Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3" />
                              <span>Copy Text</span>
                            </>
                          )}
                        </Button>
                      </div>

                      {viewTab === 'preview' && (selectedAsset.filename.endsWith('.md') || selectedAsset.filename.endsWith('.markdown') || selectedAsset.mimeType.includes('markdown')) ? (
                        <div className="max-h-[480px] overflow-y-auto rounded-xl bg-white dark:bg-black/30 border border-card-border/70 p-4">
                          <RenderMarkdownView content={assetContent.content} />
                        </div>
                      ) : (
                        <div className="max-h-[480px] overflow-y-auto rounded-xl bg-white dark:bg-black/40 border border-card-border/70 p-3.5 select-text">
                          <pre className="whitespace-pre-wrap font-mono text-[11px] leading-relaxed text-foreground/90 break-words font-medium">
                            {assetContent.content}
                          </pre>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3 py-3">
                      <div className="flex items-center gap-3">
                        {getMimeIcon(selectedAsset.mimeType)}
                        <div>
                          <p className="font-black text-foreground text-xs">{selectedAsset.filename}</p>
                          <p className="text-[11px] text-foreground/50">{selectedAsset.description || 'Enterprise ledger asset index'}</p>
                        </div>
                      </div>
                      <div className="border-t border-card-border/50 pt-2 flex items-center justify-between">
                        <span className="text-[10px] text-foreground/35 font-bold uppercase tracking-wider">
                          Storage Vault: {selectedAsset.gcsPath}
                        </span>
                        <Button
                          onClick={handleDownload}
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs font-bold rounded-full border-card-border"
                        >
                          <Download className="h-3 w-3 mr-1" />
                          Download
                        </Button>
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

      {/* Fullscreen Document Inspection Modal */}
      {isFullscreen && selectedAsset && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 md:p-8 animate-in fade-in">
          <div className="bg-white dark:bg-[#0E0E12] border border-card-border rounded-3xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="p-4 px-6 border-b border-card-border flex items-center justify-between bg-[#F9F9FB] dark:bg-[#0A0A0C]">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-hq-blue/10 border border-hq-blue/20 flex items-center justify-center">
                  {getMimeIcon(selectedAsset.mimeType)}
                </div>
                <div>
                  <h3 className="text-sm font-black text-foreground flex items-center gap-2">
                    {selectedAsset.filename}
                    <Badge variant="ai" className="text-[10px]">
                      {selectedAsset.classification}
                    </Badge>
                  </h3>
                  <p className="text-[11px] text-foreground/45 font-medium">
                    {formatBytes(selectedAsset.fileSize)} • Full In-App Reading Mode
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  onClick={handleDownload}
                  variant="outline"
                  size="sm"
                  className="text-xs font-bold h-8 rounded-full border-card-border"
                >
                  <Download className="h-3.5 w-3.5 mr-1.5" />
                  Download
                </Button>
                <Button
                  onClick={() => setIsFullscreen(false)}
                  size="sm"
                  className="bg-hq-blue hover:bg-hq-blue/90 text-white text-xs font-bold h-8 rounded-full px-3.5 flex items-center gap-1.5"
                >
                  <Minimize2 className="h-3.5 w-3.5" />
                  Exit Fullscreen
                </Button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 p-6 overflow-auto bg-slate-50 dark:bg-[#070709]">
              {selectedAsset.mimeType === 'application/pdf' || selectedAsset.filename.endsWith('.pdf') ? (
                previewBlobUrl ? (
                  <iframe
                    src={`${previewBlobUrl}#view=FitH&toolbar=1`}
                    className="w-full h-full rounded-2xl border border-card-border bg-white shadow-md"
                    title={selectedAsset.filename}
                  />
                ) : (
                  <div className="h-full flex items-center justify-center text-foreground/40 text-xs">
                    Loading PDF preview...
                  </div>
                )
              ) : selectedAsset.mimeType.startsWith('image/') ? (
                <div className="h-full flex items-center justify-center p-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={previewBlobUrl || `/api/assets/${selectedAsset.id}/raw`}
                    alt={selectedAsset.filename}
                    className="max-h-full max-w-full object-contain rounded-2xl shadow-xl border border-card-border"
                  />
                </div>
              ) : selectedAsset.mimeType.startsWith('video/') ? (
                <div className="h-full flex items-center justify-center p-4">
                  <video
                    src={previewBlobUrl || `/api/assets/${selectedAsset.id}/raw`}
                    controls
                    className="max-h-full max-w-full rounded-2xl shadow-xl border border-card-border bg-black"
                  />
                </div>
              ) : (selectedAsset.filename.endsWith('.csv') || selectedAsset.mimeType.includes('csv')) && viewTab === 'table' ? (
                <div className="rounded-2xl border border-card-border bg-white dark:bg-black/40 overflow-auto max-h-full">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100 dark:bg-white/5 border-b border-card-border sticky top-0">
                        {parseCsv(assetContent?.content || '').headers.map((h, i) => (
                          <th key={i} className="p-3 font-black text-foreground border-r border-card-border/50 text-xs whitespace-nowrap">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {parseCsv(assetContent?.content || '').rows.map((row, rIdx) => (
                        <tr key={rIdx} className="border-b border-card-border/30 hover:bg-black/5 dark:hover:bg-white/5">
                          {row.map((cell, cIdx) => (
                            <td key={cIdx} className="p-3 text-foreground/85 border-r border-card-border/20 font-medium text-xs whitespace-nowrap">
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : assetContent?.isText ? (
                <div className="rounded-2xl border border-card-border bg-white dark:bg-black/40 p-6 max-h-full overflow-y-auto select-text shadow-sm">
                  {selectedAsset.filename.endsWith('.md') || selectedAsset.filename.endsWith('.markdown') ? (
                    <RenderMarkdownView content={assetContent.content} />
                  ) : (
                    <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-foreground/90 break-words font-medium">
                      {assetContent.content}
                    </pre>
                  )}
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-foreground/40 text-xs">
                  In-App preview not supported for this raw binary format.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
