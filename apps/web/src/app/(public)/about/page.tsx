'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card, Badge, Button } from '@hq/ui';
import { ShieldCheck, Sparkles, ArrowRight, Mail, Award, Globe, Users } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="py-12 max-w-5xl mx-auto px-6 space-y-16 text-left">
      {/* Header */}
      <div className="text-center space-y-4">
        <Badge
          variant="premium"
          className="px-4 py-1.5 rounded-full text-xs tracking-widest font-bold"
        >
          OUR MISSION & VISION
        </Badge>
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
          The Autonomous Executive OS
        </h1>
        <p className="text-slate-600 dark:text-foreground/60 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed font-medium">
          Netify HQ exists to empower every organization with a world-class AI executive board — coordinating strategy, financial forecasting, legal compliance, and daily operations.
        </p>
      </div>

      {/* Vision Statement card */}
      <div className="border border-cyan-500/30 bg-gradient-to-r from-cyan-950/20 via-blue-950/20 to-purple-950/20 shadow-2xl rounded-3xl p-8 sm:p-12 text-center space-y-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-32 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <span className="text-xs text-cyan-400 font-extrabold tracking-widest uppercase flex items-center justify-center gap-1.5">
          <Sparkles className="h-4 w-4 animate-spin text-cyan-400" />
          Core Executive Mission
        </span>
        <p className="text-xl sm:text-2xl text-slate-900 dark:text-white font-extrabold max-w-3xl mx-auto leading-relaxed italic">
          &ldquo;We build intelligent executive software that turns corporate strategy into autonomous, zero-trust operational execution.&rdquo;
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest pt-2">
          Netify Technologies • Enterprise Governance
        </p>
      </div>

      {/* Key Company Impact Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
        {[
          { label: 'AI Executives', value: '25 Active Directors', icon: Users, color: 'text-cyan-400' },
          { label: 'Global Security', value: 'SOC2 & ISO 27001', icon: ShieldCheck, color: 'text-purple-400' },
          { label: 'Response Time', value: '< 2.5 seconds', icon: Globe, color: 'text-emerald-400' },
          { label: 'Uptime Guarantee', value: '99.99% SLA', icon: Award, color: 'text-amber-400' },
        ].map((m, idx) => (
          <Card key={idx} className="p-6 border border-slate-200 dark:border-white/10 bg-white/60 dark:bg-card-bg/60 backdrop-blur-md space-y-2">
            <m.icon className={`h-6 w-6 mx-auto ${m.color}`} />
            <div className="text-lg font-black text-slate-900 dark:text-white">{m.value}</div>
            <div className="text-[11px] text-slate-500 dark:text-foreground/45 font-bold uppercase tracking-wider">{m.label}</div>
          </Card>
        ))}
      </div>

      {/* Product Pillars */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-8 space-y-4 border border-slate-200 dark:border-card-border bg-white dark:bg-card-bg shadow-sm">
          <div className="h-10 w-10 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold">
            01
          </div>
          <h3 className="text-lg font-black text-slate-900 dark:text-white">Why We Built HQ</h3>
          <p className="text-sm text-slate-600 dark:text-foreground/60 leading-relaxed font-medium">
            Hiring full C-suite executive teams is cost-prohibitive for growing companies. Netify HQ democratizes expert strategic advice by giving every workspace an instant AI CEO, CFO, Legal Director, Operations Director, and Intelligence Researcher.
          </p>
        </Card>

        <Card className="p-8 space-y-4 border border-slate-200 dark:border-card-border bg-white dark:bg-card-bg shadow-sm">
          <div className="h-10 w-10 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold">
            02
          </div>
          <h3 className="text-lg font-black text-slate-900 dark:text-white">Zero-Trust Security & Privacy</h3>
          <p className="text-sm text-slate-600 dark:text-foreground/60 leading-relaxed font-medium">
            We put data protection and cryptographic integrity first. All uploaded assets are validated with SHA-256 checksums, and corporate memory vectors are never shared with public model training loops.
          </p>
        </Card>
      </div>

      {/* CTA Box */}
      <div className="p-8 rounded-3xl bg-slate-900 dark:bg-[#0A0A0E] border border-slate-800 dark:border-white/10 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1">
          <h3 className="text-lg font-bold">Ready to deploy your AI C-Suite?</h3>
          <p className="text-xs text-slate-400 font-medium">Have questions? Reach out to support@netify.ng or sales@netify.ng</p>
        </div>
        <div className="flex gap-3">
          <Link href="/onboarding">
            <Button className="bg-cyan-500 hover:bg-cyan-400 text-white font-bold text-xs h-10 px-5 rounded-xl shadow-lg flex items-center gap-2">
              Start Free Trial <ArrowRight size={14} />
            </Button>
          </Link>
          <Link href="/contact">
            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 font-bold text-xs h-10 px-5 rounded-xl">
              <Mail size={14} className="mr-1.5" /> Contact Us
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
