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
} from 'lucide-react';
import { useAuth } from '../../../contexts/auth-context';
import { HQLogo } from '../../../components/hq-logo';
import { toast } from '../../../components/toast';

export default function OnboardingPage() {
  const { user, token, refetchUser } = useAuth();
  const router = useRouter();

  // Core step state (1 to 8)
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

  // Step 5: Role-First AI Executives & Custom Naming
  const [executives, setExecutives] = React.useState([
    {
      roleKey: 'ceo',
      title: 'Chief Executive Officer',
      defaultName: 'Elena Rostova',
      customName: 'Elena Rostova',
      dept: 'Executive Leadership',
      enabled: true,
    },
    {
      roleKey: 'cto',
      title: 'Chief Technology Officer',
      defaultName: 'Marcus Vance',
      customName: 'Marcus Vance',
      dept: 'Engineering & IT',
      enabled: true,
    },
    {
      roleKey: 'cmo',
      title: 'Chief Marketing Officer',
      defaultName: 'Sophia Chen',
      customName: 'Sophia Chen',
      dept: 'Sales & Marketing',
      enabled: true,
    },
    {
      roleKey: 'cfo',
      title: 'Chief Financial Officer',
      defaultName: 'Arthur Pendelton',
      customName: 'Arthur Pendelton',
      dept: 'Executive Leadership',
      enabled: true,
    },
    {
      roleKey: 'cro',
      title: 'Chief Revenue Officer',
      defaultName: 'Victor Vance',
      customName: 'Victor Vance',
      dept: 'Sales & Marketing',
      enabled: true,
    },
    {
      roleKey: 'coo',
      title: 'Chief Operating Officer',
      defaultName: 'Diane Sterling',
      customName: 'Diane Sterling',
      dept: 'Executive Leadership',
      enabled: true,
    },
  ]);

  // Step 6: AI Governance Operating Style
  const [aiStyle, setAiStyle] = React.useState('growth');

  // Step 7: Brand Accent
  const [brandColor, setBrandColor] = React.useState('#06b6d4');

  // Step 8: Submission State
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
    setStep((prev) => Math.min(prev + 1, 8));
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

    // Save user title, display name, and voice persona locally
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
            <span className="text-cyan-400">Step {step}</span> of 8
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
          style={{ width: `${(step / 8) * 100}%` }}
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
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300">Organization / Company Name *</label>
                    <Input
                      placeholder="e.g. Netify Global Inc."
                      value={orgName}
                      onChange={(e) => setOrgName(e.target.value)}
                      className="bg-black/50 border-white/10 text-white h-12 text-sm focus-visible:ring-cyan-500 rounded-xl"
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

                  {/* Slug / Subdomain Indicator */}
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300">Workspace Subdomain URL</label>
                    <div className="flex items-center gap-2 bg-black/60 border border-white/10 rounded-xl px-3.5 h-11">
                      <Globe className="h-4 w-4 text-cyan-400 flex-shrink-0" />
                      <span className="text-slate-500 text-xs font-mono">hq.netify.ng/</span>
                      <Input
                        value={orgSlug}
                        onChange={(e) => setOrgSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                        className="bg-transparent border-0 p-0 text-cyan-300 font-mono text-xs focus-visible:ring-0 h-auto"
                      />
                      {checkingSlug ? (
                        <span className="text-[11px] text-slate-400 animate-pulse">Checking...</span>
                      ) : slugAvailable === true ? (
                        <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                          <Check className="h-3.5 w-3.5" /> Available
                        </span>
                      ) : slugAvailable === false ? (
                        <span className="text-[11px] text-rose-400 font-bold">Taken</span>
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

                  {/* Executive Honorific Title, Name & Preferred Voice Persona */}
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
                  {/* Search Bar */}
                  <div className="relative">
                    <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                    <Input
                      placeholder="Search strategic goals..."
                      value={goalSearch}
                      onChange={(e) => setGoalSearch(e.target.value)}
                      className="bg-black/50 border-white/10 text-white pl-10 h-11 text-xs focus-visible:ring-cyan-500 rounded-xl"
                    />
                  </div>

                  {/* Goal Chips */}
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

                  {/* Custom Goal Input */}
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

            {/* STEP 8: Review & Provisioning */}
            {step === 8 && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="space-y-2 text-left border-b border-white/10 pb-5">
                  <div className="flex items-center gap-2 text-[10px] font-black text-emerald-400 uppercase tracking-widest bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-md w-fit">
                    <Rocket className="h-3.5 w-3.5" />
                    STEP 8: PROVISION WORKSPACE
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    Launch Executive Headquarters
                  </h2>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    Review your workspace settings before building your autonomous command center.
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

                    <div className="p-4 rounded-2xl bg-black/50 border border-white/10 space-y-2">
                      <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">AI EXECUTIVE BOARDROOM</div>
                      <div className="flex flex-wrap gap-2 pt-1">
                        {executives.filter((e) => e.enabled).map((e) => (
                          <span key={e.roleKey} className="px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-semibold">
                            {e.customName} ({e.title})
                          </span>
                        ))}
                      </div>
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

                {step < 8 ? (
                  <Button
                    type="button"
                    onClick={handleNextStep}
                    className="bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-bold text-xs px-6 h-11 rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all flex items-center gap-2"
                  >
                    Continue <ArrowRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={handleCompleteOnboarding}
                    className="bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-black text-xs px-8 h-11 rounded-xl shadow-[0_0_25px_rgba(6,182,212,0.4)] transition-all flex items-center gap-2"
                  >
                    Provision Executive Workspace &rarr;
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
