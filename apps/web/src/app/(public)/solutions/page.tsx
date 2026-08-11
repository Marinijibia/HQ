'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card, Badge, Button } from '@hq/ui';
import { TrendingUp, Cpu, Globe, Building2, ArrowRight } from 'lucide-react';

export default function SolutionsPage() {
  const solutions = [
    {
      title: 'Technology & SaaS',
      desc: 'Coordinate automated engineering releases, run code security checks, and execute growth marketing campaigns with CEO Asad & Teema (Operations Director).',
      icon: Cpu,
      color: 'bg-hq-blue/10 text-hq-blue border-hq-blue/20',
      tag: 'High Velocity',
    },
    {
      title: 'Finance & Venture Strategy',
      desc: 'Evaluate investment cap tables, simulate runway projections, track CAC:LTV economics, and model dilution for fundraising rounds with our CFO Engine.',
      icon: TrendingUp,
      color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      tag: 'CFO Suite',
    },
    {
      title: 'Enterprise & Multi-National',
      desc: 'Verify regulatory compliance, audit international contract webhooks, and log SHA-256 cryptographic audit trails with Legal Compliance & HR Directors.',
      icon: Building2,
      color: 'bg-hq-purple/10 text-hq-purple border-hq-purple/20',
      tag: 'Zero-Trust Security',
    },
    {
      title: 'Consulting & Agency Operations',
      desc: 'Synthesize live market web signals with Mr. Intelligence, generate executive client proposals, and orchestrate deliverables seamlessly.',
      icon: Globe,
      color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
      tag: 'Market Research',
    },
  ];

  return (
    <div className="py-12 max-w-6xl mx-auto px-6 space-y-16 text-left">
      {/* Header */}
      <div className="text-center space-y-4">
        <Badge variant="premium" className="px-4 py-1.5 rounded-full text-xs tracking-widest font-bold">
          TAILORED INDUSTRY SOLUTIONS
        </Badge>
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
          Designed for Your Domain
        </h1>
        <p className="text-slate-600 dark:text-foreground/60 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed font-medium">
          HQ seeds distinct executive profiles and workflows to address specific sector complexities, financial structures, and compliance rules.
        </p>
      </div>

      {/* Solutions list */}
      <div className="grid gap-8 md:grid-cols-2">
        {solutions.map((s, idx) => (
          <Card key={idx} className="p-8 space-y-4 border border-slate-200 dark:border-card-border bg-white dark:bg-card-bg shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className={`h-12 w-12 rounded-2xl flex items-center justify-center border ${s.color}`}>
                  <s.icon className="h-6 w-6" />
                </div>
                <Badge variant="outline" className="text-[10px] uppercase font-bold">{s.tag}</Badge>
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">{s.title}</h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-foreground/60 leading-relaxed font-medium">{s.desc}</p>
            </div>
            <div className="pt-4 border-t border-slate-100 dark:border-card-border/50 flex justify-end">
              <Link href="/onboarding">
                <Button size="sm" className="bg-cyan-500 hover:bg-cyan-400 text-white font-bold text-xs h-9 px-4 rounded-xl flex items-center gap-1.5">
                  Launch Solution <ArrowRight size={14} />
                </Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
