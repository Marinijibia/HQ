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

  // 1. Setup step reasoning checklist triggers
  const [checklist, setChecklist] = React.useState<boolean[]>([false, false, false, false, false, false]);
  React.useEffect(() => {
    if (ftxStep === 'reasoning') {
      setChecklist([false, false, false, false, false, false]);
      const timers = [
        setTimeout(() => setChecklist([true, false, false, false, false, false]), 400),
        setTimeout(() => setChecklist([true, true, false, false, false, false]), 800),
        setTimeout(() => setChecklist([true, true, true, false, false, false]), 1200),
        setTimeout(() => setChecklist([true, true, true, true, false, false]), 1600),
        setTimeout(() => setChecklist([true, true, true, true, true, false]), 2000),
        setTimeout(() => setChecklist([true, true, true, true, true, true]), 2400),
        setTimeout(() => setFtxStep('assigned'), 2800),
      ];
      return () => timers.forEach(clearTimeout);
    }
  }, [ftxStep, setFtxStep]);

  // 2. Setup step executing progress triggers
  const [executionProgress, setExecutionProgress] = React.useState(0);
  const [execStatus, setExecStatus] = React.useState<Record<string, string>>({
    ceo: 'Planning',
    marketing: 'Pending...',
    finance: 'Pending...',
    legal: 'Pending...',
    strategy: 'Pending...',
  });

  React.useEffect(() => {
    if (ftxStep === 'executing') {
      setExecutionProgress(0);
      setExecStatus({
        ceo: 'Planning',
        marketing: 'Researching...',
        finance: 'Pending...',
        legal: 'Pending...',
        strategy: 'Pending...',
      });

      const timer = setInterval(() => {
        setExecutionProgress((old) => {
          if (old >= 100) {
            clearInterval(timer);

            // Register backend mock deliverable
            fetch('/api/missions', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                objective: objectiveText,
                status: 'APPROVED',
              }),
            })
              .then(async (res) => {
                if (res.ok) {
                  const data = await res.json();
                  completeMission(data.id || 'mission-ftx');
                } else {
                  completeMission('mission-ftx');
                }
              })
              .catch(() => {
                completeMission('mission-ftx');
              });
            return 100;
          }

          const next = old + 5;

          // Smoothly update statuses based on progress thresholds
          setExecStatus((status) => {
            const nextStatus = { ...status };
            if (next >= 100) {
              nextStatus.strategy = 'Completed';
            } else if (next >= 75) {
              nextStatus.legal = 'Completed';
              nextStatus.strategy = 'Writing...';
            } else if (next >= 50) {
              nextStatus.finance = 'Completed';
              nextStatus.legal = 'Reviewing...';
            } else if (next >= 25) {
              nextStatus.marketing = 'Completed';
              nextStatus.finance = 'Calculating...';
            }
            return nextStatus;
          });

          return next;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [ftxStep, objectiveText, token, completeMission]);

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

          <div className="border border-hq-graphite/40 bg-hq-graphite/10 rounded-xl p-5 text-left text-xs leading-relaxed space-y-4">
            <div>
              <span className="font-bold text-white block">Objective</span>
              <span className="text-foreground/75">{objectiveText || 'Compose launch creatives'}</span>
            </div>
            <div>
              <span className="font-bold text-white block">Specialists Engaged</span>
              <span className="text-foreground/75">CEO, CMO, CFO, Strategy Director, Legal Director</span>
            </div>
            <div>
              <span className="font-bold text-white block">Resolutions & Deliverables</span>
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

      {/* Standard Welcome Banner */}
      <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0 text-left">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#1A1A1E] dark:text-white flex items-center gap-2">
            Welcome back, {ownerName}
          </h1>
          <p className="text-foreground/60 text-sm mt-1">
            Your Headquarters is online. CEO{' '}
            <span className="font-bold" style={{ color: brandColor }}>
              {ceoName}
            </span>{' '}
            is coordinating tasks for {hqName}.
          </p>
        </div>

        <Button
          onClick={() => setMissionPanelOpen(true)}
          className="flex items-center gap-2 h-9 text-xs text-white"
          style={{ backgroundColor: brandColor }}
        >
          <Play className="h-4 w-4" />
          Launch New Mission
        </Button>
      </div>

      {/* Statistics Row */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border border-card-border bg-card-bg shadow-[var(--card-shadow)] card-transition">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-[10px] font-bold uppercase tracking-wider text-foreground/50">
              Active Missions
            </CardTitle>
            <Activity className="h-4 w-4 text-hq-blue" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-[#1A1A1E] dark:text-white">1 / 1</div>
            <p className="text-[10px] text-foreground/45 mt-1 font-semibold">
              Free Tier Limit: Max 1 active
            </p>
          </CardContent>
        </Card>

        <Card className="border border-card-border bg-card-bg shadow-[var(--card-shadow)] card-transition">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-[10px] font-bold uppercase tracking-wider text-foreground/50">
              Weekly Growth
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-hq-cyan" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-hq-cyan">+24.5%</div>
            <p className="text-[10px] text-foreground/45 mt-1 font-semibold">
              Compared to previous week
            </p>
          </CardContent>
        </Card>

        <Card className="border border-card-border bg-card-bg shadow-[var(--card-shadow)] card-transition">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-[10px] font-bold uppercase tracking-wider text-foreground/50">
              Available Credits
            </CardTitle>
            <CreditCard className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-[#1A1A1E] dark:text-white">9,420</div>
            <p className="text-[10px] text-foreground/45 mt-1 font-semibold">Resets in 12 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid Section */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Side: Active Mission & Autonomous Intelligence Feed */}
        <div className="lg:col-span-2 space-y-8">
          {/* Active Mission */}
          <Card className="border border-card-border bg-card-bg shadow-[var(--card-shadow)] card-transition">
            <CardHeader>
              <CardTitle className="text-md font-extrabold text-[#1A1A1E] dark:text-white">
                Active Mission Control
              </CardTitle>
              <CardDescription className="text-xs">
                Real-time progress overview of active campaigns
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border border-card-border bg-[#F9F9FB] dark:bg-[#0A0A0C] rounded-xl p-4.5 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-[#1A1A1E] dark:text-white">
                      Q3 Petroleum Logistics Outreach
                    </h4>
                    <p className="text-xs text-foreground/60 mt-0.5 font-medium">
                      Objective: Compose B2B trade partnerships proposal
                    </p>
                  </div>
                  <Badge variant="ai">Running</Badge>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-foreground/60">
                    <span>Task Breakdown (4/5 complete)</span>
                    <span>80%</span>
                  </div>
                  <div className="w-full h-1.5 bg-black/5 dark:bg-[#1E1E24] rounded-full overflow-hidden">
                    <div className="h-full bg-hq-blue w-[80%] rounded-full transition-all duration-500"></div>
                  </div>
                </div>

                <div className="flex justify-between text-xs pt-1">
                  <span className="text-foreground/45 font-medium">Assigned Director</span>
                  <span className="font-bold text-hq-purple">Arthur Steward (COS)</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end border-t border-card-border/50 pt-4 bg-black/5 dark:bg-[#1E1E24]/10 rounded-b-xl">
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-1 text-xs font-semibold"
              >
                Open Timeline
                <ChevronRight className="h-4 w-4" />
              </Button>
            </CardFooter>
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

        {/* Right Side: Recharts Analytics Graphics & C-Suite Contacts */}
        <div className="space-y-8">
          {/* Credit Outflow Trends (SVG Area/Line Chart) */}
          <Card className="border border-card-border bg-card-bg shadow-[var(--card-shadow)] card-transition">
            <CardHeader className="pb-2">
              <CardTitle className="text-[10px] font-bold uppercase tracking-wider text-foreground/50">
                Credit Outflow Trend (Weekly)
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 flex flex-col items-center">
              <svg className="w-full h-32" viewBox="0 0 300 100" fill="none">
                <defs>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                {/* Grid Lines */}
                <line
                  x1="0"
                  y1="20"
                  x2="300"
                  y2="20"
                  stroke="currentColor"
                  strokeOpacity={0.15}
                  strokeWidth="0.5"
                />
                <line
                  x1="0"
                  y1="50"
                  x2="300"
                  y2="50"
                  stroke="currentColor"
                  strokeOpacity={0.15}
                  strokeWidth="0.5"
                />
                <line
                  x1="0"
                  y1="80"
                  x2="300"
                  y2="80"
                  stroke="currentColor"
                  strokeOpacity={0.15}
                  strokeWidth="0.5"
                />

                {/* Area Fill */}
                <path
                  d="M 10 90 L 50 70 L 100 80 L 150 40 L 200 50 L 250 20 L 290 30 L 290 90 Z"
                  fill="url(#areaGradient)"
                />

                {/* Line Path */}
                <path
                  d="M 10 90 L 50 70 L 100 80 L 150 40 L 200 50 L 250 20 L 290 30"
                  stroke="#0EA5E9"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Intersecting Dots */}
                <circle cx="150" cy="40" r="3" fill="#0EA5E9" />
                <circle cx="250" cy="20" r="3" fill="#0EA5E9" />
              </svg>
              <div className="flex justify-between w-full text-[9px] text-foreground/45 px-2 mt-2 font-mono">
                <span>Mon</span>
                <span>Wed</span>
                <span>Fri</span>
                <span>Sun</span>
              </div>
            </CardContent>
          </Card>

          {/* C-Suite Utilization (SVG Bar Chart) */}
          <Card className="border border-card-border bg-card-bg shadow-[var(--card-shadow)] card-transition">
            <CardHeader className="pb-2">
              <CardTitle className="text-[10px] font-bold uppercase tracking-wider text-foreground/50">
                Executive Utilization (Hours)
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3.5 text-xs text-left">
              <div className="space-y-1">
                <div className="flex justify-between text-[10px]">
                  <span className="text-foreground/75 font-semibold">{ceoName} (CEO)</span>
                  <span className="text-foreground/55 font-mono">42 hrs (95%)</span>
                </div>
                <div className="w-full h-2 bg-black/5 dark:bg-[#1E1E24] rounded-full overflow-hidden">
                  <div className="h-full bg-hq-blue w-[95%] rounded-full"></div>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[10px]">
                  <span className="text-foreground/75 font-semibold">Arthur Steward (COS)</span>
                  <span className="text-foreground/55 font-mono">34 hrs (80%)</span>
                </div>
                <div className="w-full h-2 bg-black/5 dark:bg-[#1E1E24] rounded-full overflow-hidden">
                  <div className="h-full bg-hq-cyan w-[80%] rounded-full"></div>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[10px]">
                  <span className="text-foreground/75 font-semibold">Linus Kovacs (Tech)</span>
                  <span className="text-foreground/55 font-mono">22 hrs (50%)</span>
                </div>
                <div className="w-full h-2 bg-black/5 dark:bg-[#1E1E24] rounded-full overflow-hidden">
                  <div className="h-full bg-hq-purple w-[50%] rounded-full"></div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Boardroom Shortcuts */}
          <Card className="border border-card-border bg-card-bg shadow-[var(--card-shadow)] card-transition">
            <CardHeader>
              <CardTitle className="text-md font-extrabold text-[#1A1A1E] dark:text-white">
                Boardroom Contacts
              </CardTitle>
              <CardDescription className="text-xs">Instant direct channels</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-2 rounded-xl hover:bg-black/5 dark:hover:bg-[#1E1E24]/20 cursor-pointer">
                <div className="flex items-center space-x-2">
                  <div className="h-7 w-7 rounded-full bg-hq-blue/20 flex items-center justify-center font-bold text-hq-blue text-xs">
                    CEO
                  </div>
                  <div className="text-xs text-left">
                    <p className="font-bold text-[#1A1A1E] dark:text-white">{ceoName}</p>
                    <p className="text-[10px] text-foreground/45">CEO</p>
                  </div>
                </div>
                <Badge variant="success">Active</Badge>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl hover:bg-black/5 dark:hover:bg-[#1E1E24]/20 cursor-pointer">
                <div className="flex items-center space-x-2">
                  <div className="h-7 w-7 rounded-full bg-hq-purple/20 flex items-center justify-center font-bold text-hq-purple text-xs">
                    COS
                  </div>
                  <div className="text-xs text-left">
                    <p className="font-bold text-[#1A1A1E] dark:text-white">Arthur Steward</p>
                    <p className="text-[10px] text-foreground/45">Chief of Staff</p>
                  </div>
                </div>
                <Badge variant="success">Active</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Global Activity Feed */}
          <Card className="border border-card-border bg-card-bg shadow-[var(--card-shadow)] card-transition">
            <CardHeader className="pb-2">
              <CardTitle className="text-md font-extrabold text-[#1A1A1E] dark:text-white">
                Headquarters Activity
              </CardTitle>
              <CardDescription className="text-xs">Live operational timeline</CardDescription>
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
