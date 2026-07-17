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
  { from: 'from-hq-blue', to: 'to-hq-cyan', shadow: 'shadow-[0_0_6px_rgba(10,132,255,0.3)]' },
  { from: 'from-hq-cyan', to: 'to-[#30D158]', shadow: 'shadow-[0_0_6px_rgba(48,209,88,0.25)]' },
  { from: 'from-hq-purple', to: 'to-[#bf5af2]', shadow: 'shadow-[0_0_6px_rgba(191,90,242,0.25)]' },
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
          setOrgSettings({
            companyName: data.companyName || 'HQ Corporation',
            brandColor: data.brandColor || '#0A84FF',
            secondaryColor: data.secondaryColor || '#8B5CF6',
          });
        }
        if (execRes.status === 'fulfilled' && execRes.value.ok) {
          const data = await execRes.value.json();
          if (Array.isArray(data)) setExecutives(data);
        }
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [token]);

  // ── Derived values ─────────────────────────────────────────────────────────
  const activeMission = missions.find(
    (m: any) => m.status === 'PLANNING' || m.status === 'IN_PROGRESS' || m.status === 'RUNNING' || m.status === 'EXECUTING'
  ) || (missions.length > 0 ? missions[0] : null);

  const ceoExec = executives.find(e => e.title?.toLowerCase().includes('ceo') || e.title?.toLowerCase().includes('chief executive'));
  const ceoName = ceoExec?.name || 'Elena Rostova';
  const brandColor = orgSettings.brandColor;
  const hqName = orgSettings.companyName;

  const ownerName = user?.email
    ? user.email.split('@')[0].charAt(0).toUpperCase() + user.email.split('@')[0].slice(1)
    : 'Owner';

  // Analytics derived
  const activeMissionCount = metrics?.missions.active ?? missions.filter(m => ['PLANNING','IN_PROGRESS','RUNNING','EXECUTING'].includes(m.status)).length;
  const successRate = metrics?.missions.successRate ?? 0;
  const totalMissions = metrics?.missions.total ?? missions.length;
  const healthScore = metrics?.healthScore ?? 0;

  const executiveUtilization = metrics?.executiveUtilization ?? [];
  const creditOutflow = metrics?.creditOutflow ?? [];
  const recommendations = metrics?.recommendations ?? [];

  const svgChart = React.useMemo(() => buildSvgPath(creditOutflow), [creditOutflow]);

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="space-y-8 select-none text-foreground pb-12">
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
        <Card className="border border-hq-blue/20 bg-card-bg p-6 sm:p-8 shadow-2xl relative overflow-hidden animate-in fade-in duration-300 w-full text-left">
          <div className="flex items-center space-x-3 mb-4">
            <div className="h-10 w-10 rounded-full bg-hq-blue/15 text-hq-blue flex items-center justify-center text-lg font-bold">✓</div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-foreground">First Mission Resolved!</h2>
              <p className="text-sm text-foreground/60 mt-0.5">CEO {ceoName} has compiled the executive briefs and deliverables.</p>
            </div>
          </div>
          <div className="border border-card-border bg-black/5 dark:bg-white/5 rounded-xl p-5 text-left text-sm leading-relaxed space-y-4">
            <div>
              <span className="font-bold text-foreground block">Objective</span>
              <span className="text-foreground/75">{objectiveText || 'Compose launch creatives'}</span>
            </div>
            <div>
              <span className="font-bold text-foreground block">Specialists Engaged</span>
              <span className="text-foreground/75">CEO, CMO, CFO, Strategy Director, Legal Director</span>
            </div>
          </div>
          <div className="pt-4 flex flex-col sm:flex-row items-center gap-3">
            <Button onClick={() => resetProgress()} className="bg-hq-blue hover:bg-hq-blue/90 text-white font-bold h-10 text-sm shadow-lg rounded-full">
              Reset &amp; Try Mission 2
            </Button>
            {[{ name: 'Boardroom', path: '/boardroom' }, { name: 'Missions', path: '/missions' }].map((mod) => (
              <Button key={mod.name} variant="outline" size="sm" onClick={() => router.push(mod.path)} className="text-sm font-semibold rounded-full">
                {mod.name}
              </Button>
            ))}
          </div>
        </Card>
      )}

      {/* ─── Premium Welcome Hero ─────────────────────────────────────────── */}
      <div className="relative flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0 text-left">
        <div className="absolute -top-8 -left-8 w-72 h-32 bg-hq-blue/5 rounded-full blur-3xl pointer-events-none" />
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase tracking-widest font-black text-foreground/30 select-none">Headquarters Dashboard</span>
            <span className="h-1 w-1 rounded-full bg-hq-cyan animate-pulse" />
            <span className="text-xs uppercase tracking-widest font-black text-hq-cyan/60 select-none">Online</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-foreground flex items-baseline gap-3">
            Welcome back,{' '}
            <span className="bg-gradient-to-r from-hq-blue via-[#bf5af2] to-hq-cyan bg-clip-text text-transparent">
              {ownerName}
            </span>
          </h1>
          <p className="text-foreground/50 text-sm mt-1.5 font-medium">
            CEO{' '}
            <span className="font-extrabold" style={{ color: brandColor }}>{ceoName}</span>{' '}
            is coordinating the executive board for{' '}
            <span className="font-bold text-foreground/70">{hqName}</span>.
          </p>
        </div>

        <Button
          onClick={() => setMissionPanelOpen(true)}
          className="flex items-center gap-2.5 h-10 px-5 text-sm text-white font-bold rounded-full shadow-[0_4px_20px_rgba(10,132,255,0.3)] hover:shadow-[0_4px_28px_rgba(10,132,255,0.45)] transition-all duration-300 hover:scale-[1.02]"
          style={{ backgroundColor: brandColor }}
        >
          <Play className="h-3.5 w-3.5" />
          Launch New Mission
        </Button>
      </div>

      {/* ─── Stats Grid ───────────────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Active Missions — real data */}
        <Card className="relative overflow-hidden border border-card-border bg-card-bg shadow-[var(--card-shadow)] group hover:border-hq-blue/30 hover:shadow-[0_8px_30px_rgba(10,132,255,0.08)] transition-all duration-300">
          <div className="absolute top-0 right-0 w-20 h-20 bg-hq-blue/5 rounded-full blur-2xl group-hover:bg-hq-blue/10 transition-colors" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-black uppercase tracking-widest text-foreground/40">Active Missions</CardTitle>
            <div className="h-7 w-7 rounded-lg bg-hq-blue/10 flex items-center justify-center">
              <Activity className="h-3.5 w-3.5 text-hq-blue" />
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-8 w-12 bg-foreground/5 rounded animate-pulse" />
            ) : (
              <div className="text-3xl font-black text-foreground tracking-tight">
                {activeMissionCount}
                <span className="text-lg text-foreground/25 font-medium ml-1">/ 1</span>
              </div>
            )}
            <p className="text-xs text-foreground/35 mt-1 font-bold uppercase tracking-wide">Free Tier · Max 1 Active</p>
          </CardContent>
        </Card>

        {/* Mission Success Rate — real data */}
        <Card className="relative overflow-hidden border border-card-border bg-card-bg shadow-[var(--card-shadow)] group hover:border-hq-cyan/30 hover:shadow-[0_8px_30px_rgba(48,209,88,0.08)] transition-all duration-300">
          <div className="absolute top-0 right-0 w-20 h-20 bg-hq-cyan/5 rounded-full blur-2xl group-hover:bg-hq-cyan/10 transition-colors" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-black uppercase tracking-widest text-foreground/40">Success Rate</CardTitle>
            <div className="h-7 w-7 rounded-lg bg-hq-cyan/10 flex items-center justify-center">
              <TrendingUp className="h-3.5 w-3.5 text-hq-cyan" />
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-8 w-16 bg-foreground/5 rounded animate-pulse" />
            ) : (
              <div className="text-3xl font-black text-hq-cyan tracking-tight">
                {successRate > 0 ? `${successRate}%` : '—'}
              </div>
            )}
            <p className="text-xs text-foreground/35 mt-1 font-bold uppercase tracking-wide">Mission Completion</p>
          </CardContent>
        </Card>

        {/* Total Campaigns — real data */}
        <Card className="relative overflow-hidden border border-card-border bg-card-bg shadow-[var(--card-shadow)] group hover:border-hq-purple/30 hover:shadow-[0_8px_30px_rgba(191,90,242,0.08)] transition-all duration-300">
          <div className="absolute top-0 right-0 w-20 h-20 bg-hq-purple/5 rounded-full blur-2xl group-hover:bg-hq-purple/10 transition-colors" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-black uppercase tracking-widest text-foreground/40">Total Campaigns</CardTitle>
            <div className="h-7 w-7 rounded-lg bg-hq-purple/10 flex items-center justify-center">
              <Calendar className="h-3.5 w-3.5 text-hq-purple" />
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-8 w-10 bg-foreground/5 rounded animate-pulse" />
            ) : (
              <div className="text-3xl font-black text-foreground tracking-tight">{totalMissions}</div>
            )}
            <p className="text-xs text-foreground/35 mt-1 font-bold uppercase tracking-wide">All Time · All Missions</p>
          </CardContent>
        </Card>

        {/* Health Score — real data */}
        <Card className="relative overflow-hidden border border-card-border bg-card-bg shadow-[var(--card-shadow)] group hover:border-amber-500/30 hover:shadow-[0_8px_30px_rgba(255,149,0,0.08)] transition-all duration-300">
          <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-colors" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-black uppercase tracking-widest text-foreground/40">Health Score</CardTitle>
            <div className="h-7 w-7 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <CreditCard className="h-3.5 w-3.5 text-amber-500" />
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-8 w-14 bg-foreground/5 rounded animate-pulse" />
            ) : (
              <div className="text-3xl font-black text-foreground tracking-tight">
                {healthScore > 0 ? `${healthScore}%` : '—'}
              </div>
            )}
            <p className="text-xs text-foreground/35 mt-1 font-bold uppercase tracking-wide">Operational Efficiency</p>
          </CardContent>
        </Card>
      </div>

      {/* ─── Main 3-Col Grid ──────────────────────────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Col: Active Mission + Intelligence Feed */}
        <div className="lg:col-span-2 space-y-6">

          {/* Active Mission Control */}
          <Card className="relative overflow-hidden border border-card-border bg-card-bg shadow-[var(--card-shadow)] hover:border-hq-blue/20 transition-all duration-300">
            <div className="absolute top-0 right-0 w-48 h-24 bg-hq-blue/[0.04] rounded-full blur-3xl pointer-events-none" />
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-hq-blue shadow-[0_0_6px_rgba(10,132,255,0.8)] animate-pulse" />
                <CardTitle className="text-sm font-black text-foreground tracking-tight">Active Mission Control</CardTitle>
              </div>
              <CardDescription className="text-sm text-foreground/40 font-medium">
                Real-time progress overview of active campaigns
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                <div className="space-y-3 p-5 border border-card-border rounded-2xl">
                  <div className="h-4 w-3/4 bg-foreground/5 rounded animate-pulse" />
                  <div className="h-2 w-full bg-foreground/5 rounded-full animate-pulse" />
                  <div className="h-3 w-1/2 bg-foreground/5 rounded animate-pulse" />
                </div>
              ) : activeMission ? (
                <div className="border border-hq-blue/15 bg-hq-blue/[0.03] dark:bg-hq-blue/[0.05] rounded-2xl p-5 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-foreground line-clamp-1">{activeMission.objective}</h4>
                      <p className="text-xs text-foreground/45 mt-1 font-semibold uppercase tracking-wide">Status · {activeMission.status}</p>
                    </div>
                    <Badge variant={getBadgeVariant(activeMission.status)}>{activeMission.status}</Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-foreground/50 uppercase tracking-wide">Task Execution</span>
                      <span className="text-hq-blue">
                        {['DELIVERED','APPROVED'].includes(activeMission.status) ? 100 : activeMission.status === 'EXECUTING' ? 70 : 35}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-black/5 dark:bg-white/[0.05] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-hq-blue to-hq-cyan rounded-full transition-all duration-700 shadow-[0_0_8px_rgba(10,132,255,0.4)]"
                        style={{ width: `${['DELIVERED','APPROVED'].includes(activeMission.status) ? 100 : activeMission.status === 'EXECUTING' ? 70 : 35}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex justify-between text-xs pt-1">
                    <span className="text-foreground/35 font-bold uppercase tracking-wide">Platform Coordinator</span>
                    <span className="font-black text-hq-purple">{ceoName} · CEO</span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 border border-dashed border-card-border rounded-2xl text-center space-y-4">
                  <div className="h-12 w-12 rounded-2xl bg-hq-blue/10 border border-hq-blue/20 flex items-center justify-center text-xl">⚡</div>
                  <div className="space-y-1.5">
                    <h4 className="text-sm font-black text-foreground">No Active Missions</h4>
                    <p className="text-sm text-foreground/45 max-w-xs leading-relaxed font-medium">
                      Convene your AI executive board to design, plan, and execute strategic campaigns.
                    </p>
                  </div>
                  <Button
                    onClick={() => router.push('/discussions')}
                    className="bg-hq-blue hover:bg-hq-blue/90 text-white font-black h-9 text-sm px-5 rounded-full shadow-[0_4px_14px_rgba(10,132,255,0.3)] hover:shadow-[0_4px_20px_rgba(10,132,255,0.4)] transition-all"
                  >
                    Consult Executive Board
                  </Button>
                </div>
              )}
            </CardContent>
            {activeMission && !loading && (
              <CardFooter className="flex justify-end border-t border-card-border/50 pt-3 pb-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push(`/missions/${activeMission.id}`)}
                  className="flex items-center gap-1.5 text-sm font-bold text-hq-blue hover:bg-hq-blue/5 rounded-lg"
                >
                  Open Timeline
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </CardFooter>
            )}
            {!activeMission && !loading && (
              <CardFooter className="flex justify-center border-t border-card-border/50 pt-3 pb-3 text-xs text-foreground/30 font-bold uppercase tracking-wider">
                Orchestrate objectives automatically from boardroom debates
              </CardFooter>
            )}
          </Card>

          {/* Autonomous Intelligence Feed — real recommendations from backend */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-hq-cyan animate-pulse" />
              Autonomous Intelligence Feed
            </h2>

            {loading ? (
              <div className="space-y-3">
                {[1, 2].map(i => (
                  <Card key={i} className="border border-card-border bg-card-bg p-5 space-y-3">
                    <div className="h-4 w-2/3 bg-foreground/5 rounded animate-pulse" />
                    <div className="h-3 w-full bg-foreground/5 rounded animate-pulse" />
                    <div className="h-3 w-4/5 bg-foreground/5 rounded animate-pulse" />
                  </Card>
                ))}
              </div>
            ) : recommendations.length === 0 ? (
              <Card className="border border-dashed border-card-border bg-card-bg p-8 text-center">
                <p className="text-sm text-foreground/40 font-medium">No recommendations yet — launch a mission to generate intelligence insights.</p>
              </Card>
            ) : (
              <div className="grid gap-4">
                {recommendations.map((rec) => (
                  <Card
                    key={rec.id}
                    className={`border transition-all hover:shadow-md shadow-[var(--card-shadow)] ${
                      rec.type === 'risk'
                        ? 'border-red-500/20 bg-red-500/[0.03] hover:border-red-500/30'
                        : rec.type === 'opportunity'
                          ? 'border-hq-cyan/20 bg-hq-cyan/[0.03] hover:border-hq-cyan/30'
                          : 'border-card-border bg-card-bg'
                    }`}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {rec.type === 'risk' ? (
                            <ShieldAlert className="h-4 w-4 text-red-400" />
                          ) : rec.type === 'opportunity' ? (
                            <Lightbulb className="h-4 w-4 text-hq-cyan" />
                          ) : (
                            <Activity className="h-4 w-4 text-hq-purple" />
                          )}
                          <span className="text-sm font-bold text-foreground">{rec.title}</span>
                        </div>
                        <Badge
                          variant={rec.type === 'risk' ? 'error' : rec.type === 'opportunity' ? 'warning' : 'info'}
                          className="text-xs capitalize"
                        >
                          {rec.type}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm text-left">
                      <p className="text-foreground/70 leading-relaxed">{rec.description}</p>
                      <div className="flex flex-wrap gap-6 text-xs text-foreground/45 border-t border-card-border/50 pt-2.5">
                        <div>
                          <span className="font-bold block text-foreground/60">Confidence Score</span>
                          <span className="text-hq-cyan font-mono mt-0.5 block font-black">{rec.confidence}%</span>
                        </div>
                        <div>
                          <span className="font-bold block text-foreground/60">Signal Type</span>
                          <span className="text-foreground font-mono mt-0.5 block capitalize">{rec.type}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ─── Right Col: Charts, Utilization, Discussions, Activity ─────── */}
        <div className="space-y-6">

          {/* Credit Outflow Chart — real data from backend */}
          <Card className="border border-card-border bg-card-bg shadow-[var(--card-shadow)] overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <CardTitle className="text-xs font-black uppercase tracking-widest text-foreground/40">Credit Outflow Trend</CardTitle>
                <span className="text-xs text-foreground/25 font-mono">· Weekly</span>
              </div>
            </CardHeader>
            <CardContent className="pt-2 flex flex-col items-center px-3">
              {loading ? (
                <div className="w-full h-28 bg-foreground/5 rounded-xl animate-pulse" />
              ) : creditOutflow.length > 0 ? (
                <>
                  <svg className="w-full h-28" viewBox="0 0 300 100" fill="none">
                    <defs>
                      <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0A84FF" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#0A84FF" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <line x1="0" y1="20" x2="300" y2="20" stroke="currentColor" strokeOpacity={0.06} strokeWidth="0.5" />
                    <line x1="0" y1="50" x2="300" y2="50" stroke="currentColor" strokeOpacity={0.06} strokeWidth="0.5" />
                    <line x1="0" y1="80" x2="300" y2="80" stroke="currentColor" strokeOpacity={0.06} strokeWidth="0.5" />
                    {svgChart.area && <path d={svgChart.area} fill="url(#areaGrad)" />}
                    {svgChart.line && <path d={svgChart.line} stroke="#0A84FF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />}
                    {svgChart.points.map((p, i) => (
                      <g key={i}>
                        <circle cx={p.x} cy={p.y} r="3" fill="#0A84FF" fillOpacity={0.2} />
                        <circle cx={p.x} cy={p.y} r="1.5" fill="#0A84FF" />
                      </g>
                    ))}
                  </svg>
                  <div className="flex justify-between w-full text-xs text-foreground/30 px-1 font-mono font-bold tracking-wider mt-1">
                    {creditOutflow.map(d => <span key={d.day}>{d.day.substring(0, 3).toUpperCase()}</span>)}
                  </div>
                </>
              ) : (
                <div className="w-full h-28 flex items-center justify-center">
                  <p className="text-xs text-foreground/30 font-medium">No credit data yet</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Executive Utilization — real data from backend */}
          <Card className="border border-card-border bg-card-bg shadow-[var(--card-shadow)]">
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-black uppercase tracking-widest text-foreground/40">Executive Utilization</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-left">
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="space-y-1.5">
                      <div className="h-3 w-2/3 bg-foreground/5 rounded animate-pulse" />
                      <div className="h-1.5 w-full bg-foreground/5 rounded-full animate-pulse" />
                    </div>
                  ))}
                </div>
              ) : executiveUtilization.length === 0 ? (
                <p className="text-xs text-foreground/35 font-medium">No utilization data available</p>
              ) : (
                executiveUtilization.slice(0, 4).map((exec, idx) => {
                  const color = EXEC_BAR_COLORS[idx % EXEC_BAR_COLORS.length];
                  return (
                    <div key={exec.name} className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-foreground/70 font-bold truncate max-w-[160px]">{exec.name} · {exec.title.split(' ')[0]}</span>
                        <span className="text-foreground/40 font-mono ml-2 shrink-0">{exec.percentage}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-black/5 dark:bg-white/[0.05] rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${color.from} ${color.to} rounded-full ${color.shadow}`}
                          style={{ width: `${exec.percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>

          {/* Active Discussions — real data */}
          <Card className="border border-card-border bg-card-bg shadow-[var(--card-shadow)]">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-black text-foreground tracking-tight">Active Discussions</CardTitle>
              <CardDescription className="text-sm text-foreground/40 font-medium">Your operational boardroom debates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {loading ? (
                <div className="space-y-2">
                  {[1, 2].map(i => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl">
                      <div className="h-8 w-8 rounded-xl bg-foreground/5 animate-pulse shrink-0" />
                      <div className="h-3 flex-1 bg-foreground/5 rounded animate-pulse" />
                    </div>
                  ))}
                </div>
              ) : conversations.length > 0 ? (
                conversations.map((conv: any) => (
                  <div
                    key={conv.id}
                    onClick={() => router.push(`/discussions/${conv.id}`)}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-hq-blue/[0.05] cursor-pointer transition-all border border-transparent hover:border-hq-blue/15 group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-hq-blue/20 to-hq-purple/10 border border-hq-blue/20 text-hq-blue flex items-center justify-center font-black text-xs uppercase shrink-0">
                        {conv.title ? conv.title.substring(0, 2) : 'BD'}
                      </div>
                      <div className="text-xs text-left min-w-0">
                        <p className="font-bold text-foreground line-clamp-1 group-hover:text-hq-blue transition-colors">{conv.title || 'Untitled Boardroom Session'}</p>
                        <p className="text-xs text-foreground/35 font-bold uppercase tracking-wide mt-0.5">Active · Boardroom</p>
                      </div>
                    </div>
                    <Badge variant={conv.missionId ? 'success' : 'ai'} className="text-xs shrink-0 ml-2">
                      {conv.missionId ? 'Orchestrated' : 'Active'}
                    </Badge>
                  </div>
                ))
              ) : (
                <div
                  onClick={() => router.push('/discussions')}
                  className="flex items-center justify-center flex-col py-8 space-y-3 border border-dashed border-card-border rounded-xl cursor-pointer hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-all"
                >
                  <span className="text-sm font-bold text-foreground/40">No debates started yet</span>
                  <Button size="sm" className="text-sm h-7 bg-hq-blue text-white hover:bg-hq-blue/90 font-black px-4 rounded-full shadow-[0_2px_8px_rgba(10,132,255,0.3)]">
                    Open Boardroom
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Global Activity Feed — always live */}
          <Card className="border border-card-border bg-card-bg shadow-[var(--card-shadow)]">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-black text-foreground tracking-tight">Headquarters Activity</CardTitle>
              <CardDescription className="text-sm text-foreground/40 font-medium">Live operational timeline</CardDescription>
            </CardHeader>
            <CardContent>
              <GlobalActivityFeed maxItems={6} compact token={token ?? undefined} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
