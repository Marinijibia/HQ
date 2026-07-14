'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Button, Badge } from '@hq/ui';
import {
  Activity,
  Zap,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  Sliders,
  Users,
  Search,
  Plus,
  Play,
  Pause,
  AlertTriangle,
  Layers,
  ArrowRight,
  TrendingUp,
  Brain,
  HardDrive,
  Database,
  Cpu,
  Globe,
  DollarSign,
  ShieldCheck,
  Server,
  UserCheck,
} from 'lucide-react';
import { useAuth } from '../../../../contexts/auth-context';
import { toast } from '../../../../components/toast';

interface ExecutiveStatus {
  id: string;
  name: string;
  role: string;
  status: 'Online' | 'Paused' | 'Active';
  queueLength: number;
  memoryUsageMb: number;
  successRate: number;
  latencyMs: number;
}

interface MissionStatus {
  id: string;
  name: string;
  status: 'Running' | 'Waiting' | 'Reviewing' | 'Blocked' | 'Completed' | 'Failed';
  priority: 'High' | 'Medium' | 'Low';
  department: string;
}

interface EocAlert {
  id: string;
  category: 'Security' | 'Compliance' | 'Billing' | 'AI' | 'Infrastructure';
  message: string;
  severity: 'Critical' | 'Warning' | 'Info';
  timestamp: string;
  acknowledged: boolean;
}

