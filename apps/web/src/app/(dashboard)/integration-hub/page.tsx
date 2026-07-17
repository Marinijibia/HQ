'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Button, Badge, Input } from '@hq/ui';
import {
  Plug2,
  CheckCircle,
  Activity,
  History,
  Trash2,
  ChevronRight,
  Plus,
  Play,
  RotateCw,
  Search,
  Sliders,
  ShieldCheck,
  FolderOpen,
  ArrowRight,
  Sparkles,
  GitPullRequest,
  Check,
  RefreshCw,
  Clock,
  HardDrive,
  MessageSquare,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '../../../contexts/auth-context';
import { toast } from '../../../components/toast';

interface ConnectedApp {
  id: string;
  name: string;
  category: string;
  logo: string;
  status: 'Healthy' | 'Syncing' | 'Re-authorizing' | 'Error';
  lastSync: string;
  dataTransferred: string;
  executives: string[];
}

interface IntegrationCatalogItem {
  id: string;
  name: string;
  desc: string;
  category: string;
  logo: string;
}

interface AutomationRecipe {
  id: string;
  name: string;
  trigger: string;
  action: string;
  active: boolean;
}

export default function IntegrationsHubPage() {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = React.useState<'hub' | 'catalog' | 'automations'>('hub');
  const [brandColor, setBrandColor] = React.useState('#0A84FF');

  // Connection Wizard states
  const [wizardOpen, setWizardOpen] = React.useState(false);
  const [wizardStep, setWizardStep] = React.useState<number>(1);
  const [selectedCatalogItem, setSelectedCatalogItem] = React.useState<IntegrationCatalogItem | null>(null);
  const [selectedSyncInterval, setSelectedSyncInterval] = React.useState('hourly');

  // Permission Configuration states
  const [permissionsOpen, setPermissionsOpen] = React.useState(false);
  const [selectedApp, setSelectedApp] = React.useState<ConnectedApp | null>(null);

  // Connected Apps State
  const [connectedApps, setConnectedApps] = React.useState<ConnectedApp[]>([
    { id: 'slack', name: 'Slack', category: 'Communication', logo: '💬', status: 'Healthy', lastSync: '10 mins ago', dataTransferred: '420 KB', executives: ['CEO Elena', 'CMO Amara'] },
    { id: 'gdrive', name: 'Google Drive', category: 'Storage', logo: '📁', status: 'Healthy', lastSync: '1 hour ago', dataTransferred: '12.4 MB', executives: ['CEO Elena', 'CTO Hiroshi'] },
    { id: 'github', name: 'GitHub', category: 'Development', logo: '🐙', status: 'Syncing', lastSync: 'Just now', dataTransferred: '1.8 MB', executives: ['CTO Hiroshi'] },
  ]);

  // Catalog State
  const [catalog, setCatalog] = React.useState<IntegrationCatalogItem[]>([
    { id: 'notion', name: 'Notion', desc: 'Docs, tasks and knowledge logs integration.', category: 'Productivity', logo: '📝' },
    { id: 'stripe', name: 'Stripe', desc: 'Financial transaction triggers and cost limits.', category: 'Finance', logo: '💳' },
    { id: 'hubspot', name: 'HubSpot', desc: 'Sales pipeline and CRM customer mapping.', category: 'CRM', logo: '📊' },
    { id: 'zendesk', name: 'Zendesk', desc: 'Customer support tickets matching.', category: 'Support', logo: '☎️' },
    { id: 'meta', name: 'Meta Ads', desc: 'Ad campaigns analytics integration.', category: 'Marketing', logo: '🎯' },
  ]);

  // Automation Recipes State
  const [recipes, setRecipes] = React.useState<AutomationRecipe[]>([
    { id: 'rec-1', name: 'Sync Code to Knowledge base', trigger: 'GitHub New Pull Request', action: 'Index files to Knowledge Base', active: true },
    { id: 'rec-2', name: 'Financial Revenue Alert', trigger: 'Stripe Payment Received', action: 'Notify Finance Executive (CFO)', active: true },
    { id: 'rec-3', name: 'Urgent Discussion Escalation', trigger: 'Slack Message tagged "#urgent"', action: 'Spawn Boardroom Discussion', active: false },
  ]);

  React.useEffect(() => {
    const draft = localStorage.getItem('hq_onboarding_draft');
    if (draft) {
      try {
        const d = JSON.parse(draft);
        if (d.brandColor) setBrandColor(d.brandColor);
      } catch { /* ignore */ }
    }
  }, []);

  const handleLaunchWizard = (item: IntegrationCatalogItem) => {
    setSelectedCatalogItem(item);
    setWizardStep(1);
    setWizardOpen(true);
  };

  const handleNextStep = () => {
    if (wizardStep === 4) {
      // Mock test connection spinner
      setWizardStep(5);
      setTimeout(() => {
        setWizardStep(6);
      }, 1500);
    } else if (wizardStep === 6) {
      // Complete connection
      if (selectedCatalogItem) {
        const newApp: ConnectedApp = {
          id: selectedCatalogItem.id,
          name: selectedCatalogItem.name,
          category: selectedCatalogItem.category,
          logo: selectedCatalogItem.logo,
          status: 'Healthy',
          lastSync: 'Just now',
          dataTransferred: '0 KB',
          executives: ['CEO Elena'],
        };
        setConnectedApps(prev => [...prev, newApp]);
        setCatalog(prev => prev.filter(c => c.id !== selectedCatalogItem.id));
        toast.success(`🟢 Connected "${selectedCatalogItem.name}" to Headquarters`);
      }
      setWizardOpen(false);
      setSelectedCatalogItem(null);
    } else {
      setWizardStep(prev => prev + 1);
    }
  };

  const handleDisconnect = (id: string, name: string) => {
    setConnectedApps(prev => prev.filter(app => app.id !== id));
    toast.info(`🔌 Disconnected account: ${name}`);
  };

  const handleSavePermissions = () => {
    setPermissionsOpen(false);
    toast.success('🔒 Integration data-access permissions updated successfully');
  };

  const handleToggleRecipe = (id: string) => {
    setRecipes(prev => prev.map(r => r.id === id ? { ...r, active: !r.active } : r));
    toast.success('⚡ Automation recipe status updated');
  };

  return (
    <div className="space-y-8 select-none text-foreground pb-12">
      {/* Page Header */}
      <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0 border-b border-card-border pb-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#1A1A1E] dark:text-white flex items-center gap-2">
            <Plug2 className="h-8 w-8 text-hq-blue" />
            Integrations Portal
          </h1>
          <p className="text-foreground/60 text-sm mt-1">
            Connect external workspace databases, synchronize assets folders, and authorize secure read/write triggers for AI Executives.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 border-b border-card-border">
        {[
          { id: 'hub', label: 'Connected Ecosystem', icon: Activity },
          { id: 'catalog', label: 'Available Connectors', icon: Plus },
          { id: 'automations', label: 'Automation Recipes', icon: Sliders },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
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

      {/* ─── Tab Content ────────────────────────────────────────────────────── */}
      <div className="space-y-6">

        {/* Tab 1: Integration Hub Dashboard */}
        {activeTab === 'hub' && (
          <div className="grid gap-6 md:grid-cols-3 text-left">
            <div className="md:col-span-2 space-y-6">
              <div className="flex items-center justify-between border-b border-card-border pb-2">
                <h3 className="text-sm font-extrabold text-[#1A1A1E] dark:text-white">Active Integrations</h3>
                <Badge variant="success" className="text-sm font-bold tracking-wider uppercase">ALL SYSTEMS STABLE</Badge>
              </div>

              <div className="space-y-4">
                {connectedApps.map(app => (
                  <Card key={app.id} className="border border-card-border bg-card-bg p-4 shadow-[var(--card-shadow)] flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-[#F9F9FB] dark:bg-[#0A0A0C] border border-card-border flex items-center justify-center text-xl shrink-0">
                        {app.logo}
                      </div>
                      <div>
                        <span className="text-xs font-extrabold text-white block">{app.name}</span>
                        <p className="text-xs text-foreground/45 mt-0.5 font-semibold">
                          Sync: {app.lastSync} · Transferred: {app.dataTransferred}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant={app.status === 'Healthy' ? 'success' : 'warning'} className="text-sm font-black uppercase">
                        {app.status}
                      </Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-[9.5px] border-card-border font-bold h-7.5"
                        onClick={() => {
                          setSelectedApp(app);
                          setPermissionsOpen(true);
                        }}
                      >
                        Permissions
                      </Button>
                      <button
                        onClick={() => handleDisconnect(app.id, app.name)}
                        className="text-foreground/35 hover:text-red-500 p-1.5 rounded transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Sync Activity logs */}
            <div className="space-y-6">
              <Card className="border border-card-border bg-card-bg p-5 shadow-[var(--card-shadow)] space-y-4">
                <h4 className="text-xs font-black text-[#1A1A1E] dark:text-white uppercase tracking-widest flex items-center gap-1.5">
                  <History className="h-4 w-4 text-hq-cyan" />
                  Ecosystem Activity log
                </h4>

                <div className="relative pl-3 border-l border-card-border space-y-3.5 pt-1 text-[9.5px] font-semibold text-foreground/60">
                  <div>
                    <div className="absolute -left-[16.5px] top-1.5 h-1.5 w-1.5 rounded-full bg-hq-cyan" />
                    <p className="text-[#1A1A1E] dark:text-white font-extrabold">Slack synchronized</p>
                    <p className="text-foreground/40 text-[8.5px] mt-0.5">10 mins ago</p>
                  </div>
                  <div>
                    <div className="absolute -left-[16.5px] top-1.5 h-1.5 w-1.5 rounded-full bg-hq-cyan" />
                    <p className="text-[#1A1A1E] dark:text-white font-extrabold">GitHub Webhook parsed roadmap commits</p>
                    <p className="text-foreground/40 text-[8.5px] mt-0.5">Just now</p>
                  </div>
                  <div>
                    <div className="absolute -left-[16.5px] top-1.5 h-1.5 w-1.5 rounded-full bg-hq-cyan" />
                    <p className="text-[#1A1A1E] dark:text-white font-extrabold">GDrive folder sync completed (Layer 5 indexing)</p>
                    <p className="text-foreground/40 text-[8.5px] mt-0.5">1 hour ago</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* Tab 2: Available Connectors Catalog */}
        {activeTab === 'catalog' && (
          <div className="text-left space-y-4">
            <div className="border-b border-card-border pb-2">
              <h3 className="text-sm font-extrabold text-[#1A1A1E] dark:text-white">Available Integrations</h3>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              {catalog.map(item => (
                <Card key={item.id} className="border border-card-border bg-card-bg p-4 shadow-[var(--card-shadow)] flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="h-10 w-10 rounded-xl bg-[#F9F9FB] dark:bg-[#0A0A0C] border border-card-border flex items-center justify-center text-xl shrink-0">
                        {item.logo}
                      </div>
                      <Badge variant="neutral" className="text-sm uppercase tracking-wider font-bold">{item.category}</Badge>
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-white">{item.name}</h4>
                      <p className="text-[9.5px] text-foreground/50 leading-relaxed font-semibold mt-1">{item.desc}</p>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    className="text-white text-xs font-bold h-7.5 gap-1.5 w-full mt-2"
                    style={{ backgroundColor: brandColor }}
                    onClick={() => handleLaunchWizard(item)}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Connect account
                  </Button>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Automation Recipes Tab */}
        {activeTab === 'automations' && (
          <div className="grid gap-6 md:grid-cols-3 text-left">
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center justify-between border-b border-card-border pb-3">
                <h3 className="text-sm font-extrabold text-[#1A1A1E] dark:text-white flex items-center gap-1.5">
                  <Sliders className="h-4.5 w-4.5 text-hq-purple" />
                  Ecosystem Trigger Automations
                </h3>
                <Badge variant="neutral" className="text-xs">Event-driven recipes</Badge>
              </div>

              <div className="space-y-3">
                {recipes.map(recipe => (
                  <Card key={recipe.id} className="border border-card-border bg-card-bg p-4 shadow-[var(--card-shadow)] flex items-center justify-between gap-4">
                    <div className="space-y-1.5">
                      <h4 className="text-xs font-black text-white">{recipe.name}</h4>
                      <div className="flex flex-wrap gap-2 text-[9.5px] font-semibold text-foreground/45">
                        <span>Trigger: <span className="text-hq-cyan">{recipe.trigger}</span></span>
                        <span>➔</span>
                        <span>Action: <span className="text-hq-purple">{recipe.action}</span></span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggleRecipe(recipe.id)}
                      className={`text-[9.5px] px-2.5 py-1 rounded font-black uppercase transition-all ${
                        recipe.active
                          ? 'bg-green-500/15 text-green-500 border border-green-500/20'
                          : 'bg-[#F9F9FB] dark:bg-[#0A0A0C] border border-card-border text-foreground/45 hover:bg-foreground/5'
                      }`}
                    >
                      {recipe.active ? 'Active' : 'Muted'}
                    </button>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* ─── Connection Wizard Modal ────────────────────────────────────────── */}
      {wizardOpen && selectedCatalogItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="border border-card-border bg-card-bg w-full max-w-md p-6 shadow-level-4 space-y-6 text-left animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-[#F9F9FB] dark:bg-[#0A0A0C] border border-card-border flex items-center justify-center text-xl">
                {selectedCatalogItem.logo}
              </div>
              <div>
                <Badge variant="ai" className="text-sm font-black tracking-wider uppercase">Connection Wizard · Step {wizardStep} of 6</Badge>
                <h3 className="text-sm font-black text-white mt-1">Connect {selectedCatalogItem.name}</h3>
              </div>
            </div>

            {/* Steps router */}
            <div className="text-xs space-y-4 font-semibold">
              {wizardStep === 1 && (
                <div className="space-y-2 leading-relaxed">
                  <p className="text-foreground/75">You are initiating secure authentication to link your organizational {selectedCatalogItem.name} workspace.</p>
                  <p className="text-xs text-foreground/40 leading-snug">Ensure you have admin rights on the target tenant software workspace.</p>
                </div>
              )}

              {wizardStep === 2 && (
                <div className="space-y-3">
                  <p className="text-foreground/75">Authenticate using OAuth 2.0 secure keys redirection.</p>
                  <div className="border border-card-border bg-[#F9F9FB] dark:bg-[#0A0A0C] rounded-lg p-3 text-xs font-mono text-center flex items-center justify-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-hq-cyan" />
                    <span>Redirection handshake keys verified.</span>
                  </div>
                </div>
              )}

              {wizardStep === 3 && (
                <div className="space-y-3">
                  <p className="text-foreground/75">Select scope boundaries for authorization:</p>
                  {[
                    { label: 'Read-only files metadata', desc: 'Allows AI executives to inspect directories' },
                    { label: 'Write access on discussions channels', desc: 'Allows automated mission summaries delivery' },
                  ].map((scope, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 p-2 rounded-lg border border-card-border bg-[#F9F9FB] dark:bg-[#0A0A0C]/30">
                      <div className="h-4.5 w-4.5 rounded-full bg-hq-cyan/15 text-hq-cyan flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="h-3 w-3" />
                      </div>
                      <div>
                        <p className="text-[10.5px] font-bold text-white">{scope.label}</p>
                        <p className="text-xs text-foreground/45 font-semibold mt-0.5 leading-tight">{scope.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {wizardStep === 4 && (
                <div className="space-y-3">
                  <p className="text-foreground/75">Configure target data folders or channels to index:</p>
                  <Input placeholder="e.g. /Shared/Roadmaps" defaultValue="/Shared/Marketing" />
                </div>
              )}

              {wizardStep === 5 && (
                <div className="py-6 flex flex-col items-center justify-center space-y-3 text-center">
                  <RefreshCw className="h-6 w-6 text-hq-cyan animate-spin" />
                  <p className="text-[10.5px] text-foreground/50">Testing connection endpoints...</p>
                </div>
              )}

              {wizardStep === 6 && (
                <div className="space-y-3">
                  <p className="text-foreground/75">Connection handshake validated! Enable synchronization frequency:</p>
                  <div className="grid grid-cols-3 gap-2">
                    {['real-time', 'hourly', 'daily'].map(interval => (
                      <button
                        key={interval}
                        onClick={() => setSelectedSyncInterval(interval)}
                        className={`p-2 rounded-lg border text-center transition-all text-[9.5px] uppercase font-bold ${
                          selectedSyncInterval === interval ? 'border-hq-cyan bg-hq-cyan/5 text-hq-cyan' : 'border-card-border bg-card-bg'
                        }`}
                      >
                        {interval}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer actions */}
            <div className="flex gap-2 pt-4 border-t border-card-border shrink-0">
              <Button
                size="sm"
                className="flex-1 text-white text-xs font-bold h-8.5"
                style={{ backgroundColor: brandColor }}
                disabled={wizardStep === 5}
                onClick={handleNextStep}
              >
                {wizardStep === 6 ? 'Enable Sync & Complete' : 'Proceed'}
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-xs border-card-border font-bold h-8.5"
                onClick={() => setWizardOpen(false)}
              >
                Cancel
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* ─── Permissions Management Modal ────────────────────────────────────── */}
      {permissionsOpen && selectedApp && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="border border-card-border bg-card-bg w-full max-w-md p-6 shadow-level-4 space-y-6 text-left animate-in zoom-in-95 duration-200">
            <div>
              <Badge variant="ai" className="text-sm font-black tracking-wider uppercase">Clearance Boundaries</Badge>
              <h3 className="text-sm font-black text-white mt-1">Configure {selectedApp.name} Permissions</h3>
            </div>

            <div className="text-xs space-y-4 font-semibold">
              <div>
                <span className="text-foreground/45 text-xs uppercase tracking-wider block">Assigned AI Co-Pilots</span>
                <p className="text-[9.5px] text-foreground/50 leading-relaxed font-semibold mt-0.5">Toggle which AI Executives are authorized to query datasets from this service.</p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {['CEO Elena', 'CTO Hiroshi', 'CFO Sophia', 'CMO Amara'].map(exec => {
                    const active = selectedApp.executives.includes(exec);
                    return (
                      <button
                        key={exec}
                        onClick={() => {
                          const nextExecs = active
                            ? selectedApp.executives.filter(e => e !== exec)
                            : [...selectedApp.executives, exec];
                          setSelectedApp(prev => prev ? { ...prev, executives: nextExecs } : null);
                        }}
                        className={`px-2.5 py-1 rounded text-xs font-bold ${
                          active ? 'bg-hq-cyan/20 text-hq-cyan border border-hq-cyan/30' : 'bg-card-bg border border-card-border text-foreground/40'
                        }`}
                      >
                        {exec}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="border-t border-card-border pt-4">
                <span className="text-foreground/45 text-xs uppercase tracking-wider block">Authorized Scope Bounds</span>
                {[
                  { label: 'Read-only access to files database', value: true },
                  { label: 'Authorized to write/post notifications', value: false },
                  { label: 'Enable background synchronization', value: true },
                ].map((scope, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded border border-card-border bg-[#F9F9FB] dark:bg-[#0A0A0C]/10 mt-2">
                    <span className="text-foreground/75 text-[10.5px]">{scope.label}</span>
                    <Badge variant={scope.value ? 'success' : 'neutral'} className="text-sm uppercase tracking-wider font-bold">
                      {scope.value ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-4 border-t border-card-border shrink-0">
              <Button
                size="sm"
                className="flex-1 text-white text-xs font-bold h-8.5"
                style={{ backgroundColor: brandColor }}
                onClick={handleSavePermissions}
              >
                Save Permissions
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-xs border-card-border font-bold h-8.5"
                onClick={() => setPermissionsOpen(false)}
              >
                Close
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
