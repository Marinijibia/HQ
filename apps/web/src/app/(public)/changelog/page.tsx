'use client';

import * as React from 'react';
import { Card, Badge } from '@hq/ui';
import { Calendar } from 'lucide-react';

export default function ChangelogPage() {
  const updates = [
    {
      version: 'v1.1.0',
      date: 'July 10, 2026',
      title: 'Dynamic Route Groups & Light/Dark Theme Context',
      badge: 'Major Release',
      color: 'bg-hq-blue/10 text-hq-blue border-hq-blue/20',
      changes: [
        'Introduced ThemeProvider supporting dynamic scrolled navbar backgrounds switching.',
        'Scaffolded 15 dedicated public routes under a Dry app router layout structure.',
        'Linked Cal.com calendars and Slack webhook channels to public directory views.',
      ],
    },
    {
      version: 'v1.0.4',
      date: 'July 09, 2026',
      title: 'Stripe Webhooks Signature Controls & Cache Invalidation',
      badge: 'Feature Update',
      color: 'bg-hq-purple/10 text-hq-purple border-hq-purple/20',
      changes: [
        'Integrated payload signature validation for Stripe checkout portal redirects.',
        'Created Cache Invalidation interceptor wiping GET routes on database mutations.',
        'Fixed pre-commit hook type warnings blocking typescript explicit any casts.',
      ],
    },
  ];

  return (
    <div className="py-12 max-w-4xl mx-auto px-6 space-y-16">
      {/* Header */}
      <div className="text-center space-y-3">
        <Badge
          variant="ai"
          className="px-3 py-1 rounded-full text-[10px] tracking-widest font-bold"
        >
          HQ OS CHANGELOG & UPDATES
        </Badge>
        <h1 className="text-4xl font-extrabold tracking-tight text-[#1A1A1E] dark:text-white sm:text-5xl">
          Product Releases
        </h1>
        <p className="text-foreground/50 text-sm max-w-xl mx-auto leading-relaxed">
          Follow our active product engineering history as we build and release updates to the
          C-Suite AI Operating System.
        </p>
      </div>

      {/* Timeline List */}
      <div className="space-y-10 relative before:absolute before:inset-0 before:left-6 sm:before:left-1/2 before:w-px before:bg-black/5 dark:before:bg-[#1E1E24]/60 before:pointer-events-none text-left">
        {updates.map((u, idx) => (
          <div
            key={idx}
            className="relative flex flex-col sm:flex-row items-start sm:justify-between gap-6"
          >
            {/* Timeline Marker Dot */}
            <div className="absolute left-6 sm:left-1/2 -translate-x-1/2 top-1.5 h-4.5 w-4.5 rounded-full bg-hq-blue border-4 border-[#030303] shadow-[0_0_15px_rgba(14,165,233,0.3)] z-10 shrink-0" />

            {/* Left Column: Version details */}
            <div className="pl-14 sm:pl-0 sm:w-[45%] text-left sm:text-right space-y-1.5">
              <div className="flex sm:flex-row-reverse items-center gap-2">
                <span className="text-base font-extrabold text-[#1A1A1E] dark:text-white">
                  {u.version}
                </span>
                <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full border ${u.color}`}>
                  {u.badge}
                </span>
              </div>
              <div className="flex sm:flex-row-reverse items-center gap-1.5 text-xs text-foreground/45">
                <Calendar className="h-3.5 w-3.5" />
                <span>{u.date}</span>
              </div>
            </div>

            {/* Right Column: Changes Card */}
            <div className="pl-14 sm:pl-0 sm:w-[45%]">
              <Card className="p-6 border border-black/5 dark:border-[#1E1E24]/60 bg-white/50 dark:bg-black/40 backdrop-blur-md space-y-4">
                <h3 className="text-sm font-bold text-[#1A1A1E] dark:text-white leading-snug">
                  {u.title}
                </h3>
                <ul className="space-y-2 text-xs text-foreground/50 list-disc list-inside leading-relaxed pl-1">
                  {u.changes.map((change, cIdx) => (
                    <li key={cIdx}>{change}</li>
                  ))}
                </ul>
              </Card>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
