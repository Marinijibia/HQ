'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
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
  Sliders,
  Sparkles,
  Users,
  Layers,
  Lock,
  Globe,
  Settings,
  Edit2,
  Cpu,
  Flame,
  TrendingUp,
  Briefcase,
} from 'lucide-react';
import { useAuth } from '../../../contexts/auth-context';

export default function OnboardingPage() {
  const { signInWithGoogle, signUpWithEmail } = useAuth();
  const router = useRouter();

  const [step, setStep] = React.useState(1);
  const [error, setError] = React.useState<string | null>(null);

  // Onboarding Data States
  // Step 3: Discovery
  const [orgName, setOrgName] = React.useState('');
  const [orgSlug, setOrgSlug] = React.useState('');
  const [industry, setIndustry] = React.useState('Technology');
  const [businessDesc, setBusinessDesc] = React.useState('');
  const [companySize, setCompanySize] = React.useState('1-10');

  // Step 4: Organization Profile
  const [timezone, setTimezone] = React.useState('UTC-5 (EST)');
  const [language, setLanguage] = React.useState('English');
  const [website, setWebsite] = React.useState('');
  const [customerType, setCustomerType] = React.useState('B2B');

  // Step 5: Goals (multi-select)
  const [goals, setGoals] = React.useState<string[]>([]);

  // Step 6: Configuration
  const [hqName, setHqName] = React.useState('');
  const [brandColor, setBrandColor] = React.useState('#0A84FF');
  const [ceoName, setCeoName] = React.useState('Elena Rostova');

  // Step 9: Authentication
  const [email, setEmail] = React.useState('');
  const [otpSent, setOtpSent] = React.useState(false);
  const [otpCode, setOtpCode] = React.useState('');
  const [authLoading, setAuthLoading] = React.useState(false);

  // Step 10: Initialization Progress
  const [initProgress, setInitProgress] = React.useState(0);
  const [initLabel, setInitLabel] = React.useState('Creating your Headquarters...');

  const goalOptions = [
    'Increase revenue',
    'Marketing & Outreach',
    'Product development',
    'Operations & Scaling',
    'Finance & Audits',
    'Customer support',
    'Strategy formulation',
  ];

  // Auto-synchronize HQ name with organization name
  React.useEffect(() => {
    if (orgName && !hqName) {
      setHqName(`${orgName} HQ`);
    }
  }, [orgName, hqName]);

  // Handle initialization loading animation for Step 10
  React.useEffect(() => {
    if (step === 10) {
      const interval = setInterval(() => {
        setInitProgress((prev) => {
          const next = prev + 10;
          if (next >= 100) {
            clearInterval(interval);
            setStep(11); // Proceed to CEO Greeting step
            return 100;
          }
          // Cycle through labels
          if (next > 80) setInitLabel('Finalizing setup...');
          else if (next > 65) setInitLabel('Securing your organization...');
          else if (next > 40) setInitLabel('Preparing your workspace...');
          else if (next > 20) setInitLabel('Configuring your Executive Team...');
          return next;
        });
      }, 500);
      return () => clearInterval(interval);
    }
  }, [step]);

  const handleNextStep = () => {
    setError(null);
    if (step === 3) {
      if (!orgName || !businessDesc) {
        setError('Please enter your organization name and business description.');
        return;
      }
    }
    setStep((prev) => prev + 1);
  };

  const handlePrevStep = () => {
    setError(null);
    setStep((prev) => prev - 1);
  };

  const toggleGoal = (goal: string) => {
    if (goals.includes(goal)) {
      setGoals(goals.filter((g) => g !== goal));
    } else {
      setGoals([...goals, goal]);
    }
  };

  // Step 9: Firebase registration handlers
  const handleSendOTP = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please provide your email address.');
      return;
    }
    setOtpSent(true);
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!otpCode || otpCode.length !== 6) {
      setError('Please enter a valid 6-digit OTP code.');
      return;
    }
    setAuthLoading(true);
    try {
      await signUpWithEmail(email, 'SecurePass123!');
      setStep(10); // Move to initialization step
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Activation failed. Please try again.';
      setError(errMsg);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleAuthGoogle = async () => {
    setError(null);
    setAuthLoading(true);
    try {
      await signInWithGoogle();
      setStep(10); // Move to initialization step
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Google authentication failed.';
      setError(errMsg);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLaunchFirstMission = () => {
    router.push('/onboarding/first-mission');
  };

  // Industry card configurations
  const industriesList = [
    { name: 'Technology', label: 'Tech & SaaS', icon: Cpu },
    { name: 'Energy', label: 'Energy & Petrol', icon: Flame },
    { name: 'Finance', label: 'Finance & Invest', icon: TrendingUp },
    { name: 'Consulting', label: 'Consulting', icon: Briefcase },
  ];

  // Company size configurations
  const sizesList = ['1-10', '11-50', '51-200', '200+'];

  // Customer type configurations
  const customerTypesList = [
    { type: 'B2B', label: 'B2B SaaS & Services' },
    { type: 'B2C', label: 'B2C Consumers' },
    { type: 'Developer', label: 'Developers & Tech' },
    { type: 'Enterprise', label: 'Large Corporations' },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between font-sans relative overflow-hidden select-none">
      {/* Decorative Dot Grid Background */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e1e24_1px,transparent_1px)] [background-size:16px_16px] opacity-10 dark:opacity-20 pointer-events-none"></div>

      {/* Navigation Header */}
      <header className="flex h-16 items-center justify-between border-b border-card-border px-6 sm:px-12 bg-card-bg/40 backdrop-blur-xl relative z-10">
        <div className="flex items-center space-x-2.5">
          <div className="h-7 w-7 rounded-md bg-gradient-to-tr from-hq-blue to-hq-purple flex items-center justify-center font-bold text-white text-xs shadow-[0_0_15px_rgba(14,165,233,0.2)]">
            HQ
          </div>
          <span className="font-extrabold tracking-tight text-foreground text-sm">
            HQ{' '}
            <span className="text-foreground/45 text-xs font-normal">| Onboarding Workspace</span>
          </span>
        </div>
        {step <= 11 && (
          <div className="text-xs text-foreground/50 bg-black/5 dark:bg-[#1E1E24]/40 border border-card-border px-3 py-1 rounded-lg font-bold">
            Step {step} of 11
          </div>
        )}
      </header>

      {/* Main Board Center Layout */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 relative z-10">
        {step <= 11 && (
          <div className="w-full max-w-xl mb-6 text-center space-y-2">
            <p className="text-xs text-hq-cyan font-bold tracking-widest uppercase flex items-center justify-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 animate-pulse" />
              Prepare Workspace
            </p>
            {/* Upgraded Progress Stepper indicator */}
            <div className="flex justify-between items-center gap-2 mt-4">
              {Array.from({ length: 11 }).map((_, idx) => (
                <div
                  key={idx}
                  className="h-1.5 flex-1 rounded-full transition-all duration-300"
                  style={{
                    backgroundColor: idx + 1 <= step ? brandColor : undefined,
                    opacity: idx + 1 <= step ? 1 : 0.15,
                  }}
                />
              ))}
            </div>
          </div>
        )}

        <div className="w-full max-w-xl">
          <Card className="border border-card-border bg-card-bg shadow-[var(--card-shadow)] card-transition text-foreground">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-3 m-6 mb-0 rounded-lg text-center font-semibold">
                {error}
              </div>
            )}

            {/* Step 1: Welcome to HQ */}
            {step === 1 && (
              <>
                <CardHeader className="text-left space-y-2">
                  <Badge variant="ai" className="w-fit text-[10px] tracking-widest font-bold">
                    WELCOME OWNER
                  </Badge>
                  <CardTitle className="text-2xl font-black text-[#1A1A1E] dark:text-white tracking-tight">
                    Establish Your Headquarters
                  </CardTitle>
                  <CardDescription className="text-foreground/50 text-sm sm:text-base leading-relaxed">
                    In approximately 5 minutes, we will map your business requirements and activate
                    a custom boardroom staffed with specialized AI executives.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-left">
                  <div className="space-y-4 text-sm text-foreground/75 leading-relaxed">
                    <p>
                      HQ behaves like a coordinated company. Instead of writing simple chats, you
                      assign missions. The AI Executives deliberate, delegate steps, and execute
                      workflows autonomously.
                    </p>
                    <div className="p-5 border border-card-border bg-black/5 dark:bg-[#1E1E24]/30 rounded-2xl space-y-3">
                      <h4 className="font-bold text-xs text-[#1A1A1E] dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                        <Lock className="h-4 w-4 text-hq-blue" />
                        Activation Prerequisites
                      </h4>
                      <ul className="text-xs text-foreground/50 space-y-2 list-none">
                        <li className="flex items-center gap-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-hq-blue" />
                          Understand your primary target audiences
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-hq-blue" />
                          Formulate short-term operational goals
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-hq-blue" />
                          Authenticate owner identity (Step 9)
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    onClick={handleNextStep}
                    className="w-full h-11 bg-hq-blue hover:bg-hq-blue/90 text-white font-bold flex items-center justify-center gap-1.5 shadow-[0_4px_15px_rgba(10,132,255,0.2)] hover:scale-[1.01] transition-all"
                  >
                    Let's Begin
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </>
            )}

            {/* Step 2: Setup Preparation */}
            {step === 2 && (
              <>
                <CardHeader className="text-left space-y-1">
                  <CardTitle className="text-2xl font-black text-[#1A1A1E] dark:text-white tracking-tight">
                    Onboarding Blueprint
                  </CardTitle>
                  <CardDescription className="text-foreground/50 text-sm">
                    Here is what we will configure before activating your workspace:
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 text-left text-sm text-foreground/75">
                  <div className="grid gap-5">
                    <div className="flex items-start gap-3.5">
                      <span className="h-8 w-8 rounded-xl bg-hq-blue/15 text-hq-blue font-black text-sm flex items-center justify-center shrink-0 border border-hq-blue/10">
                        1
                      </span>
                      <div>
                        <h4 className="font-bold text-[#1A1A1E] dark:text-white">
                          Discover Business Parameters
                        </h4>
                        <p className="text-xs text-foreground/50 mt-0.5">
                          Collect name, industry type, description, and team size.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3.5">
                      <span className="h-8 w-8 rounded-xl bg-hq-purple/15 text-hq-purple font-black text-sm flex items-center justify-center shrink-0 border border-hq-purple/10">
                        2
                      </span>
                      <div>
                        <h4 className="font-bold text-[#1A1A1E] dark:text-white">
                          Formulate Business Goals
                        </h4>
                        <p className="text-xs text-foreground/50 mt-0.5">
                          Specify exactly what you want the board to execute first.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3.5">
                      <span className="h-8 w-8 rounded-xl bg-hq-cyan/15 text-hq-cyan font-black text-sm flex items-center justify-center shrink-0 border border-hq-cyan/10">
                        3
                      </span>
                      <div>
                        <h4 className="font-bold text-[#1A1A1E] dark:text-white">
                          Assemble AI Executives
                        </h4>
                        <p className="text-xs text-foreground/50 mt-0.5">
                          Seed 25 distinct specialist AI profiles in your workspace.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex gap-4">
                  <Button
                    variant="outline"
                    onClick={handlePrevStep}
                    className="border-card-border h-11 flex items-center gap-1 font-semibold"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </Button>
                  <Button
                    onClick={handleNextStep}
                    className="flex-1 h-11 bg-hq-blue hover:bg-hq-blue/90 text-white font-bold flex items-center justify-center gap-1.5 shadow-[0_4px_15px_rgba(10,132,255,0.2)] hover:scale-[1.01] transition-all"
                  >
                    Setup Workspace
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </>
            )}

            {/* Step 3: Discover Your Business */}
            {step === 3 && (
              <>
                <CardHeader className="text-left space-y-1">
                  <CardTitle className="text-2xl font-black text-[#1A1A1E] dark:text-white tracking-tight flex items-center gap-2">
                    <Building className="h-6 w-6 text-hq-blue" />
                    Discover Your Business
                  </CardTitle>
                  <CardDescription className="text-foreground/50 text-sm">
                    Enter operational parameters to ground your board's context.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5 text-left text-sm">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="font-bold text-foreground/75">Company / Org Name</label>
                      <Input
                        placeholder="Acme Corp"
                        value={orgName}
                        onChange={(e) => {
                          setOrgName(e.target.value);
                          setOrgSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'));
                        }}
                        className="bg-white dark:bg-[#0A0A0C] border-card-border text-foreground"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="font-bold text-foreground/75">HQ Slug Link</label>
                      <Input
                        value={orgSlug}
                        disabled
                        className="bg-black/5 dark:bg-[#1E1E24]/20 border-card-border text-foreground/50"
                      />
                    </div>
                  </div>

                  {/* Upgraded Industry Card Selector */}
                  <div className="space-y-2 text-left">
                    <label className="font-bold text-foreground/75">Select Industry</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {industriesList.map((ind) => {
                        const Icon = ind.icon;
                        const isSelected = industry === ind.name;
                        return (
                          <button
                            key={ind.name}
                            type="button"
                            onClick={() => setIndustry(ind.name)}
                            className="p-3.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1.5"
                            style={{
                              borderColor: isSelected ? brandColor : undefined,
                              backgroundColor: isSelected ? brandColor + '0d' : undefined,
                              color: isSelected ? brandColor : undefined,
                            }}
                          >
                            <Icon className="h-5 w-5 shrink-0" />
                            <span className="text-[10px] font-bold tracking-tight leading-none">
                              {ind.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Upgraded Company Size Selector */}
                  <div className="space-y-2 text-left">
                    <label className="font-bold text-foreground/75">Company Size</label>
                    <div className="grid grid-cols-4 gap-3">
                      {sizesList.map((sz) => {
                        const isSelected = companySize === sz;
                        return (
                          <button
                            key={sz}
                            type="button"
                            onClick={() => setCompanySize(sz)}
                            className="h-10 rounded-xl border text-xs font-bold transition-all"
                            style={{
                              borderColor: isSelected ? brandColor : undefined,
                              backgroundColor: isSelected ? brandColor + '0d' : undefined,
                              color: isSelected ? brandColor : undefined,
                            }}
                          >
                            {sz}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-foreground/75">Business Description</label>
                    <textarea
                      placeholder="Describe what your organization sells, builds, or coordinates..."
                      value={businessDesc}
                      onChange={(e) => setBusinessDesc(e.target.value)}
                      className="h-20 w-full rounded-xl border border-card-border bg-white dark:bg-[#0A0A0C] px-3.5 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-hq-blue"
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex gap-4">
                  <Button
                    variant="outline"
                    onClick={handlePrevStep}
                    className="border-card-border h-11 flex items-center gap-1 font-semibold"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </Button>
                  <Button
                    onClick={handleNextStep}
                    className="flex-1 h-11 bg-hq-blue hover:bg-hq-blue/90 text-white font-bold flex items-center justify-center gap-1.5 shadow-[0_4px_15px_rgba(10,132,255,0.2)] hover:scale-[1.01] transition-all"
                  >
                    Continue
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </>
            )}

            {/* Step 4: Organization Profile */}
            {step === 4 && (
              <>
                <CardHeader className="text-left space-y-1">
                  <CardTitle className="text-2xl font-black text-[#1A1A1E] dark:text-white tracking-tight flex items-center gap-2">
                    <Globe className="h-6 w-6 text-hq-purple" />
                    Organization Profile
                  </CardTitle>
                  <CardDescription className="text-foreground/50 text-sm">
                    Configure localization preferences and target audience.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5 text-left text-sm">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="font-bold text-foreground/75">Time Zone</label>
                      <Input
                        value={timezone}
                        onChange={(e) => setTimezone(e.target.value)}
                        className="bg-white dark:bg-[#0A0A0C] border-card-border text-foreground"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="font-bold text-foreground/75">Language</label>
                      <Input
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="bg-white dark:bg-[#0A0A0C] border-card-border text-foreground"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-foreground/75">Website (Optional)</label>
                    <Input
                      placeholder="https://company.com"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      className="bg-white dark:bg-[#0A0A0C] border-card-border text-foreground"
                    />
                  </div>

                  {/* Upgraded Customer Type Selector */}
                  <div className="space-y-2 text-left">
                    <label className="font-bold text-foreground/75">Primary Customer Type</label>
                    <div className="grid grid-cols-2 gap-3">
                      {customerTypesList.map((cust) => {
                        const isSelected = customerType === cust.type;
                        return (
                          <button
                            key={cust.type}
                            type="button"
                            onClick={() => setCustomerType(cust.type)}
                            className="p-3.5 rounded-xl border text-center transition-all flex flex-col justify-center items-center"
                            style={{
                              borderColor: isSelected ? brandColor : undefined,
                              backgroundColor: isSelected ? brandColor + '0d' : undefined,
                              color: isSelected ? brandColor : undefined,
                            }}
                          >
                            <span className="text-xs font-bold">{cust.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex gap-4">
                  <Button
                    variant="outline"
                    onClick={handlePrevStep}
                    className="border-card-border h-11 flex items-center gap-1 font-semibold"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </Button>
                  <Button
                    onClick={handleNextStep}
                    className="flex-1 h-11 bg-hq-blue hover:bg-hq-blue/90 text-white font-bold flex items-center justify-center gap-1.5 shadow-[0_4px_15px_rgba(10,132,255,0.2)] hover:scale-[1.01] transition-all"
                  >
                    Continue
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </>
            )}

            {/* Step 5: Business Goals */}
            {step === 5 && (
              <>
                <CardHeader className="text-left space-y-1">
                  <CardTitle className="text-2xl font-black text-[#1A1A1E] dark:text-white tracking-tight flex items-center gap-2">
                    <Layers className="h-6 w-6 text-hq-cyan" />
                    Business Goals
                  </CardTitle>
                  <CardDescription className="text-foreground/50 text-sm">
                    Select exactly what you want the AI executives to help achieve first.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-left text-sm">
                  <div className="grid gap-3 sm:grid-cols-2">
                    {goalOptions.map((goal) => {
                      const isSelected = goals.includes(goal);
                      return (
                        <button
                          key={goal}
                          type="button"
                          onClick={() => toggleGoal(goal)}
                          className="p-3.5 rounded-xl border text-xs font-bold text-left transition-all flex items-center justify-between"
                          style={{
                            borderColor: isSelected ? brandColor : undefined,
                            backgroundColor: isSelected ? brandColor + '0d' : undefined,
                            color: isSelected ? brandColor : undefined,
                          }}
                        >
                          <span>{goal}</span>
                          {isSelected && (
                            <span
                              className="h-4 w-4 rounded-full flex items-center justify-center text-white text-[9px] font-bold"
                              style={{ backgroundColor: brandColor }}
                            >
                              ✓
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
                <CardFooter className="flex gap-4">
                  <Button
                    variant="outline"
                    onClick={handlePrevStep}
                    className="border-card-border h-11 flex items-center gap-1 font-semibold"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </Button>
                  <Button
                    onClick={handleNextStep}
                    disabled={goals.length === 0}
                    className="flex-1 h-11 bg-hq-blue hover:bg-hq-blue/90 text-white font-bold flex items-center justify-center gap-1.5 disabled:opacity-50 shadow-[0_4px_15px_rgba(10,132,255,0.2)]"
                  >
                    Continue
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </>
            )}

            {/* Step 6: Headquarters Configuration */}
            {step === 6 && (
              <>
                <CardHeader className="text-left space-y-1">
                  <CardTitle className="text-2xl font-black text-[#1A1A1E] dark:text-white tracking-tight flex items-center gap-2">
                    <Settings className="h-6 w-6 text-hq-blue" />
                    Headquarters Configuration
                  </CardTitle>
                  <CardDescription className="text-foreground/50 text-sm">
                    Set up your workspace name and visual identifiers (optional).
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5 text-left text-sm">
                  <div className="space-y-1.5">
                    <label className="font-bold text-foreground/75">Headquarters Name</label>
                    <Input
                      value={hqName}
                      onChange={(e) => setHqName(e.target.value)}
                      className="bg-white dark:bg-[#0A0A0C] border-card-border text-foreground"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-foreground/75">AI CEO Name</label>
                    <Input
                      value={ceoName}
                      onChange={(e) => setCeoName(e.target.value)}
                      placeholder="e.g. Elena Rostova"
                      className="bg-white dark:bg-[#0A0A0C] border-card-border text-foreground focus-visible:ring-hq-blue"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="font-bold text-foreground/75">Brand Theme Color</label>
                    <div className="flex gap-4">
                      {['#0A84FF', '#BF5AF2', '#30D158', '#FF9F0A', '#FF453A'].map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setBrandColor(color)}
                          style={{ backgroundColor: color }}
                          className={`h-10 w-10 rounded-full border-2 transition-all hover:scale-105 active:scale-95 shadow-[0_0_10px_rgba(0,0,0,0.15)] ${
                            brandColor === color
                              ? 'border-foreground scale-110 shadow-lg'
                              : 'border-transparent opacity-85'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex gap-4">
                  <Button
                    variant="outline"
                    onClick={handlePrevStep}
                    className="border-card-border h-11 flex items-center gap-1 font-semibold"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </Button>
                  <Button
                    onClick={handleNextStep}
                    className="flex-1 h-11 bg-hq-blue hover:bg-hq-blue/90 text-white font-bold flex items-center justify-center gap-1.5 shadow-[0_4px_15px_rgba(10,132,255,0.2)] hover:scale-[1.01] transition-all"
                  >
                    Assemble Team
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </>
            )}

            {/* Step 7: Meet Your Executive Team */}
            {step === 7 && (
              <>
                <CardHeader className="text-left space-y-1">
                  <CardTitle className="text-2xl font-black text-[#1A1A1E] dark:text-white tracking-tight flex items-center gap-2">
                    <Users className="h-6 w-6 text-hq-purple" />
                    Meet Your Executive Team
                  </CardTitle>
                  <CardDescription className="text-foreground/50 text-sm">
                    These pre-seeded AI specialized directors have been selected for your boardroom:
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-left max-h-[300px] overflow-y-auto pr-1">
                  <div className="grid gap-3">
                    <div className="p-4.5 border border-card-border bg-gradient-to-r from-hq-blue/5 to-transparent rounded-2xl flex items-center justify-between shadow-[var(--card-shadow)]">
                      <div className="space-y-0.5">
                        <h4 className="font-bold text-sm text-[#1A1A1E] dark:text-white">
                          {ceoName}
                        </h4>
                        <p className="text-xs text-foreground/45">
                          CEO & Strategic Owner Alignment
                        </p>
                      </div>
                      <Badge
                        variant="ai"
                        className="px-3.5 py-1 text-[10px] bg-hq-blue/15 border-hq-blue/30 text-hq-blue font-bold rounded-full"
                      >
                        CEO
                      </Badge>
                    </div>
                    <div className="p-4.5 border border-card-border bg-gradient-to-r from-hq-purple/5 to-transparent rounded-2xl flex items-center justify-between shadow-[var(--card-shadow)]">
                      <div className="space-y-0.5">
                        <h4 className="font-bold text-sm text-[#1A1A1E] dark:text-white">
                          Arthur Steward
                        </h4>
                        <p className="text-xs text-foreground/45">
                          COS — DAG Mission decomposition
                        </p>
                      </div>
                      <Badge
                        variant="premium"
                        className="px-3.5 py-1 text-[10px] bg-hq-purple/15 border-hq-purple/30 text-hq-purple font-bold rounded-full"
                      >
                        COS
                      </Badge>
                    </div>
                    <div className="p-4.5 border border-card-border bg-gradient-to-r from-hq-cyan/5 to-transparent rounded-2xl flex items-center justify-between shadow-[var(--card-shadow)]">
                      <div className="space-y-0.5">
                        <h4 className="font-bold text-sm text-[#1A1A1E] dark:text-white">
                          Linus Kovacs
                        </h4>
                        <p className="text-xs text-foreground/45">Eng Director — git validations</p>
                      </div>
                      <Badge
                        variant="ai"
                        className="px-3.5 py-1 text-[10px] bg-hq-cyan/15 border-hq-cyan/30 text-hq-cyan font-bold rounded-full"
                      >
                        Eng
                      </Badge>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex gap-4">
                  <Button
                    variant="outline"
                    onClick={handlePrevStep}
                    className="border-card-border h-11 flex items-center gap-1 font-semibold"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </Button>
                  <Button
                    onClick={handleNextStep}
                    className="flex-1 h-11 bg-hq-blue hover:bg-hq-blue/90 text-white font-bold flex items-center justify-center gap-1.5 shadow-[0_4px_15px_rgba(10,132,255,0.2)] hover:scale-[1.01] transition-all"
                  >
                    Review Setup
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </>
            )}

            {/* Step 8: Review Your Headquarters */}
            {step === 8 && (
              <>
                <CardHeader className="text-left space-y-1">
                  <CardTitle className="text-2xl font-black text-[#1A1A1E] dark:text-white tracking-tight flex items-center gap-2">
                    <Sliders className="h-6 w-6 text-hq-cyan" />
                    Review Your Headquarters
                  </CardTitle>
                  <CardDescription className="text-foreground/50 text-sm">
                    Confirm your details before activating your boardroom.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-left text-xs leading-relaxed max-h-[300px] overflow-y-auto pr-1">
                  <div className="grid gap-4">
                    <div className="p-4 border border-card-border bg-black/5 dark:bg-[#1E1E24]/20 rounded-2xl flex justify-between items-center">
                      <div>
                        <span className="font-bold text-foreground/45 block text-[10px] uppercase tracking-wider">
                          Organization Name
                        </span>
                        <span className="text-sm font-bold text-[#1A1A1E] dark:text-white">
                          {orgName}
                        </span>
                      </div>
                      <button
                        onClick={() => setStep(3)}
                        className="text-hq-blue flex items-center gap-1 hover:underline text-xs font-semibold"
                      >
                        <Edit2 className="h-3.5 w-3.5" /> Edit
                      </button>
                    </div>

                    <div className="p-4 border border-card-border bg-black/5 dark:bg-[#1E1E24]/20 rounded-2xl flex justify-between items-center">
                      <div>
                        <span className="font-bold text-foreground/45 block text-[10px] uppercase tracking-wider">
                          Time Zone & Language
                        </span>
                        <span className="text-sm font-bold text-[#1A1A1E] dark:text-white">
                          {timezone} ({language})
                        </span>
                      </div>
                      <button
                        onClick={() => setStep(4)}
                        className="text-hq-blue flex items-center gap-1 hover:underline text-xs font-semibold"
                      >
                        <Edit2 className="h-3.5 w-3.5" /> Edit
                      </button>
                    </div>

                    <div className="p-4 border border-card-border bg-black/5 dark:bg-[#1E1E24]/20 rounded-2xl flex justify-between items-center">
                      <div>
                        <span className="font-bold text-foreground/45 block text-[10px] uppercase tracking-wider">
                          AI CEO Name
                        </span>
                        <span className="text-sm font-bold text-[#1A1A1E] dark:text-white">
                          {ceoName}
                        </span>
                      </div>
                      <button
                        onClick={() => setStep(6)}
                        className="text-hq-blue flex items-center gap-1 hover:underline text-xs font-semibold"
                      >
                        <Edit2 className="h-3.5 w-3.5" /> Edit
                      </button>
                    </div>

                    <div className="p-4 border border-card-border bg-black/5 dark:bg-[#1E1E24]/20 rounded-2xl flex justify-between items-center">
                      <div>
                        <span className="font-bold text-foreground/45 block text-[10px] uppercase tracking-wider">
                          Goals Selection
                        </span>
                        <span className="text-sm font-bold text-[#1A1A1E] dark:text-white">
                          {goals.join(', ')}
                        </span>
                      </div>
                      <button
                        onClick={() => setStep(5)}
                        className="text-hq-blue flex items-center gap-1 hover:underline text-xs font-semibold"
                      >
                        <Edit2 className="h-3.5 w-3.5" /> Edit
                      </button>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex gap-4">
                  <Button
                    variant="outline"
                    onClick={handlePrevStep}
                    className="border-card-border h-11 flex items-center gap-1 font-semibold"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </Button>
                  <Button
                    onClick={handleNextStep}
                    className="flex-1 h-11 bg-hq-blue hover:bg-hq-blue/90 text-white font-bold flex items-center justify-center gap-1.5 shadow-[0_4px_15px_rgba(10,132,255,0.2)] hover:scale-[1.01] transition-all"
                  >
                    Activate HQ
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </>
            )}

            {/* Step 9: Activate Your Headquarters */}
            {step === 9 && (
              <>
                <CardHeader className="text-left space-y-1">
                  <CardTitle className="text-2xl font-black text-[#1A1A1E] dark:text-white tracking-tight flex items-center gap-2">
                    <Lock className="h-6 w-6 text-hq-blue" />
                    Activate Your Headquarters
                  </CardTitle>
                  <CardDescription className="text-foreground/50 text-sm">
                    Verify your identity to claim ownership and launch your boardroom.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-left">
                  {otpSent ? (
                    <form onSubmit={handleVerifyOTP} className="space-y-4 text-xs">
                      <div className="space-y-1.5 text-center">
                        <label className="font-bold text-foreground/75">
                          One-Time Password (OTP)
                        </label>
                        <Input
                          placeholder="e.g. 123456"
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value)}
                          maxLength={6}
                          required
                          className="bg-white dark:bg-[#0A0A0C] border-card-border text-foreground tracking-widest text-center text-lg font-black h-11 focus-visible:ring-hq-blue"
                        />
                        <p className="text-[10px] text-foreground/45 mt-2">
                          Enter the 6-digit activation code sent to your inbox.
                        </p>
                      </div>
                      <Button
                        type="submit"
                        disabled={authLoading}
                        className="w-full h-11 bg-hq-purple hover:bg-hq-purple/90 text-white font-bold transition-all shadow-[0_4px_15px_rgba(191,90,242,0.2)]"
                      >
                        {authLoading ? 'Verifying...' : 'Verify OTP & Activate'}
                      </Button>
                    </form>
                  ) : (
                    <div className="space-y-4 text-xs">
                      <form onSubmit={handleSendOTP} className="space-y-3.5">
                        <div className="space-y-1.5">
                          <label className="font-bold text-foreground/75">
                            Owner Email Address
                          </label>
                          <Input
                            type="email"
                            placeholder="name@company.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="bg-white dark:bg-[#0A0A0C] border-card-border text-foreground focus-visible:ring-hq-blue"
                          />
                        </div>
                        <Button
                          type="submit"
                          className="w-full h-11 bg-hq-blue hover:bg-hq-blue/90 text-white font-bold transition-all"
                        >
                          Continue with Email
                        </Button>
                      </form>

                      <div className="relative flex py-2 items-center">
                        <div className="flex-grow border-t border-card-border"></div>
                        <span className="flex-shrink mx-4 text-foreground/45 text-[10px] uppercase font-bold tracking-widest">
                          or
                        </span>
                        <div className="flex-grow border-t border-card-border"></div>
                      </div>

                      <Button
                        type="button"
                        onClick={handleAuthGoogle}
                        disabled={authLoading}
                        variant="outline"
                        className="w-full h-11 border-card-border hover:bg-black/5 dark:hover:bg-[#1E1E24]/20 transition-all text-sm font-semibold flex items-center justify-center gap-2"
                      >
                        Continue with Google
                      </Button>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button
                    variant="ghost"
                    onClick={handlePrevStep}
                    className="w-full hover:underline text-xs text-foreground/45"
                  >
                    Back to Review
                  </Button>
                </CardFooter>
              </>
            )}

            {/* Step 10: Headquarters Initialization Loader */}
            {step === 10 && (
              <>
                <CardHeader className="text-center space-y-2 py-8">
                  <div className="h-10 w-10 rounded-full bg-hq-blue/10 flex items-center justify-center text-hq-blue mx-auto animate-spin border-2 border-t-hq-blue border-transparent" />
                  <CardTitle className="text-xl font-bold text-[#1A1A1E] dark:text-white">
                    Initializing Headquarters
                  </CardTitle>
                  <CardDescription className="text-foreground/50 text-xs tracking-wider uppercase font-semibold">
                    {initLabel}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pb-8">
                  <div className="w-full h-2 bg-black/10 dark:bg-[#1E1E24] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-hq-blue via-hq-purple to-hq-cyan rounded-full transition-all duration-300"
                      style={{ width: `${initProgress}%` }}
                    />
                  </div>
                  <span className="text-xs text-foreground/45 font-bold">
                    {initProgress}% Complete
                  </span>
                </CardContent>
              </>
            )}

            {/* Step 11: Welcome to HQ / Greeting */}
            {step === 11 && (
              <>
                <CardHeader className="text-center space-y-4 py-8">
                  <div className="h-14 w-14 rounded-full bg-gradient-to-tr from-hq-blue via-[#8B5CF6] to-hq-purple flex items-center justify-center text-white border border-hq-cyan/20 shadow-[0_0_20px_rgba(10,132,255,0.3)] mx-auto animate-bounce">
                    <Sparkles className="h-7 w-7" />
                  </div>
                  <CardTitle className="text-3xl font-black text-[#1A1A1E] dark:text-white tracking-tight">
                    Welcome to HQ
                  </CardTitle>
                  <CardDescription className="text-xs text-hq-cyan font-bold uppercase tracking-wider">
                    Executive Boardroom Online
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-center">
                  <div className="p-5 border border-card-border bg-black/5 dark:bg-[#1E1E24]/20 rounded-2xl max-w-sm mx-auto shadow-[var(--card-shadow)]">
                    <p className="text-sm text-[#1A1A1E] dark:text-white leading-relaxed italic">
                      &ldquo;Welcome. Your Executive Team is online and ready to help you achieve
                      your goals.&rdquo;
                    </p>
                    <span className="block mt-3 text-[10px] text-foreground/45 uppercase tracking-widest font-bold">
                      — {ceoName}, CEO
                    </span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    onClick={handleLaunchFirstMission}
                    className="w-full h-11 bg-gradient-to-r from-hq-blue to-hq-purple text-white font-bold flex items-center justify-center gap-1.5 shadow-[0_4px_15px_rgba(10,132,255,0.3)] hover:scale-[1.01] transition-all"
                  >
                    Launch My First Mission
                    <ArrowRight className="h-4.5 w-4.5 animate-pulse" />
                  </Button>
                </CardFooter>
              </>
            )}
          </Card>
        </div>
      </main>
    </div>
  );
}
