'use client';

import * as React from 'react';
import { Card, Badge } from '@hq/ui';

export default function TermsPage() {
  return (
    <div className="py-12 max-w-3xl mx-auto px-6 space-y-8 text-left select-none animate-in fade-in duration-300">
      <div className="text-center space-y-2">
        <Badge variant="ai" className="px-3 py-0.5 rounded-full text-[9px] font-bold">
          LEGAL & COMPLIANCE
        </Badge>
        <h1 className="text-3xl font-extrabold tracking-tight text-[#1A1A1E] dark:text-white">
          Terms of Service
        </h1>
        <p className="text-xs text-foreground/45">Last Updated: July 2026</p>
      </div>

      <Card className="p-6 border border-card-border bg-card-bg shadow-[var(--card-shadow)] card-transition text-xs text-foreground/50 leading-relaxed space-y-4 font-normal">
        <h2 className="text-sm font-bold text-[#1A1A1E] dark:text-white">1. Service Definition</h2>
        <p>
          HQ provides an intelligent executive Operating System to plan, orchestrate, and audit
          operations autonomously.
        </p>

        <h2 className="text-sm font-bold text-[#1A1A1E] dark:text-white">
          2. Rate Limits & Subscriptions
        </h2>
        <p>
          Service availability is subject to rate-limiting and monthly budget caps based on your
          Free, Growth, or Enterprise active package details.
        </p>

        <h2 className="text-sm font-bold text-[#1A1A1E] dark:text-white">3. Data Ownership</h2>
        <p>
          You retain copyright and ownership of all deliverables, files, and templates generated
          inside your boardroom workspace.
        </p>
      </Card>
    </div>
  );
}
