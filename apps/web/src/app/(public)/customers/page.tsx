'use client';

import * as React from 'react';
import { Card, Badge } from '@hq/ui';
import { Quote } from 'lucide-react';

export default function CustomersPage() {
  const testimonials = [
    {
      company: 'Logix Energy UK',
      industry: 'Logistics & Supply Chain',
      quote:
        'HQ restructured our regional distribution planning pipelines in under 3 hours, achieving a 14% improvement in dispatch accuracy.',
      author: 'David Vance, Chief Logistics Officer',
    },
    {
      company: 'Veloce Software',
      industry: 'SaaS & Development',
      quote:
        'Having Linus Kovacs as our virtual Engineering Director allowed our startup to continuously verify packages checks, avoiding critical build failures.',
      author: 'Sarah Jenkins, Founder & CTO',
    },
  ];

  return (
    <div className="py-12 max-w-6xl mx-auto px-6 space-y-16">
      {/* Header */}
      <div className="text-center space-y-3">
        <Badge
          variant="premium"
          className="px-3 py-1 rounded-full text-[10px] tracking-widest font-bold"
        >
          CUSTOMER SUCCESS STORIES
        </Badge>
        <h1 className="text-4xl font-extrabold tracking-tight text-[#1A1A1E] dark:text-white sm:text-5xl">
          Scale Confidently with HQ
        </h1>
        <p className="text-foreground/50 text-sm max-w-xl mx-auto leading-relaxed">
          From fast-growing SaaS startups to complex logistics enterprises, HQ helps organizations
          make better decisions autonomously.
        </p>
      </div>

      {/* Grid */}
      <div className="grid gap-8 md:grid-cols-2">
        {testimonials.map((t, idx) => (
          <Card
            key={idx}
            className="p-7 space-y-6 border border-card-border bg-card-bg shadow-[var(--card-shadow)] card-transition relative text-left"
          >
            <Quote className="absolute top-6 right-6 h-8 w-8 text-hq-blue/10" />
            <div className="space-y-1.5">
              <span className="text-[10px] text-hq-cyan font-bold tracking-wider uppercase">
                {t.company} — {t.industry}
              </span>
              <p className="text-sm text-[#1A1A1E] dark:text-white leading-relaxed font-normal">
                &ldquo;{t.quote}&rdquo;
              </p>
            </div>
            <div className="pt-2 border-t border-card-border">
              <p className="text-xs font-semibold text-[#1A1A1E] dark:text-white">{t.author}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
