'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card, Badge, Button, Input } from '@hq/ui';
import { HelpCircle, Search, Mail, MessageSquare, ArrowRight } from 'lucide-react';

export default function HelpCenterPage() {
  const [search, setSearch] = React.useState('');

  const faqs = [
    {
      q: 'How does Mr. Intelligence Pre-Onboarding Discovery work?',
      a: 'During Step 8 of onboarding, Mr. Intelligence queries public web, news, and social media signals for your organization name to index high-level market positioning into your workspace vector store.',
    },
    {
      q: 'How do I install new executive suites from the Marketplace?',
      a: 'Navigate to Marketplace in your dashboard sidebar and click Install on any suite (such as the $0 FREE Finance & Capital Strategy Suite). It automatically provisions tools for your C-Suite.',
    },
    {
      q: 'How does the CFO Engine calculate Runway and Cap Table Dilution?',
      a: 'The Finance & Capital Strategy Suite computes live runway months based on Net Cash Flow, projects 6-month revenues/expenses, and simulates founder vs. investor dilution percentages.',
    },
    {
      q: 'Is my data safe during prompt execution and vector retrieval?',
      a: 'Yes. HQ enforces strict zero-trust tenant isolation with SHA-256 cryptographic file checksums, and does not store company documents outside your isolated workspace schema.',
    },
    {
      q: 'How can I reach support if I need assistance?',
      a: 'You can email our customer support team directly at support@netify.ng or submit a message through our Contact page.',
    },
  ];

  const filteredFaqs = faqs.filter(
    (f) =>
      f.q.toLowerCase().includes(search.toLowerCase()) ||
      f.a.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="py-12 max-w-4xl mx-auto px-6 space-y-16 text-left">
      {/* Header */}
      <div className="text-center space-y-4">
        <Badge variant="premium" className="px-4 py-1.5 rounded-full text-xs tracking-widest font-bold">
          HELP CENTER & SUPPORT KNOWLEDGEBASE
        </Badge>
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
          How can we help?
        </h1>
        <p className="text-slate-600 dark:text-foreground/60 text-base sm:text-lg max-w-xl mx-auto leading-relaxed font-medium">
          Search our knowledgebase or contact our support team at <code className="text-cyan-500 font-mono font-bold">support@netify.ng</code>.
        </p>

        {/* Search Bar */}
        <div className="max-w-xl mx-auto relative pt-4">
          <Search className="absolute left-4 top-7.5 h-5 w-5 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search FAQs, setup guides, onboarding..."
            className="h-12 pl-12 rounded-2xl bg-white dark:bg-card-bg border-slate-200 dark:border-card-border text-sm font-semibold text-slate-900 dark:text-white shadow-sm"
          />
        </div>
      </div>

      {/* FAQ items list */}
      <div className="space-y-4">
        {filteredFaqs.map((f, idx) => (
          <Card
            key={idx}
            className="p-6 border border-slate-200 dark:border-card-border bg-white dark:bg-card-bg shadow-sm hover:shadow-md transition-all text-left space-y-2"
          >
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
              <HelpCircle className="h-5 w-5 text-cyan-400 shrink-0" />
              {f.q}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-foreground/60 leading-relaxed pl-7 font-medium">{f.a}</p>
          </Card>
        ))}
      </div>

      {/* Need more help card */}
      <div className="p-8 rounded-3xl bg-slate-900 dark:bg-[#0A0A0E] border border-slate-800 dark:border-white/10 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <MessageSquare size={20} className="text-cyan-400" />
            Still have questions?
          </h3>
          <p className="text-xs text-slate-400 font-medium">Our executive support team responds in under 2 hours.</p>
        </div>
        <Link href="/contact">
          <Button className="bg-cyan-500 hover:bg-cyan-400 text-white font-bold text-xs h-11 px-6 rounded-xl shadow-lg flex items-center gap-2 shrink-0">
            Contact Support <ArrowRight size={14} />
          </Button>
        </Link>
      </div>
    </div>
  );
}
