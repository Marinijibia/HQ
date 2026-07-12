'use client';

import * as React from 'react';
import { Card, Button, Badge } from '@hq/ui';
import {
  Brain,
  Building2,
  Briefcase,
  Network,
  Target,
  Settings2,
  Palette,
  Users,
  Globe,
  Cpu,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Edit3,
  Save,
  Sparkles,
  TrendingUp,
  Clock,
  RefreshCw,
  Plus,
} from 'lucide-react';
import { useAuth } from '../../../contexts/auth-context';

// ─── Domain definitions ───────────────────────────────────────────────────────

interface DomainStatus {
  domain: string;
  label: string;
  confidence: number;
  hasData: boolean;
  data: Record<string, unknown> | null;
}

interface Intelligence {
  id: string;
  overallConfidence: number;
  lastLearnedAt: string | null;
  pendingSuggestions: { id: string; domain: string; title: string; description: string }[];
  domainStatuses: DomainStatus[];
  missingItems: string[];
}

const DOMAIN_CONFIG = [
  { key: 'identity', label: 'Organization Identity', icon: Building2, color: '#0A84FF', description: 'Name, legal entity, country, timezone, industry, size' },
  { key: 'businessModel', label: 'Business Model', icon: Briefcase, color: '#8B5CF6', description: 'Products, revenue streams, target customers, pricing' },
  { key: 'structure', label: 'Org Structure', icon: Network, color: '#0EA5E9', description: 'Departments, teams, roles, reporting relationships' },
  { key: 'strategy', label: 'Strategic Direction', icon: Target, color: '#22C55E', description: 'Vision, mission, values, goals, KPIs, priorities' },
  { key: 'operations', label: 'Operations', icon: Settings2, color: '#F59E0B', description: 'SOPs, workflows, approval processes, compliance' },
  { key: 'brand', label: 'Brand Intelligence', icon: Palette, color: '#EC4899', description: 'Logo, colors, tone of voice, writing guidelines' },
  { key: 'customer', label: 'Customer Intelligence', icon: Users, color: '#14B8A6', description: 'Personas, pain points, buying journey, retention' },
  { key: 'market', label: 'Market Intelligence', icon: Globe, color: '#EF4444', description: 'Competitors, trends, regulations, opportunities' },
  { key: 'technology', label: 'Technology Intelligence', icon: Cpu, color: '#6366F1', description: 'Core software, integrations, APIs, infrastructure' },
  { key: 'learning', label: 'Organizational Learning', icon: BookOpen, color: '#F97316', description: 'Insights from conversations, missions and decisions' },
];

// ─── Domain field configs for editing ─────────────────────────────────────────

