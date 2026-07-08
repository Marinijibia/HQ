'use client';

import * as React from 'react';
import Link from 'next/link';
import { Button, Card, Badge } from '@hq/ui';
import { ShieldCheck, BrainCircuit, Rocket, ChevronRight, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0C] text-[#F2F2F7] flex flex-col justify-between font-sans select-none">
      {/* Navigation */}
      <nav className="flex h-16 items-center justify-between border-b border-hq-graphite/40 px-6 sm:px-12 bg-hq-graphite/10 backdrop-blur-md sticky top-0 z-40">
        <div className="flex items-center space-x-2">
          <div className="h-7 w-7 rounded-md bg-gradient-to-tr from-hq-blue to-hq-purple flex items-center justify-center font-bold text-white text-sm">
            HQ
          </div>
          <span className="font-bold tracking-tight text-white text-lg">HQ</span>
        </div>
        <div className="flex items-center space-x-4">
          <Link href="/dashboard">
            <Button variant="ghost" className="text-sm">
              Dashboard
            </Button>
          </Link>
          <Link href="/boardroom">
            <Button variant="primary" className="text-sm">
              Boardroom
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 text-center py-20 bg-radial-[circle_at_center,_var(--tw-gradient-stops)] from-hq-blue/10 via-transparent to-transparent">
        <div className="max-w-3xl space-y-6">
          <Badge variant="ai" className="px-3 py-1">
            HQ OS v1.0 Launch
          </Badge>
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Collaborate with an Intelligent{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-hq-blue via-hq-purple to-hq-cyan">
              AI C-Suite Board
            </span>
          </h1>
          <p className="text-foreground/70 text-lg md:text-xl max-w-xl mx-auto leading-relaxed">
            HQ is the AI Executive Operating System designed to plan, orchestrate, and audit
            operational growth autonomously.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link href="/dashboard">
              <Button size="lg" variant="primary" className="flex items-center gap-2">
                Get Started Free
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/boardroom">
              <Button size="lg" variant="outline" className="flex items-center gap-1">
                Meet the Board
                <ChevronRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section className="px-6 py-20 sm:px-12 border-t border-hq-graphite/40 bg-hq-graphite/5">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold tracking-tight text-white">Engineered for Scale</h2>
            <p className="text-foreground/60 text-sm">
              Decoupled execution pipelines, strict zero-trust parameters.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <Card className="p-6 space-y-4">
              <div className="h-10 w-10 rounded-lg bg-hq-blue/10 border border-hq-blue/20 flex items-center justify-center text-hq-blue">
                <BrainCircuit className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white">25 C-Suite Specialists</h3>
              <p className="text-xs text-foreground/60 leading-relaxed">
                Seeded database of domain specialists mapping CEO alignment protocols down to Legal
                and Compliance checks.
              </p>
            </Card>

            <Card className="p-6 space-y-4">
              <div className="h-10 w-10 rounded-lg bg-hq-purple/10 border border-hq-purple/20 flex items-center justify-center text-hq-purple">
                <Rocket className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Mission Orchestration</h3>
              <p className="text-xs text-foreground/60 leading-relaxed">
                Task-graph generation pipelines managing execution bounds, credit estimations, and
                state-machine handoffs.
              </p>
            </Card>

            <Card className="p-6 space-y-4">
              <div className="h-10 w-10 rounded-lg bg-hq-cyan/10 border border-hq-cyan/20 flex items-center justify-center text-hq-cyan">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Zero-Trust Guards</h3>
              <p className="text-xs text-foreground/60 leading-relaxed">
                RBAC Custom claims security checks, and EBAC throttles guarding execution pipelines
                at compile time.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="px-6 py-20 sm:px-12 border-t border-hq-graphite/40">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold tracking-tight text-white">Flexible Subscriptions</h2>
            <p className="text-foreground/60 text-sm">
              Cancel, update, and monitor credit records instantly.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <Card className="p-6 flex flex-col justify-between h-96 border-hq-graphite/40 bg-hq-graphite/10">
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white">Free Starter</h3>
                <div className="text-3xl font-bold text-white">
                  $0 <span className="text-xs font-normal text-foreground/50">/ month</span>
                </div>
                <p className="text-xs text-foreground/60">
                  Best for small startups testing capabilities.
                </p>
                <ul className="text-xs space-y-2 text-foreground/75 pt-2">
                  <li className="flex items-center gap-1.5">✓ 1 Active Running Mission</li>
                  <li className="flex items-center gap-1.5">✓ 25 AI Executives Seed Roster</li>
                  <li className="flex items-center gap-1.5">✓ Standard API rate limits</li>
                </ul>
              </div>
              <Link href="/dashboard" className="w-full">
                <Button variant="secondary" className="w-full">
                  Deploy Free
                </Button>
              </Link>
            </Card>

            <Card className="p-6 flex flex-col justify-between h-96 border-hq-blue/50 bg-hq-blue/5 shadow-level-5">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold text-white">Growth Team</h3>
                  <Badge variant="premium">Popular</Badge>
                </div>
                <div className="text-3xl font-bold text-white">
                  $99 <span className="text-xs font-normal text-foreground/50">/ month</span>
                </div>
                <p className="text-xs text-foreground/60">
                  For expanding operations and collaborative runs.
                </p>
                <ul className="text-xs space-y-2 text-foreground/75 pt-2">
                  <li className="flex items-center gap-1.5">✓ 10 Active Running Missions</li>
                  <li className="flex items-center gap-1.5">✓ Enhanced memory caching</li>
                  <li className="flex items-center gap-1.5">✓ Decoupled GCS fallback paths</li>
                </ul>
              </div>
              <Link href="/dashboard" className="w-full">
                <Button variant="primary" className="w-full">
                  Subscribe Now
                </Button>
              </Link>
            </Card>

            <Card className="p-6 flex flex-col justify-between h-96 border-hq-purple/50 bg-hq-purple/5">
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white">Enterprise</h3>
                <div className="text-3xl font-bold text-white">
                  $499 <span className="text-xs font-normal text-foreground/50">/ month</span>
                </div>
                <p className="text-xs text-foreground/60">
                  For global organizations demanding zero throttling.
                </p>
                <ul className="text-xs space-y-2 text-foreground/75 pt-2">
                  <li className="flex items-center gap-1.5">✓ Unlimited Active Missions</li>
                  <li className="flex items-center gap-1.5">✓ Legal Hold overrides active</li>
                  <li className="flex items-center gap-1.5">✓ Priority direct AI execution</li>
                </ul>
              </div>
              <Link href="/dashboard" className="w-full">
                <Button variant="accent" className="w-full">
                  Contact Sales
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="h-16 flex items-center justify-between border-t border-hq-graphite/40 px-6 sm:px-12 bg-hq-graphite/20 text-xs text-foreground/50">
        <span>© 2026 HQ Inc. All rights reserved.</span>
        <div className="flex items-center space-x-4">
          <span>Terms</span>
          <span>Privacy</span>
          <span>Security</span>
        </div>
      </footer>
    </div>
  );
}
