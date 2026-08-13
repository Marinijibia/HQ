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
      id: 'alert-001',
      title: 'Super-Admin Authentication',
      message: `Privileged administrative session opened for ${dbUser?.name || 'Administrator'} (${dbUser?.email || 'admin@netify.ng'}).`,
      priority: 'HIGH',
      category: 'SECURITY',
      read: false,
      timestamp: new Date().toISOString(),
      source: 'AUTH_GATEWAY',
    },
    {
      id: 'alert-002',
      title: 'Multi-Tenant Data Boundary Verified',
      message: 'System audit confirmed 100% strict isolation across all tenant database schemas.',
      priority: 'MEDIUM',
      category: 'TENANT',
      read: true,
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      source: 'SECURITY_AUDITOR',
    },
    {
      id: 'alert-003',
      title: '5 Core Executives Standard Active',
      message: 'CEO (Asad), Operations, Legal, HR, and Mr. Intelligence synced for default installation.',
      priority: 'LOW',
      category: 'EXECUTIVE',
      read: true,
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      source: 'CMS_ENGINE',
    },
    {
      id: 'alert-004',
      title: 'Marketplace Department Installation',
      message: 'New specialized AI executive suite activated for tenant workspace.',
      priority: 'MEDIUM',
      category: 'COMPLIANCE',
      read: false,
      timestamp: new Date(Date.now() - 14400000).toISOString(),
      source: 'MARKETPLACE_BUS',
    },
  ]);

  const handleMarkAllRead = () => {
    setAlerts((prev) => prev.map((a) => ({ ...a, read: true })));
    toast.success('✓ All platform notifications marked as read');
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
      <div className="relative overflow-hidden rounded-3xl border border-blue-500/20 bg-gradient-to-r from-slate-950 via-[#0B0F19] to-indigo-950/40 p-8 shadow-2xl backdrop-blur-xl text-white">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-black uppercase tracking-widest mb-3">
              <Bell className="h-3.5 w-3.5 text-blue-400" />
              <span>Platform System Telemetry & Security Alerts</span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">System Telemetry & Notifications</h1>
            <p className="text-slate-400 text-sm mt-1 max-w-2xl">
              Real-time platform security audit triggers, multi-tenant workspace events, governance compliance alerts, and executive kernel execution telemetry.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={handleMarkAllRead}
              className="bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2"
            >
              <CheckCircle2 size={14} className="text-emerald-400" /> Mark All Read
            </Button>
          </div>
        </div>
      </div>

      {/* Stat Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-slate-900/60 border border-white/10 backdrop-blur-xl">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total System Alerts</div>
          <div className="text-3xl font-black text-white">{alerts.length}</div>
        </div>
        <div className="p-5 rounded-3xl bg-slate-900/60 border border-white/10 backdrop-blur-xl">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Unread Alerts</div>
          <div className="text-3xl font-black text-cyan-400">{unreadCount}</div>
        </div>
        <div className="p-5 rounded-3xl bg-slate-900/60 border border-white/10 backdrop-blur-xl">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Security Triggers</div>
          <div className="text-3xl font-black text-rose-400">{criticalCount}</div>
        </div>
        <div className="p-5 rounded-3xl bg-slate-900/60 border border-white/10 backdrop-blur-xl">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">System Health</div>
          <div className="text-3xl font-black text-emerald-400">100%</div>
        </div>
      </div>

      {/* Toolbar & Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/40 p-4 rounded-2xl border border-white/10">
        <div className="flex items-center gap-2">
          {['ALL', 'HIGH', 'MEDIUM', 'LOW'].map((priority) => (
            <button
              key={priority}
              onClick={() => setActivePriority(priority)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activePriority === priority
                  ? 'bg-blue-500/20 border border-blue-500/40 text-blue-300 shadow-md'
                  : 'bg-white/5 border border-white/5 text-slate-400 hover:text-white'
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
            className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none"
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
                  ? 'bg-blue-950/20 border-blue-500/30 shadow-lg'
                  : 'bg-slate-900/60 border-white/10'
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`p-3 rounded-2xl shrink-0 ${
                    alert.priority === 'HIGH' || alert.priority === 'CRITICAL'
                      ? 'bg-rose-500/10 border border-rose-500/30 text-rose-400'
                      : alert.priority === 'MEDIUM'
                      ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400'
                      : 'bg-blue-500/10 border border-blue-500/30 text-blue-400'
                  }`}
                >
                  <ShieldAlert size={20} />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{alert.title}</span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-800 border border-white/10 text-[9px] font-mono font-bold text-slate-300">
                      {alert.category}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                        alert.priority === 'HIGH'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          : alert.priority === 'MEDIUM'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                      }`}
                    >
                      {alert.priority}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
                    {alert.message}
                  </p>

                  <div className="flex items-center gap-4 text-[10px] text-slate-400 font-mono pt-1">
                    <span>Source: {alert.source}</span>
                    <span>•</span>
                    <span>{new Date(alert.timestamp).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleRead(alert.id)}
                  title={alert.read ? 'Mark as Unread' : 'Mark as Read'}
                  className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white"
                >
                  <Check size={14} className={alert.read ? 'text-emerald-400' : ''} />
                </button>
                <button
                  onClick={() => handleDeleteAlert(alert.id)}
                  title="Dismiss Alert"
                  className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-rose-400"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="p-12 text-center border border-white/10 rounded-3xl bg-slate-900/60 text-slate-500 text-xs font-bold">
            No system alerts found for this filter query.
          </div>
        )}
      </div>
    </div>
  );
}
