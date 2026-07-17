'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Button, Badge, Input } from '@hq/ui';
import {
  Palette,
  CheckCircle,
  Globe,
  Sliders,
  Users,
  Search,
  Plus,
  Play,
  RotateCw,
  ShieldCheck,
  Building,
  Save,
  Check,
  ChevronRight,
  HardDrive,
  MessageSquare,
  AlertTriangle,
  RefreshCw,
  FolderOpen,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../../contexts/auth-context';
import { toast } from '../../../components/toast';

interface ClientTenant {
  id: string;
  name: string;
  plan: string;
  status: 'Active' | 'Suspended';
  usersCount: number;
  domain: string;
}

interface DomainConfig {
  id: string;
  domain: string;
  sslStatus: 'Provisioned' | 'Pending' | 'Error';
  dnsVerified: boolean;
}

export default function WhiteLabelPage() {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = React.useState<'branding' | 'terminology' | 'domain' | 'partner'>('branding');

  // Branding Studio State
  const [companyName, setCompanyName] = React.useState('Acme Corporation');
  const [hqName, setHqName] = React.useState('Acme Headquarters');
  const [brandColor, setBrandColor] = React.useState('#0A84FF');
  const [secondaryColor, setSecondaryColor] = React.useState('#8B5CF6');

  // Terminology State
  const [termMission, setTermMission] = React.useState('Mission');
  const [termBoardroom, setTermBoardroom] = React.useState('Boardroom');

  // Feature Toggles State
  const [featureMarketplace, setFeatureMarketplace] = React.useState(true);
  const [featureKnowledge, setFeatureKnowledge] = React.useState(true);
  const [featureIntegrations, setFeatureIntegrations] = React.useState(true);

  // Domain Management State
  const [domains, setDomains] = React.useState<DomainConfig[]>([
    { id: 'dom-1', domain: 'hq.acme.com', sslStatus: 'Provisioned', dnsVerified: true },
    { id: 'dom-2', domain: 'board.acme.com', sslStatus: 'Pending', dnsVerified: false },
  ]);
  const [newDomainName, setNewDomainName] = React.useState('');

  // Reseller Partner Portal State
  const [clients, setClients] = React.useState<ClientTenant[]>([
    { id: 'ten-1', name: 'Chevron Corridors', plan: 'Enterprise Scale', status: 'Active', usersCount: 42, domain: 'chevron.hq.corp' },
    { id: 'ten-2', name: 'Apex Petroleum', plan: 'Starter Pack', status: 'Active', usersCount: 8, domain: 'apex.hq.corp' },
  ]);
  const [newClientName, setNewClientName] = React.useState('');
  const [newClientDomain, setNewClientDomain] = React.useState('');
  const [newClientPlan, setNewClientPlan] = React.useState('Starter Pack');

  React.useEffect(() => {
    try {
      const draft = JSON.parse(localStorage.getItem('hq_onboarding_draft') || '{}');
      if (draft.brandColor) setBrandColor(draft.brandColor);
    } catch { /* ignore */ }
  }, []);

  const handleSaveBranding = () => {
    const draft = { ownerName: companyName, brandColor };
    localStorage.setItem('hq_onboarding_draft', JSON.stringify(draft));
    toast.success('🎨 Brand configurations and custom typography updated globally');
  };

  const handleCreateDomain = () => {
    if (!newDomainName.trim()) return;
    const newDom: DomainConfig = {
      id: `dom-${Date.now()}`,
      domain: newDomainName,
      sslStatus: 'Pending',
      dnsVerified: false,
    };
    setDomains(prev => [...prev, newDom]);
    setNewDomainName('');
    toast.success(`🌐 Custom domain "${newDom.domain}" registered for validation`);
  };

  const handleVerifyDNS = (id: string, domain: string) => {
    setDomains(prev => prev.map(d => d.id === id ? { ...d, dnsVerified: true, sslStatus: 'Provisioned' } : d));
    toast.success(`🟢 DNS records and SSL Certificate provisioned for: ${domain}`);
  };

  const handleCreateClient = () => {
    if (!newClientName.trim()) return;
    const newCli: ClientTenant = {
      id: `ten-${Date.now()}`,
      name: newClientName,
      plan: newClientPlan,
      status: 'Active',
      usersCount: 1,
      domain: newClientDomain,
    };
    setClients(prev => [...prev, newCli]);
    setNewClientName('');
    setNewClientDomain('');
    toast.success(`🚀 Branded client tenant environment "${newCli.name}" initialized`);
  };

  return (
    <div className="space-y-8 select-none text-foreground pb-12">
      {/* Title */}
      <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0 border-b border-card-border pb-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#1A1A1E] dark:text-white flex items-center gap-2">
            <Palette className="h-8 w-8 text-rose-500" />
            White-labeling & Multi-Tenancy
          </h1>
          <p className="text-foreground/60 text-sm mt-1">
            Visual branding studio. Enforce custom organization domains, customize terminology nomenclature, and manage client reseller tenants.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 border-b border-card-border">
        {[
          { id: 'branding', label: 'Branding Studio', icon: Palette },
          { id: 'terminology', label: 'Custom Terminology & Features', icon: Sliders },
          { id: 'domain', label: 'Domain & SSL', icon: Globe },
          { id: 'partner', label: 'Partner Reseller Portal', icon: Users },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'border-current text-white font-extrabold'
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

        {/* Tab 1: Branding Studio with Live Preview */}
        {activeTab === 'branding' && (
          <div className="grid gap-6 md:grid-cols-3 text-left">
            <div className="md:col-span-2 space-y-6">
              {/* Studio Editors */}
              <Card className="border border-card-border bg-card-bg p-5 shadow-level-2 space-y-4">
                <CardTitle className="text-sm font-extrabold text-[#1A1A1E] dark:text-white">Visual Style Configurer</CardTitle>

                <div className="grid gap-4 sm:grid-cols-2 text-xs font-semibold">
                  <div className="space-y-1.5">
                    <label className="text-foreground/75">Company Name</label>
                    <Input value={companyName} onChange={e => setCompanyName(e.target.value)} />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-foreground/75">Headquarters Custom Title</label>
                    <Input value={hqName} onChange={e => setHqName(e.target.value)} />
                  </div>

                  <div className="space-y-2">
                    <label className="text-foreground/75">Primary Brand Color</label>
                    <div className="flex items-center gap-2">
                      <input type="color" value={brandColor} onChange={e => setBrandColor(e.target.value)} className="h-9 w-10 cursor-pointer border rounded-lg bg-transparent" />
                      <Input value={brandColor} onChange={e => setBrandColor(e.target.value)} className="font-mono" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-foreground/75">Secondary Accent Color</label>
                    <div className="flex items-center gap-2">
                      <input type="color" value={secondaryColor} onChange={e => setSecondaryColor(e.target.value)} className="h-9 w-10 cursor-pointer border rounded-lg bg-transparent" />
                      <Input value={secondaryColor} onChange={e => setSecondaryColor(e.target.value)} className="font-mono" />
                    </div>
                  </div>
                </div>

                <Button
                  size="sm"
                  className="text-white text-xs font-bold h-8.5 gap-1.5 mt-2 cursor-pointer"
                  style={{ backgroundColor: brandColor }}
                  onClick={handleSaveBranding}
                >
                  <Save className="h-4 w-4" />
                  Publish Visual Styles
                </Button>
              </Card>
            </div>

            {/* Real-time Sandbox Live Preview */}
            <div className="space-y-6">
              <Card className="border border-card-border bg-[#F9F9FB] dark:bg-[#08080A] p-4 rounded-2xl shadow-level-4 space-y-4">
                <span className="text-[9px] text-foreground/45 uppercase tracking-wider font-bold">Real-Time UI Preview Sandbox</span>

                {/* Mock UI layout representing sidebar and page */}
                <div className="border border-card-border bg-[#0C0C0E] rounded-xl overflow-hidden text-[9px] font-bold text-white/80 h-64 flex">
                  {/* Mock Sidebar */}
                  <div className="w-1/3 bg-[#050506] border-r border-card-border p-2 space-y-2 shrink-0">
                    <div className="flex items-center gap-1">
                      <div className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: brandColor }} />
                      <span className="truncate text-[8px] font-black">{hqName}</span>
                    </div>
                    <div className="space-y-1 pt-2">
                      {['Dashboard', termBoardroom, 'Missions', 'Integrations'].map((nav, idx) => (
                        <div key={idx} className="p-1 rounded text-[7.5px] truncate" style={idx === 0 ? { backgroundColor: `${brandColor}20`, color: brandColor } : {}}>
                          {nav}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Mock Workspace Content */}
                  <div className="flex-1 p-3 space-y-3 bg-[#0A0A0C]">
                    <div className="border-b border-card-border pb-1.5">
                      <span className="text-[10px] font-black text-white">{companyName}</span>
                      <p className="text-[7px] text-white/40 mt-0.5 font-semibold">Active workspace</p>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 text-left">
                      <div className="p-2 border border-card-border bg-[#050506] rounded">
                        <span className="text-[6.5px] text-white/45 uppercase block">Cost limits</span>
                        <span className="text-white block font-black mt-0.5">$0.00</span>
                      </div>
                      <div className="p-2 border border-card-border bg-[#050506] rounded">
                        <span className="text-[6.5px] text-white/45 uppercase block">{termMission}s run</span>
                        <span className="text-white block font-black mt-0.5">1 active</span>
                      </div>
                    </div>

                    <Button size="sm" className="w-full text-white text-[7px] font-bold h-5 py-0" style={{ backgroundColor: secondaryColor }}>
                      Trigger action
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* Tab 2: Terminology Remapper & Feature Toggles */}
        {activeTab === 'terminology' && (
          <div className="grid gap-6 md:grid-cols-3 text-left">
            <div className="md:col-span-2 space-y-6">
              {/* Terminology Mapper */}
              <Card className="border border-card-border bg-card-bg p-5 shadow-level-2 space-y-4">
                <div>
                  <h3 className="text-sm font-extrabold text-[#1A1A1E] dark:text-white">Nomenclature Remapper</h3>
                  <p className="text-[10px] text-foreground/50 font-semibold mt-0.5">Customize default terminology across the dashboard interfaces.</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 text-xs font-semibold">
                  <div className="space-y-1.5">
                    <label className="text-foreground/75">Remap &ldquo;Mission&rdquo; (Singular)</label>
                    <Input value={termMission} onChange={e => setTermMission(e.target.value)} placeholder="e.g. Project, Campaign, Engagement" />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-foreground/75">Remap &ldquo;Boardroom&rdquo; (AI C-Suite)</label>
                    <Input value={termBoardroom} onChange={e => setTermBoardroom(e.target.value)} placeholder="e.g. AI Advisors, Management Team" />
                  </div>
                </div>
              </Card>

              {/* Feature Toggles */}
              <Card className="border border-card-border bg-card-bg p-5 shadow-level-2 space-y-4">
                <div>
                  <h3 className="text-sm font-extrabold text-[#1A1A1E] dark:text-white">Tenant Feature Management</h3>
                  <p className="text-[10px] text-foreground/50 font-semibold mt-0.5">Enable or restrict specific system modules for this Headquarters.</p>
                </div>

                <div className="space-y-3 font-semibold text-xs">
                  {[
                    { label: 'Ecosystem Marketplace', desc: 'Allows users to install community extensions', value: featureMarketplace, setter: setFeatureMarketplace },
                    { label: 'Integrations Hub Portal', desc: 'Allows accounts OAuth configurations', value: featureIntegrations, setter: setFeatureIntegrations },
                  ].map((feat, idx) => (
                    <div key={idx} className="p-3 rounded-lg border border-card-border bg-[#F9F9FB] dark:bg-[#0A0A0C]/10 flex justify-between gap-4 items-center">
                      <div>
                        <span className="font-extrabold text-white text-xs block">{feat.label}</span>
                        <span className="text-[9.5px] text-foreground/45 leading-relaxed mt-0.5 block">{feat.desc}</span>
                      </div>
                      <button
                        onClick={() => {
                          feat.setter(!feat.value);
                          toast.success(`Feature configuration updated: ${feat.label}`);
                        }}
                        className={`text-[9.5px] px-2.5 py-1 rounded font-black uppercase transition-all shrink-0 cursor-pointer ${
                          feat.value
                            ? 'bg-green-500/15 text-green-500 border border-green-500/20'
                            : 'bg-card-bg border border-card-border text-foreground/45 hover:bg-foreground/5'
                        }`}
                      >
                        {feat.value ? 'Enabled' : 'Disabled'}
                      </button>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* Tab 3: Domain & SSL Verification */}
        {activeTab === 'domain' && (
          <div className="grid gap-6 md:grid-cols-3 text-left">
            <div className="md:col-span-2 space-y-6">
              {/* Domain list */}
              <Card className="border border-card-border bg-card-bg p-5 shadow-level-2 space-y-4">
                <div className="flex items-center justify-between border-b border-card-border pb-2">
                  <h3 className="text-sm font-extrabold text-[#1A1A1E] dark:text-white">Custom Subdomains</h3>
                  <Badge variant="success" className="text-[8px] font-bold uppercase tracking-wider">SSL MANAGER ACTIVE</Badge>
                </div>

                <div className="space-y-3">
                  {domains.map(dom => (
                    <div key={dom.id} className="p-3 rounded-lg border border-card-border bg-[#F9F9FB] dark:bg-[#0A0A0C]/20 text-xs flex justify-between gap-4">
                      <div>
                        <span className="font-extrabold text-white block">{dom.domain}</span>
                        <div className="flex gap-2 text-[9px] text-foreground/45 font-semibold mt-0.5">
                          <span>DNS: <span className={dom.dnsVerified ? 'text-green-500 font-bold' : 'text-yellow-500 font-bold'}>{dom.dnsVerified ? 'Verified' : 'Unresolved A-Record'}</span></span>
                        </div>
                      </div>

                      <div className="flex gap-2.5 shrink-0 self-center items-center">
                        <Badge variant={dom.sslStatus === 'Provisioned' ? 'success' : 'warning'} className="text-[8px] font-bold uppercase">
                          SSL: {dom.sslStatus}
                        </Badge>
                        {!dom.dnsVerified && (
                          <button
                            onClick={() => handleVerifyDNS(dom.id, dom.domain)}
                            className="text-hq-cyan hover:text-hq-cyan-hover font-extrabold text-[10px] cursor-pointer"
                          >
                            Verify DNS
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Register Domain form */}
            <div className="space-y-6">
              <Card className="border border-card-border bg-card-bg p-5 shadow-level-2 space-y-4">
                <div>
                  <h4 className="text-xs font-black text-[#1A1A1E] dark:text-white uppercase tracking-widest">Add Custom Domain</h4>
                  <p className="text-[9.5px] text-foreground/45 mt-0.5 font-semibold">Route your branded C-Suite workspace under your domain</p>
                </div>

                <div className="space-y-3.5 text-xs font-semibold">
                  <div className="space-y-1.5">
                    <label className="text-foreground/75">Domain Address</label>
                    <Input
                      placeholder="e.g. hq.mycompany.com"
                      value={newDomainName}
                      onChange={e => setNewDomainName(e.target.value)}
                    />
                  </div>

                  <Button
                    size="sm"
                    className="w-full text-white text-xs font-bold h-8.5 gap-1.5 cursor-pointer"
                    style={{ backgroundColor: brandColor }}
                    onClick={handleCreateDomain}
                  >
                    <Globe className="h-4 w-4" />
                    Register Domain
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* Tab 4: Partner Reseller Portal */}
        {activeTab === 'partner' && (
          <div className="grid gap-6 md:grid-cols-3 text-left">
            <div className="md:col-span-2 space-y-6">
              {/* Clients directory */}
              <Card className="border border-card-border bg-card-bg p-5 shadow-level-2 space-y-4">
                <div className="flex items-center justify-between border-b border-card-border pb-2">
                  <h3 className="text-sm font-extrabold text-[#1A1A1E] dark:text-white">Managed Client Environments</h3>
                  <Badge variant="neutral" className="text-[9px] font-bold">Reseller Account</Badge>
                </div>

                <div className="space-y-3">
                  {clients.map(cli => (
                    <div key={cli.id} className="p-3.5 rounded-lg border border-card-border bg-[#F9F9FB] dark:bg-[#0A0A0C]/20 text-xs flex justify-between gap-4">
                      <div>
                        <span className="font-extrabold text-white block">{cli.name}</span>
                        <div className="flex flex-wrap gap-2 text-[9.5px] text-foreground/45 font-semibold mt-1">
                          <span>Domain: <span className="text-hq-cyan">{cli.domain}</span></span>
                          <span>·</span>
                          <span>Members: <span className="text-white">{cli.usersCount}</span></span>
                        </div>
                      </div>

                      <div className="flex gap-2.5 shrink-0 self-center items-center">
                        <Badge variant="neutral" className="text-[8px] font-bold uppercase">{cli.plan}</Badge>
                        <Badge variant="success" className="text-[8px] font-bold uppercase">{cli.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Provision client form */}
            <div className="space-y-6">
              <Card className="border border-card-border bg-card-bg p-5 shadow-level-2 space-y-4">
                <div>
                  <h4 className="text-xs font-black text-[#1A1A1E] dark:text-white uppercase tracking-widest">Provision Client Environment</h4>
                  <p className="text-[9.5px] text-foreground/45 mt-0.5 font-semibold">Deploy a fully branded isolated headquarters tenant</p>
                </div>

                <div className="space-y-3.5 text-xs font-semibold">
                  <div className="space-y-1.5">
                    <label className="text-foreground/75">Client Organization Name</label>
                    <Input
                      placeholder="e.g. Apex Global"
                      value={newClientName}
                      onChange={e => setNewClientName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-foreground/75">Assigned Domain</label>
                    <Input
                      placeholder="e.g. apex.hq.corp"
                      value={newClientDomain}
                      onChange={e => setNewClientDomain(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-foreground/75">Plan Entitlements</label>
                    <select
                      className="bg-card-bg border border-card-border rounded-lg w-full p-2 h-9 text-xs font-bold focus:outline-none text-white"
                      value={newClientPlan}
                      onChange={e => setNewClientPlan(e.target.value)}
                    >
                      <option value="Starter Pack">Starter Pack</option>
                      <option value="Professional Scale">Professional Scale</option>
                      <option value="Enterprise Scale">Enterprise Scale</option>
                    </select>
                  </div>

                  <Button
                    size="sm"
                    className="w-full text-white text-xs font-bold h-8.5 gap-1.5 cursor-pointer"
                    style={{ backgroundColor: brandColor }}
                    onClick={handleCreateClient}
                  >
                    <Plus className="h-4 w-4" />
                    Deploy Tenant Context
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
