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
import Link from 'next/link';
import { toast } from '../../../components/toast';

export default function AdminLoginPage() {
  const { signInWithGoogle, signInWithEmail, token, logout } = useAuth();
  const router = useRouter();

  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [authLoading, setAuthLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (token) {
      setAuthLoading(true);
      fetch('/api/users/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
        .then((res) => {
          if (res.ok) {
            return res.json();
          }
          throw new Error('Failed to verify user profile.');
        })
        .then((dbUser) => {
          if (dbUser.role === 'SUPER_ADMINISTRATOR' || dbUser.role === 'ADMINISTRATOR') {
            toast.success(`👋 Welcome back Admin, ${dbUser.name}!`);
            router.push('/admin/operations');
          } else {
            setError('Access Denied: This credentials set is not registered as Admin Staff.');
            logout();
          }
        })
        .catch((err) => {
          setError(err.message || 'Verification failed.');
          logout();
        })
        .finally(() => {
          setAuthLoading(false);
        });
    }
  }, [token, router, logout]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }
    setError(null);
    setAuthLoading(true);
    try {
      await signInWithEmail(email, password);
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Invalid admin credentials.';
      setError(errMsg);
      setAuthLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setAuthLoading(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Google login failed.';
      setError(errMsg);
      setAuthLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between font-sans relative overflow-hidden select-none animate-in fade-in duration-300">
      {/* Decorative Dot Grid Background */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e1e24_1px,transparent_1px)] [background-size:16px_16px] opacity-10 dark:opacity-20 pointer-events-none"></div>

      <header className="flex h-16 items-center justify-between border-b border-card-border px-6 sm:px-12 bg-card-bg/40 backdrop-blur-xl relative z-10">
        <div className="flex items-center space-x-2.5">
          <div className="h-7 w-7 rounded-md bg-gradient-to-tr from-rose-600 to-rose-900 flex items-center justify-center font-bold text-white text-xs shadow-[0_0_15px_rgba(225,29,72,0.2)]">
            HQ
          </div>
          <span className="font-extrabold tracking-tight text-foreground text-sm">
            HQ <span className="text-rose-500 text-xs font-bold font-mono">| Admin Console Gateway</span>
          </span>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-sm">
          <Card className="border border-rose-500/20 bg-card-bg shadow-2xl p-2 text-foreground">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-3 m-6 mb-0 rounded-lg text-center font-semibold">
                {error}
              </div>
            )}

            <CardHeader className="text-left space-y-2">
              <Badge className="w-fit text-[10px] tracking-widest font-black bg-rose-500/10 border-rose-500/20 text-rose-500">
                AUTHORIZED STAFF ONLY
              </Badge>
              <CardTitle className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                <Lock className="h-6 w-6 text-rose-500" />
                Staff Sign In
              </CardTitle>
              <CardDescription className="text-foreground/50 text-xs leading-relaxed">
                Log in to monitor platform metrics, telemetry curves, and company databases.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4 text-left">
              <form onSubmit={handleLogin} className="space-y-4 text-xs font-semibold">
                <div className="space-y-1.5">
                  <label className="text-foreground/70">Staff Email</label>
                  <Input
                    type="email"
                    placeholder="admin@hq-corp.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-white dark:bg-[#0A0A0C] border-card-border text-foreground h-11 focus-visible:ring-rose-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-foreground/70">Password</label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-white dark:bg-[#0A0A0C] border-card-border text-foreground h-11 focus-visible:ring-rose-500"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={authLoading}
                  className="w-full h-11 bg-rose-600 hover:bg-rose-700 text-white font-bold transition-all shadow-[0_4px_15px_rgba(225,29,72,0.2)]"
                >
                  {authLoading ? 'Verifying Credentials...' : 'Sign In as Staff'}
                </Button>
              </form>

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-card-border"></div>
                <span className="flex-shrink mx-4 text-foreground/30 text-[10px] font-bold uppercase">or</span>
                <div className="flex-grow border-t border-card-border"></div>
              </div>

              <Button
                variant="outline"
                onClick={handleGoogleLogin}
                disabled={authLoading}
                className="w-full h-11 border-card-border hover:bg-foreground/5 text-foreground font-bold transition-all flex items-center justify-center gap-2"
              >
                <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                Google Authentication
              </Button>
            </CardContent>

            <CardFooter className="py-4 text-center">
              <Link href="/login" className="mx-auto text-[10px] font-bold text-foreground/40 hover:text-foreground transition-colors">
                Regular Tenant Login
              </Link>
            </CardFooter>
          </Card>
        </div>
      </main>

      <footer className="h-12 flex items-center justify-center border-t border-card-border text-[10px] font-bold text-foreground/45 relative z-10 bg-card-bg/10">
        <span>© 2026 HQ Inc. | Authorized Access Ledger Running</span>
      </footer>
    </div>
  );
}
