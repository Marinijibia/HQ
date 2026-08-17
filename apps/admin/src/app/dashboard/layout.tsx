'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/auth-context';
import { useTheme } from '../../contexts/theme-context';
import { AsadVoiceCommand } from '../../components/asad-voice-command';
import { Card, CardTitle, CardDescription, Button } from '@hq/ui';
import {
  Activity,
  Shield,
  Terminal,
  Palette,
  LogOut,
  ShieldAlert,
  ArrowLeft,
  ArrowRight,
  Sun,
  Moon,
  Building2,
  Building,
  UserPlus,
  Award,
  DollarSign,
  X,
  Menu,
  Bell,
  Search,
  CheckCircle2,
  ChevronRight,
  Radio,
} from 'lucide-react';
import { AsadAdminVoiceButton } from '../../components/voice/asad-admin-voice-button';
import { InviteUserModal } from '../../components/invite-user-modal';
import { AdminCommandPalette } from '../../components/admin-command-palette';

interface NavSection {
  title: string;
  items: {
    name: string;
    href: string;
    icon: React.ElementType;
    badge?: string;
  }[];
}

const navSections: NavSection[] = [
  {
    title: 'CORE OPERATIONS',
    items: [
      { name: 'Operations Center', href: '/dashboard', icon: Activity, badge: 'HUD' },
      { name: 'Organization Management', href: '/dashboard/organizations', icon: Building2 },
      { name: 'Admin Staff & Invites', href: '/dashboard/staff', icon: UserPlus },
      { name: 'Telemetry & Alerts', href: '/dashboard/notifications', icon: Bell },
    ],
  },
  {
    title: 'AI EXECUTIVE CMS',
    items: [
      { name: 'AI Training CMS', href: '/dashboard/cms', icon: Building, badge: '5 CORE' },
      { name: 'White-Labeling', href: '/dashboard/white-label', icon: Palette },
    ],
  },
  {
    title: 'TREASURY & AUDIT',
    items: [
      { name: 'Billing & Treasury', href: '/dashboard/billing', icon: DollarSign },
      { name: 'Governance & Policies', href: '/dashboard/compliance', icon: Shield },
      { name: 'Kernel Execution Logs', href: '/dashboard/execution-log', icon: Terminal },
    ],
  },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { dbUser, loading, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const [inviteModalOpen, setInviteModalOpen] = React.useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [showAdminNotifs, setShowAdminNotifs] = React.useState(false);

  // Global Keyboard Shortcut for Command Palette (⌘K or Ctrl+K)
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  React.useEffect(() => {
    if (!loading && !dbUser) {
      router.push('/login');
    }
  }, [dbUser, loading, router]);

  // Compute breadcrumb title
  const currentNav = navSections
    .flatMap((s) => s.items)
    .find((item) => item.href === pathname);
  const currentTitle = currentNav ? currentNav.name : 'Operations Center';

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background text-foreground">
        <div className="relative flex flex-col items-center justify-center gap-4">
          <div className="relative flex items-center justify-center">
            <div className="h-16 w-16 animate-spin rounded-full border-4 border-cyan-500/30 border-t-cyan-500" />
            <div
              className="absolute h-24 w-24 animate-spin rounded-full border border-purple-500/20 border-t-purple-500/60"
              style={{ animationDuration: '3s', animationDirection: 'reverse' }}
            />
          </div>
          <span className="text-xs font-black text-cyan-600 dark:text-cyan-400 tracking-widest uppercase animate-pulse">
            INITIALIZING SUPER-ADMIN KERNEL
          </span>
        </div>
      </div>
    );
  }

  const hasAccess =
    dbUser &&
    (dbUser.role === 'SUPER_ADMINISTRATOR' || dbUser.role === 'ADMINISTRATOR');

  if (!hasAccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6 text-left relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#1e1e24_1px,transparent_1px)] [background-size:16px_16px] opacity-10 dark:opacity-20 pointer-events-none" />
        <Card className="max-w-md w-full border border-rose-500/20 bg-card-bg/60 backdrop-blur-xl rounded-[2rem] p-8 shadow-2xl space-y-6 text-foreground">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-rose-500/10 text-rose-500 border border-rose-500/25 rounded-2xl flex items-center justify-center shrink-0">
              <ShieldAlert size={28} />
            </div>
            <div>
              <CardTitle className="text-xl font-extrabold text-slate-900 dark:text-white">
                Access Denied
              </CardTitle>
              <CardDescription className="text-rose-500 dark:text-rose-400 text-xs mt-0.5 font-semibold">
                Insufficient User Privileges
              </CardDescription>
            </div>
          </div>

          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 leading-relaxed">
            The platform operations and kernel logs dashboard are restricted to designated system administrators. Contact your organization super administrator if you require a role elevate invite.
          </p>

          <div className="flex gap-4 pt-2">
            <a href="https://hq.netify.ng/dashboard" className="w-full">
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
      {/* Dynamic Ambient Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-cyan-500/5 dark:bg-cyan-600/[0.03] rounded-full blur-[140px] pointer-events-none -z-10 animate-pulse duration-[10000ms]" />
      <div className="absolute top-[40%] right-[-10%] w-[600px] h-[600px] bg-purple-500/5 dark:bg-purple-600/[0.03] rounded-full blur-[140px] pointer-events-none -z-10 animate-pulse duration-[8000ms]" />

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 border-r border-slate-200/80 dark:border-white/[0.08] bg-white/80 dark:bg-[#06080D]/90 backdrop-blur-2xl flex-col justify-between shrink-0 relative z-20 shadow-xl">
        <div className="flex flex-col h-full overflow-hidden">
          {/* Header logo & System Pulse */}
          <div className="h-16 px-5 border-b border-slate-200/80 dark:border-white/[0.08] flex items-center justify-between shrink-0">
            <Link href="/dashboard" className="flex items-center gap-2.5 group">
              <div className="p-1 bg-gradient-to-tr from-cyan-500 via-blue-600 to-purple-600 rounded-xl shadow-[0_0_15px_rgba(6,182,212,0.35)] group-hover:scale-105 transition-transform">
                <img src="/logo.png" alt="HQ Admin Logo" className="h-6 w-6 rounded-lg object-cover" />
              </div>
              <div className="flex flex-col">
                <span className="font-black text-xs tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
                  HQ SUPER ADMIN
                </span>
                <span className="text-[9px] font-mono font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-widest flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping" />
                  CORE CLUSTER
                </span>
              </div>
            </Link>
            <button
              onClick={toggleTheme}
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className="p-2 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              {isDarkMode ? <Sun size={14} /> : <Moon size={14} />}
            </button>
          </div>

          {/* Quick Search Shortcut Button */}
          <div className="p-3 border-b border-slate-200/60 dark:border-white/[0.05] shrink-0">
            <button
              onClick={() => setCommandPaletteOpen(true)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-slate-100/70 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/[0.08] text-slate-500 dark:text-slate-400 hover:border-cyan-500/40 hover:text-slate-900 dark:hover:text-white transition-all text-xs font-semibold"
            >
              <div className="flex items-center gap-2">
                <Search size={13} className="text-cyan-500" />
                <span>Command menu...</span>
              </div>
              <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 text-[9px] font-mono text-slate-400 dark:text-slate-300 shadow-2xs">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* Categorized Nav List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-5 text-left">
            {navSections.map((section, sIdx) => (
              <div key={sIdx} className="space-y-1">
                <div className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-3 mb-1">
                  {section.title}
                </div>
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all relative group ${
                        isActive
                          ? 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-300 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.12)] font-black'
                          : 'text-slate-600 dark:text-slate-400 border border-transparent hover:bg-slate-100/80 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Icon
                          size={15}
                          strokeWidth={isActive ? 2.5 : 2}
                          className={`shrink-0 ${
                            isActive
                              ? 'text-cyan-500 dark:text-cyan-400'
                              : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300'
                          }`}
                        />
                        <span className="truncate">{item.name}</span>
                      </div>
                      {item.badge && (
                        <span
                          className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded-md border ${
                            isActive
                              ? 'bg-cyan-500/20 text-cyan-600 dark:text-cyan-300 border-cyan-500/30'
                              : 'bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-white/5'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Footer User Info & Logout */}
          <div className="p-3 border-t border-slate-200/80 dark:border-white/[0.08] bg-slate-50/60 dark:bg-white/[0.02] shrink-0">
            <div className="flex items-center gap-2.5 p-2 rounded-xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-white/[0.03] shadow-xs">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-purple-600 text-white flex items-center justify-center font-bold text-xs uppercase shrink-0 shadow-xs">
                {dbUser.name?.slice(0, 2) || 'AD'}
              </div>
              <div className="flex-1 min-w-0 text-left">
                <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {dbUser.name}
                </div>
                <div className="text-[10px] text-cyan-600 dark:text-cyan-400 font-mono font-bold truncate">
                  {localStorage.getItem('hq_admin_user_rank') || 'Super Administrator'}
                </div>
              </div>
              <button
                onClick={logout}
                title="Logout from Admin Staff"
                className="p-1.5 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors rounded-lg hover:bg-rose-500/10"
              >
                <LogOut size={14} />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="relative w-80 max-w-[85vw] bg-white dark:bg-[#06080D] border-r border-slate-200 dark:border-white/10 flex flex-col justify-between p-4 z-50 text-left shadow-2xl animate-in slide-in-from-left duration-200">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-white/10 mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-1 bg-gradient-to-tr from-cyan-500 to-purple-600 rounded-lg">
                    <img src="/logo.png" alt="HQ Logo" className="h-6 w-6 rounded" />
                  </div>
                  <span className="font-black text-xs text-slate-900 dark:text-white tracking-tight">
                    SUPER ADMIN CORE
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleTheme}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400"
                  >
                    {isDarkMode ? <Sun size={14} /> : <Moon size={14} />}
                  </button>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-slate-500 dark:text-slate-400 p-1"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {navSections.map((section, sIdx) => (
                  <div key={sIdx} className="space-y-1">
                    <div className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-3">
                      {section.title}
                    </div>
                    {section.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = pathname === item.href;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                            isActive
                              ? 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-300 border border-cyan-500/30 font-black'
                              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <Icon size={16} />
                            <span>{item.name}</span>
                          </div>
                          {item.badge && (
                            <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded bg-white/5 border border-white/10">
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            {/* Mobile Footer */}
            <div className="pt-4 border-t border-slate-200 dark:border-white/10 space-y-3">
              <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-100 dark:bg-white/5">
                <div className="h-8 w-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-xs">
                  {dbUser.name?.slice(0, 2) || 'AD'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {dbUser.name}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                    {dbUser.email}
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-rose-500"
                >
                  <LogOut size={14} />
                </button>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* Main content body */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative z-10 text-left">
        {/* Top Header Command Bar */}
        <header className="h-16 px-4 sm:px-8 border-b border-slate-200/80 dark:border-white/[0.08] bg-white/70 dark:bg-[#06080D]/70 backdrop-blur-xl flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open mobile navigation menu"
              className="md:hidden p-2 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
            >
              <Menu size={18} />
            </button>

            {/* Breadcrumb Navigation Trail */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400 dark:text-slate-500 font-semibold hidden sm:inline">
                Super Admin
              </span>
              <ChevronRight size={12} className="text-slate-400 dark:text-slate-600 hidden sm:inline" />
              <div className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-600 dark:text-cyan-300 font-black tracking-wide flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-500 animate-ping" />
                <span className="truncate max-w-[160px] sm:max-w-[280px]">
                  {currentTitle}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Live Telemetry Ping indicator */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
              <Radio size={12} className="animate-pulse text-emerald-500" />
              <span>EU-WEST-1 (24ms)</span>
            </div>

            {/* Quick Command Palette Button */}
            <button
              onClick={() => setCommandPaletteOpen(true)}
              title="Open Command Palette (⌘K)"
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:border-cyan-500/40 hover:text-slate-900 dark:hover:text-white transition-all text-xs font-semibold"
            >
              <Search size={13} className="text-cyan-500" />
              <span className="text-[11px]">Search (⌘K)</span>
            </button>

            {/* Voice Control Buttons */}
            <AsadVoiceCommand />
            <AsadAdminVoiceButton onOpenInviteModal={() => setInviteModalOpen(true)} />

            {/* Admin Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowAdminNotifs(!showAdminNotifs)}
                className="relative p-2 rounded-xl bg-slate-100/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 transition-all"
              >
                <Bell size={17} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-500 animate-ping" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-500" />
              </button>

              {showAdminNotifs && (
                <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-3xl border border-slate-200 dark:border-cyan-500/20 bg-white/95 dark:bg-[#0B0F19]/95 backdrop-blur-2xl p-5 shadow-[0_20px_60px_rgba(0,0,0,0.3)] z-50 animate-in fade-in zoom-in duration-200 text-left">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3 mb-3">
                    <div className="flex items-center gap-2">
                      <Bell size={16} className="text-cyan-500" />
                      <span className="text-xs font-black text-slate-900 dark:text-white">
                        Platform System Telemetry
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400 text-[9px] font-black">
                      LIVE STREAM
                    </span>
                  </div>

                  <div className="max-h-64 overflow-y-auto space-y-2.5 text-xs pr-1">
                    {[
                      {
                        title: 'Super-Admin Session Authenticated',
                        msg: `Active token verified for ${dbUser?.name || 'Administrator'}`,
                        time: 'Just now',
                        tag: 'SECURITY',
                      },
                      {
                        title: 'Zero Cross-Tenant Leak Verified',
                        msg: 'All registered company workspaces operating with strictly isolated schema partitioning.',
                        time: '4m ago',
                        tag: 'COMPLIANCE',
                      },
                      {
                        title: '5 Core Executives Standard Active',
                        msg: 'Asad, Teema, Legal, HR, and Mr. Intelligence synced across all organizations.',
                        time: '12m ago',
                        tag: 'AI FLEET',
                      },
                    ].map((n, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 space-y-1 hover:border-cyan-500/40 transition-colors"
                      >
                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-900 dark:text-white">
                          <span className="truncate">{n.title}</span>
                          <span className="text-[9px] text-slate-400 font-mono shrink-0 ml-2">
                            {n.time}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 dark:text-slate-300 font-normal leading-relaxed">
                          {n.msg}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200 dark:border-white/10 text-center">
                    <Link
                      href="/dashboard/notifications"
                      onClick={() => setShowAdminNotifs(false)}
                      className="text-[11px] font-bold text-cyan-600 dark:text-cyan-400 hover:underline inline-flex items-center gap-1"
                    >
                      View All Platform Telemetry Alerts <ArrowRight size={12} />
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Invite Admin Member Action */}
            <Button
              onClick={() => setInviteModalOpen(true)}
              className="bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-black text-xs h-9 px-3 sm:px-4 rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <UserPlus className="h-4 w-4" />
              <span className="hidden sm:inline">Invite Admin Member</span>
              <span className="sm:hidden">Invite</span>
            </Button>
          </div>
        </header>

        {/* Viewport page container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8">
          {children}
        </div>
      </main>

      {/* Global Modals */}
      {inviteModalOpen && (
        <InviteUserModal onClose={() => setInviteModalOpen(false)} />
      )}

      <AdminCommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onOpenInviteModal={() => setInviteModalOpen(true)}
      />
    </div>
  );
}
