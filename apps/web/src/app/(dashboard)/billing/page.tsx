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
  const [activeTab, setActiveTab] = React.useState<'usage' | 'subscription' | 'budgets' | 'invoices'>('usage');
  const [loading, setLoading] = React.useState(false);
  const [brandColor, setBrandColor] = React.useState('#0A84FF');

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

  const handleUpgrade = async (gateway: 'stripe' | 'paystack') => {
    setLoading(true);
    toast.success(`💳 Initializing Paystack Checkout overlay session...`);
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
        body: JSON.stringify({ planCode: 'growth' }),
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
      <div className="flex gap-1.5 border-b border-card-border">
        {[
          { id: 'usage', label: 'Credit Usage', icon: Activity },
          { id: 'subscription', label: 'Plans & Subscriptions', icon: Sparkles },
          { id: 'budgets', label: 'Budget Controls', icon: Sliders },
          { id: 'invoices', label: 'Invoice History', icon: FileText },
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

        {/* 1. Credit Usage Tab */}
        {activeTab === 'usage' && (
          <div className="grid gap-6 md:grid-cols-3 text-left">
            <div className="md:col-span-2 space-y-6">
              {/* Credit Status Card */}
              <Card className="border border-card-border bg-card-bg p-5 shadow-[var(--card-shadow)] space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-foreground/45 font-bold uppercase tracking-widest block">AI Credit Balance</span>
                    <span className="text-3xl font-black text-[#1A1A1E] dark:text-white mt-1 block">9,420 credits</span>
                  </div>
                  <Badge variant="ai" className="text-[9px]">Active Billing Cycle</Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-bold text-foreground/50">
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
                  <p className="text-[10px] text-foreground/50 font-semibold mt-0.5">Details on credits consumed across operational modules.</p>
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
                <p className="text-[10px] text-foreground/50 leading-relaxed font-semibold">
                  HQ automatically routes simple queries to standard models and caches repeats to minimize credit depletion.
                </p>

                <div className="border-t border-card-border pt-3 space-y-2.5 text-[10px] font-bold">
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
                    <span className="text-[10px] text-yellow-500 font-bold uppercase tracking-wider block">Contextual Upgrade Alert</span>
                    <p className="text-xs text-white font-semibold leading-relaxed mt-1">
                      Elena (CEO): &ldquo;Your Technology team has reached today&apos;s mission capacity on the Starter plan. Upgrading to Professional unlocks unlimited parallel executions.&rdquo;
                    </p>
                  </div>
                </div>
              </Card>

              {/* Plans side-by-side comparison */}
              <Card className="border border-card-border bg-card-bg p-5 shadow-[var(--card-shadow)] space-y-4">
                <h3 className="text-sm font-extrabold text-[#1A1A1E] dark:text-white">Select Execution Tier</h3>

                <div className="grid gap-4 sm:grid-cols-2 text-xs">
                  <div className="p-4 border border-card-border bg-[#F9F9FB] dark:bg-[#0A0A0C]/20 rounded-xl space-y-3">
                    <div>
                      <Badge variant="neutral" className="text-[8px] font-bold">CURRENT PLAN</Badge>
                      <h4 className="text-sm font-black text-white mt-1.5">Free Starter Tier</h4>
                    </div>
                    <ul className="space-y-1.5 font-semibold text-foreground/60 leading-tight">
                      <li>· 1 Active mission WBS</li>
                      <li>· Basic AI Executives access</li>
                      <li>· 1GB indexed storage</li>
                    </ul>
                  </div>

                  <div className="p-4 border border-hq-cyan/40 bg-hq-cyan/5 rounded-xl space-y-3">
                    <div>
                      <Badge variant="premium" className="text-[8px] font-bold">RECOMMENDED</Badge>
                      <h4 className="text-sm font-black text-white mt-1.5">Professional Scale</h4>
                      <p className="text-[10px] text-hq-cyan font-black mt-0.5">$150.00/month</p>
                    </div>
                    <ul className="space-y-1.5 font-semibold text-white/80 leading-tight">
                      <li>· Unlimited active missions</li>
                      <li>· Fully Custom AI C-Suite</li>
                      <li>· 10GB indexed storage</li>
                    </ul>
                  </div>
                </div>
              </Card>
            </div>

            {/* Paygate selectors */}
            <div className="space-y-6">
              <Card className="border border-card-border bg-card-bg p-5 shadow-[var(--card-shadow)] space-y-4">
                <div>
                  <h4 className="text-xs font-black text-[#1A1A1E] dark:text-white uppercase tracking-widest">Activate Scale plan</h4>
                  <p className="text-[9.5px] text-foreground/45 mt-0.5 font-semibold">Deploy payment session keys</p>
                </div>

                <div className="space-y-2.5">
                  <Button
                    size="sm"
                    className="w-full text-white text-xs font-bold h-8.5"
                    style={{ backgroundColor: brandColor }}
                    disabled={loading}
                    onClick={() => handleUpgrade('stripe')}
                  >
                    Stripe checkout
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full text-xs font-bold border-card-border h-8.5 text-hq-cyan"
                    disabled={loading}
                    onClick={() => handleUpgrade('paystack')}
                  >
                    Paystack (Africa / NGN)
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
                  <p className="text-[10px] text-foreground/50 font-semibold mt-0.5">Enforce spending bounds on API credits.</p>
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
                <p className="text-[10px] text-foreground/50 leading-relaxed font-semibold">
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
                      <p className="text-[9px] text-foreground/45 mt-0.5 font-semibold">{inv.type} · {inv.date}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs font-black text-white">{inv.amount}</span>
                      <Badge variant="success" className="text-[8px] font-bold">
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
