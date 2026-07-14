'use client';

import * as React from 'react';
import { Card, Button, Badge } from '@hq/ui';
import {
  Brain,
  Building2,
  Briefcase,
  Network,
  Settings2,
  Palette,
  BookOpen,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Save,
  Sparkles,
  TrendingUp,
  TrendingDown,
  History,
  RefreshCw,
  Activity,
  Minus,
  Shield,
  Layers,
  Lock,
  Eye,
  Check,
} from 'lucide-react';
import { useAuth } from '../../../contexts/auth-context';
import { toast } from '../../../components/toast';
import { KpiRowSkeleton, CardSkeleton } from '../../../components/skeletons';

// ─── 8 Twin Layers Config ──────────────────────────────────────────────────────

interface TwinField {
  key: string;
  label: string;
  placeholder: string;
  type?: 'text' | 'textarea';
}

interface TwinLayerInfo {
  layer: number;
  name: string;
  icon: React.ComponentType<any>;
  color: string;
  description: string;
  domainKey: string;
  fields: TwinField[];
}

const TWIN_LAYERS_CONFIG: TwinLayerInfo[] = [
  {
    layer: 1,
    name: 'Identity',
    icon: Building2,
    color: '#0A84FF',
    description: 'Core organizational metadata (never changes often)',
    domainKey: 'identity',
    fields: [
      { key: 'orgName', label: 'Organization Name', placeholder: 'Acme Corporation' },
      { key: 'hqName', label: 'Headquarters Name', placeholder: 'Acme HQ' },
      { key: 'industry', label: 'Industry', placeholder: 'Technology / SaaS' },
      { key: 'registrationDetails', label: 'Registration Details', placeholder: 'UK Registration No. 12345678' },
      { key: 'country', label: 'Country', placeholder: 'United Kingdom' },
      { key: 'timezone', label: 'Time Zone', placeholder: 'GMT / London' },
      { key: 'languages', label: 'Languages Supported', placeholder: 'English, French' },
      { key: 'currency', label: 'Currency', placeholder: 'GBP (£)' },
      { key: 'stage', label: 'Business Stage', placeholder: 'Growth Stage / Series A' },
      { key: 'yearFounded', label: 'Year Founded', placeholder: '2024' },
    ],
  },
  {
    layer: 2,
    name: 'Business',
    icon: Briefcase,
    color: '#8B5CF6',
    description: 'Defines what the company does and who it serves',
    domainKey: 'businessModel',
    fields: [
      { key: 'products', label: 'Products', placeholder: 'SaaS Platform, developer API', type: 'textarea' },
      { key: 'services', label: 'Services Offered', placeholder: 'Premium configuration support, custom integrations' },
      { key: 'revenueModel', label: 'Revenue Model', placeholder: 'Monthly SaaS subscription, credit usage bounds' },
      { key: 'customerSegments', label: 'Customer Segments', placeholder: 'Mid-market corporations, strategic team leads', type: 'textarea' },
      { key: 'markets', label: 'Target Markets', placeholder: 'UK, US, Canada' },
      { key: 'pricing', label: 'Pricing Strategy', placeholder: 'Tiered subscription pricing starting at $99/mo' },
      { key: 'competitors', label: 'Competitors', placeholder: 'Legacy enterprise systems, manual tools', type: 'textarea' },
      { key: 'valueProposition', label: 'Value Proposition', placeholder: 'Run your company on autonomous autopilot', type: 'textarea' },
    ],
  },
  {
    layer: 3,
    name: 'Organization',
    icon: Network,
    color: '#0EA5E9',
    description: 'Defines who the people are and how they report',
    domainKey: 'structure',
    fields: [
      { key: 'departments', label: 'Departments', placeholder: 'Executive Office, Technology, Operations, Finance, Marketing' },
      { key: 'teams', label: 'Active Teams', placeholder: 'Core Platform Engineering, Growth Marketing Team' },
      { key: 'executives', label: 'AI Executives Roster', placeholder: 'CEO (Elena), Strategy (Alistair), CTO (Hiroshi)', type: 'textarea' },
      { key: 'reportingStructure', label: 'Reporting Structure', placeholder: 'Flat reporting, all AI specialists align under CEO Elena' },
      { key: 'responsibilities', label: 'Executive Responsibilities', placeholder: 'CTO manages engineering, CMO manages content campaigns', type: 'textarea' },
      { key: 'approvalChains', label: 'Approval Chains', placeholder: 'Missions require final sign-off by Owner or CEO' },
    ],
  },
  {
    layer: 4,
    name: 'Operations',
    icon: Settings2,
    color: '#F59E0B',
    description: 'Defines how workflows are executed and automated',
    domainKey: 'operations',
    fields: [
      { key: 'sops', label: 'Standard Operating Procedures (SOPs)', placeholder: 'Pre-flight sanitization check, daily boardroom briefings', type: 'textarea' },
      { key: 'workflows', label: 'Active Workflows', placeholder: 'Task DAG orchestration, automated log indexing', type: 'textarea' },
      { key: 'checklists', label: 'Execution Checklists', placeholder: 'Verify compliance keys, test database connections' },
      { key: 'approvalRules', label: 'Approval Rules', placeholder: 'Budgets above £5k require strategic board majority' },
      { key: 'businessProcesses', label: 'Business Processes', placeholder: 'Employee onboarding, client billing' },
      { key: 'automationRules', label: 'Automation Rules', placeholder: 'Trigger slack briefing every evening at 6pm' },
    ],
  },
  {
    layer: 5,
    name: 'Brand',
    icon: Palette,
    color: '#EC4899',
    description: 'Identity layer referenced by all AI-generated assets',
    domainKey: 'brand',
    fields: [
      { key: 'logo', label: 'Logo Configuration', placeholder: 'Primary HQ logo URL' },
      { key: 'colors', label: 'Brand Color Palette', placeholder: 'Primary: #0A84FF, Accent: #BF5AF2' },
      { key: 'typography', label: 'Brand Typography Stack', placeholder: 'Sans-Serif: Inter, Monospace: JetBrains Mono' },
      { key: 'voice', label: 'Brand Voice', placeholder: 'Professional, metrics-driven, confident, authoritative' },
      { key: 'tone', label: 'Tone of Voice', placeholder: 'Accessible, friendly but professional, visionary' },
      { key: 'brandGuidelines', label: 'Brand Guidelines Description', placeholder: 'Keep sentences short and precise. Avoid buzzwords.', type: 'textarea' },
      { key: 'messaging', label: 'Key Core Messaging', placeholder: 'Autonomous enterprise operating system' },
    ],
  },
  {
    layer: 6,
    name: 'Knowledge',
    icon: BookOpen,
    color: '#14B8A6',
    description: 'Knowledge repository containing corporate policies and documentation',
    domainKey: 'technology',
    fields: [
      { key: 'uploadedDocuments', label: 'Uploaded Documents List', placeholder: 'Employee Handbook PDF, Q3 Financial Policy', type: 'textarea' },
      { key: 'pdfs', label: 'Referenced PDFs', placeholder: 'Company Bylaws.pdf, BrandGuidelines.pdf' },
      { key: 'reports', label: 'Quarterly Reports', placeholder: 'Q1 Financial Summary, Q2 Competitor Benchmark' },
      { key: 'policies', label: 'Corporate Policies', placeholder: 'Data Retention Policy, Compliance Guardrails', type: 'textarea' },
      { key: 'meetingNotes', label: 'Deliberation Meeting Notes', placeholder: 'Daily executive sync transcript' },
      { key: 'research', label: 'Market Research Logs', placeholder: 'West African Corridors analysis' },
      { key: 'productDocumentation', label: 'Product Specifications', placeholder: 'API Integration guides, schema models', type: 'textarea' },
    ],
  },
  {
    layer: 7,
    name: 'Memory',
    icon: Clock,
    color: '#6366F1',
    description: 'Historical records maintaining operational continuity',
    domainKey: 'learning',
    fields: [
      { key: 'previousMissions', label: 'Completed Campaign Logs', placeholder: 'Completed Q3 Petroleum Logistics strategy', type: 'textarea' },
      { key: 'decisions', label: 'Approved Boardroom Decisions', placeholder: 'Approved CMO campaign templates alignment' },
      { key: 'userPreferences', label: 'Strategic User Preferences', placeholder: 'Email notification preferences, dark mode' },
      { key: 'executiveMemories', label: 'AI Director Memories', placeholder: 'Elena remembers strategic direction pivot Q2', type: 'textarea' },
      { key: 'organizationHistory', label: 'Living History Records', placeholder: 'Company registered, series A funded', type: 'textarea' },
    ],
  },
  {
    layer: 8,
    name: 'Intelligence',
    icon: Brain,
    color: '#30D158',
    description: 'HQ reasoning, SWOR assessments, and health score dimensions',
    domainKey: 'strategy',
    fields: [
      { key: 'strengths', label: 'Core Strengths', placeholder: 'Agile engineering team, high-integrity AI alignment', type: 'textarea' },
      { key: 'weaknesses', label: 'Areas of Improvement', placeholder: 'Customer onboarding friction, platform latency', type: 'textarea' },
      { key: 'opportunities', label: 'Growth Opportunities', placeholder: 'Leveraging Gemini API capabilities, expanding market' },
      { key: 'risks', label: 'Identified Risks', placeholder: 'Prompt injection vector checks, credit limits', type: 'textarea' },
      { key: 'recommendations', label: 'Executive Recommendations', placeholder: 'Automate weekly report logging' },
      { key: 'executiveObservations', label: 'Observation Feed', placeholder: 'CEO observed strategy alignment mismatch', type: 'textarea' },
    ],
  },
];

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
  maturityLevel: number;
  maturityLabel: string;
  maturityColor: string;
  maturityThresholds: { level: number; label: string; min: number; color: string }[];
  lastLearnedAt: string | null;
  pendingSuggestions: { id: string; domain: string; title: string; description: string; stage?: 'PROPOSED' | 'VALIDATED' | 'APPROVED' | 'PUBLISHED' }[];
  domainStatuses: DomainStatus[];
  missingItems: string[];
  healthScore: Record<string, { score: number; trend: string; strengths: string[]; risks: string[]; actions: string[] }> | null;
  evolutionTimeline: { id: string; title: string; description?: string; type: string; date: string }[] | null;
}

