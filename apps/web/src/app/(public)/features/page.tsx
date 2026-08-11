'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card, Badge, Button } from '@hq/ui';
import { Layers, GitBranch, Network, RotateCcw, ShieldCheck, Sparkles, DollarSign, Bot, ArrowRight } from 'lucide-react';

export default function FeaturesPage() {
  const featureList = [
    {
      title: 'WBS DAG Task Generator',
      desc: 'Teema & Asad decompose abstract business goals into Directed Acyclic Graphs (DAG), assigning critical path tasks to specialist directors.',
      icon: GitBranch,
      color: 'bg-hq-blue/10 text-hq-blue border-hq-blue/20',
      badge: 'Operations Core',
    },
    {
      title: 'Finance & CFO Engine',
      desc: 'Live cash runway calculation, 6-month financial forecasting, CAC:LTV unit economics, and cap table dilution modeling.',
      icon: DollarSign,
      color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      badge: 'CFO Suite',
    },
    {
      title: 'Mr. Intelligence Web Discovery',
      desc: 'Performs live web, news, and social media background indexing during onboarding to build persistent corporate memory on your organization.',
      icon: Bot,
      color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
      badge: 'Research AI',
    },
    {
      title: 'Hierarchical RAG Memory',
      desc: 'Queries active working state, mission memory, and long-term organization vector stores sequentially to optimize accuracy and token performance.',
      icon: Layers,
      color: 'bg-hq-purple/10 text-hq-purple border-hq-purple/20',
      badge: 'Vector Vault',
    },
    {
      title: 'SHA-256 Checksum Asset Vault',
      desc: 'Drag-and-drop file ledger with cryptographic SHA-256 integrity checks, regulatory Legal Hold locks, and 1-Click historical version rollbacks.',
      icon: ShieldCheck,
      color: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      badge: 'Security Vault',
    },
    {
      title: 'Inter-Agent Evaluation Gate',
      desc: 'Validates output deliverables against corporate tone, legal compliance, and quality benchmarks before executive dispatch.',
      icon: RotateCcw,
      color: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
      badge: 'Quality Gate',
    },
  ];

  return (
    <div className="py-12 max-w-6xl mx-auto px-6 space-y-16 text-left">
      {/* Header */}
      <div className="text-center space-y-4">
        <Badge variant="ai" className="px-4 py-1.5 rounded-full text-xs tracking-widest font-bold">
          CORE PLATFORM CAPABILITIES
        </Badge>
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
          Engineered for Executive Autonomy
        </h1>
        <p className="text-slate-600 dark:text-foreground/60 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed font-medium">
          HQ bridges strategic vision with autonomous execution through inter-agent dialogue loops and deep vector memory states.
        </p>
      </div>

      {/* Grid of features */}
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {featureList.map((f, idx) => (
          <Card key={idx} className="p-7 space-y-4 border border-slate-200 dark:border-card-border bg-white dark:bg-card-bg shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className={`h-10 w-10 rounded-2xl flex items-center justify-center border ${f.color}`}>
                  <f.icon className="h-5 w-5" />
                </div>
                <Badge variant="outline" className="text-[10px] uppercase font-bold">{f.badge}</Badge>
              </div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white leading-tight">{f.title}</h3>
              <p className="text-xs text-slate-600 dark:text-foreground/60 leading-relaxed font-medium">{f.desc}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Parallel Execution Engine Showcase */}
      <div className="border border-cyan-500/30 bg-gradient-to-r from-cyan-950/20 via-blue-950/20 to-purple-950/20 shadow-2xl rounded-3xl p-8 sm:p-12 relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-8">
        <div className="max-w-2xl space-y-4 relative z-10">
          <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/40 text-[10px] font-bold">
            ARCHITECTURE HIGHLIGHT
          </Badge>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Network className="h-6 w-6 text-cyan-400" />
            Parallel Autonomous Execution Engine
          </h2>
          <p className="text-sm text-slate-600 dark:text-foreground/70 leading-relaxed font-medium">
            Unlike static AI chatbots that only spit text, HQ turns goals into executable micro-tasks running across background container workers with real-time logging, Redis queue dispatch, and PostgreSQL audit trails.
          </p>
        </div>

        <div className="flex flex-col gap-3 shrink-0">
          <Link href="/onboarding">
            <Button className="bg-cyan-500 hover:bg-cyan-400 text-white font-bold text-xs h-11 px-6 rounded-xl shadow-lg flex items-center gap-2">
              Experience Platform <ArrowRight size={14} />
            </Button>
          </Link>
          <Link href="/book-demo">
            <Button variant="outline" className="border-slate-300 dark:border-white/20 text-slate-900 dark:text-white font-bold text-xs h-11 px-6 rounded-xl">
              Book Live Demo
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
