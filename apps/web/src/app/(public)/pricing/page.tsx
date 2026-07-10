'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card, Badge, Button } from '@hq/ui';
import { Cpu, Layers, Lock } from 'lucide-react';
import { useAuth } from '../../../contexts/auth-context';

export default function PricingPage() {
  const { user } = useAuth();

  return (
    <div className="py-12 max-w-6xl mx-auto px-6 space-y-16">
      {/* Header */}
      <div className="text-center space-y-3">
        <Badge
          variant="premium"
          className="px-3.5 py-1 rounded-full text-xs tracking-widest font-bold"
        >
          PRICING & LIMITATIONS
        </Badge>
        <h1 className="text-4xl font-extrabold tracking-tight text-[#1A1A1E] dark:text-white sm:text-5xl">
          Simple, Transparent Plans
        </h1>
        <p className="text-foreground/50 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
          Upgrade, downgrade, or audit credit usage records at any time. No hidden setup fees.
        </p>
      </div>

      {/* Grid */}
      <div className="grid gap-8 md:grid-cols-3">
        {/* Free Starter */}
        <Card className="p-7 flex flex-col justify-between h-[420px] border border-card-border bg-card-bg shadow-[var(--card-shadow)] card-transition hover:border-black/20 dark:hover:border-white/20 transition-all duration-300">
          <div className="space-y-5 text-left">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-[#1A1A1E] dark:text-foreground/90">
                Free Starter
              </h3>
              <p className="text-xs text-foreground/45">Best for exploratory testing</p>
            </div>
            <div className="text-4xl font-extrabold text-[#1A1A1E] dark:text-white">
              $0<span className="text-xs font-normal text-foreground/45 ml-1">/ month</span>
            </div>
            <p className="text-sm text-foreground/50 leading-relaxed">
              Deploy a starter boardroom and launch single campaign tasks.
            </p>
            <div className="border-t border-card-border pt-4">
              <ul className="text-sm space-y-2.5 text-foreground/70">
                <li className="flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-hq-blue" />
                  <span>1 Active Running Mission</span>
                </li>
                <li className="flex items-center gap-2">
                  <Layers className="h-4 w-4 text-hq-blue" />
                  <span>25 AI Executives Roster</span>
                </li>
                <li className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-hq-blue" />
                  <span>Standard Rate Limits</span>
                </li>
              </ul>
            </div>
          </div>
          <Link href={user ? '/dashboard' : '/onboarding'} className="w-full">
            <Button
              variant="secondary"
              className="w-full text-xs font-bold h-10 border-card-border hover:bg-black/5 dark:hover:bg-[#1E1E24]/20 transition-all"
            >
              Deploy Free
            </Button>
          </Link>
        </Card>

        {/* Growth Tier */}
        <Card className="p-7 flex flex-col justify-between h-[420px] border border-hq-blue/30 dark:border-hq-blue/50 bg-[#0A84FF]/5 dark:bg-[#070D19]/45 backdrop-blur-md relative shadow-[var(--card-shadow)] hover:border-hq-blue transition-all duration-300 card-transition">
          <div className="absolute top-4 right-4">
            <Badge
              variant="premium"
              className="text-[8px] font-bold px-2 py-0.5 border border-hq-cyan/45 bg-hq-cyan/10 text-hq-cyan rounded-full"
            >
              Recommended
            </Badge>
          </div>
          <div className="space-y-5 text-left">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-[#1A1A1E] dark:text-white">Growth Team</h3>
              <p className="text-xs text-hq-cyan/80 font-medium">Best for collaborative scales</p>
            </div>
            <div className="text-4xl font-extrabold text-[#1A1A1E] dark:text-white">
              $99<span className="text-xs font-normal text-foreground/45 ml-1">/ month</span>
            </div>
            <p className="text-sm text-foreground/50 leading-relaxed">
              Run concurrent workflows, custom memory vectors, and high speed failovers.
            </p>
            <div className="border-t border-card-border pt-4">
              <ul className="text-sm space-y-2.5 text-foreground/70">
                <li className="flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-hq-cyan" />
                  <span className="text-[#1A1A1E] dark:text-white">10 Active Running Missions</span>
                </li>
                <li className="flex items-center gap-2">
                  <Layers className="h-4 w-4 text-hq-cyan" />
                  <span>Enhanced memory caching</span>
                </li>
                <li className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-hq-cyan" />
                  <span>Decoupled GCS fallback paths</span>
                </li>
              </ul>
            </div>
          </div>
          <Link href={user ? '/dashboard' : '/onboarding'} className="w-full">
            <Button
              variant="primary"
              className="w-full text-xs font-bold h-10 bg-gradient-to-r from-hq-blue to-hq-purple text-white border-none shadow-[0_0_15px_rgba(14,165,233,0.2)] hover:shadow-[0_0_20px_rgba(14,165,233,0.4)] transition-all"
            >
              Subscribe Now
            </Button>
          </Link>
        </Card>

        {/* Enterprise Tier */}
        <Card className="p-7 flex flex-col justify-between h-[420px] border border-card-border bg-card-bg shadow-[var(--card-shadow)] card-transition hover:border-hq-purple transition-all duration-300">
          <div className="space-y-5 text-left">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-[#1A1A1E] dark:text-white">Enterprise</h3>
              <p className="text-xs text-hq-purple-300 font-medium">Best for global corporations</p>
            </div>
            <div className="text-4xl font-extrabold text-[#1A1A1E] dark:text-white">
              $499<span className="text-xs font-normal text-foreground/45 ml-1">/ month</span>
            </div>
            <p className="text-sm text-foreground/50 leading-relaxed">
              Infinite workspace capacity, complete legal holds overrides, and priority queues.
            </p>
            <div className="border-t border-card-border pt-4">
              <ul className="text-sm space-y-2.5 text-foreground/70">
                <li className="flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-[#C084FC]" />
                  <span>Unlimited Active Missions</span>
                </li>
                <li className="flex items-center gap-2">
                  <Layers className="h-4 w-4 text-[#C084FC]" />
                  <span>Legal Hold overrides active</span>
                </li>
                <li className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-[#C084FC]" />
                  <span>Priority direct AI execution</span>
                </li>
              </ul>
            </div>
          </div>
          <Link href={user ? '/dashboard' : '/onboarding'} className="w-full">
            <Button
              variant="accent"
              className="w-full text-xs font-bold h-10 border-hq-purple/40 hover:bg-hq-purple/10 transition-all"
            >
              Contact Sales
            </Button>
          </Link>
        </Card>
      </div>
    </div>
  );
}
