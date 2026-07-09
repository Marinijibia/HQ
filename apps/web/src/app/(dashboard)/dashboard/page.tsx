'use client';

import * as React from 'react';
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
  Activity,
  Sparkles,
  Lightbulb,
  ShieldAlert,
} from 'lucide-react';

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
  const recommendations: RecommendationCard[] = [
    {
      id: 'rec-1',
      title: 'West African Corridors Scaling Opportunity',
      type: 'opportunity',
      confidence: 92,
      impact: 'High',
      urgency: 'Action Required',
      benefit: '+$4.2M gross B2B logistics throughput',
      directors: ['Alistair Thorne (Strategy)', 'Rashid Al-Mansoori (Petroleum)'],
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
      directors: ['Fiona Gallagher (Legal)', 'Sophia Sterling (Marketing)'],
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

  return (
    <div className="space-y-8 select-none text-white">
      {/* Welcome Banner */}
      <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            Welcome back, Elena
          </h1>
          <p className="text-foreground/60 text-sm mt-1">
            Your Headquarters is online. 3 agents are currently performing operations across
            workspaces.
          </p>
        </div>

        <Button variant="accent" className="flex items-center gap-2 h-9 text-xs">
          <Play className="h-4 w-4" />
          Launch New Mission
        </Button>
      </div>

      {/* Statistics Row */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border border-hq-graphite/40 bg-hq-graphite/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-foreground/50">
              Active Missions
            </CardTitle>
            <Activity className="h-4 w-4 text-hq-blue" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1 / 1</div>
            <p className="text-[10px] text-foreground/45 mt-1">Free Tier Limit: Max 1 active</p>
          </CardContent>
        </Card>

        <Card className="border border-hq-graphite/40 bg-hq-graphite/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-foreground/50">
              Weekly Growth
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-hq-cyan" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-hq-cyan">+24.5%</div>
            <p className="text-[10px] text-foreground/45 mt-1">Compared to previous week</p>
          </CardContent>
        </Card>

        <Card className="border border-hq-graphite/40 bg-hq-graphite/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-foreground/50">
              Tasks Resolved
            </CardTitle>
            <Calendar className="h-4 w-4 text-hq-purple" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,894</div>
            <p className="text-[10px] text-foreground/45 mt-1">Cumulative lifecycle actions</p>
          </CardContent>
        </Card>

        <Card className="border border-hq-graphite/40 bg-hq-graphite/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-foreground/50">
              Available Credits
            </CardTitle>
            <CreditCard className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">9,420</div>
            <p className="text-[10px] text-foreground/45 mt-1">Resets in 12 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid Section */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Side: Active Mission & Autonomous Intelligence Feed */}
        <div className="lg:col-span-2 space-y-8">
          {/* Active Mission */}
          <Card className="border border-hq-graphite/40 bg-hq-graphite/20">
            <CardHeader>
              <CardTitle>Active Mission Control</CardTitle>
              <CardDescription>Real-time progress overview of active campaigns</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border border-hq-graphite/40 bg-[#0A0A0C] rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white">
                      Q3 Petroleum Logistics Outreach
                    </h4>
                    <p className="text-xs text-foreground/60 mt-0.5">
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
                  <div className="w-full h-1.5 bg-hq-graphite rounded-full overflow-hidden">
                    <div className="h-full bg-hq-blue w-[80%] rounded-full transition-all duration-500"></div>
                  </div>
                </div>

                <div className="flex justify-between text-xs pt-1">
                  <span className="text-foreground/45">Assigned Director</span>
                  <span className="font-semibold text-hq-purple">Rashid (Petroleum Director)</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end border-t border-hq-graphite/20 pt-4 bg-hq-graphite/10">
              <Button variant="ghost" size="sm" className="flex items-center gap-1 text-xs">
                Open Timeline
                <ChevronRight className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>

          {/* Autonomous Intelligence Feed UI */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-hq-cyan" />
              Autonomous Intelligence Feed
            </h2>
            <div className="grid gap-4 sm:grid-cols-1">
              {recommendations.map((rec) => (
                <Card
                  key={rec.id}
                  className={`border transition-all hover:bg-hq-graphite/10 ${
                    rec.type === 'risk'
                      ? 'border-red-500/20 bg-red-500/5'
                      : rec.type === 'opportunity'
                        ? 'border-hq-cyan/20 bg-hq-cyan/5'
                        : 'border-hq-graphite/40 bg-hq-graphite/20'
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
                        <span className="text-xs font-bold text-white">{rec.title}</span>
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
                  <CardContent className="space-y-3 text-xs">
                    <p className="text-foreground/75 leading-relaxed">{rec.description}</p>
                    <div className="flex flex-wrap gap-4 text-[10px] text-foreground/45 border-t border-hq-graphite/10 pt-2.5">
                      <div>
                        <span className="font-semibold block text-foreground/70">
                          Expected Benefit
                        </span>
                        <span className="text-white font-mono mt-0.5 block">{rec.benefit}</span>
                      </div>
                      <div>
                        <span className="font-semibold block text-foreground/70">
                          Confidence Score
                        </span>
                        <span className="text-hq-cyan font-mono mt-0.5 block">
                          {rec.confidence}%
                        </span>
                      </div>
                      <div>
                        <span className="font-semibold block text-foreground/70">
                          Recommended Directors
                        </span>
                        <span className="text-hq-purple font-mono mt-0.5 block">
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
          <Card className="border border-hq-graphite/40 bg-hq-graphite/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-foreground/50">
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
                <line x1="0" y1="20" x2="300" y2="20" stroke="#27272A" strokeWidth="0.5" />
                <line x1="0" y1="50" x2="300" y2="50" stroke="#27272A" strokeWidth="0.5" />
                <line x1="0" y1="80" x2="300" y2="80" stroke="#27272A" strokeWidth="0.5" />

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
          <Card className="border border-hq-graphite/40 bg-hq-graphite/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-foreground/50">
                Executive Utilization (Hours)
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3 text-xs">
              <div className="space-y-1">
                <div className="flex justify-between text-[10px]">
                  <span className="text-foreground/75 font-semibold">Elena (CEO)</span>
                  <span className="text-foreground/55 font-mono">42 hrs (95%)</span>
                </div>
                <div className="w-full h-2 bg-hq-graphite rounded-full overflow-hidden">
                  <div className="h-full bg-hq-blue w-[95%] rounded-full"></div>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[10px]">
                  <span className="text-foreground/75 font-semibold">Rashid (Petroleum)</span>
                  <span className="text-foreground/55 font-mono">34 hrs (80%)</span>
                </div>
                <div className="w-full h-2 bg-hq-graphite rounded-full overflow-hidden">
                  <div className="h-full bg-hq-cyan w-[80%] rounded-full"></div>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[10px]">
                  <span className="text-foreground/75 font-semibold">Linus (Tech)</span>
                  <span className="text-foreground/55 font-mono">22 hrs (50%)</span>
                </div>
                <div className="w-full h-2 bg-hq-graphite rounded-full overflow-hidden">
                  <div className="h-full bg-hq-purple w-[50%] rounded-full"></div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Boardroom Shortcuts */}
          <Card className="border border-hq-graphite/40 bg-hq-graphite/20">
            <CardHeader>
              <CardTitle>Boardroom Contacts</CardTitle>
              <CardDescription>Instant direct channels</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-2 rounded-md hover:bg-hq-graphite/10 cursor-pointer">
                <div className="flex items-center space-x-2">
                  <div className="h-7 w-7 rounded-full bg-hq-blue/20 flex items-center justify-center font-bold text-hq-blue text-xs">
                    ER
                  </div>
                  <div className="text-xs">
                    <p className="font-semibold text-white">Elena Rostova</p>
                    <p className="text-[10px] text-foreground/45">CEO</p>
                  </div>
                </div>
                <Badge variant="success">Active</Badge>
              </div>

              <div className="flex items-center justify-between p-2 rounded-md hover:bg-hq-graphite/10 cursor-pointer">
                <div className="flex items-center space-x-2">
                  <div className="h-7 w-7 rounded-full bg-hq-purple/20 flex items-center justify-center font-bold text-hq-purple text-xs">
                    LK
                  </div>
                  <div className="text-xs">
                    <p className="font-semibold text-white">Linus Kovacs</p>
                    <p className="text-[10px] text-foreground/45">Software Eng.</p>
                  </div>
                </div>
                <Badge variant="warning">Busy</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
