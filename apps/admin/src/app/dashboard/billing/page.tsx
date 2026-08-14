'use client';

import * as React from 'react';
import { Card, Button, Badge, Input } from '@hq/ui';
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  ShieldAlert,
  ShieldCheck,
  Search,
  RefreshCw,
  Lock,
  Unlock,
  ArrowUpRight,
  PlusCircle,
  Activity,
  Layers,
  Building,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '../../../contexts/auth-context';
import { toast } from '../../../components/toast';

interface GlobalStats {
  masterCircleReserveUsdc: number;
  masterCircleWalletId: string;
  totalSystemUsdLiabilities: number;
  totalOrgWalletsCount: number;
  totalTransactions: number;
  grossVolumeUsd: number;
  depositVolume: number;
  subscriptionVolume: number;
  agentAutonomousVolume: number;
  activeSubCount: number;
  pastDueSubCount: number;
}

interface WalletTx {
  id: string;
  companyId: string;
  companyName: string;
  type: string;
  amountUsd: number;
  amountUsdc: number;
  vendorAddress: string | null;
  vendorName: string;
  circleTxId: string | null;
  blockchainTxHash: string | null;
  status: string;
  description: string;
  executiveRoleKey: string | null;
  createdAt: string;
}

interface OrgWallet {
  id: string;
  companyId: string;
  companyName: string;
  companySlug: string;
  balanceUsd: number;
  currency: string;
  status: string;
  updatedAt: string;
  allowances: {
    roleKey: string;
    monthlyLimit: number;
    currentMonthSpent: number;
    singleTxLimit: number;
    requireApprovalAbove: number;
  }[];
}

