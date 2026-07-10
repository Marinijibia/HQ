'use client';

import * as React from 'react';
import { Card, Badge } from '@hq/ui';
import { BookOpen, Code, FileText, Terminal } from 'lucide-react';

export default function ResourcesPage() {
  const resourceCategories = [
    {
      title: 'Developer Guides',
      icon: Terminal,
      items: ['Monorepo Setup', 'Prisma Schema Migrations', 'BullMQ Worker Configs'],
    },
    {
      title: 'AI Prompts Library',
      icon: Code,
      items: ['CEO Alignment System Prompts', 'Marketing Templates', 'Evaluation QA Standards'],
    },
    {
      title: 'Product Documentation',
      icon: BookOpen,
      items: ['Workspace Administration', 'Custom Claims Mapping', 'Stripe Billing Webhooks'],
    },
  ];

  return (
    <div className="py-12 max-w-6xl mx-auto px-6 space-y-16">
      {/* Header */}
      <div className="text-center space-y-3">
        <Badge
          variant="ai"
          className="px-3 py-1 rounded-full text-[10px] tracking-widest font-bold"
        >
          RESOURCES & DOCUMENTATION
        </Badge>
        <h1 className="text-4xl font-extrabold tracking-tight text-[#1A1A1E] dark:text-white sm:text-5xl">
          Everything You Need to Build
        </h1>
        <p className="text-foreground/50 text-sm max-w-xl mx-auto leading-relaxed">
          Access API specifications, system design guidelines, and developer setup instructions.
        </p>
      </div>

      {/* Grid */}
      <div className="grid gap-8 md:grid-cols-3">
        {resourceCategories.map((c, idx) => {
          const Icon = c.icon;
          return (
            <Card
              key={idx}
              className="p-6 space-y-5 border border-black/10 dark:border-[#1E1E24]/60 bg-white dark:bg-black/40 backdrop-blur-md text-left"
            >
              <div className="h-10 w-10 rounded-lg bg-hq-blue/10 flex items-center justify-center text-hq-blue border border-hq-blue/20">
                <Icon className="h-5 w-5" />
              </div>
              <div className="space-y-3">
                <h3 className="text-base font-bold text-[#1A1A1E] dark:text-white">{c.title}</h3>
                <ul className="space-y-2 text-xs text-foreground/50">
                  {c.items.map((item) => (
                    <li
                      key={item}
                      className="hover:text-[#1A1A1E] dark:hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <FileText className="h-3.5 w-3.5 text-foreground/40 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
