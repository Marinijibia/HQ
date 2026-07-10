'use client';

import * as React from 'react';
import { Card, Badge } from '@hq/ui';
import { TrendingUp, Cpu, Globe, HardHat } from 'lucide-react';

export default function SolutionsPage() {
  return (
    <div className="py-12 max-w-6xl mx-auto px-6 space-y-16">
      {/* Header */}
      <div className="text-center space-y-3">
        <Badge
          variant="premium"
          className="px-3 py-1 rounded-full text-[10px] tracking-widest font-bold"
        >
          TAILORED INDUSTRY BLUEPRINTS
        </Badge>
        <h1 className="text-4xl font-extrabold tracking-tight text-[#1A1A1E] dark:text-white sm:text-5xl">
          Designed for Your Domain
        </h1>
        <p className="text-foreground/50 text-sm max-w-xl mx-auto leading-relaxed">
          HQ seeds distinct executive profiles and workflows to address specific sector complexities
          and compliance guidelines.
        </p>
      </div>

      {/* Solutions list */}
      <div className="grid gap-8 md:grid-cols-2">
        <Card className="p-7 space-y-4 border border-black/10 dark:border-[#1E1E24]/60 bg-white dark:bg-black/40 backdrop-blur-md text-left">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-lg bg-hq-blue/10 flex items-center justify-center text-hq-blue border border-hq-blue/20">
              <Cpu className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-[#1A1A1E] dark:text-white">Technology & SaaS</h3>
          </div>
          <p className="text-xs text-foreground/50 leading-relaxed">
            Configure automated git releases, run package checks via Linus Kovacs (Eng. Director),
            and coordinate marketing outreach strategies under Alistair Thorne.
          </p>
        </Card>

        <Card className="p-7 space-y-4 border border-black/10 dark:border-[#1E1E24]/60 bg-white dark:bg-black/40 backdrop-blur-md text-left">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-lg bg-hq-purple/10 flex items-center justify-center text-hq-purple border border-hq-purple/20">
              <HardHat className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-[#1A1A1E] dark:text-white">Energy & Petroleum</h3>
          </div>
          <p className="text-xs text-foreground/50 leading-relaxed">
            Verify international logistics pipelines, audit safety reports, and review compliance
            parameters guided by Rashid Al-Mansoori (Petroleum Director).
          </p>
        </Card>

        <Card className="p-7 space-y-4 border border-black/10 dark:border-[#1E1E24]/60 bg-white dark:bg-black/40 backdrop-blur-md text-left">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-lg bg-hq-cyan/10 flex items-center justify-center text-hq-cyan border border-hq-cyan/20">
              <TrendingUp className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-[#1A1A1E] dark:text-white">Venture & Finance</h3>
          </div>
          <p className="text-xs text-foreground/50 leading-relaxed">
            Evaluate investment pipelines, check asset valuations, track weekly budget expenditures,
            and plan scaling rounds.
          </p>
        </Card>

        <Card className="p-7 space-y-4 border border-black/10 dark:border-[#1E1E24]/60 bg-white dark:bg-black/40 backdrop-blur-md text-left">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-lg bg-[#E0F2FE]/10 flex items-center justify-center text-sky-400 border border-sky-400/20">
              <Globe className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-[#1A1A1E] dark:text-white">
              Consulting & Agency
            </h3>
          </div>
          <p className="text-xs text-foreground/50 leading-relaxed">
            Generate proposal pitches, audit client deliverables, summarize strategic research data,
            and manage client communications efficiently.
          </p>
        </Card>
      </div>
    </div>
  );
}
