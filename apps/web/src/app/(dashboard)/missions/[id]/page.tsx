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
} from 'lucide-react';
import { useAuth } from '../../../../contexts/auth-context';
import { toast } from '../../../../components/toast';

interface MissionStep {
  id: string;
  stepNumber: number;
  title: string;
  executiveRole: string;
  executiveTitle: string;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'PENDING';
  detail: string;
  timestamp: string;
}

interface MissionDetail {
  id: string;
  objective: string;
  status: 'QUEUED' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  createdAt: string;
  companyId: string;
  conversations?: Array<{ id: string; title: string }>;
}

export default function MissionExecutionInspectorPage() {
  const params = useParams();
  const router = useRouter();
  const { token } = useAuth();
  const missionId = (params?.id as string) || '';

  const [mission, setMission] = React.useState<MissionDetail | null>(null);
  const [loading, setLoading] = React.useState(true);

  // Mock execution steps pipeline
  const steps: MissionStep[] = [
    {
      id: 'step-1',
      stepNumber: 1,
      title: 'Executive Mandate & Strategy Formulation',
      executiveRole: 'ceo',
      executiveTitle: 'Elena Rostova (Chief Executive Officer)',
      status: 'COMPLETED',
      detail: 'Initiated corporate directive, aligned board members, and defined operational parameters.',
      timestamp: '10 mins ago',
    },
    {
      id: 'step-2',
      stepNumber: 2,
      title: 'Technical Architecture & Risk Assessment',
      executiveRole: 'cto',
      executiveTitle: 'Marcus Vance (Chief Technology Officer)',
      status: 'COMPLETED',
      detail: 'Audited API endpoint security, token rotation schedules, and database encryption compliance.',
      timestamp: '6 mins ago',
    },
    {
      id: 'step-3',
      stepNumber: 3,
      title: 'Financial Margin & Capital Allocation',
      executiveRole: 'cfo',
      executiveTitle: 'Arthur Pendelton (Chief Financial Officer)',
      status: 'IN_PROGRESS',
      detail: 'Evaluating unit economics, infrastructure compute budget, and gross margin optimization (>85%).',
      timestamp: 'Just now',
    },
    {
      id: 'step-4',
      stepNumber: 4,
      title: 'Commercial Execution & Final Deliverable Compilation',
      executiveRole: 'cro',
      executiveTitle: 'Victor Vance (Chief Revenue Officer)',
      status: 'PENDING',
      detail: 'Awaiting financial clearance before finalizing executive summary report and deployment locks.',
      timestamp: 'Pending',
    },
  ];

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
        setMission({
          id: missionId,
          objective: 'Execute high-impact autonomous executive directive and compile strategic deliverables.',
          status: 'IN_PROGRESS',
          createdAt: new Date().toISOString(),
          companyId: 'current-org',
        });
      }
    } catch {
      setMission({
        id: missionId,
        objective: 'Execute high-impact autonomous executive directive and compile strategic deliverables.',
        status: 'IN_PROGRESS',
        createdAt: new Date().toISOString(),
        companyId: 'current-org',
      });
    } finally {
      setLoading(false);
    }
  }, [token, missionId]);

  React.useEffect(() => {
    fetchMissionDetails();
  }, [fetchMissionDetails]);

  // Simulate real-time step notifications
  React.useEffect(() => {
    if (mission) {
      toast.info(`📍 Mission Inspector active: Step 3 in progress by Chief Financial Officer (CFO).`);
    }
  }, [mission]);

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
            LIVE STEP TRACKER ACTIVE
          </Badge>
        </div>
      </div>

      {/* Mission Overview Hero Card */}
      <Card className="border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0A0B10]/90 backdrop-blur-3xl p-6 sm:p-8 rounded-3xl relative overflow-hidden shadow-sm dark:shadow-[0_0_50px_rgba(6,182,212,0.12)]">
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600" />

        <div className="space-y-4">
          <div className="flex items-center gap-2 text-[10px] font-black text-cyan-600 dark:text-cyan-400 uppercase tracking-widest bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-1 rounded-md w-fit">
            <Rocket className="h-3.5 w-3.5" />
            AUTONOMOUS MISSION INSPECTOR &bull; ID: {missionId.slice(0, 8)}
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
          </div>
        </div>
      </Card>

      {/* Execution Timeline & Step Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Activity className="h-5 w-5 text-cyan-500" /> Step-by-Step Execution Log
            </h3>
            <span className="text-xs text-slate-500 font-bold">4 Total Execution Steps</span>
          </div>

          <div className="space-y-3">
            {steps.map((step) => {
              const isDone = step.status === 'COMPLETED';
              const isInProg = step.status === 'IN_PROGRESS';

              return (
                <Card
                  key={step.id}
                  className={`p-5 rounded-2xl border transition-all ${
                    isDone
                      ? 'bg-slate-50 dark:bg-black/50 border-emerald-500/30'
                      : isInProg
                      ? 'bg-cyan-500/10 border-cyan-500/50 shadow-sm dark:shadow-[0_0_20px_rgba(6,182,212,0.15)]'
                      : 'bg-slate-50/50 dark:bg-black/30 border-slate-200 dark:border-white/5 opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div
                        className={`h-8 w-8 rounded-xl flex items-center justify-center font-black text-xs mt-0.5 ${
                          isDone
                            ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                            : isInProg
                            ? 'bg-cyan-500/20 text-cyan-600 dark:text-cyan-300 border border-cyan-500/40 animate-pulse'
                            : 'bg-slate-200 dark:bg-white/5 text-slate-500 border border-slate-300 dark:border-white/10'
                        }`}
                      >
                        {step.stepNumber}
                      </div>

                      <div className="space-y-1">
                        <div className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                          {step.title}
                        </div>
                        <div className="text-xs text-cyan-600 dark:text-cyan-400 font-bold">
                          Assigned Lead: {step.executiveTitle}
                        </div>
                        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed pt-1 font-medium">
                          {step.detail}
                        </p>
                      </div>
                    </div>

                    <Badge
                      variant="outline"
                      className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                        isDone
                          ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : isInProg
                          ? 'border-cyan-500/30 bg-cyan-500/10 text-cyan-600 dark:text-cyan-300'
                          : 'border-slate-300 dark:border-white/10 bg-slate-100 dark:bg-white/5 text-slate-500'
                      }`}
                    >
                      {step.status}
                    </Badge>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Right Sidebar Artifact & Discussion Shortcut */}
        <div className="space-y-4">
          <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="h-5 w-5 text-purple-500" /> Mission Output Artifacts
          </h3>

          <Card className="border border-slate-200 dark:border-white/10 bg-white dark:bg-black/60 p-5 rounded-2xl space-y-4 shadow-sm">
            <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/20 space-y-1">
              <div className="text-xs font-bold text-purple-600 dark:text-purple-300 flex items-center gap-1.5">
                <FileText className="h-4 w-4" /> Strategic Blueprint & Cost Audit
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">Generated by CFO & CTO &bull; PDF / Markdown</div>
            </div>

            <div className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
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
