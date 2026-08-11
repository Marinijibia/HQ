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
import { Lock, ShieldAlert, ShieldCheck } from 'lucide-react';
import { toast } from '../../components/toast';

export default function AdminLoginPage() {
  const { signInWithGoogle, signInWithEmail, user, token, logout } = useAuth();
  const router = useRouter();

  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [authLoading, setAuthLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Loading overlay state (same pattern as web login — avoids blind timer race)
  const [loadingHq, setLoadingHq] = React.useState(false);
  const [loadProgress, setLoadProgress] = React.useState(0);

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

  // Once user + token are confirmed by auth context, run admin role check then redirect
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
        if (dbUser.role === 'SUPER_ADMINISTRATOR' || dbUser.role === 'ADMINISTRATOR') {
          setLoadProgress(100);
          toast.success(`👋 Welcome back, ${dbUser.name || dbUser.displayName || 'Admin'}!`);
          setTimeout(() => router.push('/dashboard'), 300);
        } else {
          setError('Access Denied: These credentials are not registered as Admin Staff.');
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter your staff email and password.');
      return;
    }
    setError(null);
    setAuthLoading(true);
    try {
      await signInWithEmail(email, password);
      // Don't redirect here — wait for user+token useEffect to confirm and verify role
      setLoadingHq(true);
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Invalid admin credentials.';
      setError(errMsg);
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
        const errMsg = err instanceof Error ? err.message : 'Google login failed.';
        setError(errMsg);
      }
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0A0A0C] text-foreground flex flex-col justify-between font-sans relative overflow-hidden animate-in fade-in duration-300">
      {/* Background Decorative Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#f43f5e_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

      <header className="flex h-16 items-center justify-between border-b border-card-border px-6 sm:px-12 bg-card-bg/40 backdrop-blur-xl relative z-10">
        <div className="flex items-center space-x-2.5">
          <div className="p-[1.5px] bg-gradient-to-tr from-rose-600 via-rose-500 to-rose-900 rounded-xl shadow-[0_0_15px_rgba(244,63,94,0.25)]">
            <img src="/logo.png" alt="HQ Admin Logo" className="h-7 w-7 rounded-[10px] object-cover" />
          </div>
          <span className="font-extrabold tracking-tight text-foreground text-sm flex items-center gap-1.5">
            HQ <span className="text-rose-500 text-xs font-bold font-mono hidden sm:inline">| Admin Console Gateway</span>
          </span>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-md">
          <Card className="border border-rose-500/30 bg-card-bg/90 backdrop-blur-2xl shadow-[0_0_35px_rgba(244,63,94,0.12)] p-3 text-foreground rounded-3xl">

            {/* Loading overlay — same pattern as web login */}
            {loadingHq ? (
              <CardHeader className="text-center space-y-6 py-12">
                <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-2 border-rose-500/20 border-t-rose-500 animate-spin" />
                  <ShieldCheck className="h-7 w-7 text-rose-500 animate-pulse" />
                </div>
                <div className="space-y-1.5">
                  <CardTitle className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                    Verifying Admin Access
                  </CardTitle>
                  <CardDescription className="text-foreground/50 text-xs tracking-wider uppercase font-semibold">
                    Confirming staff credentials &amp; role clearance...
                  </CardDescription>
                </div>
                <div className="w-full h-2 bg-slate-200 dark:bg-white/5 rounded-full overflow-hidden p-0.5 border border-slate-300 dark:border-white/10">
                  <div
                    className="h-full bg-gradient-to-r from-rose-500 via-rose-400 to-orange-400 rounded-full transition-all duration-300"
                    style={{ width: `${loadProgress}%` }}
                  />
                </div>
              </CardHeader>
            ) : (
              <>
                {error && (
                  <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-3 m-4 mb-0 rounded-xl text-center font-semibold flex items-center justify-center gap-2">
                    <ShieldAlert className="h-4 w-4 shrink-0" /> {error}
                  </div>
                )}

                <CardHeader className="text-left space-y-2 pb-3">
                  <Badge className="w-fit text-[10px] tracking-widest font-black bg-rose-500/10 border-rose-500/30 text-rose-400 uppercase rounded-lg">
                    AUTHORIZED STAFF ONLY
                  </Badge>
                  <CardTitle className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                    <Lock className="h-6 w-6 text-rose-500" />
                    Enter Headquarters | Admin
                  </CardTitle>
                  <CardDescription className="text-foreground/50 text-xs leading-relaxed">
                    Log in with authorized staff credentials to manage system telemetry, tenant databases, and security.
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4 text-left">
                  <form onSubmit={handleLogin} className="space-y-4 text-xs font-semibold">
                    <div className="space-y-1.5">
                      <label className="text-foreground/75 font-bold">Staff Email</label>
                      <Input
                        type="email"
                        placeholder="admin@netify.ng"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="bg-background border-card-border text-foreground h-11 focus-visible:ring-rose-500 rounded-xl"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-foreground/75 font-bold">Password</label>
                        <a
                          href="/forgot-password"
                          className="text-[11px] font-semibold text-rose-400 hover:text-rose-300 transition-colors"
                        >
                          Forgot password?
                        </a>
                      </div>
                      <Input
                        type="password"
                        placeholder="••••••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="bg-background border-card-border text-foreground h-11 focus-visible:ring-rose-500 rounded-xl"
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={authLoading}
                      className="w-full h-11 bg-rose-600 hover:bg-rose-700 text-white font-black transition-all shadow-[0_4px_15px_rgba(244,63,94,0.3)] rounded-xl"
                    >
                      {authLoading ? 'Authenticating...' : 'Sign In as Admin Staff'}
                    </Button>
                  </form>

                  <div className="relative flex py-2 items-center">
                    <div className="flex-grow border-t border-card-border" />
                    <span className="flex-shrink mx-4 text-foreground/45 text-[10px] font-black uppercase tracking-widest">
                      OR
                    </span>
                    <div className="flex-grow border-t border-card-border" />
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleGoogleLogin}
                    disabled={authLoading}
                    className="w-full h-11 border-card-border hover:bg-white/5 text-foreground font-bold transition-all flex items-center justify-center gap-3 rounded-xl text-xs"
                  >
                    <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <span>Continue with Google</span>
                  </Button>
                </CardContent>

                <CardFooter className="py-4 text-center flex flex-col gap-2">
                  <a
                    href={`${process.env.NEXT_PUBLIC_WEB_URL || 'https://hq.netify.ng'}/login`}
                    className="mx-auto text-xs font-bold text-foreground/45 hover:text-rose-400 dark:hover:text-rose-300 transition-colors"
                  >
                    Return to Executive Tenant Login
                  </a>
                </CardFooter>
              </>
            )}
          </Card>
        </div>
      </main>

      <footer className="h-12 flex items-center justify-center border-t border-card-border text-[10px] font-bold text-foreground/45 relative z-10 bg-card-bg/10">
        <span>© 2026 HQ Inc. | Authorized Admin Security Ledger</span>
      </footer>
    </div>
  );
}
