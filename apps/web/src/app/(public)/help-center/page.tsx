'use client';

import * as React from 'react';
import { Card, Badge } from '@hq/ui';
import { HelpCircle } from 'lucide-react';

export default function HelpCenterPage() {
  const faqs = [
    {
      q: 'How do I add a new C-suite director?',
      a: 'Go to Settings -> Directory and click Invite Member. You can choose their corporate title, and the system automatically matches their seeded prompt configurations.',
    },
    {
      q: 'Is my data safe during prompt generation?',
      a: 'Absolutely. HQ sanitizes inputs, enforces role-based constraints, and does not store company documents outside your personal pgvector workspace schema.',
    },
    {
      q: 'Can I cancel my Growth subscription plan?',
      a: 'Yes, navigate to Billing page and click Manage Subscription to cancel or downgrade anytime.',
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
          HELP CENTER & FAQ
        </Badge>
        <h1 className="text-4xl font-extrabold tracking-tight text-[#1A1A1E] dark:text-white sm:text-5xl">
          Frequently Asked Questions
        </h1>
        <p className="text-foreground/50 text-sm leading-relaxed max-w-xl mx-auto">
          Need assistance setting up your workspace? Check these helpful articles first.
        </p>
      </div>

      {/* FAQ items list */}
      <div className="space-y-4">
        {faqs.map((f, idx) => (
          <Card
            key={idx}
            className="p-6 border border-card-border bg-card-bg shadow-[var(--card-shadow)] card-transition text-left space-y-2"
          >
            <h3 className="text-sm font-bold text-[#1A1A1E] dark:text-white flex items-center gap-2">
              <HelpCircle className="h-4.5 w-4.5 text-hq-cyan shrink-0" />
              {f.q}
            </h3>
            <p className="text-xs text-foreground/50 leading-relaxed pl-6.5">{f.a}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
