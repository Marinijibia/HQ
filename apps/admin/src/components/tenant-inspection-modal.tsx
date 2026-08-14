'use client';

import * as React from 'react';
import { Card, Button, Badge, Input } from '@hq/ui';
import {
  Building2,
  Globe,
  Cpu,
  Zap,
  CreditCard,
  X,
  ShieldCheck,
  ShieldAlert,
  Plus,
  Sparkles,
  TrendingUp,
  UserCheck,
  Ban,
  CheckCircle,
} from 'lucide-react';
import { toast } from './toast';

export interface TenantData {
  id: string;
  name: string;
  domain?: string;
  industry?: string;
  plan: 'FREE_STARTER' | 'GROWTH_SCALE' | 'ENTERPRISE_OS' | string;
  status: 'Active' | 'Suspended';
  usersCount: number;
  tokensUsed: number;
  tokensLimit: number;
  executiveBreakdown?: {
    ceo: number;
    cto: number;
    cfo: number;
  };
}

interface TenantInspectionModalProps {
  tenant: TenantData;
  onClose: () => void;
  onUpdateTenant?: (updated: TenantData) => void;
}

export function TenantInspectionModal({
  tenant: initialTenant,
  onClose,
  onUpdateTenant,
}: TenantInspectionModalProps) {
  const [tenant, setTenant] = React.useState<TenantData>(initialTenant);
  const [loading, setLoading] = React.useState(false);

  const usagePercent = Math.min(
    Math.round((tenant.tokensUsed / (tenant.tokensLimit || 50000)) * 100),
    100
  );

  const handleInjectTokens = (amount: number) => {
    const updated = {
      ...tenant,
      tokensLimit: tenant.tokensLimit + amount,
    };
    setTenant(updated);
    if (onUpdateTenant) onUpdateTenant(updated);
    toast.success(`⚡ Injected +${amount.toLocaleString()} Extra AI Tokens to ${tenant.name}!`);
  };

  const handlePlanChange = (newPlan: string) => {
    let limit = 5000;
    if (newPlan === 'GROWTH_SCALE') limit = 50000;
    else if (newPlan === 'ENTERPRISE_OS') limit = 200000;

    const updated = {
      ...tenant,
      plan: newPlan,
      tokensLimit: limit,
    };
    setTenant(updated);
    if (onUpdateTenant) onUpdateTenant(updated);
    toast.success(`💳 Subscription Plan updated to "${newPlan}" for ${tenant.name}`);
  };

  const handleToggleStatus = () => {
    const newStatus = tenant.status === 'Active' ? 'Suspended' : 'Active';
    const updated = {
      ...tenant,
      status: newStatus as 'Active' | 'Suspended',
    };
    setTenant(updated);
    if (onUpdateTenant) onUpdateTenant(updated);
    if (newStatus === 'Suspended') {
      toast.error(`🚫 Tenant "${tenant.name}" has been Suspended.`);
    } else {
      toast.success(`✅ Tenant "${tenant.name}" is now Active.`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-2xl animate-in fade-in duration-300 select-none">
      <Card className="w-full max-w-2xl border border-card-border bg-white/95 dark:bg-[#0A0B10]/95 backdrop-blur-3xl p-6 rounded-3xl space-y-6 shadow-2xl text-left relative overflow-hidden flex flex-col max-h-[90vh]">
        {/* Top Glow Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-emerald-400" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30">
              <Building2 className="h-5 w-5 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                {tenant.name}
                <Badge
                  className={`text-[9px] font-black uppercase ${
                    tenant.status === 'Active'
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                  }`}
                >
                  {tenant.status}
                </Badge>
              </h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5 mt-0.5">
                <Globe className="h-3 w-3 text-cyan-400" />
                {tenant.domain || `${tenant.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.hq.netify.ng`}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto space-y-5 custom-scrollbar pr-1">
          {/* AI Token Consumption Meter & Breakdown */}
          <div className="bg-slate-100 dark:bg-black/50 border border-card-border p-5 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Cpu className="h-5 w-5 text-cyan-400 animate-pulse" />
                <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  AI Token Consumption Meter
                </h4>
              </div>
              <div className="flex items-center gap-2">
                {usagePercent >= 80 && (
                  <Badge className="bg-amber-500/10 border-amber-500/30 text-amber-400 text-[9px] font-bold">
                    ⚠️ QUOTA WARNING ({usagePercent}%)
                  </Badge>
                )}
                <span className="text-xs font-mono font-bold text-cyan-300">
                  {tenant.tokensUsed?.toLocaleString()} / {tenant.tokensLimit?.toLocaleString()} Tokens
                </span>
              </div>
            </div>

            {/* Token Progress Bar */}
            <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-200 dark:border-white/10">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  usagePercent >= 90
                    ? 'bg-rose-500'
                    : usagePercent >= 80
                    ? 'bg-amber-400'
                    : 'bg-gradient-to-r from-cyan-400 to-purple-500'
                }`}
                style={{ width: `${usagePercent}%` }}
              />
            </div>

            {/* Executive Role Consumption Breakdown */}
            <div className="grid grid-cols-3 gap-3 pt-2 text-xs">
              <div className="p-3 bg-white/80 dark:bg-slate-900/80 border border-slate-800 rounded-xl space-y-1">
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase block">CEO Elena Agent</span>
                <span className="text-sm font-black text-cyan-300 font-mono">
                  {(tenant.executiveBreakdown?.ceo || Math.round(tenant.tokensUsed * 0.45)).toLocaleString()} tokens
                </span>
              </div>
              <div className="p-3 bg-white/80 dark:bg-slate-900/80 border border-slate-800 rounded-xl space-y-1">
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase block">CTO Hiroshi Agent</span>
                <span className="text-sm font-black text-purple-300 font-mono">
                  {(tenant.executiveBreakdown?.cto || Math.round(tenant.tokensUsed * 0.35)).toLocaleString()} tokens
                </span>
              </div>
              <div className="p-3 bg-white/80 dark:bg-slate-900/80 border border-slate-800 rounded-xl space-y-1">
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase block">CFO Sophia Agent</span>
                <span className="text-sm font-black text-emerald-300 font-mono">
                  {(tenant.executiveBreakdown?.cfo || Math.round(tenant.tokensUsed * 0.20)).toLocaleString()} tokens
                </span>
              </div>
            </div>

            {/* Super-Admin Token Top-Up Allocation Buttons */}
            <div className="pt-2 border-t border-slate-200 dark:border-white/10 flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Inject Extra AI Token Capacity:
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleInjectTokens(25000)}
                  className="px-3 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-bold hover:bg-cyan-500/20 flex items-center gap-1 transition-all"
                >
                  <Plus className="h-3.5 w-3.5" /> +25,000 Tokens
                </button>
                <button
                  type="button"
                  onClick={() => handleInjectTokens(100000)}
                  className="px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-bold hover:bg-purple-500/20 flex items-center gap-1 transition-all"
                >
                  <Sparkles className="h-3.5 w-3.5" /> +100,000 Tokens
                </button>
              </div>
            </div>
          </div>

          {/* Subscription Tier & Status Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-100 dark:bg-black/40 border border-card-border rounded-2xl space-y-3">
              <label className="text-[11px] font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                <CreditCard className="h-4 w-4" /> Subscription Plan Tier
              </label>
              <select
                value={tenant.plan}
                onChange={(e) => handlePlanChange(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-purple-500/40 text-purple-300 font-bold h-11 text-xs rounded-xl px-3 focus:outline-none focus:border-purple-400"
              >
                <option value="FREE_STARTER">Free Starter ($0/mo - 5k Tokens)</option>
                <option value="GROWTH_SCALE">Growth Scale ($10/mo - 50k Tokens)</option>
                <option value="ENTERPRISE_OS">Enterprise OS ($20/mo - 200k Tokens)</option>
              </select>
            </div>

            <div className="p-4 bg-slate-100 dark:bg-black/40 border border-card-border rounded-2xl space-y-3">
              <label className="text-[11px] font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                <Ban className="h-4 w-4" /> Tenant Access Status
              </label>
              <Button
                type="button"
                onClick={handleToggleStatus}
                className={`w-full h-11 text-xs font-black rounded-xl ${
                  tenant.status === 'Active'
                    ? 'bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20'
                    : 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                }`}
              >
                {tenant.status === 'Active' ? 'Suspend Tenant Access' : 'Reactivate Tenant Access'}
              </Button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-slate-200 dark:border-white/10 flex items-center justify-between">
          <Button
            type="button"
            onClick={() => {
              toast.info(`🚀 Launching Read-Only Impersonation Sandbox for "${tenant.name}" Boardroom...`);
              setTimeout(() => {
                const targetUrl = `http://localhost:3000/dashboard?impersonateTenantId=${tenant.id}&mode=read_only`;
                window.open(targetUrl, '_blank');
              }, 800);
            }}
            className="h-10 px-4 bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-slate-900 dark:text-white font-black text-xs rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="h-4 w-4" /> Inspect Boardroom Sandbox (Read-Only)
          </Button>

          <Button
            onClick={onClose}
            className="h-10 px-6 bg-white dark:bg-slate-900 hover:bg-slate-800 text-slate-900 dark:text-white font-bold text-xs rounded-xl border border-slate-700"
          >
            Close Inspection Window
          </Button>
        </div>
      </Card>
    </div>
  );
}
