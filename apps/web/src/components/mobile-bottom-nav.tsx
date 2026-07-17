'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Calendar,
  MessageSquare,
  Database,
} from 'lucide-react';

const MOBILE_NAV = [
  { name: 'Home', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Boardroom', href: '/boardroom', icon: Users },
  { name: 'Missions', href: '/missions', icon: Calendar },
  { name: 'Discuss', href: '/discussions', icon: MessageSquare },
  { name: 'Assets', href: '/assets', icon: Database },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden border-t border-card-border bg-background/95 backdrop-blur-md safe-area-pb">
      <div className="flex items-center justify-around px-2 py-2">
        {MOBILE_NAV.map(item => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all ${
                isActive
                  ? 'text-hq-blue'
                  : 'text-foreground/40 hover:text-foreground/70'
              }`}
            >
              <div className={`h-6 w-6 flex items-center justify-center rounded-lg transition-all ${
                isActive ? 'bg-hq-blue/15' : ''
              }`}>
                <Icon className="h-4 w-4" />
              </div>
              <span className={`text-[9px] font-bold tracking-wide ${
                isActive ? 'text-hq-blue' : 'text-foreground/40'
              }`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
