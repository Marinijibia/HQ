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
      <section className="flex-1 flex flex-col items-center justify-center px-6 text-center py-25 relative z-10">
        <div className="max-w-4xl space-y-8">
          <Badge
            variant="ai"
            className="px-5 py-1.5 text-xs font-bold uppercase tracking-widest border border-hq-cyan/30 bg-hq-cyan/5 text-hq-cyan shadow-[0_0_15px_rgba(6,182,212,0.1)] rounded-full animate-in fade-in zoom-in duration-300"
          >
            <Sparkles className="h-3.5 w-3.5 mr-1.5 inline animate-pulse" />
            AI Executive OS v1.0 Launch
          </Badge>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-[#1A1A1E] dark:text-white leading-[1.1] max-w-3xl mx-auto">
            Collaborate with an{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-hq-blue via-[#A855F7] to-hq-cyan drop-shadow-[0_2px_10px_rgba(168,85,247,0.2)]">
              Intelligent C-Suite
            </span>
          </h1>

          <p className="text-foreground/60 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed font-normal">
            HQ orchestrates your operations autonomously. Decompose corporate strategy, delegate to
            specialist AI directors, and run zero-trust execution.
          </p>

          <div className="flex flex-col sm:flex-row gap-5 justify-center pt-6">
            <Link href={user ? '/dashboard' : '/onboarding'}>
              <Button
                size="lg"
                variant="primary"
                className="flex items-center gap-2 font-bold px-7 h-12 bg-gradient-to-r from-hq-blue to-hq-purple text-white border-none shadow-[0_4px_20px_rgba(14,165,233,0.25)] hover:shadow-[0_4px_25px_rgba(14,165,233,0.4)] transition-all scale-100 hover:scale-[1.02] active:scale-95"
              >
                {user ? 'Enter Boardroom' : 'Get Started Free'}
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/boardroom">
              <Button
                size="lg"
                variant="outline"
                className="flex items-center gap-1.5 font-bold px-7 h-12 border-card-border bg-card-bg shadow-[var(--card-shadow)] text-foreground/80 hover:text-[#1A1A1E] dark:hover:text-white hover:bg-black/5 dark:hover:bg-[#1E1E24]/20 transition-all card-transition"
              >
                Meet the Board
                <ChevronRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Live Stats Strip */}
      <section className="border-t border-b border-card-border bg-card-bg/50 backdrop-blur-sm py-5 relative z-10">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { value: '25', label: 'AI Executives', color: '#0A84FF' },
            { value: '500K+', label: 'Decisions Processed', color: '#BF5AF2' },
            { value: '99.9%', label: 'Uptime SLA', color: '#30D158' },
            { value: '<2s', label: 'Avg. Response Time', color: '#F59E0B' },
          ].map((stat) => (
            <div key={stat.label} className="space-y-1">
              <p className="text-2xl font-black" style={{ color: stat.color }}>{stat.value}</p>
              <p className="text-[10px] text-foreground/50 font-semibold uppercase tracking-widest">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Executive Showcase */}
      <section className="px-6 py-20 sm:px-12 relative z-10 overflow-hidden">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <span className="inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-hq-purple/30 bg-hq-purple/5 text-hq-purple">
              Your C-Suite Board
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight text-[#1A1A1E] dark:text-white sm:text-4xl">
              Meet Your AI Executives
            </h2>
            <p className="text-foreground/50 text-sm max-w-md mx-auto leading-relaxed">
              25 pre-configured AI directors — each with a distinct role, personality, and decision-making framework.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { initials: 'CE', name: 'CEO', fullName: 'Chief Executive', status: 'Researching', task: 'Analysing Q3 strategic pivot', color: '#0A84FF' },
              { initials: 'CM', name: 'CMO', fullName: 'Chief Marketing', status: 'Available', task: 'Ready to receive brief', color: '#BF5AF2' },
              { initials: 'CF', name: 'CFO', fullName: 'Chief Financial', status: 'Busy', task: 'Reviewing budget allocations', color: '#30D158' },
              { initials: 'CT', name: 'CTO', fullName: 'Chief Technology', status: 'Researching', task: 'Evaluating API architecture', color: '#F59E0B' },
            ].map((exec, i) => (
              <div
                key={exec.name}
                className="relative group rounded-2xl border border-card-border bg-card-bg p-5 space-y-4 hover:border-hq-blue/40 hover:-translate-y-1 transition-all duration-300 shadow-[var(--card-shadow)] overflow-hidden"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                {/* Glow bg */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl" style={{ background: `radial-gradient(ellipse at top left, ${exec.color}08, transparent 70%)` }} />

                <div className="flex items-center gap-3">
                  {/* Avatar with spin ring if busy */}
                  <div className="relative shrink-0">
                    {(exec.status === 'Researching' || exec.status === 'Busy') && (
                      <div className="absolute -inset-1.5 rounded-full border-2 border-t-transparent animate-spin pointer-events-none" style={{ borderColor: `${exec.color}40`, borderTopColor: exec.color }} />
                    )}
                    <div className="h-10 w-10 rounded-full flex items-center justify-center font-black text-sm text-white shadow-lg" style={{ background: `linear-gradient(135deg, ${exec.color}, ${exec.color}80)` }}>
                      {exec.initials}
                    </div>
                    <span className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white dark:border-[#0A0A0C] ${exec.status === 'Available' ? 'bg-emerald-500 animate-pulse' : exec.status === 'Researching' ? 'bg-hq-purple animate-pulse' : 'bg-amber-500'}`} />
                  </div>

                  <div>
                    <p className="text-sm font-bold text-[#1A1A1E] dark:text-white">{exec.name}</p>
                    <p className="text-[10px] text-foreground/45 font-semibold">{exec.fullName}</p>
                  </div>
                </div>

                <div className="rounded-xl bg-foreground/4 border border-card-border p-2.5">
                  <p className="text-[9px] uppercase tracking-widest text-foreground/40 font-bold mb-1">Current Task</p>
                  <p className="text-[11px] text-foreground/80 font-semibold leading-snug">{exec.task}</p>
                </div>

                <div className="flex items-center justify-between">
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${exec.status === 'Available' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : exec.status === 'Researching' ? 'bg-hq-purple/10 border-hq-purple/20 text-hq-purple' : 'bg-amber-500/10 border-amber-500/20 text-amber-500'}`}>
                    {exec.status}
                  </span>
                  <span className="text-[9px] text-foreground/30 font-semibold">Gemini 2.5 Pro</span>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link href="/boardroom">
              <Button variant="outline" size="sm" className="text-xs font-bold border-card-border gap-2">
                View All 25 Executives <ChevronRight className="h-3.5 w-3.5" />
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
            <p className="text-foreground/50 text-sm sm:text-base max-w-md mx-auto leading-relaxed">
              HQ embeds strict guardrails, priority token budgets, and inter-agent compliance
              checking loops at runtime.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <Card className="p-8 space-y-5 border border-card-border bg-card-bg shadow-[var(--card-shadow)] card-transition backdrop-blur-md hover:border-hq-blue/45 transition-all hover:translate-y-[-4px] duration-300">
              <div className="h-11 w-11 rounded-lg bg-hq-blue/10 border border-hq-blue/20 flex items-center justify-center text-hq-blue">
                <BrainCircuit className="h-6 w-6" />
              </div>
              <div className="space-y-2 text-left">
                <h3 className="text-base font-bold text-[#1A1A1E] dark:text-white">
                  25 C-Suite Specialists
                </h3>
                <p className="text-sm text-foreground/50 leading-relaxed">
                  Pre-seeded directors mapping CEO alignment protocols down to QA validation checks,
                  legal reviews, and tech feasibility audits.
                </p>
              </div>
            </Card>

            <Card className="p-8 space-y-5 border border-card-border bg-card-bg shadow-[var(--card-shadow)] card-transition backdrop-blur-md hover:border-hq-purple/45 transition-all hover:translate-y-[-4px] duration-300">
              <div className="h-11 w-11 rounded-lg bg-hq-purple/10 border border-hq-purple/20 flex items-center justify-center text-hq-purple">
                <Rocket className="h-6 w-6" />
              </div>
              <div className="space-y-2 text-left">
                <h3 className="text-base font-bold text-[#1A1A1E] dark:text-white">
                  DAG Task Orchestration
                </h3>
                <p className="text-sm text-foreground/50 leading-relaxed">
                  Arthur Steward (COS) decomposes missions into Directed Acyclic Graph (DAG) task
                  hierarchies running in parallel on BullMQ workers.
                </p>
              </div>
            </Card>

            <Card className="p-8 space-y-5 border border-card-border bg-card-bg shadow-[var(--card-shadow)] card-transition backdrop-blur-md hover:border-hq-cyan/45 transition-all hover:translate-y-[-4px] duration-300">
              <div className="h-11 w-11 rounded-lg bg-hq-cyan/10 border border-hq-cyan/20 flex items-center justify-center text-hq-cyan">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div className="space-y-2 text-left">
                <h3 className="text-base font-bold text-[#1A1A1E] dark:text-white">
                  Zero-Trust Boundaries
                </h3>
                <p className="text-sm text-foreground/50 leading-relaxed">
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
            <p className="text-foreground/50 text-sm sm:text-base">
              Upgrade, cancel, and check credit ledger records instantly.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {/* Free Starter */}
            <Card className="p-8 flex flex-col justify-between h-[450px] border border-card-border bg-card-bg shadow-[var(--card-shadow)] card-transition hover:border-black/20 dark:hover:border-white/20 transition-all duration-300">
              <div className="space-y-5 text-left">
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-[#1A1A1E] dark:text-foreground/90">
                    Free Starter Tier
                  </h3>
                  <p className="text-xs text-foreground/45">Best for exploratory testing</p>
                </div>
                <div className="text-4xl font-extrabold text-[#1A1A1E] dark:text-white">
                  $0<span className="text-xs font-normal text-foreground/45 ml-1">/ month</span>
                </div>
                <p className="text-sm text-foreground/50 leading-relaxed">
                  Deploy a starter boardroom and launch single campaign tasks. Includes 5,000 AI Tokens / mo.
                </p>
                <div className="border-t border-card-border pt-4">
                  <ul className="text-sm space-y-2.5 text-foreground/70">
                    <li className="flex items-center gap-2">
                      <Cpu className="h-4 w-4 text-hq-blue" />
                      <span>5,000 Monthly AI Tokens</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Layers className="h-4 w-4 text-hq-blue" />
                      <span>1 Active Boardroom WBS</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Lock className="h-4 w-4 text-hq-blue" />
                      <span>1GB Indexed Storage</span>
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
            <Card className="p-8 flex flex-col justify-between h-[450px] border border-hq-blue/30 dark:border-hq-blue/50 bg-[#0A84FF]/5 dark:bg-[#070D19]/45 backdrop-blur-md relative shadow-[var(--card-shadow)] hover:border-hq-blue transition-all duration-300 card-transition">
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
                    Growth Scale
                  </h3>
                  <p className="text-xs text-hq-cyan/80 font-medium">
                    Best for scaling operations
                  </p>
                </div>
                <div className="text-4xl font-extrabold text-[#1A1A1E] dark:text-white">
                  $10<span className="text-xs font-normal text-foreground/45 ml-1">/ month</span>
                </div>
                <p className="text-sm text-foreground/50 leading-relaxed">
                  Run concurrent boardroom missions and custom memory vectors. Includes 50,000 AI Tokens / mo.
                </p>
                <div className="border-t border-card-border pt-4">
                  <ul className="text-sm space-y-2.5 text-foreground/70">
                    <li className="flex items-center gap-2">
                      <Cpu className="h-4 w-4 text-hq-cyan" />
                      <span className="text-[#1A1A1E] dark:text-white">
                        50,000 Monthly AI Tokens
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Layers className="h-4 w-4 text-hq-cyan" />
                      <span>5 Parallel Boardroom WBS</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Lock className="h-4 w-4 text-hq-cyan" />
                      <span>Circle Agentic USDC Wallet</span>
                    </li>
                  </ul>
                </div>
              </div>
              <Link href={user ? '/billing' : '/onboarding'} className="w-full">
                <Button
                  variant="primary"
                  className="w-full text-xs font-bold h-10 bg-gradient-to-r from-hq-blue to-hq-purple text-white border-none shadow-[0_0_15px_rgba(14,165,233,0.2)] hover:shadow-[0_0_20px_rgba(14,165,233,0.4)] transition-all"
                >
                  Subscribe ($10/mo)
                </Button>
              </Link>
            </Card>

            {/* Enterprise Tier */}
            <Card className="p-8 flex flex-col justify-between h-[450px] border border-card-border bg-card-bg shadow-[var(--card-shadow)] card-transition hover:border-hq-purple transition-all duration-300">
              <div className="space-y-5 text-left">
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-[#1A1A1E] dark:text-white">Enterprise OS</h3>
                  <p className="text-xs text-hq-purple-300 font-medium">
                    Best for complete AI execution
                  </p>
                </div>
                <div className="text-4xl font-extrabold text-[#1A1A1E] dark:text-white">
                  $20<span className="text-xs font-normal text-foreground/45 ml-1">/ month</span>
                </div>
                <p className="text-sm text-foreground/50 leading-relaxed">
                  Infinite boardroom capacity, custom C-Suite roster, and 6-tier autonomy killswitch. Includes 200,000 AI Tokens / mo.
                </p>
                <div className="border-t border-card-border pt-4">
                  <ul className="text-sm space-y-2.5 text-foreground/70">
                    <li className="flex items-center gap-2">
                      <Cpu className="h-4 w-4 text-[#C084FC]" />
                      <span>200,000 Monthly AI Tokens</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Layers className="h-4 w-4 text-[#C084FC]" />
                      <span>Unlimited Boardroom WBS</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Lock className="h-4 w-4 text-[#C084FC]" />
                      <span>6-Tier Autonomy Killswitch</span>
                    </li>
                  </ul>
                </div>
              </div>
              <Link href={user ? '/billing' : '/onboarding'} className="w-full">
                <Button
                  variant="primary"
                  className="w-full text-xs font-bold h-10 bg-purple-600 hover:bg-purple-500 text-white border-none shadow-[0_0_15px_rgba(168,85,247,0.2)] transition-all"
                >
                  Subscribe ($20/mo)
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
