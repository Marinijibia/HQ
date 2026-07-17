'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Button, Badge, Input } from '@hq/ui';
import {
  Rocket,
  Search,
  Plus,
  Play,
  RotateCw,
  Sliders,
  ShieldCheck,
  Award,
  Trash2,
  Activity,
  History,
  Download,
  Info,
  ChevronRight,
  UserCheck,
  CheckCircle,
  Star,
  Layers,
  ArrowRight,
  Sparkles,
  Bot,
  Settings2,
  Clock,
  Eye,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../../../contexts/auth-context';
import { toast } from '../../../components/toast';

interface MarketplaceItem {
  id: string;
  name: string;
  publisher: string;
  category: 'AI Executives' | 'Workflow Templates' | 'Knowledge Packs' | 'Widgets';
  logo: string;
  price: string;
  rating: number;
  installCount: string;
  description: string;
  permissions: string[];
}

interface InstalledItem {
  id: string;
  name: string;
  publisher: string;
  category: string;
  logo: string;
  version: string;
  autoUpdate: boolean;
  status: 'Active' | 'Muted';
}

export default function MarketplacePage() {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = React.useState<'home' | 'installed' | 'developer'>('home');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState<string>('all');
  const [brandColor, setBrandColor] = React.useState('#0A84FF');

  // Listing details modal state
  const [listingModalOpen, setListingModalOpen] = React.useState(false);
  const [selectedItem, setSelectedItem] = React.useState<MarketplaceItem | null>(null);

  // Seeded Marketplace Catalog State
  const [catalog, setCatalog] = React.useState<MarketplaceItem[]>([
    {
      id: 'item-legal-exec',
      name: 'Legal Advisor Director',
      publisher: 'HQ Core',
      category: 'AI Executives',
      logo: '⚖️',
      price: 'Free',
      rating: 4.9,
      installCount: '2.4k',
      description: 'Reviews corporate contracts, flags compliance hazards, and audits data residency rules.',
      permissions: ['Read-only Company Files', 'Audit Logs Read Access'],
    },
    {
      id: 'item-startup-pack',
      name: 'Startup Leadership Team',
      publisher: 'HQ Core',
      category: 'AI Executives',
      logo: '🚀',
      price: '$49/mo',
      rating: 4.8,
      installCount: '1.2k',
      description: 'Unlocks a coordinated department squad: CEO, CFO, and Growth Director pre-aligned.',
      permissions: ['Access Boardroom Chat', 'Manage Missions WBS'],
    },
    {
      id: 'item-launch-template',
      name: 'Product Launch WBS Template',
      publisher: 'Productivity Labs',
      category: 'Workflow Templates',
      logo: '🎯',
      price: 'Free',
      rating: 4.7,
      installCount: '890',
      description: 'Step-by-step product launch roadmap preconfigured with engineering, marketing, and success tasks.',
      permissions: ['Manage Missions WBS'],
    },
    {
      id: 'item-gdpr-knowledge',
      name: 'GDPR Compliance Knowledge Pack',
      publisher: 'Audit Masters',
      category: 'Knowledge Packs',
      logo: '🛡️',
      price: '$99 one-time',
      rating: 4.9,
      installCount: '410',
      description: 'A pre-verified library of corporate GDPR compliance standards, checklists, and template SOPs.',
      permissions: ['Index into Knowledge Base'],
    },
    {
      id: 'item-cfo-widget',
      name: 'CFO Margin Audit Widget',
      publisher: 'Finance Core',
      category: 'Widgets',
      logo: '📊',
      price: '$12/mo',
      rating: 4.6,
      installCount: '1.5k',
      description: 'Interactive dashboard widget representing credits consumption trends vs API cost margins.',
      permissions: ['Read Analytics Telemetry'],
    },
  ]);

  // Seeded Installed items state
  const [installed, setInstalled] = React.useState<InstalledItem[]>([
    { id: 'inst-1', name: 'Google Drive Indexer Pack', publisher: 'HQ Core', category: 'Integrations', logo: '📁', version: 'v1.4.2', autoUpdate: true, status: 'Active' },
    { id: 'inst-2', name: 'Quarterly Financial Audit WBS', publisher: 'HQ Core', category: 'Workflow Templates', logo: '📊', version: 'v2.0.1', autoUpdate: false, status: 'Active' },
  ]);

  // Developer portal custom template states
  const [devItems, setDevItems] = React.useState<InstalledItem[]>([]);
  const [newDevName, setNewDevName] = React.useState('');
  const [newDevCategory, setNewDevCategory] = React.useState('Workflow Templates');

  React.useEffect(() => {
    const draft = localStorage.getItem('hq_onboarding_draft');
    if (draft) {
      try {
        const d = JSON.parse(draft);
        if (d.brandColor) setBrandColor(d.brandColor);
      } catch { /* ignore */ }
    }
  }, []);

  const handleOpenListing = (item: MarketplaceItem) => {
    setSelectedItem(item);
    setListingModalOpen(true);
  };

  const handleInstallItem = () => {
    if (!selectedItem) return;
    const newItem: InstalledItem = {
      id: `inst-${Date.now()}`,
      name: selectedItem.name,
      publisher: selectedItem.publisher,
      category: selectedItem.category,
      logo: selectedItem.logo,
      version: 'v1.0.0',
      autoUpdate: true,
      status: 'Active',
    };
    setInstalled(prev => [...prev, newItem]);
    setCatalog(prev => prev.filter(c => c.id !== selectedItem.id));
    setListingModalOpen(false);
    toast.success(`🎉 Installed "${selectedItem.name}" to your Headquarters workspace!`);
  };

  const handleToggleAutoUpdate = (id: string) => {
    setInstalled(prev => prev.map(item => item.id === id ? { ...item, autoUpdate: !item.autoUpdate } : item));
    toast.success('🔄 Auto-update configurations updated');
  };

  const handleUninstall = (id: string, name: string) => {
    setInstalled(prev => prev.filter(item => item.id !== id));
    toast.info(`🗑️ Uninstalled extension: ${name}`);
  };

  const handlePublishCustomItem = () => {
    if (!newDevName.trim()) return;
    const newItem: InstalledItem = {
      id: `dev-${Date.now()}`,
      name: newDevName,
      publisher: 'Local Org Private Developer',
      category: newDevCategory,
      logo: '🔧',
      version: 'v1.0.0',
      autoUpdate: false,
      status: 'Active',
    };
    setDevItems(prev => [...prev, newItem]);
    setNewDevName('');
    toast.success(`📤 Private marketplace item "${newItem.name}" published to organization directory`);
  };

  const filteredItems = catalog
    .filter(item => selectedCategory === 'all' || item.category === selectedCategory)
    .filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.description.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="space-y-8 select-none text-foreground pb-12">
      {/* Page Header */}
      <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0 border-b border-card-border pb-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#1A1A1E] dark:text-white flex items-center gap-2">
            <Rocket className="h-8 w-8 text-hq-blue" />
            Marketplace & Ecosystem
          </h1>
          <p className="text-foreground/60 text-sm mt-1">
            Discover preconfigured C-Suite executive directors, install compliance knowledge packs, and deploy custom workflow widgets.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 border-b border-card-border">
        {[
          { id: 'home', label: 'Ecosystem Store', icon: Rocket },
          { id: 'installed', label: 'Installed Extensions', icon: CheckCircle },
          { id: 'developer', label: 'Developer Portal', icon: Sliders },
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

        {/* Tab 1: Marketplace Landing Store */}
        {activeTab === 'home' && (
          <div className="space-y-6 text-left">
            {/* Search & Filter Header bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-card-border pb-3">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-foreground/45" />
                <Input
                  className="pl-9 h-9 text-xs font-semibold focus:outline-none"
                  placeholder="e.g. Show me AI executives for a law firm..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="flex bg-[#F9F9FB] dark:bg-[#0A0A0C] border border-card-border rounded-lg p-0.5 text-xs font-bold uppercase">
                {['all', 'AI Executives', 'Workflow Templates', 'Knowledge Packs', 'Widgets'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat === 'all' ? 'all' : cat)}
                    className={`px-2.5 py-1 rounded ${
                      (selectedCategory === 'all' && cat === 'all') || selectedCategory === cat
                        ? 'bg-background text-white shadow-sm'
                        : 'text-foreground/45 hover:text-foreground'
                    }`}
                  >
                    {cat === 'all' ? 'All' : cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Featured Section banner */}
            <Card className="border border-card-border bg-gradient-to-br from-hq-blue/5 to-hq-purple/5 p-6 shadow-[var(--card-shadow)] flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-start space-x-3">
                <div className="h-10 w-10 rounded-full bg-hq-cyan/15 flex items-center justify-center text-hq-cyan shrink-0">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <Badge variant="ai" className="text-sm font-black uppercase">Staff Picks Collection</Badge>
                  <h3 className="text-sm font-extrabold text-[#1A1A1E] dark:text-white mt-1 leading-snug">
                    Deploy the C-Suite Expansion Roster in 1-Click
                  </h3>
                  <p className="text-xs text-foreground/50 font-semibold mt-0.5 leading-relaxed">
                    Align your CFO, CTO, and CSD into a unified collaborative division with predefined security clearance boundaries.
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                className="text-white text-xs font-bold h-8.5 shrink-0"
                style={{ backgroundColor: brandColor }}
                onClick={() => handleOpenListing(catalog[1])}
              >
                Inspect Collection
              </Button>
            </Card>

            {/* Items Grid */}
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              {filteredItems.map(item => (
                <Card
                  key={item.id}
                  className="border border-card-border bg-card-bg p-4 shadow-[var(--card-shadow)] flex flex-col justify-between space-y-4 cursor-pointer hover:border-card-border-hover transition-all"
                  onClick={() => handleOpenListing(item)}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="h-10 w-10 rounded-xl bg-[#F9F9FB] dark:bg-[#0A0A0C] border border-card-border flex items-center justify-center text-xl shrink-0">
                        {item.logo}
                      </div>
                      <Badge variant="neutral" className="text-sm uppercase tracking-wider font-bold">{item.price}</Badge>
                    </div>

                    <div>
                      <h4 className="text-xs font-black text-white">{item.name}</h4>
                      <p className="text-[9.5px] text-foreground/45 font-bold uppercase tracking-wider mt-0.5">{item.publisher}</p>
                      <p className="text-xs text-foreground/50 leading-relaxed font-semibold mt-2">{item.description}</p>
                    </div>
                  </div>

                  <div className="border-t border-card-border pt-3 flex items-center justify-between text-xs font-bold text-foreground/50 shrink-0">
                    <span className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 text-yellow-500 fill-current" />
                      {item.rating} · ({item.installCount} installs)
                    </span>
                    <Badge variant="ai" className="text-[7.5px] uppercase tracking-wider">{item.category}</Badge>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Installed Extensions Dashboard */}
        {activeTab === 'installed' && (
          <div className="grid gap-6 md:grid-cols-3 text-left">
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center justify-between border-b border-card-border pb-3">
                <h3 className="text-sm font-extrabold text-[#1A1A1E] dark:text-white flex items-center gap-1.5">
                  <CheckCircle className="h-4.5 w-4.5 text-hq-cyan" />
                  Active Headquarters Extensions
                </h3>
                <Badge variant="neutral" className="text-xs">Verified Clearance</Badge>
              </div>

              <div className="space-y-3">
                {installed.map(item => (
                  <Card key={item.id} className="border border-card-border bg-card-bg p-4 shadow-[var(--card-shadow)] flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-[#F9F9FB] dark:bg-[#0A0A0C] border border-card-border flex items-center justify-center text-xl shrink-0">
                        {item.logo}
                      </div>
                      <div>
                        <span className="text-xs font-black text-white block">{item.name}</span>
                        <p className="text-xs text-foreground/45 mt-0.5 font-semibold">
                          Publisher: {item.publisher} · Version: {item.version}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleToggleAutoUpdate(item.id)}
                        className={`text-xs px-2.5 py-1 rounded font-black uppercase transition-all ${
                          item.autoUpdate
                            ? 'bg-hq-cyan/15 text-hq-cyan border border-hq-cyan/20'
                            : 'bg-[#F9F9FB] dark:bg-[#0A0A0C] border border-card-border text-foreground/40'
                        }`}
                      >
                        {item.autoUpdate ? 'Auto-Update' : 'Manual'}
                      </button>

                      <button
                        onClick={() => handleUninstall(item.id, item.name)}
                        className="text-foreground/35 hover:text-red-500 p-1.5 rounded transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Developer Portal Tab */}
        {activeTab === 'developer' && (
          <div className="grid gap-6 md:grid-cols-3 text-left">
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center justify-between border-b border-card-border pb-3">
                <h3 className="text-sm font-extrabold text-[#1A1A1E] dark:text-white flex items-center gap-1.5">
                  <Sliders className="h-4.5 w-4.5 text-hq-purple" />
                  Private Organization publisher
                </h3>
              </div>

              {devItems.length === 0 ? (
                <div className="py-12 text-center text-xs text-foreground/40 font-semibold border border-dashed border-card-border rounded-xl">
                  No private extensions published yet. Upload your first template node using the creator.
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {devItems.map(item => (
                    <Card key={item.id} className="border border-card-border bg-card-bg p-4 shadow-[var(--card-shadow)] flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-[#F9F9FB] dark:bg-[#0A0A0C] border border-card-border flex items-center justify-center text-xl shrink-0">
                        {item.logo}
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-white">{item.name}</h4>
                        <Badge variant="neutral" className="text-sm uppercase tracking-wider font-bold mt-1">{item.category}</Badge>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Private publisher form */}
            <div className="space-y-6">
              <Card className="border border-card-border bg-card-bg p-5 shadow-[var(--card-shadow)] space-y-4">
                <div>
                  <h4 className="text-xs font-black text-[#1A1A1E] dark:text-white uppercase tracking-widest">Publish Extension</h4>
                  <p className="text-[9.5px] text-foreground/45 mt-0.5 font-semibold">Make a custom template visible to your organization</p>
                </div>

                <div className="space-y-3.5 text-xs">
                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground/75">Extension Name</label>
                    <Input
                      placeholder="e.g. Nigeria Tax WBS Pack"
                      value={newDevName}
                      onChange={e => setNewDevName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground/75">Extension Category</label>
                    <select
                      className="bg-card-bg border border-card-border rounded-lg w-full p-2 h-9 text-xs font-bold focus:outline-none text-white"
                      value={newDevCategory}
                      onChange={e => setNewDevCategory(e.target.value)}
                    >
                      <option value="Workflow Templates">Workflow Templates</option>
                      <option value="Prompt Libraries">Prompt Libraries</option>
                      <option value="Knowledge Packs">Knowledge Packs</option>
                      <option value="Widgets">Dashboard Widgets</option>
                    </select>
                  </div>

                  <Button
                    size="sm"
                    className="w-full text-white text-xs font-bold h-8.5 gap-1.5"
                    style={{ backgroundColor: brandColor }}
                    onClick={handlePublishCustomItem}
                  >
                    <Plus className="h-4 w-4" />
                    Publish Extension
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        )}

      </div>

      {/* ─── Listing Detail Modal ─────────────────────────────────────────── */}
      {listingModalOpen && selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="border border-card-border bg-card-bg w-full max-w-md p-6 shadow-level-4 space-y-6 text-left animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-[#F9F9FB] dark:bg-[#0A0A0C] border border-card-border flex items-center justify-center text-2xl shrink-0">
                {selectedItem.logo}
              </div>
              <div>
                <Badge variant="ai" className="text-sm font-black tracking-wider uppercase">{selectedItem.category}</Badge>
                <h3 className="text-sm font-black text-white mt-1">{selectedItem.name}</h3>
                <p className="text-xs text-foreground/45 font-bold uppercase mt-0.5">By {selectedItem.publisher} · Rating: {selectedItem.rating} ★</p>
              </div>
            </div>

            {/* Description */}
            <div className="text-xs space-y-4 font-semibold">
              <div>
                <span className="text-foreground/45 text-xs uppercase tracking-wider block">Description</span>
                <p className="text-foreground/75 leading-relaxed mt-1">{selectedItem.description}</p>
              </div>

              {/* Required Permissions */}
              <div className="border-t border-card-border pt-4 space-y-2">
                <span className="text-foreground/45 text-xs uppercase tracking-wider block">Required Security Permissions</span>
                <p className="text-xs text-foreground/45 font-semibold mt-0.5 leading-snug">Installing this item will grant the following access clearances to AI Co-Pilots:</p>
                
                <div className="space-y-1.5 mt-2">
                  {selectedItem.permissions.map(perm => (
                    <div key={perm} className="flex items-center gap-2 p-2 rounded border border-card-border bg-[#F9F9FB] dark:bg-[#0A0A0C]/20 text-[9.5px]">
                      <ShieldCheck className="h-4 w-4 text-hq-cyan shrink-0" />
                      <span className="text-white">{perm}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer actions */}
            <div className="flex gap-2 pt-4 border-t border-card-border shrink-0">
              <Button
                size="sm"
                className="flex-1 text-white text-xs font-bold h-8.5"
                style={{ backgroundColor: brandColor }}
                onClick={handleInstallItem}
              >
                Install ({selectedItem.price})
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-xs border-card-border font-bold h-8.5"
                onClick={() => setListingModalOpen(false)}
              >
                Cancel
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
