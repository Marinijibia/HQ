'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Badge, Button } from '@hq/ui';
import {
  Terminal,
  Zap,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  Filter,
  ChevronDown,
  ChevronRight,
  Brain,
  Cpu,
  Network,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../../../contexts/auth-context';

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
}

const SEED_TRACES: AgentTrace[] = [
  {
    id: 'tr-001', agentName: 'CEO Agent', agentRole: 'Strategic Orchestration', action: 'Decompose mission into DAG task hierarchy',
    model: 'gemini-2.5-pro', inputTokens: 1842, outputTokens: 743, latencyMs: 1240, status: 'SUCCESS',
    missionId: 'mission-q3', timestamp: new Date(Date.now() - 120000).toISOString(),
    reasoning: 'Mission objective parsed. Identified 4 parallel workstreams: market analysis, budget review, legal clearance, tech feasibility.',
    toolsUsed: ['mission_decompose', 'agent_router', 'dag_builder'],
  },
  {
    id: 'tr-002', agentName: 'CMO Agent', agentRole: 'Marketing Intelligence', action: 'Draft Q3 campaign positioning brief',
    model: 'gemini-2.5-flash', inputTokens: 2310, outputTokens: 1102, latencyMs: 890, status: 'SUCCESS',
    missionId: 'mission-q3', parentTraceId: 'tr-001', timestamp: new Date(Date.now() - 95000).toISOString(),
    reasoning: 'Analysed brand voice, target segment, and competitor landscape. Drafted 3 positioning options.',
    toolsUsed: ['brand_context_loader', 'asset_reader', 'draft_generator'],
  },
  {
    id: 'tr-003', agentName: 'CFO Agent', agentRole: 'Financial Governance', action: 'Validate budget allocation thresholds',
    model: 'gemini-2.5-pro', inputTokens: 980, outputTokens: 412, latencyMs: 650, status: 'SUCCESS',
    missionId: 'mission-q3', parentTraceId: 'tr-001', timestamp: new Date(Date.now() - 80000).toISOString(),
    reasoning: 'Budget ceiling confirmed at $250K. Flagged 2 line items exceeding departmental caps.',
    toolsUsed: ['budget_validator', 'compliance_check'],
  },
  {
    id: 'tr-004', agentName: 'CTO Agent', agentRole: 'Technical Feasibility', action: 'Evaluate API integration requirements',
    model: 'gemini-2.5-flash', inputTokens: 1560, outputTokens: 830, latencyMs: 1100, status: 'RUNNING',
    missionId: 'mission-q3', parentTraceId: 'tr-001', timestamp: new Date(Date.now() - 45000).toISOString(),
    reasoning: 'Currently scanning system architecture for integration blockers...',
    toolsUsed: ['schema_reader', 'api_validator'],
  },
  {
    id: 'tr-005', agentName: 'Legal Agent', agentRole: 'Compliance & Risk', action: 'Pre-flight prompt injection sanitization',
    model: 'gemini-2.5-flash', inputTokens: 340, outputTokens: 95, latencyMs: 210, status: 'SUCCESS',
    missionId: 'mission-q3', timestamp: new Date(Date.now() - 180000).toISOString(),
    reasoning: 'All inputs sanitized. Zero injection vectors detected. RBAC roles verified.',
    toolsUsed: ['prompt_sanitizer', 'rbac_check'],
  },
  {
    id: 'tr-006', agentName: 'CEO Agent', agentRole: 'Strategic Orchestration', action: 'Compile executive board briefing',
    model: 'gemini-2.5-pro', inputTokens: 3200, outputTokens: 1840, latencyMs: 2100, status: 'QUEUED',
    missionId: 'mission-q3', timestamp: new Date(Date.now() - 10000).toISOString(),
    reasoning: 'Awaiting CTO feasibility report before compiling final briefing.',
    toolsUsed: [],
  },
];

