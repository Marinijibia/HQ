'use client';

import * as React from 'react';
import {
  Card,
  Button,
  Badge,
} from '@hq/ui';
import {
  BarChart3,
  TrendingUp,
  Sparkles,
  ShieldAlert,
  Download,
  Lightbulb,
  Activity,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Users,
  Target,
  Zap,
} from 'lucide-react';
import { useAuth } from '../../../contexts/auth-context';
import Link from 'next/link';

interface ExecutiveUtilization {
  name: string;
  title: string;
  hours: number;
  percentage: number;
}

interface CreditDay {
  day: string;
  credits: number;
}

interface SecurityLog {
  id: string;
  event: string;
  status: string;
  user: string;
  time: string;
}

interface Recommendation {
  id: string;
  title: string;
  type: 'opportunity' | 'risk';
  confidence: number;
  description: string;
}

interface AnalyticsMetrics {
  healthScore: number;
  missions: {
    active: number;
    completed: number;
    total: number;
    successRate: number;
  };
  storage: {
    used: number;
    limit: number;
    planCode: string;
  };
  executiveUtilization: ExecutiveUtilization[];
  creditOutflow: CreditDay[];
  securityLogs: SecurityLog[];
  recommendations: Recommendation[];
}

const TABS = [
  { id: 'overview', label: 'Overview', icon: Activity },
  { id: 'executives', label: 'Executives', icon: Users },
  { id: 'costs', label: 'AI & Costs', icon: Zap },
  { id: 'security', label: 'Security', icon: ShieldAlert },
];

