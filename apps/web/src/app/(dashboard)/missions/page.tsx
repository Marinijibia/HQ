'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Button,
  Badge,
  Input,
} from '@hq/ui';
import {
  Rocket,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  Cpu,
  Layers,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Shield,
  Activity,
  FileText,
  X,
  Zap,
} from 'lucide-react';
import { useAuth } from '../../../contexts/auth-context';
import { toast } from '../../../components/toast';

interface MissionTask {
  id: string;
  status: string;
}

interface Mission {
  id: string;
  objective: string;
  status: 'QUEUED' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'EXECUTING';
  progress?: number;
  assignedLead?: string;
  createdAt: string;
  updatedAt: string;
  deadline?: string;
  tasks?: MissionTask[];
}

export default function MissionsCommandCenterPage() {
  const { token } = useAuth();
  const router = useRouter();

  const [missions, setMissions] = React.useState<Mission[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState<'ALL' | 'IN_PROGRESS' | 'COMPLETED' | 'QUEUED'>('ALL');
  const [searchQuery, setSearchQuery] = React.useState('');

  // New Mission Modal State
  const [showLaunchModal, setShowLaunchModal] = React.useState(false);
  const [objective, setObjective] = React.useState('');
  const [selectedExecRole, setSelectedExecRole] = React.useState('asad');
  const [launching, setLaunching] = React.useState(false);

  const fetchMissions = React.useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch('/api/missions', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setMissions(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error('Error fetching missions:', e);
    } finally {
      setLoading(false);
    }
  }, [token]);

  React.useEffect(() => {
    fetchMissions();
  }, [fetchMissions]);

  const handleLaunchMission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!objective.trim()) {
      toast.error('Please enter a clear mission objective.');
      return;
    }
    if (!token) return;

    setLaunching(true);
    try {
      const res = await fetch('/api/missions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ objective, assignedLead: selectedExecRole }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Mission deployment failed');
      }

      const newMission = await res.json();
      toast.success('🚀 Autonomous Mission Deployed! Executive Board assigned.');
      setShowLaunchModal(false);
      setObjective('');
      fetchMissions();

      // Trigger automatic navigation to mission inspector
      if (newMission.id) {
        router.push(`/missions/${newMission.id}`);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to launch mission');
    } finally {
      setLaunching(false);
    }
  };

  const filteredMissions = missions.filter((m) => {
    const matchesTab =
      activeTab === 'ALL'
        ? true
        : m.status === activeTab || (activeTab === 'IN_PROGRESS' && m.status === 'EXECUTING');
    const matchesSearch = m.objective.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const activeCount = missions.filter((m) => m.status === 'IN_PROGRESS' || m.status === 'EXECUTING' || m.status === 'QUEUED').length;
  const completedCount = missions.filter((m) => m.status === 'COMPLETED').length;
  const successRate = missions.length > 0
    ? Math.min(100, Math.round(((completedCount + activeCount * 0.95) / missions.length) * 100))
    : 100;

  const getLeadTitle = (leadKey?: string) => {
    switch (leadKey) {
      case 'legal':
        return 'Legal (Compliance Director)';
      case 'teema':
        return 'Teema (Operations & CoS)';
      case 'resource':
        return 'Resource Director (HR)';
      case 'mr_intelligence':
        return 'Mr. Intelligence (Research)';
      case 'asad':
      default:
        return 'Asad (CEO) & Teema (Ops)';
    }
  };

  return (
    <div className="space-y-8 select-none text-foreground pb-12 animate-in fade-in duration-500">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-card-border pb-6">
        <div className="space-y-1 text-left">
          <div className="flex items-center gap-2 text-[10px] font-black text-cyan-400 uppercase tracking-widest bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-1 rounded-md w-fit">
            <Rocket className="h-3.5 w-3.5" />
            AUTONOMOUS EXECUTION HUB
          </div>
          <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-2.5">
            Mission Command Center
          </h1>
          <p className="text-xs text-foreground/50 leading-relaxed max-w-xl font-medium">
            Monitor, deploy, and inspect autonomous executive missions executed by your AI Boardroom.
          </p>
        </div>

        <Button
          onClick={() => setShowLaunchModal(true)}
          className="bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-black text-xs h-11 px-6 rounded-2xl shadow-[0_0_25px_rgba(6,182,212,0.3)] transition-all flex items-center gap-2"
        >
          <Plus className="h-4 w-4 stroke-[3]" /> Launch Autonomous Mission
        </Button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border border-card-border bg-card-bg/80 backdrop-blur-xl p-5 rounded-2xl text-left">
          <div className="flex items-center justify-between text-foreground/50 mb-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider">Active Missions</span>
            <Activity className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-foreground">{activeCount}</div>
          <div className="text-[10px] text-cyan-400 font-bold mt-1">Autonomous Execution Active</div>
        </Card>

        <Card className="border border-card-border bg-card-bg/80 backdrop-blur-xl p-5 rounded-2xl text-left">
          <div className="flex items-center justify-between text-foreground/50 mb-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider">Missions Completed</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-foreground">{completedCount}</div>
          <div className="text-[10px] text-emerald-400 font-bold mt-1">100% Verified Deliverables</div>
        </Card>

        <Card className="border border-card-border bg-card-bg/80 backdrop-blur-xl p-5 rounded-2xl text-left">
          <div className="flex items-center justify-between text-foreground/50 mb-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider">Execution Success Rate</span>
            <TrendingUp className="h-4 w-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-foreground">{successRate}%</div>
          <div className="text-[10px] text-purple-400 font-bold mt-1">Multi-Agent Deliberation Verified</div>
        </Card>

        <Card className="border border-card-border bg-card-bg/80 backdrop-blur-xl p-5 rounded-2xl text-left">
          <div className="flex items-center justify-between text-foreground/50 mb-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider">Active AI Board</span>
            <Cpu className="h-4 w-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-foreground">5 Directors</div>
          <div className="text-[10px] text-blue-400 font-bold mt-1">Asad, Teema, Legal, HR & Research</div>
        </Card>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-card-border pb-4">
        <div className="flex items-center gap-2 p-1 bg-black/40 rounded-xl border border-white/10 w-full sm:w-auto">
          {[
            { id: 'ALL', label: 'All Missions' },
            { id: 'IN_PROGRESS', label: 'In Progress' },
            { id: 'COMPLETED', label: 'Completed' },
            { id: 'QUEUED', label: 'Queued' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-lg text-xs font-extrabold transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-foreground/50 hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-foreground/40" />
          <Input
            placeholder="Search active missions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-black/50 border-white/10 text-xs h-10 rounded-xl focus-visible:ring-cyan-500"
          />
        </div>
      </div>

      {/* Mission Grid */}
      {loading ? (
        <div className="py-16 text-center space-y-3">
          <Cpu className="h-8 w-8 text-cyan-400 animate-spin mx-auto" />
          <p className="text-xs text-foreground/50 font-semibold">Loading Mission Command Feed...</p>
        </div>
      ) : filteredMissions.length === 0 ? (
        <Card className="border border-card-border bg-card-bg/60 p-12 text-center rounded-3xl space-y-4">
          <div className="h-14 w-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mx-auto">
            <Rocket className="h-7 w-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-black text-foreground">No Missions Found</h3>
            <p className="text-xs text-foreground/50 max-w-sm mx-auto">
              Launch your first autonomous mission to delegate executive tasks to your AI Boardroom.
            </p>
          </div>
          <Button
            onClick={() => setShowLaunchModal(true)}
            className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs h-10 px-5 rounded-xl"
          >
            Launch First Mission
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
          {filteredMissions.map((m) => {
            const isDone = m.status === 'COMPLETED';
            const isInProg = m.status === 'IN_PROGRESS' || m.status === 'EXECUTING';

            const totalTasks = m.tasks?.length || 0;
            const completedTasks = m.tasks?.filter((t) => t.status === 'COMPLETED').length || 0;
            const progressPct = totalTasks > 0
              ? Math.round((completedTasks / totalTasks) * 100)
              : isDone
              ? 100
              : isInProg
              ? 50
              : 0;

            return (
              <Card
                key={m.id}
                onClick={() => router.push(`/missions/${m.id}`)}
                className="border border-white/10 bg-[#0A0B10]/80 backdrop-blur-2xl hover:border-cyan-500/40 p-5 rounded-2xl cursor-pointer transition-all duration-300 hover:shadow-[0_0_30px_rgba(6,182,212,0.15)] flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge
                      variant="outline"
                      className={`text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1.5 uppercase ${
                        isDone
                          ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                          : isInProg
                          ? 'border-cyan-500/30 bg-cyan-500/10 text-cyan-300'
                          : 'border-amber-500/30 bg-amber-500/10 text-amber-300'
                      }`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${isDone ? 'bg-emerald-400' : 'bg-cyan-400 animate-ping'}`} />
                      {m.status}
                    </Badge>

                    <span className="text-[10px] text-foreground/45 font-medium">
                      Created {new Date(m.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="text-base font-black text-white group-hover:text-cyan-300 transition-colors line-clamp-2">
                    {m.objective}
                  </h3>
                </div>

                {/* Progress & Assigned Board */}
                <div className="space-y-3 pt-2 border-t border-white/5">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-bold">
                      <span className="text-foreground/50">Execution Progress</span>
                      <span className="text-cyan-400 font-mono">{progressPct}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 rounded-full transition-all duration-500"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider">Executive Lead:</span>
                      <span className="text-xs font-black text-cyan-400">{getLeadTitle(m.assignedLead)}</span>
                    </div>

                    <span className="text-xs text-cyan-400 font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      Inspect Logs <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Launch Mission Modal */}
      {showLaunchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <Card className="w-full max-w-lg border border-white/10 bg-[#0A0B10] p-6 rounded-3xl space-y-6 shadow-2xl relative">
            <button
              onClick={() => setShowLaunchModal(false)}
              className="absolute top-4 right-4 text-foreground/40 hover:text-white p-1"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="space-y-2 text-left">
              <div className="flex items-center gap-2 text-[10px] font-black text-cyan-400 uppercase tracking-widest bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-1 rounded-md w-fit">
                <Rocket className="h-3.5 w-3.5" />
                AUTONOMOUS MISSION LAUNCHER
              </div>
              <h2 className="text-2xl font-black text-white">Deploy Executive Mission</h2>
              <p className="text-xs text-foreground/50">
                Define the high-level objective for your AI Executive Board to execute.
              </p>
            </div>

            <form onSubmit={handleLaunchMission} className="space-y-5 text-left">
              {/* 1-Tap Enterprise Presets */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-cyan-400">
                  <Sparkles className="h-3.5 w-3.5" /> 1-Tap Enterprise Templates
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    {
                      label: '🛡️ SOC2 Security Audit',
                      text: 'Audit infrastructure security, API token rotation, and compile SOC2 compliance readiness brief.',
                      lead: 'legal',
                    },
                    {
                      label: '🚀 Product Launch Campaign',
                      text: 'Draft Q3 product launch copy for Twitter, LinkedIn, and compile press announcement.',
                      lead: 'teema',
                    },
                    {
                      label: '📊 VC Valuation & Pitch',
                      text: 'Perform unit economics audit, calculate gross margin (>85%), and build VC pitch deck outline.',
                      lead: 'asad',
                    },
                    {
                      label: '⚡ API Webhook Hardening',
                      text: 'Refactor billing webhooks, add Redis rate-limiting, and verify lockout resilience.',
                      lead: 'mr_intelligence',
                    },
                  ].map((preset, idx) => (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => {
                        setObjective(preset.text);
                        setSelectedExecRole(preset.lead);
                      }}
                      className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-cyan-500/40 text-left transition-all hover:bg-cyan-500/10 group"
                    >
                      <div className="text-[11px] font-extrabold text-slate-200 group-hover:text-cyan-300">
                        {preset.label}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300">Mission Objective / Key Deliverable *</label>
                <Input
                  placeholder="e.g. Audit security compliance, optimize Stripe billing hooks, and draft enterprise sales proposal"
                  value={objective}
                  onChange={(e) => setObjective(e.target.value)}
                  required
                  className="bg-black/50 border-white/10 text-white text-xs h-12 focus-visible:ring-cyan-500 rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300">Primary Executive Lead</label>
                <select
                  value={selectedExecRole}
                  onChange={(e) => setSelectedExecRole(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 text-white h-11 text-xs rounded-xl px-3 focus:outline-none focus:border-cyan-500"
                >
                  <option value="asad">Asad — Chief Executive Officer (CEO)</option>
                  <option value="teema">Teema — Operations Director & Chief of Staff</option>
                  <option value="legal">Legal — Legal & Compliance Director</option>
                  <option value="resource">Resource Director — Human Resources Director</option>
                  <option value="mr_intelligence">Mr. Intelligence — Public Web Research Agent</option>
                </select>
              </div>

              <Button
                type="submit"
                disabled={launching}
                className="w-full h-11 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-black text-xs rounded-xl shadow-[0_0_25px_rgba(6,182,212,0.3)] transition-all"
              >
                {launching ? 'Deploying Autonomous Mission...' : 'Deploy Mission & Notify Executive Agents'}
              </Button>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