export default function AdminBillingPage() {
  const { token } = useAuth();
  const [stats, setStats] = React.useState<GlobalStats | null>(null);
  const [transactions, setTransactions] = React.useState<WalletTx[]>([]);
  const [wallets, setWallets] = React.useState<OrgWallet[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState<'feed' | 'directory'>('feed');

  // Filters & Search
  const [typeFilter, setTypeFilter] = React.useState<string>('ALL');
  const [searchQuery, setSearchQuery] = React.useState('');

  // Adjustment Modal State
  const [selectedOrg, setSelectedOrg] = React.useState<OrgWallet | null>(null);
  const [adjustAmount, setAdjustAmount] = React.useState('');
  const [adjustReason, setAdjustReason] = React.useState('');
  const [adjusting, setAdjusting] = React.useState(false);

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    try {
      const activeToken = token || (typeof window !== 'undefined' ? localStorage.getItem('hq_admin_token') : null);
      const headers: Record<string, string> = {};
      if (activeToken) headers['Authorization'] = `Bearer ${activeToken}`;

      const [statsRes, txRes, walletRes] = await Promise.all([
        fetch('/api/admin/billing/stats', { headers }).catch(() => null),
        fetch('/api/admin/billing/transactions?limit=100', { headers }).catch(() => null),
        fetch('/api/admin/billing/wallets', { headers }).catch(() => null),
      ]);

      if (statsRes && statsRes.ok) {
        const s = await statsRes.json();
        setStats(s);
      }

      if (txRes && txRes.ok) {
        const t = await txRes.json();
        if (Array.isArray(t)) setTransactions(t);
      }

      if (walletRes && walletRes.ok) {
        const w = await walletRes.json();
        if (Array.isArray(w)) setWallets(w);
      }
    } catch {
      toast.error('Failed to load global billing telemetry data.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleToggleFreeze = async (companyId: string, currentStatus: string) => {
    toast.info(`Updating wallet freeze status...`);
    try {
      const activeToken = token || (typeof window !== 'undefined' ? localStorage.getItem('hq_admin_token') : null);
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (activeToken) headers['Authorization'] = `Bearer ${activeToken}`;

      const res = await fetch(`/api/admin/billing/wallets/${companyId}/freeze`, {
        method: 'POST',
        headers,
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(`Wallet status updated to: ${data.status}`);
        setWallets((prev) =>
          prev.map((w) => (w.companyId === companyId ? { ...w, status: data.status } : w)),
        );
      } else {
        toast.error(`Freeze action failed: ${data.message || 'Error toggling wallet status'}`);
      }
    } catch {
      toast.error('Failed to update wallet freeze status.');
    }
  };

  const handleAdjustBalance = async () => {
    if (!selectedOrg || !adjustAmount || !adjustReason) {
      toast.error('Please enter a valid amount and audit reason.');
      return;
    }

    setAdjusting(true);
    try {
      const activeToken = token || (typeof window !== 'undefined' ? localStorage.getItem('hq_admin_token') : null);
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (activeToken) headers['Authorization'] = `Bearer ${activeToken}`;

      const amountUsd = parseFloat(adjustAmount);
      const res = await fetch(`/api/admin/billing/wallets/${selectedOrg.companyId}/adjust`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ amountUsd, reason: adjustReason }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(`Successfully adjusted wallet balance by $${amountUsd.toFixed(2)} USD!`);
        setSelectedOrg(null);
        setAdjustAmount('');
        setAdjustReason('');
        fetchData();
      } else {
        toast.error(`Adjustment failed: ${data.message || 'Error applying manual balance'}`);
      }
    } catch {
      toast.error('Failed to adjust wallet balance.');
    } finally {
      setAdjusting(false);
    }
  };

  const filteredTransactions = transactions.filter((tx) => {
    if (typeFilter !== 'ALL' && tx.type !== typeFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        tx.companyName.toLowerCase().includes(q) ||
        tx.vendorName.toLowerCase().includes(q) ||
        tx.description.toLowerCase().includes(q) ||
        (tx.circleTxId && tx.circleTxId.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 text-left animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Billing & Treasury 360° Oversight
            </h1>
            <Badge className="bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/40 text-[10px] font-extrabold gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
              ZERO INVISIBLE TRANSACTIONS
            </Badge>
          </div>
          <p className="text-slate-600 dark:text-slate-400 text-xs mt-1 font-medium">
            Super Admin real-time live audit stream, Master Circle USDC liquidity vault telemetry, and tenant wallet controls.
          </p>
        </div>

        <Button
          size="sm"
          variant="outline"
          onClick={fetchData}
          disabled={loading}
          className="text-xs font-bold gap-1.5 border-slate-200 dark:border-white/10"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Audit Stream
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Master Circle Vault */}
        <Card className="border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0A0B10]/80 p-4 shadow-lg">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
            Master Circle USDC Vault
          </span>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1 flex items-baseline gap-1">
            ${stats ? stats.masterCircleReserveUsdc.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '100,000.00'}{' '}
            <span className="text-xs font-bold text-emerald-500 dark:text-emerald-400">USDC</span>
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-2 flex items-center gap-1 font-medium">
            <ShieldCheck className="h-3 w-3 text-emerald-500 dark:text-emerald-400" /> Circle Developer On-Chain Vault
          </p>
        </Card>

        {/* System USD Liabilities */}
        <Card className="border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0A0B10]/80 p-4 shadow-lg">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
            Tenant Virtual USD Liabilities
          </span>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            ${stats ? stats.totalSystemUsdLiabilities.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '0.00'}{' '}
            <span className="text-xs font-bold text-cyan-500 dark:text-cyan-400">USD</span>
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-2 font-medium">
            Across {stats ? stats.totalOrgWalletsCount : 0} Active Tenant Wallets
          </p>
        </Card>

        {/* Gross Processed Volume */}
        <Card className="border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0A0B10]/80 p-4 shadow-lg">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
            Gross Processed Volume (GPV)
          </span>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            ${stats ? stats.grossVolumeUsd.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '0.00'}
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-2 font-medium">
            {stats ? stats.totalTransactions : 0} Total System Transactions
          </p>
        </Card>

        {/* Subscriptions Status */}
        <Card className="border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0A0B10]/80 p-4 shadow-lg">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
            Active Subscriptions
          </span>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1 flex items-baseline gap-2">
            <span>{stats ? stats.activeSubCount : 0} Active</span>
            {stats && stats.pastDueSubCount > 0 && (
              <span className="text-xs font-bold text-rose-500">({stats.pastDueSubCount} Past Due)</span>
            )}
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-2 font-medium">
            Stripe & Paystack Gateway Subscriptions
          </p>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-white/10 pb-3">
        <button
          onClick={() => setActiveTab('feed')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'feed'
              ? 'bg-cyan-500/10 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400 font-black'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
          }`}
        >
          Master Transaction Audit Feed ({filteredTransactions.length})
        </button>

        <button
          onClick={() => setActiveTab('directory')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'directory'
              ? 'bg-cyan-500/10 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400 font-black'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
          }`}
        >
          Tenant Organization Wallets ({wallets.length})
        </button>
      </div>

      {/* TAB 1: Live Master Audit Feed */}
      {activeTab === 'feed' && (
        <Card className="border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0A0B10]/80 p-5 shadow-xl space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
              <Input
                type="text"
                placeholder="Search by organization name, vendor, transaction ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-slate-50 dark:bg-slate-100 dark:bg-black/50 border-slate-200 dark:border-white/10 h-10 text-xs rounded-xl"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Filter Type:</span>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="bg-slate-50 dark:bg-slate-100 dark:bg-black/50 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white h-10 text-xs font-bold rounded-xl px-3"
              >
                <option value="ALL">All Event Types</option>
                <option value="DEPOSIT">Fiat Deposits</option>
                <option value="SUBSCRIPTION_PAYMENT">Subscription Payments</option>
                <option value="AGENT_PAYMENT">Circle Agent Autonomous Payments</option>
              </select>
            </div>
          </div>

          {/* Audit Table */}
          <div className="border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 dark:bg-slate-100 dark:bg-black/60 text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-white/10 uppercase font-black text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Organization</th>
                    <th className="py-3.5 px-4">Event Type</th>
                    <th className="py-3.5 px-4">Vendor / Description</th>
                    <th className="py-3.5 px-4">Executive / Role</th>
                    <th className="py-3.5 px-4 text-right">Amount ($ USD)</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                    <th className="py-3.5 px-4 text-right">Transaction Ref</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-white/10 font-medium">
                  {filteredTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-500 dark:text-slate-400 text-xs font-bold">
                        No transactions recorded in system audit feed yet.
                      </td>
                    </tr>
                  ) : (
                    filteredTransactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                        <td className="py-3.5 px-4">
                          <span className="font-extrabold text-slate-900 dark:text-white block">
                            {tx.companyName}
                          </span>
                          <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                            {tx.companyId.slice(0, 12)}...
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <Badge
                            className={`text-[10px] font-bold ${
                              tx.type === 'AGENT_PAYMENT'
                                ? 'bg-purple-500/20 text-purple-600 dark:text-purple-300 border-purple-500/30'
                                : tx.type === 'DEPOSIT'
                                ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border-emerald-500/30'
                                : 'bg-cyan-500/20 text-cyan-600 dark:text-cyan-300 border-cyan-500/30'
                            }`}
                          >
                            {tx.type}
                          </Badge>
                        </td>

                        <td className="py-3.5 px-4 max-w-xs">
                          <span className="font-bold text-slate-900 dark:text-white block truncate">
                            {tx.vendorName}
                          </span>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate">
                            {tx.description}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 font-bold">
                          {tx.executiveRoleKey ? `${tx.executiveRoleKey} (AI)` : 'System / Admin'}
                        </td>

                        <td className="py-3.5 px-4 text-right font-black text-slate-900 dark:text-white">
                          ${tx.amountUsd.toFixed(2)} USD
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <Badge className="bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[10px] font-bold">
                            {tx.status}
                          </Badge>
                        </td>

                        <td className="py-3.5 px-4 text-right font-mono text-xs">
                          <span className="text-cyan-600 dark:text-cyan-400 flex items-center justify-end gap-1">
                            {tx.circleTxId ? tx.circleTxId.slice(0, 12) + '...' : tx.id.slice(0, 12)}
                            <ArrowUpRight className="h-3 w-3" />
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      )}

      {/* TAB 2: Tenant Organization Wallets */}
      {activeTab === 'directory' && (
        <Card className="border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0A0B10]/80 p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                Tenant Organization Virtual Wallets
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Live virtual balances, executive spending limits, freeze overrides, and manual credit adjustments.
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {wallets.map((w) => (
              <Card
                key={w.id}
                className={`border p-4 shadow-md space-y-3 ${
                  w.status === 'FROZEN'
                    ? 'border-rose-500/50 bg-rose-500/5'
                    : 'border-slate-200 dark:border-white/10 bg-white dark:bg-slate-100 dark:bg-black/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">
                      {w.companyName}
                    </h4>
                    <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                      ID: {w.companyId.slice(0, 12)}...
                    </span>
                  </div>

                  <Badge
                    className={`text-[10px] font-bold ${
                      w.status === 'FROZEN'
                        ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-500/40'
                        : 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/40'
                    }`}
                  >
                    {w.status}
                  </Badge>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-100 dark:bg-black/60 rounded-xl border border-slate-200 dark:border-slate-100 dark:border-white/5 flex items-center justify-between">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">
                    Virtual USD Balance
                  </span>
                  <span className="text-lg font-black text-slate-900 dark:text-white">
                    ${w.balanceUsd.toFixed(2)} USD
                  </span>
                </div>

                {/* AI Executive Caps */}
                <div className="space-y-1 text-[11px]">
                  <span className="font-bold text-slate-500 dark:text-slate-400 block uppercase text-[9px] tracking-wider">
                    AI Agent Monthly Allowances:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {w.allowances.map((a) => (
                      <span
                        key={a.roleKey}
                        className="bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 px-2 py-0.5 rounded-md text-slate-700 dark:text-slate-300 font-mono text-[10px]"
                      >
                        {a.roleKey}: ${a.currentMonthSpent.toFixed(0)} / ${a.monthlyLimit.toFixed(0)}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Admin Actions */}
                <div className="flex items-center gap-2 border-t border-slate-200 dark:border-white/10 pt-3">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleToggleFreeze(w.companyId, w.status)}
                    className={`flex-1 text-[11px] font-extrabold h-8 gap-1 ${
                      w.status === 'FROZEN'
                        ? 'border-emerald-500/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10'
                        : 'border-rose-500/40 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10'
                    }`}
                  >
                    {w.status === 'FROZEN' ? (
                      <>
                        <Unlock className="h-3 w-3" /> Unfreeze Wallet
                      </>
                    ) : (
                      <>
                        <Lock className="h-3 w-3" /> Freeze Wallet
                      </>
                    )}
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedOrg(w)}
                    className="text-[11px] font-extrabold h-8 gap-1 border-cyan-500/40 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/10"
                  >
                    <PlusCircle className="h-3 w-3" /> Adjust Balance
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </Card>
      )}

      {/* ADJUSTMENT MODAL */}
      {selectedOrg && (
        <div className="fixed inset-0 z-50 bg-slate-100 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0A0B10] p-6 max-w-md w-full shadow-2xl space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Manual Balance Adjustment
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {selectedOrg.companyName}
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setSelectedOrg(null)}
                className="h-7 w-7 p-0 rounded-full"
              >
                ✕
              </Button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Adjustment Amount ($ USD)
                </label>
                <Input
                  type="number"
                  placeholder="e.g. 50 (Credit) or -25 (Debit)"
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-100 dark:bg-black/50 border-slate-200 dark:border-white/10 h-10 text-xs rounded-xl"
                />
                <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 block font-medium">
                  Use positive numbers to add credit (+50) or negative numbers to deduct (-25).
                </span>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Mandatory Audit Reason
                </label>
                <Input
                  type="text"
                  placeholder="e.g. Promotional credit grant / Customer refund"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-100 dark:bg-black/50 border-slate-200 dark:border-white/10 h-10 text-xs rounded-xl"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-slate-200 dark:border-white/10 pt-3">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setSelectedOrg(null)}
                className="text-xs font-bold h-9"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleAdjustBalance}
                disabled={adjusting || !adjustAmount || !adjustReason}
                className="bg-cyan-600 hover:bg-cyan-500 text-slate-900 dark:text-white font-bold text-xs h-9 px-4 rounded-xl"
              >
                {adjusting ? 'Applying...' : 'Apply Balance Adjustment'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
