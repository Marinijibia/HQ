'use client';

import * as React from 'react';
import { Card, Badge, Button } from '@hq/ui';
import { TrendingUp, BarChart } from 'lucide-react';

export default function CaseStudiesPage() {
  const studies = [
    {
      company: 'AeroFreight Logistics',
      metric: '18% Fuel Savings',
      desc: 'How AeroFreight leveraged Teema (Ops Director) and Legal Compliance to optimize regional dispatch pipeline configurations.',
      result: 'Audited 42 region depots under safety checks constraints in 40 seconds.',
    },
    {
      company: 'Zenith SaaS Studio',
      metric: '$40k Monthly Budget Saved',
      desc: 'How Zenith configured CEO Asad and our CFO Engine to review and validate weekly campaign spending rate thresholds.',
      result: 'Automated Slack compliance alerts flag budget entitlement leaks instantly.',
    },
  ];

  return (
    <div className="py-12 max-w-6xl mx-auto px-6 space-y-16">
      {/* Header */}
      <div className="text-center space-y-3">
        <Badge
          variant="premium"
          className="px-3.5 py-1.5 rounded-full text-xs tracking-widest font-bold"
        >
          CORPORATE IMPLEMENTATIONS
        </Badge>
        <h1 className="text-4xl font-extrabold tracking-tight text-[#1A1A1E] dark:text-white sm:text-5xl">
          Success Stories & Case Studies
        </h1>
        <p className="text-foreground/50 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
          See how leading organizations leverage seed C-suite AI directors to optimize their
          metrics, scale compliance holds, and make better decisions.
        </p>
      </div>

      {/* Grid */}
      <div className="grid gap-8 md:grid-cols-2 text-left">
        {studies.map((s, idx) => (
          <Card
            key={idx}
            className="p-7 space-y-6 border border-card-border bg-card-bg shadow-[var(--card-shadow)] card-transition relative flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <span className="text-[10px] text-hq-cyan font-bold tracking-wider uppercase">
                  {s.company}
                </span>
                <span className="text-xs font-bold text-green-500 bg-green-500/10 border border-green-500/20 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <TrendingUp className="h-3.5 w-3.5" />
                  {s.metric}
                </span>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-[#1A1A1E] dark:text-white leading-snug">
                  {s.desc}
                </h3>
                <p className="text-sm text-foreground/50 leading-relaxed font-normal">{s.result}</p>
              </div>
            </div>
            <div className="pt-4 border-t border-card-border flex items-center justify-between">
              <span className="text-xs text-foreground/45 flex items-center gap-1.5">
                <BarChart className="h-4 w-4" />
                Verified Data Ledger
              </span>
              <Button
                variant="ghost"
                className="text-xs font-semibold px-4 h-8 border border-card-border hover:bg-black/5 dark:hover:bg-[#1E1E24]/20 transition-all"
              >
                Read PDF Summary
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
