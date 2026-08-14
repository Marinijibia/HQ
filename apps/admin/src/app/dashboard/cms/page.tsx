'use client';

import * as React from 'react';
import { Card, Button } from '@hq/ui';
import {
  Users,
  Building,
  Upload,
  ShoppingBag,
  Search,
  Plus,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  BookOpen,
  Zap,
  AlertTriangle,
  Database,
  Loader2,
} from 'lucide-react';
import { toast } from '../../../components/toast';
import { useAuth } from '../../../contexts/auth-context';

interface TrainingDataItem {
  id: string;
  filename: string;
  content: string;
  createdAt: string;
}

interface ExecutiveItem {
  id: string;
  name: string;
  roleKey: string;
  title: string;
  biography?: string;
  systemPrompt?: string;
  avatarUrl?: string;
  isDefaultRoster: boolean;
  isActiveInWorkspace: boolean;
  department?: { id: string; name: string };
  trainingData?: TrainingDataItem[];
}

interface DepartmentItem {
  id: string;
  name: string;
  description?: string;
  isDefaultRoster: boolean;
  executives?: ExecutiveItem[];
  trainingData?: TrainingDataItem[];
}

interface MarketplaceItem {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  category: string;
  tags: string[];
  listingType: 'EXECUTIVE' | 'DEPARTMENT';
  downloadsCount: number;
  rating: number;
}