const DOMAIN_FIELDS: Record<string, { key: string; label: string; placeholder: string; type?: string }[]> = {
  identity: [
    { key: 'orgName', label: 'Organization Name', placeholder: 'Acme Corporation' },
    { key: 'hqName', label: 'Headquarters Name', placeholder: 'Acme HQ' },
    { key: 'legalEntity', label: 'Legal Entity', placeholder: 'Acme Corp Ltd.' },
    { key: 'country', label: 'Country', placeholder: 'United Kingdom' },
    { key: 'industry', label: 'Industry', placeholder: 'Technology / SaaS' },
    { key: 'size', label: 'Organization Size', placeholder: '50-200 employees' },
    { key: 'stage', label: 'Business Stage', placeholder: 'Growth' },
    { key: 'yearFounded', label: 'Year Founded', placeholder: '2020' },
    { key: 'website', label: 'Website', placeholder: 'https://acme.com' },
  ],
  businessModel: [
    { key: 'products', label: 'Core Products/Services', placeholder: 'SaaS platform, API access' },
    { key: 'revenueStreams', label: 'Revenue Streams', placeholder: 'Monthly subscriptions, enterprise contracts' },
    { key: 'targetCustomers', label: 'Target Customers', placeholder: 'Mid-market B2B companies' },
    { key: 'pricingStrategy', label: 'Pricing Strategy', placeholder: 'Tiered subscription pricing' },
    { key: 'salesModel', label: 'Sales Model', placeholder: 'Product-led growth + sales-assisted' },
    { key: 'geographies', label: 'Geographic Markets', placeholder: 'UK, USA, Nigeria' },
    { key: 'positioning', label: 'Competitive Positioning', placeholder: 'Premium AI-first operating system' },
  ],
  structure: [
    { key: 'departments', label: 'Departments', placeholder: 'Engineering, Marketing, Finance, Operations' },
    { key: 'decisionMakers', label: 'Decision Makers', placeholder: 'CEO, CFO, CTO' },
    { key: 'reportingStructure', label: 'Reporting Structure', placeholder: 'Flat hierarchy, CEO reports to board' },
  ],
  strategy: [
    { key: 'vision', label: 'Vision', placeholder: 'To become the default AI OS for every organization' },
    { key: 'mission', label: 'Mission Statement', placeholder: 'Empower organizations with AI executive intelligence' },
    { key: 'coreValues', label: 'Core Values', placeholder: 'Integrity, Innovation, Excellence' },
    { key: 'longTermGoals', label: 'Long-Term Goals (3-5yr)', placeholder: '$100M ARR, 10,000 organizations' },
    { key: 'annualObjectives', label: 'Annual Objectives', placeholder: 'Launch 5 enterprise accounts, Series A raise' },
    { key: 'kpis', label: 'Key KPIs', placeholder: 'MRR, NPS, Churn rate, Mission completion rate' },
  ],
  operations: [
    { key: 'businessHours', label: 'Business Hours', placeholder: '9am - 6pm GMT, Mon-Fri' },
    { key: 'communicationPrefs', label: 'Communication Preferences', placeholder: 'Async-first, Slack + weekly syncs' },
    { key: 'approvalProcess', label: 'Approval Process', placeholder: 'Manager approval for budgets >£5k' },
    { key: 'compliance', label: 'Compliance Requirements', placeholder: 'GDPR, SOC 2, ISO 27001' },
  ],
  brand: [
    { key: 'brandVoice', label: 'Brand Voice', placeholder: 'Professional, authoritative, forward-thinking' },
    { key: 'toneOfCommunication', label: 'Tone of Communication', placeholder: 'Confident but accessible' },
    { key: 'writingGuidelines', label: 'Writing Guidelines', placeholder: 'Use active voice, short sentences, avoid jargon' },
    { key: 'primaryColor', label: 'Primary Brand Color', placeholder: '#0A84FF' },
    { key: 'marketingMessages', label: 'Key Marketing Messages', placeholder: 'AI executive team for every organization' },
    { key: 'targetAudience', label: 'Target Audience', placeholder: 'CEOs and founders of growth-stage companies' },
  ],
  customer: [
    { key: 'personas', label: 'Customer Personas', placeholder: 'Growth-stage CEO, Enterprise COO' },
    { key: 'painPoints', label: 'Key Pain Points', placeholder: 'Lack of strategic capacity, slow execution' },
    { key: 'buyingJourney', label: 'Buying Journey', placeholder: 'Awareness → Trial → Activation → Expansion' },
    { key: 'retentionChallenges', label: 'Retention Challenges', placeholder: 'Onboarding complexity, unclear ROI' },
  ],
  market: [
    { key: 'competitors', label: 'Main Competitors', placeholder: 'Notion AI, Monday.com, Jasper, Zapier' },
    { key: 'marketTrends', label: 'Market Trends', placeholder: 'AI-first SaaS, autonomous workflows' },
    { key: 'opportunities', label: 'Key Opportunities', placeholder: 'Enterprise expansion, Africa market' },
    { key: 'threats', label: 'Key Threats', placeholder: 'Big tech AI products, commoditization' },
  ],
  technology: [
    { key: 'coreSoftware', label: 'Core Software Stack', placeholder: 'Next.js, NestJS, PostgreSQL, Redis' },
    { key: 'integrations', label: 'Active Integrations', placeholder: 'Slack, Google Drive, Stripe' },
    { key: 'infrastructure', label: 'Infrastructure', placeholder: 'AWS, GCS, Railway' },
    { key: 'securityRequirements', label: 'Security Requirements', placeholder: 'MFA required, RBAC enforced' },
  ],
  learning: [
    { key: 'recentDecisions', label: 'Key Recent Decisions', placeholder: 'Pivoted to enterprise sales in Q2' },
    { key: 'approvedInsights', label: 'Approved Insights', placeholder: 'Customer churn linked to onboarding friction' },
  ],
};

// ─── Confidence ring SVG ──────────────────────────────────────────────────────

