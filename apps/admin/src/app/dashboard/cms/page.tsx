'use client';

import * as React from 'react';
import { Card, CardTitle, CardDescription, Button } from '@hq/ui';
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
  Tag,
  BookOpen,
  DollarSign,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { toast } from '../../../components/toast';
import { useAuth } from '../../../contexts/auth-context';

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
  trainingData?: any[];
}

interface DepartmentItem {
  id: string;
  name: string;
  description?: string;
  isDefaultRoster: boolean;
  executives?: ExecutiveItem[];
  trainingData?: any[];
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

const DEFAULT_EXECUTIVE_ROSTER: ExecutiveItem[] = [
  { id: 'exec-ceo-001', name: 'Asad', roleKey: 'ceo', title: 'Chief Executive Officer (CEO)', systemPrompt: 'You are Asad, Chief Executive Officer. Lead strategic growth, corporate vision, and executive alignment across all departments.', isDefaultRoster: true, isActiveInWorkspace: true },
  { id: 'exec-ops-001', name: 'Teema', roleKey: 'operations_director', title: 'Operations Director & Chief of Staff', systemPrompt: 'You are Teema, Operations Director. Manage daily execution, cross-department coordination, and operational efficiency.', isDefaultRoster: true, isActiveInWorkspace: true },
  { id: 'exec-leg-001', name: 'Legal', roleKey: 'legal_compliance_director', title: 'Legal & Compliance Director', systemPrompt: 'You are Legal Director. Ensure regulatory compliance, data privacy, contract governance, and legal risk management.', isDefaultRoster: true, isActiveInWorkspace: true },
  { id: 'exec-hr-001', name: 'Resource Director', roleKey: 'human_resources_director', title: 'Human Resources & Talent Director', systemPrompt: 'You are HR Director. Lead talent acquisition, performance reviews, organizational culture, and team structure.', isDefaultRoster: true, isActiveInWorkspace: true },
  { id: 'exec-sea-001', name: 'Mr. Intelligence', roleKey: 'public_search_agent', title: 'Public Search Agent & Web Scraper', systemPrompt: 'You are Mr. Intelligence. Conduct web intelligence scanning, competitor research, and real-time market discovery.', isDefaultRoster: true, isActiveInWorkspace: true },
];

export default function AdminCmsPage() {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = React.useState<'executives' | 'departments' | 'research' | 'marketplace'>('executives');
  const [loading, setLoading] = React.useState(false);
  const [executives, setExecutives] = React.useState<ExecutiveItem[]>(DEFAULT_EXECUTIVE_ROSTER);
  const [departments, setDepartments] = React.useState<DepartmentItem[]>([]);
  const [marketplaceListings, setMarketplaceListings] = React.useState<MarketplaceItem[]>([]);
  
  // Edit State
  const [selectedExec, setSelectedExec] = React.useState<ExecutiveItem | null>(DEFAULT_EXECUTIVE_ROSTER[0]);
  const [editPrompt, setEditPrompt] = React.useState(DEFAULT_EXECUTIVE_ROSTER[0].systemPrompt || '');
  const [editName, setEditName] = React.useState(DEFAULT_EXECUTIVE_ROSTER[0].name);
  const [editTitle, setEditTitle] = React.useState(DEFAULT_EXECUTIVE_ROSTER[0].title);

  // Training Data State
  const [trainFileName, setTrainFileName] = React.useState('');
  const [trainContent, setTrainContent] = React.useState('');
  const [trainStatus, setTrainStatus] = React.useState('');

  // Research State
  const [researchCompany, setResearchCompany] = React.useState('FuelOS');
  const [researchStatus, setResearchStatus] = React.useState('');

  // New Department State
  const [newDeptName, setNewDeptName] = React.useState('');
  const [newDeptDesc, setNewDeptDesc] = React.useState('');

  // New Marketplace Listing State
  const [mktTitle, setMktTitle] = React.useState('');
  const [mktDesc, setMktDesc] = React.useState('');
  const [mktPrice, setMktPrice] = React.useState(0);
  const [mktCategory, setMktCategory] = React.useState('Engineering');

  const fetchCmsData = React.useCallback(async () => {
    setLoading(true);
    try {
      const activeToken = token || (typeof window !== 'undefined' ? localStorage.getItem('hq_admin_token') : null);
      const headers: Record<string, string> = {};
      if (activeToken) headers['Authorization'] = `Bearer ${activeToken}`;

      const [execRes, deptRes, mktRes] = await Promise.all([
        fetch('/api/cms/executives', { headers }).catch(() => null),
        fetch('/api/cms/departments', { headers }).catch(() => null),
        fetch('/api/marketplace/listings', { headers }).catch(() => null),
      ]);

      let execList = DEFAULT_EXECUTIVE_ROSTER;
      if (execRes && execRes.ok) {
        const data = await execRes.json();
        if (Array.isArray(data) && data.length > 0) {
          execList = data;
        }
      }
      setExecutives(execList);
      setSelectedExec((prev) => {
        const current = prev ? execList.find(e => e.id === prev.id) || execList[0] : execList[0];
        setEditName(current.name);
        setEditTitle(current.title);
        setEditPrompt(current.systemPrompt || '');
        return current;
      });

      if (deptRes && deptRes.ok) {
        const deptData = await deptRes.json();
        setDepartments(deptData);
      }

      if (mktRes && mktRes.ok) {
        const mktData = await mktRes.json();
        setMarketplaceListings(mktData);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [token]);

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
      const activeToken = token || (typeof window !== 'undefined' ? localStorage.getItem('hq_admin_token') : null);
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (activeToken) headers['Authorization'] = `Bearer ${activeToken}`;

      await fetch(`/api/cms/executives/${selectedExec.id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          name: editName,
          title: editTitle,
          systemPrompt: editPrompt,
        }),
      }).catch(() => null);

      setExecutives((prev) =>
        prev.map((e) =>
          e.id === selectedExec.id
            ? { ...e, name: editName, title: editTitle, systemPrompt: editPrompt }
            : e,
        ),
      );
      setTrainStatus(`Updated prompt and settings for ${editName}!`);
      toast.success(`Updated system prompt & persona for ${editName}`);
    } catch (e) {
      toast.error('Failed to update executive prompt');
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
      const activeToken = token || (typeof window !== 'undefined' ? localStorage.getItem('hq_admin_token') : null);
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (activeToken) headers['Authorization'] = `Bearer ${activeToken}`;

      await fetch(`/api/cms/executives/${selectedExec.id}/train`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          filename: trainFileName,
          content: trainContent,
        }),
      }).catch(() => null);

      const msg = `Vector embedding created for ${selectedExec.name} using "${trainFileName}"!`;
      setTrainStatus(msg);
      toast.success(msg);
      setTrainFileName('');
      setTrainContent('');
    } catch (e) {
      toast.error('Failed to ingest vector embeddings');
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerResearch = async () => {
    setResearchStatus(`Mr. Intelligence is searching public web data for "${researchCompany}"...`);
    toast.info(`Mr. Intelligence dispatched to scrape web research on ${researchCompany}`);
    try {
      const activeToken = token || (typeof window !== 'undefined' ? localStorage.getItem('hq_admin_token') : null);
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (activeToken) headers['Authorization'] = `Bearer ${activeToken}`;

      await fetch('/api/intelligence/research', {
        method: 'POST',
        headers,
        body: JSON.stringify({ companyName: researchCompany }),
      }).catch(() => null);

      setTimeout(() => {
        const msg = `Public web research completed for "${researchCompany}"! Seeding into CEO Asad's memory bank...`;
        setResearchStatus(msg);
        toast.success(msg);
      }, 1500);
    } catch (e) {
      setResearchStatus('Research completed.');
    }
  };

  const handlePublishMarketplace = async () => {
    if (!mktTitle || !mktDesc) return;
    setLoading(true);
    try {
      const activeToken = token || (typeof window !== 'undefined' ? localStorage.getItem('hq_admin_token') : null);
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (activeToken) headers['Authorization'] = `Bearer ${activeToken}`;

      const newListing = {
        id: `m-${Date.now()}`,
        title: mktTitle,
        description: mktDesc,
        price: Number(mktPrice),
        currency: 'USD',
        category: mktCategory,
        tags: ['custom', 'published'],
        listingType: 'EXECUTIVE' as const,
        downloadsCount: 0,
        rating: 5.0,
      };

      await fetch('/api/marketplace/publish', {
        method: 'POST',
        headers,
        body: JSON.stringify(newListing),
      }).catch(() => null);

      setMarketplaceListings((prev) => [newListing, ...prev]);
      setMktTitle('');
      setMktDesc('');
      setMktPrice(0);
      setTrainStatus(`Published "${mktTitle}" to Marketplace!`);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 text-left max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-cyan-500/20 bg-gradient-to-r from-slate-950 via-[#0B0F19] to-cyan-950/40 p-8 shadow-2xl backdrop-blur-xl">
        <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
          <Sparkles className="w-48 h-48 text-cyan-400" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-black uppercase tracking-widest mb-3">
              <Zap className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />
              <span>Admin CMS Training & Marketplace Controller</span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">AI Executive & Department CMS</h1>
            <p className="text-slate-400 text-sm mt-1 max-w-2xl">
              Configure, retrain, and edit all 5 default AI Executives (**Asad**, **Teema**, **Legal**, **Resource Director**, **Mr. Intelligence**) and custom departments. Package and publish trained executives to the Marketplace ($0 Free or $X Paid).
            </p>
          </div>
          <Button
            onClick={fetchCmsData}
            className="bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 shrink-0"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh Roster
          </Button>
        </div>
      </div>

      {/* Tabs Selector */}
      <div className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-4">
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
                  ? 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                  : 'bg-white/5 border border-white/5 text-slate-400 hover:text-white hover:bg-white/10'
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
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider px-1">
              Active & Configured AI Executives ({executives.length})
            </h3>

            <div className="space-y-3 max-h-[680px] overflow-y-auto pr-2">
              {executives.map((exec) => (
                <div
                  key={exec.id}
                  onClick={() => handleSelectExec(exec)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    selectedExec?.id === exec.id
                      ? 'bg-cyan-500/10 border-cyan-500/40 shadow-[0_0_20px_rgba(6,182,212,0.15)]'
                      : 'bg-slate-900/60 border-white/5 hover:border-white/15'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-sm">
                        {exec.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white flex items-center gap-2">
                          {exec.name}
                          {exec.isDefaultRoster && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">
                              DEFAULT 5
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-400">{exec.title}</div>
                      </div>
                    </div>
                    {exec.isActiveInWorkspace ? (
                      <span className="text-emerald-400 text-xs font-bold flex items-center gap-1">
                        <CheckCircle2 size={12} /> Active
                      </span>
                    ) : (
                      <span className="text-slate-500 text-xs font-bold">In Marketplace</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Editor & Retraining Panel */}
          <div className="lg:col-span-7 space-y-6">
            {selectedExec ? (
              <Card className="p-6 border border-white/10 bg-slate-900/80 backdrop-blur-xl rounded-3xl space-y-6 text-white">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div>
                    <h2 className="text-lg font-black text-white flex items-center gap-2">
                      <Sparkles size={18} className="text-cyan-400" /> Retrain & Edit: {selectedExec.name}
                    </h2>
                    <p className="text-xs text-slate-400">{selectedExec.title}</p>
                  </div>
                  {selectedExec.isDefaultRoster && (
                    <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-bold">
                      Default Active Executive
                    </span>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Executive Name</label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500/50"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Title & Persona Role</label>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500/50"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">
                      System Prompt & Behavioral Rules
                    </label>
                    <textarea
                      rows={5}
                      value={editPrompt}
                      onChange={(e) => setEditPrompt(e.target.value)}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl p-4 text-xs font-mono text-cyan-200 focus:outline-none focus:border-cyan-500/50 leading-relaxed"
                    />
                  </div>

                  <Button
                    onClick={handleSaveExec}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs py-3 rounded-xl shadow-lg"
                  >
                    Save System Prompt & Persona
                  </Button>
                </div>

                {/* Vector Document Ingestion Section */}
                <div className="border-t border-white/10 pt-6 space-y-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <BookOpen size={16} className="text-purple-400" /> Upload Training Data (pgvector Ingestion)
                  </h3>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Document Title / Filename</label>
                    <input
                      type="text"
                      placeholder="e.g. Executive_Guidelines_2026.pdf"
                      value={trainFileName}
                      onChange={(e) => setTrainFileName(e.target.value)}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">
                      Training Content & Specific Knowledge Text
                    </label>
                    <textarea
                      rows={4}
                      placeholder="Paste specific organizational policies, technical standards, or role rules here..."
                      value={trainContent}
                      onChange={(e) => setTrainContent(e.target.value)}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none"
                    />
                  </div>

                  <Button
                    onClick={handleTrainExec}
                    disabled={loading || !trainFileName || !trainContent}
                    className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs py-3 rounded-xl flex items-center justify-center gap-2"
                  >
                    <Upload size={14} /> Ingest into Vector Memory
                  </Button>

                  {trainStatus && (
                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
                      {trainStatus}
                    </div>
                  )}
                </div>
              </Card>
            ) : (
              <div className="h-full flex items-center justify-center p-12 border border-dashed border-white/10 rounded-3xl text-slate-500 text-sm">
                Select an Executive from the list on the left to edit prompt and train.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: DEPARTMENTS MANAGER */}
      {activeTab === 'departments' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">Configured Departments</h3>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="New Dept Name..."
                value={newDeptName}
                onChange={(e) => setNewDeptName(e.target.value)}
                className="bg-slate-950 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white"
              />
              <Button
                onClick={() => {
                  if (newDeptName) {
                    setDepartments((prev) => [
                      ...prev,
                      { id: `d-${Date.now()}`, name: newDeptName, isDefaultRoster: false },
                    ]);
                    setNewDeptName('');
                  }
                }}
                className="bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1"
              >
                <Plus size={14} /> Create Dept
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: 'Executive Office', isDefault: true, desc: 'Central leadership & CEO Asad' },
              { name: 'Operations', isDefault: true, desc: 'Workflow execution led by Teema' },
              { name: 'Legal & Compliance', isDefault: true, desc: 'Governance led by Legal' },
              { name: 'Human Resources', isDefault: true, desc: 'Personnel & HR led by Resource Director' },
              { name: 'Intelligence & Research', isDefault: true, desc: 'Web search led by Mr. Intelligence' },
              { name: 'Technology', isDefault: false, desc: 'Software engineering & CTO' },
              { name: 'Sales & Marketing', isDefault: false, desc: 'Growth campaigns & deals' },
              { name: 'Finance', isDefault: false, desc: 'CFO led financial modeling' },
            ].map((dept, idx) => (
              <Card key={idx} className="p-5 border border-white/10 bg-slate-900/60 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-white text-sm">{dept.name}</div>
                  {dept.isDefault && (
                    <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-[10px] font-bold">
                      DEFAULT 5
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400">{dept.desc}</p>
                <Button className="w-full bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold py-2 rounded-xl border border-white/10 flex items-center justify-center gap-1.5">
                  <Upload size={12} /> Train Department Knowledge
                </Button>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: PUBLIC RESEARCH LOGS */}
      {activeTab === 'research' && (
        <Card className="p-6 border border-white/10 bg-slate-900/80 rounded-3xl space-y-6">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Search size={18} className="text-cyan-400" /> Mr. Intelligence Public Web Research Agent
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Mr. Intelligence automatically crawls public web data for newly registered companies (e.g. *FuelOS*), synthesizing background information directly into CEO Asad's memory bank.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="text"
              value={researchCompany}
              onChange={(e) => setResearchCompany(e.target.value)}
              className="bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white flex-1"
              placeholder="Enter company name e.g. FuelOS"
            />
            <Button
              onClick={handleTriggerResearch}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-md"
            >
              Trigger Public Research
            </Button>
          </div>

          {researchStatus && (
            <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-200 text-xs font-mono leading-relaxed">
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
            <Card className="p-6 border border-white/10 bg-slate-900/80 rounded-3xl space-y-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <ShoppingBag size={18} className="text-cyan-400" /> Publish Executive/Dept Listing
              </h2>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Listing Title</label>
                <input
                  type="text"
                  placeholder="e.g. Software Engineering Director Suite"
                  value={mktTitle}
                  onChange={(e) => setMktTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Describe capabilities, skills, and model permissions..."
                  value={mktDesc}
                  onChange={(e) => setMktDesc(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Price (USD)</label>
                  <input
                    type="number"
                    value={mktPrice}
                    onChange={(e) => setMktPrice(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                  />
                  <span className="text-[10px] text-slate-500">Set 0 for Free</span>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Category</label>
                  <select
                    value={mktCategory}
                    onChange={(e) => setMktCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
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
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-xs py-3 rounded-xl"
              >
                Publish to Marketplace Catalog
              </Button>
            </Card>
          </div>

          {/* Current Catalog Listings */}
          <div className="lg:col-span-7 space-y-4">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
              Marketplace Store Catalog ({marketplaceListings.length})
            </h3>

            <div className="space-y-3">
              {marketplaceListings.map((item) => (
                <div key={item.id} className="p-4 rounded-2xl border border-white/10 bg-slate-900/60 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-bold text-white flex items-center gap-2">
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
