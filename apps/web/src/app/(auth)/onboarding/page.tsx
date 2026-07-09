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
} from '@hq/ui';
import {
  ArrowRight,
  ArrowLeft,
  Building,
  Sliders,
  ShieldCheck,
  User,
  Sparkles,
  Users,
} from 'lucide-react';
import { useAuth } from '../../../contexts/auth-context';

export default function OnboardingPage() {
  const { user, signInWithGoogle, signUpWithEmail } = useAuth();
  const router = useRouter();

  const [step, setStep] = React.useState(1);
  const [error, setError] = React.useState<string | null>(null);

  // Step 1: About You State
  const [firstName, setFirstName] = React.useState('');
  const [lastName, setLastName] = React.useState('');
  const [userTitle, setUserTitle] = React.useState('');

  // Step 2: Business Profile State
  const [orgName, setOrgName] = React.useState('');
  const [orgSlug, setOrgSlug] = React.useState('');
  const [teamSize, setTeamSize] = React.useState('1-10');
  const [industry, setIndustry] = React.useState('Technology');

  // Step 3: Boardroom Preferences State
  const [creativity, setCreativity] = React.useState(70);
  const [tone, setTone] = React.useState('Professional');

  // Step 4: Register Auth State
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [authLoading, setAuthLoading] = React.useState(false);

  React.useEffect(() => {
    // If user is already authenticated outside onboarding, auto-jump to last step
    if (user && step < 4) {
      setStep(4);
    }
  }, [user, step]);

  const stepsList = ['About You', 'Business Profile', 'Boardroom Config', 'Verify Identity'];

  const handleNextStep = () => {
    setError(null);
    if (step === 1) {
      if (!firstName || !lastName || !userTitle) {
        setError('Please fill in your profile details.');
        return;
      }
    }
    if (step === 2) {
      if (!orgName || !orgSlug) {
        setError('Please specify your organization credentials.');
        return;
      }
    }
    setStep((prev) => prev + 1);
  };

  const handleRegisterEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError('Please provide registration email and password.');
      return;
    }
    setAuthLoading(true);
    try {
      await signUpWithEmail(email, password);
      // Wait a brief moment, then forward to first mission config setup
      router.push('/onboarding/first-mission');
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Registration failed. Try again.';
      setError(errMsg);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRegisterGoogle = async () => {
    setError(null);
    setAuthLoading(true);
    try {
      await signInWithGoogle();
      router.push('/onboarding/first-mission');
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Google authentication failed.';
      setError(errMsg);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleCompleteSetupMock = () => {
    router.push('/onboarding/first-mission');
  };

  return (
    <div className="min-h-screen bg-[#030303] text-[#F2F2F7] flex flex-col justify-between font-sans relative overflow-hidden select-none">
      {/* Decorative Dot Grid Background */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e1e24_1px,transparent_1px)] [background-size:16px_16px] opacity-20 pointer-events-none"></div>

      {/* Navigation Header */}
      <header className="flex h-16 items-center justify-between border-b border-[#1E1E24]/60 px-6 sm:px-12 bg-black/40 backdrop-blur-xl relative z-10">
        <div className="flex items-center space-x-2.5">
          <div className="h-7 w-7 rounded-md bg-gradient-to-tr from-hq-blue to-hq-purple flex items-center justify-center font-bold text-white text-xs shadow-[0_0_15px_rgba(14,165,233,0.2)]">
            HQ
          </div>
          <span className="font-extrabold tracking-tight text-white text-base">
            HQ{' '}
            <span className="text-foreground/45 text-xs font-normal">| Onboarding Workspace</span>
          </span>
        </div>
        <div className="text-xs text-foreground/45 bg-[#1E1E24]/40 border border-[#1E1E24] px-2.5 py-1 rounded-md">
          Step {step} of 4: {stepsList[step - 1]}
        </div>
      </header>

      {/* Main Form Center Layout */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 relative z-10">
        {/* Core Vision Panel */}
        <div className="w-full max-w-xl mb-6 text-center">
          <p className="text-[10px] text-hq-cyan font-bold tracking-widest uppercase mb-2 flex items-center justify-center gap-1.5">
            <Sparkles className="h-3 w-3 animate-pulse" />
            Our Vision
          </p>
          <p className="text-xs text-foreground/50 italic max-w-lg mx-auto leading-relaxed">
            &ldquo;HQ exists to help every business, regardless of size, make better decisions
            through an AI executive team that learns, collaborates, and grows with the
            organization.&rdquo;
          </p>
        </div>

        <div className="w-full max-w-xl">
          {/* Progress Bar Indicator */}
          <div className="flex justify-between items-center gap-2 mb-8">
            {stepsList.map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                  idx + 1 <= step ? 'bg-gradient-to-r from-hq-blue to-hq-purple' : 'bg-[#1E1E24]'
                }`}
              />
            ))}
          </div>

          <Card className="border border-[#1E1E24]/60 bg-black/40 backdrop-blur-xl shadow-level-5 text-white">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-3 m-6 mb-0 rounded-lg text-center font-semibold">
                {error}
              </div>
            )}

            {/* Step 1: About You */}
            {step === 1 && (
              <>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl font-bold text-white">
                    <User className="h-5 w-5 text-hq-blue" />
                    About You
                  </CardTitle>
                  <CardDescription className="text-foreground/50 text-xs">
                    Let us get to know you to customize boardroom communications
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-xs">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5 text-left">
                      <label className="font-semibold text-foreground/75">First Name</label>
                      <Input
                        placeholder="Elena"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="bg-[#0A0A0C] border-[#1E1E24] text-white"
                      />
                    </div>
                    <div className="space-y-1.5 text-left">
                      <label className="font-semibold text-foreground/75">Last Name</label>
                      <Input
                        placeholder="Rostova"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="bg-[#0A0A0C] border-[#1E1E24] text-white"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5 text-left">
                    <label className="font-semibold text-foreground/75">Your Corporate Title</label>
                    <Input
                      placeholder="e.g. CEO, Chief Marketing Officer, Founder"
                      value={userTitle}
                      onChange={(e) => setUserTitle(e.target.value)}
                      className="bg-[#0A0A0C] border-[#1E1E24] text-white"
                    />
                  </div>
                </CardContent>
              </>
            )}

            {/* Step 2: Business Profile */}
            {step === 2 && (
              <>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl font-bold text-white">
                    <Building className="h-5 w-5 text-hq-purple" />
                    Business Profile
                  </CardTitle>
                  <CardDescription className="text-foreground/50 text-xs">
                    Define organizational parameters and company scales
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-xs">
                  <div className="space-y-1.5 text-left">
                    <label className="font-semibold text-foreground/75">
                      Company / Business Name
                    </label>
                    <Input
                      placeholder="e.g. Acme Corporation"
                      value={orgName}
                      onChange={(e) => {
                        setOrgName(e.target.value);
                        setOrgSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'));
                      }}
                      className="bg-[#0A0A0C] border-[#1E1E24] text-white"
                    />
                  </div>
                  <div className="space-y-1.5 text-left">
                    <label className="font-semibold text-foreground/75">HQ Workspace Slug</label>
                    <Input
                      value={orgSlug}
                      onChange={(e) => setOrgSlug(e.target.value)}
                      className="bg-[#0A0A0C] border-[#1E1E24] text-white"
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5 text-left">
                      <label className="font-semibold text-foreground/75">Team Size</label>
                      <select
                        value={teamSize}
                        onChange={(e) => setTeamSize(e.target.value)}
                        className="h-9 w-full rounded-md border border-[#1E1E24] bg-[#0A0A0C] px-3 text-sm text-foreground focus:outline-none"
                      >
                        <option value="1-10">1-10 members</option>
                        <option value="11-50">11-50 members</option>
                        <option value="51-200">51-200 members</option>
                        <option value="201+">201+ members</option>
                      </select>
                    </div>
                    <div className="space-y-1.5 text-left">
                      <label className="font-semibold text-foreground/75">Industry Sector</label>
                      <select
                        value={industry}
                        onChange={(e) => setIndustry(e.target.value)}
                        className="h-9 w-full rounded-md border border-[#1E1E24] bg-[#0A0A0C] px-3 text-sm text-foreground focus:outline-none"
                      >
                        <option value="Technology">Technology & SaaS</option>
                        <option value="Energy & Petroleum">Energy & Petroleum</option>
                        <option value="Financial Scale">Finance & Accounting</option>
                        <option value="Consulting">Consulting & Agency</option>
                      </select>
                    </div>
                  </div>
                </CardContent>
              </>
            )}

            {/* Step 3: Boardroom Configuration */}
            {step === 3 && (
              <>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl font-bold text-white">
                    <Sliders className="h-5 w-5 text-hq-cyan" />
                    Boardroom Configuration
                  </CardTitle>
                  <CardDescription className="text-foreground/50 text-xs">
                    Choose initial settings for your executive AI team
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 text-xs">
                  {/* Seeded Board Info */}
                  <div className="space-y-2.5 p-3 border border-[#1E1E24] bg-[#0A0A0C]/50 rounded-lg">
                    <p className="font-semibold text-foreground/75 mb-1.5 flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5 text-hq-blue" />
                      Seeded AI Directors List
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      <span className="bg-hq-blue/10 border border-hq-blue/30 text-hq-blue text-[9px] px-2 py-0.5 rounded-full font-bold">
                        CEO (Elena Rostova)
                      </span>
                      <span className="bg-hq-purple/10 border border-hq-purple/30 text-hq-purple text-[9px] px-2 py-0.5 rounded-full font-bold">
                        COS (Arthur Steward)
                      </span>
                      <span className="bg-hq-cyan/10 border border-hq-cyan/30 text-hq-cyan text-[9px] px-2 py-0.5 rounded-full font-bold">
                        Eng. Director (Linus Kovacs)
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 text-left">
                    <div className="flex justify-between font-semibold text-foreground/75">
                      <span>Reasoning Creativity</span>
                      <span>{creativity}%</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      value={creativity}
                      onChange={(e) => setCreativity(parseInt(e.target.value, 10))}
                      className="w-full accent-hq-blue cursor-pointer h-1 bg-[#1E1E24] rounded"
                    />
                  </div>

                  <div className="space-y-1.5 text-left">
                    <label className="font-semibold text-foreground/75">Default Comm. Tone</label>
                    <select
                      value={tone}
                      onChange={(e) => setTone(e.target.value)}
                      className="h-9 w-full rounded-md border border-[#1E1E24] bg-[#0A0A0C] px-3 text-sm text-foreground focus:outline-none"
                    >
                      <option value="Professional">Professional & Direct</option>
                      <option value="Analytical">Analytical & Technical</option>
                      <option value="Creative">Creative & Explanatory</option>
                    </select>
                  </div>
                </CardContent>
              </>
            )}

            {/* Step 4: Verify Identity / Auth */}
            {step === 4 && (
              <>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl font-bold text-white">
                    <ShieldCheck className="h-5 w-5 text-hq-cyan" />
                    Verify Headquarters Identity
                  </CardTitle>
                  <CardDescription className="text-foreground/50 text-xs">
                    Create your profile account credentials to deploy your HQ Workspace
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-xs">
                  {user ? (
                    <div className="bg-[#070D19]/45 border border-hq-blue/30 rounded-lg p-4 text-center space-y-3">
                      <p className="text-foreground/85 font-semibold">
                        Identity successfully verified!
                      </p>
                      <div className="text-[10px] text-foreground/50">
                        Authenticated as: <span className="font-mono text-white">{user.email}</span>
                      </div>
                      <Button
                        onClick={handleCompleteSetupMock}
                        className="w-full bg-gradient-to-r from-hq-blue to-hq-purple text-white font-bold h-10 border-none transition-all shadow-[0_0_15px_rgba(14,165,233,0.2)]"
                      >
                        Launch My Boardroom
                      </Button>
                    </div>
                  ) : (
                    <>
                      {/* Email / Password Form */}
                      <form onSubmit={handleRegisterEmail} className="space-y-4">
                        <div className="space-y-1.5 text-left">
                          <label className="font-semibold text-foreground/75">Email Address</label>
                          <Input
                            type="email"
                            placeholder="name@company.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="bg-[#0A0A0C] border-[#1E1E24] text-white"
                          />
                        </div>
                        <div className="space-y-1.5 text-left">
                          <label className="font-semibold text-foreground/75">Password</label>
                          <Input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="bg-[#0A0A0C] border-[#1E1E24] text-white"
                          />
                        </div>
                        <Button
                          type="submit"
                          disabled={authLoading}
                          className="w-full h-10 bg-hq-blue hover:bg-hq-blue/90 text-white font-semibold text-sm transition-all"
                        >
                          {authLoading ? 'Registering...' : 'Register with Email'}
                        </Button>
                      </form>

                      {/* Divider */}
                      <div className="flex items-center my-4">
                        <div className="flex-grow border-t border-[#1E1E24]"></div>
                        <span className="px-3 text-[10px] text-foreground/45 uppercase tracking-wider">
                          Or
                        </span>
                        <div className="flex-grow border-t border-[#1E1E24]"></div>
                      </div>

                      {/* Google Auth SSO */}
                      <Button
                        onClick={handleRegisterGoogle}
                        disabled={authLoading}
                        variant="outline"
                        className="w-full h-10 border-[#1E1E24] bg-[#0A0A0C] text-white hover:bg-[#1E1E24]/20 flex items-center justify-center gap-2 font-semibold text-xs transition-all"
                      >
                        Authenticate using Google
                      </Button>
                    </>
                  )}
                </CardContent>
              </>
            )}

            {/* Footer Navigation Buttons */}
            <CardFooter className="flex justify-between border-t border-[#1E1E24]/60 pt-4">
              {step > 1 && (!user || step < 4) ? (
                <Button
                  variant="outline"
                  className="text-xs h-9 border-[#1E1E24] text-foreground/70"
                  onClick={() => setStep(step - 1)}
                >
                  <ArrowLeft className="mr-1.5 h-4 w-4" />
                  Back
                </Button>
              ) : (
                <div />
              )}

              {step < 4 ? (
                <Button
                  variant="primary"
                  className="text-xs h-9 bg-hq-blue text-white"
                  onClick={handleNextStep}
                >
                  Next Step
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </Button>
              ) : null}
            </CardFooter>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="h-16 flex items-center justify-center border-t border-[#1E1E24]/50 bg-black/40 text-xs text-foreground/45 z-10 relative">
        <span>© 2026 HQ Inc. Empowering startups and enterprise teams.</span>
      </footer>
    </div>
  );
}
