'use client';

import * as React from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Button,
  Input,
  Badge,
} from '@hq/ui';
import {
  ShieldAlert,
  Save,
  CheckCircle,
  Cpu,
  DollarSign,
  ShieldCheck,
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
} from 'lucide-react';
import { useAuth } from '../../../../contexts/auth-context';
import { toast } from '../../../../components/toast';

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

interface AutonomousWorkflow {
  id: string;
  name: string;
  status: 'Active' | 'Paused' | 'Completed' | 'Pending';
  trigger: string;
  timeline: { time: string; event: string }[];
}

export default function CompliancePage() {
  const { token } = useAuth();

  // Whitelisted models state
  const [models, setModels] = React.useState<ModelConfig[]>([
    { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', provider: 'Google', enabled: true, tier: 'Standard' },
    { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', provider: 'Google', enabled: true, tier: 'Standard' },
    { id: 'gpt-4o', name: 'GPT-4o', provider: 'OpenAI', enabled: true, tier: 'Premium' },
    { id: 'claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'Anthropic', enabled: false, tier: 'Premium' },
  ]);

  // Integration requests state
  const [requests, setRequests] = React.useState<IntegrationRequest[]>([
    { id: 'req-101', integration: 'Hubspot CRM OAuth Sync', requestedBy: 'Sophia Sterling', requestedAt: 'July 07, 2026', status: 'Pending' },
    { id: 'req-102', integration: 'Google Drive Asset Exporter', requestedBy: 'Alexander Carter', requestedAt: 'July 08, 2026', status: 'Pending' },
  ]);

  // Autonomy settings state
  const [autonomyLevel, setAutonomyLevel] = React.useState<number>(3); // Default Level 3 (Guided Automation)
  const [emergencyPaused, setEmergencyPaused] = React.useState<boolean>(false);
  const [enforceManualAll, setEnforceManualAll] = React.useState<boolean>(false);
  const [brandColor, setBrandColor] = React.useState('#0A84FF');

  React.useEffect(() => {
    try {
      const draft = JSON.parse(localStorage.getItem('hq_onboarding_draft') || '{}');
      if (draft.brandColor) setBrandColor(draft.brandColor);
    } catch { /* ignore */ }
  }, []);

  // Approval rules policies state
  const [policies, setPolicies] = React.useState([
    { key: 'payments', label: 'Financial Payments & Credits Cost', requireApproval: true },
    { key: 'legal', label: 'Legal Policies & Contract Drafts', requireApproval: true },
    { key: 'pricing', label: 'Pricing modifications', requireApproval: true },
    { key: 'reports', label: 'Weekly Business Intelligence Reports', requireApproval: false },
    { key: 'indexing', label: 'Knowledge Base Indexing & Cleaning', requireApproval: false },
    { key: 'dashboard', label: 'KPI Dashboard & Telemetry Refreshes', requireApproval: false },
  ]);

  // Active autonomous workflows state
  const [workflows, setWorkflows] = React.useState<AutonomousWorkflow[]>([
    {
      id: 'wf-1',
      name: 'Weekly KPI Business Review',
      status: 'Active',
      trigger: 'Scheduled (Every Mon 08:00)',
      timeline: [
        { time: '08:00 AM', event: 'Weekly business review triggered by scheduler.' },
        { time: '08:01 AM', event: 'CEO Elena evaluated organizational twin performance scores.' },
        { time: '08:03 AM', event: 'COS Arthur compiled the WBS execution task graph.' },
        { time: '08:05 AM', event: 'CFO Sophia completed cost ledger margin audit.' },
      ]
    },
    {
      id: 'wf-2',
      name: 'Memory Footprint Cleanup',
      status: 'Completed',
      trigger: 'Triggered (Total memories > 100)',
      timeline: [
        { time: '02:00 PM', event: 'Cleanup triggered. Stored memory items count: 120.' },
        { time: '02:01 PM', event: 'Review Cycle optimized: merged 14 duplicates, flagged 2 conflicts.' },
        { time: '02:02 PM', event: 'Active memory size decayed and normalized.' },
      ]
    }
  ]);

  const [monthlyCap, setMonthlyCap] = React.useState('500.00');
  const [warningThreshold, setWarningThreshold] = React.useState('80');
  const [mfaEnforced, setMfaEnforced] = React.useState(true);
  const [showSaveSuccess, setShowSaveSuccess] = React.useState(false);
  const [expandedWorkflowId, setExpandedWorkflowId] = React.useState<string | null>('wf-1');

  const toggleModel = (id: string) => {
    setModels((prev) => prev.map((m) => (m.id === id ? { ...m, enabled: !m.enabled } : m)));
  };

  const handleAction = (id: string, action: 'Approved' | 'Rejected') => {
    setRequests((prev) => prev.filter((r) => r.id !== id));
    toast.success(`Integration request has been ${action.toLowerCase()}`);
  };

  const handleSaveConfigs = () => {
    setShowSaveSuccess(true);
    toast.success('✨ Compliance & Autonomous policies saved successfully');
    setTimeout(() => setShowSaveSuccess(false), 2000);
  };

  const togglePolicy = (key: string) => {
    setPolicies(prev => prev.map(p => p.key === key ? { ...p, requireApproval: !p.requireApproval } : p));
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
      <div className="flex items-center justify-between border-b border-card-border pb-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#1A1A1E] dark:text-white flex items-center gap-2">
            <ShieldCheck className="h-8 w-8 text-hq-blue" />
            Compliance & Governance
          </h1>
          <p className="text-foreground/60 text-sm mt-1">
            Set organization-wide AI bounds, spending ceilings, MFA rules, and configure autonomous execution levels.
          </p>
        </div>
        {emergencyPaused && (
          <Badge variant="error" className="animate-pulse py-1 px-3 text-[10px] font-black uppercase">
            🚨 Emergency Stop Active
          </Badge>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Side: Configurations */}
        <div className="lg:col-span-2 space-y-6">

          {/* ─── Autonomous Intelligence Level Selector ──────────────────────── */}
          <Card className="border border-card-border bg-card-bg p-5 shadow-[var(--card-shadow)] text-left space-y-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-sm font-extrabold text-[#1A1A1E] dark:text-white">
                <Sliders className="h-4.5 w-4.5 text-hq-cyan" />
                Autonomy Level Configuration
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
                    className={`p-3 rounded-xl border text-left transition-all ${
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

          {/* ─── Emergency Controls ─────────────────────────────────────────── */}
          <Card className="border border-red-500/20 bg-red-500/5 p-5 shadow-[var(--card-shadow)] text-left space-y-4">
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
                className={`text-[10.5px] font-bold h-8.5 gap-1.5 ${
                  emergencyPaused ? '' : 'bg-red-500/10 text-red-500 border-red-500/30 hover:bg-red-500/20'
                }`}
                onClick={handleEmergencyStop}
              >
                <Pause className="h-3.5 w-3.5 fill-current" />
                {emergencyPaused ? 'Lift Emergency Stop' : 'Emergency Stop: Pause All'}
              </Button>

              <Button
                variant="outline"
                className={`text-[10.5px] font-bold h-8.5 border-card-border ${
                  enforceManualAll ? 'bg-amber-500/10 text-amber-500 border-amber-500/30' : ''
                }`}
                onClick={() => setEnforceManualAll(!enforceManualAll)}
              >
                <ShieldAlert className="h-3.5 w-3.5 mr-1" />
                {enforceManualAll ? '100% Manual Approvals Active' : 'Force 100% Manual Approvals'}
              </Button>
            </div>
          </Card>

          {/* ─── Auto-Execution Approval Policies ─────────────────────────── */}
          <Card className="border border-card-border bg-card-bg p-5 shadow-[var(--card-shadow)] text-left space-y-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-sm font-extrabold text-[#1A1A1E] dark:text-white">
                <ShieldCheck className="h-4.5 w-4.5 text-hq-purple" />
                Action Approval Policies
              </CardTitle>
              <CardDescription className="text-[10px] font-semibold mt-0.5">
                Configure which operations require human owner authorization bounds.
              </CardDescription>
            </div>

            <div className="space-y-2">
              {policies.map(p => (
                <div
                  key={p.key}
                  className="flex items-center justify-between p-3 rounded-lg border border-card-border bg-[#F9F9FB] dark:bg-[#0A0A0C]/20 text-xs"
                >
                  <div>
                    <span className="font-extrabold text-[#1A1A1E] dark:text-white">{p.label}</span>
                    <p className="text-[9px] text-foreground/45 font-semibold mt-0.5">
                      {p.requireApproval || enforceManualAll
                        ? 'Requires manual sign-off gate before execution'
                        : 'Executes autonomously in guided background streams'}
                    </p>
                  </div>

                  <button
                    onClick={() => togglePolicy(p.key)}
                    disabled={enforceManualAll}
                    className={`text-[10px] px-2.5 py-1 rounded font-black uppercase transition-all ${
                      p.requireApproval || enforceManualAll
                        ? 'bg-amber-500/15 text-amber-500 border border-amber-500/20'
                        : 'bg-green-500/15 text-green-500 border border-green-500/20'
                    }`}
                  >
                    {p.requireApproval || enforceManualAll ? 'Require Approval' : 'Auto Execute'}
                  </button>
                </div>
              ))}
            </div>
          </Card>

          {/* AI Model Whitelist */}
          <Card className="border border-card-border bg-card-bg p-5 shadow-[var(--card-shadow)] text-left">
            <CardHeader className="p-0 pb-4">
              <CardTitle className="flex items-center gap-2 text-sm font-extrabold text-[#1A1A1E] dark:text-white">
                <Cpu className="h-4.5 w-4.5 text-hq-cyan" />
                AI Model Whitelist
              </CardTitle>
              <CardDescription className="text-[10px] font-semibold mt-0.5">
                Enable or restrict approved models. C-Suite routing redirects query loads accordingly.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 space-y-3">
              {models.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between p-3 border border-card-border bg-[#F9F9FB] dark:bg-[#0A0A0C]/20 rounded-lg text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-[#1A1A1E] dark:text-white">{m.name}</span>
                      <span className="text-[9px] text-foreground/45 font-semibold">by {m.provider}</span>
                    </div>
                    <p className="text-[9px] text-foreground/50 mt-0.5 font-semibold">
                      Routing priority:{' '}
                      {m.tier === 'Premium' ? 'High-Performance' : 'Standard Failover'}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge
                      variant={m.tier === 'Premium' ? 'premium' : 'neutral'}
                      className="text-[9px] font-bold"
                    >
                      {m.tier}
                    </Badge>
                    <button
                      onClick={() => toggleModel(m.id)}
                      className={`text-[10px] px-2.5 py-1 rounded font-black uppercase transition-colors ${
                        m.enabled
                          ? 'bg-hq-cyan/20 text-hq-cyan hover:bg-hq-cyan/30'
                          : 'bg-[#F9F9FB] dark:bg-[#0A0A0C] border border-card-border text-foreground/45 hover:bg-foreground/5'
                      }`}
                    >
                      {m.enabled ? 'Enabled' : 'Restricted'}
                    </button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Budget Ceilings */}
          <Card className="border border-card-border bg-card-bg p-5 shadow-[var(--card-shadow)] text-left">
            <CardHeader className="p-0 pb-4">
              <CardTitle className="flex items-center gap-2 text-sm font-extrabold text-[#1A1A1E] dark:text-white">
                <DollarSign className="h-4.5 w-4.5 text-hq-blue" />
                Tenant Budget Ceilings
              </CardTitle>
              <CardDescription className="text-[10px] font-semibold mt-0.5">Define monthly token spending bounds</CardDescription>
            </CardHeader>
            <CardContent className="p-0 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5 text-xs">
                  <label className="font-semibold text-foreground/75">Monthly Budget Cap ($)</label>
                  <Input
                    type="number"
                    value={monthlyCap}
                    onChange={(e) => setMonthlyCap(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5 text-xs">
                  <label className="font-semibold text-foreground/75">Warning Threshold (%)</label>
                  <Input
                    type="number"
                    value={warningThreshold}
                    onChange={(e) => setWarningThreshold(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="p-0 pt-4 border-t border-card-border mt-4 flex justify-end bg-card-bg">
              <div className="flex items-center gap-3">
                {showSaveSuccess && (
                  <div className="flex items-center gap-1.5 text-hq-cyan font-bold text-xs animate-pulse">
                    <CheckCircle className="h-4 w-4" />
                    <span>Governance updated!</span>
                  </div>
                )}
                <Button
                  onClick={handleSaveConfigs}
                  size="sm"
                  className="text-white text-xs font-bold h-8.5 gap-1.5"
                  style={{ backgroundColor: brandColor }}
                >
                  <Save className="h-4 w-4" />
                  Save Configurations
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>

        {/* Right Side: Active Workflows & Handoff Timelines */}
        <div className="space-y-6">

          {/* ─── Active Autonomous Workflows & Timeline ────────────────────── */}
          <Card className="border border-card-border bg-card-bg p-5 shadow-[var(--card-shadow)] text-left space-y-4">
            <div>
              <CardTitle className="text-xs font-extrabold text-[#1A1A1E] dark:text-white flex items-center gap-2">
                <Activity className="h-4 w-4 text-hq-cyan" />
                Active Autonomous Workflows
              </CardTitle>
              <CardDescription className="text-[9.5px] font-semibold mt-0.5">
                Executing background tasks orchestrated by the AI executive board.
              </CardDescription>
            </div>

            <div className="space-y-3">
              {workflows.map(wf => (
                <div key={wf.id} className="border border-card-border bg-[#F9F9FB] dark:bg-[#0A0A0C]/20 rounded-xl p-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-black text-[#1A1A1E] dark:text-white">{wf.name}</p>
                      <p className="text-[8px] text-foreground/45 font-bold uppercase tracking-wider mt-0.5">{wf.trigger}</p>
                    </div>
                    <Badge variant={wf.status === 'Completed' ? 'success' : 'ai'} className="text-[8px] font-black uppercase">
                      {wf.status}
                    </Badge>
                  </div>

                  {/* Expand Timeline toggle */}
                  <button
                    onClick={() => setExpandedWorkflowId(expandedWorkflowId === wf.id ? null : wf.id)}
                    className="text-[9.5px] text-hq-cyan font-bold flex items-center gap-1 hover:opacity-80 transition-all"
                  >
                    <History className="h-3 w-3" />
                    {expandedWorkflowId === wf.id ? 'Hide Handoff Timeline' : 'View Handoff Timeline'}
                  </button>

                  {expandedWorkflowId === wf.id && (
                    <div className="relative pl-3 border-l border-card-border space-y-2.5 pt-1 animate-in slide-in-from-top duration-300">
                      {wf.timeline.map((step, idx) => (
                        <div key={idx} className="relative text-[9.5px]">
                          <div className="absolute -left-[16.5px] top-1 h-1.5 w-1.5 rounded-full bg-hq-cyan" />
                          <span className="font-mono text-foreground/40 mr-1">{step.time}</span>
                          <span className="text-foreground/75 font-semibold">{step.event}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* Integration Approval Requests */}
          <Card className="border border-card-border bg-card-bg p-5 shadow-[var(--card-shadow)] text-left">
            <CardHeader className="p-0 pb-4">
              <CardTitle className="text-xs font-extrabold flex items-center gap-1.5 text-[#1A1A1E] dark:text-white">
                <ShieldAlert className="h-4.5 w-4.5 text-hq-cyan" />
                Integration Gatekeeper
              </CardTitle>
              <CardDescription className="text-[10px] font-semibold mt-0.5">Approve oauth connectors requests</CardDescription>
            </CardHeader>
            <CardContent className="p-0 text-xs">
              {requests.length === 0 ? (
                <p className="text-[10px] text-foreground/45 leading-normal">
                  No pending integration requests. Gatekeeper workspace is secure.
                </p>
              ) : (
                <div className="space-y-3">
                  {requests.map((req) => (
                    <div
                      key={req.id}
                      className="p-3 border border-card-border bg-[#F9F9FB] dark:bg-[#0A0A0C]/20 rounded-lg space-y-2"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold text-[#1A1A1E] dark:text-white leading-tight">{req.integration}</p>
                          <p className="text-[9px] text-foreground/45 mt-0.5 font-semibold">
                            By: {req.requestedBy} • {req.requestedAt}
                          </p>
                        </div>
                        <Badge variant="warning" className="text-[8px] py-0 font-bold">
                          {req.status}
                        </Badge>
                      </div>

                      <div className="flex gap-2 pt-1">
                        <Button
                          variant="ghost"
                          className="flex items-center gap-1 h-7.5 text-[10px] text-hq-cyan bg-hq-cyan/15 hover:bg-hq-cyan/35 px-2.5 w-1/2 font-bold"
                          onClick={() => handleAction(req.id, 'Approved')}
                        >
                          <PlusCircle className="h-3 w-3" />
                          Approve
                        </Button>
                        <Button
                          variant="ghost"
                          className="flex items-center gap-1 h-7.5 text-[10px] text-red-400 bg-red-500/15 hover:bg-red-500/35 px-2.5 w-1/2 font-bold"
                          onClick={() => handleAction(req.id, 'Rejected')}
                        >
                          <XCircle className="h-3 w-3" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* MFA Enforcement Audits */}
          <Card className="border border-card-border bg-card-bg p-5 shadow-[var(--card-shadow)] text-left">
            <CardHeader className="p-0 pb-4">
              <CardTitle className="text-xs font-extrabold flex items-center gap-1.5 text-[#1A1A1E] dark:text-white">
                <ShieldCheck className="h-4.5 w-4.5 text-hq-purple" />
                MFA Enforcements
              </CardTitle>
              <CardDescription className="text-[10px] font-semibold mt-0.5">Require secondary verifications</CardDescription>
            </CardHeader>
            <CardContent className="p-0 text-xs">
              <div className="flex items-center justify-between p-3 border border-card-border bg-[#F9F9FB] dark:bg-[#0A0A0C]/20 rounded-lg">
                <div>
                  <span className="font-extrabold text-[#1A1A1E] dark:text-white block">Enforce Organization MFA</span>
                  <span className="text-[9px] text-foreground/45 mt-0.5 block font-semibold">
                    Force users to enroll TOTP hardware/app keys
                  </span>
                </div>
                <button
                  onClick={() => setMfaEnforced(!mfaEnforced)}
                  className={`text-[10px] px-2.5 py-1 rounded font-black uppercase transition-colors ${
                    mfaEnforced
                      ? 'bg-hq-purple/20 text-hq-purple hover:bg-hq-purple/30'
                      : 'bg-[#F9F9FB] dark:bg-[#0A0A0C] border border-card-border text-foreground/45 hover:bg-foreground/5'
                  }`}
                >
                  {mfaEnforced ? 'Enforced' : 'Optional'}
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
