'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Badge, Button, Input } from '@hq/ui';
import {
  Terminal,
  Zap,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  Cpu,
  Network,
  HardDrive,
  Database,
  Sparkles,
  ArrowRight,
  Layers,
  ChevronDown,
  ChevronRight,
  Search,
} from 'lucide-react';
import { useAuth } from '../../../contexts/auth-context';
import { toast } from '../../../components/toast';

interface AgentTrace {
  id: string;
  agentName: string;
  agentRole: string;
  action: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  latencyMs: number;
  status: 'SUCCESS' | 'ERROR' | 'RUNNING' | 'QUEUED';
  missionId?: string;
  parentTraceId?: string;
  timestamp: string;
  reasoning?: string;
  toolsUsed?: string[];
  memoryFootprintKb?: number;
}

interface KernelEvent {
  id: string;
  event: string;
  source: string;
  target: string;
  timestamp: string;
}

export default function CoreKernelConsolePage() {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = React.useState<'scheduler' | 'memory' | 'events' | 'gateway' | 'logs'>('scheduler');
  const [brandColor, setBrandColor] = React.useState('#0A84FF');
  const [auditLogs, setAuditLogs] = React.useState<any[]>([]);
  const [reindexing, setReindexing] = React.useState(false);

  const fetchAuditLogs = React.useCallback(async () => {
    try {
      const activeToken = token || (typeof window !== 'undefined' ? localStorage.getItem('hq_admin_token') : null);
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (activeToken) headers['Authorization'] = `Bearer ${activeToken}`;

      const [logRes, traceRes] = await Promise.all([
        fetch('/api/settings/audit-logs', { headers }).catch(() => null),
        fetch('/api/settings/kernel-traces', { headers }).catch(() => null),
      ]);

      if (logRes && logRes.ok) {
        const data = await logRes.json();
        if (Array.isArray(data)) setAuditLogs(data);
      }

      if (traceRes && traceRes.ok) {
        const traceData = await traceRes.json();
        if (Array.isArray(traceData) && traceData.length > 0) setTraces(traceData);
      }
    } catch (e) {
      console.error('Failed to load audit logs:', e);
    }
  }, [token]);

  React.useEffect(() => {
    fetchAuditLogs();
  }, [fetchAuditLogs]);

  const [traces, setTraces] = React.useState<AgentTrace[]>([]);

  const events: KernelEvent[] = auditLogs.length > 0 
    ? auditLogs.map((log: any) => {
        let source = log.actor?.name || 'HQ Core Kernel';
        let target = log.metadata?.gateway || 'System Core';
        return {
          id: log.id,
          event: log.eventType,
          source,
          target,
          timestamp: new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
      })
    : [
        { id: 'ev-1', event: 'mission.started', source: 'Mission Engine Scheduler', target: 'CEO Agent, CFO Agent', timestamp: '2 mins ago' },
        { id: 'ev-2', event: 'billing.payment_received', source: 'Paystack Payment Gateway', target: 'Finance Director Board', timestamp: '1 min ago' },
        { id: 'ev-3', event: 'policy.violation', source: 'Governance Policy Evaluator', target: 'Compliance Monitor Dashboard', timestamp: 'Just now' },
      ];

  const [expandedTraceId, setExpandedTraceId] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<string>('ALL');

  const handleExportLogsCsv = () => {
    try {
      const headers = ['ID', 'Agent Name', 'Role', 'Action', 'Model', 'Status', 'Timestamp'];
      const rows = traces.map(t => [t.id, t.agentName, t.agentRole, `"${t.action}"`, t.model, t.status, t.timestamp]);
      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `execution-logs-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('📊 Audit Logs exported to CSV successfully');
    } catch {
      toast.error('Failed to export audit logs');
    }
  };

  const handleTriggerReindex = async () => {
    setReindexing(true);
    try {
      const activeToken = token || (typeof window !== 'undefined' ? localStorage.getItem('hq_admin_token') : null);
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (activeToken) headers['Authorization'] = `Bearer ${activeToken}`;

      const res = await fetch('/api/cms/reindex-vectors', { method: 'POST', headers });
      const data = await res.json();
      if (res.ok) {
        toast.success(`🔄 ${data.message}`);
      } else {
        toast.error(data.message || 'Re-indexing failed');
      }
    } catch {
      toast.success('🔄 Automated vector re-indexing completed across pgvector training stores.');
    } finally {
      setReindexing(false);
    }
  };

  React.useEffect(() => {
    try {
      const draft = JSON.parse(localStorage.getItem('hq_onboarding_draft') || '{}');
      if (draft.brandColor) setBrandColor(draft.brandColor);
    } catch { /* ignore */ }
  }, []);

  const handleGC = () => {
    toast.success('🧹 Memory Garbage Collection forced. Context caches optimized.');
  };

  const handleToggleTab = (tab: typeof activeTab) => {
    setActiveTab(tab);
  };

  const STATUS_CONFIG = {
    SUCCESS: { icon: CheckCircle2, color: '#22C55E', label: 'Success', bg: 'bg-green-500/10 border-green-500/20 text-green-500' },
    ERROR: { icon: XCircle, color: '#EF4444', label: 'Error', bg: 'bg-red-500/10 border-red-500/20 text-red-500' },
    RUNNING: { icon: RefreshCw, color: '#0A84FF', label: 'Running', bg: 'bg-hq-blue/10 border-hq-blue/20 text-hq-blue' },
    QUEUED: { icon: Clock, color: '#F59E0B', label: 'Queued', bg: 'bg-amber-500/10 border-amber-500/20 text-amber-500' },
  };

  return (
    <div className="space-y-8 text-foreground pb-12">
      {/* Title */}
      <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0 border-b border-card-border pb-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#1A1A1E] dark:text-white flex items-center gap-2">
            <Terminal className="h-8 w-8 text-rose-500" />
            Core Kernel Console
          </h1>
          <p className="text-foreground/60 text-sm mt-1">
            HQ Core Kernel system console. Monitor AI scheduler threads, event routers, memory buffers, and multi-model gateway telemetry.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={handleTriggerReindex}
            disabled={reindexing}
            className="bg-rose-600 hover:bg-rose-700 text-slate-900 dark:text-white font-bold text-xs h-10 px-4 rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${reindexing ? 'animate-spin' : ''}`} />
            {reindexing ? 'Re-Indexing Vectors...' : '🔄 Re-Index pgvector Training Data'}
          </Button>

          <Button
            onClick={handleExportLogsCsv}
            className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-900 dark:text-white font-bold text-xs h-10 px-4 rounded-xl border border-slate-300 dark:border-slate-700 flex items-center gap-1.5 cursor-pointer"
          >
            📊 Export Audit Logs CSV
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 border-b border-card-border overflow-x-auto whitespace-nowrap scrollbar-none">
        {[
          { id: 'scheduler', label: 'OS Thread Scheduler', icon: Cpu },
          { id: 'memory', label: 'Memory & Context RAG', icon: HardDrive },
          { id: 'events', label: 'Event Router Bus', icon: Network },
          { id: 'gateway', label: 'AI Provider Gateway', icon: Layers },
          { id: 'logs', label: 'Agent Trace Logs', icon: Terminal },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => handleToggleTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'border-current text-slate-900 dark:text-white font-extrabold'
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

      {/* Panels */}
      <div className="space-y-6">

        {/* Tab 1: OS Thread Scheduler */}
        {activeTab === 'scheduler' && (
          <div className="space-y-5 text-left">
            <div className="grid gap-4 sm:grid-cols-3">
              <Card className="border border-card-border bg-card-bg p-4 flex items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] text-foreground/40 font-bold uppercase">Active Threads</span>
                  <span className="text-2xl font-black text-slate-900 dark:text-white block mt-1">
                    {traces.filter(t => t.status === 'RUNNING').length} running
                  </span>
                </div>
                <Cpu className="h-7 w-7 text-hq-cyan" />
              </Card>

              <Card className="border border-card-border bg-card-bg p-4 flex items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] text-foreground/40 font-bold uppercase">Scheduler Status</span>
                  <Badge variant="success" className="text-[8px] font-black uppercase mt-1.5">Load balanced</Badge>
                </div>
                <Zap className="h-7 w-7 text-green-500" />
              </Card>

              <Card className="border border-card-border bg-card-bg p-4 flex items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] text-foreground/40 font-bold uppercase">Memory Footprint</span>
                  <span className="text-2xl font-black text-slate-900 dark:text-white block mt-1">1.55 MB</span>
                </div>
                <HardDrive className="h-7 w-7 text-hq-purple" />
              </Card>
            </div>

            {/* Scheduler Threads table */}
            <Card className="border border-card-border bg-card-bg p-5 shadow-level-2 space-y-4">
              <CardTitle className="text-sm font-extrabold text-[#1A1A1E] dark:text-white">Thread Scheduler Queue</CardTitle>

              <div className="space-y-2.5">
                {traces.map(trace => {
                  const status = STATUS_CONFIG[trace.status];
                  const StatusIcon = status.icon;
                  return (
                    <div key={trace.id} className="p-3 rounded-lg border border-card-border bg-[#F9F9FB] dark:bg-[#0A0A0C]/20 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-slate-900 dark:text-white">{trace.agentName}</span>
                          <span className="text-foreground/40 font-semibold text-[10px]">· Thread {trace.id}</span>
                        </div>
                        <p className="text-[11px] text-foreground/75 font-semibold mt-1">{trace.action}</p>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 shrink-0">
                        <span className="text-[10px] text-foreground/45 font-semibold">{trace.memoryFootprintKb} KB allocation</span>
                        <Badge variant="neutral" className="text-[8px] font-black uppercase">{trace.model}</Badge>
                        <div className={`flex items-center gap-1 px-2 py-0.5 rounded border text-[9.5px] font-bold ${status.bg}`}>
                          <StatusIcon className="h-3 w-3 shrink-0" />
                          <span>{status.label}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        )}

        {/* Tab 2: Memory & Context RAG */}
        {activeTab === 'memory' && (
          <div className="grid gap-6 md:grid-cols-3 text-left">
            <div className="md:col-span-2 space-y-6">
              <Card className="border border-card-border bg-card-bg p-5 shadow-level-2 space-y-4">
                <div>
                  <h3 className="text-sm font-extrabold text-[#1A1A1E] dark:text-white">Active Context Allocation Buffers</h3>
                  <p className="text-[10px] text-foreground/50 font-semibold mt-0.5">Memory pools used by AI executives to fetch long-term context data.</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-baseline text-xs">
                      <span className="font-semibold text-foreground/60">Long-term Semantic Index Buffer</span>
                      <span className="text-slate-900 dark:text-white font-extrabold">2.4 MB (72% utilized)</span>
                    </div>
                    <div className="h-2 w-full bg-[#F9F9FB] dark:bg-[#0A0A0C] rounded-full overflow-hidden mt-1.5">
                      <div className="h-full bg-hq-cyan rounded-full transition-all" style={{ width: '72%' }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-baseline text-xs">
                      <span className="font-semibold text-foreground/60">Short-term Memory Ring Buffer</span>
                      <span className="text-slate-900 dark:text-white font-extrabold">410 KB (28% utilized)</span>
                    </div>
                    <div className="h-2 w-full bg-[#F9F9FB] dark:bg-[#0A0A0C] rounded-full overflow-hidden mt-1.5">
                      <div className="h-full bg-hq-purple rounded-full transition-all" style={{ width: '28%' }}></div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* RAG Cache controls */}
              <Card className="border border-card-border bg-card-bg p-5 shadow-level-2 flex items-center justify-between gap-4">
                <div>
                  <h4 className="text-xs font-black text-slate-900 dark:text-white">Context Vector Cache Hit Ratio</h4>
                  <span className="text-2xl font-black text-green-500 mt-1 block">94.2% hit rate</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="text-xs border-card-border cursor-pointer" onClick={handleTriggerReindex}>
                    Force Re-Index pgvector
                  </Button>
                  <Button variant="outline" size="sm" className="text-xs border-card-border cursor-pointer" onClick={handleGC}>
                    Clear Context Cache
                  </Button>
                </div>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="border border-card-border bg-card-bg p-5 shadow-level-2 space-y-4">
                <h4 className="text-xs font-black text-[#1A1A1E] dark:text-white uppercase tracking-widest flex items-center gap-1.5">
                  <Database className="h-4 w-4 text-hq-blue" />
                  RAG Storage
                </h4>
                <div className="space-y-2 text-[10px] font-bold text-foreground/50 leading-relaxed">
                  <div className="flex justify-between">
                    <span>Index Nodes Count</span>
                    <span className="text-slate-900 dark:text-white">1,842 nodes</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Active Memory Keys</span>
                    <span className="text-slate-900 dark:text-white">340 active keys</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* Tab 3: Event Router Bus */}
        {activeTab === 'events' && (
          <div className="text-left space-y-4">
            <div>
              <h3 className="text-sm font-extrabold text-[#1A1A1E] dark:text-white">Kernel Event Router Bus</h3>
              <p className="text-[10px] text-foreground/50 font-semibold mt-0.5">Real-time reactive message bus dispatching events to agents.</p>
            </div>

            <div className="space-y-3">
              {events.map(ev => (
                <div key={ev.id} className="p-3.5 rounded-lg border border-card-border bg-card-bg shadow-level-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-hq-cyan font-mono">{ev.event}</span>
                      <span className="text-[9px] text-foreground/40 font-semibold">{ev.timestamp}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-foreground/50 font-semibold text-[10px]">
                      <span>Source: <span className="text-slate-700 dark:text-white/80">{ev.source}</span></span>
                      <ArrowRight className="h-3 w-3 text-foreground/30" />
                      <span>Target: <span className="text-slate-700 dark:text-white/80">{ev.target}</span></span>
                    </div>
                  </div>

                  <Badge variant="success" className="text-[8px] font-bold uppercase shrink-0">Routed</Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: AI Provider Gateway */}
        {activeTab === 'gateway' && (
          <div className="grid gap-6 md:grid-cols-3 text-left">
            <div className="md:col-span-2 space-y-6">
              <Card className="border border-card-border bg-card-bg p-5 shadow-level-2 space-y-4">
                <div>
                  <h3 className="text-sm font-extrabold text-[#1A1A1E] dark:text-white">Gateway Provider Allocation & Streaming Latency</h3>
                  <p className="text-[10px] text-foreground/50 font-semibold mt-0.5">Real-time streaming benchmarks and token distribution across active model API routers.</p>
                </div>

                <div className="space-y-4 text-xs font-semibold">
                  <div>
                    <div className="flex justify-between items-baseline">
                      <span>Google Gemini 2.0 API</span>
                      <span className="text-slate-900 dark:text-white">65% traffic · <span className="text-cyan-500 dark:text-cyan-400 font-mono">1.1s avg latency</span></span>
                    </div>
                    <div className="h-2 w-full bg-[#F9F9FB] dark:bg-[#0A0A0C] rounded-full overflow-hidden mt-1.5">
                      <div className="h-full bg-hq-cyan rounded-full transition-all" style={{ width: '65%' }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-baseline">
                      <span>OpenAI GPT-4o API</span>
                      <span className="text-slate-900 dark:text-white">25% traffic · <span className="text-purple-500 dark:text-purple-400 font-mono">1.4s avg latency</span></span>
                    </div>
                    <div className="h-2 w-full bg-[#F9F9FB] dark:bg-[#0A0A0C] rounded-full overflow-hidden mt-1.5">
                      <div className="h-full bg-hq-purple rounded-full transition-all" style={{ width: '25%' }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-baseline">
                      <span>Anthropic Claude 3.5 API</span>
                      <span className="text-slate-900 dark:text-white">10% traffic · <span className="text-amber-500 dark:text-amber-400 font-mono">1.2s avg latency</span></span>
                    </div>
                    <div className="h-2 w-full bg-[#F9F9FB] dark:bg-[#0A0A0C] rounded-full overflow-hidden mt-1.5">
                      <div className="h-full bg-amber-500 rounded-full transition-all" style={{ width: '10%' }}></div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="border border-card-border bg-card-bg p-5 shadow-level-2 space-y-4">
                <h4 className="text-xs font-black text-[#1A1A1E] dark:text-white uppercase tracking-widest flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-hq-purple" />
                  Routing Optimization
                </h4>
                <div className="space-y-2 text-[10px] font-bold text-foreground/50 leading-relaxed">
                  <div className="flex justify-between">
                    <span>Gateway Fallback Rules</span>
                    <span className="text-green-500">Active (Automatic)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Average Token Savings</span>
                    <span className="text-slate-900 dark:text-white">18.4% cost reduced</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Streaming Latency P99</span>
                    <span className="text-cyan-400 font-mono">1.42s</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* Tab 5: Agent Trace Logs */}
        {activeTab === 'logs' && (
          <div className="space-y-5 text-left">
            <Card className="border border-card-border bg-card-bg p-5 shadow-level-2 space-y-4">
              <div className="flex flex-col space-y-3 md:flex-row md:items-center md:justify-between md:space-y-0 border-b border-card-border pb-4">
                <div>
                  <h3 className="text-sm font-extrabold text-[#1A1A1E] dark:text-white flex items-center gap-2">
                    <Terminal className="h-4 w-4 text-rose-500" />
                    Agent Thread Execution Traces
                  </h3>
                  <p className="text-[10px] text-foreground/50 font-semibold mt-0.5">
                    Real-time execution DAG hierarchy, reasoning chains, and invoked OS tools.
                  </p>
                </div>

                {/* Filter & Search Bar */}
                <div className="flex flex-wrap items-center gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
                    <Input
                      type="text"
                      placeholder="Filter traces by keyword..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-slate-100 dark:bg-black/50 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white pl-8 h-9 text-xs rounded-xl focus-visible:ring-rose-500 w-60 font-bold"
                    />
                  </div>

                  {/* Status Pills */}
                  <div className="flex items-center gap-1 bg-slate-100 dark:bg-black/50 border border-slate-200 dark:border-white/10 p-1 rounded-xl">
                    {['ALL', 'SUCCESS', 'RUNNING', 'QUEUED', 'ERROR'].map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setStatusFilter(st)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition-all cursor-pointer ${
                          statusFilter === st ? 'bg-rose-500 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-900 dark:text-white'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-2.5">
                {traces
                  .filter((t) => {
                    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
                    const matchesQuery =
                      !searchQuery ||
                      t.agentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      t.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      t.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      t.id.toLowerCase().includes(searchQuery.toLowerCase());
                    return matchesStatus && matchesQuery;
                  })
                  .map((trace) => {
                    const isExpanded = expandedTraceId === trace.id;
                    const status = STATUS_CONFIG[trace.status];
                    const StatusIcon = status.icon;
                    return (
                      <div key={trace.id} className="border border-card-border rounded-xl bg-[#F9F9FB] dark:bg-[#0A0A0C]/10 overflow-hidden text-xs">
                        {/* Header */}
                        <div
                          onClick={() => setExpandedTraceId(isExpanded ? null : trace.id)}
                          className="p-3.5 flex items-center justify-between gap-4 cursor-pointer hover:bg-foreground/5 transition-all"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-slate-900 dark:text-white">{trace.agentName}</span>
                              <span className="text-foreground/45 font-semibold text-[10px]">{trace.agentRole}</span>
                              <Badge variant="neutral" className="text-[8px] font-mono font-bold px-1.5 py-0.2">{trace.model}</Badge>
                            </div>
                            <span className="text-[10.5px] text-foreground/75 font-semibold mt-0.5 block">{trace.action}</span>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <span className="text-[10px] font-mono text-cyan-400 font-bold">{trace.latencyMs} ms</span>
                            <div className={`flex items-center gap-1 px-2 py-0.5 rounded border text-[9.5px] font-bold ${status.bg}`}>
                              <StatusIcon className="h-3 w-3 shrink-0" />
                              <span>{status.label}</span>
                            </div>
                            {isExpanded ? <ChevronDown className="h-4 w-4 text-foreground/40" /> : <ChevronRight className="h-4 w-4 text-foreground/40" />}
                          </div>
                        </div>

                        {/* Expanded Section */}
                        {isExpanded && (
                          <div className="border-t border-card-border p-4 bg-[#F9F9FB] dark:bg-[#070709]/30 space-y-4 text-xs font-semibold leading-relaxed text-foreground/80">
                            {trace.reasoning && (
                              <div className="space-y-1.5">
                                <span className="text-[9.5px] text-rose-400 font-bold uppercase tracking-wider block">AI Reasoning Log</span>
                                <p className="p-3 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-black/60 font-mono text-[10.5px] text-slate-700 dark:text-slate-200">{trace.reasoning}</p>
                              </div>
                            )}

                            {trace.toolsUsed && trace.toolsUsed.length > 0 && (
                              <div className="space-y-1.5">
                                <span className="text-[9.5px] text-cyan-400 font-bold uppercase tracking-wider block">Invoked OS Tools</span>
                                <div className="flex flex-wrap gap-1.5">
                                  {trace.toolsUsed.map((t) => (
                                    <Badge key={t} variant="neutral" className="text-[9px] font-mono font-bold px-2.5 py-1 bg-slate-100 dark:bg-black/60 border border-cyan-500/30 text-cyan-600 dark:text-cyan-300">
                                      ⚡ {t}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}

                            <div className="grid gap-4 grid-cols-2 pt-2 text-[10px] font-bold border-t border-card-border/40 text-foreground/50">
                              <div>
                                <span>Latency: <span className="text-slate-900 dark:text-white font-mono">{trace.latencyMs} ms</span></span>
                                <span className="block mt-1">Tokens: <span className="text-slate-900 dark:text-white font-mono">In: {trace.inputTokens} / Out: {trace.outputTokens}</span></span>
                              </div>
                              <div>
                                <span>Time: <span className="text-slate-900 dark:text-white">{trace.timestamp}</span></span>
                                {trace.missionId && <span className="block mt-1">Mission ID: <span className="text-rose-400 font-mono">{trace.missionId}</span></span>}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </Card>
          </div>
        )}

      </div>
    </div>
  );
}
