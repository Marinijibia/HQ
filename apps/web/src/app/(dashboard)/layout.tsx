'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/auth-context';
import { HQLogo } from '../../components/hq-logo';
import { useSidebarStore } from '@/stores/sidebarStore';
import { useCommandPaletteStore } from '@/stores/commandPaletteStore';
import { GuideModeProvider, useGuideMode } from '../../contexts/guide-mode-context';
import { GuideModeBanner } from '../../components/guide-mode-banner';
import { useTheme } from '../../contexts/theme-context';
import { Button, Card, Input } from '@hq/ui';
import {
  LayoutDashboard,
  Users,
  Calendar,
  Settings,
  CreditCard,
  Bell,
  Terminal,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  Database,
  CloudLightning,
  MessageSquare,
  BarChart3,
  Brain,
  Rocket,
  UploadCloud,
  BrainCircuit,
  Building2,
  Plug2,
  Shield,
  Lock,
  Palette,
  Activity,
  Sun,
  Moon,
  Menu,
  X,
  LogOut,
} from 'lucide-react';
import { ToastContainer } from '../../components/toast';
import { MobileBottomNav } from '../../components/mobile-bottom-nav';

interface SidebarNavItem {
  name: string;
  href: string;
  icon: React.ElementType;
}

interface SidebarNavGroup {
  label: string;
  items: SidebarNavItem[];
}

