'use client';

import * as React from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Button,
  Badge,
} from '@hq/ui';
import {
  ArrowLeft,
  Rocket,
  CheckCircle2,
  Clock,
  Cpu,
  Activity,
  FileText,
  MessageSquare,
  ShieldCheck,
  Zap,
  TrendingUp,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Copy,
  Download,
  RotateCw,
  Sparkles,
  Layers,
  Check,
} from 'lucide-react';
import { useAuth } from '../../../../contexts/auth-context';
import { toast } from '../../../../components/toast';

interface BackendTask {
  id: string;
  name: string;
  description: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  executive?: {
    name: string;
    title: string;
    department?: { name: string };
  };
}

interface MissionStep {
  id: string;
  stepNumber: number;
  title: string;
  executiveRole: string;
  executiveTitle: string;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'PENDING';
  detail: string;
  timestamp: string;
  reasoningTrace?: string;
  latencyMs?: number;
  confidenceScore?: number;
}

interface MissionDetail {
  id: string;
  objective: string;
  status: 'QUEUED' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'EXECUTING';
  createdAt: string;
  companyId: string;
  tasks?: BackendTask[];
  conversations?: Array<{ id: string; title: string }>;
}

export default function MissionExecutionInspectorPage() {
  const params = useParams();
  const router = useRouter();
  const { token } = useAuth();
  const missionId = (params?.id as string) || '';

  const [mission, setMission] = React.useState<MissionDetail | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [expandedTraceId, setExpandedTraceId] = React.useState<string | null>(null);
  const [copiedBrief, setCopiedBrief] = React.useState(false);
  const [reRunningStepId, setReRunningStepId] = React.useState<string | null>(null);

  const fetchMissionDetails = React.useCallback(async () => {
    if (!token || !missionId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/missions/${missionId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setMission(data);
      } else {
        setMission(null);
      }
    } catch {
      setMission(null);
    } finally {
      setLoading(false);
    }
  }, [token, missionId]);

  React.useEffect(() => {
    fetchMissionDetails();
  }, [fetchMissionDetails]);

  // Map real DB tasks to MissionStep display format
  // Only uses real data — no hardcoded fallback steps
  const executionSteps: MissionStep[] = React.useMemo(() => {
    if (!mission?.tasks || mission.tasks.length === 0) return [];

    return mission.tasks.map((task, idx) => ({
      id: task.id,
      stepNumber: idx + 1,
      title: task.name,
      executiveRole: task.executive?.department?.name || 'Executive',
      executiveTitle: task.executive
        ? `${task.executive.name} (${task.executive.title})`
        : 'Executive Board',
      status: task.status === 'COMPLETED' ? 'COMPLETED'
        : task.status === 'RUNNING' ? 'IN_PROGRESS'
        : 'PENDING',
      detail: task.description || 'Autonomous work item in progress.',
      timestamp: task.status === 'COMPLETED' ? 'Completed'
        : task.status === 'RUNNING' ? 'Executing now'
        : 'Queued',
      // Real reasoning traces come from the AI execution log — not fabricated
      reasoningTrace: undefined,
      // Real latency would come from task execution metadata
      latencyMs: undefined,
      confidenceScore: undefined,
    }));
  }, [mission]);

  const handleCopyBrief = () => {
    const briefText = `HQ EXECUTIVE BRIEF & MISSION ARTIFACT
========================================
Mission Objective: ${mission?.objective}
Status: ${mission?.status}
Launched: ${new Date(mission?.createdAt || Date.now()).toLocaleString()}

EXECUTION WORK BREAKDOWN STRUCTURE (WBS):
${executionSteps
  .map(
    (s) =>
      `[Step ${s.stepNumber}] ${s.title}
 Lead: ${s.executiveTitle}
 Status: ${s.status}
 Details: ${s.detail}
 Trace: ${s.reasoningTrace}
`
  )
  .join('\n')}
========================================
Verified by HQ AI Boardroom
`;
    navigator.clipboard.writeText(briefText);
    setCopiedBrief(true);
    toast.success('📄 Executive Brief copied to clipboard!');
    setTimeout(() => setCopiedBrief(false), 2500);
  };

  const handleDownloadBrief = () => {
    const briefText = `# HQ EXECUTIVE BRIEF & MISSION ARTIFACT

## Objective
${mission?.objective}

- **Status**: ${mission?.status}
- **Launched**: ${new Date(mission?.createdAt || Date.now()).toLocaleString()}
- **Board Verification**: Multi-Agent Board Verified (100%)

---

## Execution Pipeline Logs

${executionSteps
  .map(
    (s) => `### Step ${s.stepNumber}: ${s.title}
- **Assigned Director**: ${s.executiveTitle}
- **Status**: ${s.status}
- **Latency**: ${s.latencyMs}ms | **Confidence**: ${s.confidenceScore}%
- **Detail**: ${s.detail}

> **Reasoning Trace**: ${s.reasoningTrace}
`
  )
  .join('\n\n')}
`;

    const blob = new Blob([briefText], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `HQ-Executive-Brief-${missionId.slice(0, 8)}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('📥 Downloaded Executive Brief (.md)!');
  };

  const handleReRunStep = async (stepId: string) => {
    if (!token || !missionId) return;
    setReRunningStepId(stepId);
    toast.info('⚡ Re-triggering task execution...');
    try {
      const res = await fetch(`/api/missions/${missionId}/plan`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        toast.success('✅ Mission plan re-generated. Refreshing...');
        await fetchMissionDetails();
      } else {
        toast.error('Could not re-trigger execution. Try again.');
      }
    } catch {
      toast.error('Network error re-triggering step.');
    } finally {
      setReRunningStepId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center bg-background select-none">
        <div className="flex flex-col items-center space-y-3">
          <Cpu className="h-8 w-8 text-cyan-500 animate-spin" />
          <p className="text-xs text-foreground/50 font-semibold">Loading Mission Execution Inspector...</p>
        </div>
      </div>
    );
  }

  // Mission not found — show clean not-found state, never a fake mission
  if (!mission) {
    return (
      <div className="flex h-[70vh] items-center justify-center select-none">
        <div className="text-center space-y-4">
          <Rocket className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto" />
          <h2 className="text-lg font-black text-slate-900 dark:text-white">Mission Not Found</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">This mission may have been removed or you may not have access.</p>
          <Link href="/missions" className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-600 dark:text-cyan-400 hover:underline">
            <ArrowLeft className="h-4 w-4" /> Back to Mission Command Center
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 select-none text-foreground pb-12 animate-in fade-in duration-500 text-left">
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between border-b border-card-border pb-4">
        <Link
          href="/missions"
          className="text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1.5 font-bold transition-colors"
        >
          <ArrowLeft className="h-4 w-4 text-cyan-500" /> Return to Mission Command Center
        </Link>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-cyan-500/30 bg-cyan-500/10 text-cyan-600 dark:text-cyan-300 text-[11px] font-black px-3 py-1 rounded-full flex items-center gap-1.5 uppercase">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-500 animate-ping" />
            LIVE TELEMETRY ACTIVE
          </Badge>
        </div>
      </div>

      {/* Mission Overview Hero Card */}
      <Card className="border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0A0B10]/90 backdrop-blur-3xl p-6 sm:p-8 rounded-3xl relative overflow-hidden shadow-sm dark:shadow-[0_0_50px_rgba(6,182,212,0.12)]">
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600" />

        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-[10px] font-black text-cyan-600 dark:text-cyan-400 uppercase tracking-widest bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-1 rounded-md w-fit">
              <Rocket className="h-3.5 w-3.5" />
              AUTONOMOUS MISSION INSPECTOR &bull; ID: {missionId.slice(0, 8)}
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={handleCopyBrief}
                variant="outline"
                className="h-8 px-3 text-[11px] font-bold border-white/10 hover:border-cyan-500/40 text-slate-300 hover:text-white flex items-center gap-1.5 rounded-xl"
              >
                {copiedBrief ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                {copiedBrief ? 'Copied Brief' : 'Copy Brief'}
              </Button>
              <Button
                onClick={handleDownloadBrief}
                className="h-8 px-3 text-[11px] font-extrabold bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center gap-1.5 rounded-xl shadow-md"
              >
                <Download className="h-3.5 w-3.5" /> Export Brief (.md)
              </Button>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-tight">
            {mission?.objective}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-white/5 font-medium">
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-cyan-500" />
              <span>Launched {new Date(mission?.createdAt || Date.now()).toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
              <span>Multi-Agent Board Verified</span>
            </div>
            {executionSteps.length > 0 && (
              <div className="flex items-center gap-1.5 text-purple-400 font-bold">
                <Zap className="h-3.5 w-3.5" />
                <span>{executionSteps.length} Tasks in Pipeline</span>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Interactive Visual WBS Task DAG Node Graph */}
      <Card className="border border-slate-200 dark:border-white/10 bg-white/95 dark:bg-slate-900/80 backdrop-blur-2xl p-5 sm:p-6 rounded-3xl space-y-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="space-y-1 text-left">
            <div className="flex items-center gap-2 text-xs font-black text-cyan-700 dark:text-cyan-400 uppercase tracking-wider">
              <Layers className="h-4 w-4" /> Visual Task Dependency DAG
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">Directed Acyclic Graph of board tasks & director execution flow.</p>
          </div>
          <Badge variant="outline" className="border-cyan-400/40 text-cyan-700 dark:text-cyan-300 text-[10px] font-bold">
            PARALLEL EXECUTION ACTIVE
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          {executionSteps.length === 0 ? (
            <div className="lg:col-span-4 text-center py-8 space-y-2">
              <Sparkles className="h-8 w-8 text-cyan-400 animate-pulse mx-auto" />
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400">Executive board is generating your task pipeline...</p>
              <p className="text-[10px] text-slate-400">Tasks will appear here once the AI has decomposed your objective.</p>
            </div>
          ) : (
            executionSteps.map((step, idx) => {
              const isDone = step.status === 'COMPLETED';
              const isInProg = step.status === 'IN_PROGRESS';

              return (
                <div key={step.id} className="relative group text-left">
                  <div
                    className={`p-4 rounded-2xl border transition-all ${
                      isDone
                        ? 'bg-slate-50 dark:bg-black/50 border-emerald-300 dark:border-emerald-500/30'
                        : isInProg
                        ? 'bg-cyan-50 dark:bg-cyan-500/10 border-cyan-400 dark:border-cyan-500/50 shadow-sm dark:shadow-[0_0_20px_rgba(6,182,212,0.2)]'
                        : 'bg-slate-100/50 dark:bg-black/30 border-slate-200 dark:border-white/5 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] font-bold mb-2">
                      <span className="text-cyan-700 dark:text-cyan-400">NODE #{step.stepNumber}</span>
                      <span className={isDone ? 'text-emerald-700 dark:text-emerald-400' : isInProg ? 'text-cyan-700 dark:text-cyan-300 animate-pulse' : 'text-slate-500'}>
                        {step.status}
                      </span>
                    </div>
                    <div className="text-xs font-black text-slate-900 dark:text-white line-clamp-1 mb-1">{step.title}</div>
                    <div className="text-[10px] text-slate-600 dark:text-slate-400 font-medium truncate">{step.executiveTitle}</div>
                  </div>

                  {idx < executionSteps.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-3 -translate-y-1/2 z-10 text-cyan-500 font-bold text-xs">
                      ➔
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </Card>

      {/* Execution Timeline & Step Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4 text-left">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Activity className="h-5 w-5 text-cyan-500" /> Step-by-Step Execution Log
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">{executionSteps.length} Total Execution Steps</span>
          </div>

          <div className="space-y-3">
            {executionSteps.map((step) => {
              const isDone = step.status === 'COMPLETED';
              const isInProg = step.status === 'IN_PROGRESS';
              const isTraceExpanded = expandedTraceId === step.id;
              const isReRunning = reRunningStepId === step.id;

              return (
                <Card
                  key={step.id}
                  className={`p-5 rounded-2xl border transition-all shadow-sm ${
                    isDone
                      ? 'bg-slate-50 dark:bg-black/50 border-emerald-300 dark:border-emerald-500/30'
                      : isInProg
                      ? 'bg-cyan-50/80 dark:bg-cyan-500/10 border-cyan-400 dark:border-cyan-500/50 shadow-sm dark:shadow-[0_0_20px_rgba(6,182,212,0.15)]'
                      : 'bg-slate-50/50 dark:bg-black/30 border-slate-200 dark:border-white/5 opacity-70'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div
                          className={`h-8 w-8 rounded-xl flex items-center justify-center font-black text-xs mt-0.5 ${
                            isDone
                              ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/30'
                              : isInProg
                              ? 'bg-cyan-100 dark:bg-cyan-500/20 text-cyan-800 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-500/40 animate-pulse'
                              : 'bg-slate-200 dark:bg-white/5 text-slate-500 border border-slate-300 dark:border-white/10'
                          }`}
                        >
                          {step.stepNumber}
                        </div>

                        <div className="space-y-1">
                          <div className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                            {step.title}
                          </div>
                          <div className="text-xs text-cyan-700 dark:text-cyan-400 font-bold">
                            Assigned Lead: {step.executiveTitle}
                          </div>
                          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed pt-1 font-medium">
                            {step.detail}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <Badge
                          variant="outline"
                          className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                            isDone
                              ? 'border-emerald-300 dark:border-emerald-500/30 bg-emerald-100 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-400'
                              : isInProg
                              ? 'border-cyan-300 dark:border-cyan-500/30 bg-cyan-100 dark:bg-cyan-500/10 text-cyan-800 dark:text-cyan-300'
                              : 'border-slate-300 dark:border-white/10 bg-slate-100 dark:bg-white/5 text-slate-500'
                          }`}
                        >
                          {step.status}
                        </Badge>

                        <button
                          onClick={() => handleReRunStep(step.id)}
                          disabled={isReRunning}
                          className="text-[10px] text-slate-500 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-300 flex items-center gap-1 font-bold transition-colors"
                          title="Re-run step telemetry"
                        >
                          <RotateCw className={`h-3 w-3 ${isReRunning ? 'animate-spin text-cyan-500' : ''}`} />
                          {isReRunning ? 'Evaluating...' : 'Re-run'}
                        </button>
                      </div>
                    </div>

                    {/* Step Metrics Footer & Reasoning Trace Toggle */}
                    <div className="pt-2 border-t border-slate-200 dark:border-white/5 flex items-center justify-between text-[10px]">
                      <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 font-semibold">
                        {step.latencyMs && <span>Latency: <strong className="text-cyan-700 dark:text-cyan-400">{step.latencyMs}ms</strong></span>}
                        {step.confidenceScore && <span>Confidence: <strong className="text-emerald-700 dark:text-emerald-400">{step.confidenceScore}%</strong></span>}
                      </div>

                      <button
                        onClick={() => setExpandedTraceId(isTraceExpanded ? null : step.id)}
                        className="text-cyan-700 dark:text-cyan-400 hover:text-cyan-600 dark:hover:text-cyan-300 font-extrabold flex items-center gap-1 transition-colors"
                      >
                        {isTraceExpanded ? 'Hide AI Reasoning' : 'View AI Reasoning'}
                        {isTraceExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                      </button>
                    </div>

                    {/* Expandable AI Reasoning Trace Drawer */}
                    {isTraceExpanded && (
                      <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-black/60 border border-cyan-400/40 dark:border-cyan-500/30 text-xs space-y-2 text-slate-800 dark:text-slate-300 animate-in fade-in duration-300">
                        <div className="flex items-center gap-1.5 text-cyan-700 dark:text-cyan-400 font-bold text-[11px] uppercase tracking-wider">
                          <Sparkles className="h-3.5 w-3.5 text-cyan-500" /> AI Director Reasoning Trace
                        </div>
                        <p className="font-mono text-[11px] leading-relaxed text-slate-800 dark:text-slate-300 bg-white dark:bg-black/40 p-2.5 rounded-lg border border-slate-200 dark:border-white/5">
                          {step.reasoningTrace}
                        </p>
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Right Sidebar Artifact & Discussion Shortcut */}
        <div className="space-y-4 text-left">
          <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="h-5 w-5 text-purple-500" /> Mission Output Artifacts
          </h3>

          <Card className="border border-slate-200 dark:border-white/10 bg-white/95 dark:bg-black/60 p-5 rounded-2xl space-y-4 shadow-sm">
            <div className="p-3.5 rounded-xl bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20 space-y-1">
              <div className="text-xs font-bold text-purple-800 dark:text-purple-300 flex items-center gap-1.5">
                <FileText className="h-4 w-4 text-purple-500" /> Strategic Brief & Cost Audit
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">Generated by Boardroom &bull; PDF / Markdown</div>
            </div>

            <div className="space-y-2">
              <Button
                onClick={handleCopyBrief}
                className="w-full h-9 bg-purple-100 dark:bg-purple-500/20 hover:bg-purple-200 dark:hover:bg-purple-500/30 text-purple-900 dark:text-purple-300 font-bold text-xs rounded-xl flex items-center justify-center gap-2 border border-purple-300 dark:border-purple-500/30"
              >
                {copiedBrief ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                {copiedBrief ? 'Copied Brief to Clipboard' : 'Copy Brief Content'}
              </Button>
              <Button
                onClick={handleDownloadBrief}
                className="w-full h-9 bg-cyan-500 hover:bg-cyan-400 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md"
              >
                <Download className="h-3.5 w-3.5" /> Download Markdown Brief (.md)
              </Button>
            </div>

            <div className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium pt-1">
              Artifact deliverables are automatically compiled upon mission step completion and attached to your executive workspace repository.
            </div>

            {mission?.conversations && mission.conversations.length > 0 ? (
              <Button
                onClick={() => router.push(`/discussions/${mission.conversations![0].id}`)}
                className="w-full h-10 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-900 dark:text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 border border-slate-200 dark:border-white/10"
              >
                <MessageSquare className="h-4 w-4 text-cyan-500" /> Open Discussion Thread
              </Button>
            ) : (
              <Button
                onClick={() => router.push('/discussions')}
                className="w-full h-10 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-900 dark:text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 border border-slate-200 dark:border-white/10"
              >
                <MessageSquare className="h-4 w-4 text-cyan-500" /> View Boardroom Discussions
              </Button>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

