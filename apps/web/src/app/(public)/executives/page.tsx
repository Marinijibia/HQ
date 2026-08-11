'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card, Badge, Button } from '@hq/ui';
import { Bot, ArrowRight, ShieldCheck } from 'lucide-react';

export default function ExecutivesPage() {
  const directors = [
    {
      name: 'Asad',
      role: 'Chief Executive Officer (CEO)',
      dept: 'Executive Management',
      text: 'Coordinates strategic vision, delegates DAG task priorities, and maintains owner alignment.',
      color: 'text-hq-blue bg-hq-blue/10 border-hq-blue/20',
    },
    {
      name: 'Teema',
      role: 'Operations Director',
      dept: 'Operations & Execution',
      text: 'Decomposes missions into Work Breakdown Structure (WBS) graphs, managing task execution queues.',
      color: 'text-hq-purple bg-hq-purple/10 border-hq-purple/20',
    },
    {
      name: 'Legal Compliance Director',
      role: 'General Counsel & SOC2 Lead',
      dept: 'Zero-Trust Security',
      text: 'Enforces legal holds, logs cryptographic SHA-256 audit trails, and audits regulatory compliance.',
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    },
    {
      name: 'Resource Director',
      role: 'Chief Human Resources Officer',
      dept: 'HR & Talent Governance',
      text: 'Manages team invitations, monitors workspace permissions, and orchestrates onboarding workflows.',
      color: 'text-sky-400 bg-sky-400/10 border-sky-400/20',
    },
    {
      name: 'Mr. Intelligence',
      role: 'Corporate Research AI',
      dept: 'Market Research',
      text: 'Indexes web, news, and social media signals during onboarding to maintain active corporate vector memory.',
      color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
    },
    {
      name: 'CFO Strategy Director',
      role: 'Chief Financial Officer',
      dept: 'Capital & Runway',
      text: 'Simulates cap table dilution, calculates cash runway, and monitors CAC:LTV unit economics.',
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    },
  ];

  return (
    <div className="py-12 max-w-6xl mx-auto px-6 space-y-16 text-left">
      {/* Header */}
      <div className="text-center space-y-4">
        <Badge variant="ai" className="px-4 py-1.5 rounded-full text-xs tracking-widest font-bold">
          <Bot className="h-3.5 w-3.5 mr-1.5 inline text-cyan-400" />
          ACTIVE C-SUITE DIRECTORS ROSTER
        </Badge>
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
          Meet Your Autonomous AI Boardroom
        </h1>
        <p className="text-slate-600 dark:text-foreground/60 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed font-medium">
          HQ deploys a full suite of specialized AI directors that collaborate dynamically via message loops to plan, forecast, and execute.
        </p>
      </div>

      {/* Directory Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {directors.map((d) => (
          <Card
            key={d.name}
            className="p-7 space-y-4 border border-slate-200 dark:border-card-border bg-white dark:bg-card-bg shadow-sm hover:shadow-md transition-all text-left flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">{d.name}</h3>
                  <p className="text-xs text-slate-600 dark:text-foreground/75 font-extrabold">{d.role}</p>
                </div>
                <Badge variant="outline" className={`text-[9px] font-bold uppercase px-2.5 py-0.5 border ${d.color}`}>
                  {d.dept}
                </Badge>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-foreground/60 leading-relaxed italic font-medium">
                &ldquo;{d.text}&rdquo;
              </p>
            </div>
          </Card>
        ))}
      </div>

      {/* Boardroom CTA */}
      <div className="p-8 rounded-3xl bg-slate-900 dark:bg-[#0A0A0E] border border-slate-800 dark:border-white/10 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <ShieldCheck size={20} className="text-cyan-400" />
            Ready to interact with your AI Directors?
          </h3>
          <p className="text-xs text-slate-400 font-medium">Start free trial or enter your active boardroom.</p>
        </div>
        <Link href="/onboarding">
          <Button className="bg-cyan-500 hover:bg-cyan-400 text-white font-bold text-xs h-11 px-6 rounded-xl shadow-lg flex items-center gap-2 shrink-0">
            Launch AI Boardroom <ArrowRight size={14} />
          </Button>
        </Link>
      </div>
    </div>
  );
}
