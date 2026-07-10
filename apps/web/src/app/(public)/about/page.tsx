'use client';

import * as React from 'react';
import { Card, Badge } from '@hq/ui';
// No icons needed here

export default function AboutPage() {
  return (
    <div className="py-12 max-w-4xl mx-auto px-6 space-y-16">
      {/* Header */}
      <div className="text-center space-y-3">
        <Badge
          variant="premium"
          className="px-3 py-1 rounded-full text-[10px] tracking-widest font-bold"
        >
          OUR MISSION & COMPANY
        </Badge>
        <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
          The Future of Decisions
        </h1>
        <p className="text-foreground/50 text-sm leading-relaxed max-w-xl mx-auto">
          HQ was founded on the belief that traditional operations software adds visual noise rather
          than actually coordinating and solving business issues.
        </p>
      </div>

      {/* Vision Statement highlighted */}
      <div className="border border-[#1E1E24]/60 bg-[#0A0A0C]/50 rounded-2xl p-8 text-center space-y-4">
        <span className="text-[10px] text-hq-cyan font-bold tracking-widest uppercase">
          Core Mission Statement
        </span>
        <p className="text-base text-white font-medium max-w-xl mx-auto leading-relaxed italic">
          &ldquo;HQ exists to help every business, regardless of size, make better decisions through
          an AI executive team that learns, collaborates, and grows with the organization.&rdquo;
        </p>
      </div>

      {/* Rationale Cards */}
      <div className="grid gap-6 md:grid-cols-2 text-left">
        <Card className="p-6 space-y-3 border border-[#1E1E24]/60 bg-black/40 backdrop-blur-md">
          <h3 className="text-base font-bold text-white">Why We Built HQ</h3>
          <p className="text-xs text-foreground/50 leading-relaxed">
            Every business needs domain specialists, but hiring an entire C-suite is
            cost-prohibitive. HQ bridges this gap by democratizing expert strategic advice.
          </p>
        </Card>

        <Card className="p-6 space-y-3 border border-[#1E1E24]/60 bg-black/40 backdrop-blur-md">
          <h3 className="text-base font-bold text-white">Our Product Principles</h3>
          <p className="text-xs text-foreground/50 leading-relaxed">
            We put simplicity before complexity, focus on premium experiences over feature overload,
            and enforce data safety parameters.
          </p>
        </Card>
      </div>
    </div>
  );
}
