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
  Badge,
} from '@hq/ui';
import { Mail, ArrowLeft, CheckCircle2, ShieldAlert, Sparkles, ShieldCheck, RefreshCw } from 'lucide-react';

export default function AdminForgotPasswordPage() {
  const [email, setEmail] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!email || !email.includes('@')) {
      setError('Please provide a valid admin staff email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Password reset request failed.');
      }

      setSuccess(`Admin password reset instructions dispatched to ${email}. Check your inbox.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send password reset email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#050508] text-foreground flex flex-col justify-between font-sans relative overflow-x-hidden select-none animate-in fade-in duration-500">
      {/* Luxury Ambient Radial Lighting Glows */}
      <div className="absolute top-[-15%] left-1/2 -translate-x-1/2 w-[1100px] h-[550px] bg-radial from-cyan-500/15 via-blue-600/10 to-transparent blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-radial from-purple-600/10 via-indigo-600/5 to-transparent blur-[140px] pointer-events-none" />
      <div className="absolute top-[30%] right-[-10%] w-[500px] h-[500px] bg-radial from-rose-600/10 via-pink-600/5 to-transparent blur-[140px] pointer-events-none" />

      {/* Decorative Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />

      {/* Header Bar */}
      <header className="flex h-20 items-center justify-between border-b border-slate-200 dark:border-white/10 px-6 sm:px-12 bg-white/80 dark:bg-[#0A0B10]/60 backdrop-blur-2xl relative z-10">
        <div className="flex items-center space-x-3">
          <div className="p-1 bg-gradient-to-tr from-cyan-500 via-blue-600 to-purple-600 rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.4)]">
            <img src="/logo.png" alt="HQ Admin Logo" className="h-8 w-8 rounded-lg object-cover" />
          </div>
          <div className="flex flex-col text-left">
            <span className="font-black tracking-tight text-slate-900 dark:text-white text-base flex items-center gap-2">
              HQ <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-rose-400 bg-clip-text text-transparent text-xs font-black uppercase tracking-widest">RECOVERY GATEWAY</span>
            </span>
            <span className="text-[10px] text-slate-400 font-medium tracking-wide">Enterprise Credential Recovery</span>
          </div>
        </div>

        <Badge className="border-cyan-500/30 bg-cyan-500/10 text-cyan-300 text-[11px] font-black px-3.5 py-1.5 rounded-full flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
          STAFF RECOVERY
        </Badge>
      </header>

      {/* Main Form Center */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 relative z-10 my-8">
        <div className="w-full max-w-md space-y-4">
          <Card className="border border-cyan-500/30 bg-white/95 dark:bg-[#0A0B10]/95 backdrop-blur-3xl shadow-[0_0_50px_rgba(6,182,212,0.15)] p-4 text-foreground rounded-3xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-rose-500" />

            {error && (
              <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs p-3.5 m-2 mb-0 rounded-2xl text-center font-bold flex items-center justify-center gap-2">
                <ShieldAlert className="h-4 w-4 shrink-0 text-rose-500" /> {error}
              </div>
            )}

            {success && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs p-3.5 m-2 mb-0 rounded-2xl text-center font-bold flex items-center justify-center gap-2">
                <Sparkles className="h-4 w-4 shrink-0 text-emerald-400" /> {success}
              </div>
            )}

            <CardHeader className="text-left space-y-2 pb-4 pt-2">
              <Badge className="w-fit text-[10px] tracking-widest font-black bg-cyan-500/10 border-cyan-500/30 text-cyan-400 uppercase rounded-lg px-2.5 py-1">
                STAFF CREDENTIAL RECOVERY
              </Badge>
              <CardTitle className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                <Mail className="h-6 w-6 text-cyan-400" />
                Forgot Admin Password?
              </CardTitle>
              <CardDescription className="text-slate-400 text-xs leading-relaxed">
                Enter your authorized admin staff email address. We will send a secure password reset link via Resend API.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4 text-left">
              <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold">
                <div className="space-y-1.5">
                  <label className="text-slate-600 dark:text-slate-300 font-bold uppercase tracking-wider text-[11px]">Staff Email Address *</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                    <Input
                      type="email"
                      placeholder="admin.staff@netify.ng"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="bg-slate-50 dark:bg-black/60 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white pl-10 h-12 focus-visible:ring-cyan-500 rounded-2xl font-bold"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-black text-xs transition-all shadow-[0_0_25px_rgba(6,182,212,0.3)] rounded-2xl flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" /> Dispatching Reset Token...
                    </>
                  ) : (
                    'Send Password Reset Instructions'
                  )}
                </Button>
              </form>
            </CardContent>

            <CardFooter className="py-4 text-center flex flex-col gap-2 border-t border-slate-100 dark:border-white/5 mt-2">
              <Link
                href="/login"
                className="mx-auto text-xs font-bold text-slate-400 hover:text-cyan-400 transition-colors flex items-center gap-1.5"
              >
                <ArrowLeft className="h-3.5 w-3.5 text-cyan-400" /> Back to Staff Sign In
              </Link>
            </CardFooter>
          </Card>
        </div>
      </main>

      <footer className="h-14 flex items-center justify-center border-t border-slate-200 dark:border-white/10 text-[11px] font-bold text-slate-500 relative z-10 bg-white/80 dark:bg-[#06070B]/80 backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-3.5 w-3.5 text-cyan-400" />
          <span>© 2026 HQ Inc. | Authorized Admin Security Gateway</span>
        </div>
      </footer>
    </div>
  );
}