const SIDEBAR_GROUPS: SidebarNavGroup[] = [
  {
    label: 'Workspace',
    items: [
      { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { name: 'Boardroom', href: '/boardroom', icon: Users },
      { name: 'Discussions', href: '/discussions', icon: MessageSquare },
      { name: 'Missions', href: '/missions', icon: Calendar },
      { name: 'Assets', href: '/assets', icon: Database },
      { name: 'Marketplace', href: '/marketplace', icon: Rocket },
    ],
  },
  {
    label: 'Intelligence',
    items: [
      { name: 'Analytics', href: '/analytics', icon: BarChart3 },
      { name: 'Intelligence', href: '/intelligence', icon: Brain },
    ],
  },
  {
    label: 'Administration',
    items: [
      { name: 'Settings', href: '/settings', icon: Settings },
      { name: 'Billing', href: '/billing', icon: CreditCard },
      { name: 'Integrations', href: '/integrations', icon: Plug2 },
      { name: 'Trust Center', href: '/trust-center', icon: Shield },
    ],
  },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <GuideModeProvider>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </GuideModeProvider>
  );
}

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout, token } = useAuth();
  const { isOpen: isSidebarOpen, toggle: toggleSidebar } = useSidebarStore();
  const { setOpen: setCommandPaletteOpen } = useCommandPaletteStore();
  const { theme, toggleTheme } = useTheme();
  const isDarkMode = theme === 'dark';

  const [notifications, setNotifications] = React.useState<any[]>([]);
  const [showNotifications, setShowNotifications] = React.useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = React.useState(false);
  const [orgName, setOrgName] = React.useState('HQ CORPORATION');

  // Close mobile drawer on route change
  React.useEffect(() => {
    setMobileDrawerOpen(false);
  }, [pathname]);

  // Fetch live notifications
  const fetchNotifications = React.useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/notifications', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(Array.isArray(data) ? data : []);
      }
    } catch {
      /* silent */
    }
  }, [token]);

  // Fetch org name
  React.useEffect(() => {
    if (!token) return;
    fetch('/api/settings/org', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => {
        if (d?.companyName) setOrgName(d.companyName.toUpperCase());
      })
      .catch(() => {});
  }, [token]);

  React.useEffect(() => {
    if (token) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 15000);
      return () => clearInterval(interval);
    }
  }, [token, fetchNotifications]);

  const handleDismissAll = async () => {
    if (!token) return;
    try {
      await fetch('/api/notifications/dismiss-all', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications([]);
    } catch {
      setNotifications([]);
    }
  };

  const displayName = user?.email ? user.email.split('@')[0] : '';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground select-none">
        <div className="flex flex-col items-center space-y-3">
          <div className="h-8 w-8 rounded-full border-2 border-hq-cyan border-t-transparent animate-spin" />
          <p className="text-xs text-foreground/50 font-semibold">Verifying Boardroom Credentials...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background text-foreground">
      {/* Top Ambient Ambient Gradient Glow Line */}
      <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-cyan-500 via-blue-600 via-purple-600 to-emerald-500 z-50" />

      {/* Top Banner / Luxury Executive Navigation Header */}
      <header className="relative z-40 flex h-16 items-center justify-between border-b border-slate-200/80 dark:border-white/10 px-4 sm:px-8 bg-white/85 dark:bg-[#070709]/85 backdrop-blur-3xl transition-all duration-300 shadow-[0_4px_30px_rgba(0,0,0,0.03)]">
        <div className="flex items-center space-x-3 sm:space-x-5">
          {/* Mobile Drawer Hamburger Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
            className="md:hidden h-9 w-9 rounded-xl border border-slate-200 dark:border-white/10 text-foreground/70 hover:text-foreground hover:bg-slate-100 dark:hover:bg-white/5"
            aria-label="Toggle Mobile Navigation"
          >
            {mobileDrawerOpen ? <X className="h-5 w-5 text-cyan-500" /> : <Menu className="h-5 w-5" />}
          </Button>

          {/* Logo & Brand Capsule */}
          <Link href="/dashboard" className="flex items-center space-x-2.5 group transition-transform hover:scale-[1.02]">
            <HQLogo size={28} />
            <div className="flex flex-col text-left">
              <span className="font-black tracking-tight text-foreground text-lg leading-none select-none">
                HQ<span className="text-cyan-500 animate-pulse font-black">.</span>
              </span>
              <span className="text-[9px] font-black uppercase tracking-widest text-cyan-600 dark:text-cyan-400 hidden sm:inline">
                COMMAND CENTER
              </span>
            </div>
          </Link>

          <span className="hidden sm:inline-block text-foreground/20 font-light select-none text-lg">|</span>

          {/* Organization Live Status Capsule */}
          <div className="hidden sm:flex items-center space-x-2 text-xs uppercase tracking-wider font-extrabold bg-slate-100/80 dark:bg-white/[0.05] border border-slate-200/80 dark:border-white/10 rounded-full px-3.5 py-1 text-foreground/85 select-none shadow-sm hover:border-cyan-500/40 transition-colors">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
            <span className="truncate max-w-[140px] sm:max-w-[200px] text-slate-800 dark:text-foreground">{orgName}</span>
          </div>
        </div>

        {/* Center Quick-Action & Command Search Trigger */}
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="hidden lg:flex items-center gap-3 px-4 py-1.5 rounded-full bg-slate-100/80 dark:bg-white/[0.05] border border-slate-200/80 dark:border-white/10 text-xs text-foreground/50 hover:border-cyan-500/40 hover:text-foreground transition-all duration-200 shadow-inner group"
        >
          <span className="h-2 w-2 rounded-full bg-cyan-500 animate-ping" />
          <span className="font-semibold text-slate-600 dark:text-foreground/60">Search executive commands or modules...</span>
          <kbd className="px-2 py-0.5 rounded-md bg-white dark:bg-black/60 border border-slate-200 dark:border-white/10 text-[10px] font-mono font-bold text-foreground/70 shadow-sm group-hover:border-cyan-500/40">
            ⌘K
          </kbd>
        </button>

        {/* Right Action Suite */}
        <div className="flex items-center space-x-3 sm:space-x-4 relative">
          {/* Live AI Deliberation Radar Pill */}
          <div className="hidden xl:flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-[10px] font-black text-cyan-600 dark:text-cyan-400 uppercase tracking-widest shadow-sm">
            <span className="h-2 w-2 rounded-full bg-cyan-500 animate-pulse shadow-[0_0_6px_#06b6d4]" />
            <span>AI BOARD ACTIVE</span>
          </div>

          {/* Theme Toggle Capsule */}
          <div className="p-[1px] bg-slate-100 dark:bg-white/[0.05] rounded-full border border-slate-200 dark:border-white/10 flex items-center shadow-sm">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="h-8 w-8 rounded-full text-foreground/60 hover:text-foreground hover:bg-slate-200/50 dark:hover:bg-white/[0.1] transition-all duration-200"
              aria-label="Toggle Theme"
            >
              {isDarkMode ? (
                <Sun className="h-4 w-4 text-amber-400 transition-transform hover:rotate-45" />
              ) : (
                <Moon className="h-4 w-4 text-indigo-500 transition-transform hover:-rotate-12" />
              )}
            </Button>
          </div>

          {/* Notifications Bell */}
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-xl text-foreground/70 hover:text-foreground border border-slate-200/80 dark:border-white/10 hover:border-cyan-500/40 relative transition-all duration-200 bg-slate-100/50 dark:bg-white/[0.03]"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell className="h-4 w-4 text-foreground/80" />
            {Array.isArray(notifications) && notifications.filter((n) => !n.read).length > 0 && (
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-purple-500 animate-ping" />
            )}
            {Array.isArray(notifications) && notifications.filter((n) => !n.read).length > 0 && (
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-purple-500 shadow-[0_0_6px_#a855f7]" />
            )}
          </Button>

          {showNotifications && (
            <Card className="absolute right-0 top-12 z-50 w-72 sm:w-80 p-5 border border-slate-200 dark:border-card-border bg-white/95 dark:bg-black/95 backdrop-blur-xl shadow-2xl rounded-2xl animate-in fade-in slide-in-from-top-2 duration-300 text-left">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-card-border/80">
                <span className="font-extrabold text-xs uppercase tracking-wider text-slate-900 dark:text-foreground">Notifications Feed</span>
                <button onClick={handleDismissAll} className="text-xs text-cyan-600 dark:text-hq-cyan hover:underline font-bold">
                  Dismiss All
                </button>
              </div>
              <div className="mt-3 space-y-3.5 max-h-64 overflow-y-auto custom-scrollbar">
                {!Array.isArray(notifications) || notifications.length === 0 ? (
                  <p className="text-xs text-foreground/50 py-6 text-center font-medium">No active alerts.</p>
                ) : (
                  notifications.slice(0, 4).map((n) => (
                    <div key={n.id} className="text-xs space-y-1.5 py-1.5 border-b border-slate-100 dark:border-card-border/50 last:border-0 text-left">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-900 dark:text-foreground/90">{n.title}</span>
                        <span className="text-[10px] text-slate-400 dark:text-foreground/45">
                          {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-slate-600 dark:text-foreground/60 text-xs leading-relaxed font-medium">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
              <div className="pt-3.5 mt-2 border-t border-slate-100 dark:border-card-border/80 text-center">
                <Link
                  href="/notifications"
                  onClick={() => setShowNotifications(false)}
                  className="text-xs text-cyan-600 dark:text-hq-cyan hover:text-cyan-500 font-extrabold uppercase tracking-wider"
                >
                  Open Executive Inbox
                </Link>
              </div>
            </Card>
          )}

          {/* User Profile & Sign Out Capsule */}
          <div className="flex items-center space-x-3 select-none sm:pl-3 sm:border-l sm:border-slate-200 sm:dark:border-card-border">
            <div className="flex items-center space-x-2.5">
              <div className="relative p-[2px] bg-gradient-to-tr from-cyan-400 via-blue-500 to-purple-600 rounded-full shadow-[0_0_20px_rgba(6,182,212,0.35)] transition-all hover:scale-105">
                <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-white dark:bg-[#0A0B10] flex items-center justify-center font-black text-slate-900 dark:text-white text-xs sm:text-sm uppercase tracking-wider">
                  {displayName ? displayName.slice(0, 2).toUpperCase() : (user?.email?.slice(0, 2).toUpperCase() ?? 'HQ')}
                </div>
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-[#0A0B10] shadow-[0_0_6px_#10b981]" />
              </div>
              <div className="hidden md:block text-left">
                <p className="text-xs font-black leading-tight text-slate-900 dark:text-foreground">{displayName || user?.email?.split('@')[0] || 'Executive'}</p>
                <p className="text-[10px] text-cyan-600 dark:text-cyan-400 uppercase tracking-widest font-extrabold mt-0.5">Workspace Owner</p>
              </div>
            </div>

            <Button
              variant="ghost"
              className="hidden sm:flex text-slate-500 dark:text-foreground/45 hover:text-red-500 dark:hover:text-red-400 text-[10px] sm:text-[11px] uppercase tracking-widest px-2.5 sm:px-3 h-8 sm:h-9 font-black border border-slate-200 dark:border-card-border hover:border-red-500/30 transition-all duration-200 hover:bg-red-500/10 rounded-xl"
              onClick={async () => {
                await logout();
                router.push('/login');
              }}
            >
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Workspace Frame */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Desktop Left Navigation Sidebar — Responsive (`hidden md:flex`) */}
        <aside
          className={`hidden md:flex flex-col border-r border-card-border bg-white/80 dark:bg-[#070709]/80 backdrop-blur-xl transition-all duration-300 ${
            isSidebarOpen ? 'w-64' : 'w-[60px]'
          }`}
        >
          <div className="flex-1 py-5 px-2.5 overflow-y-auto space-y-5 custom-scrollbar">
            {SIDEBAR_GROUPS.map((group) => (
              <div key={group.label}>
                {isSidebarOpen && (
                  <div className="flex items-center space-x-2 px-2 mb-2">
                    <div className="h-px flex-1 bg-card-border" />
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-foreground/40">
                      {group.label}
                    </p>
                    <div className="h-px flex-1 bg-card-border" />
                  </div>
                )}
                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        title={!isSidebarOpen ? item.name : undefined}
                        className={`group relative flex items-center rounded-xl px-3 py-2.5 text-xs font-bold transition-all duration-200 ${
                          isActive
                            ? 'bg-cyan-500/15 border border-cyan-500/30 text-cyan-600 dark:text-cyan-300 shadow-sm'
                            : 'border border-transparent hover:bg-black/[0.04] dark:hover:bg-white/[0.04] text-foreground/60 hover:text-foreground'
                        } ${isSidebarOpen ? 'space-x-3' : 'justify-center'}`}
                      >
                        {isActive && (
                          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-full bg-cyan-500 shadow-[0_0_8px_#06b6d4]" />
                        )}
                        <Icon className={`h-4 w-4 shrink-0 transition-colors ${isActive ? 'text-cyan-500' : 'text-foreground/45 group-hover:text-foreground/80'}`} />
                        {isSidebarOpen && <span className="leading-none">{item.name}</span>}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 border-t border-card-border/60 flex items-center justify-center">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-full text-foreground/45 hover:text-foreground hover:bg-black/[0.05] dark:hover:bg-white/[0.05] transition-all duration-200"
              onClick={toggleSidebar}
            >
              {isSidebarOpen ? <ChevronLeft className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
            </Button>
          </div>
        </aside>

        {/* Mobile Slide-Out Drawer Navigation Overlay */}
        {mobileDrawerOpen && (
          <div className="fixed inset-0 z-40 md:hidden flex animate-in fade-in duration-200">
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setMobileDrawerOpen(false)}
            />
            <div className="relative w-72 max-w-[80vw] bg-white dark:bg-[#070709] border-r border-card-border h-full flex flex-col p-5 shadow-2xl z-50 space-y-6 text-left">
              <div className="flex items-center justify-between pb-4 border-b border-card-border">
                <div className="flex items-center space-x-2">
                  <HQLogo size={24} />
                  <span className="font-extrabold text-base text-foreground">HQ Command Center</span>
                </div>
                <button onClick={() => setMobileDrawerOpen(false)} className="p-1 text-foreground/40 hover:text-foreground">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-6 custom-scrollbar">
                {SIDEBAR_GROUPS.map((group) => (
                  <div key={group.label} className="space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-foreground/40 px-2">
                      {group.label}
                    </p>
                    <div className="space-y-1">
                      {group.items.map((item) => {
                        const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                        const Icon = item.icon;
                        return (
                          <Link
                            key={item.name}
                            href={item.href}
                            onClick={() => setMobileDrawerOpen(false)}
                            className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-extrabold transition-all ${
                              isActive
                                ? 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-300 border border-cyan-500/30'
                                : 'text-foreground/70 hover:bg-black/[0.04] dark:hover:bg-white/[0.04]'
                            }`}
                          >
                            <Icon className={`h-4 w-4 ${isActive ? 'text-cyan-500' : 'text-foreground/50'}`} />
                            <span>{item.name}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-card-border space-y-3">
                <div className="flex items-center justify-between text-xs text-foreground/60 px-1 font-semibold">
                  <span>{displayName}</span>
                  <span className="text-[10px] text-cyan-500 uppercase tracking-wider font-extrabold">Owner</span>
                </div>
                <Button
                  onClick={async () => {
                    await logout();
                    router.push('/login');
                  }}
                  className="w-full h-9 bg-red-500/10 hover:bg-red-500/20 text-red-500 font-bold text-xs rounded-xl flex items-center justify-center gap-2 border border-red-500/20"
                >
                  <LogOut className="h-3.5 w-3.5" /> Sign Out
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Content Workspace Panel */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-20 md:pb-8 relative animate-in fade-in slide-in-from-bottom-2 duration-300 custom-scrollbar">
          {children}
        </main>
      </div>

      {/* Global Status Bar — Premium Ticker */}
      <footer className="hidden sm:flex h-7 items-center justify-between border-t border-card-border/60 px-4 sm:px-8 bg-white/80 dark:bg-[#070709]/80 backdrop-blur-xl text-[10px] sm:text-xs text-foreground/40 select-none font-mono tracking-wide">
        <div className="flex items-center space-x-3">
          <span className="flex items-center space-x-1.5 text-emerald-500 font-bold">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
            <span>WS CONNECTED</span>
          </span>
          <span>&bull;</span>
          <span className="flex items-center space-x-1.5 text-cyan-500 font-bold">
            <CloudLightning className="h-3 w-3" />
            <span>AI GATEWAY ACTIVE</span>
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <span className="font-semibold text-foreground/60 uppercase tracking-widest">Standard Ops</span>
          <span>&bull;</span>
          <span>v1.0.0</span>
        </div>
      </footer>

      {/* Dedicated Mobile Bottom Navigation Bar */}
      <MobileBottomNav />
      <ToastContainer />
    </div>
  );
}
