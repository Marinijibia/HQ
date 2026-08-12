'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Button, Badge, Input } from '@hq/ui';
import {
  Lock,
  ShieldCheck,
  ShieldAlert,
  Save,
  CheckCircle,
  Cpu,
  Key,
  XCircle,
  Activity,
  Sliders,
  Pause,
  Play,
  RotateCcw,
  Check,
  AlertTriangle,
  History,
  Info,
  Users,
  Search,
  Plus,
  Calendar,
  Layers,
  ArrowRight,
  TrendingUp,
  Brain,
  KeyRound,
  Eye,
  EyeOff,
  Copy,
  CheckCircle2,
  Terminal,
} from 'lucide-react';
import { useAuth } from '../../../contexts/auth-context';
import { toast } from '../../../components/toast';

interface SecurityAlert {
  id: string;
  event: string;
  actor: string;
  ip: string;
  timestamp: string;
  severity: 'Low' | 'Medium' | 'High';
}

interface ActiveSession {
  id: string;
  identity: string;
  type: 'Human' | 'AI Executive' | 'Service';
  device: string;
  ip: string;
  location: string;
  lastActive: string;
}

interface SecretItem {
  id: string;
  name: string;
  prefix: string;
  type: string;
  rotatedAt: string;
  active: boolean;
}

