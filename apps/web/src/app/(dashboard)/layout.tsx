'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/auth-context';
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

const navGroups: SidebarNavGroup[] = [
  {
    label: 'Workspace',
    items: [
      { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { name: 'Boardroom', href: '/boardroom', icon: BrainCircuit },
      { name: 'Teams & Clearance', href: '/teams', icon: Users },
      { name: 'Organization', href: '/organization', icon: Building2 },
      { name: 'Discussions', href: '/discussions', icon: MessageSquare },
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
      { name: 'Integrations', href: '/integration-hub', icon: Plug2 },
      { name: 'Governance & Compliance', href: '/admin/compliance', icon: Shield },
      { name: 'Trust Center', href: '/trust-center', icon: Lock },
      { name: 'White-labeling', href: '/admin/white-label', icon: Palette },
      { name: 'Operations Center', href: '/admin/operations', icon: Activity },
      { name: 'Kernel Console', href: '/admin/execution-log', icon: Terminal },
    ],
  },
];

function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout, token } = useAuth();
  const { isOpen: isSidebarOpen, toggle: toggleSidebar } = useSidebarStore();

  React.useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);
  const {
    isOpen: isPaletteOpen,
    toggle: togglePalette,
    setOpen: setPaletteOpen,
  } = useCommandPaletteStore();
  const [search, setSearch] = React.useState('');
  const { isDarkMode, toggleTheme } = useTheme();
  const isConnected = true;
  const [showNotifications, setShowNotifications] = React.useState(false);

  // Read real user display info from onboarding draft + auth
  const [displayName, setDisplayName] = React.useState('');
  const [orgName, setOrgName] = React.useState('Your Organization');

  React.useEffect(() => {
    try {
      const draft = JSON.parse(localStorage.getItem('hq_onboarding_draft') || '{}');
      if (draft.ownerName) setDisplayName(draft.ownerName);
      else if (user?.email) setDisplayName(user.email.split('@')[0]);
      if (draft.hqName || draft.orgName) setOrgName(draft.hqName || draft.orgName);
    } catch { /* ignore */ }
  }, [user]);
  interface NotificationItem {
    id: string;
    title: string;
    message: string;
    read: boolean;
    createdAt: string;
  }
  const [notifications, setNotifications] = React.useState<NotificationItem[]>([]);

  const fetchNotifications = React.useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/notifications?isArchived=false', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (e) {
      console.error('Error fetching notifications:', e);
    }
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
      const res = await fetch('/api/notifications/mark-all-read', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        fetchNotifications();
      }
    } catch (e) {
      console.error('Error marking all as read:', e);
    }
  };

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        togglePalette();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePalette]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white select-none">
        <div className="flex flex-col items-center space-y-3">
          <div className="h-8 w-8 rounded-full border-2 border-hq-cyan border-t-transparent animate-spin"></div>
          <p className="text-xs text-foreground/50">Verifying Boardroom Credentials...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background text-foreground">
      {/* Top Banner / Navigation */}
      <header className="relative z-50 flex h-16 items-center justify-between border-b border-card-border px-8 bg-white/70 dark:bg-[#070709]/75 backdrop-blur-xl transition-all duration-300 shadow-[0_2px_15px_rgba(0,0,0,0.02)]">
        <div className="flex items-center space-x-5">
          <Link href="/dashboard" className="flex items-center space-x-3 group transition-transform hover:scale-[1.02]">
            <div className="p-[1.5px] bg-gradient-to-tr from-hq-blue via-[#bf5af2] to-hq-purple rounded-xl shadow-[0_0_15px_rgba(10,132,255,0.2)]">
              <div className="h-7 w-7 rounded-[10px] bg-black flex items-center justify-center font-extrabold text-white text-xs select-none">
                HQ
              </div>
            </div>
            <span className="font-extrabold tracking-tight text-foreground text-lg select-none">
              HQ<span className="text-hq-cyan font-black animate-pulse">.</span>
            </span>
          </Link>
          <span className="text-foreground/20 font-light select-none text-lg">|</span>
          <div className="flex items-center space-x-2 text-[10px] uppercase tracking-wider font-extrabold bg-black/[0.04] dark:bg-white/[0.04] border border-card-border rounded-full px-3 py-1 text-foreground/80 select-none shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)] dark:shadow-none">
            <span className="h-1.5 w-1.5 rounded-full bg-hq-cyan animate-pulse shadow-[0_0_8px_#30D158]"></span>
            <span>{orgName}</span>
          </div>
        </div>

        <div className="flex items-center space-x-5 relative">
          {/* Theme Toggle Capsule */}
          <div className="p-[1px] bg-black/[0.05] dark:bg-white/[0.05] rounded-full border border-card-border flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="h-7 w-7 rounded-full text-foreground/60 hover:text-foreground hover:bg-black/[0.05] dark:hover:bg-white/[0.05] transition-all duration-200"
              aria-label="Toggle Theme"
            >
              {isDarkMode ? (
                <Sun className="h-3.5 w-3.5 text-amber-400" />
              ) : (
                <Moon className="h-3.5 w-3.5 text-indigo-400" />
              )}
            </Button>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full text-foreground/70 hover:text-foreground hover:bg-black/[0.05] dark:hover:bg-white/[0.05] relative transition-all duration-200"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell className="h-4 w-4" />
            {Array.isArray(notifications) && notifications.filter((n) => !n.read).length > 0 && (
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-[#bf5af2] animate-ping" />
            )}
            {Array.isArray(notifications) && notifications.filter((n) => !n.read).length > 0 && (
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-[#bf5af2] shadow-[0_0_6px_#bf5af2]" />
            )}
          </Button>

          {showNotifications && (
            <Card className="absolute right-0 top-12 z-50 w-80 p-5 border border-card-border bg-white/90 dark:bg-black/90 backdrop-blur-xl shadow-level-4 rounded-2xl animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex items-center justify-between pb-3 border-b border-card-border/80">
                <span className="font-extrabold text-[10px] uppercase tracking-wider text-foreground">Notifications Feed</span>
                <button
                  onClick={handleDismissAll}
                  className="text-[10px] text-hq-cyan hover:underline font-bold"
                >
                  Dismiss All
                </button>
              </div>
              <div className="mt-3 space-y-3.5">
                {!Array.isArray(notifications) || notifications.length === 0 ? (
                  <p className="text-xs text-foreground/50 py-6 text-center">No active alerts.</p>
                ) : (
                  notifications.slice(0, 4).map((n) => (
                    <div
                      key={n.id}
                      className="text-xs space-y-1.5 py-1.5 border-b border-card-border/50 last:border-0 text-left"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-foreground/90">{n.title}</span>
                        <span className="text-[9px] text-foreground/45">
                          {new Date(n.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <p className="text-foreground/60 text-[11px] leading-relaxed">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
              <div className="pt-3.5 mt-2 border-t border-card-border/80 text-center">
                <Link
                  href="/notifications"
                  onClick={() => setShowNotifications(false)}
                  className="text-[10px] text-hq-cyan hover:text-hq-cyan/85 font-extrabold uppercase tracking-wider"
                >
                  Open Executive Inbox
                </Link>
              </div>
            </Card>
          )}
          <div className="flex items-center space-x-4 select-none pl-2 border-l border-card-border">
            <div className="flex items-center space-x-2.5">
              <div className="p-[1.5px] bg-gradient-to-tr from-hq-blue via-[#bf5af2] to-hq-cyan rounded-full shadow-[0_0_10px_rgba(10,132,255,0.15)] transition-transform hover:scale-105">
                <div className="h-8 w-8 rounded-full bg-black flex items-center justify-center font-bold text-white text-[11px] uppercase tracking-wider">
                  {displayName ? displayName.slice(0, 2).toUpperCase() : (user?.email?.slice(0, 2).toUpperCase() ?? 'HQ')}
                </div>
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold leading-tight text-foreground">{displayName || user?.email?.split('@')[0] || 'Account'}</p>
                <p className="text-[9px] text-foreground/45 uppercase tracking-widest font-extrabold mt-0.5">Owner</p>
              </div>
            </div>
            <Button
              variant="ghost"
              className="text-foreground/45 hover:text-red-400 text-[9px] uppercase tracking-widest px-2.5 h-8 font-black border border-card-border hover:border-red-500/20 transition-all duration-200 hover:bg-red-500/5 rounded-full"
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
      <div className="flex flex-1 overflow-hidden">
        {/* Left Navigation Sidebar */}
        <aside
          className={`flex flex-col border-r border-card-border bg-black/[0.015] dark:bg-white/[0.015] transition-all duration-300 ${
            isSidebarOpen ? 'w-64' : 'w-16'
          }`}
        >
          <div className="flex-1 py-4 px-3 overflow-y-auto space-y-4">
            {navGroups.map((group) => (
              <div key={group.label}>
                {isSidebarOpen && (
                  <p className="text-[9px] font-extrabold uppercase tracking-widest text-foreground/30 px-3 mb-1.5">
                    {group.label}
                  </p>
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
                        className={`flex items-center rounded-lg px-3 py-2 text-xs font-semibold transition-all ${
                          isActive
                            ? 'bg-hq-blue/15 border border-hq-blue/25 text-hq-blue'
                            : 'border border-transparent hover:bg-black/5 dark:hover:bg-white/5 text-foreground/60 hover:text-foreground'
                        } ${isSidebarOpen ? 'space-x-3' : 'justify-center'}`}
                      >
                        <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-hq-blue' : ''}`} />
                        {isSidebarOpen && <span>{item.name}</span>}
                      </Link>
                    );
                  })}
                </div>
                {isSidebarOpen && <div className="mt-3 border-b border-card-border" />}
              </div>
            ))}
          </div>

          <div className="p-3 border-t border-card-border flex items-center justify-center">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-foreground/50 hover:text-foreground"
              onClick={toggleSidebar}
            >
              {isSidebarOpen ? (
                <ChevronLeft className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          </div>
        </aside>

        {/* Content Workspace Panel */}
        <main className="flex-1 overflow-y-auto p-8 pb-24 md:pb-8 relative animate-in fade-in slide-in-from-bottom-2 duration-300">
          {children}
        </main>
      </div>

      {/* Global Status Bar */}
      <footer className="flex h-8 items-center justify-between border-t border-card-border px-6 bg-black/[0.02] dark:bg-white/[0.02] backdrop-blur-md text-[11px] text-foreground/55 select-none">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <span
              className={`h-1.5 w-1.5 rounded-full ${isConnected ? 'bg-hq-cyan animate-pulse' : 'bg-red-500'}`}
            ></span>
            <span>WebSocket Status: {isConnected ? 'Connected' : 'Offline'}</span>
          </div>
          <span className="text-foreground/20">|</span>
          <div className="flex items-center space-x-2">
            <CloudLightning className="h-3 w-3 text-hq-blue" />
            <span>AI Gateway: Active</span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1.5 text-yellow-500/80">
            <ShieldAlert className="h-3.5 w-3.5" />
            <span className="font-semibold uppercase tracking-wider text-[9px]">
              Standard Operations
            </span>
          </div>
          <span className="text-foreground/20">|</span>
          <div className="flex items-center space-x-1 font-mono">
            <Terminal className="h-3 w-3" />
            <span>v1.0.0</span>
          </div>
        </div>
      </footer>

      {/* Global Command Palette Overlay (Cmd + K) */}
      {isPaletteOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setPaletteOpen(false)}
        >
          <Card
            className="w-full max-w-lg border border-card-border bg-card-bg shadow-level-5 overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-card-border">
              <Input
                autoFocus
                placeholder="Type a command or search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-10"
              />
            </div>
            <div className="max-h-60 overflow-y-auto p-2 space-y-1">
              {[
                {
                  name: 'Go to Dashboard',
                  icon: LayoutDashboard,
                  action: () => { router.push('/dashboard'); setPaletteOpen(false); },
                },
                {
                  name: 'Go to Boardroom',
                  icon: Users,
                  action: () => { router.push('/boardroom'); setPaletteOpen(false); },
                },
                {
                  name: 'Go to Missions',
                  icon: Calendar,
                  action: () => { router.push('/missions'); setPaletteOpen(false); },
                },
                {
                  name: 'Go to Intelligence',
                  icon: Brain,
                  action: () => { router.push('/intelligence'); setPaletteOpen(false); },
                },
                {
                  name: 'Go to Settings',
                  icon: Settings,
                  action: () => { router.push('/settings'); setPaletteOpen(false); },
                },
                {
                  name: 'Launch New Mission',
                  icon: Rocket,
                  action: () => { router.push('/missions'); setPaletteOpen(false); },
                },
                {
                  name: 'Open Asset Library',
                  icon: UploadCloud,
                  action: () => { router.push('/assets'); setPaletteOpen(false); },
                },
                {
                  name: 'Brief the Boardroom',
                  icon: BrainCircuit,
                  action: () => { router.push('/discussions'); setPaletteOpen(false); },
                },
                {
                  name: 'Toggle Sidebar',
                  icon: ChevronLeft,
                  action: () => { toggleSidebar(); setPaletteOpen(false); },
                },
              ]
                  .filter((cmd) => cmd.name.toLowerCase().includes(search.toLowerCase()))
                  .map((cmd, idx) => {
                    const CmdIcon = cmd.icon;
                    return (
                      <button
                        key={idx}
                        onClick={cmd.action}
                        className="w-full text-left rounded-lg px-3 py-2.5 text-xs text-foreground/80 hover:bg-hq-blue/10 hover:text-white border border-transparent hover:border-hq-blue/20 transition-all font-medium flex items-center gap-3"
                      >
                        <CmdIcon className="h-3.5 w-3.5 shrink-0 text-foreground/40" />
                        <span className="flex-1">{cmd.name}</span>
                        <span className="text-[9px] text-foreground/45 bg-black/10 dark:bg-white/10 px-1.5 py-0.5 rounded">↵</span>
                      </button>
                    );
                  })}
            </div>
          </Card>
        </div>
      )}

      {/* Guide Banner */}
      <GuideModeBanner />

      {/* Toast Notifications */}
      <ToastContainer />

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </div>
  );
}

export default function DashboardLayoutWrapper({ children }: { children: React.ReactNode }) {
  return (
    <GuideModeProvider>
      <DashboardLayout>{children}</DashboardLayout>
    </GuideModeProvider>
  );
}
