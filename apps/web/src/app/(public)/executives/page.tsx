'use client';

import * as React from 'react';
import { Card, Badge } from '@hq/ui';

export default function ExecutivesPage() {
  const directors = [
    {
      name: 'Elena Rostova',
      role: 'CEO & Owner Alignment',
      dept: 'Management',
      text: 'Coordinates board directives, validates target objectives, and reviews credit allocation caps.',
      color: 'text-hq-blue bg-hq-blue/10 border-hq-blue/20',
    },
    {
      name: 'Arthur Steward',
      role: 'Chief of Staff (COS)',
      dept: 'Operations',
      text: 'Decomposes complex campaigns into task dependency graphs, delegating assignments dynamically.',
      color: 'text-hq-purple bg-hq-purple/10 border-hq-purple/20',
    },
    {
      name: 'Linus Kovacs',
      role: 'Software Eng. Director',
      dept: 'Engineering',
      text: 'Monitors repository checkouts, evaluates code drafts, and checks package configurations.',
      color: 'text-hq-cyan bg-hq-cyan/10 border-hq-cyan/20',
    },
    {
      name: 'Alistair Thorne',
      role: 'Conversion Director',
      dept: 'Marketing',
      text: 'Formulates landing page copy blueprints, recommends SEO optimizations, and evaluates readability.',
      color: 'text-sky-400 bg-sky-400/10 border-sky-400/20',
    },
    {
      name: 'Rashid Al-Mansoori',
      role: 'Petroleum & Logistics',
      dept: 'Supply Chain',
      text: 'Verifies logistics compliance, audits safety guidelines, and tracks energy regulations.',
      color: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    },
  ];

  return (
    <div className="py-12 max-w-6xl mx-auto px-6 space-y-16">
      {/* Header */}
      <div className="text-center space-y-3">
        <Badge
          variant="ai"
          className="px-3 py-1 rounded-full text-[10px] tracking-widest font-bold"
        >
          AI C-SUITE DIRECTORS DIRECTORY
        </Badge>
        <h1 className="text-4xl font-extrabold tracking-tight text-[#1A1A1E] dark:text-white sm:text-5xl">
          Meet Your Executive Team
        </h1>
        <p className="text-foreground/50 text-sm max-w-xl mx-auto leading-relaxed">
          HQ deploys a team of pre-seeded domain experts that collaborate dynamically via message
          loops to plan, solve, and execute.
        </p>
      </div>

      {/* Directory Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {directors.map((d) => (
          <Card
            key={d.name}
            className="p-6 space-y-4 border border-card-border bg-card-bg shadow-[var(--card-shadow)] card-transition hover:border-black/20 dark:hover:border-white/20 transition-colors text-left animate-in fade-in duration-350"
          >
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-[#1A1A1E] dark:text-white">{d.name}</h3>
                <p className="text-xs text-foreground/75 font-semibold">{d.role}</p>
              </div>
              <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full border ${d.color}`}>
                {d.dept}
              </span>
            </div>
            <p className="text-xs text-foreground/50 leading-relaxed italic">
              &ldquo;{d.text}&rdquo;
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
}