export default function TrustCenterPage() {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = React.useState<'overview' | 'sso' | 'sessions' | 'secrets'>('overview');
  const [brandColor, setBrandColor] = React.useState('#0A84FF');

  // Overview / General State
  const [securityScore, setSecurityScore] = React.useState(98);
  const [mfaConfig, setMfaConfig] = React.useState<'required' | 'admin-only' | 'optional'>('required');
  const [scimEnabled, setScimEnabled] = React.useState(true);

  // Security Incident Alerts
  const [alerts, setAlerts] = React.useState<SecurityAlert[]>([
    { id: 'al-1', event: 'Privileged audit log export', actor: 'Teema (Ops Director)', ip: '197.210.64.12', timestamp: '10 mins ago', severity: 'Low' },
    { id: 'al-2', event: 'New device authentication handshake', actor: 'Asad (CEO)', ip: '102.89.34.88', timestamp: '1 hour ago', severity: 'Medium' },
    { id: 'al-3', event: 'Automatic secrets rotation completed', actor: 'Secrets Service', ip: 'localhost', timestamp: '3 hours ago', severity: 'Low' },
  ]);

  // Active Sessions
  const [sessions, setSessions] = React.useState<ActiveSession[]>([
    { id: 'sess-1', identity: 'Asad (CEO)', type: 'Human', device: 'macOS · Chrome 126', ip: '102.89.34.88', location: 'Lagos, Nigeria', lastActive: 'Just now' },
    { id: 'sess-2', identity: 'Teema (Ops Director)', type: 'AI Executive', device: 'HQ Sandbox Container v4', ip: '10.0.4.12', location: 'Cloud Node EU-West', lastActive: '3 mins ago' },
    { id: 'sess-3', identity: 'Legal (Compliance Director)', type: 'AI Executive', device: 'HQ Guardrail Validator', ip: '82.44.12.90', location: 'Cloud Node US-East', lastActive: '12 mins ago' },
    { id: 'sess-4', identity: 'GitHub Connector', type: 'Service', device: 'Webhook Receiver Gateway', ip: '140.82.115.4', location: 'GitHub IP Range', lastActive: 'Just now' },
  ]);

  // Secrets Vault
  const [secrets, setSecrets] = React.useState<SecretItem[]>([
    { id: 'sec-1', name: 'Primary Stripe webhook signing key', prefix: 'whsec_e582...', type: 'OAuth Signing', rotatedAt: '2026-07-01', active: true },
    { id: 'sec-2', name: 'OpenAI Gemini routing gateway key', prefix: 'sk-proj-4a91...', type: 'API Key', rotatedAt: '2026-07-12', active: true },
    { id: 'sec-3', name: 'Slack Bot token key credentials', prefix: 'xoxb-9420...', type: 'Bot Token', rotatedAt: '2026-06-28', active: true },
  ]);

  // Sandbox access boundaries toggles
  const [redactSensitiveData, setRedactSensitiveData] = React.useState(true);
  const [blockShellCommands, setBlockShellCommands] = React.useState(true);

  React.useEffect(() => {
    try {
      const draft = JSON.parse(localStorage.getItem('hq_onboarding_draft') || '{}');
      if (draft.brandColor) setBrandColor(draft.brandColor);
    } catch { /* ignore */ }
  }, []);

  const handleTerminateSession = (id: string, name: string) => {
    setSessions(prev => prev.filter(s => s.id !== id));
    toast.error(`🔒 Session terminated for: ${name}`);
  };

  const handleRotateSecret = (id: string, name: string) => {
    setSecrets(prev => prev.map(s => s.id === id ? { ...s, rotatedAt: new Date().toISOString().split('T')[0] } : s));
    toast.success(`🔄 Secret key rotated successfully: ${name}`);
  };

  const handleSaveMfa = (val: typeof mfaConfig) => {
    setMfaConfig(val);
    toast.success('🔒 Global Multi-Factor Authentication policy updated');
  };

  return (
    <div className="space-y-8 select-none text-foreground pb-12">
      {/* Title */}
      <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0 border-b border-card-border pb-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#1A1A1E] dark:text-white flex items-center gap-2">
            <Lock className="h-8 w-8 text-hq-blue" />
            Trust Center
          </h1>
          <p className="text-foreground/60 text-sm mt-1">
            Zero Trust security administration center. Audit active user sessions, configure SAML SSO connectors, and manage secrets rotation.
          </p>
        </div>
        <Badge variant="success" className="py-1 px-3 text-xs font-black uppercase">
          🛡️ Zero Trust Enforced
        </Badge>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 border-b border-card-border">
        {[
          { id: 'overview', label: 'Security Posture', icon: Activity },
          { id: 'sso', label: 'SSO & Provisioning', icon: Users },
          { id: 'sessions', label: 'Active Sessions', icon: Terminal },
          { id: 'secrets', label: 'Secrets & Sandbox', icon: Key },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold border-b-2 transition-all ${
                activeTab === tab.id
                  ? 'border-current text-hq-blue font-extrabold'
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

      {/* Tab Panels */}
      <div className="space-y-6">

        {/* Tab 1: Security Posture Overview */}
        {activeTab === 'overview' && (
          <div className="grid gap-6 md:grid-cols-3 text-left">
            <div className="md:col-span-2 space-y-6">
              {/* Posture Score */}
              <Card className="border border-card-border bg-card-bg p-5 shadow-[var(--card-shadow)] flex items-center justify-between gap-4">
                <div>
                  <span className="text-xs text-foreground/45 font-bold uppercase tracking-widest block">Tenant Security Posture</span>
                  <span className="text-3xl font-black text-white mt-1 block">{securityScore}% score</span>
                  <p className="text-[10.5px] text-foreground/50 font-semibold mt-1">Tenant isolation bounds validated. Zero Trust architecture fully active.</p>
                </div>
                <div className="h-16 w-16 rounded-full border-4 border-hq-cyan flex items-center justify-center font-black text-xs text-hq-cyan shrink-0">
                  Secure
                </div>
              </Card>

              {/* Security incident alerts feed */}
              <Card className="border border-card-border bg-card-bg p-5 shadow-[var(--card-shadow)] space-y-4">
                <CardTitle className="text-sm font-extrabold text-[#1A1A1E] dark:text-white flex items-center gap-2">
                  <ShieldAlert className="h-4.5 w-4.5 text-hq-cyan" />
                  Recent Security Events Log
                </CardTitle>

                <div className="space-y-3">
                  {alerts.map(al => (
                    <div key={al.id} className="p-3 rounded-lg border border-card-border bg-[#F9F9FB] dark:bg-[#0A0A0C]/20 text-xs flex items-center justify-between gap-4">
                      <div>
                        <span className="font-extrabold text-white block">{al.event}</span>
                        <span className="text-[9.5px] text-foreground/45 font-semibold mt-0.5">Actor: {al.actor} · IP: {al.ip}</span>
                      </div>
                      <div className="flex gap-2.5 shrink-0 self-center items-center">
                        <span className="text-xs text-foreground/40 font-bold">{al.timestamp}</span>
                        <Badge variant={al.severity === 'High' ? 'error' : 'neutral'} className="text-[7.5px] font-bold uppercase">
                          {al.severity}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Tenant isolation diagram */}
            <div className="space-y-6">
              <Card className="border border-card-border bg-card-bg p-5 shadow-[var(--card-shadow)] space-y-4">
                <h4 className="text-xs font-black text-[#1A1A1E] dark:text-white uppercase tracking-widest flex items-center gap-1.5">
                  <Layers className="h-4 w-4 text-hq-purple" />
                  Strict Tenant Isolation
                </h4>
                <p className="text-xs text-foreground/50 leading-relaxed font-semibold">
                  Each HQ tenant workspace runs inside isolated processes. All databases, memory graphs, and RAG knowledge vectors are segregated at rest and in transit.
                </p>

                <div className="border-t border-card-border pt-3 space-y-2 text-xs font-bold">
                  <div className="flex justify-between">
                    <span className="text-foreground/40">Data Isolation</span>
                    <span className="text-green-500">100% segregated</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground/40">Model Sandbox</span>
                    <span className="text-white">API Gateway Proxy</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* Tab 2: SSO & Directory Sync */}
        {activeTab === 'sso' && (
          <div className="grid gap-6 md:grid-cols-3 text-left">
            <div className="md:col-span-2 space-y-6">
              {/* Identity Providers List */}
              <Card className="border border-card-border bg-card-bg p-5 shadow-[var(--card-shadow)] space-y-4">
                <div>
                  <h3 className="text-sm font-extrabold text-[#1A1A1E] dark:text-white">Enterprise Identity Providers (SSO)</h3>
                  <p className="text-xs text-foreground/50 font-semibold mt-0.5">Link SAML 2.0 or OIDC directories to authorize human members.</p>
                </div>

                <div className="space-y-3">
                  {[
                    { id: 'okta', name: 'Okta Enterprise Directory', desc: 'SAML 2.0 User authorization sync', logo: '🌐', connected: true },
                    { id: 'azure', name: 'Microsoft Entra ID', desc: 'Azure AD OpenID Connect OAuth sync', logo: '☁️', connected: false },
                    { id: 'gsuite', name: 'Google Workspace Single Sign-On', desc: 'GSuite organization users sync', logo: '🔍', connected: false },
                  ].map(idp => (
                    <div key={idp.id} className="p-3 rounded-lg border border-card-border bg-[#F9F9FB] dark:bg-[#0A0A0C]/20 text-xs flex justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 bg-card-bg border border-card-border rounded-lg flex items-center justify-center text-lg">{idp.logo}</div>
                        <div>
                          <span className="font-extrabold text-white block">{idp.name}</span>
                          <span className="text-[9.5px] text-foreground/50 font-semibold mt-0.5">{idp.desc}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => toast.success(`${idp.name} SSO configuration toggled`)}
                        className={`text-[9.5px] px-2.5 py-1 rounded font-black uppercase transition-all self-center ${
                          idp.connected
                            ? 'bg-hq-cyan/20 text-hq-cyan border border-hq-cyan/30'
                            : 'bg-card-bg border border-card-border text-foreground/40 hover:bg-foreground/5'
                        }`}
                      >
                        {idp.connected ? 'Connected' : 'Connect'}
                      </button>
                    </div>
                  ))}
                </div>
              </Card>

              {/* SCIM Sync */}
              <Card className="border border-card-border bg-card-bg p-5 shadow-[var(--card-shadow)] flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="text-xs font-black text-white">Automated Provisioning (SCIM)</h4>
                  <p className="text-xs text-foreground/50 leading-relaxed font-semibold">
                    Automatically synchronize human directory deactivations, departments, and role transfers.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setScimEnabled(!scimEnabled);
                    toast.success(`SCIM user provisioning ${!scimEnabled ? 'activated' : 'deactivated'}`);
                  }}
                  className={`text-[9.5px] px-2.5 py-1 rounded font-black uppercase transition-all shrink-0 ${
                    scimEnabled
                      ? 'bg-green-500/15 text-green-500 border border-green-500/20'
                      : 'bg-[#F9F9FB] dark:bg-[#0A0A0C] border border-card-border text-foreground/45'
                  }`}
                >
                  {scimEnabled ? 'Active' : 'Muted'}
                </button>
              </Card>
            </div>

            {/* MFA rules */}
            <div className="space-y-6">
              <Card className="border border-card-border bg-card-bg p-5 shadow-[var(--card-shadow)] space-y-4">
                <div>
                  <h4 className="text-xs font-black text-[#1A1A1E] dark:text-white uppercase tracking-widest">MFA Policy Enforcement</h4>
                  <p className="text-[9.5px] text-foreground/45 mt-0.5 font-semibold">Define Multi-Factor Authentication ceilings</p>
                </div>

                <div className="space-y-2">
                  {[
                    { id: 'required', label: 'Require for all users' },
                    { id: 'admin-only', label: 'Require for administrators' },
                    { id: 'optional', label: 'Optional' },
                  ].map(rule => (
                    <button
                      key={rule.id}
                      onClick={() => handleSaveMfa(rule.id as any)}
                      className={`w-full p-2.5 rounded-lg border text-left transition-all text-xs font-bold ${
                        mfaConfig === rule.id ? 'border-hq-cyan bg-hq-cyan/5 text-hq-cyan' : 'border-card-border bg-card-bg text-foreground/60'
                      }`}
                    >
                      {rule.label}
                    </button>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* Tab 3: Active Sessions Directory */}
        {activeTab === 'sessions' && (
          <div className="text-left space-y-4">
            <div className="flex items-center justify-between border-b border-card-border pb-2">
              <div>
                <h3 className="text-sm font-extrabold text-[#1A1A1E] dark:text-white">Active Human & AI Sessions</h3>
                <p className="text-xs text-foreground/50 font-semibold mt-0.5">Inspect active device locations and AI container identifiers.</p>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="text-[9.5px] border-red-500/30 text-red-500 hover:bg-red-500/10 h-7.5"
                onClick={() => {
                  setSessions([sessions[0]]); // Revoke other sessions
                  toast.error('🚨 Terminated all other active sessions');
                }}
              >
                Terminate All Others
              </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {sessions.map(sess => (
                <Card key={sess.id} className="border border-card-border bg-card-bg p-4 shadow-[var(--card-shadow)] flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-baseline gap-2">
                      <h4 className="text-xs font-black text-white">{sess.identity}</h4>
                      <Badge variant={sess.type === 'AI Executive' ? 'ai' : 'neutral'} className="text-[7.5px] font-bold uppercase shrink-0">
                        {sess.type}
                      </Badge>
                    </div>

                    <div className="text-[9.5px] space-y-1 text-foreground/50 font-semibold leading-relaxed">
                      <p>Device: <span className="text-white">{sess.device}</span></p>
                      <p>IP: <span className="text-white">{sess.ip}</span></p>
                      <p>Location: <span className="text-white">{sess.location}</span></p>
                    </div>
                  </div>

                  <div className="border-t border-card-border pt-3 flex items-center justify-between text-[9.5px] font-bold text-foreground/50">
                    <span>Last active: <span className="text-[#0EA5E9]">{sess.lastActive}</span></span>
                    <button
                      onClick={() => handleTerminateSession(sess.id, sess.identity)}
                      className="text-red-500 hover:text-red-600 uppercase text-[8.5px] tracking-wider"
                    >
                      Kill Session
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Secrets Vault & AI Sandbox */}
        {activeTab === 'secrets' && (
          <div className="grid gap-6 md:grid-cols-3 text-left">
            <div className="md:col-span-2 space-y-6">
              {/* Secrets vault list */}
              <Card className="border border-card-border bg-card-bg p-5 shadow-[var(--card-shadow)] space-y-4">
                <div>
                  <h3 className="text-sm font-extrabold text-[#1A1A1E] dark:text-white">Tenant Secrets Vault</h3>
                  <p className="text-xs text-foreground/50 font-semibold mt-0.5">Manage encrypted third-party credentials and oauth tokens.</p>
                </div>

                <div className="space-y-3">
                  {secrets.map(sec => (
                    <div key={sec.id} className="p-3 rounded-lg border border-card-border bg-[#F9F9FB] dark:bg-[#0A0A0C]/20 text-xs flex justify-between gap-4">
                      <div>
                        <span className="font-extrabold text-white block">{sec.name}</span>
                        <span className="text-[9.5px] text-foreground/45 font-semibold mt-0.5 block">{sec.type} · Prefix: <code className="text-hq-cyan font-mono">{sec.prefix}</code></span>
                        <span className="text-[8.5px] text-foreground/40 font-semibold block mt-1">Rotated: {sec.rotatedAt}</span>
                      </div>

                      <div className="flex gap-2.5 shrink-0 self-center">
                        <button
                          onClick={() => handleRotateSecret(sec.id, sec.name)}
                          className="text-hq-cyan hover:text-hq-cyan-hover font-extrabold text-[10.5px]"
                        >
                          Rotate
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* AI Sandbox boundaries */}
              <Card className="border border-card-border bg-card-bg p-5 shadow-[var(--card-shadow)] space-y-4">
                <div>
                  <h3 className="text-sm font-extrabold text-[#1A1A1E] dark:text-white">AI Sandbox Boundaries</h3>
                  <p className="text-xs text-foreground/50 font-semibold mt-0.5">Enforce strict sandboxing constraints on AI Executive processes.</p>
                </div>

                <div className="space-y-3">
                  {[
                    { label: 'Redact PII & Sensitive Client Data', desc: 'Redacts social codes, emails, and tokens from model prompts', value: redactSensitiveData, setter: setRedactSensitiveData },
                    { label: 'Block System Shell execution', desc: 'Blocks AI from running arbitrary bash or shell cmd tools', value: blockShellCommands, setter: setBlockShellCommands },
                  ].map((rule, idx) => (
                    <div key={idx} className="p-3 rounded-lg border border-card-border bg-[#F9F9FB] dark:bg-[#0A0A0C]/10 flex justify-between gap-4 items-center">
                      <div>
                        <span className="font-extrabold text-white text-xs block">{rule.label}</span>
                        <span className="text-[9.5px] text-foreground/45 font-semibold leading-relaxed mt-0.5 block">{rule.desc}</span>
                      </div>
                      <button
                        onClick={() => {
                          rule.setter(!rule.value);
                          toast.success(`Sandbox safety guard toggled: ${rule.label}`);
                        }}
                        className={`text-[9.5px] px-2.5 py-1 rounded font-black uppercase transition-all shrink-0 ${
                          rule.value
                            ? 'bg-green-500/15 text-green-500 border border-green-500/20'
                            : 'bg-card-bg border border-card-border text-foreground/40 hover:bg-foreground/5'
                        }`}
                      >
                        {rule.value ? 'Enforced' : 'Off'}
                      </button>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
