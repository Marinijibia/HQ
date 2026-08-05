'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Button, Badge, Input } from '@hq/ui';
import {
  ShieldCheck,
  ShieldAlert,
  Save,
  CheckCircle,
  Cpu,
  DollarSign,
  PlusCircle,
  XCircle,
  Activity,
  Sliders,
  Pause,
  Play,
  RotateCcw,
  Check,
  AlertTriangle,
  History,
  Info,
  Users,
  Search,
  Plus,
  Calendar,
  Layers,
  ArrowRight,
  TrendingUp,
  Brain,
  Scale,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../../../contexts/auth-context';
import { toast } from '../../../components/toast';

interface ModelConfig {
  id: string;
  name: string;
  provider: string;
  enabled: boolean;
  tier: 'Standard' | 'Premium';
}

interface IntegrationRequest {
  id: string;
  integration: string;
  requestedBy: string;
  requestedAt: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}

interface GovernancePolicy {
  id: string;
  ruleText: string;
  category: string;
  version: string;
  status: 'Active' | 'Draft' | 'Archived';
}

interface DelegationRecord {
  id: string;
  delegator: string;
  delegatee: string;
  scope: string;
  startDate: string;
  endDate: string;
  active: boolean;
}

interface DecisionRecord {
  id: string;
  title: string;
  maker: string;
  outcome: string;
  evidence: string;
  timestamp: string;
}

export default function CompliancePage() {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = React.useState<'overview' | 'studio' | 'workflows' | 'register'>('overview');
  const [brandColor, setBrandColor] = React.useState('#0A84FF');

  // Overview / General State
  const [autonomyLevel, setAutonomyLevel] = React.useState<number>(3); // Default Level 3 (Guided Automation)
  const [emergencyPaused, setEmergencyPaused] = React.useState<boolean>(false);
  const [enforceManualAll, setEnforceManualAll] = React.useState<boolean>(false);
  const [mfaEnforced, setMfaEnforced] = React.useState(true);

  const [models, setModels] = React.useState<ModelConfig[]>([
    { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', provider: 'Google', enabled: true, tier: 'Standard' },
    { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', provider: 'Google', enabled: true, tier: 'Standard' },
    { id: 'gpt-4o', name: 'GPT-4o', provider: 'OpenAI', enabled: true, tier: 'Premium' },
  ]);

  const [requests, setRequests] = React.useState<IntegrationRequest[]>([
    { id: 'req-101', integration: 'Hubspot CRM OAuth Sync', requestedBy: 'Sophia Sterling', requestedAt: 'July 07, 2026', status: 'Pending' },
    { id: 'req-102', integration: 'Google Drive Asset Exporter', requestedBy: 'Alexander Carter', requestedAt: 'July 08, 2026', status: 'Pending' },
  ]);

  // Policy Studio State
  const [policies, setPolicies] = React.useState<GovernancePolicy[]>([
    { id: 'pol-1', ruleText: 'Any purchase above $10,000 requires Finance Director approval.', category: 'Budget Approvals', version: 'v1.2', status: 'Active' },
    { id: 'pol-2', ruleText: 'External integration installs require Legal Director sign-off.', category: 'Security & Access', version: 'v1.0', status: 'Active' },
    { id: 'pol-3', ruleText: 'Marketing campaigns publishing requires CMO sign-off.', category: 'Procurement', version: 'v1.4', status: 'Active' },
  ]);
  const [newRuleText, setNewRuleText] = React.useState('');
  const [newRuleCategory, setNewRuleCategory] = React.useState('Budget Approvals');
  const [simulationResult, setSimulationResult] = React.useState<string | null>(null);
  const [isSimulating, setIsSimulating] = React.useState(false);

  // Approval Workflows & Delegations State
  const [delegations, setDelegations] = React.useState<DelegationRecord[]>([
    { id: 'del-1', delegator: 'Elena Rostova (CEO)', delegatee: 'Sophia Sterling (CFO)', scope: 'Strategic WBS Approvals', startDate: '2026-07-15', endDate: '2026-07-29', active: true },
  ]);
  const [newDelegator, setNewDelegator] = React.useState('Elena Rostova (CEO)');
  const [newDelegatee, setNewDelegatee] = React.useState('');
  const [newDelScope, setNewDelScope] = React.useState('Budget Approvals');
  const [newDelStart, setNewDelStart] = React.useState('2026-07-15');
  const [newDelEnd, setNewDelEnd] = React.useState('2026-07-29');

  // Decision Register State
  const [decisions, setDecisions] = React.useState<DecisionRecord[]>([
    { id: 'dec-1', title: 'Stripe Paygate Integration Activation', maker: 'Elena Rostova (CEO)', outcome: 'Approved', evidence: 'Stripe API verified & test suite passes, regional taxation configured', timestamp: '2026-07-10 11:32' },
    { id: 'dec-2', title: 'Q3 Product Scaling WBS Start', maker: 'Alexander Carter (CTO)', outcome: 'Approved', evidence: 'Project resources allocated, AI QA Director assigned', timestamp: '2026-07-12 09:15' },
    { id: 'dec-3', title: 'Niger Corridors Logistics Budget Cap Shift', maker: 'Sophia Sterling (CFO)', outcome: 'Approved', evidence: 'Additional credits approved by board to support logistics nodes', timestamp: '2026-07-13 16:45' },
  ]);
  const [searchQuery, setSearchQuery] = React.useState('');

  React.useEffect(() => {
    try {
      const draft = JSON.parse(localStorage.getItem('hq_onboarding_draft') || '{}');
      if (draft.brandColor) setBrandColor(draft.brandColor);
    } catch { /* ignore */ }
  }, []);

  const handleAction = (id: string, action: 'Approved' | 'Rejected') => {
    setRequests((prev) => prev.filter((r) => r.id !== id));
    toast.success(`Integration request has been ${action.toLowerCase()}`);
  };

  const handleToggleModel = (id: string) => {
    setModels((prev) => prev.map((m) => (m.id === id ? { ...m, enabled: !m.enabled } : m)));
  };

  const handleEmergencyStop = () => {
    const nextState = !emergencyPaused;
    setEmergencyPaused(nextState);
    if (nextState) {
      toast.error('🚨 EMERGENCY STOP ACTIVE: All autonomous C-Suite workflows paused.');
    } else {
      toast.success('🟢 Emergency stop lifted. Resuming guided automations.');
    }
  };

  const handleCreateRule = () => {
    if (!newRuleText.trim()) return;
    const newPol: GovernancePolicy = {
      id: `pol-${Date.now()}`,
      ruleText: newRuleText,
      category: newRuleCategory,
      version: 'v1.0',
      status: 'Active',
    };
    setPolicies(prev => [...prev, newPol]);
    setNewRuleText('');
    toast.success('✨ New governance policy registered successfully');
  };

  const handleSimulateRule = () => {
    if (!newRuleText.trim()) {
      toast.error('Please input a rule to simulate first');
      return;
    }
    setIsSimulating(true);
    setSimulationResult(null);
    setTimeout(() => {
      setIsSimulating(false);
      setSimulationResult(`Simulation output: Evaluated successfully. Under this rule, a transaction of $12,500 will prompt a CFO approval hold. Standard operations under $10,000 will run autonomously.`);
    }, 1000);
  };

  const handleCreateDelegation = () => {
    if (!newDelegatee.trim()) return;
    const newDel: DelegationRecord = {
      id: `del-${Date.now()}`,
      delegator: newDelegator,
      delegatee: newDelegatee,
      scope: newDelScope,
      startDate: newDelStart,
      endDate: newDelEnd,
      active: true,
    };
    setDelegations(prev => [...prev, newDel]);
    setNewDelegatee('');
    toast.success(`📅 Authority successfully delegated to: ${newDel.delegatee}`);
  };

  const handleRevokeDelegation = (id: string) => {
    setDelegations(prev => prev.filter(d => d.id !== id));
    toast.info('🗑️ Delegation of authority revoked');
  };

  const filteredDecisions = decisions.filter(
    d =>
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.maker.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.evidence.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const AUTONOMY_TIERS = [
    { level: 0, name: 'Observation', desc: 'HQ only monitors telemetry. No advice or actions.' },
    { level: 1, name: 'Advisor', desc: 'HQ recommends strategic paths. Owner decides.' },
    { level: 2, name: 'Assisted Execution', desc: 'HQ drafts plans/reports. Owner triggers execution.' },
    { level: 3, name: 'Guided Automation', desc: 'HQ executes low-risk approved policy actions.' },
    { level: 4, name: 'Managed Autonomy', desc: 'HQ runs operational workflows. User can override.' },
    { level: 5, name: 'Executive Autonomy', desc: 'HQ manages day-to-day work within approved budgets.' },
  ];

  return (
    <div className="space-y-8 select-none text-foreground pb-12">
      {/* Title */}
      <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0 border-b border-card-border pb-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#1A1A1E] dark:text-white flex items-center gap-2">
            <ShieldCheck className="h-8 w-8 text-rose-500" />
            Compliance & Governance
          </h1>
          <p className="text-foreground/60 text-sm mt-1">
            Enforce organization policies, configure decision authority scopes, delegate credentials, and audit resolution logs.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
            <Input
              type="text"
              placeholder="Search governance policies & decisions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-black/50 border border-white/10 text-white pl-9 h-10 text-xs rounded-xl focus-visible:ring-cyan-500 w-72 font-bold"
            />
          </div>

          {emergencyPaused && (
            <Badge variant="error" className="animate-pulse py-1 px-3 text-[10px] font-black uppercase">
              🚨 Emergency Stop Active
            </Badge>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 border-b border-card-border">
        {[
          { id: 'overview', label: 'Oversight & Health', icon: Activity },
          { id: 'studio', label: 'Governance Policy Studio', icon: Scale },
          { id: 'workflows', label: 'Approval Workflows & Boards', icon: Users },
          { id: 'register', label: 'Decision Register', icon: History },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'border-current text-white font-extrabold'
                  : 'border-transparent text-foreground/55 hover:text-foreground'
              }`}
              style={activeTab === tab.id ? { borderColor: brandColor, color: brandColor } : {}}
            >
              <Icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="space-y-6">

        {/* Tab 1: Oversight & Health */}
        {activeTab === 'overview' && (
          <div className="grid gap-6 lg:grid-cols-3 text-left">
            <div className="lg:col-span-2 space-y-6">
              {/* Autonomy Level selector */}
              <Card className="border border-card-border bg-card-bg p-5 shadow-level-2 space-y-4">
                <div>
                  <CardTitle className="flex items-center gap-2 text-sm font-extrabold text-[#1A1A1E] dark:text-white">
                    <Sliders className="h-4.5 w-4.5 text-hq-cyan" />
                    AI Autonomy Level Configuration
                  </CardTitle>
                  <CardDescription className="text-[10px] font-semibold mt-0.5">
                    Set how much execution authority is delegated to the AI C-Suite board.
                  </CardDescription>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {AUTONOMY_TIERS.map(tier => {
                    const active = autonomyLevel === tier.level;
                    return (
                      <button
                        key={tier.level}
                        onClick={() => setAutonomyLevel(tier.level)}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          active
                            ? 'border-hq-cyan bg-hq-cyan/5'
                            : 'border-card-border bg-[#F9F9FB] dark:bg-[#0A0A0C]/20 hover:border-card-border-hover'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`text-[10px] font-black uppercase ${active ? 'text-hq-cyan' : 'text-foreground/50'}`}>
                            L{tier.level}
                          </span>
                          {active && <Check className="h-3 w-3 text-hq-cyan" />}
                        </div>
                        <p className="text-[11px] font-extrabold text-[#1A1A1E] dark:text-white mt-1">{tier.name}</p>
                        <p className="text-[9px] text-foreground/45 font-semibold mt-0.5 leading-tight">{tier.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </Card>

              {/* Emergency Controls */}
              <Card className="border border-red-500/20 bg-red-500/5 p-5 shadow-level-2 space-y-4">
                <div>
                  <CardTitle className="flex items-center gap-2 text-sm font-extrabold text-red-500">
                    <AlertTriangle className="h-4.5 w-4.5" />
                    Emergency Oversight Controls
                  </CardTitle>
                  <CardDescription className="text-[10px] text-foreground/50 font-semibold mt-0.5">
                    Instant safety overrides to freeze autonomous executions.
                  </CardDescription>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={emergencyPaused ? 'success' : 'outline'}
                    className={`text-[10.5px] font-bold h-8.5 gap-1.5 cursor-pointer ${
                      emergencyPaused ? '' : 'bg-red-500/10 text-red-500 border-red-500/30 hover:bg-red-500/20'
                    }`}
                    onClick={handleEmergencyStop}
                  >
                    <Pause className="h-3.5 w-3.5 fill-current" />
                    {emergencyPaused ? 'Lift Emergency Stop' : 'Emergency Stop: Pause All'}
                  </Button>

                  <Button
                    variant="outline"
                    className={`text-[10.5px] font-bold h-8.5 border-card-border cursor-pointer ${
                      enforceManualAll ? 'bg-amber-500/10 text-amber-500 border-amber-500/30' : ''
                    }`}
                    onClick={() => setEnforceManualAll(!enforceManualAll)}
                  >
                    <ShieldAlert className="h-3.5 w-3.5 mr-1" />
                    {enforceManualAll ? '100% Manual Approvals Active' : 'Force 100% Manual Approvals'}
                  </Button>
                </div>
              </Card>

              {/* Integration requests queue */}
              <Card className="border border-card-border bg-card-bg p-5 shadow-level-2 space-y-4">
                <CardTitle className="text-sm font-extrabold text-[#1A1A1E] dark:text-white flex items-center gap-2">
                  <Cpu className="h-4.5 w-4.5 text-hq-blue" />
                  Ecosystem Integration Authorization Requests
                </CardTitle>

                {requests.length === 0 ? (
                  <div className="py-6 text-center text-xs text-foreground/45 border border-dashed border-card-border rounded-xl">
                    No pending integration approval requests.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {requests.map(req => (
                      <div key={req.id} className="flex items-center justify-between p-3 rounded-lg border border-card-border bg-[#F9F9FB] dark:bg-[#0A0A0C]/20 text-xs">
                        <div>
                          <span className="font-extrabold text-[#1A1A1E] dark:text-white block">{req.integration}</span>
                          <span className="text-[10px] text-foreground/50 font-semibold block mt-0.5">Requested by: {req.requestedBy} · {req.requestedAt}</span>
                        </div>
                        <div className="flex gap-1.5 shrink-0">
                          <button onClick={() => handleAction(req.id, 'Approved')} className="text-green-500 hover:text-green-600 font-extrabold text-[10.5px] cursor-pointer">Approve</button>
                          <button onClick={() => handleAction(req.id, 'Rejected')} className="text-red-500 hover:text-red-600 font-extrabold text-[10.5px] cursor-pointer">Reject</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>

            {/* Sidebar Governance Health score and Whitelisted models */}
            <div className="space-y-6">
              <Card className="border border-card-border bg-card-bg p-5 shadow-level-2 space-y-4">
                <h4 className="text-xs font-black text-[#1A1A1E] dark:text-white uppercase tracking-widest flex items-center gap-1.5">
                  <Activity className="h-4 w-4 text-hq-cyan" />
                  Governance Health Index
                </h4>

                <div className="space-y-4 text-xs">
                  <div>
                    <div className="flex justify-between items-baseline">
                      <span className="font-semibold text-foreground/60">Audit Turnaround Score</span>
                      <span className="text-[#30D158] font-extrabold text-sm">Excellent (96%)</span>
                    </div>
                    <div className="h-2 w-full bg-[#F9F9FB] dark:bg-[#0A0A0C] rounded-full overflow-hidden mt-1.5">
                      <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: '96%' }}></div>
                    </div>
                  </div>

                  <div className="border-t border-card-border pt-3 space-y-2 text-[10px] font-bold">
                    <p className="uppercase text-foreground/45 tracking-widest text-[8.5px]">Ecosystem constraints</p>
                    <div className="flex justify-between">
                      <span className="text-foreground/40">Active Policies</span>
                      <span className="text-white">{policies.length} rules active</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-foreground/40">Policy Violations Today</span>
                      <span className="text-white">0</span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Whitelisted Models */}
              <Card className="border border-card-border bg-card-bg p-5 shadow-level-2 space-y-4">
                <CardTitle className="text-xs font-black text-[#1A1A1E] dark:text-white uppercase tracking-widest flex items-center gap-1.5">
                  <Layers className="h-4 w-4 text-hq-purple" />
                  Allowed AI Providers
                </CardTitle>

                <div className="space-y-2">
                  {models.map(m => (
                    <div key={m.id} className="flex items-center justify-between text-xs">
                      <span className="text-foreground/75 font-semibold">{m.name}</span>
                      <button
                        onClick={() => handleToggleModel(m.id)}
                        className={`text-[9.5px] px-2 py-0.5 rounded font-black uppercase transition-all cursor-pointer ${
                          m.enabled
                            ? 'bg-green-500/15 text-green-500 border border-green-500/20'
                            : 'bg-[#F9F9FB] dark:bg-[#0A0A0C] border border-card-border text-foreground/45'
                        }`}
                      >
                        {m.enabled ? 'Allowed' : 'Blocked'}
                      </button>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* Tab 2: Governance Policy Studio */}
        {activeTab === 'studio' && (
          <div className="grid gap-6 md:grid-cols-3 text-left">
            <div className="md:col-span-2 space-y-6">
              {/* Visual Rule Builder */}
              <Card className="border border-card-border bg-card-bg p-5 shadow-level-2 space-y-4">
                <div>
                  <h3 className="text-sm font-extrabold text-[#1A1A1E] dark:text-white">Governance Policy Builder</h3>
                  <p className="text-[10px] text-foreground/50 font-semibold mt-0.5">Write organizational policies in plain business language.</p>
                </div>

                <div className="space-y-3.5 text-xs font-semibold">
                  <div className="space-y-1.5">
                    <label className="text-foreground/75">Natural Language Rule Definition</label>
                    <Input
                      placeholder="e.g. Any purchase above $10,000 requires Finance Director approval."
                      value={newRuleText}
                      onChange={e => setNewRuleText(e.target.value)}
                    />
                  </div>

                  <div className="grid gap-2 grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="text-foreground/75">Policy Category</label>
                      <select
                        className="bg-card-bg border border-card-border rounded-lg w-full p-2 h-9 text-xs font-bold focus:outline-none text-white"
                        value={newRuleCategory}
                        onChange={e => setNewRuleCategory(e.target.value)}
                      >
                        <option value="Budget Approvals">Budget Approvals</option>
                        <option value="Security & Access">Security & Access</option>
                        <option value="Procurement">Procurement</option>
                        <option value="Automation Permissions">Automation Permissions</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="text-white text-xs font-bold h-8.5 gap-1.5 cursor-pointer"
                      style={{ backgroundColor: brandColor }}
                      onClick={handleCreateRule}
                    >
                      <Plus className="h-4 w-4" />
                      Publish Policy Rule
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs border-card-border font-bold h-8.5 text-hq-cyan cursor-pointer"
                      onClick={handleSimulateRule}
                    >
                      Simulate Policy Outcome
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Rule simulation preview panel */}
              {isSimulating && (
                <div className="py-6 flex flex-col items-center justify-center space-y-3 text-center border border-dashed border-card-border rounded-xl">
                  <RefreshCw className="h-5 w-5 text-hq-cyan animate-spin" />
                  <p className="text-[10.5px] text-foreground/50">Simulating policy outcomes...</p>
                </div>
              )}

              {simulationResult && (
                <Card className="border border-hq-cyan/40 bg-hq-cyan/5 p-4 shadow-level-2 text-xs">
                  <div className="flex items-start gap-2.5">
                    <Info className="h-4 w-4 text-hq-cyan mt-0.5 shrink-0" />
                    <div>
                      <span className="font-extrabold text-white">Policy Simulation Result</span>
                      <p className="text-foreground/70 leading-relaxed font-semibold mt-1">{simulationResult}</p>
                    </div>
                  </div>
                </Card>
              )}

              {/* Active Rules List */}
              <Card className="border border-card-border bg-card-bg p-5 shadow-level-2 space-y-4">
                <h3 className="text-sm font-extrabold text-[#1A1A1E] dark:text-white">Active Policy Studio Version</h3>

                <div className="space-y-3">
                  {policies.map(p => (
                    <div key={p.id} className="p-3 rounded-lg border border-card-border bg-[#F9F9FB] dark:bg-[#0A0A0C]/20 text-xs flex justify-between gap-4">
                      <div>
                        <span className="font-extrabold text-white block">{p.ruleText}</span>
                        <span className="text-[9.5px] text-foreground/45 font-semibold mt-0.5">{p.category} · Version {p.version}</span>
                      </div>
                      <Badge variant="success" className="text-[8px] h-5 self-center font-bold">Active</Badge>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* Tab 3: Approval Workflows & Delegations */}
        {activeTab === 'workflows' && (
          <div className="grid gap-6 md:grid-cols-3 text-left">
            <div className="md:col-span-2 space-y-6">
              {/* Approval chain WBS visualizer */}
              <Card className="border border-card-border bg-card-bg p-5 shadow-level-2 space-y-4">
                <div>
                  <h3 className="text-sm font-extrabold text-[#1A1A1E] dark:text-white">Configurable Approval Chains</h3>
                  <p className="text-[10px] text-foreground/50 font-semibold mt-0.5">Visual representation of sequential authority blocks.</p>
                </div>

                <div className="border border-card-border bg-[#F9F9FB] dark:bg-[#08080A] rounded-xl p-4 flex flex-col md:flex-row items-center justify-center gap-3">
                  <div className="p-2.5 rounded-lg border border-card-border bg-card-bg text-center font-bold text-[10px] text-white">
                    Mission Created
                  </div>
                  <ArrowRight className="h-4 w-4 text-foreground/35 shrink-0 hidden md:block" />
                  <div className="p-2.5 rounded-lg border border-hq-cyan/40 bg-hq-cyan/5 text-center font-bold text-[10px] text-white">
                    Department Manager
                  </div>
                  <ArrowRight className="h-4 w-4 text-foreground/35 shrink-0 hidden md:block" />
                  <div className="p-2.5 rounded-lg border border-hq-purple/40 bg-hq-purple/5 text-center font-bold text-[10px] text-white">
                    Finance Director
                  </div>
                  <ArrowRight className="h-4 w-4 text-foreground/35 shrink-0 hidden md:block" />
                  <div className="p-2.5 rounded-lg border border-green-500/40 bg-green-500/5 text-center font-bold text-[10px] text-white">
                    CEO Elena
                  </div>
                </div>
              </Card>

              {/* Delegation List */}
              <Card className="border border-card-border bg-card-bg p-5 shadow-level-2 space-y-4">
                <h3 className="text-sm font-extrabold text-[#1A1A1E] dark:text-white">Active Authority Delegations</h3>

                {delegations.length === 0 ? (
                  <div className="py-6 text-center text-xs text-foreground/45 border border-dashed border-card-border rounded-xl">
                    No active authority delegations.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {delegations.map(del => (
                      <div key={del.id} className="p-3 rounded-lg border border-card-border bg-[#F9F9FB] dark:bg-[#0A0A0C]/20 text-xs flex justify-between gap-4">
                        <div>
                          <span className="font-extrabold text-white block">{del.delegator} delegated to {del.delegatee}</span>
                          <span className="text-[9.5px] text-foreground/45 font-semibold mt-0.5 block">Scope: {del.scope}</span>
                          <span className="text-[9px] text-[#0EA5E9] font-bold mt-1 block">Period: {del.startDate} to {del.endDate}</span>
                        </div>
                        <div className="flex gap-2.5 shrink-0 self-center">
                          <Badge variant="success" className="text-[8px] h-5 font-bold uppercase">Active</Badge>
                          <button onClick={() => handleRevokeDelegation(del.id)} className="text-red-500 hover:text-red-600 font-extrabold text-[10.5px] cursor-pointer">Revoke</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>

            {/* Create Delegation Calendar scheduler */}
            <div className="space-y-6">
              <Card className="border border-card-border bg-card-bg p-5 shadow-level-2 space-y-4">
                <div>
                  <h4 className="text-xs font-black text-[#1A1A1E] dark:text-white uppercase tracking-widest">Delegate Authority</h4>
                  <p className="text-[9.5px] text-foreground/45 mt-0.5 font-semibold">Assign decision approvals during leave or travel</p>
                </div>

                <div className="space-y-3.5 text-xs font-semibold">
                  <div className="space-y-1.5">
                    <label className="text-foreground/75">Delegator (Authority Holder)</label>
                    <select
                      className="bg-card-bg border border-card-border rounded-lg w-full p-2 h-9 text-xs font-bold focus:outline-none text-white"
                      value={newDelegator}
                      onChange={e => setNewDelegator(e.target.value)}
                    >
                      <option value="Elena Rostova (CEO)">Elena Rostova (CEO)</option>
                      <option value="Sophia Sterling (CFO)">Sophia Sterling (CFO)</option>
                      <option value="Alexander Carter (CTO)">Alexander Carter (CTO)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-foreground/75">Delegatee (Assigned Deputy)</label>
                    <Input
                      placeholder="e.g. Marcus Vance (COO)"
                      value={newDelegatee}
                      onChange={e => setNewDelegatee(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-foreground/75">Delegated Scope</label>
                    <Input value={newDelScope} onChange={e => setNewDelScope(e.target.value)} />
                  </div>

                  <div className="grid gap-2 grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="text-foreground/75">Start Date</label>
                      <Input type="date" value={newDelStart} onChange={e => setNewDelStart(e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-foreground/75">End Date</label>
                      <Input type="date" value={newDelEnd} onChange={e => setNewDelEnd(e.target.value)} />
                    </div>
                  </div>

                  <Button
                    size="sm"
                    className="w-full text-white text-xs font-bold h-8.5 gap-1.5 cursor-pointer"
                    style={{ backgroundColor: brandColor }}
                    onClick={handleCreateDelegation}
                  >
                    <Calendar className="h-4 w-4" />
                    Register Delegation
                  </Button>
                </div>
              </Card>

              {/* Enterprise Governance Boards List */}
              <Card className="border border-card-border bg-card-bg p-5 shadow-level-2 space-y-4">
                <CardTitle className="text-xs font-black text-[#1A1A1E] dark:text-white uppercase tracking-widest flex items-center gap-1.5">
                  <Users className="h-4 w-4 text-hq-purple" />
                  Governance Boards
                </CardTitle>

                <div className="space-y-2 text-[10.5px]">
                  {[
                    { name: 'Executive Leadership Board', active: true },
                    { name: 'AI Ethics Review Board', active: true },
                    { name: 'Risk & Audit Committee', active: false },
                  ].map((board, idx) => (
                    <div key={idx} className="flex justify-between items-center">
                      <span className="font-semibold text-foreground/70">{board.name}</span>
                      <Badge variant={board.active ? 'success' : 'neutral'} className="text-[7.5px] uppercase font-bold">
                        {board.active ? 'Active' : 'Muted'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* Tab 4: Decision Register */}
        {activeTab === 'register' && (
          <div className="text-left space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-card-border pb-3">
              <div>
                <h3 className="text-sm font-extrabold text-[#1A1A1E] dark:text-white">Auditable Decisions Log</h3>
                <p className="text-[10px] text-foreground/50 font-semibold mt-0.5">Chronological ledger of strategic corporate resolutions.</p>
              </div>

              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-foreground/45" />
                <Input
                  className="pl-9 h-9 text-xs font-semibold focus:outline-none"
                  placeholder="Search decisions or makers..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-3">
              {filteredDecisions.length === 0 ? (
                <div className="py-12 text-center text-xs text-foreground/45 border border-dashed border-card-border rounded-xl">
                  No decision log entries match your search.
                </div>
              ) : (
                filteredDecisions.map(dec => (
                  <Card key={dec.id} className="border border-card-border bg-card-bg p-4 shadow-level-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-white">{dec.title}</span>
                        <Badge variant="success" className="text-[8px] h-4.5 font-bold uppercase">{dec.outcome}</Badge>
                      </div>
                      <p className="text-[10px] text-foreground/55 font-semibold">
                        Resolved by: <span className="text-white">{dec.maker}</span> · Context: <span className="text-white/80">{dec.evidence}</span>
                      </p>
                    </div>

                    <div className="text-right text-[9.5px] font-bold text-foreground/40 shrink-0">
                      <span>{dec.timestamp}</span>
                    </div>
                  </Card>
                )))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
