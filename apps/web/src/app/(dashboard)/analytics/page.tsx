'use client';

import * as React from 'react';
import { Card, Button, Badge } from '@hq/ui';
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
  Network,
  Trash2,
  Play,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { useAuth } from '../../../contexts/auth-context';
import { KpiRowSkeleton, CardSkeleton } from '../../../components/skeletons';
import { toast } from '../../../components/toast';
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
  category: 'Strategy' | 'Operations' | 'Finance' | 'Compliance';
  confidence: number;
  impact: 'High' | 'Medium' | 'Low';
  effort: 'High' | 'Medium' | 'Low';
  description: string;
  executives: string[];
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
  { id: 'overview', label: 'Briefing & Inbox', icon: Activity },
  { id: 'graph', label: 'Knowledge Graph', icon: Network },
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

  // Filters & Sorting state
  const [activeCategory, setActiveCategory] = React.useState<string>('all');
  const [sortBy, setSortBy] = React.useState<'priority' | 'confidence'>('priority');
  const [dismissedIds, setDismissedIds] = React.useState<string[]>([]);

  // Selected Graph Node details state
  const [selectedNode, setSelectedNode] = React.useState<{ id: string; type: string; label: string; description: string } | null>({
    id: 'org',
    type: 'Organization Twin',
    label: 'Acme Corporation Twin',
    description: 'Living organizational graph containing 8 layers. Serves as corporate memory.',
  });

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
        // Enrich metrics recommendations with Categories & details
        const enriched: AnalyticsMetrics = {
          ...m,
          recommendations: [
            {
              id: 'rec-1',
              title: 'West African Shipping Outreach Potential',
              type: 'opportunity',
              category: 'Strategy',
              confidence: 94,
              impact: 'High',
              effort: 'Medium',
              description: 'Operations analysis indicates ₦4.2M gross potential yield if shipping corridor proposals scale up.',
              executives: ['CEO Elena', 'CFO Sophia'],
            },
            {
              id: 'rec-2',
              title: 'Webhook Compliance Signature Check',
              type: 'risk',
              category: 'Compliance',
              confidence: 98,
              impact: 'High',
              effort: 'Low',
              description: 'Rotation required for sandbox keys to bypass compliance warning thresholds.',
              executives: ['CTO Hiroshi', 'CS Yuki'],
            },
            {
              id: 'rec-3',
              title: 'SOP Document Duplicate Cleanup',
              type: 'opportunity',
              category: 'Operations',
              confidence: 85,
              impact: 'Medium',
              effort: 'Low',
              description: 'Detected duplicate SOP logs inside Layer 6 Knowledge base. Clean footprint to save context tokens.',
              executives: ['COS Arthur'],
            },
            {
              id: 'rec-4',
              title: 'Ad Conversion Campaign Re-targeting',
              type: 'opportunity',
              category: 'Finance',
              confidence: 90,
              impact: 'High',
              effort: 'Medium',
              description: 'Spend margins show Q2 marketing conversion levels dropped 4% below expectations. Leverage re-targeting flow.',
              executives: ['CMO Amara', 'CFO Sophia'],
            }
          ]
        };
        setMetrics(enriched);
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

  const handleLaunchMission = (recTitle: string) => {
    toast.success(`🚀 Spawning strategic mission boardroom for: "${recTitle}"`);
  };

  const handleDismiss = (id: string) => {
    setDismissedIds(p => [...p, id]);
    toast.info('🗑️ Recommendation dismissed');
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

  // Filter recommendations
  const activeRecs = (metrics?.recommendations || [])
    .filter(r => !dismissedIds.includes(r.id))
    .filter(r => activeCategory === 'all' || r.category.toLowerCase() === activeCategory)
    .sort((a, b) => {
      if (sortBy === 'confidence') return b.confidence - a.confidence;
      // priority sort (Critical/High -> Medium -> Low)
      const weight = (impact: string) => impact === 'High' ? 3 : impact === 'Medium' ? 2 : 1;
      return weight(b.impact) - weight(a.impact);
    });

  return (
    <div className="space-y-8 select-none text-foreground pb-12">
      {/* Page Header */}
      <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0 border-b border-card-border pb-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#1A1A1E] dark:text-white flex items-center gap-2">
            <BarChart3 className="h-8 w-8 text-hq-blue" />
            Analytics & Recommendations
          </h1>
          <p className="text-foreground/60 text-sm mt-1">
            Executive-grade business intelligence with AI-driven briefings, RAG Knowledge Graph and strategic recommendations.
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
        <div className="space-y-5 animate-in fade-in duration-300">
          <KpiRowSkeleton count={4} />
          <div className="grid gap-6 lg:grid-cols-2">
            <CardSkeleton lines={5} />
            <CardSkeleton lines={5} />
          </div>
        </div>
      ) : metrics && (
        <div className="space-y-6">

          {/* === BRIEFING & INBOX TAB === */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
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
                    <p className="text-xs text-foreground/40 font-semibold">
                      AI-Generated Intelligence Report · {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                  <Badge variant="ai" className="ml-auto text-xs">
                    <Sparkles className="h-3 w-3 mr-1" /> Live AI Brief
                  </Badge>
                </div>
                <div className="space-y-1">
                  {briefing.split('\n').filter(Boolean).map((line, i) => (
                    <p key={i} className={`text-sm font-semibold leading-relaxed ${
                      i === 0 ? 'text-[#1A1A1E] dark:text-white font-extrabold text-base' : 'text-foreground/75'
                    }`}>
                      {line}
                    </p>
                  ))}
                </div>
              </Card>

              {/* Health Score KPI Row */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card className="border border-card-border bg-card-bg shadow-[var(--card-shadow)] p-4 text-left">
                  <p className="text-xs text-foreground/45 font-bold uppercase tracking-widest">Business Health</p>
                  <div className="text-3xl font-black mt-1" style={{ color: brandColor }}>{metrics.healthScore}%</div>
                  <p className="text-xs text-foreground/50 mt-1 font-semibold flex items-center gap-1">
                    <TrendingUp className="h-3 w-3 text-green-500" /> Operational efficiency index
                  </p>
                </Card>

                <Card className="border border-card-border bg-card-bg shadow-[var(--card-shadow)] p-4 text-left">
                  <p className="text-xs text-foreground/45 font-bold uppercase tracking-widest">Mission Success</p>
                  <div className="text-3xl font-black mt-1 text-hq-cyan">{metrics.missions.successRate}%</div>
                  <p className="text-xs text-foreground/50 mt-1 font-semibold">
                    {metrics.missions.completed} of {metrics.missions.total} completed
                  </p>
                </Card>

                <Card className="border border-card-border bg-card-bg shadow-[var(--card-shadow)] p-4 text-left">
                  <p className="text-xs text-foreground/45 font-bold uppercase tracking-widest">Active Missions</p>
                  <div className="text-3xl font-black mt-1 text-hq-purple">{metrics.missions.active}</div>
                  <p className="text-xs text-foreground/50 mt-1 font-semibold">
                    Executing across all departments
                  </p>
                </Card>

                <Card className="border border-card-border bg-card-bg shadow-[var(--card-shadow)] p-4 text-left">
                  <p className="text-xs text-foreground/45 font-bold uppercase tracking-widest">Storage Used</p>
                  <div className="text-3xl font-black mt-1 text-amber-500">{formatBytes(metrics.storage.used)}</div>
                  <p className="text-xs text-foreground/50 mt-1 font-semibold capitalize">
                    {metrics.storage.planCode} tier quota active
                  </p>
                </Card>
              </div>

              {/* Recommendation Inbox Center */}
              <div className="space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-card-border pb-3">
                  <div className="flex items-center gap-2">
                    <Target className="h-4.5 w-4.5 text-hq-cyan" />
                    <div>
                      <h2 className="text-sm font-extrabold text-[#1A1A1E] dark:text-white">Actionable Strategic Inbox</h2>
                      <p className="text-xs text-foreground/50">Proactive opportunities & risk mitigations generated by the board.</p>
                    </div>
                  </div>
                  
                  {/* Filters & Sorting */}
                  <div className="flex items-center gap-2 text-xs">
                    <Badge variant="neutral" className="text-xs gap-1 h-7">
                      <Filter className="h-3 w-3" />
                      Filter:
                    </Badge>
                    <div className="flex bg-[#F9F9FB] dark:bg-[#0A0A0C] border border-card-border rounded-lg p-0.5">
                      {['all', 'strategy', 'operations', 'finance', 'compliance'].map(cat => (
                        <button
                          key={cat}
                          onClick={() => setActiveCategory(cat)}
                          className={`px-2.5 py-1 rounded text-xs font-bold uppercase ${
                            activeCategory === cat ? 'bg-background text-white shadow-sm' : 'text-foreground/45 hover:text-foreground'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>

                    <select
                      className="bg-card-bg border border-card-border rounded-lg px-2 h-7 text-xs font-bold focus:outline-none"
                      value={sortBy}
                      onChange={e => setSortBy(e.target.value as any)}
                    >
                      <option value="priority">Sort: Impact</option>
                      <option value="confidence">Sort: Confidence</option>
                    </select>
                  </div>
                </div>

                {activeRecs.length === 0 ? (
                  <div className="py-12 text-center text-xs text-foreground/40 font-semibold border border-dashed border-card-border rounded-xl">
                    No active inbox recommendations. Great job!
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    {activeRecs.map(rec => (
                      <Card
                        key={rec.id}
                        className={`border p-5 shadow-[var(--card-shadow)] text-left flex flex-col justify-between ${
                          rec.type === 'risk' ? 'border-red-500/20 bg-red-500/5' : 'border-hq-cyan/20 bg-hq-cyan/5'
                        }`}
                      >
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <Badge variant={rec.type === 'risk' ? 'error' : 'success'} className="text-sm tracking-wider uppercase font-black">
                              {rec.type} · {rec.category}
                            </Badge>
                            <span className="text-xs font-bold text-foreground/40">Confidence: {rec.confidence}%</span>
                          </div>

                          <div>
                            <h4 className="text-xs font-black text-[#1A1A1E] dark:text-white">{rec.title}</h4>
                            <p className="text-[10.5px] text-foreground/60 font-semibold mt-1 leading-relaxed">{rec.description}</p>
                          </div>

                          <div className="flex flex-wrap gap-2 text-xs font-bold text-foreground/50">
                            <span>Impact: <span className={rec.impact === 'High' ? 'text-red-500' : 'text-[#1A1A1E] dark:text-white'}>{rec.impact}</span></span>
                            <span>·</span>
                            <span>Effort: <span className="text-[#1A1A1E] dark:text-white">{rec.effort}</span></span>
                            <span>·</span>
                            <span>Consultants: <span className="text-hq-purple">{rec.executives.join(', ')}</span></span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 pt-4 border-t border-card-border mt-4 shrink-0">
                          <Button
                            size="sm"
                            className="flex-1 text-white text-xs font-bold h-7.5 gap-1"
                            style={{ backgroundColor: brandColor }}
                            onClick={() => handleLaunchMission(rec.title)}
                          >
                            <Play className="h-3 w-3 fill-current" />
                            Launch Mission
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs border-card-border font-bold h-7.5"
                            onClick={() => handleDismiss(rec.id)}
                          >
                            Dismiss
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              {/* Weekly Overview Metrics */}
              <div className="grid gap-6 lg:grid-cols-2">
                <Card className="border border-card-border bg-card-bg p-5 shadow-[var(--card-shadow)] text-left space-y-4">
                  <div>
                    <p className="text-xs text-foreground/45 font-bold uppercase tracking-widest">Mission Breakdown</p>
                    <h3 className="text-sm font-extrabold text-[#1A1A1E] dark:text-white mt-0.5">Execution Overview</h3>
                  </div>
                  {renderMissionDonut()}
                  <div className="border-t border-card-border pt-3 flex justify-between text-xs font-bold text-foreground/55">
                    <span>Success Rate: <span className="text-hq-cyan">{metrics.missions.successRate}%</span></span>
                    <span>Total Missions: <span className="text-[#1A1A1E] dark:text-white">{metrics.missions.total}</span></span>
                  </div>
                </Card>

                <Card className="border border-card-border bg-card-bg p-5 shadow-[var(--card-shadow)] text-left space-y-4">
                  <div>
                    <p className="text-xs text-foreground/45 font-bold uppercase tracking-widest">AI Credit Outflow</p>
                    <h3 className="text-sm font-extrabold text-[#1A1A1E] dark:text-white mt-0.5">Weekly Expenditure Trend</h3>
                  </div>
                  {renderCreditChart()}
                  <div className="flex justify-between w-full text-xs text-foreground/45 font-mono">
                    {metrics.creditOutflow.map((d) => (
                      <span key={d.day}>{d.day}</span>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* === KNOWLEDGE GRAPH TAB === */}
          {activeTab === 'graph' && (
            <div className="grid gap-5 md:grid-cols-3 text-left">
              <Card className="border border-card-border bg-card-bg p-5 shadow-[var(--card-shadow)] md:col-span-2 space-y-4">
                <div>
                  <h3 className="text-sm font-extrabold text-[#1A1A1E] dark:text-white flex items-center gap-2">
                    <Network className="h-4 w-4 text-hq-purple" />
                    Living RAG Knowledge Graph
                  </h3>
                  <p className="text-xs text-foreground/50">Visualizing interconnected organizational facts across departments, AI executives, and live assets.</p>
                </div>

                {/* SVG Graph diagram */}
                <div className="border border-card-border bg-[#F9F9FB] dark:bg-[#08080A] rounded-2xl relative overflow-hidden h-90">
                  <svg className="w-full h-full" viewBox="0 0 500 350">
                    <defs>
                      <marker id="arrow" viewBox="0 0 10 10" refX="18" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                        <path d="M 0 0 L 10 5 L 0 10 z" fill="#ffffff" fillOpacity={0.15} />
                      </marker>
                    </defs>

                    {/* Nodes Connectors */}
                    {[
                      { x1: 250, y1: 175, x2: 120, y2: 80 },  // Org -> Executive Dept
                      { x1: 250, y1: 175, x2: 380, y2: 80 },  // Org -> Finance Dept
                      { x1: 120, y1: 80, x2: 80, y2: 180 },   // Executive Dept -> CEO Elena
                      { x1: 380, y1: 80, x2: 420, y2: 180 },  // Finance Dept -> CFO Sophia
                      { x1: 80, y1: 180, x2: 160, y2: 280 },  // CEO -> Strategy Mission
                      { x1: 420, y1: 180, x2: 340, y2: 280 }, // CFO -> Financial Audit
                      { x1: 160, y1: 280, x2: 250, y2: 175 }, // Mission -> Org Twin (Save)
                    ].map((line, i) => (
                      <line
                        key={i}
                        x1={line.x1} y1={line.y1}
                        x2={line.x2} y2={line.y2}
                        stroke="#ffffff" strokeOpacity={0.12}
                        strokeWidth={1.5}
                        strokeDasharray="4 4"
                        markerEnd="url(#arrow)"
                      />
                    ))}

                    {/* Node points */}
                    {[
                      { id: 'org', label: 'Org Twin', x: 250, y: 175, color: brandColor, desc: 'Central organization brain and memory layers.' },
                      { id: 'dept-exec', label: 'Exec Dept', x: 120, y: 80, color: '#8B5CF6', desc: 'Executive department orchestrating operations.' },
                      { id: 'dept-fin', label: 'Finance Dept', x: 380, y: 80, color: '#30D158', desc: 'Finance & margins appraisal bounds.' },
                      { id: 'ceo', label: 'CEO Elena', x: 80, y: 180, color: brandColor, desc: 'CEO Director. Manages final reviews.' },
                      { id: 'cfo', label: 'CFO Sophia', x: 420, y: 180, color: '#30D158', desc: 'Finance Director. Analyzes credit outflow budgets.' },
                      { id: 'mission-strat', label: 'Strategy Mission', x: 160, y: 280, color: '#0EA5E9', desc: 'Active shipping outreach strategy campaign WBS.' },
                      { id: 'asset-policy', label: 'SOP Policy', x: 340, y: 280, color: '#EC4899', desc: 'GDP compliance SOP document in Knowledge Layer.' },
                    ].map(node => (
                      <g
                        key={node.id}
                        className="cursor-pointer group"
                        onClick={() => setSelectedNode({ id: node.id, type: 'Knowledge Node', label: node.label, description: node.desc })}
                      >
                        <circle
                          cx={node.x} cy={node.y} r={22}
                          fill="#0A0A0C"
                          stroke={selectedNode?.id === node.id ? '#white' : node.color}
                          strokeWidth={selectedNode?.id === node.id ? 3 : 2}
                          className="transition-all duration-300 hover:scale-110"
                        />
                        <text
                          x={node.x} y={node.y + 4}
                          fill="#ffffff"
                          fontSize="7"
                          fontWeight="black"
                          textAnchor="middle"
                          className="pointer-events-none"
                        >
                          {node.label.slice(0, 8)}
                        </text>
                      </g>
                    ))}
                  </svg>
                </div>
              </Card>

              {/* Node detail side card */}
              <div className="space-y-4">
                <Card className="border border-card-border bg-card-bg p-5 shadow-[var(--card-shadow)] h-full">
                  {selectedNode ? (
                    <div className="space-y-4">
                      <div>
                        <Badge variant="ai" className="text-sm font-black uppercase tracking-wider">{selectedNode.type}</Badge>
                        <h4 className="text-sm font-black text-[#1A1A1E] dark:text-white mt-1.5">{selectedNode.label}</h4>
                      </div>
                      <p className="text-sm text-foreground/50 font-semibold leading-relaxed">{selectedNode.description}</p>
                      
                      <div className="border-t border-card-border pt-4 space-y-3 text-xs font-bold">
                        <p className="uppercase tracking-widest text-foreground/45 text-[8.5px]">Graph Relations</p>
                        <div className="flex justify-between">
                          <span className="text-foreground/40">Inbound Connections</span>
                          <span className="text-white">2 edges</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-foreground/40">Outbound Connections</span>
                          <span className="text-white">3 edges</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-foreground/40">Verification Confidence</span>
                          <span className="text-[#30D158]">98% (High)</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center py-12 text-center text-foreground/40 text-xs">
                      <Network className="h-8 w-8 text-foreground/20 mb-2" />
                      <span>Select a graph node to inspect relationships</span>
                    </div>
                  )}
                </Card>
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
                <Badge variant="ai" className="text-xs">This Week</Badge>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {metrics.executiveUtilization.map((exec, i) => {
                  const colors = ['#0A84FF', '#0EA5E9', '#8B5CF6', '#F59E0B'];
                  return (
                    <Card key={i} className="border border-card-border bg-card-bg p-4 shadow-[var(--card-shadow)] text-left space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className="h-9 w-9 rounded-full flex items-center justify-center font-extrabold text-white text-xs shrink-0"
                            style={{ backgroundColor: colors[i % colors.length] }}
                          >
                            {exec.name.split(' ').map(n => n[0]).join('').slice(0, 3)}
                          </div>
                          <div>
                            <p className="text-xs font-extrabold text-[#1A1A1E] dark:text-white">{exec.name}</p>
                            <p className="text-xs text-foreground/50 font-semibold">{exec.title}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-extrabold text-[#1A1A1E] dark:text-white">{exec.percentage}%</p>
                          <p className="text-xs text-foreground/45 font-semibold">{exec.hours} hrs/wk</p>
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
                    <p className="text-xs text-foreground/50 font-semibold mt-1">Average Utilization</p>
                  </div>
                  <div>
                    <p className="text-2xl font-extrabold text-hq-purple">
                      {metrics.executiveUtilization.reduce((s, e) => s + e.hours, 0)}
                    </p>
                    <p className="text-xs text-foreground/50 font-semibold mt-1">Total Hours Active</p>
                  </div>
                  <div>
                    <p className="text-2xl font-extrabold" style={{ color: brandColor }}>
                      {metrics.executiveUtilization.length}
                    </p>
                    <p className="text-xs text-foreground/50 font-semibold mt-1">Active Directors</p>
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
                    <p className="text-xs text-foreground/45 font-bold uppercase tracking-widest">{stat.label}</p>
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
                      <p className="text-xs font-mono text-foreground/45">{d.day}</p>
                      <p className="text-xs font-extrabold text-[#1A1A1E] dark:text-white">{d.credits.toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="border border-card-border bg-card-bg p-5 shadow-[var(--card-shadow)] text-left space-y-3">
                <p className="text-xs font-extrabold text-[#1A1A1E] dark:text-white">Storage Cost Intelligence</p>
                <div className="space-y-2">
                  <div className="flex justify-between items-baseline text-sm">
                    <span className="text-foreground/70 font-semibold">Storage Consumed</span>
                    <span className="font-extrabold text-[#1A1A1E] dark:text-white">{formatBytes(metrics.storage.used)}</span>
                  </div>
                  <div className="h-2 w-full bg-[#F9F9FB] dark:bg-[#0A0A0C] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-hq-blue rounded-full transition-all"
                      style={{ width: `${Math.min((metrics.storage.used / metrics.storage.limit) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-foreground/45 font-semibold">
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
                <Link href="/admin/compliance" className="text-xs text-hq-cyan font-extrabold hover:opacity-80">
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
                    <p className="text-xs text-foreground/45 font-bold uppercase tracking-widest">{stat.label}</p>
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
                          <p className="text-sm font-extrabold text-[#1A1A1E] dark:text-white">{log.event}</p>
                          <p className="text-xs text-foreground/50 font-semibold">{log.user} · {log.time}</p>
                        </div>
                      </div>
                      <span className="text-xs font-extrabold text-green-500 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-full">
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
