'use client';

import * as React from 'react';
import { Card, Badge, Button } from '@hq/ui';
import { Slack, Github, CreditCard, Link as LinkIcon, CheckCircle } from 'lucide-react';

export default function IntegrationsPage() {
  const integrations = [
    {
      name: 'Slack Notification Sync',
      icon: Slack,
      category: 'Communication',
      desc: 'Verify hooks to push boardroom summaries, recommendations feeds, and task status logs directly to your Slack channels.',
      status: 'Ready',
      color: 'text-pink-500 bg-pink-500/10 border-pink-500/20',
    },
    {
      name: 'GitHub Webhooks Commit',
      icon: Github,
      category: 'Developer Tools',
      desc: 'Connect repositories to trigger package audits, compile checks, and code blueprints generation on every Git push.',
      status: 'Ready',
      color: 'text-white bg-white/10 border-white/20',
    },
    {
      name: 'Stripe Billing Gateway',
      icon: CreditCard,
      category: 'Finance',
      desc: 'Manage checkout sessions, upgrade tiers, and verify monthly billing claims via cryptographic webhook signature listeners.',
      status: 'Ready',
      color: 'text-indigo-400 bg-indigo-400/10 border-indigo-400/20',
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
          THIRD-PARTY CONNECTORS
        </Badge>
        <h1 className="text-4xl font-extrabold tracking-tight text-[#1A1A1E] dark:text-white sm:text-5xl">
          Connected Ecosystem
        </h1>
        <p className="text-foreground/50 text-sm max-w-xl mx-auto leading-relaxed">
          HQ integrates directly with your existing developer, operations, and financial tools using
          secure signature-verifying webhook listeners.
        </p>
      </div>

      {/* Grid */}
      <div className="grid gap-8 md:grid-cols-3 text-left">
        {integrations.map((i, idx) => {
          const Icon = i.icon;
          return (
            <Card
              key={idx}
              className="p-6 space-y-5 border border-black/5 dark:border-[#1E1E24]/60 bg-white/50 dark:bg-black/40 backdrop-blur-md hover:border-hq-blue/40 transition-colors flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div
                    className={`h-10 w-10 rounded-lg flex items-center justify-center border ${i.color}`}
                  >
                    <Icon className="h-5.5 w-5.5" />
                  </div>
                  <span className="text-[9px] font-bold text-foreground/45 uppercase tracking-wider bg-black/5 dark:bg-[#1E1E24]/40 border border-black/5 dark:border-[#1E1E24] px-2 py-0.5 rounded">
                    {i.category}
                  </span>
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-base font-bold text-[#1A1A1E] dark:text-white">{i.name}</h3>
                  <p className="text-xs text-foreground/50 leading-relaxed">{i.desc}</p>
                </div>
              </div>
              <div className="pt-4 border-t border-black/5 dark:border-[#1E1E24]/40 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs text-green-500 font-semibold">
                  <CheckCircle className="h-4 w-4" />
                  {i.status}
                </span>
                <Button
                  variant="ghost"
                  className="text-xs font-semibold px-3 h-8 border border-black/5 dark:border-[#1E1E24] hover:bg-black/5 dark:hover:bg-[#1E1E24]/20 flex items-center gap-1"
                >
                  <LinkIcon className="h-3 w-3" />
                  Connect
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
