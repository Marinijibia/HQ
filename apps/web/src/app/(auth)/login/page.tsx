'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../../contexts/auth-context';
import { HQLogo } from '../../../components/hq-logo';
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
import { Lock, Mail, ArrowLeft, CheckCircle2, Sparkles, Cpu, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const { user, token, signInWithEmail } = useAuth();
  const router = useRouter();

  const [authMode, setAuthMode] = React.useState<'password' | 'otp'>('password');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [otpSent, setOtpSent] = React.useState(false);
  const [otpCode, setOtpCode] = React.useState('');
  const [authLoading, setAuthLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null);

  // Countdown timer for OTP resend
  const [resendCountdown, setResendCountdown] = React.useState(0);

  // Forgot Password Modal State
  const [showForgotPassword, setShowForgotPassword] = React.useState(false);
  const [forgotEmail, setForgotEmail] = React.useState('');
  const [forgotLoading, setForgotLoading] = React.useState(false);

  // Loading Headquarters Animation State
  const [loadingHq, setLoadingHq] = React.useState(false);
  const [loadProgress, setLoadProgress] = React.useState(0);

  // Auto-redirect authenticated user to /dashboard — only once auth context confirms session
  React.useEffect(() => {
    if (user && token && !loadingHq) {
      router.push('/dashboard');
    }
  }, [user, token, loadingHq, router]);

  React.useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  // Animate progress bar while waiting for auth context to confirm session
  React.useEffect(() => {
    if (loadingHq) {
      const interval = setInterval(() => {
        setLoadProgress((prev) => {
          // Advance quickly to 85% then hold — final push happens when user+token arrive
          if (prev >= 85) {
            clearInterval(interval);
            return 85;
          }
          return prev + 15;
        });
      }, 200);
      return () => clearInterval(interval);
    }
  }, [loadingHq]);

  // Complete redirect once auth context confirms user + token are ready
  React.useEffect(() => {
    if (loadingHq && user && token) {
      setLoadProgress(100);
      // Small delay for the visual fill to reach 100% before navigation
      const t = setTimeout(() => router.push('/dashboard'), 300);
      return () => clearTimeout(t);
    }
  }, [loadingHq, user, token, router]);

  // Safety timeout: if auth context hasn't confirmed within 10s, redirect anyway
  React.useEffect(() => {
    if (!loadingHq) return;
    const timeout = setTimeout(() => {
      router.push('/dashboard');
    }, 10000);
    return () => clearTimeout(timeout);
  }, [loadingHq, router]);

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!email || !email.includes('@')) {
      setError('Please enter a valid executive email address.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setAuthLoading(true);
    try {
      await signInWithEmail(email, password);
      setLoadingHq(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed. Please check your credentials.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!email || !email.includes('@')) {
      setError('Please enter a valid executive email address.');
      return;
    }

    setAuthLoading(true);
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to dispatch verification OTP');
      }

      setOtpSent(true);
      setResendCountdown(60);
      setSuccessMsg(`Secure 6-digit access token sent to ${email}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send OTP email.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!otpCode || otpCode.length !== 6) {
      setError('Please enter the complete 6-digit verification code.');
      return;
    }

    setAuthLoading(true);
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: otpCode }),
      });

      // Read response body once — used for both error message and customToken
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Invalid or expired OTP code');
      }

      // Store the server session token — auth context will pick it up on next fetch
      if (data.sessionToken) {
        localStorage.setItem('hq_auth_token', data.sessionToken);
      }
      setLoadingHq(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'OTP Verification failed.');
    } finally {
      setAuthLoading(false);
    }
  };



  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!forgotEmail || !forgotEmail.includes('@')) {
      setError('Please enter your executive email address.');
      return;
    }

    setForgotLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Password reset request failed');
      }

      setSuccessMsg(`Password reset instructions sent to ${forgotEmail}`);
      setShowForgotPassword(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Password reset failed.');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#050508] text-foreground flex flex-col justify-between font-sans relative overflow-hidden animate-in fade-in duration-500">
      {/* Ambient Lighting Glows */}
      <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-cyan-500/10 dark:bg-cyan-500/15 blur-[120px] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#94a3b8_1px,transparent_1px)] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />

      {/* Header */}
      <header className="flex h-20 items-center justify-between border-b border-slate-200 dark:border-white/10 px-6 sm:px-12 bg-white/80 dark:bg-[#0A0B10]/60 backdrop-blur-2xl relative z-10">
        <div className="flex items-center space-x-3">
          <HQLogo size={28} />
          <div className="flex flex-col text-left">
            <span className="font-black tracking-tight text-slate-900 dark:text-white text-base flex items-center gap-2">
              HQ <span className="bg-gradient-to-r from-cyan-500 to-purple-500 bg-clip-text text-transparent text-xs font-bold uppercase tracking-widest">OS</span>
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium tracking-wide">Executive AI Operating Platform</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="outline" className="border-cyan-500/30 bg-cyan-500/10 text-cyan-600 dark:text-cyan-300 text-[11px] font-semibold px-3 py-1 rounded-full flex items-center gap-1.5 backdrop-blur-md">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-500 animate-ping" />
            LIVE SECURITY GATEWAY
          </Badge>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 relative z-10 my-8">
        <div className="w-full max-w-md">
          <Card className="border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0A0B10]/85 backdrop-blur-3xl shadow-lg dark:shadow-[0_0_50px_rgba(6,182,212,0.15)] text-foreground p-4 rounded-3xl relative overflow-hidden transition-all duration-300">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600" />

            {error && (
              <div className="bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-300 text-xs p-3.5 m-2 mb-0 rounded-2xl text-center font-semibold flex items-center justify-center gap-2 animate-in fade-in slide-in-from-top-2">
                <span>⚠️</span> {error}
              </div>
            )}

            {successMsg && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-300 text-xs p-3.5 m-2 mb-0 rounded-2xl text-center font-semibold flex items-center justify-center gap-2 animate-in fade-in slide-in-from-top-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" /> {successMsg}
              </div>
            )}

            {loadingHq ? (
              <CardHeader className="text-center space-y-6 py-12">
                <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-2 border-cyan-500/20 border-t-cyan-500 animate-spin" />
                  <Cpu className="h-7 w-7 text-cyan-500 animate-pulse" />
                </div>
                <div className="space-y-1.5">
                  <CardTitle className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                    Unlocking Headquarters
                  </CardTitle>
                  <CardDescription className="text-slate-500 dark:text-slate-400 text-xs tracking-wider uppercase font-semibold">
                    Initializing Autonomous Executive Boardroom...
                  </CardDescription>
                </div>
                <div className="w-full h-2 bg-slate-200 dark:bg-white/5 rounded-full overflow-hidden p-0.5 border border-slate-300 dark:border-white/10">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-full transition-all duration-300"
                    style={{ width: `${loadProgress}%` }}
                  />
                </div>
              </CardHeader>
            ) : showForgotPassword ? (
              <>
                <CardHeader className="text-left space-y-2 pt-2">
                  <CardTitle className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
                    <Mail className="h-6 w-6 text-cyan-500" />
                    Reset Password
                  </CardTitle>
                  <CardDescription className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
                    Enter your registered executive email. A secure password reset link will be dispatched via Resend.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-2">
                  <form onSubmit={handleForgotPassword} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Executive Email</label>
                      <Input
                        type="email"
                        placeholder="executive@company.com"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        required
                        className="bg-slate-100 dark:bg-black/50 border-slate-300 dark:border-white/10 text-slate-900 dark:text-white h-11 text-xs focus-visible:ring-cyan-500 rounded-xl placeholder:text-slate-400 dark:placeholder:text-slate-600"
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={forgotLoading}
                      className="w-full h-11 bg-cyan-500 hover:bg-cyan-400 text-white font-bold text-xs rounded-xl shadow-md transition-all"
                    >
                      {forgotLoading ? 'Sending Instructions...' : 'Dispatch Reset Password Email'}
                    </Button>
                  </form>
                </CardContent>
                <CardFooter className="pt-2 border-t border-slate-200 dark:border-white/10 mt-2">
                  <Button
                    variant="ghost"
                    onClick={() => setShowForgotPassword(false)}
                    className="w-full text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center justify-center gap-1.5 font-semibold"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" /> Return to Executive Sign In
                  </Button>
                </CardFooter>
              </>
            ) : (
              <>
                <CardHeader className="text-left space-y-2 pb-2 pt-2">
                  <div className="flex items-center gap-2 text-[10px] font-black text-cyan-600 dark:text-cyan-400 uppercase tracking-widest bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-1 rounded-md w-fit">
                    <Sparkles className="h-3 w-3" />
                    AUTONOMOUS COMMAND GATEWAY
                  </div>
                  <CardTitle className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
                    <Lock className="h-6 w-6 text-cyan-500" />
                    Enter Headquarters
                  </CardTitle>
                  <CardDescription className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
                    Authenticate to access your executive suite and AI boardroom.
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-5 text-left pt-2">
                  {/* Mode Toggles */}
                  <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-black/60 rounded-xl border border-slate-200 dark:border-white/10">
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('password');
                        setError(null);
                      }}
                      className={`py-2.5 text-xs font-extrabold rounded-lg flex items-center justify-center gap-2 transition-all ${
                        authMode === 'password'
                          ? 'bg-cyan-500 text-white shadow-sm'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <Lock className="h-3.5 w-3.5" /> Password
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('otp');
                        setError(null);
                      }}
                      className={`py-2.5 text-xs font-extrabold rounded-lg flex items-center justify-center gap-2 transition-all ${
                        authMode === 'otp'
                          ? 'bg-cyan-500 text-white shadow-sm'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <Mail className="h-3.5 w-3.5" /> Resend OTP Email
                    </button>
                  </div>

                  {authMode === 'password' ? (
                    <form onSubmit={handlePasswordLogin} className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Executive Email</label>
                        <Input
                          type="email"
                          placeholder="executive@company.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="bg-slate-100 dark:bg-black/50 border-slate-300 dark:border-white/10 text-slate-900 dark:text-white h-11 text-xs focus-visible:ring-cyan-500 rounded-xl placeholder:text-slate-400 dark:placeholder:text-slate-600"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center">
                          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Password</label>
                          <button
                            type="button"
                            onClick={() => setShowForgotPassword(true)}
                            className="text-[11px] font-semibold text-cyan-600 dark:text-cyan-400 hover:underline"
                          >
                            Forgot Password?
                          </button>
                        </div>
                        <div className="relative">
                          <Input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="••••••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="bg-slate-100 dark:bg-black/50 border-slate-300 dark:border-white/10 text-slate-900 dark:text-white h-11 text-xs focus-visible:ring-cyan-500 rounded-xl placeholder:text-slate-400 dark:placeholder:text-slate-600 pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>

                      <Button
                        type="submit"
                        disabled={authLoading}
                        className="w-full h-11 bg-cyan-500 hover:bg-cyan-400 text-white font-bold text-xs rounded-xl shadow-md transition-all"
                      >
                        {authLoading ? 'Authenticating...' : 'Sign In with Password'}
                      </Button>
                    </form>
                  ) : (
                    <form onSubmit={otpSent ? handleVerifyOtp : handleSendOtp} className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Executive Email</label>
                        <Input
                          type="email"
                          placeholder="executive@company.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          disabled={otpSent}
                          required
                          className="bg-slate-100 dark:bg-black/50 border-slate-300 dark:border-white/10 text-slate-900 dark:text-white h-11 text-xs focus-visible:ring-cyan-500 rounded-xl placeholder:text-slate-400 dark:placeholder:text-slate-600"
                        />
                      </div>

                      {otpSent && (
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">6-Digit Verification Code</label>
                          <Input
                            type="text"
                            maxLength={6}
                            placeholder="849201"
                            value={otpCode}
                            onChange={(e) => setOtpCode(e.target.value)}
                            required
                            className="bg-slate-100 dark:bg-black/50 border-slate-300 dark:border-white/10 text-slate-900 dark:text-white h-11 text-center font-mono text-lg tracking-[8px] focus-visible:ring-cyan-500 rounded-xl"
                          />
                        </div>
                      )}

                      <Button
                        type="submit"
                        disabled={authLoading}
                        className="w-full h-11 bg-cyan-500 hover:bg-cyan-400 text-white font-bold text-xs rounded-xl shadow-md transition-all"
                      >
                        {authLoading
                          ? 'Processing Request...'
                          : otpSent
                          ? 'Verify OTP & Enter'
                          : 'Send 6-Digit Verification Code'}
                      </Button>
                    </form>
                  )}

                </CardContent>

                <CardFooter className="py-3 text-center flex flex-col gap-1 border-t border-slate-200 dark:border-white/10 mt-2">
                  <Link
                    href="/onboarding"
                    className="mx-auto text-xs font-bold text-slate-600 dark:text-foreground/50 hover:text-cyan-500 transition-colors"
                  >
                    Don't have an enterprise workspace? Register here &rarr;
                  </Link>
                </CardFooter>
              </>
            )}
          </Card>
        </div>
      </main>

      <footer className="h-14 flex items-center justify-center border-t border-slate-200 dark:border-white/10 text-[11px] font-bold text-slate-500 dark:text-foreground/45 relative z-10 bg-white/40 dark:bg-card-bg/10">
        <span>© 2026 HQ Inc. | Zero-Trust Authentication Engine</span>
      </footer>
    </div>
  );
}
