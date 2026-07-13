'use client';

import * as React from 'react';
import {
  Rocket,
  FileText,
  MessageSquare,
  Bell,
  CheckCircle2,
  User,
  Zap,
  Clock,
} from 'lucide-react';

interface ActivityEvent {
  id: string;
  type: 'mission_started' | 'mission_completed' | 'asset_generated' | 'message' | 'notification' | 'executive_assigned' | 'approval';
  title: string;
  subtitle: string;
  time: string;
}

const TYPE_CONFIG = {
  mission_started: { icon: Rocket, color: '#0A84FF', bg: 'bg-hq-blue/10' },
  mission_completed: { icon: CheckCircle2, color: '#22C55E', bg: 'bg-green-500/10' },
  asset_generated: { icon: FileText, color: '#0EA5E9', bg: 'bg-hq-cyan/10' },
  message: { icon: MessageSquare, color: '#8B5CF6', bg: 'bg-hq-purple/10' },
  notification: { icon: Bell, color: '#F59E0B', bg: 'bg-amber-500/10' },
  executive_assigned: { icon: User, color: '#EC4899', bg: 'bg-pink-500/10' },
  approval: { icon: Zap, color: '#10B981', bg: 'bg-emerald-500/10' },
};

// Fallback seed feed — used when API has no data yet
const SEED_FEED: ActivityEvent[] = [
  { id: 's1', type: 'mission_started', title: 'Welcome to HQ', subtitle: 'Your AI executive team is ready and waiting', time: 'Just now' },
  { id: 's2', type: 'executive_assigned', title: 'CEO activated', subtitle: 'Elena is ready to receive your first mission', time: '1m ago' },
  { id: 's3', type: 'notification', title: 'Intelligence profile', subtitle: 'Complete your org profile to unlock deeper insights', time: '2m ago' },
];

function timeAgo(dateStr: string): string {
  try {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  } catch { return 'Recently'; }
}

function mapApiEvent(raw: Record<string, unknown>, index: number): ActivityEvent {
  // Try to map various backend event shapes
  const type = (raw.type as string) || 'notification';
  const validTypes = Object.keys(TYPE_CONFIG);
  const mappedType = validTypes.includes(type) ? type as ActivityEvent['type'] : 'notification';

  return {
    id: (raw.id as string) || `event-${index}`,
    type: mappedType,
    title: (raw.title as string) || (raw.name as string) || 'Activity',
    subtitle: (raw.subtitle as string) || (raw.description as string) || (raw.message as string) || '',
    time: raw.createdAt ? timeAgo(raw.createdAt as string) : (raw.time as string) || 'Recently',
  };
}

interface GlobalActivityFeedProps {
  className?: string;
  maxItems?: number;
  compact?: boolean;
  token?: string;
}

export function GlobalActivityFeed({ className = '', maxItems = 7, compact = false, token }: GlobalActivityFeedProps) {
  const [items, setItems] = React.useState<ActivityEvent[]>(SEED_FEED.slice(0, maxItems));
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (!token) return;
    setLoading(true);
    fetch('/api/analytics/activity', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => {
        if (!res.ok) throw new Error('No activity data');
        return res.json();
      })
      .then((data: unknown[]) => {
        if (Array.isArray(data) && data.length > 0) {
          setItems(data.slice(0, maxItems).map((e, i) => mapApiEvent(e as Record<string, unknown>, i)));
        }
        // If empty, keep seed feed — better than showing nothing
      })
      .catch(() => {
        // Silently keep seed feed on error — no visible failure to user
      })
      .finally(() => setLoading(false));
  }, [token, maxItems]);

  return (
    <div className={`space-y-1 ${className}`}>
      {items.map((event, i) => {
        const cfg = TYPE_CONFIG[event.type] || TYPE_CONFIG.notification;
        const Icon = cfg.icon;
        return (
          <div
            key={event.id}
            className={`flex items-start gap-3 rounded-xl ${compact ? 'px-3 py-2' : 'px-4 py-3'} hover:bg-foreground/4 transition-colors group animate-in fade-in duration-300`}
            style={{ animationDelay: `${i * 60}ms` }}
          >
            {/* Icon */}
            <div
              className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${cfg.bg}`}
            >
              <Icon className="h-3.5 w-3.5" style={{ color: cfg.color }} />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className={`font-extrabold text-[#1A1A1E] dark:text-white truncate ${compact ? 'text-[10px]' : 'text-[11px]'}`}>
                {event.title}
              </p>
              <p className={`text-foreground/55 font-semibold truncate mt-0.5 ${compact ? 'text-[9px]' : 'text-[10px]'}`}>
                {event.subtitle}
              </p>
            </div>

            {/* Time */}
            <div className="flex items-center gap-1 shrink-0">
              <Clock className="h-2.5 w-2.5 text-foreground/25" />
              <span className="text-[9px] text-foreground/35 font-semibold whitespace-nowrap">{event.time}</span>
            </div>
          </div>
        );
      })}

      {loading && (
        <div className="px-4 py-2 flex items-center gap-2">
          <div className="h-1 w-1 rounded-full bg-hq-blue animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="h-1 w-1 rounded-full bg-hq-blue animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="h-1 w-1 rounded-full bg-hq-blue animate-bounce" style={{ animationDelay: '300ms' }} />
          <span className="text-[9px] text-foreground/35 font-semibold ml-1">Loading activity...</span>
        </div>
      )}
    </div>
  );
}
