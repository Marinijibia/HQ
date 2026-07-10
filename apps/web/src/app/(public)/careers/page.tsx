'use client';

import * as React from 'react';
import { Card, Badge, Button } from '@hq/ui';
import { MapPin, Clock } from 'lucide-react';

export default function CareersPage() {
  const jobs = [
    {
      title: 'Senior Frontend Architect',
      type: 'Full-Time',
      location: 'London, UK / Remote',
      dept: 'Engineering',
    },
    {
      title: 'AI Research Scientist',
      type: 'Full-Time',
      location: 'London, UK',
      dept: 'AI Core',
    },
  ];

  return (
    <div className="py-12 max-w-4xl mx-auto px-6 space-y-16">
      {/* Header */}
      <div className="text-center space-y-3">
        <Badge
          variant="premium"
          className="px-3 py-1 rounded-full text-[10px] tracking-widest font-bold"
        >
          WE ARE HIRING
        </Badge>
        <h1 className="text-4xl font-extrabold tracking-tight text-[#1A1A1E] dark:text-white sm:text-5xl">
          Build the Future of Autonomy
        </h1>
        <p className="text-foreground/50 text-sm leading-relaxed max-w-xl mx-auto">
          Join our mission to democratize C-suite expertise. We value deep engineering capabilities,
          absolute transparency, and design excellence.
        </p>
      </div>

      {/* Roster of openings */}
      <div className="space-y-4">
        {jobs.map((j, idx) => (
          <Card
            key={idx}
            className="p-6 border border-card-border bg-card-bg shadow-[var(--card-shadow)] card-transition flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-left"
          >
            <div className="space-y-1.5">
              <span className="text-[9px] text-hq-purple font-bold uppercase tracking-wider">
                {j.dept}
              </span>
              <h3 className="text-base font-bold text-[#1A1A1E] dark:text-white">{j.title}</h3>
              <div className="flex items-center space-x-4 text-xs text-foreground/45">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {j.location}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {j.type}
                </span>
              </div>
            </div>
            <Button
              variant="secondary"
              className="text-xs h-9 border-card-border hover:bg-black/5 dark:hover:bg-[#1E1E24]/20 shrink-0"
            >
              Apply Now
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
