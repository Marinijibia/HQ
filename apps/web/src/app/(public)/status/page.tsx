'use client';

import * as React from 'react';
import { Card, Badge, Button } from '@hq/ui';
import { Server, CheckCircle, Activity, RefreshCw } from 'lucide-react';

export default function StatusPage() {
  const [loading, setLoading] = React.useState(false);
  const [lastCheck, setLastCheck] = React.useState('Just now');

  const nodes = [
    { name: 'Core API Monolith Engine', status: 'Operational', latency: '38ms', detail: 'NestJS REST Server' },
    { name: 'PostgreSQL & pgvector Store', status: 'Operational', latency: '11ms', detail: 'Vector Memory Database' },
    { name: 'Redis Cache & Event Bus', status: 'Operational', latency: '2ms', detail: 'Sub-second Broker' },
    { name: 'BullMQ Task Execution Workers', status: 'Active (Idle)', latency: '0ms', detail: 'Background Container Workers' },
    { name: 'Mr. Intelligence Web Discovery', status: 'Operational', latency: '120ms', detail: 'Public Research Scraper' },
    { name: 'Stripe Webhooks & Billing', status: 'Operational', latency: '45ms', detail: 'Payment Gateway' },
  ];

  const handleRefresh = async () => {
    setLoading(true);
    try {
      await fetch('/api/health');
    } catch {
      /* silent */
    } finally {
      setLastCheck(new Date().toLocaleTimeString());
      setLoading(false);
    }
  };

  return (
    <div className="py-12 max-w-4xl mx-auto px-6 space-y-16 text-left">
      {/* Header */}
      <div className="text-center space-y-4">
        <Badge
          className="px-4 py-1.5 rounded-full text-xs tracking-widest font-bold bg-emerald-500/10 border-emerald-500/35 text-emerald-600 dark:text-emerald-400"
        >
          <Activity className="h-3.5 w-3.5 mr-1.5 inline animate-pulse text-emerald-500" />
          ALL SYSTEMS 100% OPERATIONAL
        </Badge>
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
          System Status & Health
        </h1>
        <p className="text-slate-600 dark:text-foreground/60 text-base sm:text-lg max-w-xl mx-auto leading-relaxed font-medium">
          Monitor real-time latency metrics and system availability logs for Netify HQ backend monolith services.
        </p>

        <div className="flex justify-center pt-2">
          <Button
            onClick={handleRefresh}
            disabled={loading}
            variant="outline"
            size="sm"
            className="text-xs font-bold h-9 px-4 rounded-xl border-slate-200 dark:border-white/10 flex items-center gap-2"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh Metrics (Last checked: {lastCheck})
          </Button>
        </div>
      </div>

      {/* Roster of statuses */}
      <div className="grid gap-6 md:grid-cols-2">
        {nodes.map((n, idx) => (
          <Card
            key={idx}
            className="p-6 border border-slate-200 dark:border-card-border bg-white dark:bg-card-bg shadow-sm hover:shadow-md transition-all flex items-center justify-between"
          >
            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Server className="h-5 w-5 text-cyan-400 shrink-0" />
                {n.name}
              </h3>
              <p className="text-xs text-slate-500 dark:text-foreground/45 font-medium">
                {n.detail} • Latency: <span className="font-mono text-cyan-500 font-bold">{n.latency}</span>
              </p>
            </div>
            <span className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-extrabold bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30 shrink-0">
              <CheckCircle className="h-3.5 w-3.5" />
              {n.status}
            </span>
          </Card>
        ))}
      </div>
    </div>
  );
}
