'use client';

import * as React from 'react';
import {
  Card,
  Button,
  Badge,
} from '@hq/ui';
import {
  Building2,
  Users,
  Shield,
  Bell,
  Plug2,
  CreditCard,
  Database,
  Code2,
  FileText,
  HeadphonesIcon,
  ChevronRight,
  Bot,
  Palette,
  Settings2,
  Sliders,
  Key,
  Globe,
  Save,
  Plus,
  Trash2,
  Copy,
  CheckCircle2,
  Eye,
  EyeOff,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { useAuth } from '../../../contexts/auth-context';

// ─── Types ───────────────────────────────────────────────────────────────────

interface OrgSettings {
  hqName: string;
  timezone: string;
  language: string;
  currency: string;
  legalName: string;
  businessAddress: string;
  contactEmail: string;
  industry: string;
  aiTone: string;
  aiFormality: string;
  aiResponseLength: string;
  notifyEmail: boolean;
  notifyBrowser: boolean;
  notifyPush: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

interface ApiKey {
  id: string;
  name: string;
  keyPrefix: string;
  lastUsedAt: string | null;
  expiresAt: string | null;
  isActive: boolean;
  createdAt: string;
}

interface AuditLog {
  id: string;
  eventType: string;
  metadata: Record<string, unknown>;
  createdAt: string;
  actor?: { name: string; email: string } | null;
}

// ─── Nav sections ─────────────────────────────────────────────────────────────

const ESSENTIAL_SECTIONS = [
  { id: 'headquarters', label: 'Headquarters', icon: Building2 },
  { id: 'organization', label: 'Organization', icon: Globe },
  { id: 'team', label: 'Team & Permissions', icon: Users },
  { id: 'branding', label: 'Branding', icon: Palette },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'billing', label: 'Billing', icon: CreditCard },
];

const ADVANCED_SECTIONS = [
  { id: 'executives', label: 'AI Executives', icon: Bot },
  { id: 'integrations', label: 'Integrations', icon: Plug2 },
  { id: 'storage', label: 'Storage', icon: Database },
  { id: 'automation', label: 'Automation', icon: Sliders },
  { id: 'api', label: 'API & Developers', icon: Code2 },
  { id: 'audit', label: 'Audit Logs', icon: FileText },
  { id: 'preferences', label: 'Preferences', icon: Settings2 },
  { id: 'support', label: 'Support', icon: HeadphonesIcon },
];

const TIMEZONES = ['UTC', 'America/New_York', 'America/Chicago', 'America/Los_Angeles', 'Europe/London', 'Europe/Paris', 'Asia/Tokyo', 'Asia/Dubai', 'Africa/Lagos'];
const CURRENCIES = ['USD', 'EUR', 'GBP', 'NGN', 'JPY', 'AED', 'CAD', 'AUD'];
const LANGUAGES = ['English', 'French', 'Spanish', 'Arabic', 'German', 'Japanese'];
const AI_TONES = ['Professional', 'Friendly', 'Executive', 'Technical', 'Creative'];
const AI_FORMALITIES = ['Formal', 'Semi-Formal', 'Casual'];
const AI_LENGTHS = ['Concise', 'Balanced', 'Detailed'];

// ─── Integration catalog ──────────────────────────────────────────────────────

const INTEGRATIONS = [
  { id: 'slack', name: 'Slack', desc: 'Team messaging and alerts', category: 'Communication', logo: '💬', connected: false },
  { id: 'gdrive', name: 'Google Drive', desc: 'Cloud file storage and sync', category: 'Storage', logo: '📁', connected: false },
  { id: 'jira', name: 'Jira', desc: 'Project and issue tracking', category: 'Productivity', logo: '🎯', connected: false },
  { id: 'notion', name: 'Notion', desc: 'Docs and knowledge base', category: 'Productivity', logo: '📝', connected: false },
  { id: 'github', name: 'GitHub', desc: 'Source code repositories', category: 'Development', logo: '🐙', connected: false },
  { id: 'salesforce', name: 'Salesforce', desc: 'CRM and sales pipeline', category: 'CRM', logo: '☁️', connected: false },
  { id: 'quickbooks', name: 'QuickBooks', desc: 'Accounting software', category: 'Finance', logo: '📊', connected: false },
  { id: 'gcal', name: 'Google Calendar', desc: 'Calendar and scheduling', category: 'Calendar', logo: '📅', connected: false },
];

// ─── Component ─────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const { token } = useAuth();
  const [activeSection, setActiveSection] = React.useState('headquarters');
  const [settings, setSettings] = React.useState<OrgSettings>({
    hqName: 'Headquarters',
    timezone: 'UTC',
    language: 'English',
    currency: 'USD',
    legalName: '',
    businessAddress: '',
    contactEmail: '',
    industry: '',
    aiTone: 'Professional',
    aiFormality: 'Formal',
    aiResponseLength: 'Balanced',
    notifyEmail: true,
    notifyBrowser: true,
    notifyPush: false,
    quietHoursStart: '22:00',
    quietHoursEnd: '08:00',
  });
  const [teamMembers, setTeamMembers] = React.useState<TeamMember[]>([]);
  const [apiKeys, setApiKeys] = React.useState<ApiKey[]>([]);
  const [auditLogs, setAuditLogs] = React.useState<AuditLog[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [savedMsg, setSavedMsg] = React.useState('');
  const [newKeyName, setNewKeyName] = React.useState('');
  const [newKeyResult, setNewKeyResult] = React.useState('');
  const [newKeyVisible, setNewKeyVisible] = React.useState(false);
  const [brandColor, setBrandColor] = React.useState('#0A84FF');
  const [copiedId, setCopiedId] = React.useState('');

  // Load brand color from local storage
  React.useEffect(() => {
    const draft = localStorage.getItem('hq_onboarding_draft');
    if (draft) {
      try {
        const d = JSON.parse(draft);
        if (d.brandColor) setBrandColor(d.brandColor);
      } catch { // ignore
      }
    }
  }, []);

  // Fetch all data
  React.useEffect(() => {
    if (!token) return;
    const headers = { Authorization: `Bearer ${token}` };
    setLoading(true);
    Promise.all([
      fetch('/api/settings/org', { headers }).then(r => r.ok ? r.json() : null),
      fetch('/api/settings/team', { headers }).then(r => r.ok ? r.json() : []),
      fetch('/api/settings/api-keys', { headers }).then(r => r.ok ? r.json() : []),
      fetch('/api/settings/audit-logs', { headers }).then(r => r.ok ? r.json() : []),
    ]).then(([org, team, keys, logs]) => {
      if (org) setSettings(prev => ({ ...prev, ...org }));
      setTeamMembers(team || []);
      setApiKeys(keys || []);
      setAuditLogs(logs || []);
    }).finally(() => setLoading(false));
  }, [token]);

  const handleSave = async () => {
    if (!token) return;
    setSaving(true);
    try {
      const res = await fetch('/api/settings/org', {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        setSavedMsg('Saved successfully');
        setTimeout(() => setSavedMsg(''), 3000);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCreateKey = async () => {
    if (!token || !newKeyName.trim()) return;
    const res = await fetch('/api/settings/api-keys', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newKeyName }),
    });
    if (res.ok) {
      const data = await res.json();
      setNewKeyResult(data.key);
      setNewKeyVisible(true);
      setNewKeyName('');
      const keysRes = await fetch('/api/settings/api-keys', { headers: { Authorization: `Bearer ${token}` } });
      if (keysRes.ok) setApiKeys(await keysRes.json());
    }
  };

  const handleRevokeKey = async (id: string) => {
    if (!token) return;
    await fetch(`/api/settings/api-keys/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    setApiKeys(prev => prev.filter(k => k.id !== id));
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(''), 2000);
  };

  const Field = ({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) => (
    <div className="space-y-1.5">
      <label className="text-xs font-extrabold text-[#1A1A1E] dark:text-white">{label}</label>
      {hint && <p className="text-[10px] text-foreground/45 font-semibold">{hint}</p>}
      {children}
    </div>
  );

  const inputCls = "w-full h-9 rounded-xl border border-card-border bg-[#F9F9FB] dark:bg-[#0A0A0C] px-3 text-xs font-semibold text-[#1A1A1E] dark:text-white focus:outline-none focus:ring-2 focus:ring-hq-blue/40 transition-all";
  const selectCls = `${inputCls} cursor-pointer`;

  // ─── Render sections ──────────────────────────────────────────────────────────

  const renderSection = () => {
    switch (activeSection) {

      // ── HEADQUARTERS ──────────────────────────────────────────────────
      case 'headquarters':
        return (
          <div className="space-y-5">
            <SectionHeader
              title="Headquarters"
              desc="Configure your HQ's identity, locale, and core operational settings."
              icon={<Building2 className="h-5 w-5" style={{ color: brandColor }} />}
            />
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Headquarters Name" hint="Appears across the entire application">
                <input className={inputCls} value={settings.hqName} onChange={e => setSettings(p => ({ ...p, hqName: e.target.value }))} placeholder="e.g. Vision HQ, Mission Control" />
              </Field>
              <Field label="Industry" hint="Your organization's primary industry">
                <input className={inputCls} value={settings.industry} onChange={e => setSettings(p => ({ ...p, industry: e.target.value }))} placeholder="e.g. Technology, Finance, Healthcare" />
              </Field>
              <Field label="Timezone">
                <select className={selectCls} value={settings.timezone} onChange={e => setSettings(p => ({ ...p, timezone: e.target.value }))}>
                  {TIMEZONES.map(tz => <option key={tz} value={tz}>{tz}</option>)}
                </select>
              </Field>
              <Field label="Language">
                <select className={selectCls} value={settings.language} onChange={e => setSettings(p => ({ ...p, language: e.target.value }))}>
                  {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </Field>
              <Field label="Default Currency">
                <select className={selectCls} value={settings.currency} onChange={e => setSettings(p => ({ ...p, currency: e.target.value }))}>
                  {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="Contact Email">
                <input className={inputCls} type="email" value={settings.contactEmail} onChange={e => setSettings(p => ({ ...p, contactEmail: e.target.value }))} placeholder="admin@yourcompany.com" />
              </Field>
            </div>
            <SaveBar onSave={handleSave} saving={saving} savedMsg={savedMsg} brandColor={brandColor} />
          </div>
        );

      // ── ORGANIZATION ──────────────────────────────────────────────────
      case 'organization':
        return (
          <div className="space-y-5">
            <SectionHeader
              title="Organization"
              desc="Legal information, business registration, and address details."
              icon={<Globe className="h-5 w-5" style={{ color: brandColor }} />}
            />
            <Card className="border border-card-border bg-card-bg p-6 shadow-[var(--card-shadow)] flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-full bg-hq-blue/15 text-hq-blue flex items-center justify-center shrink-0" style={{ backgroundColor: `${brandColor}15` }}>
                  <Globe className="h-5 w-5" style={{ color: brandColor }} />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-[#1A1A1E] dark:text-white">Upgraded to Organization Workspace</h4>
                  <p className="text-[10px] text-foreground/50 font-semibold mt-1 leading-relaxed">
                    This section has been promoted to a top-level workspace containing regional branches, department selectors, and evolutionary stage checkouts.
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                className="text-white text-xs font-bold h-8.5 shrink-0"
                style={{ backgroundColor: brandColor }}
                onClick={() => window.location.href = '/organization'}
              >
                Go to Organization Workspace
              </Button>
            </Card>
          </div>
        );

      // ── TEAM & PERMISSIONS ─────────────────────────────────────────────
      case 'team':
        return (
          <div className="space-y-5">
            <SectionHeader
              title="Team & Permissions"
              desc="Manage users, roles, and access control across your Headquarters."
              icon={<Users className="h-5 w-5" style={{ color: brandColor }} />}
            />
            <Card className="border border-card-border bg-card-bg p-6 shadow-[var(--card-shadow)] flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-full bg-hq-cyan/15 text-hq-cyan flex items-center justify-center shrink-0" style={{ backgroundColor: `${brandColor}15` }}>
                  <Users className="h-5 w-5" style={{ color: brandColor }} />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-[#1A1A1E] dark:text-white">Upgraded to Teams & Clearance</h4>
                  <p className="text-[10px] text-foreground/50 font-semibold mt-1 leading-relaxed">
                    This section has been promoted to a top-level workspace containing reporting org charts, clearance sliders, and invitations gatekeepers.
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                className="text-white text-xs font-bold h-8.5 shrink-0"
                style={{ backgroundColor: brandColor }}
                onClick={() => window.location.href = '/teams'}
              >
                Go to Teams Directory
              </Button>
            </Card>
          </div>
        );

      // ── BRANDING ──────────────────────────────────────────────────────
      case 'branding':
        return (
          <div className="space-y-5">
            <SectionHeader
              title="Branding"
              desc="Customize colors, logo, and visual identity across your Headquarters."
              icon={<Palette className="h-5 w-5" style={{ color: brandColor }} />}
            />
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="border border-card-border bg-card-bg p-4 shadow-[var(--card-shadow)] space-y-3">
                <p className="text-xs font-extrabold text-[#1A1A1E] dark:text-white">Primary Brand Color</p>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl border border-card-border overflow-hidden shrink-0">
                    <input type="color" value={brandColor} onChange={e => setBrandColor(e.target.value)} className="h-full w-full cursor-pointer border-0 p-0" />
                  </div>
                  <div>
                    <p className="text-xs font-extrabold" style={{ color: brandColor }}>{brandColor.toUpperCase()}</p>
                    <p className="text-[10px] text-foreground/50 font-semibold">Click swatch to change</p>
                  </div>
                </div>
              </Card>
              <Card className="border border-card-border bg-card-bg p-4 shadow-[var(--card-shadow)] space-y-3">
                <p className="text-xs font-extrabold text-[#1A1A1E] dark:text-white">Organization Logo</p>
                <div className="h-20 border-2 border-dashed border-card-border rounded-xl flex items-center justify-center cursor-pointer hover:border-hq-blue/50 transition-colors">
                  <p className="text-[10px] text-foreground/40 font-semibold">Click or drag to upload logo</p>
                </div>
              </Card>
            </div>
            <Card className="border border-card-border bg-card-bg p-4 shadow-[var(--card-shadow)] space-y-3">
              <p className="text-xs font-extrabold text-[#1A1A1E] dark:text-white">Brand Preview</p>
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl flex items-center justify-center text-white font-extrabold text-xs" style={{ backgroundColor: brandColor }}>HQ</div>
                <div>
                  <p className="text-sm font-extrabold text-[#1A1A1E] dark:text-white">{settings.hqName}</p>
                  <p className="text-[10px] text-foreground/50 font-semibold">Executive Operating System</p>
                </div>
                <Button size="sm" className="ml-auto text-white text-[10px] font-bold" style={{ backgroundColor: brandColor }}>Sample CTA</Button>
              </div>
            </Card>
          </div>
        );

      // ── SECURITY ──────────────────────────────────────────────────────
      case 'security':
        return (
          <div className="space-y-5">
            <SectionHeader
              title="Security"
              desc="Manage authentication, session policies, and access controls."
              icon={<Shield className="h-5 w-5" style={{ color: brandColor }} />}
            />
            <div className="grid gap-4 md:grid-cols-3">
              {[
                { label: 'MFA Status', value: 'Enabled', color: '#22C55E' },
                { label: 'Active Sessions', value: '1', color: brandColor },
                { label: 'Login Failures (24h)', value: '0', color: '#0EA5E9' },
              ].map((stat, i) => (
                <Card key={i} className="border border-card-border bg-card-bg p-4 shadow-[var(--card-shadow)] text-left">
                  <p className="text-[10px] text-foreground/45 font-bold uppercase tracking-widest">{stat.label}</p>
                  <p className="text-2xl font-extrabold mt-1" style={{ color: stat.color }}>{stat.value}</p>
                </Card>
              ))}
            </div>
            <Card className="border border-card-border bg-card-bg p-5 shadow-[var(--card-shadow)] space-y-4">
              <p className="text-xs font-extrabold text-[#1A1A1E] dark:text-white">Security Policies</p>
              {[
                { label: 'Require MFA for all users', desc: 'All team members must enable multi-factor authentication', enabled: true },
                { label: 'Session timeout (8 hours)', desc: 'Automatically log out inactive sessions', enabled: true },
                { label: 'Single Sign-On (SSO)', desc: 'Use your existing identity provider for login', enabled: false },
                { label: 'IP Allow-listing', desc: 'Restrict access to specific IP addresses', enabled: false },
              ].map((policy, i) => (
                <div key={i} className="flex items-start justify-between gap-4 py-2 border-b border-card-border last:border-0">
                  <div>
                    <p className="text-xs font-extrabold text-[#1A1A1E] dark:text-white">{policy.label}</p>
                    <p className="text-[10px] text-foreground/50 font-semibold mt-0.5">{policy.desc}</p>
                  </div>
                  <div className={`h-5 w-9 rounded-full shrink-0 cursor-pointer transition-colors ${policy.enabled ? 'bg-green-500' : 'bg-foreground/20'}`}></div>
                </div>
              ))}
            </Card>
          </div>
        );

      // ── NOTIFICATIONS ─────────────────────────────────────────────────
      case 'notifications':
        return (
          <div className="space-y-5">
            <SectionHeader
              title="Notifications"
              desc="Configure how and when your Headquarters alerts you."
              icon={<Bell className="h-5 w-5" style={{ color: brandColor }} />}
            />
            <Card className="border border-card-border bg-card-bg p-5 shadow-[var(--card-shadow)] space-y-4">
              <p className="text-xs font-extrabold text-[#1A1A1E] dark:text-white">Delivery Channels</p>
              {[
                { key: 'notifyEmail', label: 'Email Notifications', desc: 'Receive alerts and executive briefings via email' },
                { key: 'notifyBrowser', label: 'Browser Notifications', desc: 'Show desktop push notifications in the browser' },
                { key: 'notifyPush', label: 'Mobile Push', desc: 'Push notifications on iOS and Android devices' },
              ].map(item => (
                <div key={item.key} className="flex items-start justify-between gap-4 py-2 border-b border-card-border last:border-0">
                  <div>
                    <p className="text-xs font-extrabold text-[#1A1A1E] dark:text-white">{item.label}</p>
                    <p className="text-[10px] text-foreground/50 font-semibold mt-0.5">{item.desc}</p>
                  </div>
                  <button
                    onClick={() => setSettings(p => ({ ...p, [item.key]: !p[item.key as keyof OrgSettings] }))}
                    className={`h-5 w-9 rounded-full shrink-0 transition-colors ${settings[item.key as keyof OrgSettings] ? 'bg-green-500' : 'bg-foreground/20'}`}
                  />
                </div>
              ))}
            </Card>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Quiet Hours Start">
                <input className={inputCls} type="time" value={settings.quietHoursStart} onChange={e => setSettings(p => ({ ...p, quietHoursStart: e.target.value }))} />
              </Field>
              <Field label="Quiet Hours End">
                <input className={inputCls} type="time" value={settings.quietHoursEnd} onChange={e => setSettings(p => ({ ...p, quietHoursEnd: e.target.value }))} />
              </Field>
            </div>
            <SaveBar onSave={handleSave} saving={saving} savedMsg={savedMsg} brandColor={brandColor} />
          </div>
        );

      // ── BILLING ───────────────────────────────────────────────────────
      case 'billing':
        return (
          <div className="space-y-5">
            <SectionHeader
              title="Billing & Subscription"
              desc="Manage your plan, payment methods, and usage."
              icon={<CreditCard className="h-5 w-5" style={{ color: brandColor }} />}
            />
            <Card className="border border-card-border bg-card-bg p-6 shadow-[var(--card-shadow)] flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-full bg-hq-blue/15 text-hq-blue flex items-center justify-center shrink-0" style={{ backgroundColor: `${brandColor}15` }}>
                  <CreditCard className="h-5 w-5" style={{ color: brandColor }} />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-[#1A1A1E] dark:text-white">Upgraded to Billing Portal</h4>
                  <p className="text-[10px] text-foreground/50 font-semibold mt-1 leading-relaxed">
                    This section has been promoted to a top-level workspace containing credit usage breakdown, cost optimizations, and Stripe/Paystack paygates.
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                className="text-white text-xs font-bold h-8.5 shrink-0"
                style={{ backgroundColor: brandColor }}
                onClick={() => window.location.href = '/billing'}
              >
                Go to Billing Portal
              </Button>
            </Card>
          </div>
        );

      // ── AI EXECUTIVES ─────────────────────────────────────────────────
      case 'executives':
        return (
          <div className="space-y-5">
            <SectionHeader
              title="AI Executives"
              desc="Configure your AI C-Suite: names, personalities, availability, and permissions."
              icon={<Bot className="h-5 w-5" style={{ color: brandColor }} />}
            />
            <Card className="border border-card-border bg-card-bg p-5 shadow-[var(--card-shadow)] space-y-4">
              <p className="text-xs font-extrabold text-[#1A1A1E] dark:text-white">AI Personality Settings</p>
              <p className="text-[10px] text-foreground/50 font-semibold">These settings affect how all AI executives communicate with your organization.</p>
              <div className="grid gap-4 md:grid-cols-3">
                <Field label="Communication Tone">
                  <select className={selectCls} value={settings.aiTone} onChange={e => setSettings(p => ({ ...p, aiTone: e.target.value }))}>
                    {AI_TONES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </Field>
                <Field label="Formality Level">
                  <select className={selectCls} value={settings.aiFormality} onChange={e => setSettings(p => ({ ...p, aiFormality: e.target.value }))}>
                    {AI_FORMALITIES.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </Field>
                <Field label="Response Length">
                  <select className={selectCls} value={settings.aiResponseLength} onChange={e => setSettings(p => ({ ...p, aiResponseLength: e.target.value }))}>
                    {AI_LENGTHS.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </Field>
              </div>
            </Card>
            <div className="grid gap-3 md:grid-cols-2">
              {['CEO', 'CFO', 'CTO', 'COO', 'CMO', 'CISO'].map((role, i) => {
                const colors = ['#0A84FF', '#8B5CF6', '#0EA5E9', '#F59E0B', '#EC4899', '#EF4444'];
                return (
                  <Card key={role} className="border border-card-border bg-card-bg p-4 shadow-[var(--card-shadow)] flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full flex items-center justify-center font-extrabold text-white text-[10px] shrink-0" style={{ backgroundColor: colors[i % colors.length] }}>
                      {role}
                    </div>
                    <div className="flex-1 min-w-0">
                      <input className="text-xs font-extrabold text-[#1A1A1E] dark:text-white bg-transparent border-0 outline-none w-full" defaultValue={role} />
                      <p className="text-[10px] text-foreground/45 font-semibold">{role} · Active</p>
                    </div>
                    <div className="h-4 w-8 rounded-full bg-green-500 shrink-0"></div>
                  </Card>
                );
              })}
            </div>
            <SaveBar onSave={handleSave} saving={saving} savedMsg={savedMsg} brandColor={brandColor} />
          </div>
        );

      // ── INTEGRATIONS ──────────────────────────────────────────────────
      case 'integrations':
        return (
          <div className="space-y-5">
            <SectionHeader
              title="Integrations"
              desc="Connect your Headquarters with the tools your organization depends on."
              icon={<Plug2 className="h-5 w-5" style={{ color: brandColor }} />}
            />
            <Card className="border border-card-border bg-card-bg p-6 shadow-[var(--card-shadow)] flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-full bg-hq-cyan/15 text-hq-cyan flex items-center justify-center shrink-0" style={{ backgroundColor: `${brandColor}15` }}>
                  <Plug2 className="h-5 w-5" style={{ color: brandColor }} />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-[#1A1A1E] dark:text-white">Upgraded to Integrations Hub</h4>
                  <p className="text-[10px] text-foreground/50 font-semibold mt-1 leading-relaxed">
                    This section has been promoted to a top-level workspace containing OAuth connection wizards, permissions toggles, and event-driven automation recipes.
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                className="text-white text-xs font-bold h-8.5 shrink-0"
                style={{ backgroundColor: brandColor }}
                onClick={() => window.location.href = '/integration-hub'}
              >
                Go to Integrations Hub
              </Button>
            </Card>
          </div>
        );

      // ── API & DEVELOPERS ──────────────────────────────────────────────
      case 'api':
        return (
          <div className="space-y-5">
            <SectionHeader
              title="API & Developers"
              desc="Manage API keys, webhooks, and developer credentials."
              icon={<Code2 className="h-5 w-5" style={{ color: brandColor }} />}
            />
            <Card className="border border-card-border bg-card-bg p-5 shadow-[var(--card-shadow)] space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-extrabold text-[#1A1A1E] dark:text-white">API Keys</p>
              </div>
              <div className="flex gap-2">
                <input
                  className={`${inputCls} flex-1`}
                  placeholder="Key name (e.g. Production App)"
                  value={newKeyName}
                  onChange={e => setNewKeyName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleCreateKey()}
                />
                <Button size="sm" className="h-9 text-white font-bold text-xs shrink-0" style={{ backgroundColor: brandColor }} onClick={handleCreateKey}>
                  <Plus className="h-3.5 w-3.5 mr-1" /> Generate
                </Button>
              </div>
              {newKeyResult && (
                <div className="p-3 rounded-xl border border-amber-500/20 bg-amber-500/5 space-y-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                    <p className="text-[10px] font-extrabold text-amber-500">Copy this key now — it will not be shown again.</p>
                  </div>
                  <div className="flex items-center gap-2 bg-[#F9F9FB] dark:bg-[#0A0A0C] rounded-lg p-2 border border-card-border">
                    <code className="text-[10px] font-mono text-hq-cyan flex-1 break-all">
                      {newKeyVisible ? newKeyResult : newKeyResult.replace(/./g, '•')}
                    </code>
                    <button onClick={() => setNewKeyVisible(v => !v)} className="text-foreground/40 hover:text-foreground">
                      {newKeyVisible ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                    <button onClick={() => copyToClipboard(newKeyResult, 'new')} className="text-foreground/40 hover:text-hq-cyan">
                      {copiedId === 'new' ? <CheckCircle2 className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>
              )}
              {apiKeys.length === 0 ? (
                <EmptyState text="No API keys yet. Generate one above to get started." />
              ) : (
                <div className="space-y-2">
                  {apiKeys.map(k => (
                    <div key={k.id} className="flex items-center justify-between p-3 rounded-xl border border-card-border bg-[#F9F9FB] dark:bg-[#0A0A0C]">
                      <div className="flex items-center gap-3">
                        <Key className="h-4 w-4 text-hq-cyan shrink-0" />
                        <div>
                          <p className="text-xs font-extrabold text-[#1A1A1E] dark:text-white">{k.name}</p>
                          <p className="text-[10px] text-foreground/45 font-mono">{k.keyPrefix}•••••••••••••••••••••</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="text-[10px] text-foreground/40 font-semibold">
                          {k.lastUsedAt ? `Used ${new Date(k.lastUsedAt).toLocaleDateString()}` : 'Never used'}
                        </p>
                        <button onClick={() => handleRevokeKey(k.id)} className="text-red-400 hover:text-red-500">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        );

      // ── AUDIT LOGS ────────────────────────────────────────────────────
      case 'audit':
        return (
          <div className="space-y-5">
            <SectionHeader
              title="Audit Logs"
              desc="Review a complete history of administrative actions in your Headquarters."
              icon={<FileText className="h-5 w-5" style={{ color: brandColor }} />}
            />
            <Card className="border border-card-border bg-card-bg p-5 shadow-[var(--card-shadow)] space-y-3">
              {auditLogs.length === 0 ? (
                <EmptyState text="No audit events recorded yet. Actions will appear here as your team uses HQ." />
              ) : (
                auditLogs.map(log => (
                  <div key={log.id} className="flex items-start justify-between gap-4 p-3 rounded-xl border border-card-border bg-[#F9F9FB] dark:bg-[#0A0A0C]">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-[11px] font-extrabold text-[#1A1A1E] dark:text-white capitalize">{log.eventType.replace(/_/g, ' ')}</p>
                        <p className="text-[10px] text-foreground/45 font-semibold">
                          {log.actor ? `${log.actor.name || log.actor.email}` : 'System'} · {new Date(log.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </Card>
          </div>
        );

      // ── PREFERENCES ───────────────────────────────────────────────────
      case 'preferences':
        return (
          <div className="space-y-5">
            <SectionHeader
              title="Preferences"
              desc="Personal display and interface preferences for your account."
              icon={<Settings2 className="h-5 w-5" style={{ color: brandColor }} />}
            />
            <Card className="border border-card-border bg-card-bg p-5 shadow-[var(--card-shadow)] space-y-4">
              {[
                { label: 'Theme', options: ['System', 'Light', 'Dark'], hint: 'Controls the color scheme of your workspace' },
                { label: 'Date Format', options: ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'], hint: 'How dates appear across the application' },
                { label: 'Default Workspace', options: ['Dashboard', 'Missions', 'Boardroom', 'Analytics'], hint: 'First page you see after login' },
              ].map(pref => (
                <Field key={pref.label} label={pref.label} hint={pref.hint}>
                  <select className={selectCls}>
                    {pref.options.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </Field>
              ))}
            </Card>
          </div>
        );

      // ── SUPPORT ───────────────────────────────────────────────────────
      case 'support':
        return (
          <div className="space-y-5">
            <SectionHeader
              title="Support"
              desc="Get help, report issues, and access resources."
              icon={<HeadphonesIcon className="h-5 w-5" style={{ color: brandColor }} />}
            />
            <div className="grid gap-4 md:grid-cols-2">
              {[
                { label: 'Documentation', desc: 'Browse guides and API reference', icon: '📚' },
                { label: 'Contact Support', desc: 'Open a ticket with our team', icon: '🎫' },
                { label: 'Feature Requests', desc: 'Vote and submit new ideas', icon: '💡' },
                { label: 'System Status', desc: 'Check uptime and incidents', icon: '🟢' },
              ].map(item => (
                <Card key={item.label} className="border border-card-border bg-card-bg p-4 shadow-[var(--card-shadow)] flex items-center gap-3 cursor-pointer hover:border-hq-blue/40 transition-colors group">
                  <span className="text-2xl">{item.icon}</span>
                  <div className="flex-1">
                    <p className="text-xs font-extrabold text-[#1A1A1E] dark:text-white">{item.label}</p>
                    <p className="text-[10px] text-foreground/50 font-semibold">{item.desc}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-foreground/30 group-hover:text-foreground transition-colors" />
                </Card>
              ))}
            </div>
          </div>
        );

      default:
        return (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <Info className="h-8 w-8 text-foreground/25" />
            <p className="text-xs text-foreground/40 font-semibold">This section is coming soon.</p>
          </div>
        );
    }
  };

  return (
    <div className="flex gap-6 text-foreground h-full pb-12">

      {/* ─── Left sidebar nav ─────────────────────────────────────────── */}
      <aside className="w-52 shrink-0 space-y-1">
        <p className="text-[9px] font-extrabold text-foreground/35 uppercase tracking-widest px-2 pb-1">Essential</p>
        {ESSENTIAL_SECTIONS.map(s => {
          const Icon = s.icon;
          const active = activeSection === s.id;
          return (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-xs font-bold transition-all ${
                active ? 'text-white' : 'text-foreground/60 hover:text-foreground hover:bg-foreground/5'
              }`}
              style={active ? { backgroundColor: brandColor } : {}}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" />
              {s.label}
            </button>
          );
        })}

        <p className="text-[9px] font-extrabold text-foreground/35 uppercase tracking-widest px-2 pb-1 pt-4">Advanced</p>
        {ADVANCED_SECTIONS.map(s => {
          const Icon = s.icon;
          const active = activeSection === s.id;
          return (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-xs font-bold transition-all ${
                active ? 'text-white' : 'text-foreground/60 hover:text-foreground hover:bg-foreground/5'
              }`}
              style={active ? { backgroundColor: brandColor } : {}}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" />
              {s.label}
            </button>
          );
        })}
      </aside>

      {/* ─── Main content ─────────────────────────────────────────────── */}
      <main className="flex-1 min-w-0">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <div className="h-8 w-8 rounded-full border-2 border-hq-blue border-t-transparent animate-spin"></div>
            <p className="text-xs text-foreground/50">Loading settings...</p>
          </div>
        ) : (
          renderSection()
        )}
      </main>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionHeader({ title, desc, icon }: { title: string; desc: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 pb-4 border-b border-card-border mb-5">
      <div className="mt-0.5">{icon}</div>
      <div>
        <h2 className="text-base font-extrabold text-[#1A1A1E] dark:text-white">{title}</h2>
        <p className="text-xs text-foreground/55 font-semibold mt-0.5">{desc}</p>
      </div>
    </div>
  );
}

function SaveBar({ onSave, saving, savedMsg, brandColor }: { onSave: () => void; saving: boolean; savedMsg: string; brandColor: string }) {
  return (
    <div className="flex items-center justify-between pt-4 border-t border-card-border mt-2">
      <p className="text-[10px] text-green-500 font-extrabold h-4">{savedMsg}</p>
      <Button onClick={onSave} disabled={saving} size="sm" className="text-white font-bold text-xs h-8" style={{ backgroundColor: brandColor }}>
        <Save className="h-3.5 w-3.5 mr-1.5" />
        {saving ? 'Saving...' : 'Save Changes'}
      </Button>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="py-10 flex flex-col items-center justify-center space-y-2">
      <p className="text-[11px] text-foreground/40 font-semibold text-center max-w-xs">{text}</p>
    </div>
  );
}
