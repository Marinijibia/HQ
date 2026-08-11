'use client';

import * as React from 'react';
import { Card, Badge } from '@hq/ui';
import { Calendar, Sparkles } from 'lucide-react';

export default function ChangelogPage() {
  const updates = [
    {
      version: 'v1.2.0',
      date: 'August 06, 2026',
      title: '11-Step Onboarding, CFO Suite Engine & Corporate Netify Lead API',
      badge: 'Major Release',
      color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
      changes: [
        'Added Step 8 Mr. Intelligence Pre-Onboarding Web Discovery for live web, news, and social media signal indexing.',
        'Launched CFO & Capital Strategy Engine (runway forecasting, LTV:CAC, cap table simulation, and emergency alerts).',
        'Exposed Public Lead API endpoints for contact, VIP demo bookings, job applications, and SOC2 compliance requests.',
        'Configured corporate email notifications to @netify.ng domain.',
      ],
    },
    {
      version: 'v1.1.0',
      date: 'July 10, 2026',
      title: 'Dynamic Route Groups & Light/Dark Theme Context',
      badge: 'Feature Release',
      color: 'bg-hq-blue/10 text-hq-blue border-hq-blue/20',
      changes: [
        'Introduced ThemeProvider supporting dynamic scrolled navbar backgrounds switching.',
        'Scaffolded dedicated public routes under a clean App Router layout structure.',
        'Linked demo booking calendars and Slack webhook channels to public directory views.',
      ],
    },
    {
      version: 'v1.0.4',
      date: 'July 09, 2026',
      title: 'Stripe Webhooks Signature Controls & Cache Invalidation',
      badge: 'Security Update',
      color: 'bg-hq-purple/10 text-hq-purple border-hq-purple/20',
      changes: [
        'Integrated payload signature validation for Stripe checkout portal redirects.',
        'Created Cache Invalidation interceptor wiping GET routes on database mutations.',
        'Fixed pre-commit hook type warnings blocking typescript compilation.',
      ],
    },
  ];

  return (
    <div className="py-12 max-w-4xl mx-auto px-6 space-y-16 text-left">
      {/* Header */}
      <div className="text-center space-y-4">
        <Badge variant="ai" className="px-4 py-1.5 rounded-full text-xs tracking-widest font-bold">
          <Sparkles className="h-3.5 w-3.5 mr-1.5 inline animate-pulse text-cyan-400" />
          HQ OS CHANGELOG & RELEASE HISTORY
        </Badge>
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
          Product Releases
        </h1>
        <p className="text-slate-600 dark:text-foreground/60 text-base sm:text-lg max-w-xl mx-auto leading-relaxed font-medium">
          Follow our active engineering history as we build and release updates to the C-Suite AI Operating System.
        </p>
      </div>

      {/* Timeline List */}
      <div className="space-y-10 relative before:absolute before:inset-0 before:left-6 sm:before:left-1/2 before:w-px before:bg-slate-200 dark:before:bg-white/10 before:pointer-events-none">
        {updates.map((u, idx) => (
          <div
            key={idx}
            className="relative flex flex-col sm:flex-row items-start sm:justify-between gap-6"
          >
            {/* Timeline Marker Dot */}
            <div className="absolute left-6 sm:left-1/2 -translate-x-1/2 top-1.5 h-4.5 w-4.5 rounded-full bg-cyan-500 border-4 border-slate-50 dark:border-[#060608] shadow-[0_0_15px_rgba(6,182,212,0.4)] z-10 shrink-0" />

            {/* Left Column: Version details */}
            <div className="pl-14 sm:pl-0 sm:w-[45%] text-left sm:text-right space-y-1.5">
              <div className="flex sm:flex-row-reverse items-center gap-2">
                <span className="text-base font-black text-slate-900 dark:text-white">
                  {u.version}
                </span>
                <span className={`text-[9px] font-bold px-2.5 py-0.5 rounded-full border uppercase ${u.color}`}>
                  {u.badge}
                </span>
              </div>
              <div className="flex sm:flex-row-reverse items-center gap-1.5 text-xs text-slate-500 dark:text-foreground/45 font-semibold">
                <Calendar className="h-3.5 w-3.5 text-cyan-500" />
                <span>{u.date}</span>
              </div>
            </div>

            {/* Right Column: Changes Card */}
            <div className="pl-14 sm:pl-0 sm:w-[45%]">
              <Card className="p-6 border border-slate-200 dark:border-card-border bg-white dark:bg-card-bg shadow-sm hover:shadow-md transition-all space-y-4">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white leading-snug">
                  {u.title}
                </h3>
                <ul className="space-y-2 text-xs text-slate-600 dark:text-foreground/60 list-disc list-inside leading-relaxed font-medium">
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
