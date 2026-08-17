'use client';

import * as React from 'react';
import { Card, Button } from '@hq/ui';
import {
  Users,
  Building,
  Upload,
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
  Trash2,
  FileText,
  Clock,
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

export default function AdminCmsPage() {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = React.useState<'executives' | 'departments' | 'research'>('executives');
  const [loading, setLoading] = React.useState(false);
  const [fetchError, setFetchError] = React.useState<string | null>(null);

  const [executives, setExecutives] = React.useState<ExecutiveItem[]>([]);
  const [departments, setDepartments] = React.useState<DepartmentItem[]>([]);

  // Edit State
  const [selectedExec, setSelectedExec] = React.useState<ExecutiveItem | null>(null);
  const [editPrompt, setEditPrompt] = React.useState('');
  const [editName, setEditName] = React.useState('');
  const [editTitle, setEditTitle] = React.useState('');

  // Training Data State
  const [trainFileName, setTrainFileName] = React.useState('');
  const [trainContent, setTrainContent] = React.useState('');
  const [deletingDocId, setDeletingDocId] = React.useState<string | null>(null);

  // Research State
  const [researchCompany, setResearchCompany] = React.useState('');
  const [researchStatus, setResearchStatus] = React.useState('');
  const [researching, setResearching] = React.useState(false);

  // New Department State
  const [newDeptName, setNewDeptName] = React.useState('');
  const [newDeptDesc, setNewDeptDesc] = React.useState('');
  const [deptLoading, setDeptLoading] = React.useState(false);

  const getHeaders = React.useCallback(
    (json = false): Record<string, string> => {
      const activeToken =
        token ||
        (typeof window !== 'undefined'
          ? localStorage.getItem('hq_admin_token') || localStorage.getItem('hq_auth_token')
          : null);
      const headers: Record<string, string> = {};
      if (json) headers['Content-Type'] = 'application/json';
      if (activeToken) headers['Authorization'] = `Bearer ${activeToken}`;
      return headers;
    },
    [token],
  );

  const fetchCmsData = React.useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const headers = getHeaders();

      const [execRes, deptRes] = await Promise.all([
        fetch('/api/cms/executives', { headers }),
        fetch('/api/cms/departments', { headers }),
      ]);

      if (!execRes.ok) {
        const errText = await execRes.text().catch(() => `HTTP ${execRes.status}`);
        throw new Error(`Failed to load executives: ${errText}`);
      }
      const execData: ExecutiveItem[] = await execRes.json();
      setExecutives(execData);

      // Auto-select first exec if none currently selected
      if (execData.length > 0) {
        setSelectedExec((prev) => {
          const current = prev
            ? execData.find((e) => e.id === prev.id) || execData[0]
            : execData[0];
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
    if (!selectedExec || !trainFileName.trim() || !trainContent.trim()) {
      toast.error('Please provide both document title and knowledge content');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/cms/executives/${selectedExec.id}/train`, {
        method: 'POST',
        headers: getHeaders(true),
        body: JSON.stringify({ filename: trainFileName.trim(), content: trainContent.trim() }),
      });

      if (!res.ok) {
        const err = await res.text().catch(() => `HTTP ${res.status}`);
        throw new Error(err);
      }

      const result = await res.json();
      toast.success(result.message || `Training data indexed for ${selectedExec.name}`);
      setTrainFileName('');
      setTrainContent('');

      // Refresh exec list so training documents update immediately
      await fetchCmsData();
    } catch (e: any) {
      toast.error(`Training failed: ${e?.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDoc = async (trainingId: string) => {
    setDeletingDocId(trainingId);
    try {
      const res = await fetch(`/api/cms/executives/training/${trainingId}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      if (res.ok) {
        toast.success('Removed training document');
        await fetchCmsData();
      } else {
        const err = await res.text().catch(() => `HTTP ${res.status}`);
        toast.error(`Could not delete document: ${err}`);
      }
    } catch (e: any) {
      toast.error(`Failed to delete document: ${e?.message || 'Unknown error'}`);
    } finally {
      setDeletingDocId(null);
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
    setResearching(true);
    setResearchStatus(`Mr. Intelligence is scanning public web data for "${researchCompany}"...`);
    try {
      const res = await fetch('/api/intelligence/research', {
        method: 'POST',
        headers: getHeaders(true),
        body: JSON.stringify({ companyName: researchCompany.trim() }),
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
    } finally {
      setResearching(false);
    }
  };

  // ── UI Error View ──────────────────────────────────────────────────────────
  if (fetchError && executives.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center">
          <AlertTriangle className="w-8 h-8 text-rose-500" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
            Backend Connection Notice
          </h2>
          <p className="text-sm text-slate-400 max-w-md">{fetchError}</p>
        </div>
        <button
          onClick={fetchCmsData}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-600 dark:text-cyan-300 text-sm font-bold hover:bg-cyan-500/20 transition-all cursor-pointer"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 text-left max-w-7xl mx-auto pb-12 select-none">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 dark:border-cyan-500/20 bg-gradient-to-r from-white via-slate-50 to-blue-50/40 dark:from-[#0B0F19] dark:via-[#0E1526] dark:to-indigo-950/30 p-8 shadow-xl backdrop-blur-2xl text-slate-900 dark:text-white">
        <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
          <Sparkles className="w-48 h-48 text-cyan-500" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-600 dark:text-cyan-300 text-xs font-black uppercase tracking-widest mb-3">
              <Zap className="h-3.5 w-3.5 text-cyan-500" />
              <span>Admin AI Executive Training &amp; CMS Controller</span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              AI Executive &amp; Department CMS
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 max-w-2xl">
              Configure, retrain, and edit all 5 Core AI Executives and Departments. Ingest knowledge documents into pgvector embeddings, tune system prompts, and orchestrate autonomous public web research.
            </p>
          </div>
          <button
            onClick={fetchCmsData}
            disabled={loading}
            className="bg-white/80 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 shrink-0 disabled:opacity-50 transition-all cursor-pointer shadow-xs"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh Roster
          </button>
        </div>
      </div>

      {/* Tabs Selector */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200/80 dark:border-white/[0.08] pb-4">
        {[
          { id: 'executives', label: '5 Core AI Executives', icon: Users },
          { id: 'departments', label: 'Department Manager', icon: Building },
          { id: 'research', label: 'Public Web Research (Mr. Intelligence)', icon: Search },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? 'bg-cyan-500/15 border border-cyan-500/40 text-cyan-600 dark:text-cyan-300 font-black shadow-xs'
                  : 'bg-white/60 dark:bg-white/5 border border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10'
              }`}
            >
              <Icon size={15} className={isActive ? 'text-cyan-500' : ''} />
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
            <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-1">
              5 Core AI Executives ({loading ? '…' : executives.length})
            </h3>

            {loading && executives.length === 0 && (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
              </div>
            )}

            <div className="space-y-3 max-h-[680px] overflow-y-auto pr-2">
              {executives.map((exec) => {
                const vectorCount = exec.trainingData?.length ?? 0;
                const isSelected = selectedExec?.id === exec.id;

                return (
                  <div
                    key={exec.id}
                    onClick={() => handleSelectExec(exec)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-cyan-500/10 border-cyan-500/40 shadow-[0_0_20px_rgba(6,182,212,0.12)]'
                        : 'bg-white/70 dark:bg-white/[0.03] border-slate-200/80 dark:border-white/[0.08] hover:border-cyan-500/30'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-600/20 border border-cyan-500/30 text-cyan-600 dark:text-cyan-300 flex items-center justify-center font-bold text-sm">
                          {exec.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 flex-wrap">
                            {exec.name}
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                              5 CORE
                            </span>
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                            {exec.title}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span className="text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-1">
                          <CheckCircle2 size={12} /> Active
                        </span>
                        <span
                          className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            vectorCount > 0
                              ? 'bg-purple-500/10 border-purple-500/30 text-purple-600 dark:text-purple-300'
                              : 'bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-400'
                          }`}
                        >
                          <Database size={9} />
                          {vectorCount} doc{vectorCount !== 1 ? 's' : ''}
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
              <Card className="p-6 border border-slate-200/80 dark:border-white/[0.08] bg-white/80 dark:bg-white/[0.03] backdrop-blur-xl rounded-3xl space-y-6 text-slate-900 dark:text-white shadow-lg">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4">
                  <div>
                    <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                      <Sparkles size={18} className="text-cyan-500" /> Retrain &amp; Edit: {selectedExec.name}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{selectedExec.title}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-600 dark:text-cyan-300 text-xs font-bold">
                      5 Core Standard
                    </span>
                    <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-600 dark:text-purple-300 text-xs font-bold">
                      <Database size={11} />
                      {selectedExec.trainingData?.length ?? 0} pgvector document{(selectedExec.trainingData?.length ?? 0) !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                      Executive Name
                    </label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500/50 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                      Title &amp; Persona Role
                    </label>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500/50 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
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
                    className="w-full bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-black text-xs py-3 rounded-xl shadow-md disabled:opacity-50 cursor-pointer"
                  >
                    {loading ? <Loader2 size={14} className="animate-spin mx-auto" /> : 'Save System Prompt & Persona'}
                  </Button>
                </div>

                {/* Vector Document Ingestion Section */}
                <div className="border-t border-slate-200 dark:border-white/10 pt-6 space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <BookOpen size={16} className="text-purple-500" /> Upload Knowledge Document (pgvector Ingestion)
                  </h3>

                  {/* Existing training documents list */}
                  {(selectedExec.trainingData?.length ?? 0) > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                        Indexed Documents ({selectedExec.trainingData!.length})
                      </p>
                      <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                        {selectedExec.trainingData!.map((td) => (
                          <div
                            key={td.id}
                            className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <FileText size={14} className="text-purple-500 shrink-0" />
                              <div className="min-w-0">
                                <span className="text-xs text-slate-900 dark:text-white font-mono font-bold truncate block">
                                  {td.filename}
                                </span>
                                <span className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                                  <Clock size={10} /> {new Date(td.createdAt).toLocaleString()}
                                </span>
                              </div>
                            </div>
                            <button
                              onClick={() => handleDeleteDoc(td.id)}
                              disabled={deletingDocId === td.id}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors shrink-0 ml-2 cursor-pointer"
                              title="Delete training document"
                            >
                              {deletingDocId === td.id ? (
                                <Loader2 size={12} className="animate-spin" />
                              ) : (
                                <Trash2 size={13} />
                              )}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                      Document Title / Filename
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Executive_Guidelines_2026.pdf"
                      value={trainFileName}
                      onChange={(e) => setTrainFileName(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500/50"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                      Training Content &amp; Specific Knowledge Text
                    </label>
                    <textarea
                      rows={4}
                      placeholder="Paste specific organizational policies, technical standards, product roadmaps, or role rules here..."
                      value={trainContent}
                      onChange={(e) => setTrainContent(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500/50"
                    />
                  </div>

                  <Button
                    onClick={handleTrainExec}
                    disabled={loading || !trainFileName.trim() || !trainContent.trim()}
                    className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 shadow-md cursor-pointer"
                  >
                    {loading ? <Loader2 size={14} className="animate-spin" /> : <><Upload size={14} /> Ingest into Vector Memory</>}
                  </Button>
                </div>
              </Card>
            ) : (
              <div className="h-full flex items-center justify-center p-12 border border-dashed border-slate-300 dark:border-white/10 rounded-3xl text-slate-500 text-sm">
                {loading ? <Loader2 className="w-6 h-6 text-cyan-500 animate-spin" /> : 'Select an Executive from the list on the left to edit prompt and train.'}
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
                className="bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl flex items-center gap-1 disabled:opacity-50 shadow-sm cursor-pointer"
              >
                {deptLoading ? <Loader2 size={14} className="animate-spin" /> : <><Plus size={14} /> Create Dept</>}
              </Button>
            </div>
          </div>

          {loading && departments.length === 0 && (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
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
                <Card key={dept.id} className="p-5 border border-slate-200/80 dark:border-white/[0.08] bg-white/70 dark:bg-white/[0.03] rounded-2xl space-y-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-slate-900 dark:text-white text-sm">{dept.name}</div>
                    {dept.isDefaultRoster && (
                      <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-600 dark:text-cyan-300 text-[10px] font-bold">
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
                        : 'bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-400'
                    }`}>
                      <Database size={9} /> {vectorCount} doc{vectorCount !== 1 ? 's' : ''}
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
        <Card className="p-6 sm:p-8 border border-slate-200/80 dark:border-white/[0.08] bg-white/70 dark:bg-white/[0.03] rounded-3xl space-y-6 shadow-lg">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Search size={18} className="text-cyan-500" /> Mr. Intelligence Public Web Research Agent
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
              className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white flex-1 focus:outline-none focus:border-cyan-500/50 font-semibold"
              placeholder="Enter company name e.g. FuelOS"
            />
            <Button
              onClick={handleTriggerResearch}
              disabled={researching || !researchCompany.trim()}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-md disabled:opacity-50 cursor-pointer"
            >
              {researching ? <Loader2 size={14} className="animate-spin" /> : 'Trigger Public Research'}
            </Button>
          </div>

          {researchStatus && (
            <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-800 dark:text-cyan-200 text-xs font-mono leading-relaxed">
              {researchStatus}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
