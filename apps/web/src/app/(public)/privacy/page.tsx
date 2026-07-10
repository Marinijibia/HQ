'use client';

import * as React from 'react';
import { Card, Badge } from '@hq/ui';

export default function PrivacyPage() {
  return (
    <div className="py-12 max-w-3xl mx-auto px-6 space-y-8 text-left select-none animate-in fade-in duration-300">
      <div className="text-center space-y-2">
        <Badge variant="ai" className="px-3 py-0.5 rounded-full text-[9px] font-bold">
          LEGAL & COMPLIANCE
        </Badge>
        <h1 className="text-3xl font-extrabold tracking-tight text-[#1A1A1E] dark:text-white">
          Privacy Policy
        </h1>
        <p className="text-xs text-foreground/45">Last Updated: July 2026</p>
      </div>

      <Card className="p-6 border border-black/10 dark:border-[#1E1E24]/60 bg-white dark:bg-black/40 backdrop-blur-md text-xs text-foreground/50 leading-relaxed space-y-4 font-normal">
        <h2 className="text-sm font-bold text-[#1A1A1E] dark:text-white">1. Data We Collect</h2>
        <p>
          We collect organizational details, registration information, and details required to
          formulate prompts and execute campaign tasks.
        </p>

        <h2 className="text-sm font-bold text-[#1A1A1E] dark:text-white">2. AI Data Processing</h2>
        <p>
          Your vectors, custom directives, and C-Suite interactions are processed securely and are
          never used to train third-party foundation models.
        </p>

        <h2 className="text-sm font-bold text-[#1A1A1E] dark:text-white">
          3. Third-Party Integrations
        </h2>
        <p>
          When you connect GitHub, Slack, or Stripe, we verify webhooks signatures and store
          credentials using secure App Data Directory encryption paths.
        </p>
      </Card>
    </div>
  );
}