const STATUS_CONFIG = {
  SUCCESS: { icon: CheckCircle2, color: '#22C55E', label: 'Success', bg: 'bg-green-500/10 border-green-500/20 text-green-500' },
  ERROR: { icon: XCircle, color: '#EF4444', label: 'Error', bg: 'bg-red-500/10 border-red-500/20 text-red-500' },
  RUNNING: { icon: RefreshCw, color: '#0A84FF', label: 'Running', bg: 'bg-hq-blue/10 border-hq-blue/20 text-hq-blue' },
  QUEUED: { icon: Clock, color: '#F59E0B', label: 'Queued', bg: 'bg-amber-500/10 border-amber-500/20 text-amber-500' },
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  return `${Math.floor(m / 60)}h ago`;
}

export default function ExecutionLogPage() {
  const { token } = useAuth();
  const [traces, setTraces] = React.useState<AgentTrace[]>(SEED_TRACES);
  const [expanded, setExpanded] = React.useState<string | null>(null);
  const [filter, setFilter] = React.useState<'ALL' | 'SUCCESS' | 'RUNNING' | 'ERROR' | 'QUEUED'>('ALL');
  const [loading, setLoading] = React.useState(false);

  // Fetch real traces from API
  React.useEffect(() => {
    if (!token) return;
    setLoading(true);
    fetch('/api/analytics/traces', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (Array.isArray(data) && data.length > 0) setTraces(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  const filtered = filter === 'ALL' ? traces : traces.filter(t => t.status === filter);

  const totalTokens = traces.reduce((s, t) => s + t.inputTokens + t.outputTokens, 0);
  const avgLatency = Math.round(traces.reduce((s, t) => s + t.latencyMs, 0) / traces.length);
  const successRate = Math.round((traces.filter(t => t.status === 'SUCCESS').length / traces.length) * 100);

  return (
    <div className="space-y-8 select-none text-foreground pb-12">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#1A1A1E] dark:text-white flex items-center gap-2">
            <Terminal className="h-8 w-8 text-hq-blue" />
            AI Execution Log
          </h1>
          <p className="text-foreground/60 text-sm mt-1">
            Live trace of every agent call, tool invocation, and reasoning step.
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setLoading(true)}
          className="text-xs font-bold gap-1.5 border border-card-border"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats row */}
      <div className="grid gap-4 sm:grid-cols-4">
        {[
          { icon: Zap, label: 'Total Agent Calls', value: traces.length, color: '#0A84FF' },
          { icon: Brain, label: 'Tokens Consumed', value: totalTokens.toLocaleString(), color: '#BF5AF2' },
          { icon: Cpu, label: 'Avg Latency', value: `${avgLatency}ms`, color: '#F59E0B' },
          { icon: ShieldCheck, label: 'Success Rate', value: `${successRate}%`, color: '#22C55E' },
        ].map(s => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className="border border-card-border bg-card-bg shadow-[var(--card-shadow)] p-4 flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${s.color}15` }}>
                <Icon className="h-5 w-5" style={{ color: s.color }} />
              </div>
              <div>
                <p className="text-xs text-foreground/50 font-semibold">{s.label}</p>
                <p className="text-xl font-extrabold text-[#1A1A1E] dark:text-white">{s.value}</p>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        {(['ALL', 'SUCCESS', 'RUNNING', 'ERROR', 'QUEUED'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${
              filter === f
                ? 'bg-hq-blue/10 border-hq-blue/30 text-hq-blue'
                : 'bg-card-bg border-card-border text-foreground/50 hover:text-foreground/80'
            }`}
          >
            <Filter className="h-2.5 w-2.5 inline mr-1" />
            {f} {f !== 'ALL' && `(${traces.filter(t => t.status === f).length})`}
          </button>
        ))}
      </div>

      {/* Trace list */}
      <Card className="border border-card-border bg-card-bg shadow-[var(--card-shadow)]">
        <CardHeader className="border-b border-card-border pb-4">
          <CardTitle className="text-sm font-extrabold text-[#1A1A1E] dark:text-white flex items-center gap-2">
            <Network className="h-4 w-4 text-hq-blue" />
            Agent Call Trace
          </CardTitle>
          <CardDescription className="text-xs">Ordered by most recent. Click any row to expand reasoning.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-card-border">
            {filtered.map(trace => {
              const statusCfg = STATUS_CONFIG[trace.status];
              const StatusIcon = statusCfg.icon;
              const isExpanded = expanded === trace.id;

              return (
                <div key={trace.id}>
                  <button
                    onClick={() => setExpanded(isExpanded ? null : trace.id)}
                    className="w-full text-left px-5 py-4 hover:bg-foreground/4 transition-colors flex items-start gap-4"
                  >
                    {/* Status icon */}
                    <StatusIcon
                      className={`h-4 w-4 mt-0.5 shrink-0 ${trace.status === 'RUNNING' ? 'animate-spin' : ''}`}
                      style={{ color: statusCfg.color }}
                    />

                    {/* Main content */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-extrabold text-[#1A1A1E] dark:text-white">{trace.agentName}</span>
                        <span className="text-[9px] text-foreground/40 font-semibold">·</span>
                        <span className="text-[10px] text-foreground/60 font-semibold">{trace.action}</span>
                      </div>
                      <div className="flex items-center gap-3 flex-wrap text-[9px] text-foreground/40 font-semibold">
                        <span className="font-mono bg-foreground/5 px-1.5 py-0.5 rounded">{trace.model}</span>
                        <span>{trace.inputTokens + trace.outputTokens} tokens</span>
                        <span>{trace.latencyMs}ms</span>
                        <span>{timeAgo(trace.timestamp)}</span>
                        {trace.toolsUsed && trace.toolsUsed.length > 0 && (
                          <span>{trace.toolsUsed.length} tool{trace.toolsUsed.length !== 1 ? 's' : ''}</span>
                        )}
                      </div>
                    </div>

                    {/* Status badge + expand */}
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${statusCfg.bg}`}>
                        {statusCfg.label}
                      </span>
                      {isExpanded ? (
                        <ChevronDown className="h-3.5 w-3.5 text-foreground/40" />
                      ) : (
                        <ChevronRight className="h-3.5 w-3.5 text-foreground/40" />
                      )}
                    </div>
                  </button>

                  {/* Expanded reasoning panel */}
                  {isExpanded && (
                    <div className="px-5 pb-4 space-y-3 bg-foreground/4 border-t border-card-border animate-in fade-in duration-200">
                      {trace.reasoning && (
                        <div className="pt-3 space-y-1.5">
                          <p className="text-[9px] uppercase tracking-widest text-foreground/40 font-bold">Agent Reasoning</p>
                          <p className="text-[11px] text-foreground/75 font-medium leading-relaxed font-mono bg-black/5 dark:bg-white/5 rounded-lg p-3 border border-card-border">
                            {trace.reasoning}
                          </p>
                        </div>
                      )}
                      {trace.toolsUsed && trace.toolsUsed.length > 0 && (
                        <div className="space-y-1.5">
                          <p className="text-[9px] uppercase tracking-widest text-foreground/40 font-bold">Tools Invoked</p>
                          <div className="flex flex-wrap gap-1.5">
                            {trace.toolsUsed.map(t => (
                              <span key={t} className="text-[9px] font-bold font-mono px-2 py-1 rounded bg-hq-blue/5 border border-hq-blue/15 text-hq-blue">
                                {t}()
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="flex gap-4 text-[9px] text-foreground/40 font-semibold pt-1">
                        <span>Trace ID: <span className="font-mono text-foreground/60">{trace.id}</span></span>
                        {trace.parentTraceId && <span>Parent: <span className="font-mono text-foreground/60">{trace.parentTraceId}</span></span>}
                        {trace.missionId && <span>Mission: <span className="font-mono text-foreground/60">{trace.missionId}</span></span>}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
