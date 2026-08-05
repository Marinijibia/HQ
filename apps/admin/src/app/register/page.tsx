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
import { ShieldCheck, Lock, ShieldAlert, ArrowLeft, CheckCircle2, UserPlus } from 'lucide-react';
import { toast } from '../../components/toast';

export default function AdminRegisterPage() {
  const router = useRouter();

  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [checkingSetup, setCheckingSetup] = React.useState(true);
  const [isSetupRequired, setIsSetupRequired] = React.useState<boolean | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    fetch('/api/auth/setup-status')
      .then((res) => res.json())
      .then((data) => {
        setIsSetupRequired(data.isSetupRequired ?? true);
      })
      .catch(() => {
        // Fallback: allow setup form if endpoint is not reachable
        setIsSetupRequired(true);
      })
      .finally(() => {
        setCheckingSetup(false);
      });
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('Please fill in all required fields.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register-super-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Registration failed.');
      }

      toast.success('🎉 Initial Super Administrator registered successfully!');
      router.push('/login');
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Failed to register Super Admin.';
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0C] text-foreground flex flex-col justify-between font-sans relative overflow-hidden select-none animate-in fade-in duration-300">
      {/* Background Decorative Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#f43f5e_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none"></div>

      <header className="flex h-16 items-center justify-between border-b border-card-border px-6 sm:px-12 bg-card-bg/40 backdrop-blur-xl relative z-10">
        <div className="flex items-center space-x-2.5">
          <div className="p-[1.5px] bg-gradient-to-tr from-rose-600 via-rose-500 to-rose-900 rounded-xl shadow-[0_0_15px_rgba(244,63,94,0.25)]">
            <img src="/logo.png" alt="HQ Admin Logo" className="h-7 w-7 rounded-[10px] object-cover" />
          </div>
          <span className="font-extrabold tracking-tight text-foreground text-sm flex items-center gap-1.5">
            HQ <span className="text-rose-500 text-xs font-bold font-mono">| Super Admin Gateway</span>
          </span>
        </div>

        <Button
          variant="ghost"
          onClick={() => router.push('/login')}
          className="text-xs font-bold text-foreground/60 hover:text-white flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" /> Return to Login
        </Button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-md">
          {checkingSetup ? (
            <Card className="border border-rose-500/30 bg-card-bg/90 backdrop-blur-2xl p-8 text-center rounded-3xl">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500 mx-auto mb-4"></div>
              <p className="text-xs font-bold text-foreground/60">Verifying System Provisioning Status...</p>
            </Card>
          ) : isSetupRequired === false ? (
            <Card className="border border-rose-500/30 bg-card-bg/90 backdrop-blur-2xl shadow-[0_0_35px_rgba(244,63,94,0.12)] p-6 text-foreground rounded-3xl text-center space-y-4">
              <div className="mx-auto w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-500 shadow-inner">
                <Lock className="h-6 w-6" />
              </div>
              <Badge className="w-fit mx-auto text-[10px] tracking-widest font-black bg-rose-500/10 border-rose-500/30 text-rose-400 uppercase rounded-lg">
                SETUP COMPLETE & LOCKED
              </Badge>
              <h2 className="text-xl font-black text-white tracking-tight">Super Admin Initialized</h2>
              <p className="text-xs text-foreground/60 leading-relaxed">
                Initial platform setup has already been completed. Public Super Admin registration is locked for security. Please sign in with your staff credentials.
              </p>
              <Button
                onClick={() => router.push('/login')}
                className="w-full h-11 bg-rose-600 hover:bg-rose-700 text-white font-black transition-all shadow-[0_4px_15px_rgba(244,63,94,0.3)] rounded-xl"
              >
                Go to Admin Login
              </Button>
            </Card>
          ) : (
            <Card className="border border-rose-500/30 bg-card-bg/90 backdrop-blur-2xl shadow-[0_0_35px_rgba(244,63,94,0.12)] p-3 text-foreground rounded-3xl">
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-3 m-4 mb-0 rounded-xl text-center font-semibold flex items-center justify-center gap-2">
                  <ShieldAlert className="h-4 w-4 shrink-0" /> {error}
                </div>
              )}

              <CardHeader className="text-left space-y-2 pb-3">
                <Badge className="w-fit text-[10px] tracking-widest font-black bg-rose-500/10 border-rose-500/30 text-rose-400 uppercase rounded-lg flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-rose-400" /> ONE-TIME SYSTEM SETUP
                </Badge>
                <CardTitle className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                  <UserPlus className="h-6 w-6 text-rose-500" />
                  Initial Super Admin Setup
                </CardTitle>
                <CardDescription className="text-foreground/50 text-xs leading-relaxed">
                  Register the root Super Administrator account for your HQ platform instance. This account has full system permissions.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4 text-left">
                <form onSubmit={handleRegister} className="space-y-4 text-xs font-semibold">
                  <div className="space-y-1.5">
                    <label className="text-foreground/75 font-bold">Full Name</label>
                    <Input
                      type="text"
                      placeholder="Super Administrator"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="bg-background border-card-border text-foreground h-11 focus-visible:ring-rose-500 rounded-xl"
                    />
                  </div>

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
                    <label className="text-foreground/75 font-bold">Root Password</label>
                    <Input
                      type="password"
                      placeholder="••••••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={8}
                      className="bg-background border-card-border text-foreground h-11 focus-visible:ring-rose-500 rounded-xl"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-11 bg-rose-600 hover:bg-rose-700 text-white font-black transition-all shadow-[0_4px_15px_rgba(244,63,94,0.3)] rounded-xl"
                  >
                    {loading ? 'Provisioning Account...' : 'Register Super Administrator'}
                  </Button>
                </form>
              </CardContent>

              <CardFooter className="py-4 text-center flex flex-col gap-2">
                <a
                  href="/login"
                  className="mx-auto text-xs font-bold text-foreground/45 hover:text-rose-400 transition-colors"
                >
                  Already registered? Sign in here
                </a>
              </CardFooter>
            </Card>
          )}
        </div>
      </main>

      <footer className="h-12 flex items-center justify-center border-t border-card-border text-[10px] font-bold text-foreground/45 relative z-10 bg-card-bg/10">
        <span>© 2026 HQ Inc. | Authorized Admin Security Ledger</span>
      </footer>
    </div>
  );
}
