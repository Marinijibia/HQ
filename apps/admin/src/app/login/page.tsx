'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/auth-context';
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
  Lock,
  Mail,
  ShieldAlert,
  ShieldCheck,
  Eye,
  EyeOff,
  Sparkles,
  Award,
  KeyRound,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { toast } from '../../components/toast';

export default function AdminLoginPage() {
  const { signInWithGoogle, signInWithEmail, user, token, logout } = useAuth();
  const router = useRouter();

  // Auth Mode: 'password' or 'otp'
  const [authMode, setAuthMode] = React.useState<'password' | 'otp'>('password');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);

  // 2FA Security Token (OTP) State
  const [otpSent, setOtpSent] = React.useState(false);
  const [otpCode, setOtpCode] = React.useState('');
  const [resendCountdown, setResendCountdown] = React.useState(0);

  const [authLoading, setAuthLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null);

  // Clearance Verification Loading State
  const [loadingHq, setLoadingHq] = React.useState(false);
  const [loadProgress, setLoadProgress] = React.useState(0);
  const [verifiedRank, setVerifiedRank] = React.useState<string>('Director-General (DG)');

  // Resend Countdown Timer
  React.useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  // Animate progress bar to 85% while waiting for user+token to confirm
  React.useEffect(() => {
    if (loadingHq) {
      const interval = setInterval(() => {
        setLoadProgress((prev) => {
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

  // Once user + token are confirmed by auth context, run admin role clearance check
  React.useEffect(() => {
    if (!loadingHq || !user || !token) return;

    setLoadProgress(90);

    fetch('/api/users/me', {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error('Failed to verify admin profile.');
      })
      .then((dbUser) => {
        const userRank = dbUser.rank || 'Director-General (DG)';
        const userName = dbUser.name || dbUser.displayName || 'Umar';

        localStorage.setItem('hq_admin_user_rank', userRank);
        localStorage.setItem('hq_admin_user_name', userName);
        setVerifiedRank(userRank);

        if (
          dbUser.role === 'SUPER_ADMINISTRATOR' ||
          dbUser.role === 'ADMINISTRATOR' ||
          dbUser.role === 'AUDITOR'
        ) {
          setLoadProgress(100);
          toast.success(`👋 Clearance Verified: Welcome back ${userRank} ${userName}!`);
          setTimeout(() => router.push('/dashboard'), 300);
        } else {
          setError('Access Denied: These credentials are not registered for Admin Staff Clearance.');
          setLoadingHq(false);
          setLoadProgress(0);
          logout();
        }
      })
      .catch((err) => {
        setError(err.message || 'Admin verification failed. Please try again.');
        setLoadingHq(false);
        setLoadProgress(0);
        logout();
      });
  }, [loadingHq, user, token, router, logout]);

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
    if (!email || !password) {
      setError('Please enter your staff email address and password.');
      return;
    }
    setError(null);
    setSuccessMsg(null);
    setAuthLoading(true);
    try {
      await signInWithEmail(email, password);
      setLoadingHq(true);
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Invalid admin credentials.';
      setError(errMsg);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!email || !email.includes('@')) {
      setError('Please enter a valid staff email address.');
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
        throw new Error(data.message || 'Failed to dispatch 2FA security token.');
      }

      setOtpSent(true);
      setResendCountdown(60);
      setSuccessMsg(`Secure 6-digit zero-trust token sent to ${email}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send 2FA token.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!otpCode || otpCode.length < 6) {
      setError('Please enter the 6-digit zero-trust token.');
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
        throw new Error(data.message || 'Invalid 2FA security token.');
      }

      const data = await res.json();
      setLoadingHq(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : '2FA token verification failed.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setAuthLoading(true);
    try {
      await signInWithGoogle();
      setLoadingHq(true);
    } catch (err: any) {
      if (
        err?.code !== 'auth/popup-closed-by-user' &&
        err?.code !== 'auth/cancelled-popup-request'
      ) {
        const errMsg = err instanceof Error ? err.message : 'Google authentication failed.';
        setError(errMsg);
      }
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050508] text-foreground flex flex-col justify-between font-sans relative overflow-x-hidden select-none animate-in fade-in duration-500">
      {/* Luxury Ambient Radial Lighting Glows */}
      <div className="absolute top-[-15%] left-1/2 -translate-x-1/2 w-[1100px] h-[550px] bg-radial from-cyan-500/15 via-blue-600/10 to-transparent blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-radial from-purple-600/10 via-indigo-600/5 to-transparent blur-[140px] pointer-events-none" />
      <div className="absolute top-[30%] right-[-10%] w-[500px] h-[500px] bg-radial from-rose-600/10 via-pink-600/5 to-transparent blur-[140px] pointer-events-none" />

      {/* Decorative Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />

      {/* Header Bar */}
      <header className="flex h-20 items-center justify-between border-b border-white/10 px-6 sm:px-12 bg-[#0A0B10]/60 backdrop-blur-2xl relative z-10">
        <div className="flex items-center space-x-3">
          <div className="p-1 bg-gradient-to-tr from-cyan-500 via-blue-600 to-purple-600 rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.4)]">
            <img src="/logo.png" alt="HQ Admin Logo" className="h-8 w-8 rounded-lg object-cover" />
          </div>
          <div className="flex flex-col text-left">
            <span className="font-black tracking-tight text-white text-base flex items-center gap-2">
              HQ <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-rose-400 bg-clip-text text-transparent text-xs font-black uppercase tracking-widest">SUPER ADMIN</span>
            </span>
            <span className="text-[10px] text-slate-400 font-medium tracking-wide">Enterprise Control Plane</span>
          </div>
        </div>

        <Badge className="border-cyan-500/30 bg-cyan-500/10 text-cyan-300 text-[11px] font-black px-3.5 py-1.5 rounded-full flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
          ZERO-TRUST CLEARANCE
        </Badge>
      </header>

      {/* Main Form Center */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 relative z-10 my-8">
        <div className="w-full max-w-md space-y-4">
          <Card className="border border-cyan-500/30 dark:border-white/10 bg-[#0A0B10]/95 backdrop-blur-3xl shadow-[0_0_50px_rgba(6,182,212,0.15)] p-4 text-foreground rounded-3xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-rose-500" />

            {/* Loading Clearance Overlay */}
            {loadingHq ? (
              <CardHeader className="text-center space-y-6 py-12">
                <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-2 border-cyan-500/20 border-t-cyan-400 animate-spin" />
                  <div className="absolute inset-2 rounded-full border border-purple-500/20 border-t-purple-400 animate-spin" style={{ animationDirection: 'reverse' }} />
                  <Award className="h-8 w-8 text-cyan-400 animate-bounce" />
                </div>

                <div className="space-y-2">
                  <CardTitle className="text-2xl font-black tracking-tight text-white">
                    Verifying Staff Clearance
                  </CardTitle>
                  <p className="text-cyan-400 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-cyan-400" />
                    Evaluating {verifiedRank} Clearance
                  </p>
                </div>

                <div className="w-full h-2.5 bg-black/60 rounded-full overflow-hidden p-0.5 border border-white/10">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 via-purple-500 to-rose-500 rounded-full transition-all duration-300 shadow-[0_0_15px_rgba(6,182,212,0.5)]"
                    style={{ width: `${loadProgress}%` }}
                  />
                </div>
              </CardHeader>
            ) : (
              <>
                {error && (
                  <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs p-3.5 m-2 mb-0 rounded-2xl text-center font-bold flex items-center justify-center gap-2">
                    <ShieldAlert className="h-4 w-4 shrink-0" /> {error}
                  </div>
                )}

                {successMsg && (
                  <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs p-3.5 m-2 mb-0 rounded-2xl text-center font-bold flex items-center justify-center gap-2">
                    <Sparkles className="h-4 w-4 shrink-0" /> {successMsg}
                  </div>
                )}

                <CardHeader className="text-left space-y-2 pb-4 pt-2">
                  <div className="flex items-center justify-between">
                    <Badge className="text-[10px] tracking-widest font-black bg-cyan-500/10 border-cyan-500/30 text-cyan-400 uppercase rounded-lg px-2.5 py-1">
                      RESTRICTED OPERATIONAL GATEWAY
                    </Badge>

                    {/* Auth Mode Tabs */}
                    <div className="flex items-center gap-1 bg-black/60 border border-white/10 p-1 rounded-xl">
                      <button
                        type="button"
                        onClick={() => { setAuthMode('password'); setError(null); }}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition-all ${
                          authMode === 'password' ? 'bg-cyan-500 text-black shadow-sm' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Password
                      </button>
                      <button
                        type="button"
                        onClick={() => { setAuthMode('otp'); setError(null); }}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition-all ${
                          authMode === 'otp' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        2FA Token
                      </button>
                    </div>
                  </div>

                  <CardTitle className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                    <Lock className="h-6 w-6 text-cyan-400" />
                    Sign In | Admin Staff
                  </CardTitle>
                  <CardDescription className="text-slate-400 text-xs leading-relaxed">
                    Enter authorized staff credentials or 2FA token to access the platform control plane.
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4 text-left">
                  {authMode === 'password' ? (
                    <form onSubmit={handlePasswordLogin} className="space-y-4 text-xs font-semibold">
                      <div className="space-y-1.5">
                        <label className="text-slate-300 font-bold uppercase tracking-wider text-[11px]">Staff Email Address *</label>
                        <div className="relative">
                          <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                          <Input
                            type="email"
                            placeholder="admin.staff@netify.ng"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="bg-black/60 border-white/10 text-white pl-10 h-12 focus-visible:ring-cyan-500 rounded-2xl font-bold"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-slate-300 font-bold uppercase tracking-wider text-[11px]">Clearance Password *</label>
                          <a
                            href="/forgot-password"
                            className="text-[11px] font-bold text-cyan-400 hover:underline transition-colors"
                          >
                            Reset Password?
                          </a>
                        </div>
                        <div className="relative">
                          <Input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="••••••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="bg-black/60 border-white/10 text-white pr-10 h-12 focus-visible:ring-cyan-500 rounded-2xl font-bold"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3.5 top-3.5 text-slate-400 hover:text-white"
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>

                      <Button
                        type="submit"
                        disabled={authLoading}
                        className="w-full h-12 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-black text-xs transition-all shadow-[0_0_25px_rgba(6,182,212,0.3)] rounded-2xl flex items-center justify-center gap-2"
                      >
                        {authLoading ? (
                          <>
                            <RefreshCw className="h-4 w-4 animate-spin" /> Authenticating Staff...
                          </>
                        ) : (
                          <>
                            Sign In with Staff Clearance <ArrowRight className="h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </form>
                  ) : (
                    /* 2FA Token (OTP) Form */
                    <div className="space-y-4">
                      {!otpSent ? (
                        <form onSubmit={handleSendOtp} className="space-y-4 text-xs font-semibold">
                          <div className="space-y-1.5">
                            <label className="text-slate-300 font-bold uppercase tracking-wider text-[11px]">Staff Email Address *</label>
                            <div className="relative">
                              <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                              <Input
                                type="email"
                                placeholder="admin.staff@netify.ng"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="bg-black/60 border-white/10 text-white pl-10 h-12 focus-visible:ring-purple-500 rounded-2xl font-bold"
                              />
                            </div>
                          </div>

                          <Button
                            type="submit"
                            disabled={authLoading}
                            className="w-full h-12 bg-gradient-to-r from-purple-600 to-rose-600 text-white font-black text-xs transition-all shadow-[0_0_25px_rgba(168,85,247,0.3)] rounded-2xl flex items-center justify-center gap-2"
                          >
                            {authLoading ? 'Dispatching 2FA Token...' : 'Send 2FA Security Token'}
                          </Button>
                        </form>
                      ) : (
                        <form onSubmit={handleVerifyOtp} className="space-y-4 text-xs font-semibold">
                          <div className="space-y-1.5">
                            <label className="text-purple-400 font-bold uppercase tracking-wider text-[11px] flex items-center gap-1">
                              <KeyRound className="h-3.5 w-3.5 text-purple-400" /> 6-Digit Zero-Trust Security Token *
                            </label>
                            <Input
                              type="text"
                              maxLength={6}
                              placeholder="123456"
                              value={otpCode}
                              onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                              required
                              className="bg-black/60 border-purple-500/50 text-purple-300 text-center font-mono text-xl tracking-[0.4em] h-14 focus-visible:ring-purple-500 rounded-2xl font-black"
                            />
                          </div>

                          <Button
                            type="submit"
                            disabled={authLoading || otpCode.length < 6}
                            className="w-full h-12 bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-black text-xs transition-all shadow-[0_0_25px_rgba(168,85,247,0.3)] rounded-2xl"
                          >
                            {authLoading ? 'Verifying Token...' : 'Verify 2FA Token & Sign In'}
                          </Button>

                          <div className="text-center pt-2">
                            <button
                              type="button"
                              disabled={resendCountdown > 0}
                              onClick={handleSendOtp}
                              className="text-[11px] font-bold text-slate-400 hover:text-cyan-400 disabled:opacity-50"
                            >
                              {resendCountdown > 0
                                ? `Resend Token in ${resendCountdown}s`
                                : 'Resend 2FA Token'}
                            </button>
                          </div>
                        </form>
                      )}
                    </div>
                  )}

                  <div className="relative flex py-2 items-center">
                    <div className="flex-grow border-t border-white/10" />
                    <span className="flex-shrink mx-4 text-slate-500 text-[10px] font-black uppercase tracking-widest">
                      OR
                    </span>
                    <div className="flex-grow border-t border-white/10" />
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleGoogleLogin}
                    disabled={authLoading}
                    className="w-full h-12 border-white/10 hover:bg-white/5 text-white font-bold transition-all flex items-center justify-center gap-3 rounded-2xl text-xs"
                  >
                    <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <span>Continue with Google Enterprise SS0</span>
                  </Button>
                </CardContent>

                <CardFooter className="py-4 text-center flex flex-col gap-2 border-t border-white/5 mt-2">
                  <a
                    href={`${process.env.NEXT_PUBLIC_WEB_URL || 'https://hq.netify.ng'}/login`}
                    className="mx-auto text-xs font-bold text-slate-400 hover:text-cyan-400 transition-colors"
                  >
                    &larr; Return to Executive Tenant Login
                  </a>
                </CardFooter>
              </>
            )}
          </Card>
        </div>
      </main>

      <footer className="h-14 flex items-center justify-center border-t border-white/10 text-[11px] font-bold text-slate-500 relative z-10 bg-[#06070B]/80 backdrop-blur-xl">
        <span>© 2026 HQ Inc. | Authorized Admin Security Ledger &amp; Control Plane</span>
      </footer>
    </div>
  );
}
