'use client';

import * as React from 'react';
import Link from 'next/link';
import { Button, Card, CardTitle, CardDescription } from '@hq/ui';
import { ShieldAlert, ArrowLeft, Terminal, Activity, Shield, Palette } from 'lucide-react';

export default function AdminNotFound() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-background text-foreground flex items-center justify-center p-6 select-none animate-in fade-in duration-300">
      <Card className="max-w-md w-full border border-rose-500/20 bg-white dark:bg-card-bg p-8 rounded-3xl shadow-xl text-center space-y-6">
        <div className="w-16 h-16 bg-rose-500/10 text-rose-500 rounded-2xl flex items-center justify-center mx-auto border border-rose-500/20 shadow-inner">
          <ShieldAlert size={32} />
        </div>

        <div className="space-y-2">
          <CardTitle className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
            404 — Console Module Not Found
          </CardTitle>
          <CardDescription className="text-rose-500 dark:text-rose-400 text-xs font-semibold">
            Operational endpoint unmapped or access restricted.
          </CardDescription>
        </div>

        <p className="text-xs text-slate-600 dark:text-foreground/70 leading-relaxed font-medium">
          The requested admin console route does not exist on the current system kernel index. Please select a valid operations module below.
        </p>

        <div className="grid grid-cols-2 gap-2 text-left pt-2">
          <Link href="/dashboard">
            <Card className="p-3 border border-slate-200 dark:border-card-border hover:border-rose-500/40 bg-slate-50 dark:bg-card-bg/50 transition-all flex items-center gap-2 cursor-pointer">
              <Activity className="h-4 w-4 text-rose-500 shrink-0" />
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">Operations</p>
                <p className="text-[10px] text-slate-500 dark:text-foreground/45">Main Center</p>
              </div>
            </Card>
          </Link>
          <Link href="/dashboard/compliance">
            <Card className="p-3 border border-slate-200 dark:border-card-border hover:border-rose-500/40 bg-slate-50 dark:bg-card-bg/50 transition-all flex items-center gap-2 cursor-pointer">
              <Shield className="h-4 w-4 text-rose-500 shrink-0" />
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">Governance</p>
                <p className="text-[10px] text-slate-500 dark:text-foreground/45">Policies</p>
              </div>
            </Card>
          </Link>
          <Link href="/dashboard/execution-log">
            <Card className="p-3 border border-slate-200 dark:border-card-border hover:border-rose-500/40 bg-slate-50 dark:bg-card-bg/50 transition-all flex items-center gap-2 cursor-pointer">
              <Terminal className="h-4 w-4 text-rose-500 shrink-0" />
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">Execution Logs</p>
                <p className="text-[10px] text-slate-500 dark:text-foreground/45">Kernel Traces</p>
              </div>
            </Card>
          </Link>
          <Link href="/dashboard/white-label">
            <Card className="p-3 border border-slate-200 dark:border-card-border hover:border-rose-500/40 bg-slate-50 dark:bg-card-bg/50 transition-all flex items-center gap-2 cursor-pointer">
              <Palette className="h-4 w-4 text-rose-500 shrink-0" />
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">Tenants</p>
                <p className="text-[10px] text-slate-500 dark:text-foreground/45">White-labeling</p>
              </div>
            </Card>
          </Link>
        </div>

        <div className="pt-2">
          <Link href="/dashboard">
            <Button className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs h-11 rounded-xl shadow-md flex items-center justify-center gap-2">
              <ArrowLeft size={15} /> Return to Operations Center
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
