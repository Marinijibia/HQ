'use client';

import * as React from 'react';
import { CheckCircle2, Circle, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface SetupStep {
  id: string;
  label: string;
  description: string;
  href: string;
  localStorageKey?: string;
  checkFn?: () => boolean;
}

const SETUP_STEPS: SetupStep[] = [
  {
    id: 'profile',
    label: 'Complete your organization profile',
    description: 'Tell HQ about your business so executives can give smarter advice',
    href: '/intelligence',
    localStorageKey: 'hq_org_profile_done',
  },
  {
    id: 'mission',
    label: 'Launch your first mission',
    description: 'Give your AI executive team their first objective',
    href: '/missions',
    localStorageKey: 'hq_first_mission_done',
  },
  {
    id: 'team',
    label: 'Invite a team member',
    description: 'Collaborate with your colleagues inside HQ',
    href: '/settings',
    localStorageKey: 'hq_team_invited',
  },
];

export function SetupProgressBar({ brandColor = '#0A84FF' }: { brandColor?: string }) {
  const router = useRouter();
  const [completedSteps, setCompletedSteps] = React.useState<Set<string>>(new Set());
  const [dismissed, setDismissed] = React.useState(false);

  React.useEffect(() => {
    if (localStorage.getItem('hq_setup_dismissed') === 'true') {
      setDismissed(true);
      return;
    }
    const completed = new Set<string>();
    SETUP_STEPS.forEach(step => {
      if (step.localStorageKey && localStorage.getItem(step.localStorageKey) === 'true') {
        completed.add(step.id);
      }
    });
    // Auto-check profile if onboarding draft exists
    try {
      const draft = JSON.parse(localStorage.getItem('hq_onboarding_draft') || '{}');
      if (draft.orgName || draft.industry) completed.add('profile');
    } catch { /* ignore */ }
    setCompletedSteps(completed);
  }, []);

  if (dismissed || completedSteps.size === SETUP_STEPS.length) return null;

  const pct = Math.round((completedSteps.size / SETUP_STEPS.length) * 100);
  const nextStep = SETUP_STEPS.find(s => !completedSteps.has(s.id));

  return (
    <div
      className="rounded-2xl border p-5 mb-6 animate-in fade-in duration-500"
      style={{ borderColor: `${brandColor}30`, background: `${brandColor}08` }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs font-extrabold" style={{ color: brandColor }}>
            🚀 Get started — {pct}% complete
          </p>
          <p className="text-xs text-foreground/50 font-semibold mt-0.5">
            Complete these steps to unlock the full power of your AI executive team
          </p>
        </div>
        <button
          onClick={() => { localStorage.setItem('hq_setup_dismissed', 'true'); setDismissed(true); }}
          className="text-xs text-foreground/30 hover:text-foreground/60 font-bold transition-colors"
        >
          Dismiss
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 rounded-full bg-foreground/10 mb-4 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: brandColor }}
        />
      </div>

      {/* Steps */}
      <div className="space-y-2">
        {SETUP_STEPS.map((step, i) => {
          const done = completedSteps.has(step.id);
          const isNext = step.id === nextStep?.id;
          return (
            <button
              key={step.id}
              onClick={() => router.push(step.href)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${
                isNext
                  ? 'bg-foreground/5 hover:bg-foreground/8 border border-foreground/10'
                  : 'hover:bg-foreground/4'
              } ${done ? 'opacity-50' : ''}`}
            >
              {done ? (
                <CheckCircle2 className="h-4 w-4 shrink-0" style={{ color: brandColor }} />
              ) : (
                <Circle className={`h-4 w-4 shrink-0 ${isNext ? 'text-foreground/40' : 'text-foreground/20'}`} />
              )}
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-extrabold ${done ? 'line-through text-foreground/40' : 'text-[#1A1A1E] dark:text-white'}`}>
                  Step {i + 1}: {step.label}
                </p>
                {!done && (
                  <p className="text-xs text-foreground/45 font-semibold mt-0.5 truncate">{step.description}</p>
                )}
              </div>
              {isNext && !done && (
                <ChevronRight className="h-3.5 w-3.5 shrink-0" style={{ color: brandColor }} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
