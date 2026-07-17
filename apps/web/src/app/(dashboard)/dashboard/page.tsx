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
  ChevronRight,
  ArrowRight,
  Activity,
  Sparkles,
  Lightbulb,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '../../../contexts/auth-context';
import { useGuideMode } from '../../../contexts/guide-mode-context';
import { GlobalActivityFeed } from '../../../components/global-activity-feed';
import { SetupProgressBar } from '../../../components/setup-progress-bar';
import { MissionLaunchPanel } from '../../../components/mission-launch-panel';

interface RecommendationCard {
  id: string;
  title: string;
  type: 'opportunity' | 'risk' | 'brief';
  confidence: number;
  impact: 'High' | 'Medium' | 'Critical';
  urgency: 'Action Required' | 'Attention' | 'Informational';
  benefit: string;
  directors: string[];
  description: string;
}

export default function DashboardPage() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [missionPanelOpen, setMissionPanelOpen] = React.useState(false);

  // Custom onboarding data sync states
  const [ceoName, setCeoName] = React.useState('Elena Rostova');
  const [brandColor, setBrandColor] = React.useState('#0A84FF');
  const [hqName, setHqName] = React.useState('HQ Corporation');

  const {
    guideModeEnabled,
    ftxStep,
    setFtxStep,
    startMission,
    completeMission,
    objectiveText,
    resetProgress,
  } = useGuideMode();

  const [promptInput, setPromptInput] = React.useState('');

  // 1. Fetch real dashboard data (conversations & missions)
  const [conversations, setConversations] = React.useState<any[]>([]);
  const [missions, setMissions] = React.useState<any[]>([]);
  const [loadingRealData, setLoadingRealData] = React.useState(true);

  React.useEffect(() => {
    if (!token) return;
    setLoadingRealData(true);

    const fetchDashboardData = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };
        
        // Fetch conversations
        const convRes = await fetch('/api/conversations', { headers });
        if (convRes.ok) {
          const convData = await convRes.json();
          if (Array.isArray(convData)) {
            setConversations(convData.slice(0, 4));
          }
        }

        // Fetch missions
        const missRes = await fetch('/api/missions', { headers });
        if (missRes.ok) {
          const missData = await missRes.json();
          if (Array.isArray(missData)) {
            setMissions(missData);
          }
        }
      } catch (err) {
        console.error('Error fetching dashboard database connections:', err);
      } finally {
        setLoadingRealData(false);
      }
    };

    fetchDashboardData();
  }, [token]);

  // Find the single active/running mission
  const activeMission = missions.find(
    (m: any) => m.status === 'PLANNING' || m.status === 'IN_PROGRESS' || m.status === 'RUNNING'
  ) || (missions.length > 0 ? missions[0] : null);

  const getBadgeVariant = (status: string) => {
    if (status === 'APPROVED' || status === 'DELIVERED') return 'success';
    if (status === 'PLANNING') return 'ai';
    if (status === 'ARCHIVED') return 'neutral';
    return 'warning';
  };

  // Read onboarding cached setup parameters
  React.useEffect(() => {
    const draftStr = localStorage.getItem('hq_onboarding_draft');
    if (draftStr) {
      try {
        const draft = JSON.parse(draftStr);
        if (draft.ceoName) setCeoName(draft.ceoName);
        if (draft.brandColor) setBrandColor(draft.brandColor);
        if (draft.orgName) setHqName(`${draft.orgName} HQ`);
      } catch (e) {
        console.warn('Error reading onboarding draft:', e);
      }
    }
  }, []);

  const ownerName = user?.email
    ? user.email.split('@')[0].charAt(0).toUpperCase() + user.email.split('@')[0].slice(1)
    : 'Owner';

  const recommendations: RecommendationCard[] = [
    {
      id: 'rec-1',
      title: 'West African Corridors Scaling Opportunity',
      type: 'opportunity',
      confidence: 92,
      impact: 'High',
      urgency: 'Action Required',
      benefit: '+$4.2M gross B2B logistics throughput',
      directors: [`${ceoName} (CEO)`, 'Alistair Thorne (Strategy)'],
      description:
        'Expand shipping outreach parameters targeting regional refineries and hubs in Ghana and Nigeria.',
    },
    {
      id: 'rec-2',
      title: 'Stripe API Webhook Compliance Flags',
      type: 'risk',
      confidence: 97,
      impact: 'Critical',
      urgency: 'Attention',
      benefit: 'Prevent checkout session throttling',
      directors: ['Jack Bauer (Security CISO)', 'Sophia Sterling (Finance)'],
      description:
        'Stripe webhook signature validations require rotation to avoid sandbox simulation bypasses.',
    },
    {
      id: 'rec-3',
      title: 'PGVector Memory Expansion Recommendations',
      type: 'brief',
      confidence: 85,
      impact: 'Medium',
      urgency: 'Informational',
      benefit: 'Lower LLM query token overheads by 22%',
      directors: ['Linus Kovacs (Software Eng.)'],
      description:
        'Promote active working memory segments into long-term organizational knowledge databases.',
    },
  ];

  // ==========================================
  // STANDARD ENTERPRISE DASHBOARD RENDER ENGINE
  // ==========================================
  return (
    <div className="space-y-8 select-none text-foreground pb-12">
      {/* Setup Progress Bar — shown to new users */}
      <SetupProgressBar brandColor={brandColor} />

      {/* Mission Launch Panel */}
      <MissionLaunchPanel
        open={missionPanelOpen}
        onClose={() => setMissionPanelOpen(false)}
        onSubmit={() => setMissionPanelOpen(false)}
        brandColor={brandColor}
        token={token ?? undefined}
      />

      {/* Mission Summary Card when completed */}
      {guideModeEnabled && ftxStep === 'completed' && (
        <Card className="border border-hq-blue/20 bg-[#0B0B0E]/80 backdrop-blur-md p-6 sm:p-8 shadow-2xl relative overflow-hidden animate-in fade-in duration-300 w-full text-left">
          <div className="flex items-center space-x-3 mb-4">
            <div className="h-10 w-10 rounded-full bg-hq-blue/15 text-hq-blue flex items-center justify-center text-lg font-bold">
              ✓
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white">First Mission Resolved!</h2>
              <p className="text-xs text-foreground/60 mt-0.5">
                CEO {ceoName} has compiled the executive briefs and deliverables.
              </p>
            </div>
          </div>

          <div className="border border-card-border bg-black/5 dark:bg-white/5 rounded-xl p-5 text-left text-xs leading-relaxed space-y-4">
            <div>
              <span className="font-bold text-foreground block">Objective</span>
              <span className="text-foreground/75">{objectiveText || 'Compose launch creatives'}</span>
            </div>
            <div>
              <span className="font-bold text-foreground block">Specialists Engaged</span>
              <span className="text-foreground/75">CEO, CMO, CFO, Strategy Director, Legal Director</span>
            </div>
            <div>
              <span className="font-bold text-foreground block">Resolutions & Deliverables</span>
              <ul className="list-disc pl-4 space-y-1 mt-1 text-foreground/70">
                <li>Seeded brand design guidelines and primary styling settings values.</li>
                <li>Completed competitive analysis model draft and regional compliance validation checks.</li>
                <li>Created PDF brief report saved inside the Asset Center directory.</li>
              </ul>
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center gap-3">
            <Button
              onClick={() => resetProgress()}
              className="w-full sm:w-auto bg-hq-blue hover:bg-hq-blue/90 text-white font-bold h-10 text-xs shadow-lg"
            >
              Reset and Try Mission 2
            </Button>
            <div className="flex gap-2 flex-wrap justify-center sm:justify-start">
              {[
                { name: 'Boardroom', path: '/boardroom' },
                { name: 'Missions', path: '/missions' },
                { name: 'Assets', path: '/assets' },
                { name: 'Analytics', path: '/analytics' },
              ].map((mod) => (
                <Button
                  key={mod.name}
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(mod.path)}
                  className="text-xs text-foreground/75 hover:text-white font-semibold"
                >
                  {mod.name}
                </Button>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Premium Welcome Hero */}
      <div className="relative flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0 text-left">
        {/* Ambient background glow */}
        <div className="absolute -top-8 -left-8 w-72 h-32 bg-hq-blue/5 rounded-full blur-3xl pointer-events-none" />
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase tracking-widest font-black text-foreground/30 select-none">Headquarters Dashboard</span>
            <span className="h-1 w-1 rounded-full bg-hq-cyan animate-pulse" />
            <span className="text-[10px] uppercase tracking-widest font-black text-hq-cyan/60 select-none">Online</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-foreground flex items-baseline gap-3">
            Welcome back,{' '}
            <span className="bg-gradient-to-r from-hq-blue via-[#bf5af2] to-hq-cyan bg-clip-text text-transparent">
              {ownerName}
            </span>
          </h1>
          <p className="text-foreground/50 text-sm mt-1.5 font-medium">
            CEO{' '}
            <span className="font-extrabold" style={{ color: brandColor }}>
              {ceoName}
            </span>{' '}
            is coordinating the executive board for{' '}
            <span className="font-bold text-foreground/70">{hqName}</span>.
          </p>
        </div>

        <Button
          onClick={() => setMissionPanelOpen(true)}
          className="flex items-center gap-2.5 h-10 px-5 text-xs text-white font-bold rounded-full shadow-[0_4px_20px_rgba(10,132,255,0.3)] hover:shadow-[0_4px_28px_rgba(10,132,255,0.45)] transition-all duration-300 hover:scale-[1.02]"
          style={{ backgroundColor: brandColor }}
        >
          <Play className="h-3.5 w-3.5" />
          Launch New Mission
        </Button>
      </div>

      {/* Premium Statistics Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Active Missions */}
        <Card className="relative overflow-hidden border border-card-border bg-card-bg shadow-[var(--card-shadow)] card-transition group hover:border-hq-blue/30 hover:shadow-[0_8px_30px_rgba(10,132,255,0.08)] transition-all duration-300">
          <div className="absolute top-0 right-0 w-20 h-20 bg-hq-blue/5 rounded-full blur-2xl group-hover:bg-hq-blue/10 transition-colors" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-[9px] font-black uppercase tracking-widest text-foreground/40">
              Active Missions
            </CardTitle>
            <div className="h-7 w-7 rounded-lg bg-hq-blue/10 flex items-center justify-center">
              <Activity className="h-3.5 w-3.5 text-hq-blue" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-foreground tracking-tight">
              {missions.filter(m => m.status === 'PLANNING' || m.status === 'IN_PROGRESS' || m.status === 'RUNNING').length}
              <span className="text-lg text-foreground/25 font-medium ml-1">/ 1</span>
            </div>
            <p className="text-[9px] text-foreground/35 mt-1 font-bold uppercase tracking-wide">
              Free Tier · Max 1 Active
            </p>
          </CardContent>
        </Card>

        {/* Weekly Growth */}
        <Card className="relative overflow-hidden border border-card-border bg-card-bg shadow-[var(--card-shadow)] card-transition group hover:border-hq-cyan/30 hover:shadow-[0_8px_30px_rgba(48,209,88,0.08)] transition-all duration-300">
          <div className="absolute top-0 right-0 w-20 h-20 bg-hq-cyan/5 rounded-full blur-2xl group-hover:bg-hq-cyan/10 transition-colors" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-[9px] font-black uppercase tracking-widest text-foreground/40">
              Weekly Growth
            </CardTitle>
            <div className="h-7 w-7 rounded-lg bg-hq-cyan/10 flex items-center justify-center">
              <TrendingUp className="h-3.5 w-3.5 text-hq-cyan" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-hq-cyan tracking-tight">+24.5%</div>
            <p className="text-[9px] text-foreground/35 mt-1 font-bold uppercase tracking-wide">
              vs. Previous Week
            </p>
          </CardContent>
        </Card>

        {/* Scheduled Tasks */}
        <Card className="relative overflow-hidden border border-card-border bg-card-bg shadow-[var(--card-shadow)] card-transition group hover:border-hq-purple/30 hover:shadow-[0_8px_30px_rgba(191,90,242,0.08)] transition-all duration-300">
          <div className="absolute top-0 right-0 w-20 h-20 bg-hq-purple/5 rounded-full blur-2xl group-hover:bg-hq-purple/10 transition-colors" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-[9px] font-black uppercase tracking-widest text-foreground/40">
              Scheduled Tasks
            </CardTitle>
            <div className="h-7 w-7 rounded-lg bg-hq-purple/10 flex items-center justify-center">
              <Calendar className="h-3.5 w-3.5 text-hq-purple" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-foreground tracking-tight">{missions.length}</div>
            <p className="text-[9px] text-foreground/35 mt-1 font-bold uppercase tracking-wide">
              Total Campaigns
            </p>
          </CardContent>
        </Card>

        {/* Available Credits */}
        <Card className="relative overflow-hidden border border-card-border bg-card-bg shadow-[var(--card-shadow)] card-transition group hover:border-amber-500/30 hover:shadow-[0_8px_30px_rgba(255,149,0,0.08)] transition-all duration-300">
          <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-colors" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-[9px] font-black uppercase tracking-widest text-foreground/40">
              Available Credits
            </CardTitle>
            <div className="h-7 w-7 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <CreditCard className="h-3.5 w-3.5 text-amber-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-foreground tracking-tight">9,420</div>
            <p className="text-[9px] text-foreground/35 mt-1 font-bold uppercase tracking-wide">
              Resets in 12 Days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid Section */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Side: Active Mission & Autonomous Intelligence Feed */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Mission Control */}
          <Card className="relative overflow-hidden border border-card-border bg-card-bg shadow-[var(--card-shadow)] card-transition hover:border-hq-blue/20 transition-all duration-300">
            <div className="absolute top-0 right-0 w-48 h-24 bg-hq-blue/[0.04] rounded-full blur-3xl pointer-events-none" />
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-hq-blue shadow-[0_0_6px_rgba(10,132,255,0.8)] animate-pulse" />
                <CardTitle className="text-sm font-black text-foreground tracking-tight">
                  Active Mission Control
                </CardTitle>
              </div>
              <CardDescription className="text-[11px] text-foreground/40 font-medium">
                Real-time progress overview of active campaigns
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {activeMission ? (
                <div className="border border-hq-blue/15 bg-hq-blue/[0.03] dark:bg-hq-blue/[0.05] rounded-2xl p-5 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-foreground line-clamp-1">
                        {activeMission.objective}
                      </h4>
                      <p className="text-[10px] text-foreground/45 mt-1 font-semibold uppercase tracking-wide">
                        Status · {activeMission.status}
                      </p>
                    </div>
                    <Badge variant={getBadgeVariant(activeMission.status)}>
                      {activeMission.status}
                    </Badge>
                  </div>

                  {/* Premium Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-bold">
                      <span className="text-foreground/50 uppercase tracking-wide">Task Execution</span>
                      <span className="text-hq-blue">{activeMission.status === 'DELIVERED' || activeMission.status === 'APPROVED' ? 100 : 45}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-black/5 dark:bg-white/[0.05] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-hq-blue to-hq-cyan rounded-full transition-all duration-700 shadow-[0_0_8px_rgba(10,132,255,0.4)]"
                        style={{ width: `${activeMission.status === 'DELIVERED' || activeMission.status === 'APPROVED' ? 100 : 45}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex justify-between text-[10px] pt-1">
                    <span className="text-foreground/35 font-bold uppercase tracking-wide">Platform Coordinator</span>
                    <span className="font-black text-hq-purple">{ceoName} · CEO</span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 border border-dashed border-card-border rounded-2xl text-center space-y-4 bg-black/[0.01] dark:bg-white/[0.01]">
                  <div className="h-12 w-12 rounded-2xl bg-hq-blue/10 border border-hq-blue/20 flex items-center justify-center text-xl">
                    ⚡
                  </div>
                  <div className="space-y-1.5">
                    <h4 className="text-sm font-black text-foreground">
                      No Active Missions
                    </h4>
                    <p className="text-xs text-foreground/45 max-w-xs leading-relaxed font-medium">
                      Convene your AI executive board to design, plan, and execute strategic campaigns.
                    </p>
                  </div>
                  <Button
                    onClick={() => router.push('/discussions')}
                    className="bg-hq-blue hover:bg-hq-blue/90 text-white font-black h-9 text-[11px] px-5 rounded-full shadow-[0_4px_14px_rgba(10,132,255,0.3)] hover:shadow-[0_4px_20px_rgba(10,132,255,0.4)] transition-all"
                  >
                    Consult Executive Board
                  </Button>
                </div>
              )}
            </CardContent>
            {activeMission ? (
              <CardFooter className="flex justify-end border-t border-card-border/50 pt-3 pb-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push(`/missions/${activeMission.id}`)}
                  className="flex items-center gap-1.5 text-[11px] font-bold text-hq-blue hover:text-hq-blue hover:bg-hq-blue/5 rounded-lg"
                >
                  Open Timeline
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </CardFooter>
            ) : (
              <CardFooter className="flex justify-center border-t border-card-border/50 pt-3 pb-3 text-[9px] text-foreground/30 font-bold uppercase tracking-wider">
                Orchestrate objectives automatically from boardroom debates
              </CardFooter>
            )}
          </Card>

          {/* Autonomous Intelligence Feed UI */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-[#1A1A1E] dark:text-white flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-hq-cyan animate-pulse" />
              Autonomous Intelligence Feed
            </h2>
            <div className="grid gap-4 sm:grid-cols-1">
              {recommendations.map((rec) => (
                <Card
                  key={rec.id}
                  className={`border transition-all hover:bg-black/5 dark:hover:bg-[#1E1E24]/20 shadow-[var(--card-shadow)] card-transition ${
                    rec.type === 'risk'
                      ? 'border-red-500/20 bg-red-500/5'
                      : rec.type === 'opportunity'
                        ? 'border-hq-cyan/20 bg-hq-cyan/5'
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
                        <span className="text-xs font-bold text-[#1A1A1E] dark:text-white">
                          {rec.title}
                        </span>
                      </div>
                      <Badge
                        variant={
                          rec.urgency === 'Action Required'
                            ? 'warning'
                            : rec.urgency === 'Attention'
                              ? 'error'
                              : 'info'
                        }
                        className="text-[9px]"
                      >
                        {rec.urgency}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3.5 text-xs text-left">
                    <p className="text-foreground/75 leading-relaxed font-semibold">
                      {rec.description}
                    </p>
                    <div className="flex flex-wrap gap-4 text-[10px] text-foreground/45 border-t border-card-border/50 pt-2.5">
                      <div>
                        <span className="font-bold block text-foreground/70">Expected Benefit</span>
                        <span className="text-[#1A1A1E] dark:text-white font-mono mt-0.5 block">
                          {rec.benefit}
                        </span>
                      </div>
                      <div>
                        <span className="font-bold block text-foreground/70">Confidence Score</span>
                        <span className="text-hq-cyan font-mono mt-0.5 block font-bold">
                          {rec.confidence}%
                        </span>
                      </div>
                      <div>
                        <span className="font-bold block text-foreground/70">
                          Recommended Directors
                        </span>
                        <span className="text-hq-purple font-mono mt-0.5 block font-bold">
                          {rec.directors.join(', ')}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Analytics & C-Suite Contacts */}
        <div className="space-y-6">
          {/* Credit Outflow Trends Chart */}
          <Card className="border border-card-border bg-card-bg shadow-[var(--card-shadow)] card-transition overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <CardTitle className="text-[9px] font-black uppercase tracking-widest text-foreground/40">
                  Credit Outflow Trend
                </CardTitle>
                <span className="text-[9px] text-foreground/25 font-mono">· Weekly</span>
              </div>
            </CardHeader>
            <CardContent className="pt-2 flex flex-col items-center px-3">
              <svg className="w-full h-28" viewBox="0 0 300 100" fill="none">
                <defs>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0A84FF" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#0A84FF" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <line x1="0" y1="20" x2="300" y2="20" stroke="currentColor" strokeOpacity={0.06} strokeWidth="0.5" />
                <line x1="0" y1="50" x2="300" y2="50" stroke="currentColor" strokeOpacity={0.06} strokeWidth="0.5" />
                <line x1="0" y1="80" x2="300" y2="80" stroke="currentColor" strokeOpacity={0.06} strokeWidth="0.5" />
                <path d="M 10 90 L 50 70 L 100 80 L 150 40 L 200 50 L 250 20 L 290 30 L 290 90 Z" fill="url(#areaGradient)" />
                <path d="M 10 90 L 50 70 L 100 80 L 150 40 L 200 50 L 250 20 L 290 30" stroke="#0A84FF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="150" cy="40" r="2.5" fill="#0A84FF" />
                <circle cx="250" cy="20" r="2.5" fill="#0A84FF" />
                <circle cx="150" cy="40" r="5" fill="#0A84FF" fillOpacity={0.15} />
                <circle cx="250" cy="20" r="5" fill="#0A84FF" fillOpacity={0.15} />
              </svg>
              <div className="flex justify-between w-full text-[8px] text-foreground/30 px-1 font-mono font-bold tracking-wider">
                <span>MON</span><span>WED</span><span>FRI</span><span>SUN</span>
              </div>
            </CardContent>
          </Card>

          {/* Executive Utilization */}
          <Card className="border border-card-border bg-card-bg shadow-[var(--card-shadow)] card-transition">
            <CardHeader className="pb-3">
              <CardTitle className="text-[9px] font-black uppercase tracking-widest text-foreground/40">
                Executive Utilization
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs text-left">
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px]">
                  <span className="text-foreground/70 font-bold">{ceoName} · CEO</span>
                  <span className="text-foreground/40 font-mono">95%</span>
                </div>
                <div className="w-full h-1.5 bg-black/5 dark:bg-white/[0.05] rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-hq-blue to-hq-cyan w-[95%] rounded-full shadow-[0_0_6px_rgba(10,132,255,0.3)]" />
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px]">
                  <span className="text-foreground/70 font-bold">Arthur Steward · COS</span>
                  <span className="text-foreground/40 font-mono">80%</span>
                </div>
                <div className="w-full h-1.5 bg-black/5 dark:bg-white/[0.05] rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-hq-cyan to-[#30D158] w-[80%] rounded-full shadow-[0_0_6px_rgba(48,209,88,0.25)]" />
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px]">
                  <span className="text-foreground/70 font-bold">Linus Kovacs · Tech</span>
                  <span className="text-foreground/40 font-mono">50%</span>
                </div>
                <div className="w-full h-1.5 bg-black/5 dark:bg-white/[0.05] rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-hq-purple to-[#bf5af2] w-[50%] rounded-full shadow-[0_0_6px_rgba(191,90,242,0.25)]" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Active Boardroom Discussions */}
          <Card className="border border-card-border bg-card-bg shadow-[var(--card-shadow)] card-transition">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-black text-foreground tracking-tight">
                Active Discussions
              </CardTitle>
              <CardDescription className="text-[11px] text-foreground/40 font-medium">Your operational boardroom debates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {conversations.length > 0 ? (
                conversations.map((conv: any) => (
                  <div
                    key={conv.id}
                    onClick={() => router.push(`/discussions/${conv.id}`)}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-hq-blue/[0.05] cursor-pointer transition-all border border-transparent hover:border-hq-blue/15 group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-hq-blue/20 to-hq-purple/10 border border-hq-blue/20 text-hq-blue flex items-center justify-center font-black text-[9px] uppercase">
                        {conv.title ? conv.title.substring(0, 2) : 'BD'}
                      </div>
                      <div className="text-xs text-left">
                        <p className="font-bold text-foreground line-clamp-1 max-w-[130px] group-hover:text-hq-blue transition-colors">
                          {conv.title || 'Untitled Boardroom Session'}
                        </p>
                        <p className="text-[9px] text-foreground/35 font-bold uppercase tracking-wide mt-0.5">Active · Boardroom</p>
                      </div>
                    </div>
                    <Badge variant={conv.missionId ? 'success' : 'ai'} className="text-[9px]">
                      {conv.missionId ? 'Orchestrated' : 'Active'}
                    </Badge>
                  </div>
                ))
              ) : (
                <div
                  onClick={() => router.push('/discussions')}
                  className="flex items-center justify-center p-3 rounded-xl border border-dashed border-card-border hover:bg-black/[0.03] dark:hover:bg-white/[0.03] cursor-pointer text-center flex-col py-8 space-y-3 transition-all"
                >
                  <span className="text-xs font-bold text-foreground/40">No debates started yet</span>
                  <Button size="sm" className="text-[10px] h-7 bg-hq-blue text-white hover:bg-hq-blue/90 font-black px-4 rounded-full shadow-[0_2px_8px_rgba(10,132,255,0.3)]">
                    Open Boardroom
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Global Activity Feed */}
          <Card className="border border-card-border bg-card-bg shadow-[var(--card-shadow)] card-transition">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-black text-foreground tracking-tight">
                Headquarters Activity
              </CardTitle>
              <CardDescription className="text-[11px] text-foreground/40 font-medium">Live operational timeline</CardDescription>
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
