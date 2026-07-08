'use client';

import * as React from 'react';
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
} from '@hq/ui';
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Building,
  Target,
  Sliders,
  Shield,
} from 'lucide-react';

export default function OnboardingPage() {
  const [step, setStep] = React.useState(1);

  // Form configurations state
  const [email, setEmail] = React.useState('');
  const [orgName, setOrgName] = React.useState('');
  const [orgSlug, setOrgSlug] = React.useState('');
  const [hqName, setHqName] = React.useState('');
  const [industry, setHqIndustry] = React.useState('Technology');
  const [goals, setGoals] = React.useState<string[]>([]);
  const [creativity, setCreativity] = React.useState(70);
  const [tone, setTone] = React.useState('Professional');

  const handleToggleGoal = (goal: string) => {
    setGoals((prev) => (prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]));
  };

  const stepsList = [
    'Account Auth',
    'Organization',
    'Headquarters',
    'Strategic Goals',
    'Meet C-Suite',
    'AI Preferences',
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0C] text-[#F2F2F7] flex flex-col justify-between font-sans select-none">
      {/* Navigation Header */}
      <header className="flex h-16 items-center justify-between border-b border-hq-graphite/40 px-6 sm:px-12 bg-hq-graphite/10 backdrop-blur-md">
        <div className="flex items-center space-x-2">
          <div className="h-7 w-7 rounded-md bg-gradient-to-tr from-hq-blue to-hq-purple flex items-center justify-center font-bold text-white text-sm">
            HQ
          </div>
          <span className="font-bold tracking-tight text-white text-lg">HQ Onboarding</span>
        </div>
        <div className="text-xs text-foreground/45">
          Step {step} of 6: {stepsList[step - 1]}
        </div>
      </header>

      {/* Main Form Center Layout */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-xl">
          {/* Progress Bar Indicator */}
          <div className="flex justify-between items-center gap-1.5 mb-8">
            {stepsList.map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                  idx + 1 <= step ? 'bg-hq-blue' : 'bg-hq-graphite/60'
                }`}
              />
            ))}
          </div>

          <Card className="border border-hq-graphite/40 bg-hq-graphite/20">
            {/* Step 1: Account Authentication */}
            {step === 1 && (
              <>
                <CardHeader>
                  <CardTitle>Account Authentication</CardTitle>
                  <CardDescription>
                    Setup your verified credentials identity profile
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-xs">
                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground/75">Email Address</label>
                    <Input
                      type="email"
                      placeholder="name@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <Button
                    variant="secondary"
                    className="w-full h-9 flex items-center justify-center gap-2"
                    onClick={() => setEmail('owner@hq.corp')}
                  >
                    <Shield className="h-4 w-4 text-hq-blue" />
                    Configure with Default Identity Profile
                  </Button>
                </CardContent>
              </>
            )}

            {/* Step 2: Organization Setup */}
            {step === 2 && (
              <>
                <CardHeader>
                  <CardTitle>Organization Parameters</CardTitle>
                  <CardDescription>Define organizational scopes and workspace tags</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-xs">
                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground/75">Organization Name</label>
                    <Input
                      placeholder="e.g. HQ Corporation"
                      value={orgName}
                      onChange={(e) => {
                        setOrgName(e.target.value);
                        setOrgSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'));
                      }}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground/75">Workspace Slug</label>
                    <Input value={orgSlug} onChange={(e) => setOrgSlug(e.target.value)} />
                  </div>
                </CardContent>
              </>
            )}

            {/* Step 3: Headquarters config */}
            {step === 3 && (
              <>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5 text-hq-blue" />
                    Headquarters Parameters
                  </CardTitle>
                  <CardDescription>Specify business unit scales</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-xs">
                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground/75">HQ Name</label>
                    <Input
                      placeholder="e.g. London Headquarters"
                      value={hqName}
                      onChange={(e) => setHqName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground/75">Industry Sector</label>
                    <select
                      value={industry}
                      onChange={(e) => setHqIndustry(e.target.value)}
                      className="h-9 w-full rounded-md border border-hq-graphite/40 bg-hq-graphite/30 px-3 text-sm text-foreground focus:outline-none"
                    >
                      <option value="Technology">Technology</option>
                      <option value="Energy & Petroleum">Energy & Petroleum</option>
                      <option value="Finance & Venture">Finance & Venture</option>
                      <option value="Consulting">Consulting</option>
                    </select>
                  </div>
                </CardContent>
              </>
            )}

            {/* Step 4: Goal Config selectors */}
            {step === 4 && (
              <>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-hq-purple" />
                    Strategic Goals
                  </CardTitle>
                  <CardDescription>
                    Select metrics targets to customize workspace suggestions
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    {[
                      'Content Generation',
                      'Market Outreach',
                      'Legal Compliance',
                      'Technical Auditing',
                      'Financial Scale',
                      'Operations Efficiency',
                    ].map((g) => {
                      const isSelected = goals.includes(g);
                      return (
                        <button
                          type="button"
                          key={g}
                          onClick={() => handleToggleGoal(g)}
                          className={`rounded-lg p-4 text-left border text-xs font-semibold transition-all ${
                            isSelected
                              ? 'bg-hq-purple/10 border-hq-purple text-white shadow'
                              : 'bg-hq-graphite/30 border-hq-graphite/40 text-foreground/75 hover:border-hq-graphite/60'
                          }`}
                        >
                          {g}
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </>
            )}

            {/* Step 5: Meet C-Suite Board */}
            {step === 5 && (
              <>
                <CardHeader>
                  <CardTitle>Meet the C-Suite</CardTitle>
                  <CardDescription>Your seeded Board of Directors is ready</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 border border-hq-graphite/30 bg-hq-graphite/10 rounded-lg text-xs">
                      <div className="h-8 w-8 rounded-full bg-hq-blue/20 flex items-center justify-center font-bold text-hq-blue text-xs uppercase shrink-0">
                        ER
                      </div>
                      <div>
                        <p className="font-bold text-white">Elena Rostova (CEO)</p>
                        <p className="text-foreground/50 italic">
                          &ldquo;I lead the board alignment and evaluate target goals.&rdquo;
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-3 border border-hq-graphite/30 bg-hq-graphite/10 rounded-lg text-xs">
                      <div className="h-8 w-8 rounded-full bg-hq-purple/20 flex items-center justify-center font-bold text-hq-purple text-xs uppercase shrink-0">
                        LK
                      </div>
                      <div>
                        <p className="font-bold text-white">
                          Linus Kovacs (Software Eng. Director)
                        </p>
                        <p className="text-foreground/50 italic">
                          &ldquo;I configure git workflows and code compile steps.&rdquo;
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-3 border border-hq-graphite/30 bg-hq-graphite/10 rounded-lg text-xs">
                      <div className="h-8 w-8 rounded-full bg-hq-cyan/20 flex items-center justify-center font-bold text-hq-cyan text-xs uppercase shrink-0">
                        RA
                      </div>
                      <div>
                        <p className="font-bold text-white">
                          Rashid Al-Mansoori (Petroleum Director)
                        </p>
                        <p className="text-foreground/50 italic">
                          &ldquo;I verify compliance with energy and logistics standards.&rdquo;
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </>
            )}

            {/* Step 6: AI Preferences */}
            {step === 6 && (
              <>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sliders className="h-5 w-5 text-hq-blue" />
                    AI Preferences
                  </CardTitle>
                  <CardDescription>Tune reasoning weights and default tone types</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 text-xs">
                  <div className="space-y-2">
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
                      className="w-full accent-hq-blue cursor-pointer h-1 bg-hq-graphite rounded"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground/75">Default Tone</label>
                    <select
                      value={tone}
                      onChange={(e) => setTone(e.target.value)}
                      className="h-9 w-full rounded-md border border-hq-graphite/40 bg-hq-graphite/30 px-3 text-sm text-foreground focus:outline-none"
                    >
                      <option value="Professional">Professional & Direct</option>
                      <option value="Analytical">Analytical & Technical</option>
                      <option value="Creative">Creative & Explanatory</option>
                    </select>
                  </div>
                </CardContent>
              </>
            )}

            {/* Footer Buttons */}
            <CardFooter className="flex justify-between border-t border-hq-graphite/20 pt-4">
              {step > 1 ? (
                <Button variant="outline" className="text-xs" onClick={() => setStep(step - 1)}>
                  <ArrowLeft className="mr-1.5 h-4 w-4" />
                  Back
                </Button>
              ) : (
                <div />
              )}

              {step < 6 ? (
                <Button variant="primary" className="text-xs" onClick={() => setStep(step + 1)}>
                  Next
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </Button>
              ) : (
                <Link href="/dashboard">
                  <Button
                    variant="success"
                    className="text-xs font-semibold flex items-center gap-1.5"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Complete Setup
                  </Button>
                </Link>
              )}
            </CardFooter>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="h-16 flex items-center justify-center border-t border-hq-graphite/40 bg-hq-graphite/20 text-xs text-foreground/45">
        <span>© 2026 HQ Inc. Multi-tenant Enterprise Layer.</span>
      </footer>
    </div>
  );
}
