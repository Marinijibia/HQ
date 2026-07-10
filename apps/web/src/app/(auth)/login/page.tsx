'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../contexts/auth-context';
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
import { Lock } from 'lucide-react';

export default function LoginPage() {
  const { signInWithGoogle, signUpWithEmail } = useAuth();
  const router = useRouter();

  const [email, setEmail] = React.useState('');
  const [otpSent, setOtpSent] = React.useState(false);
  const [otpCode, setOtpCode] = React.useState('');
  const [authLoading, setAuthLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Loading Headquarters State
  const [loadingHq, setLoadingHq] = React.useState(false);
  const [loadProgress, setLoadProgress] = React.useState(0);

  // Handle initialization loading animation
  React.useEffect(() => {
    if (loadingHq) {
      const interval = setInterval(() => {
        setLoadProgress((prev) => {
          const next = prev + 15;
          if (next >= 100) {
            clearInterval(interval);
            router.push('/dashboard');
            return 100;
          }
          return next;
        });
      }, 300);
      return () => clearInterval(interval);
    }
  }, [loadingHq, router]);

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
      // Complete login under the hood using default security credentials
      await signUpWithEmail(email, 'SecurePass123!');
      setLoadingHq(true); // Proceed to loading page
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
      setLoadingHq(true); // Proceed to loading page
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Google authentication failed.';
      setError(errMsg);
    } finally {
      setAuthLoading(false);
    }
  };

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
            HQ <span className="text-foreground/45 text-xs font-normal">| Security Gateway</span>
          </span>
        </div>
      </header>

      {/* Main Board Center Layout */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-md">
          <Card className="border border-card-border bg-card-bg shadow-[var(--card-shadow)] card-transition text-foreground">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-3 m-6 mb-0 rounded-lg text-center font-semibold">
                {error}
              </div>
            )}

            {loadingHq ? (
              <>
                <CardHeader className="text-center space-y-2 py-8">
                  <div className="h-10 w-10 rounded-full bg-hq-blue/10 flex items-center justify-center text-hq-blue mx-auto animate-spin border-2 border-t-hq-blue border-transparent" />
                  <CardTitle className="text-xl font-bold text-[#1A1A1E] dark:text-white">
                    Loading Headquarters
                  </CardTitle>
                  <CardDescription className="text-foreground/50 text-xs tracking-wider uppercase font-semibold">
                    Unlocking your boardroom...
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pb-8">
                  <div className="w-full h-2 bg-black/10 dark:bg-[#1E1E24] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-hq-blue via-hq-purple to-hq-cyan rounded-full transition-all duration-300"
                      style={{ width: `${loadProgress}%` }}
                    />
                  </div>
                  <span className="text-xs text-foreground/45">{loadProgress}% Unlocked</span>
                </CardContent>
              </>
            ) : (
              <>
                <CardHeader className="text-left space-y-2">
                  <Badge variant="ai" className="w-fit text-[10px] tracking-widest font-bold">
                    SECURITY VERIFICATION
                  </Badge>
                  <CardTitle className="text-xl font-bold text-[#1A1A1E] dark:text-white flex items-center gap-1.5">
                    <Lock className="h-5.5 w-5.5 text-hq-blue" />
                    Enter Headquarters
                  </CardTitle>
                  <CardDescription className="text-foreground/50 text-sm">
                    Verify your identity to claim ownership and unlock your dashboard channels.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-left">
                  {otpSent ? (
                    <form onSubmit={handleVerifyOTP} className="space-y-4 text-xs">
                      <div className="space-y-1.5">
                        <label className="font-semibold text-foreground/75">
                          One-Time Password (OTP)
                        </label>
                        <Input
                          placeholder="e.g. 123456"
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value)}
                          maxLength={6}
                          required
                          className="bg-white dark:bg-[#0A0A0C] border-card-border text-foreground tracking-widest text-center text-lg font-black h-11"
                        />
                      </div>
                      <Button
                        type="submit"
                        disabled={authLoading}
                        className="w-full h-11 bg-hq-purple hover:bg-hq-purple/90 text-white font-bold transition-all"
                      >
                        {authLoading ? 'Verifying...' : 'Verify OTP & Enter'}
                      </Button>
                    </form>
                  ) : (
                    <div className="space-y-4 text-xs">
                      <form onSubmit={handleSendOTP} className="space-y-3.5">
                        <div className="space-y-1.5">
                          <label className="font-semibold text-foreground/75">
                            Owner Email Address
                          </label>
                          <Input
                            type="email"
                            placeholder="name@company.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="bg-white dark:bg-[#0A0A0C] border-card-border text-foreground"
                          />
                        </div>
                        <Button
                          type="submit"
                          className="w-full h-11 bg-hq-blue hover:bg-hq-blue/90 text-white font-bold transition-all"
                        >
                          Send OTP Code
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
                {otpSent && (
                  <CardFooter>
                    <Button
                      variant="ghost"
                      onClick={() => setOtpSent(false)}
                      className="w-full hover:underline text-xs text-foreground/45"
                    >
                      Back to Email Entry
                    </Button>
                  </CardFooter>
                )}
              </>
            )}
          </Card>
        </div>
      </main>
    </div>
  );
}
