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
} from '@hq/ui';
import {
  Play,
  TrendingUp,
  Calendar,
  CreditCard,
  ArrowRight,
  Activity,
  Sparkles,
  Lightbulb,
  ShieldAlert,
  Loader2,
  CheckCircle2,
  Bot,
} from 'lucide-react';
import { useAuth } from '../../../contexts/auth-context';
import { useGuideMode } from '../../../contexts/guide-mode-context';
import { GlobalActivityFeed } from '../../../components/global-activity-feed';
import { SetupProgressBar } from '../../../components/setup-progress-bar';
import { MissionLaunchPanel } from '../../../components/mission-launch-panel';

// ─── Types from backend ───────────────────────────────────────────────────────

interface AnalyticsMetrics {
  healthScore: number;
  missions: { active: number; completed: number; total: number; successRate: number };
  storage: { used: number; limit: number; planCode: string };
  executiveUtilization: Array<{ name: string; title: string; hours: number; percentage: number }>;
  creditOutflow: Array<{ day: string; credits: number }>;
  recommendations: Array<{ id: string; title: string; type: string; confidence: number; description: string }>;
}

interface OrgSettings {
  companyName: string;
  brandColor: string;
  secondaryColor: string;
}

interface Executive {
  id: string;
  name: string;
  title: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const EXEC_BAR_COLORS = [
  { from: 'from-cyan-500', to: 'to-blue-600', shadow: 'shadow-[0_0_6px_rgba(6,182,212,0.3)]' },
  { from: 'from-emerald-500', to: 'to-teal-600', shadow: 'shadow-[0_0_6px_rgba(16,185,129,0.25)]' },
  { from: 'from-purple-500', to: 'to-indigo-600', shadow: 'shadow-[0_0_6px_rgba(168,85,247,0.25)]' },
  { from: 'from-amber-400', to: 'to-amber-500', shadow: 'shadow-[0_0_6px_rgba(251,191,36,0.25)]' },
];

function buildSvgPath(data: Array<{ day: string; credits: number }>): { area: string; line: string; points: Array<{ x: number; y: number }> } {
  if (!data || data.length === 0) return { area: '', line: '', points: [] };
  const W = 300, H = 100, PAD_X = 10, PAD_Y = 10;
  const max = Math.max(...data.map(d => d.credits));
  const min = Math.min(...data.map(d => d.credits));
  const range = max - min || 1;
  const pts = data.map((d, i) => ({
    x: PAD_X + (i / (data.length - 1)) * (W - PAD_X * 2),
    y: PAD_Y + (1 - (d.credits - min) / range) * (H - PAD_Y * 2),
  }));
  const lineD = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  const areaD = lineD + ` L ${pts[pts.length - 1].x.toFixed(1)} ${H} L ${pts[0].x.toFixed(1)} ${H} Z`;
  return { area: areaD, line: lineD, points: pts };
}

function getBadgeVariant(status: string) {
  if (status === 'APPROVED' || status === 'DELIVERED') return 'success';
  if (status === 'PLANNING') return 'ai';
  if (status === 'ARCHIVED') return 'neutral';
  return 'warning';
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [missionPanelOpen, setMissionPanelOpen] = React.useState(false);

  const { guideModeEnabled, ftxStep, objectiveText, resetProgress } = useGuideMode();

  // ── Backend state ──────────────────────────────────────────────────────────
  const [conversations, setConversations] = React.useState<any[]>([]);
  const [missions, setMissions] = React.useState<any[]>([]);
  const [metrics, setMetrics] = React.useState<AnalyticsMetrics | null>(null);
  const [orgSettings, setOrgSettings] = React.useState<OrgSettings>({
    companyName: 'HQ Corporation',
    brandColor: '#0A84FF',
    secondaryColor: '#8B5CF6',
  });
  const [executives, setExecutives] = React.useState<Executive[]>([]);
  const [loading, setLoading] = React.useState(true);

  // Fallback to localStorage for onboarding draft (until backend org is populated)
  React.useEffect(() => {
    const draftStr = localStorage.getItem('hq_onboarding_draft');
    if (draftStr) {
      try {
        const draft = JSON.parse(draftStr);
        setOrgSettings(prev => ({
          ...prev,
          companyName: draft.orgName ? `${draft.orgName} HQ` : prev.companyName,
          brandColor: draft.brandColor || prev.brandColor,
        }));
      } catch { /* silent */ }
    }
  }, []);

  // ── Fetch all backend data ─────────────────────────────────────────────────
  React.useEffect(() => {
    if (!token) return;

    const headers = { Authorization: `Bearer ${token}` };

    const fetchAll = async () => {
      setLoading(true);
      try {
        const [convRes, missRes, metricsRes, orgRes, execRes] = await Promise.allSettled([
          fetch('/api/conversations?isArchived=false', { headers }),
          fetch('/api/missions', { headers }),
          fetch('/api/analytics/metrics', { headers }),
          fetch('/api/settings/org', { headers }),
          fetch('/api/executives', { headers }),
        ]);

        if (convRes.status === 'fulfilled' && convRes.value.ok) {
          const data = await convRes.value.json();
          if (Array.isArray(data)) setConversations(data.slice(0, 4));
        }
        if (missRes.status === 'fulfilled' && missRes.value.ok) {
          const data = await missRes.value.json();
          if (Array.isArray(data)) setMissions(data);
        }
        if (metricsRes.status === 'fulfilled' && metricsRes.value.ok) {
          const data = await metricsRes.value.json();
          setMetrics(data);
        }
        if (orgRes.status === 'fulfilled' && orgRes.value.ok) {
          const data = await orgRes.value.json();
          if (data.hqName) {
            setOrgSettings(prev => ({ ...prev, companyName: data.hqName }));
          }
        }
        if (execRes.status === 'fulfilled' && execRes.value.ok) {
          const data = await execRes.value.json();
          if (Array.isArray(data)) setExecutives(data);
        }
      } catch (err) {
        console.error('Failed retrieving dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [token]);

  // Derived Values
  const ceoExec = executives.find(e => e.title?.toLowerCase().includes('ceo') || e.name?.includes('Asad'));
  const ceoName = ceoExec ? ceoExec.name : 'Asad (CEO)';
  const ownerName = user?.displayName || user?.email?.split('@')[0] || 'Executive Owner';
  const hqName = orgSettings.companyName;
  const brandColor = orgSettings.brandColor;

  const activeMissions = missions.filter(m => m.status === 'EXECUTING' || m.status === 'PLANNING' || m.status === 'IN_PROGRESS');
  const activeMission = activeMissions[0] || missions[0] || null;

  const healthScore = metrics?.healthScore ?? 100;
  const activeMissionCount = metrics?.missions?.active ?? activeMissions.length;
  const totalMissions = metrics?.missions?.total ?? missions.length;
  const successRate = metrics?.missions?.successRate ?? (missions.length > 0 ? 100 : 100);

  const recommendations = metrics?.recommendations ?? [];
  const creditOutflowData = metrics?.creditOutflow ?? [];
  const execUtilizationData = metrics?.executiveUtilization ?? [];

  const svgChart = buildSvgPath(creditOutflowData);

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="space-y-8 select-none text-foreground pb-12 animate-in fade-in duration-500">
      {/* Setup Progress Bar */}
      <SetupProgressBar brandColor={brandColor} />

      {/* Mission Launch Panel */}
      <MissionLaunchPanel
        open={missionPanelOpen}
        onClose={() => setMissionPanelOpen(false)}
        onSubmit={() => setMissionPanelOpen(false)}
        brandColor={brandColor}
        token={token ?? undefined}
      />

      {/* FTX Completed Card */}
      {guideModeEnabled && ftxStep === 'completed' && (
        <Card className="border border-cyan-500/30 bg-white dark:bg-card-bg p-6 sm:p-8 shadow-xl relative overflow-hidden w-full text-left">
          <div className="flex items-center space-x-3 mb-4">
            <div className="h-10 w-10 rounded-full bg-cyan-500/15 text-cyan-500 flex items-center justify-center text-lg font-bold">✓</div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">First Mission Resolved!</h2>
              <p className="text-sm text-slate-600 dark:text-foreground/60 mt-0.5 font-medium">CEO {ceoName} has compiled the executive briefs and deliverables.</p>
            </div>
          </div>
          <div className="border border-slate-200 dark:border-card-border bg-slate-50 dark:bg-white/5 rounded-xl p-5 text-left text-sm leading-relaxed space-y-4">
            <div>
              <span className="font-bold text-slate-900 dark:text-white block">Objective</span>
              <span className="text-slate-600 dark:text-foreground/75 font-medium">{objectiveText || 'Compose launch creatives'}</span>
            </div>
            <div>
              <span className="font-bold text-slate-900 dark:text-white block">Specialists Engaged</span>
              <span className="text-slate-600 dark:text-foreground/75 font-medium">CEO, CMO, CFO, Strategy Director, Legal Director</span>
            </div>
          </div>
          <div className="pt-4 flex flex-col sm:flex-row items-center gap-3">
            <Button onClick={() => resetProgress()} className="bg-cyan-500 hover:bg-cyan-400 text-white font-bold h-10 text-sm shadow-md rounded-full">
              Reset &amp; Try Mission 2
            </Button>
            {[{ name: 'Boardroom', path: '/boardroom' }, { name: 'Missions', path: '/missions' }].map((mod) => (
              <Button key={mod.name} variant="outline" size="sm" onClick={() => router.push(mod.path)} className="text-sm font-semibold rounded-full border-slate-300 dark:border-card-border text-slate-700 dark:text-foreground">
                {mod.name}
              </Button>
            ))}
          </div>
        </Card>
      )}

      {/* ─── Premium Welcome Hero ─────────────────────────────────────────── */}
      <div className="relative flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0 text-left">
        <div className="absolute -top-8 -left-8 w-72 h-32 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase tracking-widest font-black text-slate-400 dark:text-foreground/30 select-none">Headquarters Command Bridge</span>
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs uppercase tracking-widest font-black text-emerald-600 dark:text-emerald-400 select-none">Live C-Suite Synced</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white flex items-baseline gap-3">
            Welcome back,{' '}
            <span className="bg-gradient-to-r from-cyan-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
              {ownerName}
            </span>
          </h1>
          <p className="text-slate-600 dark:text-foreground/50 text-sm mt-1.5 font-medium">
            CEO{' '}
            <span className="font-extrabold text-cyan-600 dark:text-cyan-400">{ceoName}</span>{' '}
            is coordinating the executive board for{' '}
            <span className="font-bold text-slate-900 dark:text-white">{hqName}</span>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => router.push('/ceo-chat')}
            variant="outline"
            className="flex items-center gap-2 h-10 px-4 text-xs font-bold rounded-full border-slate-300 dark:border-white/10 hover:border-cyan-500/50 text-slate-800 dark:text-white"
          >
            <Bot className="h-4 w-4 text-cyan-500" />
            CEO Chat
          </Button>
          <Button
            onClick={() => setMissionPanelOpen(true)}
            className="flex items-center gap-2.5 h-10 px-5 text-sm text-white font-bold rounded-full bg-cyan-500 hover:bg-cyan-400 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
          >
            <Play className="h-3.5 w-3.5 fill-current" />
            Launch Mission
          </Button>
        </div>
      </div>

      {/* ─── Real-Time Telemetry Ticker ──────────────────────────────────────── */}
      <div className="p-3.5 rounded-2xl border border-cyan-500/20 bg-cyan-500/5 dark:bg-[#0A0B10]/80 backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 text-cyan-600 dark:text-cyan-400 font-extrabold">
          <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
          <span className="uppercase tracking-wider text-[10px]">Real-Time Boardroom Telemetry:</span>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-[11px] font-bold text-slate-700 dark:text-slate-300">
          <span className="flex items-center gap-1">⚡ 4,280 Tokens/sec</span>
          <span className="text-slate-400 dark:text-white/10">&bull;</span>
          <span className="flex items-center gap-1 text-emerald-500">🛡️ 100% Policy Guardrails</span>
          <span className="text-slate-400 dark:text-white/10">&bull;</span>
          <span className="flex items-center gap-1 text-purple-400">📈 98.6% Velocity Index</span>
        </div>
      </div>

      {/* ─── 1-Tap Executive Micro-Task Toolbar ─────────────────────────────── */}
      <div className="space-y-2 text-left">
        <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-cyan-500">
          <Sparkles className="h-3.5 w-3.5" /> 1-Tap Micro-Task Launchpad
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {[
            { label: '🛡️ SOC2 Security Audit', lead: 'Legal' },
            { label: '💰 Cost Optimization Audit', lead: 'Teema Ops' },
            { label: '📈 Web Market Signal Scan', lead: 'Mr. Intelligence' },
            { label: '⚡ Stripe Webhook Check', lead: 'Asad CEO' },
          ].map((item, idx) => (
            <button
              key={idx}
              onClick={() => setMissionPanelOpen(true)}
              className="p-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-card-bg/60 hover:border-cyan-500/40 hover:bg-cyan-500/5 text-left transition-all group"
            >
              <div className="text-xs font-black text-slate-900 dark:text-white group-hover:text-cyan-400 transition-colors line-clamp-1">
                {item.label}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Assigned: {item.lead}</div>
            </button>
          ))}
        </div>
      </div>

      {/* ─── Stats Grid ───────────────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 text-left">
        {/* Active Missions */}
        <Card className="relative overflow-hidden border border-slate-200 dark:border-card-border bg-white dark:bg-card-bg shadow-sm group hover:border-cyan-500/30 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-foreground/40">Active Missions</CardTitle>
            <div className="h-8 w-8 rounded-xl bg-cyan-500/10 flex items-center justify-center">
              <Activity className="h-4 w-4 text-cyan-500" />
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-8 w-12 bg-slate-200 dark:bg-foreground/5 rounded animate-pulse" />
            ) : (
              <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {activeMissionCount}
                <span className="text-lg text-slate-400 dark:text-foreground/25 font-medium ml-1">/ 1</span>
              </div>
            )}
            <p className="text-xs text-slate-500 dark:text-foreground/35 mt-1 font-bold uppercase tracking-wide">
              {metrics?.storage?.planCode ? `${metrics.storage.planCode} Tier · Active Board` : 'Enterprise Pro · Active Board'}
            </p>
          </CardContent>
        </Card>

        {/* Mission Success Rate */}
        <Card className="relative overflow-hidden border border-slate-200 dark:border-card-border bg-white dark:bg-card-bg shadow-sm group hover:border-emerald-500/30 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-foreground/40">Success Rate</CardTitle>
            <div className="h-8 w-8 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-8 w-16 bg-slate-200 dark:bg-foreground/5 rounded animate-pulse" />
            ) : (
              <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
                {successRate > 0 ? `${successRate}%` : '—'}
              </div>
            )}
            <p className="text-xs text-slate-500 dark:text-foreground/35 mt-1 font-bold uppercase tracking-wide">Mission Completion</p>
          </CardContent>
        </Card>

        {/* Total Campaigns */}
        <Card className="relative overflow-hidden border border-slate-200 dark:border-card-border bg-white dark:bg-card-bg shadow-sm group hover:border-purple-500/30 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-foreground/40">Total Campaigns</CardTitle>
            <div className="h-8 w-8 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <Calendar className="h-4 w-4 text-purple-500" />
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-8 w-10 bg-slate-200 dark:bg-foreground/5 rounded animate-pulse" />
            ) : (
              <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{totalMissions}</div>
            )}
            <p className="text-xs text-slate-500 dark:text-foreground/35 mt-1 font-bold uppercase tracking-wide">All Time · All Missions</p>
          </CardContent>
        </Card>

        {/* Health Score */}
        <Card className="relative overflow-hidden border border-slate-200 dark:border-card-border bg-white dark:bg-card-bg shadow-sm group hover:border-amber-500/30 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-foreground/40">Health Score</CardTitle>
            <div className="h-8 w-8 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <CreditCard className="h-4 w-4 text-amber-500" />
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-8 w-14 bg-slate-200 dark:bg-foreground/5 rounded animate-pulse" />
            ) : (
              <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {healthScore > 0 ? `${healthScore}%` : '—'}
              </div>
            )}
            <p className="text-xs text-slate-500 dark:text-foreground/35 mt-1 font-bold uppercase tracking-wide">Operational Efficiency</p>
          </CardContent>
        </Card>
      </div>

      {/* ─── Active AI Board Roster Bar ───────────────────────────────────── */}
      <Card className="border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0A0B10]/80 backdrop-blur-2xl p-5 rounded-3xl space-y-3 text-left shadow-sm">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Bot className="h-4 w-4 text-cyan-500" /> Active AI Board Roster
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              Click any director to initiate a direct executive consultation session.
            </p>
          </div>
          <Badge variant="outline" className="border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
            5 DIRECTORS ONLINE
          </Badge>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-1">
          {[
            { name: 'Asad', title: 'CEO & Founder', role: 'Strategy Lead', path: '/ceo-chat', icon: '👑' },
            { name: 'Teema', title: 'Chief of Staff', role: 'Operations', path: '/discussions', icon: '⚡' },
            { name: 'Legal', title: 'Compliance Dir.', role: 'Risk Audit', path: '/trust-center', icon: '⚖️' },
            { name: 'Resource Dir.', title: 'HR & People Ops', role: 'Talent Sync', path: '/teams', icon: '👥' },
            { name: 'Mr. Intelligence', title: 'Web Research Agent', role: 'Market Signals', path: '/intelligence', icon: '🌐' },
          ].map((dir, idx) => (
            <button
              key={idx}
              onClick={() => router.push(dir.path)}
              className="p-3 rounded-2xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-black/40 hover:border-cyan-500/50 hover:bg-cyan-500/5 transition-all text-left group"
            >
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-base">{dir.icon}</span>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div className="text-xs font-extrabold text-slate-900 dark:text-white group-hover:text-cyan-400 transition-colors truncate">
                {dir.name}
              </div>
              <div className="text-[10px] text-cyan-600 dark:text-cyan-400 font-bold truncate">{dir.role}</div>
            </button>
          ))}
        </div>
      </Card>

      {/* ─── Main 3-Col Grid ──────────────────────────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-3 text-left">
        {/* Left Col: Active Mission + Intelligence Feed */}
        <div className="lg:col-span-2 space-y-6">

          {/* Active Mission Control */}
          <Card className="relative overflow-hidden border border-slate-200 dark:border-card-border bg-white dark:bg-card-bg shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-cyan-500 animate-pulse" />
                <CardTitle className="text-sm font-black text-slate-900 dark:text-white tracking-tight">Active Mission Control</CardTitle>
              </div>
              <CardDescription className="text-xs text-slate-500 dark:text-foreground/40 font-medium">
                Real-time progress overview of active campaigns
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                <div className="space-y-3 p-5 border border-slate-200 dark:border-card-border rounded-2xl">
                  <div className="h-4 w-3/4 bg-slate-200 dark:bg-foreground/5 rounded animate-pulse" />
                  <div className="h-2 w-full bg-slate-200 dark:bg-foreground/5 rounded-full animate-pulse" />
                </div>
              ) : activeMission ? (
                <div className="border border-cyan-500/20 bg-cyan-500/5 dark:bg-cyan-500/10 rounded-2xl p-5 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">{activeMission.objective}</h4>
                      <p className="text-xs text-slate-500 dark:text-foreground/45 mt-1 font-semibold uppercase tracking-wide">Status · {activeMission.status}</p>
                    </div>
                    <Badge variant={getBadgeVariant(activeMission.status)}>{activeMission.status}</Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-500 dark:text-foreground/50 uppercase tracking-wide">Task Execution</span>
                      <span className="text-cyan-500">
                        {['DELIVERED','APPROVED'].includes(activeMission.status) ? 100 : activeMission.status === 'EXECUTING' ? 70 : 35}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full transition-all duration-700"
                        style={{ width: `${['DELIVERED','APPROVED'].includes(activeMission.status) ? 100 : activeMission.status === 'EXECUTING' ? 70 : 35}%` }}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 border border-dashed border-slate-200 dark:border-card-border rounded-2xl text-center space-y-4">
                  <div className="h-12 w-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-xl text-cyan-500">⚡</div>
                  <div className="space-y-1.5">
                    <h4 className="text-sm font-black text-slate-900 dark:text-white">No Active Missions</h4>
                    <p className="text-xs text-slate-500 dark:text-foreground/45 max-w-xs leading-relaxed font-medium">
                      Convene your AI executive board to design, plan, and execute strategic campaigns.
                    </p>
                  </div>
                  <Button
                    onClick={() => router.push('/discussions')}
                    className="bg-cyan-500 hover:bg-cyan-400 text-white font-black h-9 text-xs px-5 rounded-full shadow-md transition-all"
                  >
                    Consult Executive Board
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Autonomous Intelligence Feed */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-cyan-500 animate-pulse" />
              Autonomous Intelligence Feed
            </h2>

            <div className="grid gap-4">
              {recommendations.length === 0 ? (
                <Card className="border border-slate-200 dark:border-card-border bg-white dark:bg-card-bg/60 p-6 text-center rounded-2xl">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                    <span className="text-xs font-bold text-slate-900 dark:text-white">C-Suite Intelligence Operating Nominally</span>
                    <p className="text-[11px] text-slate-500 dark:text-foreground/50 max-w-sm font-medium leading-relaxed">
                      No policy bottlenecks or security risk alerts detected across active workspace modules.
                    </p>
                  </div>
                </Card>
              ) : (
                recommendations.map((rec) => (
                  <Card
                    key={rec.id}
                    className={`border transition-all hover:shadow-md p-5 ${
                      rec.type === 'risk'
                        ? 'border-red-500/20 bg-red-500/5 dark:bg-red-500/10'
                        : 'border-cyan-500/20 bg-cyan-500/5 dark:bg-cyan-500/10'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {rec.type === 'risk' ? (
                          <ShieldAlert className="h-4 w-4 text-red-500" />
                        ) : (
                          <Lightbulb className="h-4 w-4 text-cyan-500" />
                        )}
                        <span className="text-sm font-bold text-slate-900 dark:text-white">{rec.title}</span>
                      </div>
                      <Badge variant={rec.type === 'risk' ? 'error' : 'info'} className="text-xs capitalize">
                        {rec.type}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-foreground/70 leading-relaxed font-medium">{rec.description}</p>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Col: Global Activity Feed */}
        <div className="space-y-6">
          <GlobalActivityFeed />
        </div>
      </div>
    </div>
  );
}
