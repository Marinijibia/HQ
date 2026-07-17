'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/auth-context';
import { useTheme } from '../../contexts/theme-context';
import { Card, CardTitle, CardDescription, Button } from '@hq/ui';
import {
  Activity,
  Shield,
  Terminal,
  Palette,
  LogOut,
  ShieldAlert,
  ArrowLeft,
  Sun,
  Moon,
  Building,
} from 'lucide-react';

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ElementType;
}

const navItems: SidebarItem[] = [
  { name: 'Operations Center', href: '/dashboard', icon: Activity },
  { name: 'Governance & Policies', href: '/dashboard/compliance', icon: Shield },
  { name: 'Kernel Execution Logs', href: '/dashboard/execution-log', icon: Terminal },
  { name: 'White-labeling & Tenants', href: '/dashboard/white-label', icon: Palette },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { dbUser, loading, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();

  React.useEffect(() => {
    if (!loading && !dbUser) {
      router.push('/login');
    }
  }, [dbUser, loading, router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0A0A0C]">
        <div className="relative flex items-center justify-center">
          <div className="absolute h-16 w-16 animate-spin rounded-full border-4 border-hq-purple/30 border-t-hq-purple" />
          <div className="absolute h-24 w-24 animate-spin rounded-full border border-hq-blue/10 border-t-hq-blue/30" style={{ animationDuration: '3s', animationDirection: 'reverse' }} />
          <span className="text-[10px] font-bold text-foreground/50 tracking-widest uppercase">Loading Kernel</span>
        </div>
      </div>
    );
  }

  const hasAccess =
    dbUser &&
    (dbUser.role === 'SUPER_ADMINISTRATOR' || dbUser.role === 'ADMINISTRATOR');

  if (!hasAccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0A0A0C] p-6 text-left relative overflow-hidden select-none">
        <div className="absolute inset-0 bg-[radial-gradient(#1e1e24_1px,transparent_1px)] [background-size:16px_16px] opacity-10 dark:opacity-20 pointer-events-none"></div>
        <Card className="max-w-md w-full border border-rose-500/20 bg-[#161618]/60 backdrop-blur-xl rounded-[2rem] p-8 shadow-2xl space-y-6 text-foreground">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-rose-500/10 text-rose-500 border border-rose-500/25 rounded-2xl flex items-center justify-center shrink-0">
              <ShieldAlert size={28} />
            </div>
            <div>
              <CardTitle className="text-xl font-extrabold text-white">Access Denied</CardTitle>
              <CardDescription className="text-rose-400 text-xs mt-0.5 font-semibold">Insufficient User Privileges</CardDescription>
            </div>
          </div>

          <p className="text-sm font-semibold text-foreground/70 leading-relaxed">
            The platform operations and kernel logs dashboard are restricted to designated system administrators. Contact your organization super administrator if you require a role elevate invite.
          </p>

          <div className="flex gap-4 pt-2">
            <a href="http://localhost:3000/dashboard" className="w-full">
              <Button className="w-full bg-[#0A84FF] hover:bg-blue-600 text-white rounded-xl text-xs font-bold py-2.5 flex items-center justify-center gap-2">
                <ArrowLeft size={14} /> Back to User Workspace
              </Button>
            </a>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-background text-foreground font-sans relative overflow-hidden">
      {/* Decorative background grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e1e24_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none"></div>

      {/* Glassmorphic left sidebar */}
      <aside className="w-64 border-r border-card-border bg-card-bg/40 backdrop-blur-xl flex flex-col justify-between shrink-0 relative z-20">
        <div>
          {/* Header logo */}
          <div className="h-16 px-6 border-b border-card-border flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-7 w-7 rounded-md bg-gradient-to-tr from-rose-600 to-rose-900 flex items-center justify-center font-bold text-white text-xs shadow-[0_0_15px_rgba(225,29,72,0.2)]">
                HQ
              </div>
              <span className="font-black text-sm tracking-tight text-white">
                Operations <span className="text-rose-500 text-[10px] font-bold">STAFF</span>
              </span>
            </div>
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-lg border border-card-border hover:bg-foreground/5 text-foreground/60 transition-colors"
            >
              {isDarkMode ? <Sun size={14} /> : <Moon size={14} />}
            </button>
          </div>

          {/* Nav list */}
          <nav className="p-4 space-y-1">
            <div className="text-[9px] font-black text-foreground/45 uppercase tracking-wider px-3 mb-2">
              Management
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-rose-500/10 border border-rose-500/20 text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.05)]'
                      : 'text-foreground/75 border border-transparent hover:bg-foreground/5'
                  }`}
                >
                  <Icon size={16} strokeWidth={isActive ? 2.5 : 2} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer profile info */}
        <div className="p-4 border-t border-card-border bg-card-bg/20">
          <div className="flex items-center gap-3 p-2 rounded-xl border border-card-border bg-card-bg/30">
            <div className="h-8 w-8 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center font-bold text-xs uppercase shrink-0">
              {dbUser.name?.slice(0, 2) || 'AD'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-extrabold truncate text-white leading-tight">{dbUser.name}</p>
              <p className="text-[10px] text-foreground/40 font-bold leading-normal truncate capitalize">
                {dbUser.role?.replace('_', ' ').toLowerCase()}
              </p>
            </div>
          </div>
          <Button
            onClick={logout}
            variant="outline"
            className="w-full mt-3 h-9 border-rose-500/10 text-rose-400 hover:bg-rose-500/5 hover:border-rose-500/30 text-xs font-bold rounded-xl flex items-center justify-center gap-2"
          >
            <LogOut size={13} /> Log Out Staff
          </Button>
        </div>
      </aside>

      {/* Main content scroll region */}
      <main className="flex-1 overflow-y-auto relative z-10 flex flex-col">
        <header className="h-16 border-b border-card-border flex items-center justify-between px-8 bg-card-bg/10 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-xs font-bold text-foreground/50">
            <Building size={14} />
            <span>HQ Global Control Panel</span>
            <span>/</span>
            <span className="text-foreground text-xs uppercase tracking-wider font-extrabold">
              {pathname.split('/').pop() || 'overview'}
            </span>
          </div>
        </header>

        <div className="flex-1 p-8 max-w-7xl w-full mx-auto space-y-8">
          {children}
        </div>
      </main>
    </div>
  );
}
