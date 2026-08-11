'use client';

import * as React from 'react';
import Link from 'next/link';
import { Button, Card, Input } from '@hq/ui';
import {
  Compass,
  Search,
  ArrowRight,
  Bot,
  Building2,
  Target,
  MessageSquare,
  Settings,
  HelpCircle,
} from 'lucide-react';
import { HQLogo } from '../components/hq-logo';

export default function NotFound() {
  const [searchQuery, setSearchQuery] = React.useState('');

  const QUICK_LINKS = [
    { title: 'Executive Boardroom', desc: 'Convene with AI directors', href: '/boardroom', icon: Building2, color: 'text-cyan-500 bg-cyan-500/10 border-cyan-500/20' },
    { title: 'Mission Control', desc: 'Audit active strategic WBS', href: '/missions', icon: Target, color: 'text-purple-500 bg-purple-500/10 border-purple-500/20' },
    { title: 'Strategic Discussions', desc: 'Review decision threads', href: '/discussions', icon: MessageSquare, color: 'text-blue-500 bg-blue-500/10 border-blue-500/20' },
    { title: 'Workspace Settings', desc: 'Configure HQ parameters', href: '/settings', icon: Settings, color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' },
    { title: 'Help & Knowledge Base', desc: 'Documentation & guides', href: '/help-center', icon: HelpCircle, color: 'text-amber-500 bg-amber-500/10 border-amber-500/20' },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const q = searchQuery.toLowerCase();
    let target = '/dashboard';
    if (q.includes('mission') || q.includes('wbs')) target = '/missions';
    else if (q.includes('board') || q.includes('exec')) target = '/boardroom';
    else if (q.includes('setting') || q.includes('user')) target = '/settings';
    else if (q.includes('chat') || q.includes('discuss')) target = '/discussions';
    
    if (typeof window !== 'undefined') {
      window.location.href = target;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#030303] text-foreground flex flex-col justify-between font-sans relative overflow-hidden select-none p-6 animate-in fade-in duration-300">
      {/* Ambient Lighting Glows */}
      <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-cyan-500/10 dark:bg-cyan-500/15 blur-[140px] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#94a3b8_1px,transparent_1px)] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />

      {/* Header */}
      <header className="flex h-16 items-center justify-between max-w-5xl mx-auto w-full relative z-10">
        <Link href="/" className="flex items-center space-x-2.5 group">
          <HQLogo size={28} />
          <span className="font-extrabold tracking-tight text-slate-900 dark:text-white text-lg">
            HQ<span className="text-cyan-500">.</span>
          </span>
        </Link>
        <Link href="/dashboard">
          <Button variant="ghost" className="text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white">
            Enter Workspace &rrarr;
          </Button>
        </Link>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex flex-col items-center justify-center relative z-10 my-8">
        <div className="w-full max-w-2xl space-y-8 text-center">
          {/* Error Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 text-xs font-black tracking-widest uppercase shadow-sm">
            <Compass className="h-4 w-4 animate-spin" style={{ animationDuration: '8s' }} />
            404 — ROUTE UNMAPPED
          </div>

          <div className="space-y-3">
            <h1 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
              Coordinate Outside Active Bounds
            </h1>
            <p className="text-sm text-slate-600 dark:text-foreground/60 max-w-lg mx-auto leading-relaxed font-medium">
              The address you navigated to does not map to a recognized operational route or executive module.
            </p>
          </div>

          {/* AI Executive Guidance Box */}
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0A0B10]/85 shadow-sm text-left flex items-start gap-3.5 max-w-lg mx-auto">
            <div className="h-10 w-10 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-500 flex items-center justify-center shrink-0">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                Asad (CEO) <span className="text-[10px] text-cyan-500 font-semibold">• Direct Assistance</span>
              </p>
              <p className="text-xs text-slate-600 dark:text-foreground/70 mt-1 leading-normal font-normal">
                "No worries! I've routed you back to HQ. Use the search bar below or pick a core boardroom section."
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="max-w-md mx-auto relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-foreground/40" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search destination (e.g. Boardroom, Missions, Settings)..."
              className="pl-10 pr-24 h-12 text-xs bg-white dark:bg-card-bg border-slate-300 dark:border-white/10 text-slate-900 dark:text-white rounded-2xl shadow-sm focus-visible:ring-cyan-500"
            />
            <Button
              type="submit"
              size="sm"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 h-9 px-4 text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-white rounded-xl"
            >
              Locate
            </Button>
          </form>

          {/* Quick Links Matrix */}
          <div className="pt-4 text-left">
            <p className="text-[10.5px] font-black uppercase tracking-widest text-slate-400 dark:text-foreground/35 mb-3 text-center">
              Recommended Executive Destinations
            </p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {QUICK_LINKS.map((link) => {
                const Icon = link.icon;
                return (
                  <Link key={link.title} href={link.href} className="group">
                    <Card className="p-3.5 border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0A0B10]/85 hover:border-cyan-500/40 transition-all shadow-sm flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl border ${link.color} shrink-0`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-cyan-500 transition-colors">
                            {link.title}
                          </h4>
                          <p className="text-[10px] text-slate-500 dark:text-foreground/50 font-medium mt-0.5">
                            {link.desc}
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-cyan-500 group-hover:translate-x-0.5 transition-all" />
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="h-12 flex items-center justify-center text-[11px] font-bold text-slate-500 dark:text-foreground/45 relative z-10 max-w-5xl mx-auto w-full border-t border-slate-200 dark:border-white/10">
        <span>© 2026 HQ Inc. | Executive OS Route Navigation</span>
      </footer>
    </div>
  );
}
