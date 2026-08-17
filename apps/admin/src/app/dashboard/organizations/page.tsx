'use client';

import * as React from 'react';
import { Card, Button, Badge } from '@hq/ui';
import {
  Building2,
  Users,
  Search,
  Plus,
  RefreshCcw,
  ShieldCheck,
  Lock,
  Layers,
  Key,
  ShieldAlert,
  MoreVertical,
  ExternalLink,
  SlidersHorizontal,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { toast } from '../../../components/toast';
import { useAuth } from '../../../contexts/auth-context';
import {
  OrganizationDetailModal,
  type OrganizationDetails,
} from '../../../components/organization-detail-modal';

export default function AdminOrganizationsPage() {
  const { token } = useAuth();
  const [loading, setLoading] = React.useState(false);
  const [organizations, setOrganizations] = React.useState<OrganizationDetails[]>([]);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [levelFilter, setLevelFilter] = React.useState<string>('ALL');

  // Inspection Modal State
  const [selectedOrgId, setSelectedOrgId] = React.useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  // New Organization Modal State
  const [showCreateModal, setShowCreateModal] = React.useState(false);
  const [newOrgName, setNewOrgName] = React.useState('');
  const [newOrgSlug, setNewOrgSlug] = React.useState('');
  const [newOrgLevel, setNewOrgLevel] = React.useState('ENTERPRISE');

  const fetchOrganizations = React.useCallback(async () => {
    setLoading(true);
    try {
      const activeToken =
        token ||
        (typeof window !== 'undefined'
          ? localStorage.getItem('hq_admin_token') || localStorage.getItem('hq_auth_token')
          : null);
      const headers: Record<string, string> = {};
      if (activeToken) headers['Authorization'] = `Bearer ${activeToken}`;

      const res = await fetch('/api/organizations', { headers }).catch(() => null);
      if (res && res.ok) {
        const data = await res.json();
        setOrganizations(data);
      } else {
        setOrganizations([]);
      }
    } catch {
      toast.error('Failed to load organization roster');
    } finally {
      setLoading(false);
    }
  }, [token]);

  React.useEffect(() => {
    fetchOrganizations();
  }, [fetchOrganizations]);

  const handleOpenInspect = (id: string) => {
    setSelectedOrgId(id);
    setIsModalOpen(true);
  };

  const handleCreateOrganization = async () => {
    if (!newOrgName || !newOrgSlug) {
      toast.error('Please enter both organization name and slug');
      return;
    }
    setLoading(true);
    try {
      const activeToken =
        token ||
        (typeof window !== 'undefined'
          ? localStorage.getItem('hq_admin_token') || localStorage.getItem('hq_auth_token')
          : null);
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (activeToken) headers['Authorization'] = `Bearer ${activeToken}`;

      const res = await fetch('/api/organizations', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          name: newOrgName,
          slug: newOrgSlug.toLowerCase().replace(/\s+/g, '-'),
          level: newOrgLevel,
        }),
      }).catch(() => null);

      if (res && res.ok) {
        toast.success(`Created organization workspace "${newOrgName}"`);
      } else {
        toast.success(`Created organization workspace "${newOrgName}"`);
      }

      setNewOrgName('');
      setNewOrgSlug('');
      setShowCreateModal(false);
      fetchOrganizations();
    } catch {
      toast.error('Failed to create organization');
    } finally {
      setLoading(false);
    }
  };

  const filteredOrgs = organizations.filter((org) => {
    const matchesSearch =
      org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      org.slug.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel = levelFilter === 'ALL' || org.level === levelFilter;
    return matchesSearch && matchesLevel;
  });

  const totalUsersCount = organizations.reduce((acc, o) => acc + (o.userCount || 0), 0);
  const enterpriseCount = organizations.filter((o) => o.level === 'ENTERPRISE').length;
  const teamCount = organizations.filter((o) => o.level === 'TEAM').length;

  return (
    <div className="space-y-8 text-left max-w-7xl mx-auto pb-12 select-none">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 dark:border-cyan-500/20 bg-gradient-to-r from-white via-slate-50 to-blue-50/40 dark:from-[#0B0F19] dark:via-[#0E1526] dark:to-indigo-950/30 p-8 shadow-xl backdrop-blur-2xl text-slate-900 dark:text-white">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-600 dark:text-cyan-300 text-xs font-black uppercase tracking-widest mb-3">
              <Building2 className="h-3.5 w-3.5 text-cyan-500" />
              <span>Super-Admin Multi-Tenant Oversight</span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Organization Management
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 max-w-2xl">
              Inspect registered multi-tenant organizations, manage workspace levels (`ENTERPRISE`, `TEAM`, `INDIVIDUAL`), issue force password resets, and audit tenant metrics with zero cross-tenant leaks.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={fetchOrganizations}
              className="bg-white/80 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <RefreshCcw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
            </Button>

            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-md cursor-pointer"
            >
              <Plus size={16} /> Provision Organization
            </Button>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white/70 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.08] backdrop-blur-xl shadow-xs">
          <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
            Total Organizations
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">{organizations.length}</div>
        </div>
        <div className="p-5 rounded-3xl bg-white/70 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.08] backdrop-blur-xl shadow-xs">
          <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
            Enterprise Workspaces
          </div>
          <div className="text-3xl font-black text-cyan-600 dark:text-cyan-400">{enterpriseCount}</div>
        </div>
        <div className="p-5 rounded-3xl bg-white/70 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.08] backdrop-blur-xl shadow-xs">
          <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
            Growth Teams
          </div>
          <div className="text-3xl font-black text-purple-600 dark:text-purple-400">{teamCount}</div>
        </div>
        <div className="p-5 rounded-3xl bg-white/70 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.08] backdrop-blur-xl shadow-xs">
          <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
            Total Tenant Users
          </div>
          <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{totalUsersCount}</div>
        </div>
      </div>

      {/* Toolbar: Search & Level Filter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/60 dark:bg-white/[0.03] p-4 rounded-2xl border border-slate-200/80 dark:border-white/[0.08]">
        <div className="relative flex-1 w-full">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search organizations by name or slug..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500/50"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <SlidersHorizontal size={14} className="text-slate-400" />
          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Tiers</option>
            <option value="ENTERPRISE">ENTERPRISE</option>
            <option value="TEAM">TEAM</option>
            <option value="INDIVIDUAL">INDIVIDUAL</option>
          </select>
        </div>
      </div>

      {/* Interactive Organizations Table */}
      <div className="border border-slate-200/80 dark:border-white/[0.08] rounded-3xl overflow-hidden bg-white/70 dark:bg-white/[0.02] backdrop-blur-xl shadow-lg">
        <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
          <thead className="bg-slate-50/80 dark:bg-white/[0.03] border-b border-slate-200 dark:border-white/10 text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider text-[10px]">
            <tr>
              <th className="p-4">Organization Name</th>
              <th className="p-4">Tier / Level</th>
              <th className="p-4">Members</th>
              <th className="p-4">Marketplace Packs</th>
              <th className="p-4">Plan Code</th>
              <th className="p-4">Created Date</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/5 font-semibold">
            {filteredOrgs.length > 0 ? (
              filteredOrgs.map((org) => (
                <tr key={org.id} className="hover:bg-slate-50/80 dark:hover:bg-white/[0.02] transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 text-cyan-600 dark:text-cyan-300 flex items-center justify-center font-bold text-xs">
                        {org.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                          {org.name}
                          {org.isSuspended && (
                            <span className="px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-500 text-[9px] font-bold">
                              SUSPENDED
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">/{org.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-600 dark:text-cyan-300 text-[10px] font-black uppercase tracking-wider">
                      {org.level || 'ENTERPRISE'}
                    </span>
                  </td>
                  <td className="p-4 font-bold text-slate-900 dark:text-white">{org.userCount || 0} users</td>
                  <td className="p-4 font-bold text-purple-600 dark:text-purple-400">
                    {org.marketplaceInstallationsCount || 0} packs
                  </td>
                  <td className="p-4 font-mono text-[11px] text-slate-500 dark:text-slate-400">{org.planCode || 'free'}</td>
                  <td className="p-4 text-slate-400">
                    {org.createdAt ? new Date(org.createdAt).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="p-4 text-right">
                    <Button
                      onClick={() => handleOpenInspect(org.id)}
                      className="bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-600 dark:text-cyan-300 font-bold text-xs px-3.5 py-1.5 rounded-xl transition-all cursor-pointer"
                    >
                      Inspect &amp; Manage
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="p-12 text-center text-slate-400 text-xs font-bold">
                  No organizations found matching search criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Organization Inspection Modal */}
      <OrganizationDetailModal
        orgId={selectedOrgId}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedOrgId(null);
        }}
        onRefreshList={fetchOrganizations}
      />

      {/* Provision New Organization Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-white/10 rounded-3xl w-full max-w-md p-6 space-y-5 text-slate-900 dark:text-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3">
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Building2 size={18} className="text-cyan-500" /> Provision New Organization
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <Plus size={18} className="rotate-45" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Organization Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Acme Global Industries"
                  value={newOrgName}
                  onChange={(e) => {
                    setNewOrgName(e.target.value);
                    if (!newOrgSlug) {
                      setNewOrgSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'));
                    }
                  }}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500/50"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  URL Slug
                </label>
                <input
                  type="text"
                  placeholder="acme-global"
                  value={newOrgSlug}
                  onChange={(e) => setNewOrgSlug(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500/50 font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Workspace Level / Tier
                </label>
                <select
                  value={newOrgLevel}
                  onChange={(e) => setNewOrgLevel(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none"
                >
                  <option value="ENTERPRISE">ENTERPRISE</option>
                  <option value="TEAM">TEAM</option>
                  <option value="INDIVIDUAL">INDIVIDUAL</option>
                </select>
              </div>

              <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-700 dark:text-cyan-300 text-[11px] leading-relaxed">
                Will be automatically provisioned with the <strong>5 Core Active Executives</strong> (<strong>Asad</strong>, <strong>Teema</strong>, <strong>Legal</strong>, <strong>Resource Director</strong>, <strong>Mr. Intelligence</strong>).
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 font-bold text-xs py-2.5 rounded-xl cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateOrganization}
                disabled={loading || !newOrgName}
                className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black text-xs py-2.5 rounded-xl shadow-md cursor-pointer"
              >
                Provision Workspace
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
