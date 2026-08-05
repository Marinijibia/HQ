'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, Button, Badge, Avatar } from '@hq/ui';
import {
  Bell,
  Search,
  Check,
  CheckCheck,
  Pin,
  Archive,
  Trash2,
  Sliders,
  Mail,
  Smartphone,
  Activity,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../../../contexts/auth-context';
import { ListSkeleton } from '../../../components/skeletons';

interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  category: 'EXECUTIVE' | 'MISSION' | 'SECURITY' | 'BILLING' | 'SYSTEM';
  senderId?: string | null;
  senderType?: string | null;
  actionUrl?: string | null;
  isPinned: boolean;
  isArchived: boolean;
  createdAt: string;
}

interface Executive {
  id: string;
  name: string;
  roleKey: string;
  title: string;
}

export default function NotificationsInboxPage() {
  const { token } = useAuth();
  const router = useRouter();

  // Toolbar state
  const [activeCategory, setActiveCategory] = React.useState<string>('all');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [showArchived, setShowArchived] = React.useState(false);

  // Preference Settings states
  const [emailAlerts, setEmailAlerts] = React.useState(true);
  const [pushAlerts, setPushAlerts] = React.useState(false);
  const [quietHours, setQuietHours] = React.useState(false);
  const [prefSavedToast, setPrefSavedToast] = React.useState(false);

  // Dynamic branding
  const [ceoName, setCeoName] = React.useState('Elena Rostova');
  const [brandColor, setBrandColor] = React.useState('#0A84FF');

  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  const [executives, setExecutives] = React.useState<Executive[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    // Read from onboarding draft
    const draftStr = localStorage.getItem('hq_onboarding_draft');
    if (draftStr) {
      try {
        const draft = JSON.parse(draftStr);
        if (draft.ceoName) setCeoName(draft.ceoName);
        if (draft.brandColor) setBrandColor(draft.brandColor);
      } catch (e) {
        console.warn('Error reading onboarding draft:', e);
      }
    }
  }, []);

  const fetchInboxData = React.useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch C-Suite executives list for sender matching
      const execRes = await fetch('/api/executives', { headers });
      if (execRes.ok) {
        const execsData = await execRes.json();
        setExecutives(execsData);
      }

      // Fetch Alerts list
      let url = `/api/notifications?isArchived=${showArchived}`;
      if (activeCategory !== 'all') {
        url += `&category=${activeCategory.toUpperCase()}`;
      }
      if (searchQuery) {
        url += `&search=${encodeURIComponent(searchQuery)}`;
      }

      const res = await fetch(url, { headers });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (e) {
      console.error('Failed retrieving notifications inbox:', e);
    } finally {
      setLoading(false);
    }
  }, [token, activeCategory, searchQuery, showArchived]);

  React.useEffect(() => {
    if (token) {
      fetchInboxData();
    }
  }, [token, activeCategory, searchQuery, showArchived, fetchInboxData]);

  const handleToggleRead = async (id: string, currentlyRead: boolean) => {
    if (!token) return;
    try {
      const endpoint = `/api/notifications/${id}/${currentlyRead ? 'unread' : 'read'}`;
      const res = await fetch(endpoint, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        fetchInboxData();
      }
    } catch (err) {
      console.error('Failed toggling read state:', err);
    }
  };

  const handleTogglePin = async (id: string) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/notifications/${id}/pin`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        fetchInboxData();
      }
    } catch (err) {
      console.error('Failed toggling pin:', err);
    }
  };

  const handleMarkAllRead = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/notifications/read-all', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        fetchInboxData();
      }
    } catch (err) {
      console.error('Failed marking all as read:', err);
    }
  };

  const handleSavePreferences = () => {
    setPrefSavedToast(true);
    setTimeout(() => setPrefSavedToast(false), 3000);
  };

  const getSenderDetails = (notif: Notification) => {
    if (notif.senderId) {
      const exec = executives.find((e) => e.id === notif.senderId);
      if (exec) {
        return {
          name: exec.name,
          role: exec.title,
          fallback: exec.name.split(' ').map((n) => n[0]).join(''),
        };
      }
    }
    return {
      name: ceoName,
      role: 'Chief Executive Officer',
      fallback: 'CEO',
    };
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'CRITICAL':
        return (
          <Badge variant="error" className="text-xs">
            Critical Exception
          </Badge>
        );
      case 'HIGH':
        return (
          <Badge
            variant="ai"
            className="bg-purple-500/10 text-purple-600 dark:text-purple-300 border-purple-500/30 text-xs"
          >
            High Priority
          </Badge>
        );
      case 'MEDIUM':
        return (
          <Badge variant="success" className="text-xs">
            Operational
          </Badge>
        );
      default:
        return (
          <Badge variant="neutral" className="text-xs">
            Notice
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-8 select-none text-foreground pb-12 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0 border-b border-card-border pb-4 text-left">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Bell className="h-8 w-8 text-cyan-500" />
            Executive Inbox & Alerts
          </h1>
          <p className="text-slate-600 dark:text-foreground/60 text-sm mt-1 font-medium">
            Official strategic briefings and security escalations from your C-Suite executives.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setShowArchived(!showArchived)}
            className="text-xs font-bold h-9 border-slate-200 dark:border-card-border text-slate-700 dark:text-foreground"
          >
            <Archive className="h-4 w-4 mr-1.5" />
            {showArchived ? 'Active Alerts' : 'Archived Feed'}
          </Button>
          <Button
            onClick={handleMarkAllRead}
            disabled={!Array.isArray(notifications) || notifications.filter((n) => !n.read).length === 0}
            className="text-xs font-bold h-9 text-white bg-cyan-500 hover:bg-cyan-400"
          >
            <CheckCheck className="h-4 w-4 mr-1.5" />
            Mark All Read
          </Button>
        </div>
      </div>

      {/* Grid container layout */}
      <div className="grid gap-6 lg:grid-cols-4 items-start">
        {/* Inbox Main Stream */}
        <div className="lg:col-span-3 space-y-4">
          {/* Filters and search bar */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white dark:bg-card-bg border border-slate-200 dark:border-card-border p-3.5 rounded-2xl shadow-sm">
            <div className="flex flex-wrap gap-1.5">
              {[
                { id: 'all', label: 'All Messages' },
                { id: 'executive', label: 'C-Suite Alerts' },
                { id: 'security', label: 'Security' },
                { id: 'billing', label: 'Usage & Bills' },
              ].map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                    activeCategory === category.id
                      ? 'bg-cyan-500 text-white border-transparent'
                      : 'bg-slate-100 dark:bg-[#0A0A0C] border-slate-200 dark:border-card-border text-slate-700 dark:text-foreground/70 hover:bg-slate-200 dark:hover:bg-white/5'
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-60">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-foreground/45" />
              <input
                type="text"
                placeholder="Search alerts inbox..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 w-full rounded-md border border-slate-300 dark:border-card-border bg-white dark:bg-[#0A0A0C] pl-9 pr-4 text-xs text-slate-900 dark:text-foreground placeholder:text-slate-400 dark:placeholder:text-foreground/30 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-500"
              />
            </div>
          </div>

          {/* Messages Stream list */}
          {loading ? (
            <div className="space-y-3 py-4">
              <ListSkeleton rows={6} />
            </div>
          ) : !Array.isArray(notifications) || notifications.length === 0 ? (
            <Card className="border border-slate-200 dark:border-card-border bg-white dark:bg-card-bg p-16 text-center shadow-sm">
              <Check className="h-10 w-10 text-emerald-500 bg-emerald-500/10 p-2 rounded-full mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Inbox Clean</h3>
              <p className="text-xs text-slate-500 dark:text-foreground/50 mt-1">
                You have no active alerts matching this filter configuration.
              </p>
            </Card>
          ) : (
            <div className="space-y-3.5">
              {notifications.map((notif) => {
                const sender = getSenderDetails(notif);
                return (
                  <Card
                    key={notif.id}
                    className={`border transition-all hover:shadow-md text-left flex flex-col sm:flex-row items-start gap-4 p-5 ${
                      notif.read
                        ? 'border-slate-200 dark:border-card-border bg-slate-50 dark:bg-card-bg/40 opacity-75'
                        : 'border-cyan-500/30 bg-white dark:bg-card-bg shadow-sm'
                    }`}
                  >
                    <Avatar
                      fallback={sender.fallback}
                      variant="executive"
                      size="md"
                      className="shrink-0"
                    />

                    <div className="flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                          {sender.name}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-foreground/50 font-bold uppercase tracking-wider">
                          {sender.role}
                        </span>
                        {getPriorityBadge(notif.priority)}
                        <span className="text-xs text-slate-400 dark:text-foreground/40 ml-auto font-semibold">
                          {new Date(notif.createdAt).toLocaleDateString()} at{' '}
                          {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">{notif.title}</h4>
                      <p className="text-xs text-slate-600 dark:text-foreground/70 leading-relaxed">{notif.message}</p>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Notifications Preference Panel */}
        <div className="space-y-4 text-left">
          <Card className="border border-slate-200 dark:border-card-border bg-white dark:bg-card-bg p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
              <Sliders className="h-4 w-4 text-cyan-500" /> Dispatch Rules
            </h3>

            <div className="space-y-3.5 text-xs font-semibold text-slate-700 dark:text-foreground/75">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Mail className="h-4 w-4 text-slate-400" /> Resend Digest Email
                </span>
                <input
                  type="checkbox"
                  checked={emailAlerts}
                  onChange={(e) => setEmailAlerts(e.target.checked)}
                  className="accent-cyan-500 h-4 w-4 rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Smartphone className="h-4 w-4 text-slate-400" /> Push Notifications
                </span>
                <input
                  type="checkbox"
                  checked={pushAlerts}
                  onChange={(e) => setPushAlerts(e.target.checked)}
                  className="accent-cyan-500 h-4 w-4 rounded cursor-pointer"
                />
              </div>
            </div>

            <Button
              onClick={handleSavePreferences}
              size="sm"
              className="w-full text-xs font-bold h-8.5 text-white bg-cyan-500 hover:bg-cyan-400 mt-2"
            >
              Save Dispatch Preferences
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
