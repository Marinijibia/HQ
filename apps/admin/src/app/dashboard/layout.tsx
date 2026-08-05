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
  UserPlus,
  Award,
} from 'lucide-react';
import { AsadAdminVoiceButton } from '../../components/voice/asad-admin-voice-button';
import { InviteUserModal } from '../../components/invite-user-modal';

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ElementType;
}

const navItems: SidebarItem[] = [
  { name: 'Operations Center', href: '/dashboard', icon: Activity },
  { name: 'AI Executive Training CMS', href: '/dashboard/cms', icon: Building },
  { name: 'Governance & Policies', href: '/dashboard/compliance', icon: Shield },
  { name: 'Kernel Execution Logs', href: '/dashboard/execution-log', icon: Terminal },
  { name: 'White-labeling & Tenants', href: '/dashboard/white-label', icon: Palette },
];


export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { dbUser, loading, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const [inviteModalOpen, setInviteModalOpen] = React.useState(false);

  React.useEffect(() => {
    if (!loading && !dbUser) {
      router.push('/login');
    }
  }, [dbUser, loading, router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background text-foreground">
        <div className="relative flex items-center justify-center">
          <div className="absolute h-16 w-16 animate-spin rounded-full border-4 border-rose-500/30 border-t-rose-500" />
          <div className="absolute h-24 w-24 animate-spin rounded-full border border-rose-500/10 border-t-rose-500/30" style={{ animationDuration: '3s', animationDirection: 'reverse' }} />
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
      <div className="flex min-h-screen items-center justify-center bg-background p-6 text-left relative overflow-hidden select-none">
        <div className="absolute inset-0 bg-[radial-gradient(#1e1e24_1px,transparent_1px)] [background-size:16px_16px] opacity-10 dark:opacity-20 pointer-events-none"></div>
        <Card className="max-w-md w-full border border-rose-500/20 bg-card-bg/60 backdrop-blur-xl rounded-[2rem] p-8 shadow-2xl space-y-6 text-foreground">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-rose-500/10 text-rose-500 border border-rose-500/25 rounded-2xl flex items-center justify-center shrink-0">
              <ShieldAlert size={28} />
            </div>
            <div>
              <CardTitle className="text-xl font-extrabold text-slate-900 dark:text-white">Access Denied</CardTitle>
              <CardDescription className="text-rose-500 dark:text-rose-400 text-xs mt-0.5 font-semibold">Insufficient User Privileges</CardDescription>
            </div>
          </div>

          <p className="text-sm font-semibold text-slate-700 dark:text-foreground/70 leading-relaxed">
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
      <aside className="w-64 border-r border-white/10 bg-[#06070B]/95 backdrop-blur-2xl flex flex-col justify-between shrink-0 relative z-20 shadow-2xl">
        <div>
          {/* Header logo */}
          <div className="h-16 px-6 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-[1.5px] bg-gradient-to-tr from-cyan-500 via-blue-600 to-purple-600 rounded-lg shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                <img src="/logo.png" alt="HQ Admin Logo" className="h-7 w-7 rounded-md object-cover" />
              </div>
              <span className="font-black text-sm tracking-tight text-white flex items-center gap-1.5">
                SUPER ADMIN <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent text-[9px] font-black uppercase">CORE</span>
              </span>
            </div>
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-lg border border-white/10 hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
            >
              {isDarkMode ? <Sun size={14} /> : <Moon size={14} />}
            </button>
          </div>

          {/* Nav list */}
          <nav className="p-4 space-y-1.5 text-left">
            <div className="text-[9px] font-black text-cyan-400/80 uppercase tracking-widest px-3 mb-2 flex items-center justify-between">
              <span>ADMIN CONTROL</span>
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping" />
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.15)] font-black'
                      : 'text-slate-400 border border-transparent hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Icon size={16} strokeWidth={isActive ? 2.5 : 2} className={isActive ? 'text-cyan-400' : ''} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer profile info */}
        <div className="p-4 border-t border-slate-200 dark:border-card-border bg-slate-50/50 dark:bg-card-bg/20">
          <div className="flex items-center gap-3 p-2 rounded-xl border border-slate-200 dark:border-card-border bg-white dark:bg-card-bg/30 shadow-sm">
            <div className="h-8 w-8 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center font-bold text-xs uppercase shrink-0">
              {dbUser.name?.slice(0, 2) || 'AD'}
            </div>
            <div className="flex-1 min-w-0 text-left">
              <div className="text-xs font-bold text-slate-900 dark:text-white truncate">{dbUser.name}</div>
              <div className="text-[10px] text-slate-500 dark:text-foreground/50 font-mono truncate">{dbUser.email}</div>
            </div>
            <button
              onClick={logout}
              title="Logout from Admin Staff"
              className="p-1.5 text-slate-400 hover:text-rose-500 dark:text-foreground/40 dark:hover:text-rose-400 transition-colors"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content body */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative z-10 text-left">
        {/* Top Header Bar */}
        <header className="h-16 px-8 border-b border-slate-200 dark:border-card-border bg-white/50 dark:bg-card-bg/40 backdrop-blur-xl flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
              <Award className="h-3.5 w-3.5 text-blue-400" />
              <span className="truncate max-w-[240px]">
                {localStorage.getItem('hq_admin_user_rank') || 'Director-General (DG)'} {dbUser?.name || 'Umar'}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <AsadAdminVoiceButton onOpenInviteModal={() => setInviteModalOpen(true)} />
            <Button
              onClick={() => setInviteModalOpen(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-black text-xs h-9 px-4 rounded-xl shadow-md flex items-center gap-1.5"
            >
              <UserPlus className="h-4 w-4" /> Invite Admin Member
            </Button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          {children}
        </div>
      </main>

      {inviteModalOpen && (
        <InviteUserModal onClose={() => setInviteModalOpen(false)} />
      )}
    </div>
  );
}
