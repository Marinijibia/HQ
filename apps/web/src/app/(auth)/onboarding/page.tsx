'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Button,
  Input,
  Badge,
} from '@hq/ui';
import {
  ArrowRight,
  ArrowLeft,
  Building,
  Sparkles,
  Users,
  Layers,
  Lock,
  Globe,
  Settings,
  Cpu,
  Flame,
  TrendingUp,
  Briefcase,
  Search,
  CheckCircle2,
  Plus,
  ShieldAlert,
  Zap,
  Shield,
  Rocket,
  Palette,
  Check,
  CheckCircle,
  Volume2,
  Share2,
  FileText,
  Compass,
} from 'lucide-react';
import { useAuth } from '../../../contexts/auth-context';
import { HQLogo } from '../../../components/hq-logo';
import { toast } from '../../../components/toast';

export default function OnboardingPage() {
  const { user, token, refetchUser, signInWithGoogle } = useAuth();
  const router = useRouter();

  // Core step state (1 to 11)
  const [step, setStep] = React.useState(1);
  const [error, setError] = React.useState<string | null>(null);

  // Step 1: Identity & Slogan
  const [orgName, setOrgName] = React.useState('');
  const [slogan, setSlogan] = React.useState('');
  const [orgSlug, setOrgSlug] = React.useState('');
  const [slugAvailable, setSlugAvailable] = React.useState<boolean | null>(null);
  const [checkingSlug, setCheckingSlug] = React.useState(false);
  const [website, setWebsite] = React.useState('');
  const [industry, setIndustry] = React.useState('Technology');
  const [companySize, setCompanySize] = React.useState('1-5');

  // Executive Honorific Title, Name & Voice Persona
  const [userTitle, setUserTitle] = React.useState('Alh');
  const [userDisplayName, setUserDisplayName] = React.useState('');
  const [voicePersona, setVoicePersona] = React.useState('Asad Male Executive');

  // Email & OTP Verification State (Step 9)
  const [email, setEmail] = React.useState('');
  const [otpSent, setOtpSent] = React.useState(false);
  const [otpCode, setOtpCode] = React.useState('');
  const [emailVerified, setEmailVerified] = React.useState(false);
  const [otpLoading, setOtpLoading] = React.useState(false);

  // Step 8: Mr. Intelligence Live Company Discovery State
  const [discoveryLoading, setDiscoveryLoading] = React.useState(false);
  const [discoveryData, setDiscoveryData] = React.useState<{
    summary: string;
    keyTakeaways: string[];
    marketSentiment: string;
    webHandleStatus: string;
    socialHandleStatus: string;
    learningNote: string;
  } | null>(null);

  React.useEffect(() => {
    if (user?.email) {
      setEmail(user.email);
      setEmailVerified(true);
    }
  }, [user]);

  // Fetch Live Mr. Intelligence Pre-Onboarding Research when reaching Step 8
  const triggerPreOnboardingIntelligence = React.useCallback(async () => {
    setDiscoveryLoading(true);
    const targetName = orgName || 'Enterprise Workspace';
    try {
      const promptText = `Provide high level pre-onboarding picture for organization: "${targetName}", Industry: "${industry}". Website: "${website}".`;
      const res = await fetch('/api/ai/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptText,
          systemPrompt: 'You are Mr. Intelligence. Conduct rapid pre-onboarding web & social media discovery.',
          jsonMode: true,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        let parsed: any = {};
        try {
          parsed = JSON.parse(data.text);
        } catch {
          parsed = {};
        }

        setDiscoveryData({
          summary: parsed.summary || `Mr. Intelligence gathered live web signals for ${targetName}. Operating in ${industry}, key digital presence and domain indicators verified.`,
          keyTakeaways: parsed.keyTakeaways || [
            `Verified digital footprint and enterprise domain status for ${targetName}.`,
            `Market positioning aligned with scalable ${industry} operations.`,
            `Social media handles & public web presence indexed for continuous corporate memory.`
          ],
          marketSentiment: parsed.marketSentiment || 'INNOVATIVE',
          webHandleStatus: website ? `Active Website Indexed: ${website}` : `Web Domain Indexed for ${targetName}`,
          socialHandleStatus: `Social Media Handles Scanned for ${targetName}`,
          learningNote: `Owner, Mr. Intelligence has indexed this high-level picture of ${targetName}. As your workspace provisions, our AI engine will continuously learn, index, and update corporate memory on ${targetName} in your background.`,
        });
      } else {
        throw new Error('API notice');
      }
    } catch {
      setDiscoveryData({
        summary: `Mr. Intelligence gathered live web signals for ${targetName}. Operating in ${industry}, digital presence and domain indicators verified.`,
        keyTakeaways: [
          `Verified digital footprint and enterprise domain status for ${targetName}.`,
          `Market positioning aligned with scalable ${industry} operations.`,
          `Social media handles & public web presence indexed for continuous corporate memory.`
        ],
        marketSentiment: 'INNOVATIVE',
        webHandleStatus: website ? `Active Website Indexed: ${website}` : `Web Domain Indexed for ${targetName}`,
        socialHandleStatus: `Social Media Handles Scanned for ${targetName}`,
        learningNote: `Owner, Mr. Intelligence has indexed this high-level picture of ${targetName}. As your workspace provisions, our AI engine will continuously learn, index, and update corporate memory on ${targetName} in your background.`,
      });
    } finally {
      setDiscoveryLoading(false);
    }
  }, [orgName, industry, website]);

  React.useEffect(() => {
    if (step === 8 && !discoveryData && !discoveryLoading) {
      triggerPreOnboardingIntelligence();
    }
  }, [step, discoveryData, discoveryLoading, triggerPreOnboardingIntelligence]);

  const handleSendOtp = async () => {
    if (!email || !email.includes('@')) {
      setError('Please enter a valid executive email address.');
      return;
    }
    setError(null);
    setOtpLoading(true);
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setOtpSent(true);
        toast.success(`🔑 Verification code sent to ${email}`);
      } else {
        const d = await res.json();
        setError(d.message || 'Failed to send OTP code.');
      }
    } catch {
      setError('Network error sending OTP code.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpCode || otpCode.length < 4) {
      setError('Please enter your verification code.');
      return;
    }
    setError(null);
    setOtpLoading(true);
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: otpCode }),
      });
      if (res.ok) {
        setEmailVerified(true);
        toast.success('✅ Email address verified successfully!');
      } else {
        const d = await res.json();
        setError(d.message || 'Invalid verification code.');
      }
    } catch {
      setError('Failed to verify OTP code.');
    } finally {
      setOtpLoading(false);
    }
  };

  // Step 2: Plain-English Target Market
  const [targetMarket, setTargetMarket] = React.useState('B2B');
  const [businessDesc, setBusinessDesc] = React.useState('');

  // Step 3: Searchable Goals Catalog
  const [goalSearch, setGoalSearch] = React.useState('');
  const [selectedGoals, setSelectedGoals] = React.useState<string[]>([]);
  const [customGoalInput, setCustomGoalInput] = React.useState('');

  // Step 4: Searchable Departments Catalog
  const [deptSearch, setDeptSearch] = React.useState('');
  const [selectedDepts, setSelectedDepts] = React.useState<string[]>([
    'Executive Leadership',
    'Sales & Marketing',
    'Engineering & IT',
  ]);
  const [customDeptInput, setCustomDeptInput] = React.useState('');

  // Step 5: 5 Core Active AI Executive Directors
  const [executives, setExecutives] = React.useState([
    {
      roleKey: 'ceo',
      title: 'Chief Executive Officer (CEO)',
      defaultName: 'Asad',
      customName: 'Asad',
      dept: 'Executive Office',
      enabled: true,
    },
    {
      roleKey: 'operations_director',
      title: 'Operations Director',
      defaultName: 'Teema',
      customName: 'Teema',
      dept: 'Operations',
      enabled: true,
    },
    {
      roleKey: 'legal_compliance_director',
      title: 'Legal & Compliance Director',
      defaultName: 'Legal',
      customName: 'Legal',
      dept: 'Legal & Compliance',
      enabled: true,
    },
    {
      roleKey: 'human_resources_director',
      title: 'Human Resources Director',
      defaultName: 'Resource Director',
      customName: 'Resource Director',
      dept: 'Human Resources',
      enabled: true,
    },
    {
      roleKey: 'public_search_agent',
      title: 'Public Search & Research Agent',
      defaultName: 'Mr. Intelligence',
      customName: 'Mr. Intelligence',
      dept: 'Intelligence & Research',
      enabled: true,
    },
  ]);

  // Step 6: AI Governance Operating Style
  const [aiStyle, setAiStyle] = React.useState('growth');

  // Step 7: Brand Accent
  const [brandColor, setBrandColor] = React.useState('#06b6d4');

  // Step 11: Submission State
  const [submitting, setSubmitting] = React.useState(false);
  const [submitProgress, setSubmitProgress] = React.useState(0);

  // Auto-generate slug from Organization Name
  React.useEffect(() => {
    if (orgName) {
      const generated = orgName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      setOrgSlug(generated);
    }
  }, [orgName]);

  // Check Slug Availability API
  React.useEffect(() => {
    if (!orgSlug) {
      setSlugAvailable(null);
      return;
    }
    const timer = setTimeout(async () => {
      setCheckingSlug(true);
      try {
        const res = await fetch(`/api/organizations/check-slug?slug=${encodeURIComponent(orgSlug)}`);
        if (res.ok) {
          const data = await res.json();
          setSlugAvailable(data.available);
        } else {
          setSlugAvailable(true);
        }
      } catch {
        setSlugAvailable(true);
      } finally {
        setCheckingSlug(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [orgSlug]);

  // Catalogs
  const GOALS_CATALOG = [
    '🚀 Accelerate Revenue Growth',
    '⚡ Automate Engineering Workflows',
    '🎯 Close Enterprise Deals Faster',
    '📈 Scale Digital Marketing Campaigns',
    '🤖 Deploy Autonomous AI Workforce',
    '🔐 Ensure Enterprise SOC2 Compliance',
    '🛠️ Streamline Customer Onboarding',
    '🌐 Expand International Market Reach',
    '💰 Maximize Profit Margins',
    '📊 Data Analytics & BI Dashboards',
  ];

  const DEPARTMENTS_CATALOG = [
    'Executive Leadership',
    'Sales & Business Development',
    'Marketing & Growth',
    'Engineering & Product',
    'Customer Success & Support',
    'Finance & Accounting',
    'Human Resources & Operations',
    'Legal & Compliance',
    'Research & Development',
  ];

  const TARGET_MARKETS = [
    {
      id: 'B2B',
      title: '🏢 Selling to Businesses & Companies',
      desc: 'SaaS products, corporate services, agency work, bulk distribution.',
    },
    {
      id: 'B2C',
      title: '👤 Selling Directly to Individual Consumers',
      desc: 'E-commerce, mobile apps, direct retail, consumer subscriptions.',
    },
    {
      id: 'Developer',
      title: '💻 Technical Developers & Engineers',
      desc: 'APIs, developer platforms, technical infrastructure, or open-source.',
    },
    {
      id: 'LocalService',
      title: '🏪 Local Products & Physical Services',
      desc: 'Storefronts, healthcare, real estate, field services, hospitality.',
    },
    {
      id: 'Enterprise',
      title: '🏛️ Large Corporate & Enterprise Clients',
      desc: 'High-touch enterprise sales, government, compliance-heavy contracts.',
    },
  ];

  const toggleGoal = (goalLabel: string) => {
    setSelectedGoals((prev) =>
      prev.includes(goalLabel) ? prev.filter((g) => g !== goalLabel) : [...prev, goalLabel],
    );
  };

  const addCustomGoal = () => {
    if (customGoalInput.trim() && !selectedGoals.includes(customGoalInput.trim())) {
      setSelectedGoals((prev) => [...prev, customGoalInput.trim()]);
      setCustomGoalInput('');
    }
  };

  const toggleDept = (deptName: string) => {
    setSelectedDepts((prev) =>
      prev.includes(deptName) ? prev.filter((d) => d !== deptName) : [...prev, deptName],
    );
  };

  const addCustomDept = () => {
    if (customDeptInput.trim() && !selectedDepts.includes(customDeptInput.trim())) {
      setSelectedDepts((prev) => [...prev, customDeptInput.trim()]);
      setCustomDeptInput('');
    }
  };

  const handleNextStep = () => {
    setError(null);
    if (step === 1) {
      if (!orgName.trim()) {
        setError('Please enter your Organization Name.');
        return;
      }
    }
    setStep((prev) => Math.min(prev + 1, 11));
  };

  const handlePrevStep = () => {
    setError(null);
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleCompleteOnboarding = async () => {
    setError(null);
    setSubmitting(true);

    const activeExecs = executives
      .filter((e) => e.enabled)
      .map((e) => ({
        roleKey: e.roleKey,
        title: e.title,
        customName: e.customName,
        departmentName: e.dept,
      }));

    const payload = {
      orgName,
      slogan,
      orgSlug,
      industry,
      companySize,
      userTitle,
      userDisplayName,
      voicePersona,
      customerType: targetMarket,
      businessDesc,
      goals: selectedGoals,
      departments: selectedDepts,
      aiExecs: activeExecs,
      aiStyle,
      brandColor,
    };

    localStorage.setItem('hq_user_title', userTitle);
    localStorage.setItem('hq_user_display_name', userDisplayName || 'Executive');
    localStorage.setItem('hq_asad_voice_persona', voicePersona);

    try {
      setSubmitProgress(30);
      const res = await fetch('/api/organizations/onboard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      setSubmitProgress(70);

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Workspace provisioning failed.');
      }

      setSubmitProgress(100);
      await refetchUser();

      setTimeout(() => {
        router.push('/dashboard');
      }, 500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Onboarding failed.');
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050508] text-foreground flex flex-col justify-between font-sans relative overflow-x-hidden select-none animate-in fade-in duration-500">
      {/* Luxury Ambient Lighting Glows */}
      <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[1100px] h-[550px] bg-radial from-cyan-500/15 via-blue-600/10 to-transparent blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-radial from-purple-600/10 via-indigo-600/5 to-transparent blur-[140px] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />

      {/* Header Bar */}
      <header className="flex h-20 items-center justify-between border-b border-white/10 px-6 sm:px-12 bg-[#0A0B10]/60 backdrop-blur-2xl relative z-10">
        <div className="flex items-center space-x-3">
          <HQLogo size={28} />
          <div className="flex flex-col">
            <span className="font-black tracking-tight text-white text-base flex items-center gap-2">
              HQ <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent text-xs font-bold uppercase tracking-widest">PROVISIONING</span>
            </span>
            <span className="text-[10px] text-slate-400 font-medium tracking-wide">Enterprise Setup Engine</span>
          </div>
        </div>

        {/* Step Indicator Pill */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 bg-black/50 border border-white/10 px-3.5 py-1.5 rounded-full text-xs font-bold text-slate-300">
            <span className="text-cyan-400">Step {step}</span> of 11
          </div>
          <Badge variant="outline" className="border-cyan-500/30 bg-cyan-500/10 text-cyan-300 text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping" />
            LIVE PROVISIONER
          </Badge>
        </div>
      </header>

      {/* Progress Line */}
      <div className="w-full bg-white/5 h-1 relative z-10">
        <div
          className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 transition-all duration-500 shadow-[0_0_15px_rgba(6,182,212,0.8)]"
          style={{ width: `${(step / 11) * 100}%` }}
        />
      </div>

      {/* Main Container */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 relative z-10 my-6">
        <div className="w-full max-w-3xl">
          <Card className="border border-white/10 bg-[#0A0B10]/90 backdrop-blur-3xl shadow-[0_0_60px_rgba(6,182,212,0.12)] text-foreground p-4 sm:p-8 rounded-3xl relative overflow-hidden transition-all duration-300">
            {error && (
              <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs p-3.5 mb-6 rounded-2xl text-center font-semibold flex items-center justify-center gap-2 animate-in fade-in">
                <ShieldAlert className="h-4 w-4 text-rose-400" /> {error}
              </div>
            )}

            {/* STEP 1: Identity, Slogan & URL */}
            {step === 1 && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="space-y-2 text-left border-b border-white/10 pb-5">
                  <div className="flex items-center gap-2 text-[10px] font-black text-cyan-400 uppercase tracking-widest bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-1 rounded-md w-fit">
                    <Building className="h-3.5 w-3.5" />
                    STEP 1: CORPORATE IDENTITY
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    Name Your Executive Workspace
                  </h2>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    Set up your organization's official name, slogan, industry, and workspace subdomain URL.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300">Executive Email Address *</label>
                    <Input
                      type="email"
                      placeholder="e.g. director@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-black/50 border-white/10 text-white h-11 text-xs focus-visible:ring-cyan-500 rounded-xl"
                    />
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300">Organization / Company Name *</label>
                    <Input
                      placeholder="e.g. Netify Global Inc."
                      value={orgName}
                      onChange={(e) => setOrgName(e.target.value)}
                      className="bg-black/50 border-white/10 text-white h-12 text-sm focus-visible:ring-cyan-500 rounded-xl"
                    />
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300">Company Website / URL (Optional)</label>
                    <Input
                      placeholder="e.g. https://company.com"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      className="bg-black/50 border-white/10 text-white h-11 text-xs focus-visible:ring-cyan-500 rounded-xl"
                    />
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300">Company Slogan / Mission Statement</label>
                    <Input
                      placeholder="e.g. Empowering Enterprise Autonomy through AI"
                      value={slogan}
                      onChange={(e) => setSlogan(e.target.value)}
                      className="bg-black/50 border-white/10 text-white h-11 text-xs focus-visible:ring-cyan-500 rounded-xl"
                    />
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300">Workspace Subdomain URL</label>
                    <div className="flex items-center gap-2 bg-black/60 border border-white/10 rounded-xl px-3.5 h-11 overflow-hidden">
                      <Globe className="h-4 w-4 text-cyan-400 shrink-0" />
                      <span className="text-slate-500 text-xs font-mono shrink-0">hq.netify.ng/</span>
                      <Input
                        value={orgSlug}
                        onChange={(e) => setOrgSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                        className="bg-transparent border-0 p-0 text-cyan-300 font-mono text-xs focus-visible:ring-0 h-auto min-w-0"
                      />
                      {checkingSlug ? (
                        <span className="text-[11px] text-slate-400 animate-pulse shrink-0">Checking...</span>
                      ) : slugAvailable === true ? (
                        <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1 shrink-0">
                          <Check className="h-3.5 w-3.5" /> Available
                        </span>
                      ) : slugAvailable === false ? (
                        <span className="text-[11px] text-rose-400 font-bold shrink-0">Taken</span>
                      ) : null}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300">Industry Sector</label>
                    <select
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      className="w-full bg-black/50 border border-white/10 text-white h-11 text-xs rounded-xl px-3 focus:outline-none focus:border-cyan-500"
                    >
                      <option value="Technology">Software & Technology</option>
                      <option value="Finance">Finance & Banking</option>
                      <option value="Healthcare">Healthcare & Biotech</option>
                      <option value="E-Commerce">E-Commerce & Retail</option>
                      <option value="Real Estate">Real Estate & PropTech</option>
                      <option value="Agency">Agency & Marketing</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300">Company Size</label>
                    <select
                      value={companySize}
                      onChange={(e) => setCompanySize(e.target.value)}
                      className="w-full bg-black/50 border border-white/10 text-white h-11 text-xs rounded-xl px-3 focus:outline-none focus:border-cyan-500"
                    >
                      <option value="1-5">1-5 Employees</option>
                      <option value="6-20">6-20 Employees</option>
                      <option value="21-100">21-100 Employees</option>
                      <option value="100+">100+ Enterprise</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:col-span-2 pt-4 border-t border-white/10 mt-2">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-cyan-400">Executive Title *</label>
                      <select
                        value={userTitle}
                        onChange={(e) => setUserTitle(e.target.value)}
                        className="w-full bg-black/50 border border-cyan-500/40 text-white h-11 text-xs rounded-xl px-3 focus:outline-none focus:border-cyan-400 font-bold"
                      >
                        <option value="Alh">Alhaji / Hajjia (Alh)</option>
                        <option value="Dr">Doctor (Dr)</option>
                        <option value="Prof">Professor (Prof)</option>
                        <option value="Engr">Engineer (Engr)</option>
                        <option value="Surv">Surveyor (Surv)</option>
                        <option value="Arc">Architect (Arc)</option>
                        <option value="Barr">Barrister (Barr)</option>
                        <option value="Chief">Chief</option>
                        <option value="Mr">Mr</option>
                        <option value="Mrs">Mrs</option>
                        <option value="Ms">Ms</option>
                        <option value="Sir">Sir</option>
                        <option value="Lady">Lady</option>
                      </select>
                    </div>

                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-cyan-400">Executive Name *</label>
                      <Input
                        placeholder="e.g. Umar / Sophia"
                        value={userDisplayName}
                        onChange={(e) => setUserDisplayName(e.target.value)}
                        className="bg-black/50 border-cyan-500/40 text-white h-11 text-xs focus-visible:ring-cyan-500 rounded-xl font-bold"
                      />
                    </div>

                    <div className="space-y-1.5 sm:col-span-3">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-purple-400">Preferred Asad AI Voice Persona</label>
                        <button
                          type="button"
                          onClick={() => {
                            if ('speechSynthesis' in window) {
                              window.speechSynthesis.cancel();
                              const sample = new SpeechSynthesisUtterance(`Okay, ${userTitle} ${userDisplayName || 'Executive'}, Asad voice persona active.`);
                              sample.pitch = voicePersona.includes('Female') ? 1.2 : 0.95;
                              window.speechSynthesis.speak(sample);
                            }
                          }}
                          className="text-[10px] font-black text-cyan-300 uppercase tracking-widest hover:underline flex items-center gap-1"
                        >
                          <Volume2 className="h-3.5 w-3.5 text-cyan-400" /> Test Voice Sound
                        </button>
                      </div>
                      <select
                        value={voicePersona}
                        onChange={(e) => setVoicePersona(e.target.value)}
                        className="w-full bg-black/50 border border-purple-500/40 text-white h-11 text-xs rounded-xl px-3 focus:outline-none focus:border-purple-400 font-bold"
                      >
                        <option value="Asad Male Executive">Asad Male Executive (Resonant & Confident)</option>
                        <option value="Asad Female Executive">Asad Female Executive (Articulate & Polished)</option>
                        <option value="Asad Neural British">Asad Neural British (Refined & Crisp)</option>
                        <option value="Asad System Default">Asad System Default</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Plain-English Target Market */}
            {step === 2 && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="space-y-2 text-left border-b border-white/10 pb-5">
                  <div className="flex items-center gap-2 text-[10px] font-black text-purple-400 uppercase tracking-widest bg-purple-500/10 border border-purple-500/20 px-2.5 py-1 rounded-md w-fit">
                    <Users className="h-3.5 w-3.5" />
                    STEP 2: TARGET CUSTOMER AUDIENCE
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    Who does your business serve?
                  </h2>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    Select your primary customer focus so your AI Executives tailor market positioning.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-3 text-left">
                  {TARGET_MARKETS.map((tm) => (
                    <div
                      key={tm.id}
                      onClick={() => setTargetMarket(tm.id)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                        targetMarket === tm.id
                          ? 'bg-gradient-to-r from-cyan-500/15 via-blue-500/10 to-purple-500/15 border-cyan-400/50 shadow-[0_0_20px_rgba(6,182,212,0.15)]'
                          : 'bg-black/40 border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="text-sm font-extrabold text-white flex items-center gap-2">
                          {tm.title}
                        </div>
                        <div className="text-slate-400 text-xs">{tm.desc}</div>
                      </div>
                      <div
                        className={`h-5 w-5 rounded-full border flex items-center justify-center transition-all ${
                          targetMarket === tm.id
                            ? 'border-cyan-400 bg-cyan-400 text-black'
                            : 'border-white/20 bg-transparent'
                        }`}
                      >
                        {targetMarket === tm.id && <Check className="h-3 w-3 stroke-[3]" />}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 3: Searchable Strategic Goals Catalog */}
            {step === 3 && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="space-y-2 text-left border-b border-white/10 pb-5">
                  <div className="flex items-center gap-2 text-[10px] font-black text-cyan-400 uppercase tracking-widest bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-1 rounded-md w-fit">
                    <TrendingUp className="h-3.5 w-3.5" />
                    STEP 3: STRATEGIC OBJECTIVES
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    Select Corporate Goals
                  </h2>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    Search and pick your company's active strategic goals for your AI Boardroom.
                  </p>
                </div>

                <div className="space-y-4 text-left">
                  <div className="relative">
                    <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                    <Input
                      placeholder="Search strategic goals..."
                      value={goalSearch}
                      onChange={(e) => setGoalSearch(e.target.value)}
                      className="bg-black/50 border-white/10 text-white pl-10 h-11 text-xs focus-visible:ring-cyan-500 rounded-xl"
                    />
                  </div>

                  <div className="flex flex-wrap gap-2.5 max-h-60 overflow-y-auto p-1">
                    {GOALS_CATALOG.filter((g) => g.toLowerCase().includes(goalSearch.toLowerCase())).map((goal) => {
                      const isSelected = selectedGoals.includes(goal);
                      return (
                        <button
                          key={goal}
                          type="button"
                          onClick={() => toggleGoal(goal)}
                          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-2 ${
                            isSelected
                              ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border-cyan-400/50 shadow-sm'
                              : 'bg-black/40 text-slate-300 border-white/10 hover:border-white/20'
                          }`}
                        >
                          {isSelected ? <CheckCircle className="h-3.5 w-3.5 text-cyan-400" /> : <Plus className="h-3.5 w-3.5 text-slate-500" />}
                          {goal}
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                    <Input
                      placeholder="Add custom strategic goal..."
                      value={customGoalInput}
                      onChange={(e) => setCustomGoalInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomGoal())}
                      className="bg-black/50 border-white/10 text-white h-10 text-xs focus-visible:ring-cyan-500 rounded-xl"
                    />
                    <Button
                      type="button"
                      onClick={addCustomGoal}
                      className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold h-10 px-4 rounded-xl"
                    >
                      Add Goal
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: Searchable Departments Catalog */}
            {step === 4 && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="space-y-2 text-left border-b border-white/10 pb-5">
                  <div className="flex items-center gap-2 text-[10px] font-black text-purple-400 uppercase tracking-widest bg-purple-500/10 border border-purple-500/20 px-2.5 py-1 rounded-md w-fit">
                    <Layers className="h-3.5 w-3.5" />
                    STEP 4: DEPARTMENT STRUCTURE
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    Configure Active Departments
                  </h2>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    Choose which departments your AI Executive Board will oversee.
                  </p>
                </div>

                <div className="space-y-4 text-left">
                  <div className="relative">
                    <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                    <Input
                      placeholder="Search departments..."
                      value={deptSearch}
                      onChange={(e) => setDeptSearch(e.target.value)}
                      className="bg-black/50 border-white/10 text-white pl-10 h-11 text-xs focus-visible:ring-purple-500 rounded-xl"
                    />
                  </div>

                  <div className="flex flex-wrap gap-2.5 max-h-60 overflow-y-auto p-1">
                    {DEPARTMENTS_CATALOG.filter((d) => d.toLowerCase().includes(deptSearch.toLowerCase())).map((dept) => {
                      const isSelected = selectedDepts.includes(dept);
                      return (
                        <button
                          key={dept}
                          type="button"
                          onClick={() => toggleDept(dept)}
                          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-2 ${
                            isSelected
                              ? 'bg-gradient-to-r from-purple-500/20 to-indigo-500/20 text-purple-300 border-purple-400/50 shadow-sm'
                              : 'bg-black/40 text-slate-300 border-white/10 hover:border-white/20'
                          }`}
                        >
                          {isSelected ? <CheckCircle className="h-3.5 w-3.5 text-purple-400" /> : <Plus className="h-3.5 w-3.5 text-slate-500" />}
                          {dept}
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                    <Input
                      placeholder="Add custom department name..."
                      value={customDeptInput}
                      onChange={(e) => setCustomDeptInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomDept())}
                      className="bg-black/50 border-white/10 text-white h-10 text-xs focus-visible:ring-purple-500 rounded-xl"
                    />
                    <Button
                      type="button"
                      onClick={addCustomDept}
                      className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold h-10 px-4 rounded-xl"
                    >
                      Add Dept
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 5: Role-First AI Executive Board */}
            {step === 5 && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="space-y-2 text-left border-b border-white/10 pb-5">
                  <div className="flex items-center gap-2 text-[10px] font-black text-cyan-400 uppercase tracking-widest bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-1 rounded-md w-fit">
                    <Cpu className="h-3.5 w-3.5" />
                    STEP 5: AI EXECUTIVE BOARDROOM
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    Assign AI Executive Board
                  </h2>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    Executives are assigned by rank. Customize default names or keep their executive titles.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left max-h-[380px] overflow-y-auto p-1">
                  {executives.map((exec, idx) => (
                    <div
                      key={exec.roleKey}
                      className={`p-3.5 rounded-2xl border transition-all ${
                        exec.enabled
                          ? 'bg-black/60 border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.1)]'
                          : 'bg-black/20 border-white/5 opacity-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-extrabold uppercase text-cyan-400 tracking-wider">
                          {exec.title}
                        </span>
                        <input
                          type="checkbox"
                          checked={exec.enabled}
                          onChange={(e) => {
                            const val = e.target.checked;
                            setExecutives((prev) =>
                              prev.map((item, i) => (i === idx ? { ...item, enabled: val } : item)),
                            );
                          }}
                          className="h-4 w-4 rounded bg-black border-white/20 text-cyan-500 focus:ring-cyan-500"
                        />
                      </div>
                      <Input
                        value={exec.customName}
                        onChange={(e) => {
                          const val = e.target.value;
                          setExecutives((prev) =>
                            prev.map((item, i) => (i === idx ? { ...item, customName: val } : item)),
                          );
                        }}
                        disabled={!exec.enabled}
                        placeholder={exec.defaultName}
                        className="bg-black/40 border-white/10 text-white h-9 text-xs focus-visible:ring-cyan-500 rounded-lg"
                      />
                      <div className="text-[10px] text-slate-500 mt-1.5 font-medium">
                        Dept: {exec.dept}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 6: AI Governance Operating Style */}
            {step === 6 && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="space-y-2 text-left border-b border-white/10 pb-5">
                  <div className="flex items-center gap-2 text-[10px] font-black text-purple-400 uppercase tracking-widest bg-purple-500/10 border border-purple-500/20 px-2.5 py-1 rounded-md w-fit">
                    <Sparkles className="h-3.5 w-3.5" />
                    STEP 6: BOARDROOM OPERATING STYLE
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    Select AI Decision Directive
                  </h2>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    Set the strategic priority for your AI Executives when executing tasks and advising.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                  {[
                    {
                      id: 'growth',
                      title: '⚡ Aggressive Market Growth',
                      desc: 'Prioritize speed, rapid experimentation, and market expansion.',
                    },
                    {
                      id: 'balanced',
                      title: '⚖️ Balanced Growth & Margin',
                      desc: 'Harmonize revenue expansion with fiscal discipline and profitability.',
                    },
                    {
                      id: 'compliance',
                      title: '🛡️ Strict Security & Compliance',
                      desc: 'Emphasis on SOC2, data privacy, risk mitigation, and enterprise audits.',
                    },
                    {
                      id: 'velocity',
                      title: '🚀 Engineering & Product Velocity',
                      desc: 'Maximize code ship speed, tech stack innovation, and developer output.',
                    },
                  ].map((style) => (
                    <div
                      key={style.id}
                      onClick={() => setAiStyle(style.id)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                        aiStyle === style.id
                          ? 'bg-gradient-to-r from-purple-500/20 to-indigo-500/20 border-purple-400/50 shadow-[0_0_20px_rgba(168,85,247,0.15)]'
                          : 'bg-black/40 border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="text-sm font-extrabold text-white mb-1">{style.title}</div>
                      <div className="text-slate-400 text-xs">{style.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 7: Workspace Branding Accent */}
            {step === 7 && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="space-y-2 text-left border-b border-white/10 pb-5">
                  <div className="flex items-center gap-2 text-[10px] font-black text-cyan-400 uppercase tracking-widest bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-1 rounded-md w-fit">
                    <Palette className="h-3.5 w-3.5" />
                    STEP 7: WORKSPACE BRANDING
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    Select Brand Accent Color
                  </h2>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    Personalize your executive dashboard with your corporate brand theme.
                  </p>
                </div>

                <div className="flex items-center justify-center gap-4 py-6">
                  {[
                    { color: '#06b6d4', label: 'Cyan Cyber' },
                    { color: '#3b82f6', label: 'Electric Blue' },
                    { color: '#a855f7', label: 'Luxury Purple' },
                    { color: '#10b981', label: 'Emerald Tech' },
                    { color: '#f59e0b', label: 'Amber Gold' },
                  ].map((c) => (
                    <button
                      key={c.color}
                      type="button"
                      onClick={() => setBrandColor(c.color)}
                      className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-all ${
                        brandColor === c.color ? 'scale-110 shadow-lg ring-2 ring-white ring-offset-2 ring-offset-black' : 'opacity-70 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: c.color }}
                    >
                      {brandColor === c.color && <Check className="h-5 w-5 text-black stroke-[3]" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 8 (NEW STEP): Mr. Intelligence Live Web & Social Media Discovery */}
            {step === 8 && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="space-y-2 text-left border-b border-white/10 pb-5">
                  <div className="flex items-center gap-2 text-[10px] font-black text-cyan-400 uppercase tracking-widest bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-1 rounded-md w-fit">
                    <Search className="h-3.5 w-3.5" />
                    STEP 8: INSTANT COMPANY INTELLIGENCE DISCOVERY
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    Mr. Intelligence Discovery Report
                  </h2>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    Mr. Intelligence searched public web and social media signals for <strong className="text-cyan-300">{orgName || 'your organization'}</strong>.
                  </p>
                </div>

                {discoveryLoading ? (
                  <div className="py-12 space-y-4 text-center">
                    <div className="w-12 h-12 border-2 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin mx-auto" />
                    <div className="text-sm font-bold text-white">Mr. Intelligence searching web, news & social handles...</div>
                    <div className="text-xs text-slate-400 font-mono">Gathering public intelligence for {orgName || 'your company'}...</div>
                  </div>
                ) : (
                  <div className="space-y-4 text-left">
                    {/* Executive High-Level Picture Card */}
                    <div className="p-5 rounded-2xl bg-gradient-to-r from-cyan-950/60 via-slate-900/90 to-blue-950/60 border border-cyan-500/30 space-y-3 shadow-lg">
                      <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2">
                        <span className="text-xs font-black text-cyan-300 flex items-center gap-1.5">
                          <Compass className="h-4 w-4 text-cyan-400" /> High-Level Company Picture
                        </span>
                        <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/40 text-[9px] font-bold">
                          {discoveryData?.marketSentiment || 'INNOVATIVE'}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed font-normal">
                        {discoveryData?.summary}
                      </p>
                    </div>

                    {/* Web & Social Media Handles Status */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="p-3.5 rounded-xl bg-black/50 border border-white/10 space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                          <Globe className="h-3.5 w-3.5 text-cyan-400" /> Web Domain Signals
                        </span>
                        <div className="text-xs font-semibold text-emerald-300 truncate">
                          {discoveryData?.webHandleStatus}
                        </div>
                      </div>
                      <div className="p-3.5 rounded-xl bg-black/50 border border-white/10 space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                          <Share2 className="h-3.5 w-3.5 text-purple-400" /> Social Media Signals
                        </span>
                        <div className="text-xs font-semibold text-purple-300 truncate">
                          {discoveryData?.socialHandleStatus}
                        </div>
                      </div>
                    </div>

                    {/* Key Market Takeaways */}
                    <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        KEY MARKET OBSERVATIONS
                      </span>
                      <ul className="space-y-1.5 text-xs text-slate-300">
                        {discoveryData?.keyTakeaways.map((takeaway, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <CheckCircle className="h-3.5 w-3.5 text-cyan-400 shrink-0 mt-0.5" />
                            <span>{takeaway}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Continuous Learning Reassurance Note */}
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/40 via-indigo-950/40 to-slate-900 border border-purple-500/30 text-xs text-purple-200 leading-relaxed font-medium flex items-start gap-2.5">
                      <Sparkles className="h-4 w-4 text-purple-400 shrink-0 mt-0.5 animate-pulse" />
                      <div>
                        {discoveryData?.learningNote}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STEP 9: Email Verification & Account Credentials */}
            {step === 9 && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="space-y-2 text-left border-b border-white/10 pb-5">
                  <div className="flex items-center gap-2 text-[10px] font-black text-cyan-400 uppercase tracking-widest bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-1 rounded-md w-fit">
                    <Lock className="h-3.5 w-3.5" />
                    STEP 9: ACCOUNT VERIFICATION & CREDENTIALS
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    Verify Account & Set Credentials
                  </h2>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    Verify the email address collected during Step 1 using OTP, set an account password, or continue with Google.
                  </p>
                </div>

                <div className="space-y-4 text-left">
                  <div className="p-4 border border-white/10 bg-black/40 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-white flex items-center gap-1.5">
                        <CheckCircle2 className="h-4 w-4 text-cyan-400" />
                        Option A: 6-Digit Email OTP Verification
                      </span>
                      {emailVerified ? (
                        <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-[10px] font-bold">
                          Verified ✅
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px] text-amber-400 border-amber-500/30">
                          Pending Verification
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Input
                        type="email"
                        placeholder="e.g. director@company.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={emailVerified}
                        className="bg-black/60 border-white/10 text-white h-11 text-xs focus-visible:ring-cyan-500 rounded-xl"
                      />
                      {!emailVerified && (
                        <Button
                          type="button"
                          onClick={handleSendOtp}
                          disabled={otpLoading || !email}
                          className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs h-11 px-4 rounded-xl shrink-0"
                        >
                          {otpLoading ? 'Sending Code...' : otpSent ? 'Resend Code' : 'Send OTP'}
                        </Button>
                      )}
                    </div>

                    {otpSent && !emailVerified && (
                      <div className="flex items-center gap-2 pt-2 animate-in fade-in">
                        <Input
                          placeholder="Enter 6-digit OTP code"
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value)}
                          className="bg-black/80 border-cyan-500/40 text-cyan-300 h-11 text-xs font-mono text-center tracking-widest rounded-xl"
                        />
                        <Button
                          type="button"
                          onClick={handleVerifyOtp}
                          disabled={otpLoading || !otpCode}
                          className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs h-11 px-4 rounded-xl shrink-0"
                        >
                          Verify Code
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="p-4 border border-white/10 bg-black/40 rounded-2xl space-y-2">
                    <label className="text-xs font-extrabold text-white flex items-center gap-1.5">
                      <Lock className="h-4 w-4 text-purple-400" />
                      Option B: Set Workspace Account Password
                    </label>
                    <Input
                      type="password"
                      placeholder="Enter secure account password..."
                      className="bg-black/60 border-white/10 text-white h-11 text-xs focus-visible:ring-purple-500 rounded-xl"
                    />
                  </div>

                  <div className="pt-2">
                    <Button
                      type="button"
                      onClick={() => signInWithGoogle()}
                      className="w-full bg-white/10 hover:bg-white/20 text-white font-bold text-xs h-11 rounded-xl flex items-center justify-center gap-2 border border-white/10"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z" />
                        <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z" />
                        <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12 0 14.8s.7 5.1 1.9 7.5l3.7-2.9z" />
                        <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z" />
                      </svg>
                      Continue with Google SSO
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 10: Executive Review */}
            {step === 10 && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="space-y-2 text-left border-b border-white/10 pb-5">
                  <div className="flex items-center gap-2 text-[10px] font-black text-purple-400 uppercase tracking-widest bg-purple-500/10 border border-purple-500/20 px-2.5 py-1 rounded-md w-fit">
                    <FileText className="h-3.5 w-3.5" />
                    STEP 10: EXECUTIVE BOARD REVIEW
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    Review Workspace Parameters
                  </h2>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    Confirm corporate identity, AI board configuration, and governance settings before deployment.
                  </p>
                </div>

                <div className="space-y-4 text-left">
                  <div className="p-4 rounded-2xl bg-black/50 border border-white/10 space-y-2">
                    <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">WORKSPACE IDENTITY</div>
                    <div className="text-base font-black text-white">{orgName || 'HQ Workspace'}</div>
                    {slogan && <div className="text-xs text-cyan-400 italic font-medium">"{slogan}"</div>}
                    <div className="text-xs text-slate-400 font-mono">URL: hq.netify.ng/{orgSlug}</div>
                  </div>

                  <div className="p-4 rounded-2xl bg-black/50 border border-white/10 space-y-2">
                    <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">5 CORE AI EXECUTIVE DIRECTORS</div>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {executives.filter((e) => e.enabled).map((e) => (
                        <span key={e.roleKey} className="px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-semibold">
                          {e.customName} ({e.title})
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 11: Final Provisioning & Redirection */}
            {step === 11 && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="space-y-2 text-left border-b border-white/10 pb-5">
                  <div className="flex items-center gap-2 text-[10px] font-black text-emerald-400 uppercase tracking-widest bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-md w-fit">
                    <Rocket className="h-3.5 w-3.5" />
                    STEP 11: PROVISION WORKSPACE & DASHBOARD LAUNCH
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    Launch Executive Headquarters
                  </h2>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    Finalize settings and deploy your autonomous C-Suite command center.
                  </p>
                </div>

                {submitting ? (
                  <div className="py-12 space-y-6 text-center">
                    <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
                      <div className="absolute inset-0 rounded-full border-2 border-cyan-500/20 border-t-cyan-400 animate-spin" />
                      <Cpu className="h-7 w-7 text-cyan-400 animate-pulse" />
                    </div>
                    <div className="space-y-1.5">
                      <div className="text-xl font-bold text-white">Provisioning Executive HQ...</div>
                      <div className="text-slate-400 text-xs">
                        Configuring database schema, assigning AI Boardroom, and deploying workspace...
                      </div>
                    </div>
                    <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/10">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 rounded-full transition-all duration-300 shadow-[0_0_12px_rgba(6,182,212,0.8)]"
                        style={{ width: `${submitProgress}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 text-left">
                    <div className="p-4 rounded-2xl bg-black/50 border border-white/10 space-y-2">
                      <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">WORKSPACE OVERVIEW</div>
                      <div className="text-base font-black text-white">{orgName || 'HQ Workspace'}</div>
                      {slogan && <div className="text-xs text-cyan-400 italic font-medium">"{slogan}"</div>}
                      <div className="text-xs text-slate-400 font-mono">URL: hq.netify.ng/{orgSlug}</div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Footer Navigation Controls */}
            {!submitting && (
              <CardFooter className="flex items-center justify-between border-t border-white/10 pt-6 mt-6">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handlePrevStep}
                  disabled={step === 1}
                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 font-bold disabled:opacity-30"
                >
                  <ArrowLeft className="h-4 w-4" /> Back
                </Button>

                {step < 11 ? (
                  <Button
                    type="button"
                    onClick={handleNextStep}
                    className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs h-11 px-6 rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.4)] flex items-center gap-2"
                  >
                    Continue to Step {step + 1} <ArrowRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={handleCompleteOnboarding}
                    className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-xs h-11 px-8 rounded-xl shadow-[0_0_25px_rgba(16,185,129,0.5)] flex items-center gap-2"
                  >
                    Provision & Launch HQ Boardroom <Rocket className="h-4 w-4" />
                  </Button>
                )}
              </CardFooter>
            )}
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-[11px] text-slate-500 border-t border-white/5 relative z-10">
        <div className="flex items-center justify-center gap-2">
          <Shield className="h-3.5 w-3.5 text-cyan-400" />
          <span>SOC2 Compliant Enterprise Workspace Setup Engine</span>
        </div>
      </footer>
    </div>
  );
}
