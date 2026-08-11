'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card, Badge, Button } from '@hq/ui';
import { Slack, Github, CreditCard, Link as LinkIcon, CheckCircle, Database, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../../contexts/auth-context';

export default function IntegrationsPage() {
  const { user } = useAuth();

  const integrations = [
    {
      name: 'Slack Notification Sync',
      icon: Slack,
      category: 'Communication',
      desc: 'Verify webhooks to push boardroom summaries, recommendations feeds, and task status logs directly to your Slack channels.',
      status: 'Ready',
      color: 'text-pink-500 bg-pink-500/10 border-pink-500/20',
    },
    {
      name: 'GitHub Webhooks Commit',
      icon: Github,
      category: 'Developer Tools',
      desc: 'Connect repositories to trigger package audits, compile checks, and code blueprints generation on every Git push.',
      status: 'Ready',
      color: 'text-slate-900 dark:text-white bg-slate-200 dark:bg-white/10 border-slate-300 dark:border-white/20',
    },
    {
      name: 'Stripe Billing Gateway',
      icon: CreditCard,
      category: 'Finance & Payments',
      desc: 'Manage checkout sessions, upgrade tiers, and verify monthly billing claims via cryptographic webhook signature listeners.',
      status: 'Ready',
      color: 'text-indigo-400 bg-indigo-400/10 border-indigo-400/20',
    },
    {
      name: 'Google Drive Asset Store',
      icon: Database,
      category: 'Asset Vault',
      desc: 'Sync executive brand assets, financial PDFs, and corporate handbooks directly into the Asset Center vault with SHA-256 integrity checks.',
      status: 'Ready',
      color: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20',
    },
  ];

  return (
    <div className="py-12 max-w-6xl mx-auto px-6 space-y-16 text-left">
      {/* Header */}
      <div className="text-center space-y-4">
        <Badge variant="premium" className="px-4 py-1.5 rounded-full text-xs tracking-widest font-bold">
          THIRD-PARTY CONNECTORS & WEBHOOKS
        </Badge>
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
          Connected Ecosystem
        </h1>
        <p className="text-slate-600 dark:text-foreground/60 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed font-medium">
          HQ integrates directly with your existing developer, operations, and financial tools using secure signature-verifying webhook listeners.
        </p>
      </div>

      {/* Grid */}
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
        {integrations.map((i, idx) => {
          const Icon = i.icon;
          return (
            <Card
              key={idx}
              className="p-6 space-y-5 border border-slate-200 dark:border-card-border bg-white dark:bg-card-bg shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className={`h-10 w-10 rounded-2xl flex items-center justify-center border ${i.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <Badge variant="outline" className="text-[9px] uppercase font-bold">{i.category}</Badge>
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">{i.name}</h3>
                  <p className="text-xs text-slate-600 dark:text-foreground/60 leading-relaxed font-medium">{i.desc}</p>
                </div>
              </div>
              <div className="pt-4 border-t border-slate-100 dark:border-card-border/50 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs text-emerald-500 font-extrabold">
                  <CheckCircle className="h-3.5 w-3.5" />
                  {i.status}
                </span>
                <Link href={user ? '/integration-hub' : '/onboarding'}>
                  <Button size="sm" variant="ghost" className="text-xs font-bold px-3 h-8 border border-slate-200 dark:border-white/10 flex items-center gap-1">
                    <LinkIcon className="h-3 w-3" />
                    Configure
                  </Button>
                </Link>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Integration Hub Link Card */}
      <div className="p-8 rounded-3xl bg-slate-900 dark:bg-[#0A0A0E] border border-slate-800 dark:border-white/10 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <ShieldCheck size={20} className="text-cyan-400" />
            Manage Active Integrations & Webhooks
          </h3>
          <p className="text-xs text-slate-400 font-medium">Access your live Integration Hub to grant permissions for active AI directors.</p>
        </div>
        <Link href={user ? '/integration-hub' : '/onboarding'}>
          <Button className="bg-cyan-500 hover:bg-cyan-400 text-white font-bold text-xs h-11 px-6 rounded-xl shadow-lg flex items-center gap-2 shrink-0">
            Open Integration Hub <ArrowRight size={14} />
          </Button>
        </Link>
      </div>
    </div>
  );
}