export default function OperationsCenterPage() {
  const { token } = useAuth();
  const [opsMode, setOpsMode] = React.useState<'org' | 'platform'>('org');
  const [brandColor, setBrandColor] = React.useState('#0A84FF');

  // Org Ops States
  const [executives, setExecutives] = React.useState<ExecutiveStatus[]>([
    { id: 'exec-1', name: 'Elena Rostova', role: 'CEO Executive', status: 'Active', queueLength: 2, memoryUsageMb: 24, successRate: 98, latencyMs: 1240 },
    { id: 'exec-2', name: 'Sophia Sterling', role: 'Finance Director', status: 'Online', queueLength: 0, memoryUsageMb: 12, successRate: 100, latencyMs: 650 },
    { id: 'exec-3', name: 'Alexander Carter', role: 'CTO Executive', status: 'Active', queueLength: 1, memoryUsageMb: 45, successRate: 94, latencyMs: 1100 },
    { id: 'exec-4', name: 'Marcus Vance', role: 'COO Executive', status: 'Paused', queueLength: 0, memoryUsageMb: 8, successRate: 96, latencyMs: 820 },
  ]);

  const [missions, setMissions] = React.useState<MissionStatus[]>([
    { id: 'mis-1', name: 'Weekly KPI Business Review', status: 'Running', priority: 'High', department: 'Operations' },
    { id: 'mis-2', name: 'Stripe Paygate Integration Integration', status: 'Completed', priority: 'High', department: 'Engineering' },
    { id: 'mis-3', name: 'Niger Corridors Logistics Budget Cap Shift', status: 'Blocked', priority: 'Medium', department: 'Finance' },
    { id: 'mis-4', name: 'Memory Footprint Cleanup Sync', status: 'Waiting', priority: 'Low', department: 'Infrastructure' },
  ]);

  const [alerts, setAlerts] = React.useState<EocAlert[]>([
    { id: 'alt-1', category: 'Security', message: 'New connection token handshake from unrecognized IP: 197.210.64.12', severity: 'Critical', timestamp: '5m ago', acknowledged: false },
    { id: 'alt-2', category: 'AI', message: 'OpenAI routing gateway latency exceeds 2500ms threshold', severity: 'Warning', timestamp: '12m ago', acknowledged: false },
    { id: 'alt-3', category: 'Billing', message: 'AI model budget usage has reached 80% of monthly allocation cap', severity: 'Warning', timestamp: '1h ago', acknowledged: false },
  ]);

  // Platform Ops States
  const [providerAvailability, setProviderAvailability] = React.useState([
    { name: 'Google Gemini Gateway', availability: 100, latency: 450, status: 'Healthy' },
    { name: 'OpenAI GPT Gateway', availability: 99.8, latency: 1150, status: 'Healthy' },
    { name: 'Anthropic Claude API', availability: 99.4, latency: 1850, status: 'Healthy' },
  ]);

  React.useEffect(() => {
    try {
      const draft = JSON.parse(localStorage.getItem('hq_onboarding_draft') || '{}');
      if (draft.brandColor) setBrandColor(draft.brandColor);
    } catch { /* ignore */ }
  }, []);

  const handleToggleExec = (id: string, current: 'Online' | 'Paused' | 'Active') => {
    const nextStatus = current === 'Paused' ? 'Online' : 'Paused';
    setExecutives(prev => prev.map(e => e.id === id ? { ...e, status: nextStatus } : e));
    toast.success(`Executive status updated: ${nextStatus}`);
  };

  const handleAcknowledgeAlert = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, acknowledged: true } : a));
    toast.info('Alert acknowledged');
  };

  return (
    <div className="space-y-8 select-none text-foreground pb-12">
      {/* Title */}
      <div className="flex flex-col space-y-3 md:flex-row md:items-center md:justify-between md:space-y-0 border-b border-card-border pb-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#1A1A1E] dark:text-white flex items-center gap-2">
            <Activity className="h-8 w-8 text-hq-blue" />
            Operations Center
          </h1>
          <p className="text-foreground/60 text-sm mt-1">
            Enterprise command center. Monitor AI processing pipelines, executive thread loads, provider latency, and central system events.
          </p>
        </div>

        {/* Dual Mode Switcher */}
        <div className="flex bg-[#F9F9FB] dark:bg-[#0A0A0C]/50 border border-card-border p-1 rounded-xl shrink-0">
          <button
            onClick={() => setOpsMode('org')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              opsMode === 'org' ? 'bg-[#0A84FF] text-white' : 'text-foreground/55 hover:text-foreground'
            }`}
          >
            Organization Ops
          </button>
          <button
            onClick={() => setOpsMode('platform')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              opsMode === 'platform' ? 'bg-[#0A84FF] text-white' : 'text-foreground/55 hover:text-foreground'
            }`}
          >
            Platform Ops
          </button>
        </div>
      </div>

      {/* Panels */}
      <div className="space-y-6">

        {/* ─── DUAL PANEL 1: ORGANIZATION OPERATIONS ───────────────────────── */}
        {opsMode === 'org' && (
          <div className="space-y-6 text-left">
            {/* Health Indicators */}
            <div className="grid gap-4 sm:grid-cols-4">
              <Card className="border border-card-border bg-card-bg p-4 flex items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] text-foreground/40 font-bold uppercase">Health Index</span>
                  <span className="text-2xl font-black text-green-500 block mt-1">94%</span>
                </div>
                <CheckCircle2 className="h-7 w-7 text-green-500" />
              </Card>

              <Card className="border border-card-border bg-card-bg p-4 flex items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] text-foreground/40 font-bold uppercase">Online Executives</span>
                  <span className="text-2xl font-black text-white block mt-1">
                    {executives.filter(e => e.status !== 'Paused').length} / {executives.length}
                  </span>
                </div>
                <Brain className="h-7 w-7 text-hq-cyan" />
              </Card>

              <Card className="border border-card-border bg-card-bg p-4 flex items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] text-foreground/40 font-bold uppercase">Running Missions</span>
                  <span className="text-2xl font-black text-white block mt-1">
                    {missions.filter(m => m.status === 'Running').length} active
                  </span>
                </div>
                <Sliders className="h-7 w-7 text-hq-purple" />
              </Card>

              <Card className="border border-card-border bg-card-bg p-4 flex items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] text-foreground/40 font-bold uppercase">Active alerts</span>
                  <span className="text-2xl font-black text-yellow-500 block mt-1">
                    {alerts.filter(a => !a.acknowledged).length} events
                  </span>
                </div>
                <AlertTriangle className="h-7 w-7 text-yellow-500" />
              </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              {/* Executive Grid */}
              <div className="lg:col-span-2 space-y-6">
                <Card className="border border-card-border bg-card-bg p-5 shadow-[var(--card-shadow)] space-y-4">
                  <CardTitle className="text-sm font-extrabold text-[#1A1A1E] dark:text-white flex items-center gap-2">
                    <Brain className="h-4.5 w-4.5 text-hq-cyan" />
                    Executive Operations Control
                  </CardTitle>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {executives.map(exec => (
                      <div key={exec.id} className="p-3.5 border border-card-border bg-[#F9F9FB] dark:bg-[#0A0A0C]/20 rounded-xl space-y-3.5 text-xs font-semibold">
                        <div className="flex justify-between items-baseline gap-2">
                          <div>
                            <span className="font-extrabold text-white block">{exec.name}</span>
                            <span className="text-[9.5px] text-foreground/50">{exec.role}</span>
                          </div>
                          <Badge variant={exec.status === 'Paused' ? 'neutral' : 'success'} className="text-[7.5px] font-black uppercase shrink-0">
                            {exec.status}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[9.5px] text-foreground/50 leading-relaxed pt-1.5 border-t border-card-border/40">
                          <p>Queue length: <span className="text-white">{exec.queueLength} tasks</span></p>
                          <p>Latency: <span className="text-white">{exec.latencyMs} ms</span></p>
                          <p>Memory: <span className="text-white">{exec.memoryUsageMb} MB</span></p>
                          <p>Success rate: <span className="text-green-500">{exec.successRate}%</span></p>
                        </div>

                        <div className="flex gap-1.5 pt-1">
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full text-[9px] border-card-border h-7 text-foreground/75"
                            onClick={() => handleToggleExec(exec.id, exec.status)}
                          >
                            {exec.status === 'Paused' ? <Play className="h-3 w-3 mr-1" /> : <Pause className="h-3 w-3 mr-1" />}
                            {exec.status === 'Paused' ? 'Resume Executive' : 'Pause Executive'}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Mission tracker */}
                <Card className="border border-card-border bg-card-bg p-5 shadow-[var(--card-shadow)] space-y-4">
                  <CardTitle className="text-sm font-extrabold text-[#1A1A1E] dark:text-white flex items-center gap-2">
                    <Sliders className="h-4.5 w-4.5 text-hq-purple" />
                    Mission Control Center Pipeline
                  </CardTitle>

                  <div className="space-y-2.5">
                    {missions.map(mis => (
                      <div key={mis.id} className="p-3 rounded-lg border border-card-border bg-[#F9F9FB] dark:bg-[#0A0A0C]/20 text-xs flex justify-between gap-4">
                        <div>
                          <span className="font-extrabold text-white block">{mis.name}</span>
                          <span className="text-[9.5px] text-foreground/45 mt-0.5">Department: {mis.department}</span>
                        </div>

                        <div className="flex gap-2 items-center shrink-0 self-center">
                          <Badge variant={mis.priority === 'High' ? 'error' : 'neutral'} className="text-[7.5px] uppercase font-bold">
                            {mis.priority} Priority
                          </Badge>
                          <Badge variant={mis.status === 'Completed' ? 'success' : mis.status === 'Blocked' ? 'error' : 'neutral'} className="text-[8px] font-bold uppercase">
                            {mis.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              {/* Alert Center */}
              <div className="space-y-6">
                <Card className="border border-card-border bg-card-bg p-5 shadow-[var(--card-shadow)] space-y-4">
                  <h4 className="text-xs font-black text-[#1A1A1E] dark:text-white uppercase tracking-widest flex items-center gap-1.5">
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    Real-time Alert Center
                  </h4>

                  <div className="space-y-3">
                    {alerts.filter(a => !a.acknowledged).map(alt => (
                      <div key={alt.id} className="p-3 border border-card-border bg-[#F9F9FB] dark:bg-[#0A0A0C]/25 rounded-lg space-y-2 text-xs">
                        <div className="flex justify-between items-baseline gap-2">
                          <span className="font-extrabold text-white uppercase tracking-wider text-[8px]">{alt.category}</span>
                          <Badge variant={alt.severity === 'Critical' ? 'error' : 'warning'} className="text-[7px] uppercase font-bold">
                            {alt.severity}
                          </Badge>
                        </div>
                        <p className="text-[10.5px] font-semibold text-foreground/85 leading-relaxed">{alt.message}</p>
                        <div className="flex justify-between items-center text-[9px] pt-1 font-bold text-foreground/40 border-t border-card-border/30">
                          <span>{alt.timestamp}</span>
                          <button onClick={() => handleAcknowledgeAlert(alt.id)} className="text-hq-cyan hover:text-hq-cyan-hover">
                            Acknowledge
                          </button>
                        </div>
                      </div>
                    ))}
                    {alerts.filter(a => !a.acknowledged).length === 0 && (
                      <div className="py-6 text-center text-xs text-foreground/45 border border-dashed border-card-border rounded-xl">
                        No active unacknowledged alerts.
                      </div>
                    )}
                  </div>
                </Card>

                {/* Cost tracker */}
                <Card className="border border-card-border bg-card-bg p-5 shadow-[var(--card-shadow)] space-y-4">
                  <h4 className="text-xs font-black text-[#1A1A1E] dark:text-white uppercase tracking-widest flex items-center gap-1.5">
                    <DollarSign className="h-4 w-4 text-[#30D158]" />
                    Budget Utilization
                  </h4>

                  <div className="space-y-4 text-xs font-semibold">
                    <div>
                      <div className="flex justify-between items-baseline">
                        <span>AI API Token cost</span>
                        <span className="text-white">$380 / $500 monthly limit</span>
                      </div>
                      <div className="h-2 w-full bg-[#F9F9FB] dark:bg-[#0A0A0C] rounded-full overflow-hidden mt-1.5">
                        <div className="h-full bg-yellow-500 rounded-full transition-all" style={{ width: '76%' }}></div>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        )}

        {/* ─── DUAL PANEL 2: PLATFORM OPERATIONS ───────────────────────────── */}
        {opsMode === 'platform' && (
          <div className="grid gap-6 md:grid-cols-3 text-left">
            <div className="md:col-span-2 space-y-6">
              {/* Tenant health */}
              <Card className="border border-card-border bg-card-bg p-5 shadow-[var(--card-shadow)] space-y-4">
                <div>
                  <h3 className="text-sm font-extrabold text-[#1A1A1E] dark:text-white">Global SaaS Tenant Telemetry</h3>
                  <p className="text-[10px] text-foreground/50 font-semibold mt-0.5">Monitoring global resource footprints and deployment nodes.</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 text-xs font-semibold">
                  <div className="p-3 border border-card-border bg-[#F9F9FB] dark:bg-[#0A0A0C]/20 rounded-lg">
                    <span className="text-[10px] text-foreground/45 uppercase tracking-widest">Active Tenants Provisioned</span>
                    <span className="text-xl font-black text-white block mt-1">1,240 organizations</span>
                  </div>
                  <div className="p-3 border border-card-border bg-[#F9F9FB] dark:bg-[#0A0A0C]/20 rounded-lg">
                    <span className="text-[10px] text-foreground/45 uppercase tracking-widest">Platform Request Throughput</span>
                    <span className="text-xl font-black text-white block mt-1">8,420 rpm</span>
                  </div>
                </div>
              </Card>

              {/* Provider availability metrics */}
              <Card className="border border-card-border bg-card-bg p-5 shadow-[var(--card-shadow)] space-y-4">
                <CardTitle className="text-sm font-extrabold text-[#1A1A1E] dark:text-white">AI Provider Latency Rates</CardTitle>

                <div className="space-y-3 text-xs">
                  {providerAvailability.map((prov, idx) => (
                    <div key={idx} className="p-3 rounded-lg border border-card-border bg-[#F9F9FB] dark:bg-[#0A0A0C]/20 flex justify-between gap-4">
                      <div>
                        <span className="font-extrabold text-white block">{prov.name}</span>
                        <span className="text-[9.5px] text-foreground/50">Availability: {prov.availability}% · Status: {prov.status}</span>
                      </div>
                      <div className="text-right shrink-0 self-center">
                        <span className="font-extrabold text-hq-cyan">{prov.latency} ms</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Platform limits */}
            <div className="space-y-6">
              <Card className="border border-card-border bg-card-bg p-5 shadow-[var(--card-shadow)] space-y-4">
                <h4 className="text-xs font-black text-[#1A1A1E] dark:text-white uppercase tracking-widest flex items-center gap-1.5">
                  <Globe className="h-4 w-4 text-hq-purple" />
                  Regional Deployments
                </h4>
                <p className="text-[10px] text-foreground/50 leading-relaxed font-semibold">
                  Platform routing clusters are active across US-East, EU-Central, and AP-South. All data residency policies are synchronized.
                </p>

                <div className="border-t border-card-border pt-3 space-y-2 text-[10px] font-bold text-foreground/50">
                  <div className="flex justify-between">
                    <span>Edge Caching Nodes</span>
                    <span className="text-green-500">12 online</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cluster Sync Status</span>
                    <span className="text-white">Success</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
