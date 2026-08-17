'use client';

import * as React from 'react';
import { Button, Card, CardTitle, CardDescription } from '@hq/ui';
import { ShieldAlert, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error('Admin Portal Exception Captured:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#06080D] text-foreground flex items-center justify-center p-6 animate-in fade-in duration-300 select-none">
      <Card className="max-w-md w-full border border-rose-500/20 bg-white/90 dark:bg-[#0B0F19]/90 backdrop-blur-2xl p-8 rounded-3xl shadow-2xl text-center space-y-6">
        <div className="w-16 h-16 bg-rose-500/10 text-rose-500 rounded-2xl flex items-center justify-center mx-auto border border-rose-500/20 shadow-inner">
          <ShieldAlert size={32} />
        </div>

        <div className="space-y-2">
          <CardTitle className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
            Admin Kernel Exception
          </CardTitle>
          <CardDescription className="text-rose-500 dark:text-rose-400 text-xs font-semibold">
            System fault captured on Operations Console. State integrity protected.
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
            className="flex-1 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs h-11 rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            <RefreshCw size={15} /> Reset Console
          </Button>
          <Link href="/dashboard" className="flex-1">
            <Button
              variant="outline"
              className="w-full border-slate-300 dark:border-white/10 text-slate-700 dark:text-slate-200 font-bold text-xs h-11 rounded-xl flex items-center justify-center gap-2 cursor-pointer hover:bg-slate-100 dark:hover:bg-white/5"
            >
              <Home size={15} /> Operations
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
