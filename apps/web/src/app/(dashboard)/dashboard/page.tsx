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
import { Play, TrendingUp, Calendar, CreditCard, ChevronRight, Activity } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="space-y-8 select-none">
      {/* Welcome Banner */}
      <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Welcome, Elena</h1>
          <p className="text-foreground/60 text-sm mt-1">
            Your Headquarters is active. 3 agents are currently performing operations.
          </p>
        </div>

        <Button variant="accent" className="flex items-center gap-2">
          <Play className="h-4 w-4" />
          Launch New Mission
        </Button>
      </div>

      {/* Statistics Row */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
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

        <Card>
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

        <Card>
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

        <Card>
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

      {/* Middle Row: Active Mission Control & Shortcuts */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Active Mission */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Active Mission Control</CardTitle>
            <CardDescription>Real-time progress overview of active campaigns</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border border-hq-graphite/40 bg-hq-graphite/10 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">Q3 Petroleum Logistics Outreach</h4>
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
          <CardFooter className="flex justify-end border-t border-hq-graphite/20 pt-4">
            <Button variant="ghost" size="sm" className="flex items-center gap-1">
              Open Timeline
              <ChevronRight className="h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>

        {/* Boardroom Shortcuts */}
        <Card>
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

            <div className="flex items-center justify-between p-2 rounded-md hover:bg-hq-graphite/10 cursor-pointer">
              <div className="flex items-center space-x-2">
                <div className="h-7 w-7 rounded-full bg-hq-cyan/20 flex items-center justify-center font-bold text-hq-cyan text-xs">
                  RA
                </div>
                <div className="text-xs">
                  <p className="font-semibold text-white">Rashid Al-Mansoori</p>
                  <p className="text-[10px] text-foreground/45">Petroleum Dir.</p>
                </div>
              </div>
              <Badge variant="success">Active</Badge>
            </div>
          </CardContent>
          <CardFooter className="pt-2">
            <Button variant="outline" className="w-full text-xs">
              Go to Boardroom
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