function ConfidenceRing({ value, size = 56, color = '#0A84FF' }: { value: number; size?: number; color?: string }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (value / 100) * circ;
  return (
    <svg width={size} height={size} className="rotate-[-90deg]">
      <circle cx={size / 2} cy={size / 2} r={r} strokeWidth={4} stroke="currentColor" fill="none" className="text-foreground/10" />
      <circle
        cx={size / 2} cy={size / 2} r={r} strokeWidth={4}
        stroke={color} fill="none"
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        className="transition-all duration-700"
      />
    </svg>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function IntelligencePage() {
  const { token } = useAuth();
  const [intelligence, setIntelligence] = React.useState<Intelligence | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [activeDomain, setActiveDomain] = React.useState<string | null>(null);
  const [editData, setEditData] = React.useState<Record<string, string>>({});
  const [saving, setSaving] = React.useState(false);
  const [savedMsg, setSavedMsg] = React.useState('');
  const [brandColor, setBrandColor] = React.useState('#0A84FF');

  // Load brand color
  React.useEffect(() => {
    try {
      const draft = JSON.parse(localStorage.getItem('hq_onboarding_draft') || '{}');
      if (draft.brandColor) setBrandColor(draft.brandColor);
    } catch { /* ignore */ }
  }, []);

  // Fetch intelligence model
  React.useEffect(() => {
    if (!token) return;
    fetch('/api/intelligence', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setIntelligence(data); })
      .finally(() => setLoading(false));
  }, [token]);

  // Open a domain for editing
  const openDomain = (domainKey: string) => {
    setActiveDomain(domainKey);
    const domainStatus = intelligence?.domainStatuses?.find(d => d.domain === domainKey);
    if (domainStatus?.data) {
      setEditData(domainStatus.data as Record<string, string>);
    } else {
      setEditData({});
    }
  };

  const handleSaveDomain = async () => {
    if (!token || !activeDomain) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/intelligence/domain/${activeDomain}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(editData),
      });
      if (res.ok) {
        const updated = await res.json();
        setIntelligence(updated);
        setSavedMsg('Domain updated');
        setTimeout(() => setSavedMsg(''), 3000);
        setActiveDomain(null);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleApproveSuggestion = async (id: string) => {
    if (!token) return;
    await fetch(`/api/intelligence/suggestions/${id}/approve`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
    setIntelligence(prev => prev ? { ...prev, pendingSuggestions: prev.pendingSuggestions.filter(s => s.id !== id) } : prev);
  };

  const handleDismissSuggestion = async (id: string) => {
    if (!token) return;
    await fetch(`/api/intelligence/suggestions/${id}/dismiss`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
    setIntelligence(prev => prev ? { ...prev, pendingSuggestions: prev.pendingSuggestions.filter(s => s.id !== id) } : prev);
  };

  const overallConfidence = intelligence?.overallConfidence ?? 0;
  const domainStatuses = intelligence?.domainStatuses ?? DOMAIN_CONFIG.map(d => ({ domain: d.key, label: d.label, confidence: 0, hasData: false, data: null }));
  const pendingSuggestions = intelligence?.pendingSuggestions ?? [];

  // ─── Domain Edit Panel ───────────────────────────────────────────────────────

  if (activeDomain) {
    const cfg = DOMAIN_CONFIG.find(d => d.key === activeDomain)!;
    const Icon = cfg.icon;
    const fields = DOMAIN_FIELDS[activeDomain] || [];
    return (
      <div className="space-y-5 text-foreground pb-12 max-w-3xl">
        {/* Header */}
        <div className="flex items-center gap-3 pb-4 border-b border-card-border">
          <button onClick={() => setActiveDomain(null)} className="text-xs font-bold text-foreground/50 hover:text-foreground transition-colors">← Back</button>
          <div className="h-9 w-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${cfg.color}18` }}>
            <Icon className="h-4.5 w-4.5" style={{ color: cfg.color }} />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-[#1A1A1E] dark:text-white">{cfg.label}</h2>
            <p className="text-[10px] text-foreground/50 font-semibold">{cfg.description}</p>
          </div>
        </div>
        {/* Fields */}
        <div className="grid gap-4 md:grid-cols-2">
          {fields.map(field => (
            <div key={field.key} className="space-y-1.5">
              <label className="text-[10px] font-extrabold text-[#1A1A1E] dark:text-white uppercase tracking-widest">{field.label}</label>
              {field.type === 'textarea' ? (
                <textarea
                  className="w-full min-h-20 rounded-xl border border-card-border bg-[#F9F9FB] dark:bg-[#0A0A0C] px-3 py-2 text-xs font-semibold text-[#1A1A1E] dark:text-white focus:outline-none focus:ring-2 resize-none"
                  style={{ '--tw-ring-color': `${cfg.color}40` } as React.CSSProperties}
                  placeholder={field.placeholder}
                  value={(editData[field.key] as string) || ''}
                  onChange={e => setEditData(p => ({ ...p, [field.key]: e.target.value }))}
                />
              ) : (
                <input
                  className="w-full h-9 rounded-xl border border-card-border bg-[#F9F9FB] dark:bg-[#0A0A0C] px-3 text-xs font-semibold text-[#1A1A1E] dark:text-white focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all"
                  style={{ '--tw-ring-color': `${cfg.color}40` } as React.CSSProperties}
                  placeholder={field.placeholder}
                  value={(editData[field.key] as string) || ''}
                  onChange={e => setEditData(p => ({ ...p, [field.key]: e.target.value }))}
                />
              )}
            </div>
          ))}
        </div>
        {/* Save bar */}
        <div className="flex items-center justify-between pt-4 border-t border-card-border">
          <p className="text-[10px] text-green-500 font-extrabold h-4">{savedMsg}</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="text-xs font-bold border-card-border h-8" onClick={() => setActiveDomain(null)}>Cancel</Button>
            <Button onClick={handleSaveDomain} disabled={saving} size="sm" className="text-white font-bold text-xs h-8" style={{ backgroundColor: cfg.color }}>
              <Save className="h-3.5 w-3.5 mr-1.5" />
              {saving ? 'Saving...' : 'Save Domain'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Main dashboard ──────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 text-foreground pb-12">

      {/* Header */}
      <div className="flex items-start justify-between pb-4 border-b border-card-border">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl flex items-center justify-center shadow-lg" style={{ backgroundColor: `${brandColor}18` }}>
            <Brain className="h-5 w-5" style={{ color: brandColor }} />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-[#1A1A1E] dark:text-white">Organization Intelligence</h1>
            <p className="text-xs text-foreground/55 font-semibold mt-0.5">
              Your Digital Organization Model — what HQ knows about your business
            </p>
          </div>
        </div>
        {intelligence?.lastLearnedAt && (
          <div className="flex items-center gap-1.5 text-foreground/40">
            <RefreshCw className="h-3 w-3" />
            <span className="text-[10px] font-semibold">Last updated {new Date(intelligence.lastLearnedAt).toLocaleDateString()}</span>
          </div>
        )}
      </div>

      {loading ? (
        <div className="py-20 flex items-center justify-center">
          <div className="h-8 w-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: brandColor, borderTopColor: 'transparent' }} />
        </div>
      ) : (
        <>
          {/* Overall confidence + summary row */}
          <div className="grid gap-4 md:grid-cols-4">
            {/* Overall confidence */}
            <Card className="border border-card-border bg-card-bg p-5 shadow-[var(--card-shadow)] md:col-span-1 flex flex-col items-center justify-center space-y-2">
              <div className="relative">
                <ConfidenceRing value={overallConfidence} size={72} color={brandColor} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-extrabold" style={{ color: brandColor }}>{overallConfidence}%</span>
                </div>
              </div>
              <p className="text-[10px] font-extrabold text-foreground/60 uppercase tracking-widest text-center">Overall Confidence</p>
            </Card>

            {/* Stats */}
            {[
              { label: 'Domains Profiled', value: `${domainStatuses.filter(d => d.confidence > 0).length} / 10`, color: '#22C55E', icon: CheckCircle2 },
              { label: 'Pending Suggestions', value: `${pendingSuggestions.length}`, color: '#F59E0B', icon: Sparkles },
              { label: 'Missing Insights', value: `${intelligence?.missingItems?.length ?? 0}`, color: '#EF4444', icon: AlertTriangle },
            ].map((stat, i) => {
              const Icon = stat.icon;
              return (
                <Card key={i} className="border border-card-border bg-card-bg p-4 shadow-[var(--card-shadow)]">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="h-4 w-4 shrink-0" style={{ color: stat.color }} />
                    <p className="text-[10px] font-bold text-foreground/50 uppercase tracking-widest">{stat.label}</p>
                  </div>
                  <p className="text-2xl font-extrabold" style={{ color: stat.color }}>{stat.value}</p>
                </Card>
              );
            })}
          </div>

          {/* Pending suggestions */}
          {pendingSuggestions.length > 0 && (
            <Card className="border border-amber-500/20 bg-amber-500/5 p-5 shadow-[var(--card-shadow)] space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-500" />
                <p className="text-xs font-extrabold text-amber-500">HQ has {pendingSuggestions.length} suggested update{pendingSuggestions.length > 1 ? 's' : ''} awaiting review</p>
              </div>
              {pendingSuggestions.map(s => (
                <div key={s.id} className="flex items-start justify-between gap-4 p-3 rounded-xl border border-amber-500/20 bg-card-bg">
                  <div>
                    <p className="text-xs font-extrabold text-[#1A1A1E] dark:text-white">{s.title}</p>
                    <p className="text-[10px] text-foreground/55 font-semibold mt-0.5">{s.description}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button size="sm" className="text-white text-[10px] font-bold h-7" style={{ backgroundColor: brandColor }} onClick={() => handleApproveSuggestion(s.id)}>Approve</Button>
                    <Button size="sm" variant="outline" className="text-[10px] font-bold h-7 border-card-border" onClick={() => handleDismissSuggestion(s.id)}>Dismiss</Button>
                  </div>
                </div>
              ))}
            </Card>
          )}

          {/* 10 Domain grid */}
          <div>
            <p className="text-xs font-extrabold text-foreground/40 uppercase tracking-widest mb-3">Intelligence Domains</p>
            <div className="grid gap-3 md:grid-cols-2">
              {DOMAIN_CONFIG.map(cfg => {
                const Icon = cfg.icon;
                const status = domainStatuses.find(d => d.domain === cfg.key);
                const confidence = status?.confidence ?? 0;
                const hasData = status?.hasData ?? false;
                const confColor = confidence >= 75 ? '#22C55E' : confidence >= 40 ? '#F59E0B' : '#EF4444';

                return (
                  <button
                    key={cfg.key}
                    onClick={() => openDomain(cfg.key)}
                    className="w-full text-left border border-card-border bg-card-bg rounded-2xl p-4 shadow-[var(--card-shadow)] hover:border-hq-blue/30 hover:shadow-md transition-all group flex items-center gap-4"
                  >
                    {/* Domain icon */}
                    <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${cfg.color}15` }}>
                      <Icon className="h-4.5 w-4.5" style={{ color: cfg.color }} />
                    </div>

                    {/* Text */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-extrabold text-[#1A1A1E] dark:text-white truncate">{cfg.label}</p>
                        {!hasData && <Badge variant="warning" className="text-[8px] shrink-0">Empty</Badge>}
                      </div>
                      <p className="text-[10px] text-foreground/45 font-semibold mt-0.5 truncate">{cfg.description}</p>

                      {/* Confidence bar */}
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex-1 h-1.5 rounded-full bg-foreground/10 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${confidence}%`, backgroundColor: confColor }}
                          />
                        </div>
                        <span className="text-[9px] font-extrabold shrink-0" style={{ color: confColor }}>{confidence}%</span>
                      </div>
                    </div>

                    {/* Arrow */}
                    <ChevronRight className="h-4 w-4 text-foreground/30 group-hover:text-foreground transition-colors shrink-0" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* What HQ is missing */}
          {(intelligence?.missingItems?.length ?? 0) > 0 && (
            <Card className="border border-card-border bg-card-bg p-5 shadow-[var(--card-shadow)] space-y-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" style={{ color: brandColor }} />
                <p className="text-xs font-extrabold text-[#1A1A1E] dark:text-white">How to improve HQ's understanding</p>
              </div>
              <p className="text-[10px] text-foreground/50 font-semibold">Completing these areas will significantly improve AI executive recommendations.</p>
              <div className="space-y-1.5">
                {(intelligence?.missingItems ?? []).map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />
                    <p className="text-[11px] text-foreground/70 font-semibold">{item}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Recent learning feed */}
          <Card className="border border-card-border bg-card-bg p-5 shadow-[var(--card-shadow)] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-foreground/50" />
                <p className="text-xs font-extrabold text-[#1A1A1E] dark:text-white">Recently Learned</p>
              </div>
              <Badge variant="ai" className="text-[9px]">Live Learning</Badge>
            </div>
            {(() => {
              const learningStatus = domainStatuses.find(d => d.domain === 'learning');
              const insights = (learningStatus?.data as { insights?: { id: string; insight: string; source: string; domain: string; timestamp: string }[] } | null)?.insights ?? [];
              if (insights.length === 0) {
                return (
                  <div className="py-6 flex flex-col items-center space-y-2">
                    <Brain className="h-6 w-6 text-foreground/20" />
                    <p className="text-[11px] text-foreground/40 font-semibold">HQ will capture insights here as your organization uses the platform.</p>
                  </div>
                );
              }
              return insights.slice(0, 5).map(insight => (
                <div key={insight.id} className="flex items-start gap-3 py-2 border-b border-card-border last:border-0">
                  <div className="h-6 w-6 rounded-full bg-hq-purple/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles className="h-3 w-3 text-hq-purple" />
                  </div>
                  <div>
                    <p className="text-[11px] font-extrabold text-[#1A1A1E] dark:text-white">{insight.insight}</p>
                    <p className="text-[9px] text-foreground/40 font-semibold mt-0.5">Via {insight.source} · {new Date(insight.timestamp).toLocaleDateString()}</p>
                  </div>
                </div>
              ));
            })()}
          </Card>
        </>
      )}
    </div>
  );
}