// ─── Confidence ring SVG ──────────────────────────────────────────────────────
function ConfidenceRing({ value, size = 72, color = '#0A84FF' }: { value: number; size?: number; color?: string }) {
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

export default function IntelligencePage() {
  const { token } = useAuth();
  const [intelligence, setIntelligence] = React.useState<Intelligence | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [activeLayerIndex, setActiveLayerIndex] = React.useState<number | null>(null);
  const [editData, setEditData] = React.useState<Record<string, string>>({});
  const [saving, setSaving] = React.useState(false);
  const [drafting, setDrafting] = React.useState(false);
  const [brandColor, setBrandColor] = React.useState('#0A84FF');

  // Load brand color
  React.useEffect(() => {
    try {
      const draft = JSON.parse(localStorage.getItem('hq_onboarding_draft') || '{}');
      if (draft.brandColor) setBrandColor(draft.brandColor);
    } catch { /* ignore */ }
  }, []);

  const fetchIntelligence = () => {
    if (!token) return;
    fetch('/api/intelligence', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data) {
          // Enrich suggestions with random specs validation stage for demo simulation
          const suggestions = (data.pendingSuggestions || []).map((s: any, idx: number) => ({
            ...s,
            stage: idx === 0 ? 'VALIDATED' : idx === 1 ? 'PROPOSED' : 'APPROVED',
          }));
          setIntelligence({ ...data, pendingSuggestions: suggestions });
        }
      })
      .finally(() => setLoading(false));
  };

  React.useEffect(() => {
    fetchIntelligence();
  }, [token]);

  const openLayer = (layerIndex: number) => {
    setActiveLayerIndex(layerIndex);
    const layerConfig = TWIN_LAYERS_CONFIG[layerIndex];
    const status = intelligence?.domainStatuses?.find(d => d.domain === layerConfig.domainKey);
    if (status?.data) {
      setEditData(status.data as Record<string, string>);
    } else {
      setEditData({});
    }
  };

  const handleSaveLayer = async () => {
    if (!token || activeLayerIndex === null) return;
    setSaving(true);
    const layerConfig = TWIN_LAYERS_CONFIG[activeLayerIndex];
    try {
      const res = await fetch(`/api/intelligence/domain/${layerConfig.domainKey}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(editData),
      });
      if (res.ok) {
        toast.success(`✨ Layer ${layerConfig.layer} (${layerConfig.name}) saved successfully`);
        setActiveLayerIndex(null);
        fetchIntelligence();
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDraftLayer = async () => {
    if (!token || activeLayerIndex === null) return;
    setDrafting(true);
    const layerConfig = TWIN_LAYERS_CONFIG[activeLayerIndex];
    try {
      const res = await fetch(`/api/intelligence/domain/${layerConfig.domainKey}/draft`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const draft = await res.json();
        setEditData(draft || {});
        toast.success('🪄 Layer drafted using AI Digital Twin heuristics');
      }
    } finally {
      setDrafting(false);
    }
  };

  const handleApproveSuggestion = async (id: string) => {
    if (!token) return;
    await fetch(`/api/intelligence/suggestions/${id}/approve`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
    setIntelligence(prev => prev ? { ...prev, pendingSuggestions: prev.pendingSuggestions.filter(s => s.id !== id) } : prev);
    toast.success('✅ Twin suggestion published to live memory');
    fetchIntelligence();
  };

  const handleDismissSuggestion = async (id: string) => {
    if (!token) return;
    await fetch(`/api/intelligence/suggestions/${id}/dismiss`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
    setIntelligence(prev => prev ? { ...prev, pendingSuggestions: prev.pendingSuggestions.filter(s => s.id !== id) } : prev);
    toast.info('🗑️ Suggestion discarded');
  };

  const overallConfidence = intelligence?.overallConfidence ?? 0;
  const pendingSuggestions = intelligence?.pendingSuggestions ?? [];

  // Edit layer panel render
  if (activeLayerIndex !== null) {
    const cfg = TWIN_LAYERS_CONFIG[activeLayerIndex];
    const Icon = cfg.icon;
    return (
      <div className="space-y-6 text-foreground pb-12 max-w-3xl animate-in fade-in duration-300">
        {/* Header */}
        <div className="flex items-center gap-3 pb-4 border-b border-card-border">
          <button onClick={() => setActiveLayerIndex(null)} className="text-xs font-bold text-foreground/50 hover:text-foreground transition-colors">← Back</button>
          <div className="h-9 w-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${cfg.color}18` }}>
            <Icon className="h-4.5 w-4.5" style={{ color: cfg.color }} />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-[#1A1A1E] dark:text-white">Layer {cfg.layer} — {cfg.name}</h2>
            <p className="text-[10px] text-foreground/50 font-semibold">{cfg.description}</p>
          </div>
        </div>

        {/* Form fields */}
        <div className="grid gap-4 md:grid-cols-2">
          {cfg.fields.map(field => (
            <div key={field.key} className={`space-y-1.5 ${field.type === 'textarea' ? 'md:col-span-2' : ''}`}>
              <label className="text-[10px] font-extrabold text-[#1A1A1E] dark:text-white uppercase tracking-widest">{field.label}</label>
              {field.type === 'textarea' ? (
                <textarea
                  className="w-full min-h-20 rounded-xl border border-card-border bg-[#F9F9FB] dark:bg-[#0A0A0C] px-3 py-2 text-xs font-semibold text-[#1A1A1E] dark:text-white focus:outline-none focus:ring-2 resize-none"
                  style={{ '--tw-ring-color': `${cfg.color}40` } as React.CSSProperties}
                  placeholder={field.placeholder}
                  value={editData[field.key] || ''}
                  onChange={e => setEditData(p => ({ ...p, [field.key]: e.target.value }))}
                />
              ) : (
                <input
                  className="w-full h-9 rounded-xl border border-card-border bg-[#F9F9FB] dark:bg-[#0A0A0C] px-3 text-xs font-semibold text-[#1A1A1E] dark:text-white focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all"
                  style={{ '--tw-ring-color': `${cfg.color}40` } as React.CSSProperties}
                  placeholder={field.placeholder}
                  value={editData[field.key] || ''}
                  onChange={e => setEditData(p => ({ ...p, [field.key]: e.target.value }))}
                />
              )}
            </div>
          ))}
        </div>

        {/* Footer controls */}
        <div className="flex items-center justify-end gap-2 pt-4 border-t border-card-border">
          <Button
            variant="outline"
            size="sm"
            className="text-xs font-bold border-hq-purple/30 text-hq-purple bg-hq-purple/5 hover:bg-hq-purple/10 h-8 gap-1.5"
            onClick={handleDraftLayer}
            disabled={drafting}
          >
            <Sparkles className={`h-3.5 w-3.5 ${drafting ? 'animate-spin' : 'animate-pulse'}`} />
            {drafting ? 'Drafting...' : 'Draft with AI'}
          </Button>
          <Button variant="outline" size="sm" className="text-xs font-bold border-card-border h-8" onClick={() => setActiveLayerIndex(null)}>Cancel</Button>
          <Button onClick={handleSaveLayer} disabled={saving} size="sm" className="text-white font-bold text-xs h-8" style={{ backgroundColor: cfg.color }}>
            <Save className="h-3.5 w-3.5 mr-1.5" />
            {saving ? 'Saving...' : 'Save Layer'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-foreground pb-12">
      {/* Header */}
      <div className="flex items-start justify-between pb-4 border-b border-card-border">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl flex items-center justify-center shadow-lg animate-pulse" style={{ backgroundColor: `${brandColor}18` }}>
            <Brain className="h-5 w-5" style={{ color: brandColor }} />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-[#1A1A1E] dark:text-white flex items-center gap-2">
              Digital Organization Twin
              <Badge variant="ai" className="text-[9px]">LIVING GRAPH</Badge>
            </h1>
            <p className="text-xs text-foreground/55 font-semibold mt-0.5">
              Continuously evolving understanding of the organization consulted before every AI mission.
            </p>
          </div>
        </div>
        {intelligence?.lastLearnedAt && (
          <div className="flex items-center gap-1.5 text-foreground/45 bg-[#F9F9FB] dark:bg-[#0A0A0C] border border-card-border px-3 py-1 rounded-xl">
            <RefreshCw className="h-3 w-3 text-hq-blue" />
            <span className="text-[9px] font-bold uppercase tracking-wider">Sync: Live</span>
          </div>
        )}
      </div>

      {loading ? (
        <div className="space-y-5 animate-in fade-in duration-300">
          <KpiRowSkeleton count={4} />
          <div className="grid gap-3 md:grid-cols-2">
            {Array.from({ length: 8 }).map((_, i) => <CardSkeleton key={i} lines={2} />)}
          </div>
        </div>
      ) : (
        <>
          {/* Twin Maturity & Overall Confidence */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card className="border border-card-border bg-card-bg p-5 shadow-[var(--card-shadow)] md:col-span-1 flex flex-col items-center justify-center space-y-2">
              <div className="relative">
                <ConfidenceRing value={overallConfidence} size={76} color={brandColor} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-black" style={{ color: brandColor }}>{overallConfidence}%</span>
                </div>
              </div>
              <p className="text-[9px] font-bold text-foreground/50 uppercase tracking-widest text-center">Twin Confidence</p>
            </Card>

            <Card className="border border-card-border bg-card-bg p-5 shadow-[var(--card-shadow)] md:col-span-3 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="h-4 w-4 text-hq-blue" />
                  <p className="text-xs font-extrabold text-[#1A1A1E] dark:text-white">Twin Maturity Scale</p>
                </div>
                <Badge
                  variant={intelligence?.maturityLevel === 5 ? 'success' : intelligence?.maturityLevel === 4 ? 'info' : intelligence?.maturityLevel === 3 ? 'ai' : 'warning'}
                  className="text-[10px] font-bold"
                >
                  Level {intelligence?.maturityLevel ?? 1} — {intelligence?.maturityLabel ?? 'Basic'}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                {(intelligence?.maturityThresholds || []).slice().reverse().map((tier) => {
                  const active = (intelligence?.maturityLevel ?? 1) >= tier.level;
                  return (
                    <div key={tier.level} className="flex-1 text-center">
                      <div
                        className={`h-1.5 rounded-full mb-1 transition-all duration-700 ${active ? '' : 'opacity-20'}`}
                        style={{ backgroundColor: tier.color }}
                      />
                      <p className={`text-[8px] font-extrabold ${active ? '' : 'text-foreground/30'}`} style={active ? { color: tier.color } : {}}>
                        {tier.label}
                      </p>
                    </div>
                  );
                })}
              </div>
              <p className="text-[10px] text-foreground/45 font-semibold">
                {intelligence?.maturityLevel === 5
                  ? '🎯 Level 5: Autonomous. Twin verifies facts and updates executive behaviors in real-time.'
                  : '📋 Profile incomplete. Fill in missing details across the layers to advance maturity.'}
              </p>
            </Card>
          </div>

          {/* ➔ Twin Verification Pipeline (Proposed -> Validated -> Approved -> Published) */}
          {pendingSuggestions.length > 0 && (
            <Card className="border border-amber-500/20 bg-amber-500/5 p-5 shadow-[var(--card-shadow)] space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-500" />
                <p className="text-xs font-extrabold text-amber-500 uppercase tracking-wider">Twin Verification Pipeline</p>
              </div>
              <div className="space-y-3">
                {pendingSuggestions.map(s => (
                  <div key={s.id} className="p-4 rounded-xl border border-card-border bg-card-bg space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-extrabold text-[#1A1A1E] dark:text-white">{s.title}</p>
                        <p className="text-[10px] text-foreground/50 font-semibold mt-0.5">{s.description}</p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <Button size="sm" className="text-white text-[10px] font-bold h-7" style={{ backgroundColor: brandColor }} onClick={() => handleApproveSuggestion(s.id)}>Approve & Publish</Button>
                        <Button size="sm" variant="outline" className="text-[10px] font-bold h-7 border-card-border" onClick={() => handleDismissSuggestion(s.id)}>Dismiss</Button>
                      </div>
                    </div>

                    {/* Progress pipeline tracker */}
                    <div className="grid grid-cols-4 gap-2 pt-2 border-t border-card-border/50 text-center">
                      {[
                        { label: 'Proposed', active: true, color: '#30D158' },
                        { label: 'Validated', active: s.stage !== 'PROPOSED', color: '#0A84FF' },
                        { label: 'Approved', active: s.stage === 'APPROVED', color: '#BF5AF2' },
                        { label: 'Published', active: false, color: '#94A3B8' },
                      ].map((step, idx) => (
                        <div key={idx} className="space-y-1">
                          <div className={`h-1.5 rounded-full ${step.active ? '' : 'bg-foreground/10'}`} style={step.active ? { backgroundColor: step.color } : {}} />
                          <p className={`text-[8px] font-bold uppercase tracking-wider ${step.active ? 'text-[#1A1A1E] dark:text-white' : 'text-foreground/30'}`}>{step.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* 8 Twin Layers Accordion */}
          <div className="space-y-3">
            <p className="text-[10px] font-extrabold text-foreground/45 uppercase tracking-widest">Twin Layers</p>
            <div className="grid gap-3 md:grid-cols-2">
              {TWIN_LAYERS_CONFIG.map((cfg, idx) => {
                const Icon = cfg.icon;
                const status = intelligence?.domainStatuses?.find(d => d.domain === cfg.domainKey);
                const confidence = status?.confidence ?? 0;
                const hasData = status?.hasData ?? false;
                const confColor = confidence >= 75 ? '#22C55E' : confidence >= 40 ? '#F59E0B' : '#EF4444';

                return (
                  <button
                    key={cfg.layer}
                    onClick={() => openLayer(idx)}
                    className="w-full text-left border border-card-border bg-card-bg rounded-2xl p-4 shadow-[var(--card-shadow)] hover:border-hq-blue/30 hover:-translate-y-0.5 hover:shadow-md transition-all group flex items-center gap-4"
                  >
                    <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${cfg.color}15` }}>
                      <Icon className="h-4.5 w-4.5" style={{ color: cfg.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-black text-[#1A1A1E] dark:text-white">Layer {cfg.layer} — {cfg.name}</p>
                        {!hasData && <Badge variant="warning" className="text-[8px] shrink-0 font-bold">Empty</Badge>}
                      </div>
                      <p className="text-[10px] text-foreground/45 font-semibold mt-0.5 truncate">{cfg.description}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex-1 h-1 rounded-full bg-foreground/10 overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-700" style={{ width: `${confidence}%`, backgroundColor: confColor }} />
                        </div>
                        <span className="text-[9px] font-extrabold shrink-0" style={{ color: confColor }}>{confidence}%</span>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-foreground/30 group-hover:text-foreground transition-colors shrink-0" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Executive Usage & Least Privilege */}
          <Card className="border border-card-border bg-card-bg p-5 shadow-[var(--card-shadow)] space-y-4">
            <div className="flex items-center gap-2 border-b border-card-border pb-3">
              <Lock className="h-4 w-4 text-hq-purple" />
              <div>
                <p className="text-xs font-extrabold text-[#1A1A1E] dark:text-white">Executive Access & Least Privilege</p>
                <p className="text-[10px] text-foreground/50 mt-0.5">Specialized directors access only their authorized layer data bounds.</p>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {[
                { role: 'CEO (Elena)', desc: 'Strategic & KPIs', layers: [1, 2, 3, 4, 5, 8], color: '#0A84FF' },
                { role: 'Finance (Sophia)', desc: 'Ledgers & margins', layers: [1, 2, 7], color: '#22C55E' },
                { role: 'Marketing (Amara)', desc: 'Brand & guidelines', layers: [1, 2, 5], color: '#EC4899' },
                { role: 'CTO (Hiroshi)', desc: 'Architecture & tech', layers: [1, 3, 6], color: '#0EA5E9' },
                { role: 'Success (Yuki)', desc: 'Feedback & support', layers: [1, 2, 7], color: '#F59E0B' },
              ].map(exec => (
                <div key={exec.role} className="border border-card-border bg-[#F9F9FB] dark:bg-[#0A0A0C]/50 rounded-xl p-3 space-y-2">
                  <p className="text-[10px] font-extrabold text-[#1A1A1E] dark:text-white">{exec.role}</p>
                  <p className="text-[8px] text-foreground/45 font-bold uppercase tracking-wider">{exec.desc}</p>
                  <div className="flex flex-wrap gap-1">
                    {exec.layers.map(l => (
                      <span key={l} className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-foreground/5 border border-card-border" style={{ borderColor: `${exec.color}30`, color: exec.color }}>
                        L{l}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* 11 Health score dimensions */}
          <div>
            <p className="text-xs font-extrabold text-foreground/40 uppercase tracking-widest mb-3">Organization Health Scores</p>
            <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-6">
              {[
                { key: 'strategy', label: 'Strategy', color: '#0A84FF' },
                { key: 'operations', label: 'Operations', color: '#F59E0B' },
                { key: 'finance', label: 'Finance', color: '#22C55E' },
                { key: 'marketing', label: 'Marketing', color: '#EC4899' },
                { key: 'sales', label: 'Sales', color: '#8B5CF6' },
                { key: 'technology', label: 'Technology', color: '#6366F1' },
                { key: 'customerSuccess', label: 'Customer Success', color: '#14B8A6' },
                { key: 'security', label: 'Security', color: '#EF4444' },
                { key: 'compliance', label: 'Compliance', color: '#EF4444' },
                { key: 'innovation', label: 'Innovation', color: '#0EA5E9' },
                { key: 'teamCollaboration', label: 'Collaboration', color: '#30D158' },
              ].map(dim => {
                const dimData = intelligence?.healthScore?.[dim.key];
                const score = dimData?.score ?? 0;
                const trend = dimData?.trend ?? 'stable';
                const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
                return (
                  <div key={dim.key} className="border border-card-border bg-card-bg rounded-xl p-3 space-y-2 hover:shadow-sm">
                    <div className="flex items-center justify-between">
                      <p className="text-[9px] font-extrabold text-foreground/50 uppercase tracking-wider">{dim.label}</p>
                      <TrendIcon className="h-3 w-3" style={{ color: trend === 'up' ? '#22C55E' : trend === 'down' ? '#EF4444' : '#94A3B8' }} />
                    </div>
                    <div className="flex items-end justify-between">
                      <p className="text-lg font-black" style={{ color: dim.color }}>{score}</p>
                      <p className="text-[8px] text-foreground/35 font-bold">/100</p>
                    </div>
                    <div className="h-1 rounded-full bg-foreground/10 overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${score}%`, backgroundColor: dim.color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Living evolution timeline */}
          <Card className="border border-card-border bg-card-bg p-5 shadow-[var(--card-shadow)] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="h-4 w-4 text-foreground/50" />
                <p className="text-xs font-extrabold text-[#1A1A1E] dark:text-white">Organization Evolution Timeline</p>
              </div>
              <Badge variant="neutral" className="text-[9px]">Living History</Badge>
            </div>
            {(() => {
              const timeline = intelligence?.evolutionTimeline ?? [];
              if (timeline.length === 0) {
                return (
                  <div className="py-6 flex flex-col items-center space-y-2">
                    <History className="h-6 w-6 text-foreground/20" />
                    <p className="text-[11px] text-foreground/40 font-semibold text-center">
                      Key milestones will appear here as your organization grows.<br />
                      HQ automatically captures significant events.
                    </p>
                  </div>
                );
              }
              return (
                <div className="relative pl-4 border-l border-card-border space-y-4">
                  {timeline.slice(0, 8).map((event) => (
                    <div key={event.id} className="relative">
                      <div className="absolute -left-[20.5px] top-1.5 h-2 w-2 rounded-full bg-card-bg border" style={{ borderColor: brandColor }} />
                      <p className="text-[11px] font-extrabold text-[#1A1A1E] dark:text-white">{event.title}</p>
                      {event.description && <p className="text-[10px] text-foreground/50 font-semibold mt-0.5">{event.description}</p>}
                      <p className="text-[9px] text-foreground/35 font-semibold mt-0.5">{new Date(event.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    </div>
                  ))}
                </div>
              );
            })()}
          </Card>
        </>
      )}
    </div>
  );
}
