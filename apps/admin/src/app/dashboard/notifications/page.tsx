'use client';

import * as React from 'react';
import { Card, Button, Badge } from '@hq/ui';
import {
  Bell,
  ShieldAlert,
  ShieldCheck,
  Activity,
  Filter,
  Search,
  CheckCircle2,
  RefreshCcw,
  SlidersHorizontal,
  Trash2,
  Check,
  AlertTriangle,
  Clock,
  Layers,
  Key,
  Building2,
  UserPlus,
  Sparkles,
  Zap,
} from 'lucide-react';
import { toast } from '../../../components/toast';
import { useAuth } from '../../../contexts/auth-context';

export interface AdminTelemetryAlert {
  id: string;
  title: string;
  message: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  category: 'SECURITY' | 'TENANT' | 'EXECUTIVE' | 'COMPLIANCE' | 'SYSTEM';
  read: boolean;
  timestamp: string;
  source: string;
}

export default function AdminNotificationsPage() {
  const { dbUser } = useAuth();
  const [loading, setLoading] = React.useState(false);
  const [activePriority, setActivePriority] = React.useState<string>('ALL');
  const [searchQuery, setSearchQuery] = React.useState('');

  const [alerts, setAlerts] = React.useState<AdminTelemetryAlert[]>([
    {
      id: 'alt-001',
      title: 'Zero Cross-Tenant Leak Verification Passed',
      message: 'Automated schema partition audit verified 100% strict isolation across all tenant workspaces.',
      priority: 'LOW',
      category: 'COMPLIANCE',
      read: false,
      timestamp: new Date().toISOString(),
      source: 'Security Engine',
    },
    {
      id: 'alt-002',
      title: '5 Core Executives Standard Active',
      message: 'Asad (CEO), Teema (Ops), Legal, HR, and Mr. Intelligence synchronized with default tenant workspaces.',
      priority: 'LOW',
      category: 'EXECUTIVE',
      read: false,
      timestamp: new Date(Date.now() - 600000).toISOString(),
      source: 'CMS Kernel',
    },
    {
      id: 'alt-003',
      title: 'Master Circle Treasury Liquidity Verified',
      message: 'Reserve balance in compliance with Circle programmable wallets standard.',
      priority: 'MEDIUM',
      category: 'SYSTEM',
      read: false,
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      source: 'Treasury Watcher',
    },
    {
      id: 'alt-004',
      title: 'Super-Administrator Session Initialized',
      message: `Privileged token active for ${dbUser?.name || 'Administrator'} from verified IP subnet.`,
      priority: 'LOW',
      category: 'SECURITY',
      read: true,
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      source: 'Auth Guard',
    },
  ]);

  const handleMarkAllRead = () => {
    setAlerts((prev) => prev.map((a) => ({ ...a, read: true })));
    toast.success('All platform notifications marked as read');
  };

  const handleToggleRead = (id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, read: !a.read } : a)),
    );
  };

  const handleDeleteAlert = (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
    toast.success('Alert dismissed');
  };

  const filteredAlerts = alerts.filter((a) => {
    const matchesPriority = activePriority === 'ALL' || a.priority === activePriority;
    const matchesSearch =
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesPriority && matchesSearch;
  });

  const unreadCount = alerts.filter((a) => !a.read).length;
  const criticalCount = alerts.filter((a) => a.priority === 'CRITICAL' || a.priority === 'HIGH').length;

  return (
    <div className="space-y-8 text-left max-w-7xl mx-auto pb-12 select-none">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 dark:border-cyan-500/20 bg-gradient-to-r from-white via-slate-50 to-blue-50/40 dark:from-[#0B0F19] dark:via-[#0E1526] dark:to-indigo-950/30 p-8 shadow-xl backdrop-blur-2xl text-slate-900 dark:text-white">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-600 dark:text-cyan-300 text-xs font-black uppercase tracking-widest mb-3">
              <Bell className="h-3.5 w-3.5 text-cyan-500" />
              <span>Platform System Telemetry & Security Alerts</span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              System Telemetry & Notifications
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 max-w-2xl">
              Real-time platform security audit triggers, multi-tenant workspace events, governance compliance alerts, and executive kernel execution telemetry.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={handleMarkAllRead}
              className="bg-white/80 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <CheckCircle2 size={14} className="text-emerald-500" /> Mark All Read
            </Button>
          </div>
        </div>
      </div>

      {/* Stat Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white/70 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.08] backdrop-blur-xl shadow-xs">
          <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
            Total System Alerts
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">{alerts.length}</div>
        </div>
        <div className="p-5 rounded-3xl bg-white/70 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.08] backdrop-blur-xl shadow-xs">
          <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
            Unread Alerts
          </div>
          <div className="text-3xl font-black text-cyan-600 dark:text-cyan-400">{unreadCount}</div>
        </div>
        <div className="p-5 rounded-3xl bg-white/70 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.08] backdrop-blur-xl shadow-xs">
          <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
            Security Triggers
          </div>
          <div className="text-3xl font-black text-rose-500 dark:text-rose-400">{criticalCount}</div>
        </div>
        <div className="p-5 rounded-3xl bg-white/70 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.08] backdrop-blur-xl shadow-xs">
          <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
            System Health
          </div>
          <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400">100%</div>
        </div>
      </div>

      {/* Toolbar & Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/60 dark:bg-white/[0.03] p-4 rounded-2xl border border-slate-200/80 dark:border-white/[0.08]">
        <div className="flex items-center gap-2">
          {['ALL', 'HIGH', 'MEDIUM', 'LOW'].map((priority) => (
            <button
              key={priority}
              onClick={() => setActivePriority(priority)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activePriority === priority
                  ? 'bg-cyan-500/15 border border-cyan-500/40 text-cyan-600 dark:text-cyan-300 shadow-xs font-black'
                  : 'bg-white/60 dark:bg-white/5 border border-slate-200 dark:border-white/5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {priority === 'ALL' ? 'All Priorities' : `${priority} Priority`}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search telemetry alerts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500/50"
          />
        </div>
      </div>

      {/* Telemetry Alert Roster */}
      <div className="space-y-3">
        {filteredAlerts.length > 0 ? (
          filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-5 rounded-2xl border transition-all flex items-start justify-between gap-4 ${
                !alert.read
                  ? 'bg-cyan-50/50 dark:bg-cyan-950/15 border-cyan-500/30 shadow-sm'
                  : 'bg-white/70 dark:bg-white/[0.02] border-slate-200/80 dark:border-white/[0.08]'
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`p-3 rounded-2xl shrink-0 ${
                    alert.priority === 'HIGH' || alert.priority === 'CRITICAL'
                      ? 'bg-rose-500/10 border border-rose-500/30 text-rose-500'
                      : alert.priority === 'MEDIUM'
                      ? 'bg-amber-500/10 border border-amber-500/30 text-amber-500'
                      : 'bg-cyan-500/10 border border-cyan-500/30 text-cyan-500'
                  }`}
                >
                  <ShieldAlert size={20} />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white text-sm">
                      {alert.title}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-[9px] font-mono font-bold text-slate-600 dark:text-slate-300">
                      {alert.category}
                    </span>
                    <span
                      className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
                        alert.priority === 'HIGH' || alert.priority === 'CRITICAL'
                          ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                          : alert.priority === 'MEDIUM'
                          ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                          : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                      }`}
                    >
                      {alert.priority}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                    {alert.message}
                  </p>
                  <div className="flex items-center gap-4 text-[10px] text-slate-400 font-mono pt-1">
                    <span>Source: {alert.source}</span>
                    <span>•</span>
                    <span>{new Date(alert.timestamp).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleToggleRead(alert.id)}
                  className="p-2 rounded-xl border border-slate-200 dark:border-white/10 text-slate-500 hover:text-cyan-500 hover:border-cyan-500/30 transition-colors"
                  title={alert.read ? 'Mark Unread' : 'Mark Read'}
                >
                  <Check size={14} />
                </button>
                <button
                  onClick={() => handleDeleteAlert(alert.id)}
                  className="p-2 rounded-xl border border-slate-200 dark:border-white/10 text-slate-500 hover:text-rose-500 hover:border-rose-500/30 transition-colors"
                  title="Dismiss Alert"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="py-16 text-center text-slate-400 border border-dashed border-slate-200 dark:border-white/10 rounded-3xl">
            <ShieldCheck size={36} className="mx-auto mb-2 text-emerald-500" />
            <p className="font-bold text-sm text-slate-700 dark:text-slate-300">
              No Telemetry Alerts Recorded
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              All infrastructure nodes, security envelopes, and executive kernels are nominal.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
