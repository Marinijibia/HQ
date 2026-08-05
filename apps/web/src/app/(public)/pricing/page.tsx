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
        <Card className="p-7 flex flex-col justify-between h-[450px] border border-card-border bg-card-bg shadow-[var(--card-shadow)] card-transition hover:border-black/20 dark:hover:border-white/20 transition-all duration-300">
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
        <Card className="p-7 flex flex-col justify-between h-[450px] border border-hq-blue/30 dark:border-hq-blue/50 bg-[#0A84FF]/5 dark:bg-[#070D19]/45 backdrop-blur-md relative shadow-[var(--card-shadow)] hover:border-hq-blue transition-all duration-300 card-transition">
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
              <h3 className="text-base font-bold text-[#1A1A1E] dark:text-white">Growth Scale</h3>
              <p className="text-xs text-hq-cyan/80 font-medium">Best for scaling operations</p>
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
                  <span className="text-[#1A1A1E] dark:text-white">50,000 Monthly AI Tokens</span>
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
        <Card className="p-7 flex flex-col justify-between h-[450px] border border-card-border bg-card-bg shadow-[var(--card-shadow)] card-transition hover:border-hq-purple transition-all duration-300">
          <div className="space-y-5 text-left">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-[#1A1A1E] dark:text-white">Enterprise OS</h3>
              <p className="text-xs text-hq-purple-300 font-medium">Best for complete AI execution</p>
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

      {/* Extra Token Pack Store */}
      <Card className="p-8 border border-emerald-500/30 bg-gradient-to-r from-emerald-950/20 via-card-bg to-cyan-950/20 rounded-2xl shadow-xl text-left space-y-6">
        <div>
          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/40 text-[10px] uppercase font-black tracking-widest">
            NON-EXPIRING TOP-UPS
          </Badge>
          <h2 className="text-2xl font-black text-white mt-1">Extra AI Token Credit Packs</h2>
          <p className="text-xs text-foreground/60 leading-relaxed mt-1">
            Ran out of monthly tokens? Purchase instant extra token packs that never expire and add capacity directly to your AI Executives.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="p-5 border border-card-border bg-card-bg rounded-xl flex items-center justify-between">
            <div>
              <span className="text-lg font-black text-white block">+25,000 Extra AI Tokens</span>
              <span className="text-xs text-emerald-400 font-bold">$5.00 USD</span>
            </div>
            <Link href={user ? '/billing' : '/login'}>
              <Button size="sm" className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs">
                Buy $5 Pack
              </Button>
            </Link>
          </div>

          <div className="p-5 border border-card-border bg-card-bg rounded-xl flex items-center justify-between">
            <div>
              <span className="text-lg font-black text-white block">+100,000 Extra AI Tokens</span>
              <span className="text-xs text-emerald-400 font-bold">$15.00 USD</span>
            </div>
            <Link href={user ? '/billing' : '/login'}>
              <Button size="sm" className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs">
                Buy $15 Pack
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}
