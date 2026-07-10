'use client';

import * as React from 'react';
import { Card, Badge } from '@hq/ui';
import { Server, CheckCircle } from 'lucide-react';

export default function StatusPage() {
  const nodes = [
    { name: 'Core API Server', status: 'Operational', latency: '42ms' },
    { name: 'pgvector Database', status: 'Operational', latency: '12ms' },
    { name: 'Redis Cache Layer', status: 'Operational', latency: '2ms' },
    { name: 'BullMQ Workers', status: 'Active (Idle)', latency: '0ms' },
  ];

  return (
    <div className="py-12 max-w-4xl mx-auto px-6 space-y-16">
      {/* Header */}
      <div className="text-center space-y-3">
        <Badge
          variant="premium"
          className="px-3.5 py-1 rounded-full text-xs tracking-widest font-bold bg-green-500/10 border-green-500/35 text-green-400"
        >
          ALL SYSTEMS OPERATIONAL
        </Badge>
        <h1 className="text-4xl font-extrabold tracking-tight text-[#1A1A1E] dark:text-white sm:text-5xl">
          System Status & Health
        </h1>
        <p className="text-foreground/50 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
          Monitor real-time latency metrics and system availability logs for all backend monolith
          services.
        </p>
      </div>

      {/* Roster of statuses */}
      <div className="grid gap-6 md:grid-cols-2 text-left">
        {nodes.map((n, idx) => (
          <Card
            key={idx}
            className="p-6 border border-card-border bg-card-bg shadow-[var(--card-shadow)] card-transition flex items-center justify-between"
          >
            <div className="space-y-1">
              <h3 className="text-base font-bold text-[#1A1A1E] dark:text-white flex items-center gap-1.5">
                <Server className="h-5 w-5 text-hq-blue" />
                {n.name}
              </h3>
              <p className="text-xs text-foreground/45">Latency: {n.latency}</p>
            </div>
            <span className="flex items-center gap-1.5 text-sm text-green-400 font-semibold bg-green-500/10 px-2.5 py-0.5 rounded-full border border-green-500/30">
              <CheckCircle className="h-4 w-4" />
              {n.status}
            </span>
          </Card>
        ))}
      </div>
    </div>
  );
}