export default function AdminCmsPage() {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = React.useState<'executives' | 'departments' | 'research' | 'marketplace'>('executives');
  const [loading, setLoading] = React.useState(false);
  const [fetchError, setFetchError] = React.useState<string | null>(null);

  const [executives, setExecutives] = React.useState<ExecutiveItem[]>([]);
  const [departments, setDepartments] = React.useState<DepartmentItem[]>([]);
  const [marketplaceListings, setMarketplaceListings] = React.useState<MarketplaceItem[]>([]);

  // Edit State — no defaults, driven entirely from DB
  const [selectedExec, setSelectedExec] = React.useState<ExecutiveItem | null>(null);
  const [editPrompt, setEditPrompt] = React.useState('');
  const [editName, setEditName] = React.useState('');
  const [editTitle, setEditTitle] = React.useState('');

  // Training Data State
  const [trainFileName, setTrainFileName] = React.useState('');
  const [trainContent, setTrainContent] = React.useState('');

  // Research State
  const [researchCompany, setResearchCompany] = React.useState('');
  const [researchStatus, setResearchStatus] = React.useState('');

  // New Department State
  const [newDeptName, setNewDeptName] = React.useState('');
  const [newDeptDesc, setNewDeptDesc] = React.useState('');
  const [deptLoading, setDeptLoading] = React.useState(false);

  // New Marketplace Listing State
  const [mktTitle, setMktTitle] = React.useState('');
  const [mktDesc, setMktDesc] = React.useState('');
  const [mktPrice, setMktPrice] = React.useState(0);
  const [mktCategory, setMktCategory] = React.useState('Engineering');

  const getHeaders = React.useCallback((json = false): Record<string, string> => {
    const activeToken = token || (typeof window !== 'undefined' ? localStorage.getItem('hq_admin_token') : null);
    const headers: Record<string, string> = {};
    if (json) headers['Content-Type'] = 'application/json';
    if (activeToken) headers['Authorization'] = `Bearer ${activeToken}`;
    return headers;
  }, [token]);

  const fetchCmsData = React.useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const headers = getHeaders();

      const [execRes, deptRes, mktRes] = await Promise.all([
        fetch('/api/cms/executives', { headers }),
        fetch('/api/cms/departments', { headers }),
        fetch('/api/marketplace/listings', { headers }),
      ]);

      // Executives — must succeed; surface error clearly
      if (!execRes.ok) {
        const errText = await execRes.text().catch(() => `HTTP ${execRes.status}`);
        throw new Error(`Failed to load executives: ${errText}`);
      }
      const execData: ExecutiveItem[] = await execRes.json();
      setExecutives(execData);

      // Auto-select first exec from DB if none selected yet
      if (execData.length > 0) {
        setSelectedExec((prev) => {
          const current = prev ? execData.find((e) => e.id === prev.id) || execData[0] : execData[0];
          setEditName(current.name);
          setEditTitle(current.title);
          setEditPrompt(current.systemPrompt || '');
          return current;
        });
      }

      // Departments
      if (deptRes.ok) {
        const deptData: DepartmentItem[] = await deptRes.json();
        setDepartments(deptData);
      } else {
        setDepartments([]);
      }

      // Marketplace
      if (mktRes.ok) {
        const mktData: MarketplaceItem[] = await mktRes.json();
        setMarketplaceListings(mktData);
      } else {
        setMarketplaceListings([]);
      }
    } catch (e: any) {
      const msg = e?.message || 'Failed to connect to HQ backend. Check API server status.';
      setFetchError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [getHeaders]);

  React.useEffect(() => {
    fetchCmsData();
  }, [fetchCmsData]);

  const handleSelectExec = (exec: ExecutiveItem) => {
    setSelectedExec(exec);
    setEditName(exec.name);
    setEditTitle(exec.title);
    setEditPrompt(exec.systemPrompt || '');
  };

  const handleSaveExec = async () => {
    if (!selectedExec) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/cms/executives/${selectedExec.id}`, {
        method: 'PATCH',
        headers: getHeaders(true),
        body: JSON.stringify({ name: editName, title: editTitle, systemPrompt: editPrompt }),
      });

      if (!res.ok) {
        const err = await res.text().catch(() => `HTTP ${res.status}`);
        throw new Error(err);
      }

      const updated: ExecutiveItem = await res.json();
      setExecutives((prev) => prev.map((e) => (e.id === updated.id ? { ...e, ...updated } : e)));
      setSelectedExec((prev) => (prev ? { ...prev, ...updated } : prev));
      toast.success(`Saved system prompt & persona for ${updated.name}`);
    } catch (e: any) {
      toast.error(`Failed to save: ${e?.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleTrainExec = async () => {
    if (!selectedExec || !trainFileName || !trainContent) {
      toast.error('Please provide both document title and knowledge content');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/cms/executives/${selectedExec.id}/train`, {
        method: 'POST',
        headers: getHeaders(true),
        body: JSON.stringify({ filename: trainFileName, content: trainContent }),
      });

      if (!res.ok) {
        const err = await res.text().catch(() => `HTTP ${res.status}`);
        throw new Error(err);
      }

      const result = await res.json();
      toast.success(result.message || `Vector embedding created for ${selectedExec.name}`);
      setTrainFileName('');
      setTrainContent('');

      // Refresh exec list so training count updates immediately
      await fetchCmsData();
    } catch (e: any) {
      toast.error(`Training failed: ${e?.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDepartment = async () => {
    if (!newDeptName.trim()) return;
    setDeptLoading(true);
    try {
      const res = await fetch('/api/cms/departments', {
        method: 'POST',
        headers: getHeaders(true),
        body: JSON.stringify({ name: newDeptName.trim(), description: newDeptDesc.trim() || undefined }),
      });

      if (!res.ok) {
        const err = await res.text().catch(() => `HTTP ${res.status}`);
        throw new Error(err);
      }

      toast.success(`Department "${newDeptName}" created`);
      setNewDeptName('');
      setNewDeptDesc('');
      await fetchCmsData();
    } catch (e: any) {
      toast.error(`Failed to create department: ${e?.message || 'Unknown error'}`);
    } finally {
      setDeptLoading(false);
    }
  };

  const handleTriggerResearch = async () => {
    if (!researchCompany.trim()) {
      toast.error('Enter a company name to research');
      return;
    }
    setResearchStatus(`Mr. Intelligence is scanning public web data for "${researchCompany}"...`);
    try {
      const res = await fetch('/api/intelligence/research', {
        method: 'POST',
        headers: getHeaders(true),
        body: JSON.stringify({ companyName: researchCompany }),
      });

      if (!res.ok) {
        const err = await res.text().catch(() => `HTTP ${res.status}`);
        throw new Error(err);
      }

      const result = await res.json();
      const msg = result?.message || `Research complete for "${researchCompany}". Seeded into Asad's memory bank.`;
      setResearchStatus(msg);
      toast.success(msg);
    } catch (e: any) {
      const msg = `Research failed: ${e?.message || 'Unknown error'}`;
      setResearchStatus(msg);
      toast.error(msg);
    }
  };

  const handlePublishMarketplace = async () => {
    if (!mktTitle || !mktDesc) return;
    setLoading(true);
    try {
      const res = await fetch('/api/marketplace/publish', {
        method: 'POST',
        headers: getHeaders(true),
        body: JSON.stringify({
          title: mktTitle,
          description: mktDesc,
          price: Number(mktPrice),
          currency: 'USD',
          category: mktCategory,
          tags: ['custom', 'published'],
          listingType: 'EXECUTIVE',
        }),
      });

      if (!res.ok) {
        const err = await res.text().catch(() => `HTTP ${res.status}`);
        throw new Error(err);
      }

      const newListing: MarketplaceItem = await res.json();
      setMarketplaceListings((prev) => [newListing, ...prev]);
      toast.success(`Published "${mktTitle}" to Marketplace`);
      setMktTitle('');
      setMktDesc('');
      setMktPrice(0);
    } catch (e: any) {
      toast.error(`Failed to publish: ${e?.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  // ── UI ──────────────────────────────────────────────────────────────────────

  if (fetchError && executives.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center">
          <AlertTriangle className="w-8 h-8 text-red-400" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Backend Unreachable</h2>
          <p className="text-sm text-slate-400 max-w-md">{fetchError}</p>
        </div>
        <button
          onClick={fetchCmsData}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-sm font-bold hover:bg-cyan-500/20 transition-all"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 text-left max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-cyan-500/20 bg-gradient-to-r from-slate-50 via-white to-cyan-50/40 dark:from-slate-950 dark:via-[#0B0F19] dark:to-cyan-950/40 p-8 shadow-2xl backdrop-blur-xl">
        <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
          <Sparkles className="w-48 h-48 text-cyan-400" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-700 dark:text-cyan-300 text-xs font-black uppercase tracking-widest mb-3">
              <Zap className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />
              <span>Admin CMS Training &amp; Marketplace Controller</span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">AI Executive &amp; Department CMS</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 max-w-2xl">
              Configure, retrain, and edit all AI Executives and Departments. All data is live from the HQ PostgreSQL database. Package and publish trained executives to the Marketplace.
            </p>
          </div>
          <button
            onClick={fetchCmsData}
            disabled={loading}
            className="bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-700 dark:text-cyan-300 font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 shrink-0 disabled:opacity-50 transition-all"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh Roster
          </button>
        </div>
      </div>

      {/* Tabs Selector */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-white/10 pb-4">
        {[
          { id: 'executives', label: 'AI Executives Manager', icon: Users },
          { id: 'departments', label: 'Department Manager', icon: Building },
          { id: 'research', label: 'Company Public Search (Mr. Intelligence)', icon: Search },
          { id: 'marketplace', label: 'Marketplace Publisher', icon: ShoppingBag },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-700 dark:text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                  : 'bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-white/10'
              }`}
            >
              <Icon size={16} className={isActive ? 'text-cyan-400' : ''} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: EXECUTIVES MANAGER */}
      {activeTab === 'executives' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Executive List */}
          <div className="lg:col-span-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-1">
              Active AI Executives ({loading ? '…' : executives.length})
            </h3>

            {loading && executives.length === 0 && (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
              </div>
            )}

            <div className="space-y-3 max-h-[680px] overflow-y-auto pr-2">
              {executives.map((exec) => {
                const vectorCount = exec.trainingData?.length ?? 0;
                return (
                  <div
                    key={exec.id}
                    onClick={() => handleSelectExec(exec)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      selectedExec?.id === exec.id
                        ? 'bg-cyan-500/10 border-cyan-500/40 shadow-[0_0_20px_rgba(6,182,212,0.15)]'
                        : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/15'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center font-bold text-sm">
                          {exec.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 flex-wrap">
                            {exec.name}
                            {exec.isDefaultRoster && (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                                DEFAULT
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">{exec.title}</div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        {exec.isActiveInWorkspace ? (
                          <span className="text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-1">
                            <CheckCircle2 size={12} /> Active
                          </span>
                        ) : (
                          <span className="text-slate-500 text-xs font-bold">In Marketplace</span>
                        )}
                        {/* pgvector training count */}
                        <span
                          className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            vectorCount > 0
                              ? 'bg-purple-500/10 border-purple-500/30 text-purple-600 dark:text-purple-300'
                              : 'bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500'
                          }`}
                        >
                          <Database size={9} />
                          {vectorCount} vector{vectorCount !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}

              {!loading && executives.length === 0 && (
                <div className="py-12 text-center border border-dashed border-slate-300 dark:border-white/10 rounded-2xl text-slate-500 text-sm">
                  No executives found in database.
                </div>
              )}
            </div>
          </div>

          {/* Editor & Retraining Panel */}
          <div className="lg:col-span-7 space-y-6">
            {selectedExec ? (
              <Card className="p-6 border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl space-y-6 text-slate-900 dark:text-white">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4">
                  <div>
                    <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                      <Sparkles size={18} className="text-cyan-400" /> Retrain &amp; Edit: {selectedExec.name}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{selectedExec.title}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {selectedExec.isDefaultRoster && (
                      <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-700 dark:text-cyan-300 text-xs font-bold">
                        Default Executive
                      </span>
                    )}
                    <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-600 dark:text-purple-300 text-xs font-bold">
                      <Database size={11} />
                      {selectedExec.trainingData?.length ?? 0} pgvector document{(selectedExec.trainingData?.length ?? 0) !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-300 block mb-1">Executive Name</label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500/50"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-300 block mb-1">Title &amp; Persona Role</label>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500/50"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-300 block mb-1">
                      System Prompt &amp; Behavioral Rules
                    </label>
                    <textarea
                      rows={5}
                      value={editPrompt}
                      onChange={(e) => setEditPrompt(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl p-4 text-xs font-mono text-cyan-800 dark:text-cyan-200 focus:outline-none focus:border-cyan-500/50 leading-relaxed"
                    />
                  </div>

                  <Button
                    onClick={handleSaveExec}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-900 dark:text-white font-bold text-xs py-3 rounded-xl shadow-lg disabled:opacity-50"
                  >
                    {loading ? <Loader2 size={14} className="animate-spin mx-auto" /> : 'Save System Prompt & Persona'}
                  </Button>
                </div>

                {/* Vector Document Ingestion Section */}
                <div className="border-t border-slate-200 dark:border-white/10 pt-6 space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <BookOpen size={16} className="text-purple-400" /> Upload Training Data (pgvector Ingestion)
                  </h3>

                  {/* Existing training documents list */}
                  {(selectedExec.trainingData?.length ?? 0) > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Indexed Documents</p>
                      <div className="space-y-1.5 max-h-40 overflow-y-auto">
                        {selectedExec.trainingData!.map((td) => (
                          <div
                            key={td.id}
                            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-purple-500/5 border border-purple-500/20"
                          >
                            <Database size={12} className="text-purple-400 shrink-0" />
                            <span className="text-xs text-purple-800 dark:text-purple-200 font-mono truncate">{td.filename}</span>
                            <span className="ml-auto text-[10px] text-slate-500 shrink-0">
                              {new Date(td.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-300 block mb-1">Document Title / Filename</label>
                    <input
                      type="text"
                      placeholder="e.g. Executive_Guidelines_2026.pdf"
                      value={trainFileName}
                      onChange={(e) => setTrainFileName(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2 text-sm text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-300 block mb-1">
                      Training Content &amp; Specific Knowledge Text
                    </label>
                    <textarea
                      rows={4}
                      placeholder="Paste specific organizational policies, technical standards, or role rules here..."
                      value={trainContent}
                      onChange={(e) => setTrainContent(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-xs text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>

                  <Button
                    onClick={handleTrainExec}
                    disabled={loading || !trainFileName || !trainContent}
                    className="w-full bg-purple-600 hover:bg-purple-500 text-slate-900 dark:text-white font-bold text-xs py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? <Loader2 size={14} className="animate-spin" /> : <><Upload size={14} /> Ingest into Vector Memory</>}
                  </Button>
                </div>
              </Card>
            ) : (
              <div className="h-full flex items-center justify-center p-12 border border-dashed border-slate-300 dark:border-white/10 rounded-3xl text-slate-500 text-sm">
                {loading ? <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" /> : 'Select an Executive from the list on the left to edit prompt and train.'}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: DEPARTMENTS MANAGER */}
      {activeTab === 'departments' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Configured Departments ({loading ? '…' : departments.length})
            </h3>
            <div className="flex gap-2 flex-wrap">
              <input
                type="text"
                placeholder="Department Name..."
                value={newDeptName}
                onChange={(e) => setNewDeptName(e.target.value)}
                className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white w-44"
              />
              <input
                type="text"
                placeholder="Description (optional)"
                value={newDeptDesc}
                onChange={(e) => setNewDeptDesc(e.target.value)}
                className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white w-52"
              />
              <Button
                onClick={handleCreateDepartment}
                disabled={deptLoading || !newDeptName.trim()}
                className="bg-cyan-600 hover:bg-cyan-500 text-slate-900 dark:text-white text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1 disabled:opacity-50"
              >
                {deptLoading ? <Loader2 size={14} className="animate-spin" /> : <><Plus size={14} /> Create Dept</>}
              </Button>
            </div>
          </div>

          {loading && departments.length === 0 && (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
            </div>
          )}

          {!loading && departments.length === 0 && (
            <div className="py-16 text-center border border-dashed border-slate-300 dark:border-white/10 rounded-2xl text-slate-500 text-sm">
              No departments found in database. Create your first department above.
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {departments.map((dept) => {
              const execCount = dept.executives?.length ?? 0;
              const vectorCount = dept.trainingData?.length ?? 0;
              return (
                <Card key={dept.id} className="p-5 border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/60 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-slate-900 dark:text-white text-sm">{dept.name}</div>
                    {dept.isDefaultRoster && (
                      <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-700 dark:text-cyan-300 text-[10px] font-bold">
                        DEFAULT
                      </span>
                    )}
                  </div>
                  {dept.description && <p className="text-xs text-slate-500 dark:text-slate-400">{dept.description}</p>}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 text-[10px] font-bold">
                      <Users size={9} /> {execCount} exec{execCount !== 1 ? 's' : ''}
                    </span>
                    <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      vectorCount > 0
                        ? 'bg-purple-500/10 border-purple-500/30 text-purple-600 dark:text-purple-300'
                        : 'bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500'
                    }`}>
                      <Database size={9} /> {vectorCount} vector{vectorCount !== 1 ? 's' : ''}
                    </span>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: PUBLIC RESEARCH LOGS */}
      {activeTab === 'research' && (
          <Card className="p-6 border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/80 rounded-3xl space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Search size={18} className="text-cyan-400" /> Mr. Intelligence Public Web Research Agent
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Mr. Intelligence crawls public web data for a given company name and synthesizes background information directly into CEO Asad's memory bank via pgvector.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="text"
              value={researchCompany}
              onChange={(e) => setResearchCompany(e.target.value)}
              className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white flex-1"
              placeholder="Enter company name e.g. FuelOS"
            />
            <Button
              onClick={handleTriggerResearch}
              disabled={!researchCompany.trim()}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-900 dark:text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-md disabled:opacity-50"
            >
              Trigger Public Research
            </Button>
          </div>

          {researchStatus && (
            <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-800 dark:text-cyan-200 text-xs font-mono leading-relaxed">
              {researchStatus}
            </div>
          )}
        </Card>
      )}

      {/* TAB 4: MARKETPLACE PUBLISHER */}
      {activeTab === 'marketplace' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Publish New Form */}
          <div className="lg:col-span-5">
            <Card className="p-6 border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/80 rounded-3xl space-y-4">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ShoppingBag size={18} className="text-cyan-400" /> Publish Executive/Dept Listing
              </h2>

              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-300 block mb-1">Listing Title</label>
                <input
                  type="text"
                  placeholder="e.g. Software Engineering Director Suite"
                  value={mktTitle}
                  onChange={(e) => setMktTitle(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Describe capabilities, skills, and model permissions..."
                  value={mktDesc}
                  onChange={(e) => setMktDesc(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Price (USD)</label>
                  <input
                    type="number"
                    value={mktPrice}
                    onChange={(e) => setMktPrice(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                  />
                  <span className="text-[10px] text-slate-500">Set 0 for Free</span>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Category</label>
                  <select
                    value={mktCategory}
                    onChange={(e) => setMktCategory(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Finance">Finance</option>
                    <option value="Legal">Legal</option>
                    <option value="Operations">Operations</option>
                  </select>
                </div>
              </div>

              <Button
                onClick={handlePublishMarketplace}
                disabled={loading || !mktTitle || !mktDesc}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-900 dark:text-white font-bold text-xs py-3 rounded-xl disabled:opacity-50"
              >
                {loading ? <Loader2 size={14} className="animate-spin mx-auto" /> : 'Publish to Marketplace Catalog'}
              </Button>
            </Card>
          </div>

          {/* Current Catalog Listings */}
          <div className="lg:col-span-7 space-y-4">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
              Marketplace Store Catalog ({loading ? '…' : marketplaceListings.length})
            </h3>

            {loading && marketplaceListings.length === 0 && (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
              </div>
            )}

            {!loading && marketplaceListings.length === 0 && (
              <div className="py-12 text-center border border-dashed border-slate-300 dark:border-white/10 rounded-2xl text-slate-500 text-sm">
                No marketplace listings yet. Publish your first executive above.
              </div>
            )}

            <div className="space-y-3">
              {marketplaceListings.map((item) => (
              <div key={item.id} className="p-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/60 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 flex-wrap">
                      {item.title}
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        item.price === 0
                          ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                          : 'bg-purple-500/10 border border-purple-500/30 text-purple-400'
                      }`}>
                        {item.price === 0 ? 'FREE ($0)' : `$${item.price}`}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 max-w-md">{item.description}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs text-slate-400 font-mono">{item.downloadsCount} installs</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

