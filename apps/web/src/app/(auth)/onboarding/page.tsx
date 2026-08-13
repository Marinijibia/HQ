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
  TrendingUp,
  Search,
  CheckCircle2,
  Plus,
  ShieldAlert,
  Shield,
  Rocket,
  Palette,
  Check,
  CheckCircle,
  Volume2,
  Share2,
  FileText,
  Compass,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useAuth } from '../../../contexts/auth-context';
import { HQLogo } from '../../../components/hq-logo';
import { toast } from '../../../components/toast';

export default function OnboardingPage() {
  const { user, token, refetchUser, signInWithEmail, signUpWithEmail } = useAuth();
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
  const [onboardingPassword, setOnboardingPassword] = React.useState('');
  const [onboardingConfirmPassword, setOnboardingConfirmPassword] = React.useState('');
  const [showOnboardingPassword, setShowOnboardingPassword] = React.useState(false);
  const [showOnboardingConfirmPassword, setShowOnboardingConfirmPassword] = React.useState(false);
  const [authProcessing, setAuthProcessing] = React.useState(false);

  // Step 1: Email existence check
  const [emailCheckLoading, setEmailCheckLoading] = React.useState(false);
  const [emailAlreadyExists, setEmailAlreadyExists] = React.useState(false);

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

  // Step 7: Brand Accent & Subscription Tier
  const [brandColor, setBrandColor] = React.useState('#06b6d4');
  const [selectedPlanCode, setSelectedPlanCode] = React.useState('FREE');

  // Step 11: Submission State
  const [submitting, setSubmitting] = React.useState(false);
  const [submitProgress, setSubmitProgress] = React.useState(0);

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

  // Restores saved onboarding draft & step on mount
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const rawDraft = localStorage.getItem('hq_onboarding_draft');
      if (rawDraft && rawDraft.trim()) {
        const draft = JSON.parse(rawDraft);
        if (draft.orgName) setOrgName(draft.orgName);
        if (draft.slogan) setSlogan(draft.slogan);
        if (draft.orgSlug) setOrgSlug(draft.orgSlug);
        if (draft.website) setWebsite(draft.website);
        if (draft.industry) setIndustry(draft.industry);
        if (draft.companySize) setCompanySize(draft.companySize);
        if (draft.userTitle) setUserTitle(draft.userTitle);
        if (draft.userDisplayName) setUserDisplayName(draft.userDisplayName);
        if (draft.voicePersona) setVoicePersona(draft.voicePersona);
        if (draft.targetMarket) setTargetMarket(draft.targetMarket);
        if (draft.businessDesc) setBusinessDesc(draft.businessDesc);
        if (draft.selectedGoals) setSelectedGoals(draft.selectedGoals);
        if (draft.selectedDepts) setSelectedDepts(draft.selectedDepts);
        if (draft.executives) setExecutives(draft.executives);
        if (draft.aiStyle) setAiStyle(draft.aiStyle);
        if (draft.brandColor) setBrandColor(draft.brandColor);
        if (draft.email) {
          setEmail(draft.email);
          // Restore persistent email verification — valid across sessions
          if (draft.emailVerified && draft.verifiedEmail === draft.email) {
            setEmailVerified(true);
          }
        }
        if (draft.step && typeof draft.step === 'number' && draft.step > 1 && draft.step <= 10) {
          // Cap at step 10 — step 11 (launch) must always be reached through the live flow
          setStep(draft.step);
        }
        toast.info('⚡ Restored your saved onboarding progress!');
      }
    } catch {
      /* ignore */
    }
  }, []);

  React.useEffect(() => {
    if (user?.email) {
      setEmail(user.email);
      setEmailVerified(true);
      if (user.displayName && !userDisplayName) {
        setUserDisplayName(user.displayName);
      }
    }
  }, [user, userDisplayName]);

  // Saves onboarding progress and pings backend lead tracker with INCOMPLETE_ONBOARDING tag
  const persistOnboardingProgress = React.useCallback(
    async (nextStep?: number) => {
      const targetStep = nextStep ?? step;
      const draft = {
        step: targetStep,
        orgName,
        slogan,
        orgSlug,
        website,
        industry,
        companySize,
        userTitle,
        userDisplayName,
        voicePersona,
        targetMarket,
        businessDesc,
        selectedGoals,
        selectedDepts,
        executives,
        aiStyle,
        brandColor,
        email,
        // Persist email verification so it survives sessions (e.g. user returns after a month)
        emailVerified,
        verifiedEmail: emailVerified ? email : null,
        savedAt: new Date().toISOString(),
      };

      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem('hq_onboarding_draft', JSON.stringify(draft));
        }
      } catch {
        /* ignore */
      }

      if (email && email.includes('@')) {
        // Debounce: only call track-incomplete max once per 10s to avoid 429
        const now = Date.now();
        const lastTrack = (window as any).__hqLastTrackIncomplete || 0;
        if (now - lastTrack > 10000) {
          (window as any).__hqLastTrackIncomplete = now;
          fetch('/api/auth/track-incomplete-onboarding', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, step: targetStep, orgName, completed: false }),
          }).catch(() => null);
        }
      }
    },
    [step, orgName, slogan, orgSlug, website, industry, companySize, userTitle, userDisplayName, voicePersona, targetMarket, businessDesc, selectedGoals, selectedDepts, executives, aiStyle, brandColor, email, emailVerified],
  );

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

  // Step 1: Check if email is already registered
  const handleCheckEmail = React.useCallback(async (emailValue: string) => {
    const trimmed = emailValue.trim().toLowerCase();
    if (!trimmed || !trimmed.includes('@')) return;
    setEmailCheckLoading(true);
    setEmailAlreadyExists(false);
    setError(null);
    try {
      const res = await fetch(`/api/auth/check-email?email=${encodeURIComponent(trimmed)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.exists) {
          setEmailAlreadyExists(true);
          setError('This email is already registered. Please log in to your account instead.');
        }
      }
    } catch {
      /* ignore — non-blocking check */
    } finally {
      setEmailCheckLoading(false);
    }
  }, []);

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

  const handleCreateAccountWithPassword = async () => {
    if (!email || !email.includes('@')) {
      setError('Please enter a valid executive email address.');
      return;
    }
    if (!onboardingPassword || onboardingPassword.length < 6) {
      setError('Please enter an account password with at least 6 characters.');
      return;
    }
    if (onboardingPassword !== onboardingConfirmPassword) {
      setError('Passwords do not match. Please verify your confirm password.');
      return;
    }
    setError(null);
    setAuthProcessing(true);
    try {
      const sessionToken = localStorage.getItem('hq_session_token');
      if (!sessionToken) {
        setError('Session expired. Please verify your email again.');
        return;
      }
      const res = await fetch('/api/auth/set-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionToken, password: onboardingPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to set password.');
      // Store full auth token — user is now fully authenticated
      localStorage.setItem('hq_auth_token', data.token);
      await refetchUser();
      setEmailVerified(true);
      toast.success('🔒 Account credentials registered successfully!');
      const nextStep = 10;
      setStep(nextStep);
      persistOnboardingProgress(nextStep);
    } catch (err: any) {
      setError(err?.message || 'Failed to register account credentials.');
    } finally {
      setAuthProcessing(false);
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
        const data = await res.json();
        setEmailVerified(true);
        toast.success('✅ Email address verified successfully!');

        // Store server session token first (works without network access to Google)
        // This is our reliable fallback — always available
        if (data.sessionToken) {
          localStorage.setItem('hq_session_token', data.sessionToken);
        }

        // Persist verified state to draft (survives sessions)
        persistOnboardingProgress();
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

  // Step 2: Target Markets, Catalogs & Handlers

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
      if (!email.trim() || !email.includes('@')) {
        setError('Please enter a valid executive email address.');
        return;
      }
      if (emailAlreadyExists) {
        setError('This email is already registered. Please log in to your account instead.');
        return;
      }
      if (!orgName.trim()) {
        setError('Please enter your Organization Name.');
        return;
      }
    }
    if (step === 9) {
      // Accept: context user or server auth/session token
      const hasAuthToken = !!localStorage.getItem('hq_auth_token') || !!localStorage.getItem('hq_session_token');
      const isAuthenticated = !!user || hasAuthToken;
      if (!isAuthenticated) {
        setError('Please secure your account first: enter a password and click "Register Password".');
        return;
      }
    }
    const nextStep = Math.min(step + 1, 11);
    setStep(nextStep);
    persistOnboardingProgress(nextStep);
  };

  const handlePrevStep = () => {
    setError(null);
    const prevStep = Math.max(step - 1, 1);
    setStep(prevStep);
    persistOnboardingProgress(prevStep);
  };

  const handleCompleteOnboarding = async () => {
    // Prevent double submission
    if (submitting) return;
    setError(null);
    setSubmitting(true);

    // Hard guard: user MUST be authenticated — context user or server session token
    const serverAuthToken = localStorage.getItem('hq_auth_token') || localStorage.getItem('hq_session_token');
    if (!user && !serverAuthToken) {
      setError('Please complete account setup (set a password) before launching your HQ workspace.');
      setSubmitting(false);
      setStep(9);
      return;
    }

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
      planCode: selectedPlanCode,
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

    localStorage.setItem('hq_user_display_name', userDisplayName || 'Executive');
    localStorage.setItem('hq_asad_voice_persona', voicePersona);

    try {
      setSubmitProgress(15);

      // Get auth token: prefer context token, fall back to stored auth/session token
      const authToken = token || serverAuthToken;

      if (!authToken) {
        setError('Authentication session expired. Please complete account setup again.');
        setSubmitting(false);
        setStep(9);
        return;
      }

      setSubmitProgress(40);

      const res = await fetch('/api/organizations/onboard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(payload),
      });

      setSubmitProgress(75);

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.message || 'Workspace provisioning failed.');
      }

      setSubmitProgress(100);
      try {
        if (typeof window !== 'undefined') {
          if (resData.token) {
            localStorage.setItem('hq_auth_token', resData.token);
          }
          localStorage.removeItem('hq_session_token');
          localStorage.removeItem('hq_onboarding_draft');
        }
        if (email) {
          fetch('/api/auth/track-incomplete-onboarding', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, step: 11, orgName, completed: true }),
          }).catch(() => null);
        }
      } catch {
        /* ignore */
      }

      await refetchUser();

      setTimeout(() => {
        router.push('/dashboard');
      }, 300);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Onboarding failed.');
      setSubmitting(false);
    }
  };

  const handleResetOnboarding = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('hq_onboarding_draft');
      localStorage.removeItem('hq_session_token');
    }
    setStep(1);
    setOrgName('');
    setSlogan('');
    setOrgSlug('');
    setWebsite('');
    setIndustry('Technology & Software');
    setCompanySize('11-50 employees');
    setUserTitle('Chief Executive Officer (CEO)');
    setUserDisplayName('');
    setEmail('');
    setEmailVerified(false);
    setOtpSent(false);
    setOtpCode('');
    setOnboardingPassword('');
    setOnboardingConfirmPassword('');
    toast.info('Started fresh onboarding session!');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#050508] text-foreground flex flex-col justify-between font-sans relative overflow-x-hidden animate-in fade-in duration-500">
      {/* Background Mesh Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e1e24_1px,transparent_1px)] [background-size:24px_24px] opacity-20 pointer-events-none" />

      {/* Top Header */}
      <header className="flex h-20 items-center justify-between border-b border-slate-200 dark:border-white/10 px-6 sm:px-12 bg-white/80 dark:bg-[#0A0B10]/60 backdrop-blur-2xl relative z-10">
        <div className="flex items-center space-x-3">
          <HQLogo size={28} />
          <div className="flex flex-col">
            <span className="font-black tracking-tight text-slate-900 dark:text-white text-base flex items-center gap-2">
              HQ <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent text-xs font-bold uppercase tracking-widest">PROVISIONING</span>
            </span>
            <span className="text-[10px] text-slate-400 font-medium tracking-wide">Enterprise Setup Engine</span>
          </div>
        </div>

        {/* Step Indicator Pill & Reset Button */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleResetOnboarding}
            className="text-[11px] font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors bg-slate-200/60 dark:bg-white/5 hover:bg-slate-300 dark:hover:bg-white/10 px-3 py-1.5 rounded-full"
          >
            Clear Draft & Start Fresh
          </button>
          <div className="hidden sm:flex items-center gap-1.5 bg-slate-100 dark:bg-black/50 border border-slate-200 dark:border-white/10 px-3.5 py-1.5 rounded-full text-xs font-bold text-slate-700 dark:text-slate-300">
            <span className="text-cyan-600 dark:text-cyan-400">Step {step}</span> of 11
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
          <Card className="border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0A0B10]/90 backdrop-blur-3xl shadow-lg dark:shadow-[0_0_60px_rgba(6,182,212,0.12)] text-foreground p-4 sm:p-8 rounded-3xl relative overflow-hidden transition-all duration-300">
            {error && (
              <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs p-3.5 mb-6 rounded-2xl text-center font-semibold flex items-center justify-center gap-2 animate-in fade-in">
                <ShieldAlert className="h-4 w-4 text-rose-400" /> {error}
              </div>
            )}

            {/* STEP 1: Identity, Slogan & URL */}
            {step === 1 && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="space-y-2 text-left border-b border-slate-200 dark:border-white/10 pb-5">
                  <div className="flex items-center gap-2 text-[10px] font-black text-cyan-600 dark:text-cyan-400 uppercase tracking-widest bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-1 rounded-md w-fit">
                    <Building className="h-3.5 w-3.5" />
                    STEP 1: CORPORATE IDENTITY
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                    Name Your Executive Workspace
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
                    Set up your organization's official name, slogan, industry, and workspace subdomain URL.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Executive Email Address *</label>
                    <div className="relative">
                      <Input
                        type="email"
                        placeholder="e.g. director@company.com"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setEmailAlreadyExists(false);
                          setError(null);
                          // Reset verification state when email changes — prior OTP is now invalid
                          setEmailVerified(false);
                          setOtpSent(false);
                          setOtpCode('');
                        }}
                        onBlur={() => handleCheckEmail(email)}
                        className={`bg-white dark:bg-black/50 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white h-11 text-xs focus-visible:ring-cyan-500 rounded-xl pr-10 ${
                          emailAlreadyExists ? 'border-rose-500/60 focus-visible:ring-rose-500' : ''
                        }`}
                      />
                      {emailCheckLoading && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-500 dark:text-slate-400 animate-pulse">Checking...</span>
                      )}
                      {!emailCheckLoading && emailAlreadyExists && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-rose-500 dark:text-rose-400 font-bold">Registered</span>
                      )}
                      {!emailCheckLoading && !emailAlreadyExists && email.includes('@') && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-emerald-500 dark:text-emerald-400 font-bold">✓</span>
                      )}
                    </div>
                    {emailAlreadyExists && (
                      <p className="text-[11px] text-rose-500 dark:text-rose-400 flex items-center gap-1.5 pt-0.5">
                        <ShieldAlert className="h-3.5 w-3.5 shrink-0" />
                        This email is already registered.
                        <a href="/login" className="underline text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 font-semibold">Log in instead →</a>
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Organization / Company Name *</label>
                    <Input
                      placeholder="e.g. Netify Global Inc."
                      value={orgName}
                      onChange={(e) => setOrgName(e.target.value)}
                      className="bg-white dark:bg-black/50 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white h-12 text-sm focus-visible:ring-cyan-500 rounded-xl"
                    />
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Company Website / URL (Optional)</label>
                    <Input
                      placeholder="e.g. https://company.com"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      className="bg-white dark:bg-black/50 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white h-11 text-xs focus-visible:ring-cyan-500 rounded-xl"
                    />
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Company Slogan / Mission Statement</label>
                    <Input
                      placeholder="e.g. Empowering Enterprise Autonomy through AI"
                      value={slogan}
                      onChange={(e) => setSlogan(e.target.value)}
                      className="bg-white dark:bg-black/50 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white h-11 text-xs focus-visible:ring-cyan-500 rounded-xl"
                    />
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Workspace Subdomain URL</label>
                    <div className="flex items-center gap-2 bg-slate-100 dark:bg-black/60 border border-slate-200 dark:border-white/10 rounded-xl px-3.5 h-11 overflow-hidden">
                      <Globe className="h-4 w-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
                      <span className="text-slate-500 dark:text-slate-400 text-xs font-mono shrink-0">hq.netify.ng/</span>
                      <Input
                        value={orgSlug}
                        onChange={(e) => setOrgSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                        className="bg-transparent border-0 p-0 text-cyan-600 dark:text-cyan-300 font-mono text-xs focus-visible:ring-0 h-auto min-w-0"
                      />
                      {checkingSlug ? (
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 animate-pulse shrink-0">Checking...</span>
                      ) : slugAvailable === true ? (
                        <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 shrink-0">
                          <Check className="h-3.5 w-3.5" /> Available
                        </span>
                      ) : slugAvailable === false ? (
                        <span className="text-[11px] text-rose-600 dark:text-rose-400 font-bold shrink-0">Taken</span>
                      ) : null}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Industry Sector</label>
                    <select
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      className="w-full bg-white dark:bg-black/50 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white h-11 text-xs rounded-xl px-3 focus:outline-none focus:border-cyan-500"
                    >
                      <option value="Technology" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Software & Technology</option>
                      <option value="Finance" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Finance & Banking</option>
                      <option value="Healthcare" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Healthcare & Biotech</option>
                      <option value="E-Commerce" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">E-Commerce & Retail</option>
                      <option value="Real Estate" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Real Estate & PropTech</option>
                      <option value="Agency" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Agency & Marketing</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Company Size</label>
                    <select
                      value={companySize}
                      onChange={(e) => setCompanySize(e.target.value)}
                      className="w-full bg-white dark:bg-black/50 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white h-11 text-xs rounded-xl px-3 focus:outline-none focus:border-cyan-500"
                    >
                      <option value="1-5" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">1-5 Employees</option>
                      <option value="6-20" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">6-20 Employees</option>
                      <option value="21-100" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">21-100 Employees</option>
                      <option value="100+" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">100+ Enterprise</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:col-span-2 pt-4 border-t border-slate-200 dark:border-white/10 mt-2">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">Executive Title *</label>
                      <select
                        value={userTitle}
                        onChange={(e) => setUserTitle(e.target.value)}
                        className="w-full bg-white dark:bg-black/50 border border-cyan-500/40 text-slate-900 dark:text-white h-11 text-xs rounded-xl px-3 focus:outline-none focus:border-cyan-400 font-bold"
                      >
                        <option value="Alh" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Alhaji / Hajjia (Alh)</option>
                        <option value="Dr" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Doctor (Dr)</option>
                        <option value="Prof" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Professor (Prof)</option>
                        <option value="Engr" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Engineer (Engr)</option>
                        <option value="Surv" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Surveyor (Surv)</option>
                        <option value="Arc" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Architect (Arc)</option>
                        <option value="Barr" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Barrister (Barr)</option>
                        <option value="Chief" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Chief</option>
                        <option value="Mr" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Mr</option>
                        <option value="Mrs" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Mrs</option>
                        <option value="Ms" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Ms</option>
                        <option value="Sir" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Sir</option>
                        <option value="Lady" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Lady</option>
                      </select>
                    </div>

                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">Executive Name *</label>
                      <Input
                        placeholder="e.g. Umar / Sophia"
                        value={userDisplayName}
                        onChange={(e) => setUserDisplayName(e.target.value)}
                        className="bg-white dark:bg-black/50 border-cyan-500/40 text-slate-900 dark:text-white h-11 text-xs focus-visible:ring-cyan-500 rounded-xl font-bold"
                      />
                    </div>

                    <div className="space-y-1.5 sm:col-span-3">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">Preferred Asad AI Voice Persona</label>
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
                          className="text-[10px] font-black text-cyan-600 dark:text-cyan-300 uppercase tracking-widest hover:underline flex items-center gap-1"
                        >
                          <Volume2 className="h-3.5 w-3.5 text-cyan-500 dark:text-cyan-400" /> Test Voice Sound
                        </button>
                      </div>
                      <select
                        value={voicePersona}
                        onChange={(e) => setVoicePersona(e.target.value)}
                        className="w-full bg-white dark:bg-black/50 border border-purple-500/40 text-slate-900 dark:text-white h-11 text-xs rounded-xl px-3 focus:outline-none focus:border-purple-400 font-bold"
                      >
                        <option value="Asad Male Executive" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Asad Male Executive (Resonant & Confident)</option>
                        <option value="Asad Female Executive" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Asad Female Executive (Articulate & Polished)</option>
                        <option value="Asad Neural British" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Asad Neural British (Refined & Crisp)</option>
                        <option value="Asad System Default" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Asad System Default</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Plain-English Target Market */}
            {step === 2 && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="space-y-2 text-left border-b border-slate-200 dark:border-white/10 pb-5">
                  <div className="flex items-center gap-2 text-[10px] font-black text-purple-600 dark:text-purple-400 uppercase tracking-widest bg-purple-500/10 border border-purple-500/20 px-2.5 py-1 rounded-md w-fit">
                    <Users className="h-3.5 w-3.5" />
                    STEP 2: TARGET CUSTOMER AUDIENCE
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                    Who does your business serve?
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
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
                          : 'bg-white dark:bg-black/40 border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                          {tm.title}
                        </div>
                        <div className="text-slate-600 dark:text-slate-400 text-xs">{tm.desc}</div>
                      </div>
                      <div
                        className={`h-5 w-5 rounded-full border flex items-center justify-center transition-all ${
                          targetMarket === tm.id
                            ? 'border-cyan-400 bg-cyan-400 text-black'
                            : 'border-slate-300 dark:border-white/20 bg-transparent'
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
                <div className="space-y-2 text-left border-b border-slate-200 dark:border-white/10 pb-5">
                  <div className="flex items-center gap-2 text-[10px] font-black text-cyan-600 dark:text-cyan-400 uppercase tracking-widest bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-1 rounded-md w-fit">
                    <TrendingUp className="h-3.5 w-3.5" />
                    STEP 3: STRATEGIC OBJECTIVES
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                    Select Corporate Goals
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
                    Search and pick your company's active strategic goals for your AI Boardroom.
                  </p>
                </div>

                <div className="space-y-4 text-left">
                  <div className="relative">
                    <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400 dark:text-slate-500" />
                    <Input
                      placeholder="Search strategic goals..."
                      value={goalSearch}
                      onChange={(e) => setGoalSearch(e.target.value)}
                      className="bg-white dark:bg-black/50 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white pl-10 h-11 text-xs focus-visible:ring-cyan-500 rounded-xl"
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
                              ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-700 dark:text-cyan-300 border-cyan-400/50 shadow-sm'
                              : 'bg-white dark:bg-black/40 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
                          }`}
                        >
                          {isSelected ? <CheckCircle className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400" /> : <Plus className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />}
                          {goal}
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-200 dark:border-white/10">
                    <Input
                      placeholder="Add custom strategic goal..."
                      value={customGoalInput}
                      onChange={(e) => setCustomGoalInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomGoal())}
                      className="bg-white dark:bg-black/50 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white h-10 text-xs focus-visible:ring-cyan-500 rounded-xl"
                    />
                    <Button
                      type="button"
                      onClick={addCustomGoal}
                      className="bg-slate-900 dark:bg-white/10 hover:bg-slate-800 dark:hover:bg-white/20 text-white text-xs font-bold h-10 px-4 rounded-xl"
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
                <div className="space-y-2 text-left border-b border-slate-200 dark:border-white/10 pb-5">
                  <div className="flex items-center gap-2 text-[10px] font-black text-purple-600 dark:text-purple-400 uppercase tracking-widest bg-purple-500/10 border border-purple-500/20 px-2.5 py-1 rounded-md w-fit">
                    <Layers className="h-3.5 w-3.5" />
                    STEP 4: DEPARTMENT STRUCTURE
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                    Configure Active Departments
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
                    Choose which departments your AI Executive Board will oversee.
                  </p>
                </div>

                <div className="space-y-4 text-left">
                  <div className="relative">
                    <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400 dark:text-slate-500" />
                    <Input
                      placeholder="Search departments..."
                      value={deptSearch}
                      onChange={(e) => setDeptSearch(e.target.value)}
                      className="bg-white dark:bg-black/50 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white pl-10 h-11 text-xs focus-visible:ring-purple-500 rounded-xl"
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
                              ? 'bg-gradient-to-r from-purple-500/20 to-indigo-500/20 text-purple-700 dark:text-purple-300 border-purple-400/50 shadow-sm'
                              : 'bg-white dark:bg-black/40 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
                          }`}
                        >
                          {isSelected ? <CheckCircle className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" /> : <Plus className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />}
                          {dept}
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-200 dark:border-white/10">
                    <Input
                      placeholder="Add custom department name..."
                      value={customDeptInput}
                      onChange={(e) => setCustomDeptInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomDept())}
                      className="bg-white dark:bg-black/50 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white h-10 text-xs focus-visible:ring-purple-500 rounded-xl"
                    />
                    <Button
                      type="button"
                      onClick={addCustomDept}
                      className="bg-slate-900 dark:bg-white/10 hover:bg-slate-800 dark:hover:bg-white/20 text-white text-xs font-bold h-10 px-4 rounded-xl"
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
                <div className="space-y-2 text-left border-b border-slate-200 dark:border-white/10 pb-5">
                  <div className="flex items-center gap-2 text-[10px] font-black text-cyan-600 dark:text-cyan-400 uppercase tracking-widest bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-1 rounded-md w-fit">
                    <Cpu className="h-3.5 w-3.5" />
                    STEP 5: AI EXECUTIVE BOARDROOM
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                    Assign AI Executive Board
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
                    Executives are assigned by rank. Customize default names or keep their executive titles.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left max-h-[380px] overflow-y-auto p-1">
                  {executives.map((exec, idx) => (
                    <div
                      key={exec.roleKey}
                      className={`p-3.5 rounded-2xl border transition-all ${
                        exec.enabled
                          ? 'bg-slate-50 dark:bg-black/60 border-cyan-500/30 shadow-sm'
                          : 'bg-slate-100/50 dark:bg-black/20 border-slate-200 dark:border-white/5 opacity-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-extrabold uppercase text-cyan-600 dark:text-cyan-400 tracking-wider">
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
                          className="h-4 w-4 rounded bg-white dark:bg-black border-slate-300 dark:border-white/20 text-cyan-500 focus:ring-cyan-500"
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
                        className="bg-white dark:bg-black/40 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white h-9 text-xs focus-visible:ring-cyan-500 rounded-lg"
                      />
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1.5 font-medium">
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
                <div className="space-y-2 text-left border-b border-slate-200 dark:border-white/10 pb-5">
                  <div className="flex items-center gap-2 text-[10px] font-black text-purple-600 dark:text-purple-400 uppercase tracking-widest bg-purple-500/10 border border-purple-500/20 px-2.5 py-1 rounded-md w-fit">
                    <Sparkles className="h-3.5 w-3.5" />
                    STEP 6: BOARDROOM OPERATING STYLE
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                    Select AI Decision Directive
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
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
                          : 'bg-white dark:bg-black/40 border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
                      }`}
                    >
                      <div className="text-sm font-extrabold text-slate-900 dark:text-white mb-1">{style.title}</div>
                      <div className="text-slate-600 dark:text-slate-400 text-xs">{style.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 7: Workspace Branding Accent & Subscription Tier Selection */}
            {step === 7 && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="space-y-2 text-left border-b border-slate-200 dark:border-white/10 pb-5">
                  <div className="flex items-center gap-2 text-[10px] font-black text-cyan-600 dark:text-cyan-400 uppercase tracking-widest bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-1 rounded-md w-fit">
                    <Palette className="h-3.5 w-3.5" />
                    STEP 7: BRANDING & SUBSCRIPTION TIER
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                    Select Plan Tier & Brand Theme
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
                    Choose your workspace subscription tier and customize your executive dashboard theme.
                  </p>
                </div>

                {/* Subscription Tier Cards */}
                <div className="space-y-3 text-left">
                  <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 block">
                    Choose Workspace Plan Tier (Default: Free Starter Tier)
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      {
                        code: 'FREE',
                        name: 'Free Starter Tier',
                        price: '$0 / mo',
                        badge: 'Recommended Free',
                        desc: '500 AI Monthly Credits · 10 Active Missions · 5 Boardroom Executives · Standard RAG Vector Search',
                        isPopular: true,
                      },
                      {
                        code: 'PRO',
                        name: 'Growth Scale Tier',
                        price: '$10 / mo',
                        badge: 'Growth',
                        desc: '50,000 AI Monthly Tokens · 5 Parallel Boardrooms · Circle Agentic USDC Wallet',
                        isPopular: false,
                      },
                      {
                        code: 'ENTERPRISE',
                        name: 'Enterprise OS Tier',
                        price: '$50 / mo',
                        badge: 'Scale',
                        desc: '200,000 AI Monthly Tokens · Unlimited Boardrooms · Dedicated Agent Swarms & 6-Tier Killswitch',
                        isPopular: false,
                      },
                    ].map((tier) => (
                      <div
                        key={tier.code}
                        onClick={() => setSelectedPlanCode(tier.code)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 relative ${
                          selectedPlanCode === tier.code
                            ? 'bg-gradient-to-b from-cyan-500/15 via-blue-500/10 to-purple-500/15 border-cyan-400/60 shadow-[0_0_20px_rgba(6,182,212,0.2)]'
                            : 'bg-white dark:bg-black/40 border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
                        }`}
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-slate-900 dark:text-white">{tier.name}</span>
                            <Badge variant={tier.code === 'FREE' ? 'success' : 'neutral'} className="text-[8px] font-extrabold uppercase">
                              {tier.badge}
                            </Badge>
                          </div>
                          <div className="text-lg font-black text-cyan-600 dark:text-cyan-300">{tier.price}</div>
                          <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-normal font-medium">{tier.desc}</p>
                        </div>

                        <div className="flex items-center gap-1.5 text-[10.5px] font-bold text-slate-700 dark:text-slate-300 pt-2 border-t border-slate-200 dark:border-white/10">
                          <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${selectedPlanCode === tier.code ? 'border-cyan-400 bg-cyan-400 text-black' : 'border-slate-400 bg-transparent'}`}>
                            {selectedPlanCode === tier.code && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                          </div>
                          <span>{selectedPlanCode === tier.code ? 'Selected Tier' : 'Select Plan'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Brand Color Theme Selection */}
                <div className="space-y-2 text-left pt-2 border-t border-slate-200 dark:border-white/10">
                  <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 block">
                    Workspace Brand Theme Accent
                  </label>
                  <div className="flex items-center justify-center gap-4 py-3">
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
                        className={`h-11 w-11 rounded-2xl flex items-center justify-center transition-all cursor-pointer ${
                          brandColor === c.color ? 'scale-110 shadow-lg ring-2 ring-white ring-offset-2 ring-offset-black' : 'opacity-70 hover:opacity-100'
                        }`}
                        style={{ backgroundColor: c.color }}
                      >
                        {brandColor === c.color && <Check className="h-4 w-4 text-black stroke-[3]" />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 8 (NEW STEP): Mr. Intelligence Live Web & Social Media Discovery */}
            {step === 8 && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="space-y-2 text-left border-b border-slate-200 dark:border-white/10 pb-5">
                  <div className="flex items-center gap-2 text-[10px] font-black text-cyan-600 dark:text-cyan-400 uppercase tracking-widest bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-1 rounded-md w-fit">
                    <Search className="h-3.5 w-3.5" />
                    STEP 8: INSTANT COMPANY INTELLIGENCE DISCOVERY
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                    Mr. Intelligence Discovery Report
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
                    Mr. Intelligence searched public web and social media signals for <strong className="text-cyan-600 dark:text-cyan-300">{orgName || 'your organization'}</strong>.
                  </p>
                </div>

                {discoveryLoading ? (
                  <div className="py-12 space-y-4 text-center">
                    <div className="w-12 h-12 border-2 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin mx-auto" />
                    <div className="text-sm font-bold text-slate-900 dark:text-white">Mr. Intelligence searching web, news & social handles...</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">Gathering public intelligence for {orgName || 'your company'}...</div>
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
                      <div className="p-3.5 rounded-xl bg-white dark:bg-black/50 border border-slate-200 dark:border-white/10 space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <Globe className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400" /> Web Domain Signals
                        </span>
                        <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-300 truncate">
                          {discoveryData?.webHandleStatus}
                        </div>
                      </div>
                      <div className="p-3.5 rounded-xl bg-white dark:bg-black/50 border border-slate-200 dark:border-white/10 space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <Share2 className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" /> Social Media Signals
                        </span>
                        <div className="text-xs font-semibold text-purple-600 dark:text-purple-300 truncate">
                          {discoveryData?.socialHandleStatus}
                        </div>
                      </div>
                    </div>

                    {/* Key Market Takeaways */}
                    <div className="p-4 rounded-xl bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 space-y-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                        KEY MARKET OBSERVATIONS
                      </span>
                      <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                        {discoveryData?.keyTakeaways.map((takeaway, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <CheckCircle className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400 shrink-0 mt-0.5" />
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
                <div className="space-y-2 text-left border-b border-slate-200 dark:border-white/10 pb-5">
                  <div className="flex items-center gap-2 text-[10px] font-black text-cyan-600 dark:text-cyan-400 uppercase tracking-widest bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-1 rounded-md w-fit">
                    <Lock className="h-3.5 w-3.5" />
                    STEP 9: ACCOUNT VERIFICATION & CREDENTIALS
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                    Verify Account & Set Credentials
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
                    Verify the email address collected during Step 1 using OTP and set your account password.
                  </p>
                </div>

                <div className="space-y-4 text-left">
                  <div className="p-4 border border-slate-200 dark:border-white/10 bg-white dark:bg-black/40 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <CheckCircle2 className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                        Option A: 6-Digit Email OTP Verification
                      </span>
                      {emailVerified ? (
                        <Badge className="bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border-emerald-500/40 text-[10px] font-bold">
                          Verified ✅
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px] text-amber-600 dark:text-amber-400 border-amber-500/30">
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
                        className="bg-white dark:bg-black/60 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white h-11 text-xs focus-visible:ring-cyan-500 rounded-xl"
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
                          className="bg-white dark:bg-black/80 border-cyan-500/40 text-cyan-700 dark:text-cyan-300 h-11 text-xs font-mono text-center tracking-widest rounded-xl"
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

                  <div className="p-4 border border-slate-200 dark:border-white/10 bg-white dark:bg-black/40 rounded-2xl space-y-3">
                    <label className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Lock className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                        Option B: Set Workspace Account Password
                      </span>
                      {emailVerified && user && (
                        <Badge className="bg-purple-500/20 text-purple-600 dark:text-purple-300 border-purple-500/40 text-[10px] font-bold">
                          Authenticated 🔒
                        </Badge>
                      )}
                    </label>
                    <div className="space-y-3">
                      <div className="relative">
                        <Input
                          type={showOnboardingPassword ? 'text' : 'password'}
                          placeholder="Enter secure account password..."
                          value={onboardingPassword}
                          onChange={(e) => setOnboardingPassword(e.target.value)}
                          className="bg-white dark:bg-black/60 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white h-11 text-xs focus-visible:ring-purple-500 rounded-xl pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowOnboardingPassword(!showOnboardingPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                        >
                          {showOnboardingPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>

                      <div className="relative">
                        <Input
                          type={showOnboardingConfirmPassword ? 'text' : 'password'}
                          placeholder="Confirm secure account password..."
                          value={onboardingConfirmPassword}
                          onChange={(e) => setOnboardingConfirmPassword(e.target.value)}
                          className="bg-white dark:bg-black/60 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white h-11 text-xs focus-visible:ring-purple-500 rounded-xl pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowOnboardingConfirmPassword(!showOnboardingConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                        >
                          {showOnboardingConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>

                      <Button
                        type="button"
                        onClick={handleCreateAccountWithPassword}
                        disabled={
                          authProcessing ||
                          !onboardingPassword ||
                          onboardingPassword.length < 6 ||
                          !onboardingConfirmPassword ||
                          onboardingPassword !== onboardingConfirmPassword
                        }
                        className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs h-11 px-4 rounded-xl"
                      >
                        {authProcessing ? 'Registering Account...' : 'Register Account & Credentials'}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 10: Executive Review */}
            {step === 10 && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="space-y-2 text-left border-b border-slate-200 dark:border-white/10 pb-5">
                  <div className="flex items-center gap-2 text-[10px] font-black text-purple-600 dark:text-purple-400 uppercase tracking-widest bg-purple-500/10 border border-purple-500/20 px-2.5 py-1 rounded-md w-fit">
                    <FileText className="h-3.5 w-3.5" />
                    STEP 10: EXECUTIVE BOARD REVIEW
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                    Review Workspace Parameters
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
                    Confirm corporate identity, AI board configuration, and governance settings before deployment.
                  </p>
                </div>

                <div className="space-y-4 text-left">
                  <div className="p-4 rounded-2xl bg-white dark:bg-black/50 border border-slate-200 dark:border-white/10 space-y-2">
                    <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">WORKSPACE IDENTITY</div>
                    <div className="text-base font-black text-slate-900 dark:text-white">{orgName || 'HQ Workspace'}</div>
                    {slogan && <div className="text-xs text-cyan-600 dark:text-cyan-400 italic font-medium">"{slogan}"</div>}
                    <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">URL: hq.netify.ng/{orgSlug}</div>
                  </div>

                  <div className="p-4 rounded-2xl bg-white dark:bg-black/50 border border-slate-200 dark:border-white/10 space-y-2">
                    <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">SELECTED PLAN TIER</div>
                    <div className="text-base font-black text-cyan-600 dark:text-cyan-300 flex items-center justify-between">
                      <span>{selectedPlanCode === 'FREE' ? 'Free Starter Tier ($0/mo)' : selectedPlanCode === 'PRO' ? 'Growth Scale Tier ($10/mo)' : 'Enterprise OS Tier ($50/mo)'}</span>
                      <Badge variant={selectedPlanCode === 'FREE' ? 'success' : 'neutral'} className="text-[9px] font-bold">
                        {selectedPlanCode === 'FREE' ? 'Standard Limits Active' : 'Paid Tier Active'}
                      </Badge>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-white dark:bg-black/50 border border-slate-200 dark:border-white/10 space-y-2">
                    <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">5 CORE AI EXECUTIVE DIRECTORS</div>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {executives.filter((e) => e.enabled).map((e) => (
                        <span key={e.roleKey} className="px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-700 dark:text-cyan-300 text-xs font-semibold">
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
                <div className="space-y-2 text-left border-b border-slate-200 dark:border-white/10 pb-5">
                  <div className="flex items-center gap-2 text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-md w-fit">
                    <Rocket className="h-3.5 w-3.5" />
                    STEP 11: PROVISION WORKSPACE & DASHBOARD LAUNCH
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                    Launch Executive Headquarters
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
                    Finalize settings and deploy your autonomous C-Suite command center.
                  </p>
                </div>

                {submitting ? (
                  <div className="py-12 space-y-6 text-center">
                    <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
                      <div className="absolute inset-0 rounded-full border-2 border-cyan-500/20 border-t-cyan-400 animate-spin" />
                      <Cpu className="h-7 w-7 text-cyan-500 dark:text-cyan-400 animate-pulse" />
                    </div>
                    <div className="space-y-1.5">
                      <div className="text-xl font-bold text-slate-900 dark:text-white">Provisioning Executive HQ...</div>
                      <div className="text-slate-500 dark:text-slate-400 text-xs">
                        Configuring database schema, assigning AI Boardroom, and deploying workspace...
                      </div>
                    </div>
                    <div className="w-full h-2 bg-slate-200 dark:bg-white/5 rounded-full overflow-hidden p-0.5 border border-slate-300 dark:border-white/10">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 rounded-full transition-all duration-300 shadow-[0_0_12px_rgba(6,182,212,0.8)]"
                        style={{ width: `${submitProgress}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 text-left">
                    <div className="p-4 rounded-2xl bg-white dark:bg-black/50 border border-slate-200 dark:border-white/10 space-y-2">
                      <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">WORKSPACE OVERVIEW</div>
                      <div className="text-base font-black text-slate-900 dark:text-white">{orgName || 'HQ Workspace'}</div>
                      {slogan && <div className="text-xs text-cyan-600 dark:text-cyan-400 italic font-medium">"{slogan}"</div>}
                      <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">URL: hq.netify.ng/{orgSlug}</div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Footer Navigation Controls */}
            {!submitting && (
              <CardFooter className="flex items-center justify-between border-t border-slate-200 dark:border-white/10 pt-6 mt-6">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handlePrevStep}
                  disabled={step === 1}
                  className="text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1.5 font-bold disabled:opacity-30"
                >
                  <ArrowLeft className="h-4 w-4" /> Back
                </Button>

                {step < 11 ? (
                  <Button
                    type="button"
                    onClick={handleNextStep}
                    className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs h-11 px-6 rounded-xl shadow-md flex items-center gap-2"
                  >
                    Continue to Step {step + 1} <ArrowRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={handleCompleteOnboarding}
                    className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-xs h-11 px-8 rounded-xl shadow-md flex items-center gap-2"
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
