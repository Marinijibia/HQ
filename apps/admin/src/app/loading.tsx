'use client';

import * as React from 'react';
import { Activity } from 'lucide-react';

export default function AdminLoading() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-background text-foreground flex flex-col items-center justify-center p-6 select-none">
      <div className="relative w-16 h-16 flex items-center justify-center mb-4">
        <div className="absolute inset-0 rounded-full border-2 border-rose-500/20 border-t-rose-500 animate-spin" />
        <Activity className="h-7 w-7 text-rose-500 animate-pulse" />
      </div>
      <p className="text-xs font-bold text-slate-700 dark:text-foreground/75 tracking-wider uppercase">
        Loading Operations Kernel...
      </p>
    </div>
  );
}
