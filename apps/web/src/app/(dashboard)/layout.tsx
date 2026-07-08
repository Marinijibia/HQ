'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSidebarStore } from '@/stores/sidebarStore';
import { Button, Card } from '@hq/ui';
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
} from 'lucide-react';

interface SidebarNavItem {
  name: string;
  href: string;
  icon: React.ElementType;
}

const navItems: SidebarNavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Boardroom', href: '/boardroom', icon: Users },
  { name: 'Missions', href: '/missions', icon: Calendar },
  { name: 'Assets & Library', href: '/assets', icon: Database },
  { name: 'Settings', href: '/settings', icon: Settings },
  { name: 'Billing', href: '/billing', icon: CreditCard },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isOpen: isSidebarOpen, toggle: toggleSidebar } = useSidebarStore();
  const isConnected = true;
  const [showNotifications, setShowNotifications] = React.useState(false);
  const notifications = [
    {
      id: '1',
      title: 'Mission Approved',
      text: 'CEO Elena approved Petroleum Outreach strategy.',
      time: '5m ago',
    },
    {
      id: '2',
      title: 'System Security Audited',
      text: 'Jack Bauer completed zero-trust endpoint checks.',
      time: '20m ago',
    },
    {
      id: '3',
      title: 'Invoice Paid',
      text: 'Growth tier renewal verified successfully.',
      time: '1h ago',
    },
  ];

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background text-foreground">
      {/* Top Banner / Navigation */}
      <header className="flex h-14 items-center justify-between border-b border-hq-graphite/40 px-6 bg-hq-graphite/10 backdrop-blur-md">
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
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-hq-purple"></span>
          </Button>

          {showNotifications && (
            <Card className="absolute right-0 top-12 z-50 w-80 p-4 border border-hq-graphite/40 bg-hq-graphite/95 shadow-level-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-2 border-b border-hq-graphite/40">
                <span className="font-bold text-xs text-white">Notifications Feed</span>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-xs text-foreground/50 hover:text-foreground"
                >
                  Dismiss All
                </button>
              </div>
              <div className="mt-3 space-y-3">
                {notifications.map((n) => (
                  <div key={n.id} className="text-xs space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-foreground">{n.title}</span>
                      <span className="text-[9px] text-foreground/45">{n.time}</span>
                    </div>
                    <p className="text-foreground/60 leading-tight">{n.text}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}
          <div className="flex items-center space-x-2 select-none">
            <div className="h-8 w-8 rounded-full bg-hq-blue/20 border border-hq-blue/40 flex items-center justify-center font-bold text-hq-blue text-xs uppercase">
              ED
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold leading-tight">Elena Rostova</p>
              <p className="text-[10px] text-foreground/55 leading-none">CEO & Owner</p>
            </div>
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
        <main className="flex-1 overflow-y-auto p-8 relative">{children}</main>
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
    </div>
  );
}
