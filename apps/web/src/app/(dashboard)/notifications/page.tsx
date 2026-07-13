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

  const handleToggleArchive = async (id: string) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/notifications/${id}/archive`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        fetchInboxData();
      }
    } catch (err) {
      console.error('Failed toggling archive:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/notifications/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        fetchInboxData();
      }
    } catch (err) {
      console.error('Failed deleting alert:', err);
    }
  };

  const handleMarkAllRead = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/notifications/mark-all-read', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        fetchInboxData();
      }
    } catch (err) {
      console.error('Failed bulk mark read:', err);
    }
  };

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    setPrefSavedToast(true);
    setTimeout(() => setPrefSavedToast(false), 3000);
  };

  const getSenderDetails = (notif: Notification) => {
    if (notif.senderType !== 'EXECUTIVE') {
      return {
        name: 'HQ System',
        role: 'Platform Alert',
        fallback: 'SYS',
      };
    }
    const exec = executives.find((e) => e.id === notif.senderId);
    if (exec) {
      const name = exec.roleKey === 'ceo' ? ceoName : exec.name;
      return {
        name,
        role: exec.title,
        fallback: name.substring(0, 2).toUpperCase(),
      };
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
          <Badge variant="error" className="text-[9px]">
            Critical Exception
          </Badge>
        );
      case 'HIGH':
        return (
          <Badge
            variant="ai"
            className="bg-hq-purple/10 text-hq-purple border-hq-purple/30 text-[9px]"
          >
            High Priority
          </Badge>
        );
      case 'MEDIUM':
        return (
          <Badge variant="success" className="text-[9px]">
            Operational
          </Badge>
        );
      default:
        return (
          <Badge variant="neutral" className="text-[9px]">
            Notice
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-8 select-none text-foreground pb-12">
      {/* Page Header */}
      <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0 border-b border-card-border pb-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#1A1A1E] dark:text-white flex items-center gap-2">
            <Bell className="h-8 w-8 text-hq-blue" />
            Executive Inbox & Alerts
          </h1>
          <p className="text-foreground/60 text-sm mt-1">
            Official strategic briefings and security escalations from your C-Suite executives.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setShowArchived(!showArchived)}
            className="text-xs font-bold h-9 border-card-border"
          >
            <Archive className="h-4 w-4 mr-1.5" />
            {showArchived ? 'Active Alerts' : 'Archived Feed'}
          </Button>
          <Button
            onClick={handleMarkAllRead}
            disabled={notifications.filter((n) => !n.read).length === 0}
            className="text-xs font-bold h-9 text-white"
            style={{ backgroundColor: brandColor }}
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
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-card-bg border border-card-border p-3.5 rounded-2xl">
            <div className="flex gap-1.5">
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
                      ? 'text-white border-transparent'
                      : 'bg-[#F9F9FB] dark:bg-[#0A0A0C] border-card-border text-foreground/70 hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                  style={{
                    backgroundColor: activeCategory === category.id ? brandColor : undefined,
                  }}
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
                className="h-9 w-full rounded-md border border-card-border bg-[#F9F9FB] dark:bg-[#0A0A0C] pl-9 pr-4 text-xs text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-hq-blue"
              />
            </div>
          </div>

          {/* Messages Stream list */}
          {loading ? (
            <div className="space-y-3 py-4">
              <ListSkeleton rows={6} />
            </div>
          ) : notifications.length === 0 ? (
            <Card className="border border-card-border bg-card-bg p-16 text-center">
              <Check className="h-10 w-10 text-emerald-500 bg-emerald-500/10 p-2 rounded-full mx-auto mb-3" />
              <h3 className="text-sm font-bold text-[#1A1A1E] dark:text-white">Inbox Clean</h3>
              <p className="text-xs text-foreground/50 mt-1">
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
                        ? 'border-card-border bg-card-bg/40 opacity-75'
                        : 'border-hq-blue/20 bg-card-bg shadow-[var(--card-shadow)]'
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
                        <span className="text-xs font-extrabold text-[#1A1A1E] dark:text-white">
                          {sender.name}
                        </span>
                        <span className="text-[10px] text-foreground/50 font-bold uppercase tracking-wider">
                          {sender.role}
                        </span>
                        {getPriorityBadge(notif.priority)}
                        <span className="text-[10px] text-foreground/40 ml-auto font-semibold">
                          {new Date(notif.createdAt).toLocaleDateString()} at{' '}
                          {new Date(notif.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      <div>
                        <h4 className="text-xs font-extrabold text-[#1A1A1E] dark:text-white flex items-center gap-2">
                          {!notif.read && (
                            <span className="h-2 w-2 rounded-full bg-hq-blue shrink-0 animate-pulse"></span>
                          )}
                          {notif.title}
                        </h4>
                        <p className="text-xs text-foreground/75 leading-relaxed mt-1">
                          {notif.message}
                        </p>
                      </div>

                      {/* Display action URLs directly */}
                      {notif.actionUrl && (
                        <div className="pt-2">
                          <Button
                            onClick={() => router.push(notif.actionUrl!)}
                            size="sm"
                            className="text-[10px] font-bold text-white h-7 px-3.5 flex items-center gap-1.5 shadow-sm"
                            style={{ backgroundColor: brandColor }}
                          >
                            Execute Strategic Order
                            <ArrowRight className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Toolbar controllers */}
                    <div className="flex sm:flex-col gap-1 shrink-0 self-end sm:self-start">
                      <button
                        onClick={() => handleTogglePin(notif.id)}
                        className={`p-1.5 rounded hover:bg-black/5 dark:hover:bg-white/5 ${
                          notif.isPinned ? 'text-hq-cyan' : 'text-foreground/45'
                        }`}
                      >
                        <Pin className="h-3.5 w-3.5 fill-current" />
                      </button>
                      <button
                        onClick={() => handleToggleRead(notif.id, notif.read)}
                        className="p-1.5 rounded hover:bg-black/5 dark:hover:bg-white/5 text-foreground/45 hover:text-hq-blue"
                      >
                        <Check className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleToggleArchive(notif.id)}
                        className="p-1.5 rounded hover:bg-black/5 dark:hover:bg-white/5 text-foreground/45 hover:text-yellow-500"
                      >
                        <Archive className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(notif.id)}
                        className="p-1.5 rounded hover:bg-black/5 dark:hover:bg-white/5 text-foreground/45 hover:text-red-500"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Sidebar Preferences */}
        <div className="space-y-6 text-left">
          <Card className="border border-card-border bg-card-bg p-5 shadow-[var(--card-shadow)]">
            <CardHeader className="p-0 pb-4 border-b border-card-border flex items-center space-x-2">
              <Sliders className="h-4 w-4 text-hq-blue" />
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-foreground/80">
                Alert Preferences
              </CardTitle>
            </CardHeader>

            <form onSubmit={handleSavePreferences} className="space-y-4 pt-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-foreground/75 flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-foreground/40" />
                    Email Summaries
                  </span>
                  <input
                    type="checkbox"
                    checked={emailAlerts}
                    onChange={(e) => setEmailAlerts(e.target.checked)}
                    className="h-4.5 w-4.5 rounded border-card-border accent-hq-blue"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-foreground/75 flex items-center gap-1.5">
                    <Smartphone className="h-3.5 w-3.5 text-foreground/40" />
                    Mobile Push Alerts
                  </span>
                  <input
                    type="checkbox"
                    checked={pushAlerts}
                    onChange={(e) => setPushAlerts(e.target.checked)}
                    className="h-4.5 w-4.5 rounded border-card-border accent-hq-blue"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-foreground/75 flex items-center gap-1.5">
                    <Activity className="h-3.5 w-3.5 text-foreground/40 animate-pulse" />
                    Enforce Quiet Hours
                  </span>
                  <input
                    type="checkbox"
                    checked={quietHours}
                    onChange={(e) => setQuietHours(e.target.checked)}
                    className="h-4.5 w-4.5 rounded border-card-border accent-hq-blue"
                  />
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  size="sm"
                  className="w-full text-[10px] font-bold text-white shadow-sm"
                  style={{ backgroundColor: brandColor }}
                >
                  Save Inbox Preferences
                </Button>
              </div>
            </form>
          </Card>

          {/* Preferences updated toast alert */}
          {prefSavedToast && (
            <div className="border border-green-500/25 bg-green-500/5 text-green-500 p-3 rounded-xl text-center text-[10px] font-bold">
              ✓ Preferences updated successfully!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
