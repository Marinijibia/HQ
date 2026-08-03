'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../../contexts/auth-context';
import { HQLogo } from '../../../components/hq-logo';
import { toast } from '../../../components/toast';
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
import { Lock, Mail, ArrowLeft, RefreshCw, CheckCircle2, KeyRound, Sparkles, ShieldCheck, Cpu } from 'lucide-react';

export default function LoginPage() {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail, refetchUser } = useAuth();
  const router = useRouter();

  const [authMode, setAuthMode] = React.useState<'password' | 'otp'>('password');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('SecurePass123!');
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

  React.useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  React.useEffect(() => {
    if (loadingHq) {
      const interval = setInterval(() => {
        setLoadProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 25;
        });
      }, 250);
      return () => clearInterval(interval);
    }
  }, [loadingHq]);

  React.useEffect(() => {
    if (loadProgress >= 100) {
      router.push('/dashboard');
    }
  }, [loadProgress, router]);

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
      await refetchUser();
      setLoadingHq(true);
    } catch (err) {
      try {
        await signUpWithEmail(email, password);
        await refetchUser();
        setLoadingHq(true);
      } catch (signUpErr) {
        setError(err instanceof Error ? err.message : 'Authentication failed.');
      }
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

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Verification code failed or expired');
      }

      try {
        await signInWithEmail(email, 'SecurePass123!');
      } catch {
        await signUpWithEmail(email, 'SecurePass123!');
      }

      await refetchUser();
      setLoadingHq(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'OTP verification failed.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setAuthLoading(true);
    try {
      await signInWithGoogle();
      await refetchUser();
      setLoadingHq(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google authentication failed.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!forgotEmail || !forgotEmail.includes('@')) {
      setError('Please enter a valid email address.');
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
    <div className="min-h-screen bg-[#050508] text-foreground flex flex-col justify-between font-sans relative overflow-hidden select-none animate-in fade-in duration-500">
      {/* Dynamic Luxury Ambient Glows */}
      <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-radial from-cyan-500/15 via-purple-600/10 to-transparent blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-radial from-blue-600/10 via-indigo-600/5 to-transparent blur-[140px] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />

      {/* Header */}
      <header className="flex h-20 items-center justify-between border-b border-white/10 px-6 sm:px-12 bg-[#0A0B10]/60 backdrop-blur-2xl relative z-10">
        <div className="flex items-center space-x-3">
          <HQLogo size={28} />
          <div className="flex flex-col">
            <span className="font-black tracking-tight text-white text-base flex items-center gap-2">
              HQ <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent text-xs font-bold uppercase tracking-widest">OS</span>
            </span>
            <span className="text-[10px] text-slate-400 font-medium tracking-wide">Executive AI Operating Platform</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="outline" className="border-cyan-500/30 bg-cyan-500/10 text-cyan-300 text-[11px] font-semibold px-3 py-1 rounded-full flex items-center gap-1.5 backdrop-blur-md">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping" />
            LIVE SECURITY GATEWAY
          </Badge>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 relative z-10 my-8">
        <div className="w-full max-w-md">
          <Card className="border border-white/10 bg-[#0A0B10]/85 backdrop-blur-3xl shadow-[0_0_50px_rgba(6,182,212,0.15)] text-foreground p-4 rounded-3xl relative overflow-hidden transition-all duration-300">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600" />

            {error && (
              <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs p-3.5 m-2 mb-0 rounded-2xl text-center font-semibold flex items-center justify-center gap-2 animate-in fade-in slide-in-from-top-2">
                <span>⚠️</span> {error}
              </div>
            )}

            {successMsg && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs p-3.5 m-2 mb-0 rounded-2xl text-center font-semibold flex items-center justify-center gap-2 animate-in fade-in slide-in-from-top-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" /> {successMsg}
              </div>
            )}

            {loadingHq ? (
              <CardHeader className="text-center space-y-6 py-12">
                <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-2 border-cyan-500/20 border-t-cyan-400 animate-spin" />
                  <Cpu className="h-7 w-7 text-cyan-400 animate-pulse" />
                </div>
                <div className="space-y-1.5">
                  <CardTitle className="text-2xl font-black tracking-tight bg-gradient-to-r from-white via-slate-200 to-cyan-300 bg-clip-text text-transparent">
                    Unlocking Headquarters
                  </CardTitle>
                  <CardDescription className="text-slate-400 text-xs tracking-wider uppercase font-semibold">
                    Initializing Autonomous Executive Boardroom...
                  </CardDescription>
                </div>
                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/10">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-full transition-all duration-300 shadow-[0_0_12px_rgba(6,182,212,0.8)]"
                    style={{ width: `${loadProgress}%` }}
                  />
                </div>
              </CardHeader>
            ) : showForgotPassword ? (
              <>
                <CardHeader className="text-left space-y-2 pt-2">
                  <CardTitle className="text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
                    <Mail className="h-6 w-6 text-cyan-400" />
                    Reset Password
                  </CardTitle>
                  <CardDescription className="text-slate-400 text-xs leading-relaxed">
                    Enter your registered executive email. A secure password reset link will be dispatched via Resend.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-2">
                  <form onSubmit={handleForgotPassword} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300">Executive Email</label>
                      <Input
                        type="email"
                        placeholder="executive@company.com"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        required
                        className="bg-black/50 border-white/10 text-white h-11 text-xs focus-visible:ring-cyan-500 rounded-xl placeholder:text-slate-600"
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={forgotLoading}
                      className="w-full h-11 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all"
                    >
                      {forgotLoading ? 'Sending Instructions...' : 'Dispatch Reset Password Email'}
                    </Button>
                  </form>
                </CardContent>
                <CardFooter className="pt-2 border-t border-white/10 mt-2">
                  <Button
                    variant="ghost"
                    onClick={() => setShowForgotPassword(false)}
                    className="w-full text-xs text-slate-400 hover:text-white flex items-center justify-center gap-1.5 font-semibold"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" /> Return to Executive Sign In
                  </Button>
                </CardFooter>
              </>
            ) : (
              <>
                <CardHeader className="text-left space-y-2 pb-2 pt-2">
                  <div className="flex items-center gap-2 text-[10px] font-black text-cyan-400 uppercase tracking-widest bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-1 rounded-md w-fit">
                    <Sparkles className="h-3 w-3" />
                    AUTONOMOUS COMMAND GATEWAY
                  </div>
                  <CardTitle className="text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
                    <Lock className="h-6 w-6 text-cyan-400" />
                    Enter Headquarters
                  </CardTitle>
                  <CardDescription className="text-slate-400 text-xs leading-relaxed">
                    Authenticate to access your executive suite and AI boardroom.
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-5 text-left pt-2">
                  {/* Mode Toggles */}
                  <div className="grid grid-cols-2 p-1 bg-black/60 rounded-xl border border-white/10">
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('password');
                        setError(null);
                      }}
                      className={`py-2.5 text-xs font-extrabold rounded-lg flex items-center justify-center gap-2 transition-all ${
                        authMode === 'password'
                          ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                          : 'text-slate-400 hover:text-white'
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
                          ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Mail className="h-3.5 w-3.5" /> Resend OTP Email
                    </button>
                  </div>

                  {/* Password Auth Form */}
                  {authMode === 'password' ? (
                    <form onSubmit={handlePasswordLogin} className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300">Executive Email</label>
                        <Input
                          type="email"
                          placeholder="executive@company.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="bg-black/50 border-white/10 text-white h-11 text-xs focus-visible:ring-cyan-500 rounded-xl placeholder:text-slate-600"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300">Security Password</label>
                          <button
                            type="button"
                            onClick={() => setShowForgotPassword(true)}
                            className="text-[11px] text-cyan-400 hover:underline font-semibold"
                          >
                            Forgot Password?
                          </button>
                        </div>
                        <Input
                          type="password"
                          placeholder="••••••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          className="bg-black/50 border-white/10 text-white h-11 text-xs focus-visible:ring-cyan-500 rounded-xl placeholder:text-slate-600"
                        />
                      </div>

                      <Button
                        type="submit"
                        disabled={authLoading}
                        className="w-full h-11 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-black text-xs rounded-xl shadow-[0_0_25px_rgba(6,182,212,0.3)] transition-all duration-300"
                      >
                        {authLoading ? 'Authenticating Executive...' : 'Authenticate & Unlock HQ'}
                      </Button>
                    </form>
                  ) : (
                    /* OTP Auth Form */
                    <form onSubmit={otpSent ? handleVerifyOtp : handleSendOtp} className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300">Executive Email</label>
                        <Input
                          type="email"
                          placeholder="executive@company.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          disabled={otpSent}
                          required
                          className="bg-black/50 border-white/10 text-white h-11 text-xs focus-visible:ring-cyan-500 rounded-xl placeholder:text-slate-600"
                        />
                      </div>

                      {otpSent && (
                        <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2">
                          <label className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 flex items-center justify-between">
                            <span>Enter 6-Digit Resend Token</span>
                            <KeyRound className="h-3.5 w-3.5" />
                          </label>
                          <Input
                            type="text"
                            maxLength={6}
                            placeholder="849201"
                            value={otpCode}
                            onChange={(e) => setOtpCode(e.target.value)}
                            required
                            className="bg-black/50 border-cyan-500/50 text-cyan-300 font-mono tracking-widest text-center text-base h-12 focus-visible:ring-cyan-500 rounded-xl"
                          />
                        </div>
                      )}

                      <Button
                        type="submit"
                        disabled={authLoading}
                        className="w-full h-11 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-black text-xs rounded-xl shadow-[0_0_25px_rgba(6,182,212,0.3)] transition-all duration-300"
                      >
                        {authLoading
                          ? 'Processing Request...'
                          : otpSent
                          ? 'Verify Token & Enter HQ'
                          : 'Dispatch 6-Digit Resend Token'}
                      </Button>

                      {otpSent && (
                        <div className="flex justify-between items-center text-[11px] pt-1">
                          <button
                            type="button"
                            disabled={resendCountdown > 0 || authLoading}
                            onClick={handleSendOtp}
                            className="text-cyan-400 hover:underline flex items-center gap-1 font-semibold disabled:opacity-40"
                          >
                            <RefreshCw className="h-3 w-3" />
                            {resendCountdown > 0 ? `Resend token in ${resendCountdown}s` : 'Resend Email Token'}
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setOtpSent(false);
                              setOtpCode('');
                            }}
                            className="text-slate-400 hover:text-white"
                          >
                            Change Email
                          </button>
                        </div>
                      )}
                    </form>
                  )}

                  {/* Divider */}
                  <div className="relative flex items-center justify-center my-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-white/10" />
                    </div>
                    <span className="relative bg-[#0A0B10] px-3 text-[10px] uppercase font-bold text-slate-500 tracking-widest">
                      Single Sign-On
                    </span>
                  </div>

                  {/* Google OAuth Button */}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleGoogleLogin}
                    disabled={authLoading}
                    className="w-full h-11 bg-white/5 border-white/10 hover:bg-white/10 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2.5 transition-all"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24">
                      <path
                        fill="#EA4335"
                        d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z"
                      />
                      <path
                        fill="#4285F4"
                        d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 10.8 0 12s.7 2.3 1.9 4.7l3.7-2.9z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z"
                      />
                    </svg>
                    Continue with Google Enterprise
                  </Button>
                </CardContent>

                <CardFooter className="flex justify-center border-t border-white/10 pt-4 mt-2">
                  <div className="text-[11px] text-slate-400">
                    New HQ Owner?{' '}
                    <Link href="/onboarding" className="text-cyan-400 font-extrabold hover:underline">
                      Provision New Workspace &rarr;
                    </Link>
                  </div>
                </CardFooter>
              </>
            )}
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-[11px] text-slate-500 border-t border-white/5 relative z-10">
        <div className="flex items-center justify-center gap-2">
          <ShieldCheck className="h-3.5 w-3.5 text-cyan-400" />
          <span>SOC2 Type II Certified &bull; 256-bit Encrypted Command Infrastructure</span>
        </div>
      </footer>
    </div>
  );
}
