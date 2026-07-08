'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  Badge,
  Avatar,
} from '@hq/ui';
import {
  ArrowLeft,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Play,
  Pause,
  XCircle,
  Workflow,
} from 'lucide-react';

interface TimelineStep {
  stageName: string;
  assignedDirector: string;
  avatarInitials: string;
  status: 'Completed' | 'Running' | 'Error' | 'Pending';
  message: string;
  timestamp?: string;
}

export default function MissionTimelinePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = React.use(params);
  const [showError, setShowError] = React.useState(false);
  const [isPlaying, setIsPlaying] = React.useState(true);

  // 10-stage collaborative board sequence timeline steps
  const steps: TimelineStep[] = [
    {
      stageName: '1. Objective Analysis',
      assignedDirector: 'Elena Rostova (CEO)',
      avatarInitials: 'ER',
      status: 'Completed',
      message: 'CEO completed objective alignment and set strategic parameters.',
      timestamp: '10:02 AM',
    },
    {
      stageName: '2. Market Analysis & Research',
      assignedDirector: 'Alistair Thorne (Strategy Director)',
      avatarInitials: 'AT',
      status: 'Completed',
      message: 'Strategy Director successfully gathered competitors positioning metrics.',
      timestamp: '10:08 AM',
    },
    {
      stageName: '3. Technical Specs Verification',
      assignedDirector: 'Dr. Hiroshi Tanaka (CTO)',
      avatarInitials: 'HT',
      status: 'Completed',
      message: 'CTO verified technical constraints and edge configuration bounds.',
      timestamp: '10:14 AM',
    },
    {
      stageName: '4. Content Copywriting',
      assignedDirector: 'Linus Kovacs (Software Eng. Director)',
      avatarInitials: 'LK',
      status: showError ? 'Error' : isPlaying ? 'Running' : 'Pending',
      message: showError
        ? 'The Software Engineering Director could not access git repository permissions. Please refine access keys.'
        : 'Software Engineering Director is compiling module bundles...',
      timestamp: showError ? '10:19 AM' : undefined,
    },
    {
      stageName: '5. Quality Assurance Testing',
      assignedDirector: 'Alan Turing (QA Director)',
      avatarInitials: 'AT',
      status: 'Pending',
      message: 'Waiting for compile sequence confirmation...',
    },
    {
      stageName: '6. Security Auditing',
      assignedDirector: 'Jack Bauer (Security Director)',
      avatarInitials: 'JB',
      status: 'Pending',
      message: 'Pending zero-trust credentials auditing checks.',
    },
    {
      stageName: '7. Legal Holds Check',
      assignedDirector: 'Fiona Gallagher (Legal Director)',
      avatarInitials: 'FG',
      status: 'Pending',
      message: 'Awaiting regulatory compliance review.',
    },
    {
      stageName: '8. Financial Margins Appraisal',
      assignedDirector: 'Sophia Sterling (Finance Director)',
      avatarInitials: 'SS',
      status: 'Pending',
      message: 'Pending credits cost and margins checks.',
    },
    {
      stageName: '9. Marketing Placement Prep',
      assignedDirector: 'Amara Okafor (Marketing Director)',
      avatarInitials: 'AO',
      status: 'Pending',
      message: 'Awaiting copy completion to launch placements.',
    },
    {
      stageName: '10. Final Executive Sign-off',
      assignedDirector: 'Elena Rostova (CEO)',
      avatarInitials: 'ER',
      status: 'Pending',
      message: 'Awaiting final approvals board checks.',
    },
  ];

  return (
    <div className="space-y-8 select-none">
      {/* Header breadcrumb navigation */}
      <div className="flex items-center space-x-4">
        <Link href="/missions">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-white">Mission Timeline</h1>
            <Badge variant="neutral">ID: {resolvedParams.id}</Badge>
          </div>
          <p className="text-foreground/60 text-xs mt-1">
            Real-time handoff path and thinking status between C-Suite AI Directors.
          </p>
        </div>
      </div>

      {/* Mission details panel card */}
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border border-hq-graphite/40 bg-hq-graphite/20">
            <CardHeader className="flex flex-row items-start justify-between pb-4">
              <div>
                <CardTitle className="text-base text-white">
                  Q3 Petroleum Logistics Outreach Strategy
                </CardTitle>
                <CardDescription className="text-xs">
                  Objective: Spawn B2B trade partnerships proposal
                </CardDescription>
              </div>
              <Badge variant={showError ? 'error' : isPlaying ? 'ai' : 'warning'}>
                {showError ? 'Critical Error' : isPlaying ? 'Active Running' : 'Paused'}
              </Badge>
            </CardHeader>
            <CardContent className="p-6">
              {/* Interactive Vertical Timeline Steps */}
              <div className="relative border-l border-hq-graphite/40 ml-4 pl-6 space-y-8">
                {steps.map((step, idx) => {
                  const isCompleted = step.status === 'Completed';
                  const isRunning = step.status === 'Running';
                  const isFailed = step.status === 'Error';

                  return (
                    <div key={idx} className="relative">
                      {/* Left Dot Node */}
                      <span className="absolute -left-[31px] top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#0A0A0C]">
                        {isCompleted && <CheckCircle2 className="h-4 w-4 text-hq-cyan" />}
                        {isRunning && <Loader2 className="h-4 w-4 text-hq-blue animate-spin" />}
                        {isFailed && (
                          <AlertTriangle className="h-4 w-4 text-red-500 animate-bounce" />
                        )}
                        {step.status === 'Pending' && (
                          <span className="h-2 w-2 rounded-full bg-hq-graphite/60"></span>
                        )}
                      </span>

                      {/* Content Card Body */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <h4
                            className={`text-sm font-semibold ${isRunning ? 'text-hq-blue' : isFailed ? 'text-red-400' : 'text-foreground'}`}
                          >
                            {step.stageName}
                          </h4>
                          {step.timestamp && (
                            <span className="text-[10px] text-foreground/45">{step.timestamp}</span>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 pt-0.5">
                          <Avatar
                            fallback={step.avatarInitials}
                            size="sm"
                            variant="executive"
                            className="h-5 w-5 text-[9px]"
                          />
                          <span className="text-xs font-semibold text-foreground/60">
                            {step.assignedDirector}
                          </span>
                        </div>
                        <p
                          className={`text-xs mt-1 leading-relaxed ${isFailed ? 'text-red-400/80 font-medium bg-red-500/5 border border-red-500/20 rounded p-2' : 'text-foreground/50'}`}
                        >
                          {step.message}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar settings controls */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Oversight Operations</CardTitle>
              <CardDescription>Manually trigger safety controls</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                {isPlaying ? (
                  <Button
                    variant="secondary"
                    className="flex-1 flex items-center justify-center gap-1 text-xs"
                    onClick={() => setIsPlaying(false)}
                  >
                    <Pause className="h-4 w-4" />
                    Pause Flow
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    className="flex-1 flex items-center justify-center gap-1 text-xs"
                    onClick={() => setIsPlaying(true)}
                  >
                    <Play className="h-4 w-4" />
                    Resume Flow
                  </Button>
                )}
                <Button
                  variant="outline"
                  className="flex-1 flex items-center justify-center gap-1 text-xs border-red-500/20 text-red-400 hover:bg-red-500/10"
                >
                  <XCircle className="h-4 w-4" />
                  Terminate
                </Button>
              </div>

              {/* Toggles to simulate loading and error actions */}
              <div className="border-t border-hq-graphite/40 pt-4 space-y-3">
                <p className="text-[10px] text-foreground/45 uppercase tracking-wider font-semibold">
                  Testing Controls
                </p>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-foreground/75">Simulate Executive Failure</span>
                  <input
                    type="checkbox"
                    checked={showError}
                    onChange={(e) => setShowError(e.target.checked)}
                    className="h-4 w-4 rounded border-hq-graphite/40 bg-hq-graphite/30 text-hq-blue"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action details card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-1.5">
                <Workflow className="h-4 w-4 text-hq-purple" />
                Sequence Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-foreground/45">Active Branch</span>
                <span className="font-semibold text-foreground/80">main</span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground/45">Entitlements Checked</span>
                <span className="font-semibold text-hq-cyan">Verified</span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground/45">Data Security Classification</span>
                <span className="font-semibold text-yellow-500">Confidential</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
