'use client';

import * as React from 'react';
import { Card, Button, Badge, Input } from '@hq/ui';
import {
  Rocket,
  Search,
  CheckCircle,
  Sparkles,
  ShieldCheck,
  Star,
  Zap,
  ShoppingBag,
  PlusCircle,
  MessageSquare,
  Building2,
  SlidersHorizontal,
  Filter,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '../../../contexts/auth-context';
import { toast } from '../../../components/toast';

interface MarketplaceItem {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  category: string;
  tags: string[];
  listingType: 'EXECUTIVE' | 'DEPARTMENT';
  downloadsCount: number;
  rating: number;
  roleKey?: string;
  departmentKey?: string;
  isInstalled?: boolean;
}

export default function MarketplacePage() {
  const { dbUser, token } = useAuth();
  const [activeTab, setActiveTab] = React.useState<'catalog' | 'installed'>('catalog');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState<string>('all');
  const [loading, setLoading] = React.useState(false);

  // Listing details modal state
  const [listingModalOpen, setListingModalOpen] = React.useState(false);
  const [selectedItem, setSelectedItem] = React.useState<MarketplaceItem | null>(null);

  // Marketplace Catalog State — Initialized to Empty State
  const [catalog, setCatalog] = React.useState<MarketplaceItem[]>([]);
  const [installedItems, setInstalledItems] = React.useState<MarketplaceItem[]>([]);

  // Fetch live marketplace listings from API
  const fetchMarketplaceData = React.useCallback(async () => {
    setLoading(true);
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch('/api/marketplace/listings', { headers }).catch(() => null);
      if (res && res.ok) {
        const data = await res.json();
        setCatalog(Array.isArray(data) ? data : []);
      } else {
        // Empty catalog state
        setCatalog([]);
      }
    } catch {
      setCatalog([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  React.useEffect(() => {
    fetchMarketplaceData();
  }, [fetchMarketplaceData]);

  const categories = [
    { id: 'all', label: 'All Categories' },
    { id: 'Engineering', label: 'Engineering & Technology' },
    { id: 'Marketing', label: 'Sales & Growth' },
    { id: 'Finance', label: 'Finance & Strategy' },
    { id: 'Legal', label: 'Legal & Compliance' },
    { id: 'Operations', label: 'Operations' },
  ];

  const filteredCatalog = catalog.filter((item) => {
    if (selectedCategory !== 'all' && item.category.toLowerCase() !== selectedCategory.toLowerCase()) {
      return false;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleInstallItem = async (item: MarketplaceItem) => {
    const companyId = dbUser?.companyId;
    if (!companyId) {
      toast.error('Organization not found.');
      return;
    }

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      await fetch(`/api/marketplace/listings/${item.id}/install`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ companyId }),
      }).catch(() => null);

      toast.success(`🎉 Installed "${item.title}" into your workspace roster!`);
      setInstalledItems((prev) => [...prev, { ...item, isInstalled: true }]);
      setListingModalOpen(false);
    } catch (e) {
      toast.error('Installation failed.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 text-left pb-12 select-none">
      {/* Top Banner Header — Dual Theme */}
      <div className="relative overflow-hidden rounded-3xl border border-cyan-500/30 dark:border-cyan-500/20 bg-gradient-to-r from-cyan-500/10 via-slate-100 to-blue-500/10 dark:from-slate-950 dark:via-[#0B0F19] dark:to-cyan-950/40 p-6 sm:p-8 shadow-xl dark:shadow-2xl backdrop-blur-xl transition-all">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-500 to-purple-600 p-[1.5px] shadow-[0_0_20px_rgba(6,182,212,0.3)]">
              <div className="w-full h-full bg-white dark:bg-slate-950 rounded-[14px] flex items-center justify-center font-black text-xl text-slate-900 dark:text-white">
                <ShoppingBag className="w-7 h-7 text-cyan-600 dark:text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Marketplace & AI Department Store</h1>
                <Badge variant="ai" className="text-[10px] uppercase font-bold tracking-wider">
                  DEPARTMENT STORE
                </Badge>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-medium">
                Install new specialized AI departments or publish custom executive suites into your workspace.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={fetchMarketplaceData}
              className="bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 text-xs font-bold px-3.5 py-2 rounded-xl border border-slate-300 dark:border-white/10 flex items-center gap-1.5 shadow-sm"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin text-cyan-500' : ''} /> Refresh Store
            </Button>
            <Link href="/ceo-chat?exec=asad">
              <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-lg">
                <MessageSquare size={14} /> Consult CEO Asad
              </Button>
            </Link>
          </div>
        </div>

        {/* Tab & Search Bar */}
        <div className="mt-6 pt-4 border-t border-slate-200 dark:border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('catalog')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
                activeTab === 'catalog'
                  ? 'bg-white dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-500/30 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              🛍️ Storefront Catalog ({catalog.length})
            </button>
            <button
              onClick={() => setActiveTab('installed')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
                activeTab === 'installed'
                  ? 'bg-white dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-500/30 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              📦 Active Installed ({installedItems.length})
            </button>
          </div>

          <div className="relative w-full sm:w-72">
            <Search size={14} className="absolute left-3 top-3 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search departments, CTO, Marketing..."
              className="bg-white/80 dark:bg-slate-950 border-slate-300 dark:border-white/10 text-xs pl-9 h-10 rounded-2xl"
            />
          </div>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-slate-500 dark:text-slate-400 font-bold text-[11px] shrink-0 flex items-center gap-1">
          <Filter size={12} /> Filter Category:
        </span>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3.5 py-1.5 rounded-xl text-[11px] font-semibold whitespace-nowrap transition-all border ${
              selectedCategory === cat.id
                ? 'bg-cyan-500 text-white border-cyan-500 shadow-md'
                : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-cyan-400'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* MAIN CATALOG DISPLAY — EMPTY STATE OR ITEMS */}
      {activeTab === 'catalog' && (
        <>
          {filteredCatalog.length === 0 ? (
            /* STUNNING LUXURY EMPTY STATE CARD */
            <Card className="border border-slate-200 dark:border-white/10 bg-white/95 dark:bg-slate-900/90 backdrop-blur-2xl rounded-3xl p-12 text-center space-y-6 shadow-xl dark:shadow-2xl relative overflow-hidden">
              {/* Background Ambient Glow */}
              <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/5 via-blue-500/5 to-purple-600/5 blur-3xl pointer-events-none" />

              <div className="relative z-10 max-w-lg mx-auto space-y-5">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-cyan-500/20 via-blue-500/20 to-purple-500/20 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400 mx-auto flex items-center justify-center shadow-inner">
                  <Building2 size={36} className="text-cyan-500 animate-pulse" />
                </div>

                <div className="space-y-2">
                  <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                    Marketplace Catalog (Clean Empty State)
                  </h2>
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                    Your workspace currently operates with your <strong className="text-slate-900 dark:text-white">5 baseline core directors</strong>:
                  </p>
                </div>

                {/* Core 5 Active Baseline Directors Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left text-xs pt-2">
                  {[
                    { name: 'Asad', title: 'CEO & Strategic Orchestrator', icon: '👑' },
                    { name: 'Teema', title: 'Operations Director', icon: '⚙️' },
                    { name: 'Legal', title: 'Legal & Compliance Director', icon: '⚖️' },
                    { name: 'Resource Director', title: 'Human Resources Director', icon: '👥' },
                    { name: 'Mr. Intelligence', title: 'Public Web Research Agent', icon: '🔍' },
                  ].map((dir, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 flex items-center gap-2.5"
                    >
                      <span className="text-base">{dir.icon}</span>
                      <div>
                        <div className="font-extrabold text-slate-900 dark:text-white">{dir.name}</div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">{dir.title}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-slate-200 dark:border-white/10 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Link href="/ceo-chat">
                    <Button className="w-full sm:w-auto bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs px-6 py-2.5 rounded-xl flex items-center justify-center gap-2 shadow-lg">
                      <MessageSquare size={14} /> Consult CEO Asad for Recommendations
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ) : (
            /* CATALOG ITEMS GRID */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCatalog.map((item) => (
                <Card
                  key={item.id}
                  className="border border-slate-200 dark:border-white/10 bg-white/95 dark:bg-slate-900/90 backdrop-blur-xl rounded-3xl p-6 flex flex-col justify-between space-y-4 hover:border-cyan-400 dark:hover:border-cyan-500/40 transition-all shadow-md hover:shadow-xl"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-[10px] uppercase font-bold text-cyan-600 dark:text-cyan-400">
                        {item.category}
                      </Badge>
                      <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
                        <Star size={12} fill="currentColor" /> {item.rating}
                      </div>
                    </div>

                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white line-clamp-1">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3 font-normal">
                      {item.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-200 dark:border-white/10 flex items-center justify-between">
                    <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                      {item.price === 0 ? 'FREE ($0)' : `$${item.price} ${item.currency}`}
                    </span>

                    <Button
                      onClick={() => handleInstallItem(item)}
                      className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold px-4 py-1.5 rounded-xl flex items-center gap-1.5 shadow-md"
                    >
                      Install Suite <ArrowRight size={12} />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {/* ACTIVE INSTALLED TAB */}
      {activeTab === 'installed' && (
        <Card className="border border-slate-200 dark:border-white/10 bg-white/95 dark:bg-slate-900/90 backdrop-blur-2xl rounded-3xl p-8 space-y-4">
          <h3 className="text-sm font-black text-slate-900 dark:text-white">Active Installed Workspace Extensions</h3>
          {installedItems.length === 0 ? (
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              No additional marketplace suites installed yet. Your workspace is operating on the 5 baseline core directors.
            </p>
          ) : (
            <div className="space-y-2">
              {installedItems.map((item, idx) => (
                <div key={idx} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 flex items-center justify-between text-xs font-bold">
                  <span>{item.title}</span>
                  <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1"><CheckCircle size={14} /> Installed</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
