'use client';

import * as React from 'react';
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
import { ArrowRight, Loader2, CheckCircle, Twitter, Linkedin, Sparkles } from 'lucide-react';
import { useAuth } from '../../../../contexts/auth-context';

export default function FirstMissionPage() {
  const { token } = useAuth();
  const [progress, setProgress] = React.useState(0);
  const [currentStep, setCurrentStep] = React.useState(1); // 1: Strategy, 2: Writing, 3: Legal, 4: Finished
  const [missionTitle, setMissionTitle] = React.useState('Guided Launch Campaign');
  const [missionObjective, setMissionObjective] = React.useState('Compose Q3 Social Launch Copy');
  const [savedToDb, setSavedToDb] = React.useState(false);

  React.useEffect(() => {
    const recommended = sessionStorage.getItem('hq_recommended_mission');
    if (recommended) {
      setMissionObjective(recommended);
      if (
        recommended.toLowerCase().includes('copywriting') ||
        recommended.toLowerCase().includes('campaign')
      ) {
        setMissionTitle('Guided Launch Campaign');
      } else if (
        recommended.toLowerCase().includes('compliance') ||
        recommended.toLowerCase().includes('audit')
      ) {
        setMissionTitle('Compliance Audit Campaign');
      } else if (
        recommended.toLowerCase().includes('valuation') ||
        recommended.toLowerCase().includes('pitch')
      ) {
        setMissionTitle('VC Pitch & Valuation Campaign');
      } else if (
        recommended.toLowerCase().includes('proposal') ||
        recommended.toLowerCase().includes('blueprint')
      ) {
        setMissionTitle('Client Blueprint Campaign');
      } else {
        setMissionTitle('Guided Launch Campaign');
      }
    }
  }, []);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setProgress((oldProgress) => {
        if (oldProgress === 100) {
          clearInterval(timer);
          return 100;
        }
        const diff = Math.random() * 15;
        const newProgress = Math.min(oldProgress + diff, 100);

        if (newProgress > 75) {
          setCurrentStep(3); // Legal
        } else if (newProgress > 40) {
          setCurrentStep(2); // Writing
        } else {
          setCurrentStep(1); // Strategy
        }

        return newProgress;
      });
    }, 400);

    return () => {
      clearInterval(timer);
    };
  }, []);

  React.useEffect(() => {
    if (progress === 100 && token && !savedToDb) {
      setSavedToDb(true);
      fetch('/api/missions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          objective: missionObjective,
          assignedLead: 'asad',
        }),
      })
        .then(async (r) => {
          if (r.ok) {
            const m = await r.json();
            if (m?.id) {
              fetch(`/api/missions/${m.id}`, {
                method: 'PATCH',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ status: 'DELIVERED' }),
              }).catch(() => null);
            }
          }
        })
        .catch((e) => console.error('First mission save notice:', e));
    }
  }, [progress, token, savedToDb, missionObjective]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between font-sans select-none">
      {/* Header */}
      <header className="flex h-16 items-center justify-between border-b border-card-border px-6 sm:px-12 bg-black/[0.02] dark:bg-white/[0.02] backdrop-blur-md">
        <div className="flex items-center space-x-2">
          <div className="h-7 w-7 rounded-md bg-gradient-to-tr from-hq-blue to-hq-purple flex items-center justify-center font-bold text-white text-sm">
            HQ
          </div>
          <span className="font-bold tracking-tight text-foreground text-lg">HQ Guided Experience</span>
        </div>
        <Badge variant="ai">First Mission</Badge>
      </header>

      {/* Main Board Progress Workspace */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-2xl space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center justify-center gap-2">
              <Sparkles className="h-6 w-6 text-hq-blue animate-pulse" />
              {missionTitle}
            </h1>
            <p className="text-foreground/60 text-xs max-w-md mx-auto">
              Your AI Board has self-orchestrated to draft your first boardroom deliverables.
            </p>
          </div>

          <Card className="border border-card-border bg-card-bg">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm">Objective: {missionObjective}</CardTitle>
              <CardDescription className="text-xs">
                Task Assigned to: CEO, Strategy, Copywriting, and Legal Directors
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Progress Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-foreground/60">
                  <span>Self-Orchestrating Deliverables...</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="w-full h-1.5 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-hq-blue rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>

              {/* Steps indicators */}
              <div className="grid gap-3 sm:grid-cols-3 text-xs">
                <div
                  className={`p-3 border rounded-lg transition-all ${
                    progress >= 40
                      ? 'border-hq-cyan bg-hq-cyan/5 text-hq-cyan'
                      : 'border-card-border bg-black/5 dark:bg-white/5 text-foreground/50'
                  }`}
                >
                  <p className="font-semibold">Step 1: Strategic Plan</p>
                  <p className="text-xs text-foreground/60 mt-0.5">
                    Strategy Director verified targets
                  </p>
                </div>
                <div
                  className={`p-3 border rounded-lg transition-all ${
                    progress >= 75
                      ? 'border-hq-cyan bg-hq-cyan/5 text-hq-cyan'
                      : progress >= 40
                        ? 'border-hq-blue bg-hq-blue/5 text-hq-blue animate-pulse'
                        : 'border-card-border bg-black/5 dark:bg-white/5 text-foreground/50'
                  }`}
                >
                  <p className="font-semibold">Step 2: Copy Drafts</p>
                  <p className="text-xs text-foreground/60 mt-0.5">
                    Copywriting Director compiling texts
                  </p>
                </div>
                <div
                  className={`p-3 border rounded-lg transition-all ${
                    progress === 100
                      ? 'border-hq-cyan bg-hq-cyan/5 text-hq-cyan'
                      : progress >= 75
                        ? 'border-hq-blue bg-hq-blue/5 text-hq-blue animate-pulse'
                        : 'border-card-border bg-black/5 dark:bg-white/5 text-foreground/50'
                  }`}
                >
                  <p className="font-semibold">Step 3: Legal Check</p>
                  <p className="text-xs text-foreground/60 mt-0.5">
                    Legal Director reviewing claims
                  </p>
                </div>
              </div>

              {/* Renders Deliverable Outputs Card once progress = 100% */}
              {progress === 100 ? (
                <div className="border border-hq-cyan/30 bg-hq-cyan/5 rounded-lg p-4 space-y-4 animate-in zoom-in-95 duration-500">
                  <div className="flex items-center space-x-2 text-hq-cyan font-bold text-xs">
                    <CheckCircle className="h-4 w-4" />
                    <span>Deliverables Generated Successfully!</span>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="p-3 border border-card-border bg-black/5 dark:bg-white/5 rounded-md">
                      <div className="flex items-center space-x-1.5 text-foreground font-semibold mb-1">
                        <Twitter className="h-3.5 w-3.5 text-hq-blue" />
                        <span>Twitter Post</span>
                      </div>
                      <p className="text-foreground/75 leading-relaxed">
                        Say hello to HQ, the first AI Executive Operating System designed to
                        automate, plan, and execute corporate strategies. Let your board work! 🚀
                        #AI #OS #Future
                      </p>
                    </div>

                    <div className="p-3 border border-card-border bg-black/5 dark:bg-white/5 rounded-md">
                      <div className="flex items-center space-x-1.5 text-foreground font-semibold mb-1">
                        <Linkedin className="h-3.5 w-3.5 text-blue-500" />
                        <span>LinkedIn Update</span>
                      </div>
                      <p className="text-foreground/75 leading-relaxed">
                        Today we launched HQ Corporation&apos;s new headquarters. Powered by a
                        collaborative board of 25 specialist AI executives, we are scaling business
                        objectives with zero latency.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                // Thinking log
                <div className="p-4 border border-card-border bg-black/5 dark:bg-white/5 rounded-lg flex items-center space-x-3 text-xs text-foreground/60">
                  <Loader2 className="h-4 w-4 animate-spin text-hq-blue" />
                  <span>
                    {currentStep === 1
                      ? 'Asad (CEO) is compiling strategic bounds...'
                      : currentStep === 2
                        ? 'Teema (Ops Director) is structuring execution nodes...'
                        : 'Legal (Compliance Director) is auditing compliance guidelines...'}
                  </span>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-end border-t border-card-border pt-4">
              <Link
                href="/dashboard"
                className={progress === 100 ? '' : 'pointer-events-none opacity-50'}
              >
                <Button
                  variant="success"
                  className="text-xs font-semibold flex items-center gap-1.5"
                  disabled={progress !== 100}
                >
                  Enter Headquarters
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="h-16 flex items-center justify-center border-t border-card-border bg-black/[0.02] dark:bg-white/[0.02] text-xs text-foreground/45">
        <span>© 2026 HQ Inc. Multi-tenant Enterprise Layer.</span>
      </footer>
    </div>
  );
}
