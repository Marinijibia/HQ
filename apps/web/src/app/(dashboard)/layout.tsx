'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/auth-context';
import { useSidebarStore } from '@/stores/sidebarStore';
import { useCommandPaletteStore } from '@/stores/commandPaletteStore';
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
} from 'lucide-react';

interface SidebarNavItem {
  name: string;
  href: string;
  icon: React.ElementType;
}

const navItems: SidebarNavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Boardroom', href: '/boardroom', icon: Users },
  { name: 'Discussions', href: '/discussions', icon: MessageSquare },
  { name: 'Missions', href: '/missions', icon: Calendar },
  { name: 'Assets & Library', href: '/assets', icon: Database },
  { name: 'Settings', href: '/settings', icon: Settings },
  { name: 'Billing', href: '/billing', icon: CreditCard },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
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
  const isConnected = true;
  const [showNotifications, setShowNotifications] = React.useState(false);
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
      <header className="relative z-50 flex h-14 items-center justify-between border-b border-hq-graphite/40 px-6 bg-hq-graphite/10 backdrop-blur-md">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="h-6 w-6 rounded-md bg-gradient-to-tr from-hq-blue to-hq-purple flex items-center justify-center font-bold text-white text-xs select-none">
              HQ
            </div>
            <span className="font-bold tracking-tight text-white select-none">HQ</span>
          </div>
          <span className="text-foreground/40 font-light select-none">|</span>
          <div className="flex items-center space-x-2 text-sm bg-hq-graphite/50 border border-hq-graphite/30 rounded-md px-2 py-0.5 select-none text-foreground/80">
            <span className="h-2 w-2 rounded-full bg-hq-cyan animate-pulse"></span>
            <span>HQ Corporation</span>
          </div>
        </div>

        <div className="flex items-center space-x-4 relative">
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell className="h-4 w-4" />
            {notifications.filter((n) => !n.read).length > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-hq-purple text-[9px] font-bold text-white flex items-center justify-center">
                {notifications.filter((n) => !n.read).length}
              </span>
            )}
          </Button>

          {showNotifications && (
            <Card className="absolute right-0 top-12 z-50 w-80 p-4 border border-hq-graphite/40 bg-hq-graphite/95 shadow-level-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-2 border-b border-hq-graphite/40">
                <span className="font-bold text-xs text-white">Notifications Feed</span>
                <button
                  onClick={handleDismissAll}
                  className="text-xs text-foreground/50 hover:text-foreground font-semibold"
                >
                  Dismiss All
                </button>
              </div>
              <div className="mt-3 space-y-3">
                {notifications.length === 0 ? (
                  <p className="text-xs text-foreground/50 py-4 text-center">No active alerts.</p>
                ) : (
                  notifications.slice(0, 4).map((n) => (
                    <div
                      key={n.id}
                      className="text-xs space-y-1 py-1 border-b border-hq-graphite/20 last:border-0 text-left"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-white">{n.title}</span>
                        <span className="text-[9px] text-foreground/45">
                          {new Date(n.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <p className="text-foreground/75 leading-tight">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
              <div className="pt-2.5 mt-2 border-t border-hq-graphite/45 text-center">
                <Link
                  href="/notifications"
                  onClick={() => setShowNotifications(false)}
                  className="text-[10px] text-hq-cyan hover:text-hq-cyan/85 font-extrabold"
                >
                  Open Executive Inbox
                </Link>
              </div>
            </Card>
          )}
          <div className="flex items-center space-x-3 select-none">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-full bg-hq-blue/20 border border-hq-blue/40 flex items-center justify-center font-bold text-hq-blue text-xs uppercase">
                ED
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-semibold leading-tight">Elena Rostova</p>
                <p className="text-[10px] text-foreground/55 leading-none">CEO & Owner</p>
              </div>
            </div>
            <Button
              variant="ghost"
              className="text-red-400 hover:text-red-500 text-[10px] px-2.5 h-8 font-bold border border-red-500/10 hover:border-red-500/30 transition-all bg-red-500/5 hover:bg-red-500/10 rounded-md"
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
          className={`flex flex-col border-r border-hq-graphite/40 bg-hq-graphite/20 transition-all duration-300 ${
            isSidebarOpen ? 'w-64' : 'w-16'
          }`}
        >
          <div className="flex-1 space-y-1 py-4 px-3">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-hq-blue/10 border border-hq-blue/20 text-hq-blue'
                      : 'border border-transparent hover:bg-hq-graphite/10 text-foreground/70 hover:text-foreground'
                  } ${isSidebarOpen ? 'space-x-3' : 'justify-center'}`}
                >
                  <Icon className="h-4 w-4" />
                  {isSidebarOpen && <span>{item.name}</span>}
                </Link>
              );
            })}
          </div>

          <div className="p-3 border-t border-hq-graphite/40 flex items-center justify-center">
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
        <main className="flex-1 overflow-y-auto p-8 relative animate-in fade-in slide-in-from-bottom-2 duration-300">
          {children}
        </main>
      </div>

      {/* Global Status Bar */}
      <footer className="flex h-8 items-center justify-between border-t border-hq-graphite/40 px-6 bg-hq-graphite/25 backdrop-blur-md text-[11px] text-foreground/55 select-none">
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
            className="w-full max-w-lg border border-hq-graphite/40 bg-hq-graphite/95 shadow-level-5 overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-hq-graphite/40">
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
                  action: () => {
                    router.push('/dashboard');
                    setPaletteOpen(false);
                  },
                },
                {
                  name: 'Go to Boardroom',
                  action: () => {
                    router.push('/boardroom');
                    setPaletteOpen(false);
                  },
                },
                {
                  name: 'Go to Missions',
                  action: () => {
                    router.push('/missions');
                    setPaletteOpen(false);
                  },
                },
                {
                  name: 'Go to Settings',
                  action: () => {
                    router.push('/settings');
                    setPaletteOpen(false);
                  },
                },
                {
                  name: 'Go to Billing',
                  action: () => {
                    router.push('/billing');
                    setPaletteOpen(false);
                  },
                },
                {
                  name: 'Toggle Sidebar',
                  action: () => {
                    toggleSidebar();
                    setPaletteOpen(false);
                  },
                },
              ]
                .filter((cmd) => cmd.name.toLowerCase().includes(search.toLowerCase()))
                .map((cmd, idx) => (
                  <button
                    key={idx}
                    onClick={cmd.action}
                    className="w-full text-left rounded-md px-3 py-2.5 text-xs text-foreground/80 hover:bg-hq-blue/10 hover:text-white hover:border border border-transparent hover:border-hq-blue/20 transition-all font-medium flex items-center justify-between"
                  >
                    <span>{cmd.name}</span>
                    <span className="text-[9px] text-foreground/45 bg-hq-graphite/40 px-1.5 py-0.5 rounded">
                      Action
                    </span>
                  </button>
                ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