export default function AnalyticsPage() {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = React.useState('overview');
  const [briefing, setBriefing] = React.useState<string>('');
  const [metrics, setMetrics] = React.useState<AnalyticsMetrics | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [exporting, setExporting] = React.useState(false);
  const [brandColor, setBrandColor] = React.useState('#0A84FF');
  const [ceoName, setCeoName] = React.useState('Elena Rostova');

  React.useEffect(() => {
    const draftStr = localStorage.getItem('hq_onboarding_draft');
    if (draftStr) {
      try {
        const draft = JSON.parse(draftStr);
        if (draft.brandColor) setBrandColor(draft.brandColor);
        if (draft.ceoName) setCeoName(draft.ceoName);
      } catch (e) {
        console.warn('Error reading onboarding draft:', e);
      }
    }
  }, []);

  const fetchAnalytics = React.useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [briefingRes, metricsRes] = await Promise.all([
        fetch('/api/analytics/briefing', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('/api/analytics/metrics', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      if (briefingRes.ok) {
        const b = await briefingRes.json();
        setBriefing(b.briefing || '');
      }
      if (metricsRes.ok) {
        const m = await metricsRes.json();
        setMetrics(m);
      }
    } catch (e) {
      console.error('Failed fetching analytics:', e);
    } finally {
      setLoading(false);
    }
  }, [token]);

  React.useEffect(() => {
    if (token) fetchAnalytics();
  }, [token, fetchAnalytics]);

  const handleExport = async () => {
    if (!token) return;
    setExporting(true);
    try {
      const res = await fetch('/api/analytics/export', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `hq_report_${Date.now()}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (e) {
      console.error('Export failed:', e);
    } finally {
      setExporting(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Compute SVG area chart for credit outflow
  const renderCreditChart = () => {
    if (!metrics?.creditOutflow?.length) return null;
    const max = Math.max(...metrics.creditOutflow.map((d) => d.credits));
    const w = 300;
    const h = 100;
    const pad = 10;
    const usable_w = w - pad * 2;
    const usable_h = h - pad * 2;
    const points = metrics.creditOutflow.map((d, i) => {
      const x = pad + (i / (metrics.creditOutflow.length - 1)) * usable_w;
      const y = pad + usable_h - (d.credits / max) * usable_h;
      return `${x},${y}`;
    });
    const lineD = `M ${points.join(' L ')}`;
    const areaD = `M ${points[0]} L ${points.join(' L ')} L ${pad + usable_w},${pad + usable_h} L ${pad},${pad + usable_h} Z`;

    return (
      <svg className="w-full h-32" viewBox={`0 0 ${w} ${h}`} fill="none">
        <defs>
          <linearGradient id="aG" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.35} />
            <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0.0} />
          </linearGradient>
        </defs>
        <line x1={pad} y1={h / 2} x2={w - pad} y2={h / 2} stroke="currentColor" strokeOpacity={0.1} strokeWidth={0.5} />
        <line x1={pad} y1={pad + usable_h * 0.25} x2={w - pad} y2={pad + usable_h * 0.25} stroke="currentColor" strokeOpacity={0.1} strokeWidth={0.5} />
        <path d={areaD} fill="url(#aG)" />
        <path d={lineD} stroke="#0EA5E9" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        {metrics.creditOutflow.map((d, i) => {
          const x = pad + (i / (metrics.creditOutflow.length - 1)) * usable_w;
          const y = pad + usable_h - (d.credits / max) * usable_h;
          return <circle key={i} cx={x} cy={y} r={2.5} fill="#0EA5E9" />;
        })}
      </svg>
    );
  };

  // Mission donut chart via SVG arc
  const renderMissionDonut = () => {
    if (!metrics) return null;
    const { completed, active, total } = metrics.missions;
    const other = Math.max(total - completed - active, 0);
    const completedPct = total > 0 ? (completed / total) * 100 : 0;
    const activePct = total > 0 ? (active / total) * 100 : 0;

    const r = 36;
    const cx = 50;
    const cy = 50;
    const circumference = 2 * Math.PI * r;

    const completedDash = (completedPct / 100) * circumference;
    const activeDash = (activePct / 100) * circumference;

    return (
      <div className="flex items-center gap-6">
        <svg viewBox="0 0 100 100" className="h-24 w-24 shrink-0 -rotate-90">
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="currentColor" strokeOpacity={0.08} strokeWidth={12} />
          <circle
            cx={cx} cy={cy} r={r} fill="none"
            stroke="#0EA5E9" strokeWidth={12}
            strokeDasharray={`${completedDash} ${circumference}`}
            strokeLinecap="round"
          />
          <circle
            cx={cx} cy={cy} r={r} fill="none"
            stroke="#8B5CF6" strokeWidth={12}
            strokeDasharray={`${activeDash} ${circumference}`}
            strokeDashoffset={-completedDash}
            strokeLinecap="round"
          />
        </svg>
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-hq-cyan shrink-0"></span>
            <span className="text-foreground/70 font-semibold">Completed: <span className="text-[#1A1A1E] dark:text-white font-extrabold">{completed}</span></span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-hq-purple shrink-0"></span>
            <span className="text-foreground/70 font-semibold">Active: <span className="text-[#1A1A1E] dark:text-white font-extrabold">{active}</span></span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-foreground/20 shrink-0"></span>
            <span className="text-foreground/70 font-semibold">Other: <span className="text-[#1A1A1E] dark:text-white font-extrabold">{other}</span></span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 select-none text-foreground pb-12">

      {/* Page Header */}
      <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0 border-b border-card-border pb-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#1A1A1E] dark:text-white flex items-center gap-2">
            <BarChart3 className="h-8 w-8 text-hq-blue" />
            Analytics & Intelligence
          </h1>
          <p className="text-foreground/60 text-sm mt-1">
            Executive-grade business intelligence with AI-driven briefings and performance insights.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={fetchAnalytics}
            variant="outline"
            size="sm"
            className="text-xs h-9 border-card-border font-bold gap-1.5"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </Button>
          <Button
            onClick={handleExport}
            size="sm"
            disabled={exporting}
            className="text-xs h-9 text-white font-bold gap-1.5"
            style={{ backgroundColor: brandColor }}
          >
            <Download className="h-3.5 w-3.5" />
            {exporting ? 'Compiling...' : 'Export Report'}
          </Button>
        </div>
      </div>

      {/* CEO Executive Briefing Panel */}
      <Card className="border border-card-border bg-gradient-to-br from-hq-blue/5 to-hq-purple/5 p-5 shadow-[var(--card-shadow)] text-left space-y-4">
        <div className="flex items-center gap-3">
          <div
            className="h-10 w-10 rounded-full flex items-center justify-center font-extrabold text-white text-xs shrink-0"
            style={{ backgroundColor: brandColor }}
          >
            CEO
          </div>
          <div>
            <p className="text-xs font-bold text-foreground/50 uppercase tracking-widest">
              Executive Briefing — {ceoName}
            </p>
            <p className="text-[10px] text-foreground/40 font-semibold">
              AI-Generated Intelligence Report · {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <Badge variant="ai" className="ml-auto text-[9px]">
            <Sparkles className="h-3 w-3 mr-1" /> Live AI Brief
          </Badge>
        </div>

        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-3 bg-foreground/10 rounded animate-pulse" style={{ width: `${70 + i * 10}%` }}></div>
            ))}
          </div>
        ) : (
          <div className="space-y-1">
            {briefing.split('\n').filter(Boolean).map((line, i) => (
              <p key={i} className={`text-sm font-semibold leading-relaxed ${
                i === 0 ? 'text-[#1A1A1E] dark:text-white font-extrabold text-base' : 'text-foreground/75'
              }`}>
                {line}
              </p>
            ))}
          </div>
        )}
      </Card>

      {/* Health Score KPI Row */}
      {!loading && metrics && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border border-card-border bg-card-bg shadow-[var(--card-shadow)] p-4 text-left">
            <p className="text-[10px] text-foreground/45 font-bold uppercase tracking-widest">Business Health</p>
            <div className="text-3xl font-black mt-1" style={{ color: brandColor }}>{metrics.healthScore}%</div>
            <p className="text-[10px] text-foreground/50 mt-1 font-semibold flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-green-500" /> Operational efficiency index
            </p>
          </Card>

          <Card className="border border-card-border bg-card-bg shadow-[var(--card-shadow)] p-4 text-left">
            <p className="text-[10px] text-foreground/45 font-bold uppercase tracking-widest">Mission Success</p>
            <div className="text-3xl font-black mt-1 text-hq-cyan">{metrics.missions.successRate}%</div>
            <p className="text-[10px] text-foreground/50 mt-1 font-semibold">
              {metrics.missions.completed} of {metrics.missions.total} completed
            </p>
          </Card>

          <Card className="border border-card-border bg-card-bg shadow-[var(--card-shadow)] p-4 text-left">
            <p className="text-[10px] text-foreground/45 font-bold uppercase tracking-widest">Active Missions</p>
            <div className="text-3xl font-black mt-1 text-hq-purple">{metrics.missions.active}</div>
            <p className="text-[10px] text-foreground/50 mt-1 font-semibold">
              Executing across all departments
            </p>
          </Card>

          <Card className="border border-card-border bg-card-bg shadow-[var(--card-shadow)] p-4 text-left">
            <p className="text-[10px] text-foreground/45 font-bold uppercase tracking-widest">Storage Used</p>
            <div className="text-3xl font-black mt-1 text-amber-500">{formatBytes(metrics.storage.used)}</div>
            <p className="text-[10px] text-foreground/50 mt-1 font-semibold capitalize">
              {metrics.storage.planCode} tier quota active
            </p>
          </Card>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex gap-1.5 border-b border-card-border">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold border-b-2 transition-all ${
                activeTab === tab.id
                  ? 'border-current text-white'
                  : 'border-transparent text-foreground/55 hover:text-foreground'
              }`}
              style={activeTab === tab.id ? { borderColor: brandColor, color: brandColor } : {}}
            >
              <Icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <div className="h-8 w-8 rounded-full border-2 border-hq-blue border-t-transparent animate-spin"></div>
          <p className="text-xs text-foreground/50">Loading executive intelligence...</p>
        </div>
      ) : metrics && (
        <div className="space-y-6">

          {/* === OVERVIEW TAB === */}
          {activeTab === 'overview' && (
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Mission Breakdown Donut */}
              <Card className="border border-card-border bg-card-bg p-5 shadow-[var(--card-shadow)] text-left space-y-4">
                <div>
                  <p className="text-[10px] text-foreground/45 font-bold uppercase tracking-widest">Mission Breakdown</p>
                  <h3 className="text-sm font-extrabold text-[#1A1A1E] dark:text-white mt-0.5">Execution Overview</h3>
                </div>
                {renderMissionDonut()}
                <div className="border-t border-card-border pt-3 flex justify-between text-[10px] font-bold text-foreground/55">
                  <span>Success Rate: <span className="text-hq-cyan">{metrics.missions.successRate}%</span></span>
                  <span>Total Missions: <span className="text-[#1A1A1E] dark:text-white">{metrics.missions.total}</span></span>
                </div>
              </Card>

              {/* Credit Outflow Chart */}
              <Card className="border border-card-border bg-card-bg p-5 shadow-[var(--card-shadow)] text-left space-y-4">
                <div>
                  <p className="text-[10px] text-foreground/45 font-bold uppercase tracking-widest">AI Credit Outflow</p>
                  <h3 className="text-sm font-extrabold text-[#1A1A1E] dark:text-white mt-0.5">Weekly Expenditure Trend</h3>
                </div>
                {renderCreditChart()}
                <div className="flex justify-between w-full text-[9px] text-foreground/45 font-mono">
                  {metrics.creditOutflow.map((d) => (
                    <span key={d.day}>{d.day}</span>
                  ))}
                </div>
              </Card>

              {/* AI Recommendations */}
              <div className="lg:col-span-2 space-y-3">
                <h3 className="text-sm font-extrabold text-[#1A1A1E] dark:text-white flex items-center gap-2">
                  <Target className="h-4 w-4 text-hq-cyan" />
                  Strategic Recommendations
                </h3>
                {metrics.recommendations.map((rec) => (
                  <Card
                    key={rec.id}
                    className={`border p-4 shadow-[var(--card-shadow)] text-left ${
                      rec.type === 'risk'
                        ? 'border-red-500/20 bg-red-500/5'
                        : 'border-hq-cyan/20 bg-hq-cyan/5'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        {rec.type === 'risk'
                          ? <AlertTriangle className="h-4 w-4 text-red-400 mt-0.5 shrink-0" />
                          : <Lightbulb className="h-4 w-4 text-hq-cyan mt-0.5 shrink-0" />
                        }
                        <div>
                          <p className="text-xs font-extrabold text-[#1A1A1E] dark:text-white">{rec.title}</p>
                          <p className="text-[11px] text-foreground/65 mt-1 leading-relaxed font-semibold">{rec.description}</p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-[10px] text-foreground/45 font-bold uppercase">Confidence</p>
                        <p className="text-sm font-extrabold text-hq-cyan">{rec.confidence}%</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* === EXECUTIVES TAB === */}
          {activeTab === 'executives' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-[#1A1A1E] dark:text-white flex items-center gap-2">
                  <Users className="h-4 w-4 text-hq-purple" />
                  C-Suite Utilization Report
                </h3>
                <Badge variant="ai" className="text-[9px]">This Week</Badge>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {metrics.executiveUtilization.map((exec, i) => {
                  const colors = ['#0A84FF', '#0EA5E9', '#8B5CF6', '#F59E0B'];
                  return (
                    <Card key={i} className="border border-card-border bg-card-bg p-4 shadow-[var(--card-shadow)] text-left space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className="h-9 w-9 rounded-full flex items-center justify-center font-extrabold text-white text-[10px] shrink-0"
                            style={{ backgroundColor: colors[i % colors.length] }}
                          >
                            {exec.name.split(' ').map(n => n[0]).join('').slice(0, 3)}
                          </div>
                          <div>
                            <p className="text-xs font-extrabold text-[#1A1A1E] dark:text-white">{exec.name}</p>
                            <p className="text-[10px] text-foreground/50 font-semibold">{exec.title}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-extrabold text-[#1A1A1E] dark:text-white">{exec.percentage}%</p>
                          <p className="text-[10px] text-foreground/45 font-semibold">{exec.hours} hrs/wk</p>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="h-2 w-full bg-[#F9F9FB] dark:bg-[#0A0A0C] rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{ width: `${exec.percentage}%`, backgroundColor: colors[i % colors.length] }}
                          ></div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>

              <Card className="border border-card-border bg-card-bg p-5 shadow-[var(--card-shadow)] text-left">
                <h4 className="text-xs font-extrabold text-[#1A1A1E] dark:text-white mb-3">Executive Team Performance Summary</h4>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-extrabold text-hq-cyan">
                      {Math.round(metrics.executiveUtilization.reduce((s, e) => s + e.percentage, 0) / metrics.executiveUtilization.length)}%
                    </p>
                    <p className="text-[10px] text-foreground/50 font-semibold mt-1">Average Utilization</p>
                  </div>
                  <div>
                    <p className="text-2xl font-extrabold text-hq-purple">
                      {metrics.executiveUtilization.reduce((s, e) => s + e.hours, 0)}
                    </p>
                    <p className="text-[10px] text-foreground/50 font-semibold mt-1">Total Hours Active</p>
                  </div>
                  <div>
                    <p className="text-2xl font-extrabold" style={{ color: brandColor }}>
                      {metrics.executiveUtilization.length}
                    </p>
                    <p className="text-[10px] text-foreground/50 font-semibold mt-1">Active Directors</p>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* === AI & COSTS TAB === */}
          {activeTab === 'costs' && (
            <div className="space-y-4">
              <h3 className="text-sm font-extrabold text-[#1A1A1E] dark:text-white flex items-center gap-2">
                <Zap className="h-4 w-4 text-amber-500" />
                AI Usage & Cost Intelligence
              </h3>

              <div className="grid gap-4 md:grid-cols-3">
                {[
                  { label: 'Credits Consumed (Week)', value: metrics.creditOutflow.reduce((s, d) => s + d.credits, 0).toLocaleString(), color: brandColor },
                  { label: 'Avg Daily Spend', value: Math.round(metrics.creditOutflow.reduce((s, d) => s + d.credits, 0) / 7).toLocaleString(), color: '#0EA5E9' },
                  { label: 'Peak Usage Day', value: metrics.creditOutflow.reduce((a, b) => a.credits > b.credits ? a : b).day, color: '#8B5CF6' },
                ].map((stat, i) => (
                  <Card key={i} className="border border-card-border bg-card-bg p-4 shadow-[var(--card-shadow)] text-left">
                    <p className="text-[10px] text-foreground/45 font-bold uppercase tracking-widest">{stat.label}</p>
                    <p className="text-2xl font-extrabold mt-1" style={{ color: stat.color }}>{stat.value}</p>
                  </Card>
                ))}
              </div>

              {/* Full weekly credit chart */}
              <Card className="border border-card-border bg-card-bg p-5 shadow-[var(--card-shadow)] text-left space-y-3">
                <p className="text-xs font-extrabold text-[#1A1A1E] dark:text-white">Weekly Credit Outflow Breakdown</p>
                {renderCreditChart()}
                <div className="grid grid-cols-7 gap-1 text-center">
                  {metrics.creditOutflow.map((d) => (
                    <div key={d.day}>
                      <p className="text-[9px] font-mono text-foreground/45">{d.day}</p>
                      <p className="text-[10px] font-extrabold text-[#1A1A1E] dark:text-white">{d.credits.toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="border border-card-border bg-card-bg p-5 shadow-[var(--card-shadow)] text-left space-y-3">
                <p className="text-xs font-extrabold text-[#1A1A1E] dark:text-white">Storage Cost Intelligence</p>
                <div className="space-y-2">
                  <div className="flex justify-between items-baseline text-[11px]">
                    <span className="text-foreground/70 font-semibold">Storage Consumed</span>
                    <span className="font-extrabold text-[#1A1A1E] dark:text-white">{formatBytes(metrics.storage.used)}</span>
                  </div>
                  <div className="h-2 w-full bg-[#F9F9FB] dark:bg-[#0A0A0C] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-hq-blue rounded-full transition-all"
                      style={{ width: `${Math.min((metrics.storage.used / metrics.storage.limit) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-[10px] text-foreground/45 font-semibold">
                    <span>Plan: <span className="font-extrabold capitalize text-foreground/70">{metrics.storage.planCode}</span></span>
                    <span>Quota: {formatBytes(metrics.storage.limit)}</span>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* === SECURITY TAB === */}
          {activeTab === 'security' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-[#1A1A1E] dark:text-white flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 text-hq-purple" />
                  Security & Compliance Audit
                </h3>
                <Link href="/admin/compliance" className="text-[10px] text-hq-cyan font-extrabold hover:opacity-80">
                  Full Compliance Centre →
                </Link>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {[
                  { label: 'MFA Adoption', value: '100%', color: '#22C55E' },
                  { label: 'Failed Auth Attempts', value: '0', color: '#0EA5E9' },
                  { label: 'Security Events Today', value: metrics.securityLogs.length.toString(), color: brandColor },
                ].map((stat, i) => (
                  <Card key={i} className="border border-card-border bg-card-bg p-4 shadow-[var(--card-shadow)] text-left">
                    <p className="text-[10px] text-foreground/45 font-bold uppercase tracking-widest">{stat.label}</p>
                    <p className="text-2xl font-extrabold mt-1" style={{ color: stat.color }}>{stat.value}</p>
                  </Card>
                ))}
              </div>

              <Card className="border border-card-border bg-card-bg p-5 shadow-[var(--card-shadow)] text-left space-y-3">
                <p className="text-xs font-extrabold text-[#1A1A1E] dark:text-white">Recent Security Audit Trail</p>
                <div className="space-y-2">
                  {metrics.securityLogs.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-center justify-between p-3 rounded-xl border border-card-border bg-[#F9F9FB] dark:bg-[#0A0A0C]"
                    >
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                        <div>
                          <p className="text-[11px] font-extrabold text-[#1A1A1E] dark:text-white">{log.event}</p>
                          <p className="text-[10px] text-foreground/50 font-semibold">{log.user} · {log.time}</p>
                        </div>
                      </div>
                      <span className="text-[9px] font-extrabold text-green-500 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-full">
                        {log.status}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
