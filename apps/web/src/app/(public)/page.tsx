'use client';

import * as React from 'react';
import Link from 'next/link';
import { Button, Card, Badge } from '@hq/ui';
import {
  ShieldCheck,
  BrainCircuit,
  Rocket,
  ChevronRight,
  ArrowRight,
  Sparkles,
  Lock,
  Cpu,
  Layers,
} from 'lucide-react';
import { useAuth } from '../../contexts/auth-context';

export default function LandingPage() {
  const { user } = useAuth();

  return (
    <div className="flex-1 flex flex-col justify-between">
      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 text-center py-20 relative z-10">
        <div className="max-w-4xl space-y-8">
          <Badge
            variant="ai"
            className="px-4.5 py-1 text-[10px] font-bold uppercase tracking-widest border border-hq-cyan/30 bg-hq-cyan/5 text-hq-cyan shadow-[0_0_15px_rgba(6,182,212,0.1)] rounded-full"
          >
            <Sparkles className="h-3 w-3 mr-1.5 inline animate-pulse" />
            AI Executive OS v1.0 Launch
          </Badge>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-[#1A1A1E] dark:text-white leading-[1.1] max-w-3xl mx-auto">
            Collaborate with an{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-hq-blue via-[#A855F7] to-hq-cyan drop-shadow-[0_2px_10px_rgba(168,85,247,0.2)]">
              Intelligent C-Suite
            </span>
          </h1>

          <p className="text-foreground/60 text-base md:text-lg max-w-xl mx-auto leading-relaxed font-normal">
            HQ orchestrates your operations autonomously. Decompose corporate strategy, delegate to
            specialist AI directors, and run zero-trust execution.
          </p>

          <div className="flex flex-col sm:flex-row gap-4.5 justify-center pt-6">
            <Link href={user ? '/dashboard' : '/onboarding'}>
              <Button
                size="lg"
                variant="primary"
                className="flex items-center gap-2 font-bold px-6 h-11 bg-gradient-to-r from-hq-blue to-hq-purple text-white border-none shadow-[0_4px_20px_rgba(14,165,233,0.25)] hover:shadow-[0_4px_25px_rgba(14,165,233,0.4)] transition-all scale-100 hover:scale-[1.02] active:scale-95"
              >
                {user ? 'Enter Boardroom' : 'Get Started Free'}
                <ArrowRight className="h-4.5 w-4.5" />
              </Button>
            </Link>
            <Link href="/boardroom">
              <Button
                size="lg"
                variant="outline"
                className="flex items-center gap-1.5 font-bold px-6 h-11 border-card-border bg-card-bg shadow-[var(--card-shadow)] text-foreground/80 hover:text-[#1A1A1E] dark:hover:text-white hover:bg-black/5 dark:hover:bg-[#1E1E24]/20 transition-all card-transition"
              >
                Meet the Board
                <ChevronRight className="h-4.5 w-4.5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Premium Features Section */}
      <section className="px-6 py-20 sm:px-12 border-t border-card-border bg-gradient-to-b from-black/5 dark:from-[#0A0A0C]/50 to-transparent relative z-10">
        <div className="max-w-6xl mx-auto space-y-16">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-extrabold tracking-tight text-[#1A1A1E] dark:text-white sm:text-4xl">
              Engineered for Autonomous Alignment
            </h2>
            <p className="text-foreground/50 text-sm max-w-md mx-auto leading-relaxed">
              HQ embeds strict guardrails, priority token budgets, and inter-agent compliance
              checking loops at runtime.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <Card className="p-7 space-y-5 border border-card-border bg-card-bg shadow-[var(--card-shadow)] card-transition backdrop-blur-md hover:border-hq-blue/45 transition-all hover:translate-y-[-4px] duration-300">
              <div className="h-10 w-10 rounded-lg bg-hq-blue/10 border border-hq-blue/20 flex items-center justify-center text-hq-blue">
                <BrainCircuit className="h-5.5 w-5.5" />
              </div>
              <div className="space-y-2 text-left">
                <h3 className="text-base font-bold text-[#1A1A1E] dark:text-white">
                  25 C-Suite Specialists
                </h3>
                <p className="text-xs text-foreground/50 leading-relaxed">
                  Pre-seeded directors mapping CEO alignment protocols down to QA validation checks,
                  legal reviews, and tech feasibility audits.
                </p>
              </div>
            </Card>

            <Card className="p-7 space-y-5 border border-card-border bg-card-bg shadow-[var(--card-shadow)] card-transition backdrop-blur-md hover:border-hq-purple/45 transition-all hover:translate-y-[-4px] duration-300">
              <div className="h-10 w-10 rounded-lg bg-hq-purple/10 border border-hq-purple/20 flex items-center justify-center text-hq-purple">
                <Rocket className="h-5.5 w-5.5" />
              </div>
              <div className="space-y-2 text-left">
                <h3 className="text-base font-bold text-[#1A1A1E] dark:text-white">
                  DAG Task Orchestration
                </h3>
                <p className="text-xs text-foreground/50 leading-relaxed">
                  Arthur Steward (COS) decomposes missions into Directed Acyclic Graph (DAG) task
                  hierarchies running in parallel on BullMQ workers.
                </p>
              </div>
            </Card>

            <Card className="p-7 space-y-5 border border-card-border bg-card-bg shadow-[var(--card-shadow)] card-transition backdrop-blur-md hover:border-hq-cyan/45 transition-all hover:translate-y-[-4px] duration-300">
              <div className="h-10 w-10 rounded-lg bg-hq-cyan/10 border border-hq-cyan/20 flex items-center justify-center text-hq-cyan">
                <ShieldCheck className="h-5.5 w-5.5" />
              </div>
              <div className="space-y-2 text-left">
                <h3 className="text-base font-bold text-[#1A1A1E] dark:text-white">
                  Zero-Trust Boundaries
                </h3>
                <p className="text-xs text-foreground/50 leading-relaxed">
                  Enforces strict RBAC custom user roles verification, entitlement checks, and
                  pre-flight prompt injection sanitization.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Premium Pricing Sections */}
      <section className="px-6 py-20 sm:px-12 border-t border-card-border relative z-10 bg-gradient-to-b from-transparent to-black/5 dark:to-[#0A0A0C]/30">
        <div className="max-w-6xl mx-auto space-y-16">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-extrabold tracking-tight text-[#1A1A1E] dark:text-white sm:text-4xl">
              Select Your Execution Plan
            </h2>
            <p className="text-foreground/50 text-sm">
              Upgrade, cancel, and check credit ledger records instantly.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {/* Free Starter */}
            <Card className="p-7 flex flex-col justify-between h-[420px] border border-card-border bg-card-bg shadow-[var(--card-shadow)] card-transition hover:border-black/20 dark:hover:border-white/20 transition-all duration-300">
              <div className="space-y-5 text-left">
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-[#1A1A1E] dark:text-foreground/90">
                    Free Starter
                  </h3>
                  <p className="text-[10px] text-foreground/45">Best for exploratory testing</p>
                </div>
                <div className="text-4xl font-extrabold text-[#1A1A1E] dark:text-white">
                  $0<span className="text-xs font-normal text-foreground/45 ml-1">/ month</span>
                </div>
                <p className="text-xs text-foreground/50 leading-relaxed">
                  Deploy a starter boardroom and launch single campaign tasks.
                </p>
                <div className="border-t border-card-border pt-4">
                  <ul className="text-xs space-y-2.5 text-foreground/70">
                    <li className="flex items-center gap-2">
                      <Cpu className="h-3.5 w-3.5 text-hq-blue" />
                      <span>1 Active Running Mission</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Layers className="h-3.5 w-3.5 text-hq-blue" />
                      <span>25 AI Executives Roster</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Lock className="h-3.5 w-3.5 text-hq-blue" />
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
                  <h3 className="text-base font-bold text-[#1A1A1E] dark:text-white">
                    Growth Team
                  </h3>
                  <p className="text-[10px] text-hq-cyan/80">Best for collaborative scales</p>
                </div>
                <div className="text-4xl font-extrabold text-[#1A1A1E] dark:text-white">
                  $99<span className="text-xs font-normal text-foreground/45 ml-1">/ month</span>
                </div>
                <p className="text-xs text-foreground/50 leading-relaxed">
                  Run concurrent workflows, custom memory vectors, and high speed failovers.
                </p>
                <div className="border-t border-card-border pt-4">
                  <ul className="text-xs space-y-2.5 text-foreground/70">
                    <li className="flex items-center gap-2">
                      <Cpu className="h-3.5 w-3.5 text-hq-cyan" />
                      <span className="text-[#1A1A1E] dark:text-white">
                        10 Active Running Missions
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Layers className="h-3.5 w-3.5 text-hq-cyan" />
                      <span>Enhanced memory caching</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Lock className="h-3.5 w-3.5 text-hq-cyan" />
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
                  <p className="text-[10px] text-hq-purple-300">Best for global corporations</p>
                </div>
                <div className="text-4xl font-extrabold text-[#1A1A1E] dark:text-white">
                  $499<span className="text-xs font-normal text-foreground/45 ml-1">/ month</span>
                </div>
                <p className="text-xs text-foreground/50 leading-relaxed">
                  Infinite workspace capacity, complete legal holds overrides, and priority queues.
                </p>
                <div className="border-t border-card-border pt-4">
                  <ul className="text-xs space-y-2.5 text-foreground/70">
                    <li className="flex items-center gap-2">
                      <Cpu className="h-3.5 w-3.5 text-[#C084FC]" />
                      <span>Unlimited Active Missions</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Layers className="h-3.5 w-3.5 text-[#C084FC]" />
                      <span>Legal Hold overrides active</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Lock className="h-3.5 w-3.5 text-[#C084FC]" />
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
      </section>
    </div>
  );
}
