'use client';

import * as React from 'react';
import {
  Card,
  Button,
  Badge,
  Input,
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
  GitBranch,
  Network,
  Mail,
  Send,
  CheckCircle,
  Activity,
  Award,
  MapPin,
  Archive,
  Briefcase,
  UserCheck,
  Clock,
  UserCheck2,
} from 'lucide-react';
import { useAuth } from '../../../contexts/auth-context';
import { useGuideMode } from '../../../contexts/guide-mode-context';
import { toast } from '../../../components/toast';

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
  department?: string;
  team?: string;
  assignedExecutives?: string[];
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
  { id: 'organization', label: 'Organization & Hierarchy', icon: Globe },
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
  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [savedMsg, setSavedMsg] = React.useState('');

  const [settings, setSettings] = React.useState<OrgSettings>({
    hqName: 'Vision HQ',
    timezone: 'UTC',
    language: 'English',
    currency: 'USD',
    legalName: '',
    businessAddress: '',
    contactEmail: '',
    industry: 'Technology',
    aiTone: 'Executive',
    aiFormality: 'Formal',
    aiResponseLength: 'Balanced',
    notifyEmail: true,
    notifyBrowser: true,
    notifyPush: false,
    quietHoursStart: '22:00',
    quietHoursEnd: '07:00',
  });

  const [teamMembers, setTeamMembers] = React.useState<TeamMember[]>([]);
  const [apiKeys, setApiKeys] = React.useState<ApiKey[]>([]);
  const [auditLogs, setAuditLogs] = React.useState<AuditLog[]>([]);

  // Sub-tabs states
  const [orgTab, setOrgTab] = React.useState<'overview' | 'structure' | 'branches' | 'evolution'>('overview');
  const [teamTab, setTeamTab] = React.useState<'directory' | 'chart' | 'workspaces' | 'invitations'>('directory');

  // Interactive form states
  const [newDeptName, setNewDeptName] = React.useState('');
  const [newDeptExec, setNewDeptExec] = React.useState('');
  const [departments, setDepartments] = React.useState<any[]>([]);

  const [newBranchName, setNewBranchName] = React.useState('');
  const [newBranchRegion, setNewBranchRegion] = React.useState('');
  const [newBranchManager, setNewBranchManager] = React.useState('');
  const [branches, setBranches] = React.useState<any[]>([]);

  const [inviteEmail, setInviteEmail] = React.useState('');
  const [inviteRole, setInviteRole] = React.useState('MEMBER');
  const [invitations, setInvitations] = React.useState<any[]>([]);

  const [workspaces, setWorkspaces] = React.useState<any[]>([]);
  const [newWsName, setNewWsName] = React.useState('');
  const [newWsDesc, setNewWsDesc] = React.useState('');

  const [selectedMember, setSelectedMember] = React.useState<TeamMember | null>(null);

  // API Key Generator states
  const [newKeyName, setNewKeyName] = React.useState('');
  const [newKeyResult, setNewKeyResult] = React.useState<string | null>(null);
  const [newKeyVisible, setNewKeyVisible] = React.useState(false);

  // Dynamic branding
  const [brandColor, setBrandColor] = React.useState('#0A84FF');

  React.useEffect(() => {
    const draft = localStorage.getItem('hq_onboarding_draft');
    if (draft) {
      try {
        const d = JSON.parse(draft);
        if (d.brandColor) setBrandColor(d.brandColor);
      } catch { /* ignore */ }
    }
  }, []);

  // Fetch settings data
  React.useEffect(() => {
    if (!token) return;
    const headers = { Authorization: `Bearer ${token}` };
    setLoading(true);
    Promise.all([
      fetch('/api/settings/org', { headers }).then((r) => (r.ok ? r.json() : null)),
      fetch('/api/settings/team', { headers }).then((r) => (r.ok ? r.json() : [])),
      fetch('/api/settings/api-keys', { headers }).then((r) => (r.ok ? r.json() : [])),
      fetch('/api/settings/audit-logs', { headers }).then((r) => (r.ok ? r.json() : [])),
    ])
      .then(([org, team, keys, logs]) => {
        if (org) setSettings((prev) => ({ ...prev, ...org }));
        const mappedTeam = (team || []).map((m: any) => ({
          id: m.id,
          name: m.name || m.email.split('@')[0],
          email: m.email,
          role: m.role || 'MEMBER',
          createdAt: m.createdAt,
          department: m.role === 'ORGANIZATION_OWNER' ? 'Executive Office' : 'Technology & Engineering',
          team: m.role === 'ORGANIZATION_OWNER' ? 'Boardroom' : 'Backend Devs',
          assignedExecutives: m.role === 'ORGANIZATION_OWNER' ? ['Asad (CEO)', 'Teema (Ops)'] : ['Legal (Compliance)'],
        }));
        setTeamMembers(mappedTeam);
        setApiKeys(keys || []);
        setAuditLogs(logs || []);
      })
      .catch((e) => console.error('Error fetching settings:', e))
      .finally(() => setLoading(false));
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
    try {
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
        const keysRes = await fetch('/api/settings/api-keys', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (keysRes.ok) {
          const keysData = await keysRes.json();
          setApiKeys(keysData);
        }
      }
    } catch (e) {
      console.error('Failed to create key:', e);
    }
  };

  const handleDeleteKey = async (keyId: string) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/settings/api-keys/${keyId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setApiKeys((prev) => prev.filter((k) => k.id !== keyId));
      }
    } catch (e) {
      console.error('Failed to revoke key:', e);
    }
  };

  const handleAddDepartment = () => {
    if (!newDeptName.trim()) return;
    const newDept = {
      id: `dept-${Date.now()}`,
      name: newDeptName,
      executive: newDeptExec || 'Unassigned Executive',
      teamCount: 0,
      missionCount: 0,
      status: 'Active',
    };
    setDepartments((prev) => [...prev, newDept]);
    setNewDeptName('');
    setNewDeptExec('');
    toast.success(`🏢 Department "${newDept.name}" added successfully`);
  };

  const handleArchiveDept = (id: string, name: string) => {
    setDepartments((prev) => prev.map((d) => (d.id === id ? { ...d, status: 'Archived' } : d)));
    toast.info(`📦 Archived department: "${name}"`);
  };

  const handleAddBranch = () => {
    if (!newBranchName.trim()) return;
    const newBr = {
      id: `br-${Date.now()}`,
      name: newBranchName,
      region: newBranchRegion || 'Global',
      manager: newBranchManager || 'Asad (CEO)',
      memberCount: 1,
    };
    setBranches((prev) => [...prev, newBr]);
    setNewBranchName('');
    setNewBranchRegion('');
    setNewBranchManager('');
    toast.success(`🌍 Branch "${newBr.name}" registered successfully`);
  };

  const handleSendInvitation = async () => {
    if (!inviteEmail.trim() || !token) return;
    try {
      const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
      const res = await fetch('/api/settings/team', {
        method: 'POST',
        headers,
        body: JSON.stringify({ email: inviteEmail, name: inviteEmail.split('@')[0], role: inviteRole }),
      });
      if (res.ok) {
        const newInv = {
          id: `inv-${Date.now()}`,
          email: inviteEmail,
          role: inviteRole,
          invitedAt: new Date().toISOString().split('T')[0],
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        };
        setInvitations((prev) => [...prev, newInv]);
        setInviteEmail('');
        toast.success(`✉️ Invitation sent successfully to: "${newInv.email}"`);

        const teamRes = await fetch('/api/settings/team', { headers });
        if (teamRes.ok) {
          const teamData = await teamRes.json();
          setTeamMembers(teamData);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCancelInvitation = (id: string, email: string) => {
    setInvitations((prev) => prev.filter((inv) => inv.id !== id));
    toast.info(`🗑️ Invitation to "${email}" cancelled`);
  };

  const handleCreateWorkspace = () => {
    if (!newWsName.trim()) return;
    const newWs = {
      id: `ws-${Date.now()}`,
      name: newWsName,
      description: newWsDesc,
      membersCount: 1,
      executives: ['Morgan Vance'],
    };
    setWorkspaces((prev) => [...prev, newWs]);
    setNewWsName('');
    setNewWsDesc('');
    toast.success(`🚀 Collaboration Workspace "${newWs.name}" initialized`);
  };

  const handleUpdateRole = (id: string, role: string) => {
    setTeamMembers((prev) => prev.map((m) => (m.id === id ? { ...m, role } : m)));
    if (selectedMember && selectedMember.id === id) {
      setSelectedMember((prev) => (prev ? { ...prev, role } : null));
    }
    toast.success('🔒 Access control role updated');
  };

  const inputCls = 'bg-white dark:bg-card-bg border border-slate-300 dark:border-card-border rounded-xl w-full p-2.5 h-10 text-sm focus:outline-none text-slate-900 dark:text-foreground placeholder:text-slate-400 dark:placeholder:text-foreground/30 shadow-sm';
  const selectCls = 'bg-white dark:bg-card-bg border border-slate-300 dark:border-card-border rounded-xl w-full p-2.5 h-10 text-sm focus:outline-none text-slate-900 dark:text-foreground shadow-sm';

  // ─── Render Panels ─────────────────────────────────────────────────────────

  const renderSection = () => {
    switch (activeSection) {
      // ── HEADQUARTERS ──────────────────────────────────────────────────
      case 'headquarters':
        return (
          <div className="space-y-5 text-left animate-in fade-in duration-300">
            <SectionHeader
              title="Headquarters Settings"
              desc="Configure your HQ's identity, locale parameters, and default language settings."
              icon={<Building2 className="h-5 w-5 text-cyan-500" />}
            />
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Headquarters Name" hint="Appears across the entire application">
                <input className={inputCls} value={settings.hqName} onChange={(e) => setSettings((p) => ({ ...p, hqName: e.target.value }))} placeholder="e.g. Vision HQ" />
              </Field>

              {/* Executive Honorific Title, Name & Preferred Asad Voice Persona */}
              <Field label="Executive Honorific Title" hint="Used by Asad Voice Assistant when speaking to you">
                <select
                  className={selectCls}
                  value={localStorage.getItem('hq_user_title') || 'Alh'}
                  onChange={(e) => {
                    localStorage.setItem('hq_user_title', e.target.value);
                    toast.success(`Title set to "${e.target.value}"`);
                  }}
                >
                  <option value="Alh">Alhaji / Hajjia (Alh)</option>
                  <option value="Dr">Doctor (Dr)</option>
                  <option value="Prof">Professor (Prof)</option>
                  <option value="Engr">Engineer (Engr)</option>
                  <option value="Surv">Surveyor (Surv)</option>
                  <option value="Arc">Architect (Arc)</option>
                  <option value="Barr">Barrister (Barr)</option>
                  <option value="Chief">Chief</option>
                  <option value="Mr">Mr</option>
                  <option value="Mrs">Mrs</option>
                  <option value="Ms">Ms</option>
                  <option value="Sir">Sir</option>
                  <option value="Lady">Lady</option>
                </select>
              </Field>

              <Field label="Executive First/Last Name" hint="Used by Asad Voice Assistant">
                <input
                  className={inputCls}
                  defaultValue={localStorage.getItem('hq_user_display_name') || 'Umar'}
                  onBlur={(e) => {
                    localStorage.setItem('hq_user_display_name', e.target.value);
                    toast.success('Executive Display Name saved');
                  }}
                  placeholder="e.g. Umar / Sophia"
                />
              </Field>

              <Field label="Preferred Asad AI Voice Persona" hint="Selected voice model for Asad TTS responses">
                <div className="flex items-center gap-2">
                  <select
                    className={`${selectCls} flex-1`}
                    value={localStorage.getItem('hq_asad_voice_persona') || 'Asad Male Executive'}
                    onChange={(e) => {
                      localStorage.setItem('hq_asad_voice_persona', e.target.value);
                      toast.success(`Asad Voice Persona updated to "${e.target.value}"`);
                    }}
                  >
                    <option value="Asad Male Executive">Asad Male Executive (Resonant & Confident)</option>
                    <option value="Asad Female Executive">Asad Female Executive (Articulate & Polished)</option>
                    <option value="Asad Neural British">Asad Neural British (Refined & Crisp)</option>
                    <option value="Asad System Default">Asad System Default</option>
                  </select>

                  <button
                    type="button"
                    onClick={() => {
                      if ('speechSynthesis' in window) {
                        window.speechSynthesis.cancel();
                        const title = localStorage.getItem('hq_user_title') || 'Alh';
                        const name = localStorage.getItem('hq_user_display_name') || 'Umar';
                        const persona = localStorage.getItem('hq_asad_voice_persona') || 'Asad Male Executive';
                        const sample = new SpeechSynthesisUtterance(`Okay, ${title} ${name}, Asad voice persona test active.`);
                        sample.pitch = persona.includes('Female') ? 1.25 : 0.95;
                        window.speechSynthesis.speak(sample);
                      }
                    }}
                    className="h-10 px-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold hover:bg-cyan-500/20 flex items-center gap-1.5 flex-shrink-0"
                  >
                    <HeadphonesIcon className="h-4 w-4" /> Test Voice
                  </button>
                </div>
              </Field>

              <Field label="Industry" hint="Your organization's primary sector">
                <input className={inputCls} value={settings.industry || ''} onChange={(e) => setSettings((p) => ({ ...p, industry: e.target.value }))} placeholder="e.g. Technology, Logistics" />
              </Field>
              <Field label="Timezone">
                <select className={selectCls} value={settings.timezone} onChange={(e) => setSettings((p) => ({ ...p, timezone: e.target.value }))}>
                  {TIMEZONES.map((tz) => <option key={tz} value={tz}>{tz}</option>)}
                </select>
              </Field>
              <Field label="Language">
                <select className={selectCls} value={settings.language} onChange={(e) => setSettings((p) => ({ ...p, language: e.target.value }))}>
                  {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </Field>
              <Field label="Default Currency">
                <select className={selectCls} value={settings.currency} onChange={(e) => setSettings((p) => ({ ...p, currency: e.target.value }))}>
                  {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="Contact Email">
                <input className={inputCls} type="email" value={settings.contactEmail || ''} onChange={(e) => setSettings((p) => ({ ...p, contactEmail: e.target.value }))} placeholder="admin@yourcompany.com" />
              </Field>
            </div>
            <SaveBar onSave={handleSave} saving={saving} savedMsg={savedMsg} brandColor={brandColor} />
          </div>
        );

      // ── ORGANIZATION & HIERARCHY ──────────────────────────────────────
      case 'organization':
        return (
          <div className="space-y-6 text-left animate-in fade-in duration-300">
            <SectionHeader
              title="Organization & Hierarchy"
              desc="Model business units, map department structure, align branch offices, and audit growth trajectory."
              icon={<Globe className="h-5 w-5 text-cyan-500" />}
            />

            {/* Sub Tabs */}
            <div className="flex gap-1 border-b border-slate-200 dark:border-card-border pb-1">
              {[
                { id: 'overview', label: 'Identity Profile', icon: Globe },
                { id: 'structure', label: 'Departments & Structure', icon: GitBranch },
                { id: 'branches', label: 'Regional Branches', icon: MapPin },
                { id: 'evolution', label: 'Evolution Stage', icon: Award },
              ].map((tab) => {
                const Icon = tab.icon;
                const active = orgTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setOrgTab(tab.id as any)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold transition-all border-b-2 ${
                      active ? 'text-cyan-500 border-cyan-500' : 'text-slate-500 dark:text-foreground/50 border-transparent hover:text-slate-900 dark:hover:text-foreground'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Sub Tab Content */}
            <div className="space-y-5">
              {orgTab === 'overview' && (
                <div className="grid gap-6 md:grid-cols-3">
                  <div className="md:col-span-2 space-y-5">
                    <Card className="border border-slate-200 dark:border-card-border bg-white dark:bg-card-bg p-5 shadow-sm space-y-4">
                      <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <Globe className="h-4 w-4 text-cyan-500" />
                        Corporate Identity profile
                      </h3>
                      <div className="grid gap-4 sm:grid-cols-2 text-xs">
                        <div>
                          <span className="text-slate-500 dark:text-foreground/45 font-bold uppercase tracking-wider block">Organization Name</span>
                          <span className="text-sm font-black text-slate-900 dark:text-white">{settings.hqName}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 dark:text-foreground/45 font-bold uppercase tracking-wider block">Sector Industry</span>
                          <span className="text-sm font-semibold text-slate-800 dark:text-foreground">{settings.industry || 'Technology & Logistics'}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 dark:text-foreground/45 font-bold uppercase tracking-wider block">Legal Entity Name</span>
                          <span className="text-xs font-semibold text-slate-800 dark:text-foreground">{settings.legalName || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 dark:text-foreground/45 font-bold uppercase tracking-wider block">Registered Address</span>
                          <span className="text-xs font-semibold text-slate-800 dark:text-foreground">{settings.businessAddress || 'N/A'}</span>
                        </div>
                      </div>
                    </Card>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return (
          <div className="space-y-5 text-left animate-in fade-in duration-300">
            <SectionHeader
              title="Settings Directory"
              desc="Manage settings across all operational and enterprise modules."
              icon={<Settings2 className="h-5 w-5 text-cyan-500" />}
            />
            <Card className="border border-slate-200 dark:border-card-border bg-white dark:bg-card-bg p-8 text-center shadow-sm">
              <p className="text-xs text-slate-500 dark:text-foreground/50 font-medium">Select a section from the sidebar to inspect parameters.</p>
            </Card>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-8 select-none text-foreground pb-12">
      {/* ─── Left sidebar nav ─────────────────────────────────────────── */}
      <aside className="w-56 shrink-0 space-y-1 text-left">
        <p className="text-[10px] font-black text-slate-400 dark:text-foreground/30 uppercase tracking-widest px-2 pb-1.5">Essential</p>
        {ESSENTIAL_SECTIONS.map((s) => {
          const Icon = s.icon;
          const active = activeSection === s.id;
          return (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-left text-xs font-black transition-all ${
                active ? 'bg-cyan-500 text-white shadow-sm' : 'text-slate-600 dark:text-foreground/50 hover:text-slate-900 dark:hover:text-foreground hover:bg-slate-100 dark:hover:bg-white/5'
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {s.label}
            </button>
          );
        })}

        <p className="text-[10px] font-black text-slate-400 dark:text-foreground/30 uppercase tracking-widest px-2 pb-1.5 pt-5">Advanced</p>
        {ADVANCED_SECTIONS.map((s) => {
          const Icon = s.icon;
          const active = activeSection === s.id;
          return (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-left text-xs font-black transition-all ${
                active ? 'bg-cyan-500 text-white shadow-sm' : 'text-slate-600 dark:text-foreground/50 hover:text-slate-900 dark:hover:text-foreground hover:bg-slate-100 dark:hover:bg-white/5'
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {s.label}
            </button>
          );
        })}
      </aside>

      {/* ─── Main content ─────────────────────────────────────────────── */}
      <main className="flex-1 min-w-0">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <div className="h-8 w-8 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin" />
            <p className="text-xs text-slate-500 dark:text-foreground/45 font-semibold">Loading settings registry...</p>
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
    <div className="flex items-start gap-3 pb-4 border-b border-slate-200 dark:border-card-border mb-5">
      <div className="mt-0.5 shrink-0">{icon}</div>
      <div>
        <h2 className="text-base font-black text-slate-900 dark:text-white tracking-tight leading-none">{title}</h2>
        <p className="text-xs text-slate-500 dark:text-foreground/45 font-semibold mt-1.5 leading-normal">{desc}</p>
      </div>
    </div>
  );
}

function SaveBar({
  onSave,
  saving,
  savedMsg,
  brandColor,
}: {
  onSave: () => void;
  saving: boolean;
  savedMsg: string;
  brandColor: string;
}) {
  return (
    <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-card-border mt-2">
      <p className="text-xs text-emerald-600 dark:text-emerald-400 font-extrabold h-4">{savedMsg}</p>
      <Button
        onClick={onSave}
        disabled={saving}
        size="sm"
        className="text-white font-black text-xs h-8.5 rounded-full px-5 bg-cyan-500 hover:bg-cyan-400"
      >
        <Save className="h-3.5 w-3.5 mr-1.5" />
        {saving ? 'Saving...' : 'Save Changes'}
      </Button>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1 text-left">
      <label className="text-xs font-black text-slate-700 dark:text-foreground/65 block">{label}</label>
      {children}
      {hint && <p className="text-[10.5px] text-slate-500 dark:text-foreground/35 font-semibold mt-0.5 leading-tight">{hint}</p>}
    </div>
  );
}
