'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/auth-context';
import { useSidebarStore } from '../../stores/sidebarStore';
import { useCommandPaletteStore } from '../../stores/commandPaletteStore';
import { GuideModeProvider } from '../../contexts/guide-mode-context';
import { useTheme } from '../../contexts/theme-context';
import { AsadVoiceButton } from '../../components/voice/asad-voice-button';
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  Calendar,
  Layers,
  Sparkles,
  ShoppingBag,
  FileCheck,
  Brain,
  Settings,
  CreditCard,
  Plug2,
  Shield,
  Menu,
  X,
  Bell,
  Sun,
  Moon,
  Search,
  ChevronRight,
  LogOut,
  ChevronDown,
  Lock,
  Activity,
  Bot,
  ArrowRight,
  ShieldCheck,
  FolderOpen,
} from 'lucide-react';
import { Button, Badge } from '@hq/ui';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  badge?: string;
  isAiAgent?: boolean;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    label: 'Overview',
    items: [
      { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { name: 'CEO Chat & Discussions', href: '/ceo-chat', icon: Bot, badge: 'AI C-Suite', isAiAgent: true },
      { name: 'Boardroom', href: '/boardroom', icon: Users },
      { name: 'Missions', href: '/missions', icon: Calendar },
    ],
  },
  {
    label: 'Operations & Strategy',
    items: [
      { name: 'Asset Center', href: '/assets', icon: FolderOpen, badge: 'Vault' },
      { name: 'Departments', href: '/settings?tab=organization', icon: Layers },
      { name: 'Marketplace', href: '/marketplace', icon: ShoppingBag, badge: '5 Core Active' },
      { name: 'Intelligence', href: '/intelligence', icon: Brain },
    ],
  },
  {
    label: 'Administration',
    items: [
      { name: 'Settings', href: '/settings', icon: Settings },
      { name: 'Billing & Finance', href: '/billing', icon: CreditCard, badge: 'CFO Engine' },
      { name: 'Integration Hub', href: '/integration-hub', icon: Plug2 },
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
  const [isTimedOut, setIsTimedOut] = React.useState(false);

  // Safety loading timeout - prevents screen from hanging indefinitely
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsTimedOut(true);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  // Robust login redirect: Only redirect if authentication has resolved AND no user exists
  React.useEffect(() => {
    if (!loading && !user && isTimedOut) {
      router.push('/login');
    }
  }, [loading, user, isTimedOut, router]);

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
      const interval = setInterval(() => {
        if (typeof document !== 'undefined' && document.hidden) return;
        fetchNotifications();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [token, fetchNotifications]);

  const handleDismissAll = async () => {
    if (!token) return;
    try {
      await fetch('/api/notifications/mark-all-read', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchNotifications();
    } catch {
      setNotifications([]);
    }
  };

  const displayName = user?.email ? user.email.split('@')[0] : '';

  // High-End Executive Loading Screen with Dual-Theme Light/Dark Mode Styling & Safety Timeout Bypass
  if (loading && !isTimedOut) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#070709] text-slate-900 dark:text-white select-none relative overflow-hidden transition-colors duration-300">
        {/* Background Ambient Glow */}
        <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/10 via-blue-500/5 to-purple-600/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center max-w-sm mx-auto p-8 rounded-3xl border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-slate-950/80 backdrop-blur-2xl shadow-2xl space-y-6 text-center animate-in fade-in zoom-in duration-300">
          {/* Executive Shield Icon */}
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-purple-600 p-[1.5px] shadow-[0_0_30px_rgba(6,182,212,0.4)]">
              <div className="w-full h-full bg-white dark:bg-slate-950 rounded-[14px] flex items-center justify-center text-cyan-600 dark:text-cyan-400">
                <ShieldCheck size={28} className="animate-pulse" />
              </div>
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-950 flex items-center justify-center">
              <Activity size={10} className="text-white animate-spin" />
            </div>
          </div>

          <div className="space-y-1.5">
            <h3 className="text-sm font-black text-slate-900 dark:text-white tracking-tight">
              HQ Executive Boardroom
            </h3>
            <p className="text-xs text-cyan-700 dark:text-cyan-300 font-bold tracking-wide flex items-center justify-center gap-1.5">
              <Sparkles size={12} className="animate-spin text-cyan-500" />
              Verifying Boardroom Credentials...
            </p>
          </div>

          {/* Animated Loader Bar */}
          <div className="w-full bg-slate-200 dark:bg-slate-900 rounded-full h-1.5 overflow-hidden">
            <div className="bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 h-full rounded-full w-2/3 animate-pulse" />
          </div>

          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            Authenticating C-Suite session keys & workspace intelligence...
          </p>

          <Button
            onClick={() => setIsTimedOut(true)}
            className="text-[11px] font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 px-4 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 transition-all flex items-center gap-1 shadow-sm mt-2"
          >
            Bypass Delay & Enter <ArrowRight size={12} />
          </Button>
        </div>
      </div>
    );
  }

  // Redirect to login if user is not authenticated after loading completes or times out
  if (!user && (isTimedOut || !loading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#070709] text-slate-900 dark:text-white select-none">
        <div className="flex flex-col items-center max-w-sm mx-auto p-8 rounded-3xl border border-slate-200 dark:border-white/10 bg-white/90 dark:bg-slate-950/90 backdrop-blur-2xl shadow-2xl space-y-4 text-center">
          <div className="w-12 h-12 rounded-2xl bg-cyan-100 dark:bg-cyan-500/10 border border-cyan-300 dark:border-cyan-500/30 text-cyan-600 dark:text-cyan-400 flex items-center justify-center font-bold">
            <Lock size={22} />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-black text-slate-900 dark:text-white">Authentication Required</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Please sign in to access your HQ Executive Boardroom workspace.
            </p>
          </div>
          <Link href="/login" className="w-full">
            <Button className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs py-2.5 rounded-xl shadow-lg flex items-center justify-center gap-2">
              Proceed to Sign In <ArrowRight size={14} />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background text-foreground">
      {/* Top Ambient Gradient Glow Line */}
      <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-cyan-500 via-blue-600 via-purple-600 to-emerald-500 z-50" />

      {/* Top Banner / Luxury Executive Navigation Header */}
      <header className="relative z-40 flex h-16 items-center justify-between border-b border-slate-200/80 dark:border-white/10 px-4 sm:px-8 bg-white/95 dark:bg-[#070709]/95 backdrop-blur-md transition-all duration-300 shadow-[0_4px_30px_rgba(0,0,0,0.03)]">
        <div className="flex items-center space-x-3 sm:space-x-5">
          {/* Mobile Drawer Hamburger Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
            className="md:hidden text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl"
          >
            {mobileDrawerOpen ? <X size={20} /> : <Menu size={20} />}
          </Button>

          {/* Company Brand Logo & Workspace Selector */}
          <Link href="/dashboard" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-500 to-purple-600 p-[1px] shadow-md group-hover:shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all">
                <div className="w-full h-full bg-white dark:bg-slate-950 rounded-[11px] flex items-center justify-center font-black text-sm text-slate-900 dark:text-white">
                  HQ
                </div>
              </div>
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-950 animate-pulse" />
            </div>

            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-black tracking-tight text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                {orgName}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold tracking-wider uppercase flex items-center gap-1">
                Executive Workspace <Badge variant="ai" className="text-[9px] py-0 px-1">PRO</Badge>
              </span>
            </div>
          </Link>
        </div>

        {/* Global Action Tools */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Asad Universal AI Voice Controls */}
          <AsadVoiceButton />

          {/* Global Search Command Bar Trigger */}
          <button
            onClick={() => setCommandPaletteOpen(true)}
            className="hidden md:flex items-center gap-3 px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100/80 dark:bg-white/5 hover:bg-slate-200/80 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 text-xs font-medium transition-all shadow-sm"
          >
            <Search size={14} className="text-slate-400" />
            <span>Search missions, AI directors...</span>
            <kbd className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/20 text-slate-600 dark:text-slate-300 font-semibold shadow-xs">
              ⌘K
            </kbd>
          </button>

          {/* Theme Toggle Button (Light/Dark Mode) */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl transition-all"
          >
            {isDarkMode ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} className="text-slate-700" />}
          </Button>

          {/* Live Notification Bell */}
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl transition-all"
            >
              <Bell size={18} />
              {notifications.length > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-cyan-500 dark:bg-cyan-400 animate-ping" />
              )}
              {notifications.length > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-cyan-500 dark:bg-cyan-400" />
              )}
            </Button>

            {/* Notification Popover Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl border border-slate-200 dark:border-white/10 bg-white/95 dark:bg-slate-950/95 backdrop-blur-2xl p-4 shadow-2xl z-50 animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3 mb-3">
                  <div className="flex items-center gap-2">
                    <Bell size={16} className="text-cyan-600 dark:text-cyan-400" />
                    <span className="text-xs font-bold text-slate-900 dark:text-white">Workspace Notifications</span>
                    <Badge variant="outline" className="text-[10px]">{notifications.filter(n => !n.read).length || notifications.length}</Badge>
                  </div>
                  {notifications.length > 0 && (
                    <button
                      onClick={handleDismissAll}
                      className="text-[10px] text-cyan-600 dark:text-cyan-400 hover:underline font-semibold"
                    >
                      Mark All Read
                    </button>
                  )}
                </div>

                <div className="max-h-64 overflow-y-auto space-y-2.5 text-xs pr-1">
                  {notifications.length === 0 ? (
                    <div className="text-center py-6 text-slate-400 dark:text-slate-500 text-xs font-medium">
                      No new notifications. All C-Suite directives are clear.
                    </div>
                  ) : (
                    notifications.slice(0, 5).map((n, idx) => (
                      <div
                        key={n.id || idx}
                        className={`p-2.5 rounded-xl border space-y-1 transition-all ${
                          !n.read
                            ? 'bg-cyan-500/5 dark:bg-cyan-500/10 border-cyan-500/30'
                            : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-900 dark:text-white">
                          <span className="truncate">{n.title || 'Executive Update'}</span>
                          <span className="text-[9px] text-slate-400 font-mono shrink-0 ml-2">
                            {n.createdAt ? new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 dark:text-slate-300 font-normal leading-relaxed line-clamp-2">
                          {n.message || n.description}
                        </p>
                      </div>
                    ))
                  )}
                </div>

                <div className="mt-3 pt-2 border-t border-slate-200 dark:border-white/10 text-center">
                  <Link
                    href="/notifications"
                    onClick={() => setShowNotifications(false)}
                    className="text-[11px] font-bold text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 inline-flex items-center gap-1"
                  >
                    View All Notifications Inbox <ArrowRight size={12} />
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* User Account Menu */}
          <div className="flex items-center space-x-3 pl-2 border-l border-slate-200 dark:border-white/10">
            <div className="hidden lg:flex flex-col text-right">
              <span className="text-xs font-bold text-slate-900 dark:text-white">{displayName || 'Executive'}</span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">Active Owner</span>
            </div>

            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white font-bold flex items-center justify-center text-xs shadow-md">
              {displayName ? displayName[0].toUpperCase() : 'E'}
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => logout()}
              title="Sign Out of Boardroom"
              className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-colors"
            >
              <LogOut size={16} />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Workspace Layout (Sidebar Navigation + Dynamic Page View) */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Desktop Sidebar Navigation */}
        <aside
          className={`hidden md:flex flex-col border-r border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-[#070709]/80 backdrop-blur-2xl transition-all duration-300 z-30 ${
            isSidebarOpen ? 'w-64' : 'w-20'
          }`}
        >
          <div className="flex-1 overflow-y-auto p-4 space-y-6 select-none">
            {navGroups.map((group, groupIdx) => (
              <div key={groupIdx} className="space-y-2">
                {isSidebarOpen && (
                  <div className="px-3 text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                    {group.label}
                  </div>
                )}
                <nav className="space-y-1">
                  {group.items.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;
                    return (
                      <Link key={item.href} href={item.href}>
                        <div
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-2xl transition-all text-xs font-semibold group relative ${
                            isActive
                              ? 'bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 dark:border-cyan-500/20 shadow-xs'
                              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-white/5'
                          }`}
                        >
                          <Icon
                            size={18}
                            className={`shrink-0 transition-transform group-hover:scale-110 ${
                              isActive ? 'text-cyan-600 dark:text-cyan-400' : 'text-slate-400 dark:text-slate-500'
                            }`}
                          />

                          {isSidebarOpen && (
                            <span className="truncate flex-1 font-bold">{item.name}</span>
                          )}

                          {isSidebarOpen && item.badge && (
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                              item.isAiAgent
                                ? 'bg-cyan-100 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-500/30'
                                : 'bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-300'
                            }`}>
                              {item.badge}
                            </span>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </nav>
              </div>
            ))}
          </div>

          {/* Sidebar Collapse Toggle Button */}
          <div className="p-3 border-t border-slate-200/80 dark:border-white/10">
            <button
              onClick={toggleSidebar}
              className="w-full flex items-center justify-center p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
            >
              <ChevronRight
                size={18}
                className={`transition-transform duration-300 ${isSidebarOpen ? 'rotate-180' : ''}`}
              />
            </button>
          </div>
        </aside>

        {/* Mobile Navigation Drawer Overlay */}
        {mobileDrawerOpen && (
          <div className="md:hidden fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex">
            <div className="w-72 bg-white dark:bg-slate-950 h-full p-6 flex flex-col space-y-6 shadow-2xl border-r border-slate-200 dark:border-white/10">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4">
                <div className="flex items-center gap-2 font-black text-slate-900 dark:text-white text-sm">
                  <span>👑 HQ Executive</span>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setMobileDrawerOpen(false)}>
                  <X size={18} />
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-6">
                {navGroups.map((group, groupIdx) => (
                  <div key={groupIdx} className="space-y-2">
                    <div className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                      {group.label}
                    </div>
                    <div className="space-y-1">
                      {group.items.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                          <Link key={item.href} href={item.href}>
                            <div
                              className={`flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-bold ${
                                isActive
                                  ? 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30'
                                  : 'text-slate-600 dark:text-slate-400'
                              }`}
                            >
                              <Icon size={18} />
                              <span>{item.name}</span>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex-1" onClick={() => setMobileDrawerOpen(false)} />
          </div>
        )}

        {/* Dynamic Page Container */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 relative">
          {children}
        </main>
      </div>
    </div>
  );
}
