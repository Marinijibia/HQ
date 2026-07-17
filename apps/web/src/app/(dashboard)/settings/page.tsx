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
  const {
    guideModeEnabled,
    setGuideModeEnabled,
    missionsCompleted,
    visitedWorkspaces,
    resetProgress,
  } = useGuideMode();

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

  // ── Sub-tab states for Organization & Team ─────────────────────────────────
  const [orgTab, setOrgTab] = React.useState<'overview' | 'structure' | 'branches' | 'evolution'>('overview');
  const [teamTab, setTeamTab] = React.useState<'directory' | 'chart' | 'workspaces' | 'invitations'>('directory');

  // Organization sub-states
  const [departments, setDepartments] = React.useState([
    { id: 'dept-tech', name: 'Technology & Engineering', executive: 'CTO Hiroshi', teamCount: 4, missionCount: 3, status: 'Active' },
    { id: 'dept-mktg', name: 'Growth & Marketing', executive: 'CMO Amara', teamCount: 3, missionCount: 2, status: 'Active' },
    { id: 'dept-fin', name: 'Finance & Compliance', executive: 'CFO Sophia', teamCount: 2, missionCount: 1, status: 'Active' },
    { id: 'dept-cs', name: 'Customer Success', executive: 'CSD Yuki', teamCount: 3, missionCount: 2, status: 'Active' },
  ]);
  const [branches, setBranches] = React.useState([
    { id: 'br-1', name: 'Abuja Headquarters', region: 'Nigeria', manager: 'Elena Rostova', memberCount: 12 },
    { id: 'br-2', name: 'London Office', region: 'United Kingdom', manager: 'Sophia Sterling', memberCount: 8 },
    { id: 'br-3', name: 'Lagos Corridor Hub', region: 'Nigeria', manager: 'Alistair Thorne', memberCount: 15 },
  ]);
  const [newDeptName, setNewDeptName] = React.useState('');
  const [newDeptExec, setNewDeptExec] = React.useState('');
  const [newBranchName, setNewBranchName] = React.useState('');
  const [newBranchRegion, setNewBranchRegion] = React.useState('');
  const [newBranchManager, setNewBranchManager] = React.useState('');

  // Team sub-states
  const [selectedMember, setSelectedMember] = React.useState<TeamMember | null>(null);
  const [invitations, setInvitations] = React.useState([
    { id: 'inv-1', email: 'auditor@external.com', role: 'GUEST', invitedAt: '2026-07-10', expiresAt: '2026-07-17' },
    { id: 'inv-2', email: 'dev.partner@hq.corp', role: 'MEMBER', invitedAt: '2026-07-12', expiresAt: '2026-07-19' },
  ]);
  const [workspaces, setWorkspaces] = React.useState([
    { id: 'ws-1', name: 'Product Growth Workspace', description: 'Cross-functional alignment for Product & Engineering.', membersCount: 5, executives: ['CTO Hiroshi', 'CMO Amara'] },
    { id: 'ws-2', name: 'West African Corridors Campaign', description: 'Operations and Logistics scaling task force.', membersCount: 3, executives: ['Morgan Vance', 'CFO Sophia'] },
  ]);
  const [inviteEmail, setInviteEmail] = React.useState('');
  const [inviteRole, setInviteRole] = React.useState('MEMBER');
  const [inviteDept, setInviteDept] = React.useState('Technology & Engineering');
  const [inviteTeam, setInviteTeam] = React.useState('Backend Devs');
  const [newWsName, setNewWsName] = React.useState('');
  const [newWsDesc, setNewWsDesc] = React.useState('');

  // Handle URL active section sync
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab') || params.get('section');
      if (tab) {
        if (tab === 'team' || tab === 'teams') {
          setActiveSection('team');
        } else if (tab === 'organization' || tab === 'org') {
          setActiveSection('organization');
        } else if (ESSENTIAL_SECTIONS.some((s) => s.id === tab) || ADVANCED_SECTIONS.some((s) => s.id === tab)) {
          setActiveSection(tab);
        }
      }
    }
  }, []);

  // Load brand color from local storage
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
        // Map backend team members to support UI fields
        const mappedTeam = (team || []).map((m: any) => ({
          id: m.id,
          name: m.name || m.email.split('@')[0],
          email: m.email,
          role: m.role || 'MEMBER',
          createdAt: m.createdAt,
          department: m.role === 'ORGANIZATION_OWNER' ? 'Executive Office' : 'Technology & Engineering',
          team: m.role === 'ORGANIZATION_OWNER' ? 'Boardroom' : 'Backend Devs',
          assignedExecutives: m.role === 'ORGANIZATION_OWNER' ? ['Elena Rostova (CEO)', 'Alistair Thorne'] : ['Dr. Hiroshi Tanaka'],
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
        // Refresh keys
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

  // Organization operations
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
      manager: newBranchManager || 'Elena Rostova',
      memberCount: 1,
    };
    setBranches((prev) => [...prev, newBr]);
    setNewBranchName('');
    setNewBranchRegion('');
    setNewBranchManager('');
    toast.success(`🌍 Branch "${newBr.name}" registered successfully`);
  };

  // Team operations
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

        // Refresh team members list
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

  const inputCls = 'bg-card-bg border border-card-border rounded-xl w-full p-2.5 h-10 text-sm focus:outline-none text-foreground placeholder:text-foreground/30';
  const selectCls = 'bg-card-bg border border-card-border rounded-xl w-full p-2.5 h-10 text-sm focus:outline-none text-foreground';

  // ─── Render Panels ─────────────────────────────────────────────────────────

  const renderSection = () => {
    switch (activeSection) {
      // ── HEADQUARTERS ──────────────────────────────────────────────────
      case 'headquarters':
        return (
          <div className="space-y-5 text-left">
            <SectionHeader
              title="Headquarters Settings"
              desc="Configure your HQ's identity, locale parameters, and default language settings."
              icon={<Building2 className="h-5 w-5" style={{ color: brandColor }} />}
            />
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Headquarters Name" hint="Appears across the entire application">
                <input className={inputCls} value={settings.hqName} onChange={(e) => setSettings((p) => ({ ...p, hqName: e.target.value }))} placeholder="e.g. Vision HQ" />
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
          <div className="space-y-6 text-left">
            <SectionHeader
              title="Organization & Hierarchy"
              desc="Model business units, map department structure, align branch offices, and audit growth trajectory."
              icon={<Globe className="h-5 w-5" style={{ color: brandColor }} />}
            />

            {/* Sub Tabs */}
            <div className="flex gap-1 border-b border-card-border pb-1">
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
                      active ? 'text-white' : 'text-foreground/50 hover:text-foreground'
                    }`}
                    style={active ? { borderColor: brandColor, color: brandColor } : { borderColor: 'transparent' }}
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
                    <Card className="border border-card-border bg-card-bg p-5 shadow-[var(--card-shadow)] space-y-4">
                      <h3 className="text-sm font-extrabold text-foreground flex items-center gap-1.5">
                        <Globe className="h-4 w-4 text-hq-cyan" />
                        Corporate Identity profile
                      </h3>
                      <div className="grid gap-4 sm:grid-cols-2 text-xs">
                        <div>
                          <span className="text-foreground/45 font-bold uppercase tracking-wider block">Organization Name</span>
                          <span className="text-sm font-black text-foreground">{settings.hqName}</span>
                        </div>
                        <div>
                          <span className="text-foreground/45 font-bold uppercase tracking-wider block">Sector Industry</span>
                          <span className="text-sm font-semibold text-foreground">{settings.industry || 'Technology & Logistics'}</span>
                        </div>
                        <div>
                          <span className="text-foreground/45 font-bold uppercase tracking-wider block">Legal Entity Name</span>
                          <span className="text-xs font-semibold text-foreground">{settings.legalName || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-foreground/45 font-bold uppercase tracking-wider block">Registered Address</span>
                          <span className="text-xs font-semibold text-foreground">{settings.businessAddress || 'N/A'}</span>
                        </div>
                      </div>
                    </Card>
                  </div>
                  <div className="space-y-4">
                    <Card className="border border-card-border bg-card-bg p-5 shadow-[var(--card-shadow)] space-y-3">
                      <h4 className="text-xs font-black text-foreground/40 uppercase tracking-widest flex items-center gap-1">
                        <Activity className="h-4.5 w-4.5 text-hq-cyan animate-pulse" />
                        Hierarchy Metrics
                      </h4>
                      <div className="space-y-2.5 text-xs">
                        <div className="flex justify-between">
                          <span className="text-foreground/50">Active Departments</span>
                          <span className="font-bold text-hq-cyan">{departments.filter((d) => d.status === 'Active').length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-foreground/50">Regional Branches</span>
                          <span className="font-bold text-hq-purple">{branches.length}</span>
                        </div>
                      </div>
                    </Card>
                  </div>
                </div>
              )}

              {orgTab === 'structure' && (
                <div className="grid gap-6 md:grid-cols-3">
                  <div className="md:col-span-2 space-y-3">
                    {departments.filter((d) => d.status === 'Active').map((dept) => (
                      <Card key={dept.id} className="border border-card-border bg-card-bg p-4 flex items-center justify-between">
                        <div className="text-left">
                          <h4 className="text-sm font-bold text-foreground">{dept.name}</h4>
                          <p className="text-xs text-foreground/45 mt-0.5">Specialist Coordinator: {dept.executive}</p>
                        </div>
                        <button onClick={() => handleArchiveDept(dept.id, dept.name)} className="text-foreground/35 hover:text-red-500 transition-colors">
                          <Archive className="h-4 w-4" />
                        </button>
                      </Card>
                    ))}
                  </div>
                  <div>
                    <Card className="border border-card-border bg-card-bg p-5 space-y-4">
                      <h4 className="text-xs font-black text-foreground uppercase tracking-wider">Add Department</h4>
                      <div className="space-y-3 text-xs">
                        <Field label="Department Name">
                          <Input value={newDeptName} onChange={(e) => setNewDeptName(e.target.value)} placeholder="e.g. Legal Division" />
                        </Field>
                        <Field label="Board Coordinator">
                          <Input value={newDeptExec} onChange={(e) => setNewDeptExec(e.target.value)} placeholder="e.g. Jack Bauer" />
                        </Field>
                        <Button onClick={handleAddDepartment} size="sm" className="w-full text-white text-xs font-bold rounded-full" style={{ backgroundColor: brandColor }}>
                          Add Department
                        </Button>
                      </div>
                    </Card>
                  </div>
                </div>
              )}

              {orgTab === 'branches' && (
                <div className="grid gap-6 md:grid-cols-3">
                  <div className="md:col-span-2 space-y-3">
                    {branches.map((br) => (
                      <Card key={br.id} className="border border-card-border bg-card-bg p-4 flex justify-between items-center">
                        <div>
                          <h4 className="text-sm font-bold text-foreground">{br.name}</h4>
                          <p className="text-xs text-foreground/45 mt-0.5">Manager: {br.manager} • Region: {br.region}</p>
                        </div>
                        <Badge variant="neutral" className="text-xs">{br.memberCount} Staff</Badge>
                      </Card>
                    ))}
                  </div>
                  <div>
                    <Card className="border border-card-border bg-card-bg p-5 space-y-4">
                      <h4 className="text-xs font-black text-foreground uppercase tracking-wider">Register Branch</h4>
                      <div className="space-y-3 text-xs">
                        <Field label="Branch Name">
                          <Input value={newBranchName} onChange={(e) => setNewBranchName(e.target.value)} placeholder="e.g. Lagos Hub" />
                        </Field>
                        <Field label="Region / Country">
                          <Input value={newBranchRegion} onChange={(e) => setNewBranchRegion(e.target.value)} placeholder="e.g. Nigeria" />
                        </Field>
                        <Field label="Branch Manager">
                          <Input value={newBranchManager} onChange={(e) => setNewBranchManager(e.target.value)} placeholder="e.g. Elena Rostova" />
                        </Field>
                        <Button onClick={handleAddBranch} size="sm" className="w-full text-white text-xs font-bold rounded-full" style={{ backgroundColor: brandColor }}>
                          Register Office Node
                        </Button>
                      </div>
                    </Card>
                  </div>
                </div>
              )}

              {orgTab === 'evolution' && (
                <Card className="border border-card-border bg-card-bg p-6 text-center space-y-3 max-w-lg">
                  <div className="h-10 w-10 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center mx-auto">
                    <Award className="h-6 w-6" />
                  </div>
                  <h4 className="text-sm font-bold text-foreground">Evolution Trajectory: Startup Stage</h4>
                  <p className="text-xs text-foreground/50 max-w-sm mx-auto leading-relaxed">
                    HQ tracks your business complexity and scales up AI executive resource limits automatically as you set up departments and branch systems.
                  </p>
                </Card>
              )}
            </div>
          </div>
        );

      // ── TEAM & ACCESS CLEARANCE ──────────────────────────────────────
      case 'team':
        return (
          <div className="space-y-6 text-left">
            <SectionHeader
              title="Team & Access Clearance"
              desc="Manage human members, assign organizational clearings, and configure reporting charts."
              icon={<Users className="h-5 w-5" style={{ color: brandColor }} />}
            />

            {/* Sub Tabs */}
            <div className="flex gap-1 border-b border-card-border pb-1">
              {[
                { id: 'directory', label: 'Members Directory', icon: Users },
                { id: 'chart', label: 'Organizational Chart', icon: Network },
                { id: 'workspaces', label: 'Workspaces', icon: Briefcase },
                { id: 'invitations', label: 'Invitations', icon: Mail },
              ].map((tab) => {
                const Icon = tab.icon;
                const active = teamTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setTeamTab(tab.id as any)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold transition-all border-b-2 ${
                      active ? 'text-white' : 'text-foreground/50 hover:text-foreground'
                    }`}
                    style={active ? { borderColor: brandColor, color: brandColor } : { borderColor: 'transparent' }}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Sub Tab Content */}
            <div className="space-y-5">
              {teamTab === 'directory' && (
                <div className="grid gap-6 md:grid-cols-3">
                  <div className="md:col-span-2 space-y-3">
                    {teamMembers.map((m) => (
                      <Card
                        key={m.id}
                        onClick={() => setSelectedMember(m)}
                        className={`border p-4 shadow-sm cursor-pointer transition-all ${
                          selectedMember?.id === m.id ? 'border-hq-blue bg-hq-blue/[0.03]' : 'border-card-border bg-card-bg'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 bg-foreground/10 text-foreground font-black text-xs rounded-full flex items-center justify-center">
                              {m.name.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <h4 className="text-sm font-bold text-foreground">{m.name}</h4>
                              <p className="text-xs text-foreground/45">{m.email}</p>
                            </div>
                          </div>
                          <Badge variant="neutral" className="text-xs shrink-0 capitalize">{m.role.toLowerCase()}</Badge>
                        </div>
                      </Card>
                    ))}
                  </div>
                  <div>
                    {selectedMember ? (
                      <Card className="border border-card-border bg-card-bg p-5 space-y-4">
                        <h4 className="text-xs font-black text-foreground uppercase tracking-wider">Access Clearances</h4>
                        <div className="space-y-3 text-xs">
                          <div>
                            <span className="text-foreground/55 font-bold block">Clearance Level</span>
                            <select
                              value={selectedMember.role}
                              onChange={(e) => handleUpdateRole(selectedMember.id, e.target.value)}
                              className={selectCls + ' mt-1.5 h-9'}
                            >
                              <option value="ORGANIZATION_OWNER">Owner</option>
                              <option value="ADMINISTRATOR">Administrator</option>
                              <option value="MEMBER">Member</option>
                              <option value="GUEST">Guest</option>
                            </select>
                          </div>
                        </div>
                      </Card>
                    ) : (
                      <Card className="border border-dashed border-card-border bg-card-bg p-8 text-center text-xs text-foreground/40 font-medium">
                        Select a member from the directory to inspect role clearings.
                      </Card>
                    )}
                  </div>
                </div>
              )}

              {teamTab === 'chart' && (
                <Card className="border border-card-border bg-card-bg p-5 text-center">
                  <h4 className="text-sm font-bold text-foreground mb-3">Reporting Line chart</h4>
                  <div className="h-72 border border-card-border/50 bg-black/[0.02] dark:bg-white/[0.01] rounded-2xl flex items-center justify-center relative overflow-hidden">
                    <svg className="w-full h-full" viewBox="0 0 400 240">
                      <line x1="200" y1="50" x2="200" y2="130" stroke="currentColor" strokeOpacity={0.15} strokeWidth="1.5" strokeDasharray="3 3" />
                      <rect x="140" y="25" width="120" height="35" rx="6" fill="#0A0A0C" stroke={brandColor} strokeWidth={1} />
                      <text x="200" y="46" fill="#ffffff" fontSize="8" fontWeight="bold" textAnchor="middle">Elena Rostova</text>
                      <text x="200" y="55" fill={brandColor} fontSize="6.5" textAnchor="middle">C-Suite Owner</text>

                      <rect x="140" y="130" width="120" height="35" rx="6" fill="#0A0A0C" stroke="currentColor" strokeOpacity={0.2} strokeWidth={1} />
                      <text x="200" y="151" fill="#ffffff" fontSize="8" fontWeight="bold" textAnchor="middle">CFO Sophia</text>
                      <text x="200" y="160" fill="currentColor" fillOpacity={0.4} fontSize="6.5" textAnchor="middle">Finance Lead</text>
                    </svg>
                  </div>
                </Card>
              )}

              {teamTab === 'workspaces' && (
                <div className="grid gap-6 md:grid-cols-3">
                  <div className="md:col-span-2 space-y-3">
                    {workspaces.map((ws) => (
                      <Card key={ws.id} className="border border-card-border bg-card-bg p-4 space-y-2">
                        <h4 className="text-sm font-bold text-foreground">{ws.name}</h4>
                        <p className="text-xs text-foreground/45">{ws.description}</p>
                      </Card>
                    ))}
                  </div>
                  <div>
                    <Card className="border border-card-border bg-card-bg p-5 space-y-4">
                      <h4 className="text-xs font-black text-foreground uppercase tracking-wider font-bold">Add Workspace</h4>
                      <div className="space-y-3 text-xs">
                        <Field label="Workspace Name">
                          <Input value={newWsName} onChange={(e) => setNewWsName(e.target.value)} placeholder="e.g. Campaign Alpha" />
                        </Field>
                        <Field label="Description">
                          <Input value={newWsDesc} onChange={(e) => setNewWsDesc(e.target.value)} placeholder="e.g. Q3 Logistics outreach team" />
                        </Field>
                        <Button onClick={handleCreateWorkspace} size="sm" className="w-full text-white text-xs font-bold rounded-full" style={{ backgroundColor: brandColor }}>
                          Create Workspace
                        </Button>
                      </div>
                    </Card>
                  </div>
                </div>
              )}

              {teamTab === 'invitations' && (
                <div className="grid gap-6 md:grid-cols-3">
                  <div className="md:col-span-2 space-y-3">
                    {invitations.length === 0 ? (
                      <p className="text-xs text-foreground/40 italic">No pending invitations.</p>
                    ) : (
                      invitations.map((inv) => (
                        <Card key={inv.id} className="border border-card-border bg-card-bg p-4 flex items-center justify-between">
                          <div>
                            <h4 className="text-sm font-bold text-foreground">{inv.email}</h4>
                            <p className="text-xs text-foreground/45 mt-0.5">Role: {inv.role} • Expires: {inv.expiresAt}</p>
                          </div>
                          <button onClick={() => handleCancelInvitation(inv.id, inv.email)} className="text-foreground/35 hover:text-red-500 transition-colors">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </Card>
                      ))
                    )}
                  </div>
                  <div>
                    <Card className="border border-card-border bg-card-bg p-5 space-y-4">
                      <h4 className="text-xs font-black text-foreground uppercase tracking-wider">Invite Member</h4>
                      <div className="space-y-3 text-xs">
                        <Field label="Email Address">
                          <Input value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="name@company.com" />
                        </Field>
                        <Field label="Clearance Role">
                          <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value)} className={selectCls + ' h-9'}>
                            <option value="ADMINISTRATOR">Administrator</option>
                            <option value="MEMBER">Member</option>
                            <option value="GUEST">Guest</option>
                          </select>
                        </Field>
                        <Button onClick={handleSendInvitation} size="sm" className="w-full text-white text-xs font-bold rounded-full" style={{ backgroundColor: brandColor }}>
                          Send Invitation Link
                        </Button>
                      </div>
                    </Card>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      // ── BRANDING ──────────────────────────────────────────────────────
      case 'branding':
        return (
          <div className="space-y-5 text-left">
            <SectionHeader
              title="Branding"
              desc="Customize colors, logo, and visual identity across your Headquarters."
              icon={<Palette className="h-5 w-5" style={{ color: brandColor }} />}
            />
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="border border-card-border bg-card-bg p-4 shadow-[var(--card-shadow)] space-y-3">
                <p className="text-xs font-extrabold text-foreground">Primary Brand Color</p>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl border border-card-border overflow-hidden shrink-0">
                    <input type="color" value={brandColor} onChange={(e) => setBrandColor(e.target.value)} className="h-full w-full cursor-pointer border-0 p-0" />
                  </div>
                  <div>
                    <p className="text-xs font-extrabold" style={{ color: brandColor }}>{brandColor.toUpperCase()}</p>
                    <p className="text-xs text-foreground/50 font-semibold">Click swatch to change</p>
                  </div>
                </div>
              </Card>
              <Card className="border border-card-border bg-card-bg p-4 shadow-[var(--card-shadow)] space-y-3">
                <p className="text-xs font-extrabold text-foreground">Organization Logo</p>
                <div className="h-20 border-2 border-dashed border-card-border rounded-xl flex items-center justify-center cursor-pointer hover:border-hq-blue/50 transition-colors">
                  <p className="text-xs text-foreground/40 font-semibold">Click or drag to upload logo</p>
                </div>
              </Card>
            </div>
          </div>
        );

      // ── SECURITY ──────────────────────────────────────────────────────
      case 'security':
        return (
          <div className="space-y-5 text-left">
            <SectionHeader
              title="Security Settings"
              desc="Manage authentication rules, session configurations, and access logs."
              icon={<Shield className="h-5 w-5" style={{ color: brandColor }} />}
            />
            <div className="grid gap-4 md:grid-cols-3">
              {[
                { label: 'MFA Status', value: 'Enabled', color: '#22C55E' },
                { label: 'Active Sessions', value: '1', color: brandColor },
                { label: 'Login Failures (24h)', value: '0', color: '#0EA5E9' },
              ].map((stat, i) => (
                <Card key={i} className="border border-card-border bg-card-bg p-4 shadow-[var(--card-shadow)] text-left">
                  <p className="text-xs text-foreground/45 font-bold uppercase tracking-widest">{stat.label}</p>
                  <p className="text-2xl font-extrabold mt-1" style={{ color: stat.color }}>{stat.value}</p>
                </Card>
              ))}
            </div>
          </div>
        );

      // ── NOTIFICATIONS ─────────────────────────────────────────────────
      case 'notifications':
        return (
          <div className="space-y-5 text-left">
            <SectionHeader
              title="Notifications"
              desc="Select routing triggers for emails, browser notifications, and push alerts."
              icon={<Bell className="h-5 w-5" style={{ color: brandColor }} />}
            />
            <Card className="border border-card-border bg-card-bg p-5 shadow-[var(--card-shadow)] space-y-4">
              <p className="text-xs font-extrabold text-foreground">Notification Channels</p>
              {[
                { label: 'Email Notifications', desc: 'Receive critical alerts and briefing digests', key: 'notifyEmail' },
                { label: 'Browser Notifications', desc: 'Live workspace notifications on active sessions', key: 'notifyBrowser' },
                { label: 'Push Notifications', desc: 'Direct dashboard notifications on mobile', key: 'notifyPush' },
              ].map((c, i) => (
                <div key={i} className="flex items-start justify-between gap-4 py-2 border-b border-card-border last:border-0">
                  <div className="text-left">
                    <p className="text-xs font-extrabold text-foreground">{c.label}</p>
                    <p className="text-xs text-foreground/50 font-semibold mt-0.5">{c.desc}</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={(settings as any)[c.key]}
                    onChange={(e) => setSettings((p) => ({ ...p, [c.key]: e.target.checked }))}
                    className="h-4 w-4 rounded border-card-border focus:ring-hq-blue shrink-0 cursor-pointer"
                  />
                </div>
              ))}
            </Card>
          </div>
        );

      // ── BILLING ───────────────────────────────────────────────────────
      case 'billing':
        return (
          <div className="space-y-5 text-left">
            <SectionHeader
              title="Billing & Subscriptions"
              desc="Manage subscription plans, billing histories, and credit allocations."
              icon={<CreditCard className="h-5 w-5" style={{ color: brandColor }} />}
            />
            <Card className="border border-card-border bg-card-bg p-5 shadow-[var(--card-shadow)] space-y-3">
              <h4 className="text-sm font-extrabold text-foreground">Active Subscription Plan</h4>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <Badge variant="ai" className="text-sm">HQ Free Tier</Badge>
                  <p className="text-xs text-foreground/45 mt-1">Limited to 1 active concurrent strategic mission WBS.</p>
                </div>
                <Button size="sm" className="text-white text-xs font-bold rounded-full" style={{ backgroundColor: brandColor }}>
                  Upgrade Plan
                </Button>
              </div>
            </Card>
          </div>
        );

      // ── AI EXECUTIVES ─────────────────────────────────────────────────
      case 'executives':
        return (
          <div className="space-y-5 text-left">
            <SectionHeader
              title="AI Executive Directory"
              desc="Audit active configurations and personality structures for C-Suite AI partners."
              icon={<Bot className="h-5 w-5" style={{ color: brandColor }} />}
            />
            <Card className="border border-card-border bg-card-bg p-5 shadow-[var(--card-shadow)] text-center text-xs text-foreground/40 py-12">
              <Bot className="h-8 w-8 text-foreground/20 mx-auto mb-2" />
              <span>Configure AI personality parameters on the Executive Registry.</span>
            </Card>
          </div>
        );

      // ── INTEGRATIONS ──────────────────────────────────────────────────
      case 'integrations':
        return (
          <div className="space-y-5 text-left">
            <SectionHeader
              title="Integration Catalog"
              desc="Securely connect third-party platforms to synchronize digital assets and notifications."
              icon={<Plug2 className="h-5 w-5" style={{ color: brandColor }} />}
            />
            <div className="grid gap-4 sm:grid-cols-2 text-left">
              {INTEGRATIONS.map((app) => (
                <Card key={app.id} className="border border-card-border bg-card-bg p-4 flex justify-between items-start gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{app.logo}</span>
                      <h4 className="text-xs font-black text-foreground">{app.name}</h4>
                    </div>
                    <p className="text-xs text-foreground/45 mt-1">{app.desc}</p>
                  </div>
                  <Button variant="outline" size="sm" className="h-8 rounded-full border-card-border">Connect</Button>
                </Card>
              ))}
            </div>
          </div>
        );

      // ── STORAGE ───────────────────────────────────────────────────────
      case 'storage':
        return (
          <div className="space-y-5 text-left">
            <SectionHeader
              title="Storage Analytics"
              desc="Audit secure file storage quotas and vector indexes constraints."
              icon={<Database className="h-5 w-5" style={{ color: brandColor }} />}
            />
            <Card className="border border-card-border bg-card-bg p-5 shadow-[var(--card-shadow)] space-y-2">
              <div className="flex justify-between text-xs font-bold text-foreground/50">
                <span>Storage utilization</span>
                <span>0 MB / 1,024 MB (0%)</span>
              </div>
              <div className="h-2 w-full bg-[#F9F9FB] dark:bg-[#0A0A0C] rounded-full overflow-hidden">
                <div className="h-full bg-hq-blue rounded-full transition-all" style={{ width: '0%' }}></div>
              </div>
            </Card>
          </div>
        );

      // ── API KEYS & DEVELOPERS ─────────────────────────────────────────
      case 'api':
        return (
          <div className="space-y-5 text-left">
            <SectionHeader
              title="API & Developer Options"
              desc="Generate secure API keys to integrate custom workflows with HQ."
              icon={<Code2 className="h-5 w-5" style={{ color: brandColor }} />}
            />
            <div className="space-y-4">
              <Card className="border border-card-border bg-card-bg p-5 shadow-[var(--card-shadow)] space-y-4">
                <h4 className="text-xs font-black text-foreground uppercase tracking-wider">Generate API Key</h4>
                <div className="flex gap-2.5">
                  <Input value={newKeyName} onChange={(e) => setNewKeyName(e.target.value)} placeholder="Key description label..." className="text-xs flex-1 h-9 rounded-full px-3" />
                  <Button onClick={handleCreateKey} size="sm" className="text-white text-xs font-bold rounded-full shrink-0" style={{ backgroundColor: brandColor }}>
                    Create Key
                  </Button>
                </div>
                {newKeyVisible && newKeyResult && (
                  <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-xl space-y-1.5 text-xs text-green-600 dark:text-green-400">
                    <p className="font-bold">Key generated! Copy it now (will not be shown again):</p>
                    <div className="flex items-center gap-2 font-mono bg-black/5 dark:bg-black/40 p-2 rounded-lg">
                      <span className="flex-1 select-all break-all">{newKeyResult}</span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(newKeyResult);
                          toast.success('Key copied to clipboard');
                        }}
                        className="text-foreground/50 hover:text-foreground"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </Card>

              {apiKeys.length > 0 && (
                <Card className="border border-card-border bg-card-bg p-5 shadow-[var(--card-shadow)] space-y-3">
                  <h4 className="text-xs font-black text-foreground uppercase tracking-wider">Active API Keys</h4>
                  <div className="space-y-2.5">
                    {apiKeys.map((k) => (
                      <div key={k.id} className="flex justify-between items-center text-xs py-2 border-b border-card-border/60 last:border-0">
                        <div>
                          <p className="font-bold text-foreground">{k.name}</p>
                          <p className="font-mono text-foreground/45 mt-0.5">Prefix: {k.keyPrefix}...</p>
                        </div>
                        <button onClick={() => handleDeleteKey(k.id)} className="text-foreground/35 hover:text-red-500 transition-colors">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          </div>
        );

      // ── AUDIT LOGS ────────────────────────────────────────────────────
      case 'audit':
        return (
          <div className="space-y-5 text-left">
            <SectionHeader
              title="Audit Logs"
              desc="View security activities and compliance logs recorded across your workspace."
              icon={<FileText className="h-5 w-5" style={{ color: brandColor }} />}
            />
            <Card className="border border-card-border bg-card-bg p-5 shadow-[var(--card-shadow)] space-y-3">
              <h4 className="text-xs font-black text-foreground uppercase tracking-wider">Activity Ledger</h4>
              <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                {auditLogs.length === 0 ? (
                  <p className="text-xs text-foreground/40 italic">No logs recorded yet.</p>
                ) : (
                  auditLogs.map((log) => (
                    <div key={log.id} className="text-xs py-2 border-b border-card-border/50 last:border-0 flex justify-between items-start">
                      <div>
                        <p className="font-bold text-foreground">{log.eventType}</p>
                        <p className="text-foreground/45 text-[11px] mt-0.5">Actor: {log.actor?.email || 'System'}</p>
                      </div>
                      <span className="text-[10px] text-foreground/35 font-mono">{new Date(log.createdAt).toLocaleTimeString()}</span>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>
        );

      default:
        return <EmptyState text="Select a settings section from the sidebar navigation map." />;
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-8 select-none text-foreground pb-12">
      {/* ─── Left sidebar nav ─────────────────────────────────────────── */}
      <aside className="w-52 shrink-0 space-y-1 text-left">
        <p className="text-[10px] font-black text-foreground/30 uppercase tracking-widest px-2 pb-1.5">Essential</p>
        {ESSENTIAL_SECTIONS.map((s) => {
          const Icon = s.icon;
          const active = activeSection === s.id;
          return (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-full text-left text-xs font-black transition-all ${
                active ? 'text-white shadow-sm' : 'text-foreground/50 hover:text-foreground hover:bg-foreground/5'
              }`}
              style={
                active
                  ? {
                      backgroundColor: brandColor,
                      boxShadow: `0 2px 10px ${brandColor}40`,
                    }
                  : {}
              }
            >
              <Icon className="h-3.5 w-3.5 shrink-0" />
              {s.label}
            </button>
          );
        })}

        <p className="text-[10px] font-black text-foreground/30 uppercase tracking-widest px-2 pb-1.5 pt-5">Advanced</p>
        {ADVANCED_SECTIONS.map((s) => {
          const Icon = s.icon;
          const active = activeSection === s.id;
          return (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-full text-left text-xs font-black transition-all ${
                active ? 'text-white shadow-sm' : 'text-foreground/50 hover:text-foreground hover:bg-foreground/5'
              }`}
              style={
                active
                  ? {
                      backgroundColor: brandColor,
                      boxShadow: `0 2px 10px ${brandColor}40`,
                    }
                  : {}
              }
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
            <div className="h-8 w-8 rounded-full border-2 border-hq-blue border-t-transparent animate-spin" />
            <p className="text-xs text-foreground/45 font-semibold">Loading settings registry...</p>
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
      <div className="mt-0.5 shrink-0">{icon}</div>
      <div>
        <h2 className="text-base font-black text-foreground tracking-tight leading-none">{title}</h2>
        <p className="text-xs text-foreground/45 font-semibold mt-1.5 leading-normal">{desc}</p>
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
    <div className="flex items-center justify-between pt-4 border-t border-card-border mt-2">
      <p className="text-xs text-green-500 font-extrabold h-4">{savedMsg}</p>
      <Button
        onClick={onSave}
        disabled={saving}
        size="sm"
        className="text-white font-black text-xs h-8.5 rounded-full px-4"
        style={{ backgroundColor: brandColor }}
      >
        <Save className="h-3.5 w-3.5 mr-1.5" />
        {saving ? 'Saving...' : 'Save Changes'}
      </Button>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="py-10 flex flex-col items-center justify-center space-y-2">
      <p className="text-sm text-foreground/40 font-semibold text-center max-w-xs">{text}</p>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1 text-left">
      <label className="text-xs font-black text-foreground/65 block">{label}</label>
      {children}
      {hint && <p className="text-[10.5px] text-foreground/35 font-semibold mt-0.5 leading-tight">{hint}</p>}
    </div>
  );
}
