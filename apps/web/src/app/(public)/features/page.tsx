'use client';

import * as React from 'react';
import { Card, Badge } from '@hq/ui';
import { Layers, GitBranch, Network, RotateCcw } from 'lucide-react';

export default function FeaturesPage() {
  return (
    <div className="py-12 max-w-6xl mx-auto px-6 space-y-16">
      {/* Header */}
      <div className="text-center space-y-3">
        <Badge
          variant="ai"
          className="px-3 py-1 rounded-full text-[10px] tracking-widest font-bold"
        >
          CORE PLATFORM CAPABILITIES
        </Badge>
        <h1 className="text-4xl font-extrabold tracking-tight text-[#1A1A1E] dark:text-white sm:text-5xl">
          Engineered for Executive Autonomy
        </h1>
        <p className="text-foreground/50 text-sm max-w-xl mx-auto leading-relaxed">
          HQ bridges strategic intent with actual execution through inter-agent dialogue loops and
          deep retrieval-augmented database states.
        </p>
      </div>

      {/* Grid of features */}
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        <Card className="p-6 space-y-4 border border-black/10 dark:border-[#1E1E24]/60 bg-white dark:bg-black/40 backdrop-blur-md text-left">
          <div className="h-10 w-10 rounded-lg bg-hq-blue/10 flex items-center justify-center text-hq-blue border border-hq-blue/20">
            <GitBranch className="h-5 w-5" />
          </div>
          <h3 className="text-base font-bold text-[#1A1A1E] dark:text-white">
            WBS Graph Generation
          </h3>
          <p className="text-xs text-foreground/50 leading-relaxed">
            COS Arthur Steward decomposes abstract objectives into clear Work Breakdown Structure
            graphs, validating execution timelines.
          </p>
        </Card>

        <Card className="p-6 space-y-4 border border-black/10 dark:border-[#1E1E24]/60 bg-white dark:bg-black/40 backdrop-blur-md text-left">
          <div className="h-10 w-10 rounded-lg bg-hq-purple/10 flex items-center justify-center text-hq-purple border border-hq-purple/20">
            <Layers className="h-5 w-5" />
          </div>
          <h3 className="text-base font-bold text-[#1A1A1E] dark:text-white">
            Hierarchical RAG Memory
          </h3>
          <p className="text-xs text-foreground/50 leading-relaxed">
            Accesses working, mission, and long-term organization vector spaces sequentially,
            minimizing token costs.
          </p>
        </Card>

        <Card className="p-6 space-y-4 border border-black/10 dark:border-[#1E1E24]/60 bg-white dark:bg-black/40 backdrop-blur-md text-left">
          <div className="h-10 w-10 rounded-lg bg-hq-cyan/10 flex items-center justify-center text-hq-cyan border border-hq-cyan/20">
            <RotateCcw className="h-5 w-5" />
          </div>
          <h3 className="text-base font-bold text-[#1A1A1E] dark:text-white">
            Self-Evaluation Gate
          </h3>
          <p className="text-xs text-foreground/50 leading-relaxed">
            Validates output drafts on tone, completeness, and corporate policy guidelines before
            final dispatch.
          </p>
        </Card>
      </div>

      {/* Interactive Visual Block */}
      <div className="border border-black/10 dark:border-[#1E1E24]/60 bg-white dark:bg-[#0A0A0C]/50 rounded-2xl p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-hq-blue/5 rounded-full blur-[100px]" />
        <div className="max-w-2xl space-y-4 relative z-10 text-left">
          <h2 className="text-xl font-bold text-[#1A1A1E] dark:text-white flex items-center gap-2">
            <Network className="h-5 w-5 text-hq-blue" />
            Parallel Execution Engine
          </h2>
          <p className="text-xs text-foreground/50 leading-relaxed">
            Unlike standard AI chatbots that generate simple text, HQ converts tasks into executable
            workflows running on independent worker containers, tracking billing limits and auditing
            outputs.
          </p>
        </div>
      </div>
    </div>
  );
}
