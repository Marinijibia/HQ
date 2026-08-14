'use client';

import * as React from 'react';
import { X, Zap, Rocket, Shield, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@hq/ui';
import { useRouter } from 'next/navigation';

export interface UpgradeTrigger {
  /** The structured code from the entitlement guard 403 response */
  code: 'ENTITLEMENT_LIMIT_REACHED';
  planCode: string;
  activeMissions: number;
  maxActiveMissions: number | string;
  message: string;
  upgradeUrl: string;
}

interface UpgradeModalProps {
  open: boolean;
  onClose: () => void;
  trigger: UpgradeTrigger | null;
}

const PLAN_DETAILS = {
  GROWTH: {
    name: 'Growth Scale',
    price: '$10 / mo',
    color: '#06b6d4',
    icon: Zap,
    perks: [
      '25,000 AI credits per month',
      '10 concurrent missions',
      'Custom executive training data',
      'API key access',
      'Priority response speed',
    ],
  },
  PRO: {
    name: 'Growth Scale',
    price: '$10 / mo',
    color: '#06b6d4',
    icon: Zap,
    perks: [
      '25,000 AI credits per month',
      '10 concurrent missions',
      'Custom executive training data',
      'API key access',
      'Priority response speed',
    ],
  },
  ENTERPRISE: {
    name: 'Enterprise OS',
    price: '$50 / mo',
    color: '#8b5cf6',
    icon: Shield,
    perks: [
      '200,000 AI credits per month',
      'Unlimited concurrent missions',
      'Dedicated agent swarms',
      'Custom model fine-tuning',
      'Priority support & SLA',
    ],
  },
} as const;

/** Parse an entitlement 403 error body into a structured UpgradeTrigger */
export async function parseEntitlementError(res: Response): Promise<UpgradeTrigger | null> {
  if (res.status !== 403) return null;
  try {
    const body = await res.clone().json();
    // NestJS wraps structured ForbiddenException message in body.message
    const raw = typeof body.message === 'string' ? body.message : null;
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed?.code === 'ENTITLEMENT_LIMIT_REACHED') {
      return parsed as UpgradeTrigger;
    }
  } catch {
    // Not a structured entitlement error — let caller handle normally
  }
  return null;
}

export function UpgradeModal({ open, onClose, trigger }: UpgradeModalProps) {
  const router = useRouter();
  const [closing, setClosing] = React.useState(false);

  const handleClose = React.useCallback(() => {
    setClosing(true);
    setTimeout(() => {
      setClosing(false);
      onClose();
    }, 200);
  }, [onClose]);

  // Escape key
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose(); };
    if (open) window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, handleClose]);

  if (!open || !trigger) return null;

  // Recommend the next tier up from their current plan
  const currentPlan = trigger.planCode?.toUpperCase() ?? 'FREE';
  const nextPlan = currentPlan === 'FREE' ? 'GROWTH' : 'ENTERPRISE';
  const plan = PLAN_DETAILS[nextPlan as keyof typeof PLAN_DETAILS] ?? PLAN_DETAILS.GROWTH;
  const PlanIcon = plan.icon;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-200 ${closing ? 'opacity-0' : 'opacity-100'}`}
        onClick={handleClose}
      />

      {/* Modal */}
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none`}
      >
        <div
          className={`pointer-events-auto w-full max-w-md bg-white dark:bg-[#0A0A0F] rounded-3xl shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden transition-all duration-200 ${
            closing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
          }`}
        >
          {/* Top gradient bar */}
          <div className="h-1.5 w-full" style={{ background: `linear-gradient(90deg, ${plan.color}, #8b5cf6)` }} />

          {/* Header */}
          <div className="p-6 pb-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="h-11 w-11 rounded-2xl flex items-center justify-center shrink-0"
                  style={{ background: `${plan.color}18` }}
                >
                  <PlanIcon className="h-5 w-5" style={{ color: plan.color }} />
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-900 dark:text-white">
                    Unlock More Missions
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                    You've hit your {currentPlan === 'FREE' ? 'Free tier' : `${currentPlan} plan`} limit
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="h-7 w-7 rounded-lg flex items-center justify-center hover:bg-slate-100 dark:hover:bg-white/8 transition-colors shrink-0 mt-0.5"
              >
                <X className="h-3.5 w-3.5 text-slate-400" />
              </button>
            </div>
          </div>

          {/* What they hit */}
          <div className="mx-6 mb-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50">
            <div className="flex items-start gap-2">
              <Rocket className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-700 dark:text-amber-300 font-semibold leading-relaxed">
                {trigger.message}
              </p>
            </div>
          </div>

          {/* Plan upgrade card */}
          <div className="mx-6 mb-4 p-4 rounded-2xl border-2 dark:border-white/10" style={{ borderColor: `${plan.color}40`, background: `${plan.color}06` }}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">Recommended Upgrade</p>
                <p className="text-sm font-black text-slate-900 dark:text-white mt-0.5">{plan.name}</p>
              </div>
              <p className="text-xl font-black" style={{ color: plan.color }}>{plan.price}</p>
            </div>
            <div className="space-y-1.5">
              {plan.perks.map((perk) => (
                <div key={perk} className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0" style={{ color: plan.color }} />
                  <span className="text-[11.5px] font-semibold text-slate-700 dark:text-slate-300">{perk}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="px-6 pb-6 space-y-2">
            <Button
              className="w-full h-11 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2"
              style={{ background: `linear-gradient(135deg, ${plan.color}, #8b5cf6)` }}
              onClick={() => {
                handleClose();
                router.push('/billing');
              }}
            >
              Upgrade to {plan.name}
              <ArrowRight className="h-4 w-4" />
            </Button>
            <button
              onClick={handleClose}
              className="w-full h-9 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
            >
              Continue on Free — I'll upgrade later
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
