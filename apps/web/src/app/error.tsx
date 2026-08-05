'use client';

import * as React from 'react';
import { Button, Card, CardTitle, CardDescription } from '@hq/ui';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error('Unhandled Global Exception Captured:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#030303] text-foreground flex items-center justify-center p-6 select-none animate-in fade-in duration-300">
      <Card className="max-w-md w-full border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0A0B10]/85 backdrop-blur-2xl p-8 rounded-3xl shadow-xl text-center space-y-6">
        <div className="w-16 h-16 bg-rose-500/10 text-rose-500 rounded-2xl flex items-center justify-center mx-auto border border-rose-500/20 shadow-inner">
          <AlertTriangle size={32} />
        </div>

        <div className="space-y-2">
          <CardTitle className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
            System Notice: Exception Captured
          </CardTitle>
          <CardDescription className="text-slate-500 dark:text-foreground/50 text-xs font-semibold">
            An unexpected error occurred during execution. HQ OS automatically intercepted the fault to protect state integrity.
          </CardDescription>
        </div>

        {error?.message && (
          <div className="p-3 bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-700 dark:text-rose-300 font-mono text-left break-all max-h-24 overflow-y-auto">
            {error.message}
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Button
            onClick={() => reset()}
            className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-white font-bold text-xs h-11 rounded-xl shadow-md flex items-center justify-center gap-2"
          >
            <RefreshCw size={15} /> Retry Operation
          </Button>
          <Link href="/dashboard" className="flex-1">
            <Button
              variant="outline"
              className="w-full border-slate-300 dark:border-white/10 text-slate-900 dark:text-white font-bold text-xs h-11 rounded-xl flex items-center justify-center gap-2"
            >
              <Home size={15} /> Dashboard
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
