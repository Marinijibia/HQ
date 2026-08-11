'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Button, Badge, Input } from '@hq/ui';
import {
  CreditCard,
  ArrowUpRight,
  CheckCircle2,
  ShieldAlert,
  Sparkles,
  DollarSign,
  Activity,
  Sliders,
  FileText,
  TrendingUp,
  Download,
  Info,
  Layers,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../../contexts/auth-context';
import { toast } from '../../../components/toast';

interface Invoice {
  id: string;
  amount: string;
  status: 'Paid' | 'Pending';
  date: string;
  type: string;
}

interface CostCenter {
  name: string;
  percentage: number;
  credits: number;
}

export default function BillingPage() {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = React.useState<'usage' | 'subscription' | 'budgets' | 'invoices' | 'circle'>('usage');
  const [loading, setLoading] = React.useState(false);
  const [brandColor, setBrandColor] = React.useState('#0A84FF');

  // Circle Agentic Payments State
  const [usdcBalance, setUsdcBalance] = React.useState(25000.0);
  const [usdcCap] = React.useState(500.0);
  const [circleLoading, setCircleLoading] = React.useState(false);
  const [circleTransactions, setCircleTransactions] = React.useState<any[]>([
    {
      id: 'ctx_circle_001',
      txHash: '0xa4e98f7210b9d88a1c903ef88d011f01c9b2e652a',
      amountUsdc: 150.0,
      vendorName: 'AWS Compute Cluster Proxy',
      serviceDescription: 'Auto-scaled GPU cluster allocation for campaign rendering',
      executiveRole: 'Teema (Ops Director & CoS)',
      status: 'COMPLETED',
      timestamp: '2 hours ago',
    },
    {
      id: 'ctx_circle_002',
      txHash: '0x3f1a9d82e401b9a7c88d012e543b1109a8f7612c',
      amountUsdc: 45.5,
      vendorName: 'SerpAPI Data Oracle',
      serviceDescription: 'Market intelligence data feed query settlement',
      executiveRole: 'Legal (Compliance Director)',
      status: 'COMPLETED',
      timestamp: '8 hours ago',
    },
  ]);

  const handleSimulateCirclePayment = async () => {
    setCircleLoading(true);
    toast.info('⚡ Initiating Circle Agentic USDC Autonomous Settlement...');
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/billing/circle/execute-payment', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          amountUsdc: 85.0,
          vendorName: 'Vercel Edge Network Node',
          serviceDescription: 'Instant serverless bandwidth allocation for AI Boardroom API',
          executiveRole: 'Teema (Ops Director & CoS)',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setUsdcBalance((prev) => prev - 85.0);
        setCircleTransactions((prev) => [
          {
            id: data.transactionId,
            txHash: data.txHash,
            amountUsdc: data.amountUsdc,
            vendorName: data.vendorName,
            serviceDescription: data.serviceDescription,
            executiveRole: data.executiveRole,
            status: data.status,
            timestamp: 'Just now',
          },
          ...prev,
        ]);
        toast.success(`🎉 Circle USDC Agentic Payment Settled! Tx: ${data.txHash.slice(0, 10)}...`);
      } else {
        const errData = await res.json();
        toast.error(`❌ Circle Payment Failed: ${errData.message || 'Error executing payment'}`);
      }
    } catch {
      toast.error('❌ Failed to execute Circle Agentic payment.');
    } finally {
      setCircleLoading(false);
    }
  };

  // Budget settings state
  const [monthlyCap, setMonthlyCap] = React.useState('500.00');
  const [warningThreshold, setWarningThreshold] = React.useState('80');
  const [missionThreshold, setMissionThreshold] = React.useState('1500');

  // Invoices list state
  const [invoices, setInvoices] = React.useState<Invoice[]>([
    { id: 'INV-001', amount: '$0.00', status: 'Paid', date: 'Jul 01, 2026', type: 'Free Starter Reset' },
    { id: 'INV-002', amount: '$150.00', status: 'Paid', date: 'Jun 01, 2026', type: 'Professional Subscription' },
    { id: 'INV-003', amount: '$45.00', status: 'Paid', date: 'May 12, 2026', type: 'Credit Pack (5,000)' },
  ]);

  // Dynamic cost allocation statistics
  const costCenters: CostCenter[] = [
    { name: 'Mission Execution', percentage: 46, credits: 4333 },
    { name: 'Research & Search', percentage: 22, credits: 2072 },
    { name: 'AI Conversations', percentage: 18, credits: 1695 },
    { name: 'Knowledge Indexing', percentage: 14, credits: 1320 },
  ];

  React.useEffect(() => {
    const draft = localStorage.getItem('hq_onboarding_draft');
    if (draft) {
      try {
        const d = JSON.parse(draft);
        if (d.brandColor) setBrandColor(d.brandColor);
      } catch { /* ignore */ }
    }
  }, []);

  const loadPaystackScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if ((window as any).PaystackPop) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://js.paystack.co/v1/inline.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleUpgrade = async (planCode: string = 'growth', gateway: 'stripe' | 'paystack' = 'paystack') => {
    setLoading(true);
    toast.success(`💳 Initializing checkout session for ${planCode.toUpperCase()} ($)...`);
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const response = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers,
        body: JSON.stringify({ planCode }),
      });
      const data = await response.json();

      if (data.reference?.startsWith('pay_mock_')) {
        toast.info('🧪 Simulating Paystack inline card checkout popup...');
        setTimeout(async () => {
          const verifyRes = await fetch('/api/billing/verify', {
            method: 'POST',
            headers,
            body: JSON.stringify({ reference: data.reference }),
          });
          if (verifyRes.ok) {
            toast.success('🎉 Subscription active! Growth plan entitlement verified.');
          }
          setLoading(false);
        }, 1500);
        return;
      }

      const scriptLoaded = await loadPaystackScript();
      if (!scriptLoaded) {
        toast.error('❌ Failed to load Paystack payment script.');
        setLoading(false);
        return;
      }

      const paystackPop = (window as any).PaystackPop;
      const handler = paystackPop.setup({
        key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || 'pk_test_mock_keys',
        email: 'billing@hq-corp.com',
        amount: 2500000,
        ref: data.reference,
        onClose: () => {
          toast.warning('⚠️ Checkout closed.');
          setLoading(false);
        },
        callback: async (response: any) => {
          toast.success('💳 Payment successful! Verifying reference...');
          const verifyRes = await fetch('/api/billing/verify', {
            method: 'POST',
            headers,
            body: JSON.stringify({ reference: response.reference }),
          });
          if (verifyRes.ok) {
            toast.success('🎉 Subscription active! Growth plan entitlement verified.');
          }
          setLoading(false);
        },
      });
      handler.openIframe();
    } catch (error) {
      toast.error('❌ Payment initialization failed.');
      setLoading(false);
    }
  };

  const handleSaveBudgets = () => {
    toast.success('✨ Budget ceilings and spending caps updated successfully');
  };

  const handleDownloadInvoice = (invId: string) => {
    toast.success(`📄 Downloading PDF invoice: ${invId}`);
  };

  return (
    <div className="space-y-8 select-none text-foreground pb-12">
      {/* Page Header */}
      <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0 border-b border-card-border pb-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#1A1A1E] dark:text-white flex items-center gap-2">
            <CreditCard className="h-8 w-8 text-hq-blue" />
            Billing & Subscriptions
          </h1>
          <p className="text-foreground/60 text-sm mt-1">
            Review subscription invoices, allocate credit budgets, monitor AI cost-optimizations, and purchase credits.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 border-b border-card-border overflow-x-auto">
        {[
          { id: 'usage', label: 'Credit Usage', icon: Activity },
          { id: 'subscription', label: 'Plans & Subscriptions', icon: Sparkles },
          { id: 'circle', label: 'Circle USDC Agentic Treasury', icon: DollarSign },
          { id: 'budgets', label: 'Budget Controls', icon: Sliders },
          { id: 'invoices', label: 'Invoice History', icon: FileText },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-current text-white'
                  : 'border-transparent text-foreground/55 hover:text-foreground'
              }`}
              style={activeTab === tab.id ? { borderColor: brandColor, color: brandColor } : {}}
            >
              <Icon className="h-3.5 w-3.5" />
              {tab.label}
              {tab.id === 'circle' && (
                <Badge variant="outline" className="ml-1 text-[9px] bg-emerald-500/10 border-emerald-500/30 text-emerald-400">
                  50K Prize Ready
                </Badge>
              )}
            </button>
          );
        })}
      </div>

      {/* ─── Tab Content ────────────────────────────────────────────────────── */}
      <div className="space-y-6">

        {/* Circle USDC Agentic Treasury Tab */}
        {activeTab === 'circle' && (
          <div className="space-y-6 text-left animate-in fade-in duration-300">
            {/* Header Banner */}
            <Card className="border border-emerald-500/30 bg-gradient-to-r from-emerald-950/20 via-card-bg to-cyan-950/20 p-6 shadow-xl relative overflow-hidden">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/40 text-[10px] uppercase tracking-widest font-black">
                      CIRCLE AGENTIC PAYMENTS PROTOCOL
                    </Badge>
                    <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/40 text-[10px] uppercase tracking-widest font-black">
                      BUILD WITH GEMINI XPRIZE
                    </Badge>
                  </div>
                  <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                    <DollarSign className="h-6 w-6 text-emerald-400" />
                    USDC Autonomous Executive Treasury
                  </h2>
                  <p className="text-xs text-foreground/70 max-w-2xl leading-relaxed">
                    Empowers C-Suite AI Executives (Teema Operations & Legal Director) to autonomously negotiate, sign, and settle vendor transactions in USDC without human friction.
                  </p>
                </div>

                <Button
                  onClick={handleSimulateCirclePayment}
                  disabled={circleLoading}
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs px-5 py-3 rounded-xl shadow-lg shadow-emerald-500/20 transition-all shrink-0 flex items-center gap-2"
                >
                  <Sparkles className="h-4 w-4" />
                  {circleLoading ? 'Executing Settlement...' : 'Simulate Agentic USDC Settlement ($85.00)'}
                </Button>
              </div>
            </Card>

            {/* Treasury KPI Grid */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="border border-card-border bg-card-bg p-5 shadow-[var(--card-shadow)]">
                <span className="text-[11px] font-bold text-foreground/50 uppercase tracking-widest block">USDC Treasury Vault</span>
                <div className="text-3xl font-black text-white mt-1 flex items-baseline gap-1">
                  ${usdcBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })} <span className="text-sm font-bold text-emerald-400">USDC</span>
                </div>
                <p className="text-[11px] text-foreground/45 mt-2 flex items-center gap-1 font-semibold">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> Circle Programmable Wallet Vault
                </p>
              </Card>

              <Card className="border border-card-border bg-card-bg p-5 shadow-[var(--card-shadow)]">
                <span className="text-[11px] font-bold text-foreground/50 uppercase tracking-widest block">CFO Autonomous Ceiling Limit</span>
                <div className="text-3xl font-black text-white mt-1">
                  ${usdcCap.toFixed(2)} <span className="text-sm font-bold text-cyan-400">USDC / Tx</span>
                </div>
                <p className="text-[11px] text-foreground/45 mt-2 font-semibold">
                  Requires Human Board Approval for &gt; $500.00 USDC
                </p>
              </Card>

              <Card className="border border-card-border bg-card-bg p-5 shadow-[var(--card-shadow)]">
                <span className="text-[11px] font-bold text-foreground/50 uppercase tracking-widest block">Network Settlement Layer</span>
                <div className="text-base font-black text-white mt-2">
                  Circle Agentic Protocol
                </div>
                <p className="text-[11px] text-emerald-400 mt-2 font-mono flex items-center gap-1">
                  ● Polygon / Solana / Arbitrum Testnet
                </p>
              </Card>
            </div>

            {/* Transaction Ledger Table */}
            <Card className="border border-card-border bg-card-bg p-5 shadow-[var(--card-shadow)] space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-white">Agent-to-Agent Autonomous USDC Ledger</h3>
                  <p className="text-xs text-foreground/50 font-semibold mt-0.5">Real-time audit record of autonomous transactions initiated by AI Directors.</p>
                </div>
                <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-mono">
                  Circle Webhook Verified
                </Badge>
              </div>

              <div className="border border-card-border rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-background/60 text-foreground/60 border-b border-card-border uppercase font-bold text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Transaction Hash</th>
                      <th className="py-3 px-4">Vendor / Service</th>
                      <th className="py-3 px-4">Executive Director</th>
                      <th className="py-3 px-4 text-right">Amount (USDC)</th>
                      <th className="py-3 px-4 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-card-border font-medium">
                    {circleTransactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-white/5 transition-colors">
                        <td className="py-3.5 px-4 font-mono text-cyan-400 flex items-center gap-1.5">
                          <span>{tx.txHash.slice(0, 14)}...</span>
                          <ArrowUpRight className="h-3 w-3 opacity-60" />
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-white block">{tx.vendorName}</span>
                          <span className="text-[11px] text-foreground/50 block">{tx.serviceDescription}</span>
                        </td>
                        <td className="py-3.5 px-4 text-foreground/80 font-semibold">
                          {tx.executiveRole}
                        </td>
                        <td className="py-3.5 px-4 text-right font-black text-emerald-400">
                          ${tx.amountUsdc.toFixed(2)} USDC
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[10px]">
                            {tx.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* 1. Credit Usage Tab */}
        {activeTab === 'usage' && (
          <div className="grid gap-6 md:grid-cols-3 text-left">
            <div className="md:col-span-2 space-y-6">
              {/* Credit Status Card */}
              <Card className="border border-card-border bg-card-bg p-5 shadow-[var(--card-shadow)] space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs text-foreground/45 font-bold uppercase tracking-widest block">AI Credit Balance</span>
                    <span className="text-3xl font-black text-[#1A1A1E] dark:text-white mt-1 block">9,420 credits</span>
                  </div>
                  <Badge variant="ai" className="text-xs">Active Billing Cycle</Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold text-foreground/50">
                    <span>Current usage tier: 94.2% remaining</span>
                    <span>10,000 total quota</span>
                  </div>
                  <div className="h-2 w-full bg-[#F9F9FB] dark:bg-[#0A0A0C] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-hq-blue rounded-full transition-all"
                      style={{ width: '94.2%', backgroundColor: brandColor }}
                    ></div>
                  </div>
                </div>
              </Card>

              {/* Dynamic Usage Breakdown Matrix */}
              <Card className="border border-card-border bg-card-bg p-5 shadow-[var(--card-shadow)] space-y-4">
                <div>
                  <h3 className="text-sm font-extrabold text-[#1A1A1E] dark:text-white">Monthly Credit Usage Analytics</h3>
                  <p className="text-xs text-foreground/50 font-semibold mt-0.5">Details on credits consumed across operational modules.</p>
                </div>

                <div className="space-y-3">
                  {costCenters.map((cc, i) => (
                    <div key={i} className="text-xs space-y-1.5">
                      <div className="flex justify-between font-bold">
                        <span className="text-foreground/70">{cc.name}</span>
                        <span className="text-white">{cc.credits.toLocaleString()} credits ({cc.percentage}%)</span>
                      </div>
                      <div className="h-1.5 w-full bg-[#F9F9FB] dark:bg-[#0A0A0C] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-hq-purple rounded-full"
                          style={{ width: `${cc.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* AI Cost Optimization panel */}
            <div className="space-y-6">
              <Card className="border border-card-border bg-card-bg p-5 shadow-[var(--card-shadow)] space-y-4">
                <h4 className="text-xs font-black text-[#1A1A1E] dark:text-white uppercase tracking-widest flex items-center gap-1.5">
                  <TrendingUp className="h-4 w-4 text-hq-cyan" />
                  AI Cost Optimization
                </h4>
                <p className="text-xs text-foreground/50 leading-relaxed font-semibold">
                  HQ automatically routes simple queries to standard models and caches repeats to minimize credit depletion.
                </p>

                <div className="border-t border-card-border pt-3 space-y-2.5 text-xs font-bold">
                  <div className="flex justify-between">
                    <span className="text-foreground/40">Cache Hit Rate</span>
                    <span className="text-white">32.4%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground/40">Low-Cost Routing Ratio</span>
                    <span className="text-white">68.2% (Gemini Flash)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground/40">Saved Credits Today</span>
                    <span className="text-green-500">420 credits</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* 2. Plans & Subscriptions Tab */}
        {activeTab === 'subscription' && (
          <div className="grid gap-6 md:grid-cols-3 text-left">
            <div className="md:col-span-2 space-y-6">
              {/* Upgrade Intelligence alerts */}
              <Card className="border border-yellow-500/20 bg-yellow-500/5 p-5 shadow-[var(--card-shadow)] space-y-4">
                <div className="flex items-start gap-3">
                  <ShieldAlert className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs text-yellow-500 font-bold uppercase tracking-wider block">Contextual Upgrade Alert</span>
                    <p className="text-xs text-white font-semibold leading-relaxed mt-1">
                      Asad (CEO): &ldquo;Your team has reached today&apos;s mission capacity on the Starter plan. Upgrading to Growth unlocks unlimited parallel executions.&rdquo;
                    </p>
                  </div>
                </div>
              </Card>

              {/* Plans side-by-side comparison */}
              <Card className="border border-card-border bg-card-bg p-5 shadow-[var(--card-shadow)] space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-extrabold text-[#1A1A1E] dark:text-white">Global Execution Tiers (USD $)</h3>
                    <p className="text-xs text-foreground/50 font-semibold mt-0.5">Select a subscription tier to expand your organization's monthly token quota.</p>
                  </div>
                  <Badge variant="outline" className="text-[10px] bg-cyan-500/10 text-cyan-400 border-cyan-500/30">
                    USD Global Pricing
                  </Badge>
                </div>

                <div className="grid gap-4 sm:grid-cols-3 text-xs">
                  {/* Starter Tier */}
                  <div className="p-4 border border-card-border bg-[#F9F9FB] dark:bg-[#0A0A0C]/40 rounded-2xl space-y-3 flex flex-col justify-between">
                    <div className="space-y-2">
                      <Badge variant="neutral" className="text-[10px] font-extrabold uppercase">STARTER TIER</Badge>
                      <h4 className="text-xl font-black text-white">$0.00 <span className="text-xs font-bold text-foreground/50">/ month</span></h4>
                      <p className="text-[11px] text-cyan-400 font-bold">5,000 AI Tokens / mo</p>
                      <ul className="space-y-1 text-[11px] font-medium text-foreground/60 leading-snug pt-1">
                        <li>· 1 Active Boardroom WBS</li>
                        <li>· Standard C-Suite Directors</li>
                        <li>· 1GB Indexed Memory Vault</li>
                      </ul>
                    </div>
                    <Button variant="outline" size="sm" className="w-full text-xs font-bold border-card-border mt-3" disabled>
                      Current Plan
                    </Button>
                  </div>

                  {/* Growth Tier */}
                  <div className="p-4 border border-cyan-500/40 bg-cyan-500/5 rounded-2xl space-y-3 flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-cyan-500 text-slate-950 text-[9px] font-black uppercase px-2.5 py-0.5 rounded-bl-lg">
                      POPULAR
                    </div>
                    <div className="space-y-2">
                      <Badge variant="premium" className="text-[10px] font-extrabold uppercase bg-cyan-500/20 text-cyan-300 border-cyan-500/40">GROWTH SCALE</Badge>
                      <h4 className="text-xl font-black text-white">$10.00 <span className="text-xs font-bold text-foreground/50">/ month</span></h4>
                      <p className="text-[11px] text-emerald-400 font-bold">50,000 AI Tokens / mo</p>
                      <ul className="space-y-1 text-[11px] font-medium text-white/80 leading-snug pt-1">
                        <li>· 5 Parallel Boardroom WBS</li>
                        <li>· Full C-Suite AI Roster</li>
                        <li>· 10GB Indexed Storage</li>
                        <li>· Circle USDC Agentic Wallet</li>
                      </ul>
                    </div>
                    <Button
                      size="sm"
                      className="w-full text-xs font-extrabold bg-cyan-500 hover:bg-cyan-400 text-slate-950 mt-3 shadow-md shadow-cyan-500/20"
                      disabled={loading}
                      onClick={() => handleUpgrade('growth')}
                    >
                      Upgrade to Growth ($10)
                    </Button>
                  </div>

                  {/* Enterprise Tier */}
                  <div className="p-4 border border-purple-500/40 bg-purple-500/5 rounded-2xl space-y-3 flex flex-col justify-between">
                    <div className="space-y-2">
                      <Badge className="text-[10px] font-extrabold uppercase bg-purple-500/20 text-purple-300 border-purple-500/40">ENTERPRISE OS</Badge>
                      <h4 className="text-xl font-black text-white">$20.00 <span className="text-xs font-bold text-foreground/50">/ month</span></h4>
                      <p className="text-[11px] text-purple-400 font-bold">200,000 AI Tokens / mo</p>
                      <ul className="space-y-1 text-[11px] font-medium text-white/80 leading-snug pt-1">
                        <li>· Unlimited WBS Missions</li>
                        <li>· Custom AI C-Suite Board</li>
                        <li>· 100GB Storage Vault</li>
                        <li>· 6-Tier Autonomy Killswitch</li>
                      </ul>
                    </div>
                    <Button
                      size="sm"
                      className="w-full text-xs font-extrabold bg-purple-600 hover:bg-purple-500 text-white mt-3 shadow-md shadow-purple-600/20"
                      disabled={loading}
                      onClick={() => handleUpgrade('enterprise')}
                    >
                      Upgrade Enterprise ($20)
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Extra Token Packs Section */}
              <Card className="border border-emerald-500/30 bg-emerald-950/10 p-5 shadow-[var(--card-shadow)] space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-extrabold text-white flex items-center gap-1.5">
                      <Sparkles className="h-4 w-4 text-emerald-400" />
                      Buy Extra AI Token Packs
                    </h3>
                    <p className="text-xs text-foreground/60 font-semibold mt-0.5">Need additional capacity? Top up your token balance instantly with non-expiring extra credits.</p>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 text-xs">
                  {/* Small Pack */}
                  <div className="p-4 border border-card-border bg-card-bg/60 rounded-2xl flex items-center justify-between">
                    <div>
                      <span className="text-base font-black text-white block">+25,000 AI Tokens</span>
                      <span className="text-xs text-emerald-400 font-bold">$5.00 USD</span>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs font-extrabold border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10"
                      disabled={loading}
                      onClick={() => handleUpgrade('token_pack_small')}
                    >
                      Buy $5 Pack
                    </Button>
                  </div>

                  {/* Large Pack */}
                  <div className="p-4 border border-card-border bg-card-bg/60 rounded-2xl flex items-center justify-between">
                    <div>
                      <span className="text-base font-black text-white block">+100,000 AI Tokens</span>
                      <span className="text-xs text-emerald-400 font-bold">$15.00 USD</span>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs font-extrabold border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10"
                      disabled={loading}
                      onClick={() => handleUpgrade('token_pack_large')}
                    >
                      Buy $15 Pack
                    </Button>
                  </div>
                </div>
              </Card>
            </div>

            {/* Paygate selectors */}
            <div className="space-y-6">
              <Card className="border border-card-border bg-card-bg p-5 shadow-[var(--card-shadow)] space-y-4">
                <div>
                  <h4 className="text-xs font-black text-[#1A1A1E] dark:text-white uppercase tracking-widest">Global USD Payment Gateway</h4>
                  <p className="text-[10px] text-foreground/45 mt-0.5 font-semibold">Select preferred payment provider</p>
                </div>

                <div className="space-y-2.5">
                  <Button
                    size="sm"
                    className="w-full text-white text-xs font-extrabold h-9 bg-hq-blue hover:bg-hq-blue/90"
                    disabled={loading}
                    onClick={() => handleUpgrade('growth')}
                  >
                    Stripe USD Card Checkout
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full text-xs font-extrabold border-card-border h-9 text-hq-cyan hover:bg-cyan-500/10"
                    disabled={loading}
                    onClick={() => handleUpgrade('growth')}
                  >
                    Paystack Global USD ($) Checkout
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* 3. Budget Controls Tab */}
        {activeTab === 'budgets' && (
          <div className="grid gap-6 md:grid-cols-3 text-left">
            <div className="md:col-span-2 space-y-6">
              {/* Spending ceilings inputs */}
              <Card className="border border-card-border bg-card-bg p-5 shadow-[var(--card-shadow)] space-y-4">
                <div>
                  <h3 className="text-sm font-extrabold text-[#1A1A1E] dark:text-white">Tenant Budget Ceilings</h3>
                  <p className="text-xs text-foreground/50 font-semibold mt-0.5">Enforce spending bounds on API credits.</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 text-xs">
                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground/75">Monthly Budget Cap ($)</label>
                    <Input
                      type="number"
                      value={monthlyCap}
                      onChange={e => setMonthlyCap(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground/75">Warning Threshold (%)</label>
                    <Input
                      type="number"
                      value={warningThreshold}
                      onChange={e => setWarningThreshold(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="font-semibold text-foreground/75">Mission Cost Hold Threshold (credits)</label>
                    <Input
                      type="number"
                      value={missionThreshold}
                      onChange={e => setMissionThreshold(e.target.value)}
                      placeholder="Missions costing more than this will halt and request owner review"
                    />
                  </div>
                </div>

                <Button
                  size="sm"
                  className="text-white text-xs font-bold h-8.5 gap-1.5"
                  style={{ backgroundColor: brandColor }}
                  onClick={handleSaveBudgets}
                >
                  Save Budget Ceilings
                </Button>
              </Card>
            </div>

            {/* Budgets explainability info box */}
            <div className="space-y-6">
              <Card className="border border-card-border bg-card-bg p-5 shadow-[var(--card-shadow)] space-y-4">
                <h4 className="text-xs font-black text-[#1A1A1E] dark:text-white uppercase tracking-widest flex items-center gap-1.5">
                  <Info className="h-4 w-4 text-hq-cyan" />
                  Budget Safeguards
                </h4>
                <p className="text-xs text-foreground/50 leading-relaxed font-semibold">
                  Missions exceeding the cost threshold are placed on automatic administrative hold. This stops loops or expensive context updates without owner consent.
                </p>
              </Card>
            </div>
          </div>
        )}

        {/* 4. Invoice History Tab */}
        {activeTab === 'invoices' && (
          <div className="grid gap-6 md:grid-cols-3 text-left">
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center justify-between border-b border-card-border pb-2">
                <h3 className="text-sm font-extrabold text-[#1A1A1E] dark:text-white">Active Subscription Invoices</h3>
              </div>

              <div className="space-y-3">
                {invoices.map((inv) => (
                  <Card key={inv.id} className="border border-card-border bg-card-bg p-4 shadow-[var(--card-shadow)] flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-black text-[#1A1A1E] dark:text-white">{inv.id}</p>
                      <p className="text-xs text-foreground/45 mt-0.5 font-semibold">{inv.type} · {inv.date}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs font-black text-white">{inv.amount}</span>
                      <Badge variant="success" className="text-sm font-bold">
                        {inv.status}
                      </Badge>
                      <button
                        onClick={() => handleDownloadInvoice(inv.id)}
                        className="text-foreground/35 hover:text-white p-1 rounded transition-colors"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
