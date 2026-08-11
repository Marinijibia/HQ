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
import { Mail, ArrowLeft, CheckCircle2, ShieldAlert, Sparkles, ShieldCheck } from 'lucide-react';

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
    <div className="min-h-screen bg-slate-50 dark:bg-[#0A0A0C] text-foreground flex flex-col justify-between font-sans relative overflow-hidden animate-in fade-in duration-300">
      {/* Background Decorative Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#f43f5e_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

      {/* Header */}
      <header className="flex h-16 items-center justify-between border-b border-slate-200 dark:border-rose-500/20 px-6 sm:px-12 bg-white/80 dark:bg-black/40 backdrop-blur-xl relative z-10">
        <div className="flex items-center space-x-2.5">
          <div className="p-[1.5px] bg-gradient-to-tr from-rose-600 via-rose-500 to-rose-900 rounded-xl shadow-[0_0_15px_rgba(244,63,94,0.25)]">
            <img src="/logo.png" alt="HQ Admin Logo" className="h-7 w-7 rounded-[10px] object-cover" />
          </div>
          <span className="font-extrabold tracking-tight text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
            HQ <span className="text-rose-600 dark:text-rose-500 text-xs font-bold font-mono hidden sm:inline">| Admin Recovery Gateway</span>
          </span>
        </div>

        <Badge variant="outline" className="border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-rose-400 animate-ping" />
          STAFF RECOVERY
        </Badge>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 relative z-10 my-8">
        <div className="w-full max-w-md">
          <Card className="border border-slate-200 dark:border-rose-500/30 bg-white dark:bg-[#0D0D12]/90 backdrop-blur-2xl shadow-xl dark:shadow-[0_0_40px_rgba(244,63,94,0.15)] text-foreground p-4 rounded-3xl relative overflow-hidden transition-all duration-300">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-rose-500 via-purple-500 to-amber-500" />

            {error && (
              <div className="bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs p-3.5 m-2 mb-0 rounded-2xl text-center font-semibold flex items-center justify-center gap-2">
                <ShieldAlert className="h-4 w-4 text-rose-500 shrink-0" /> {error}
              </div>
            )}

            {success && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs p-3.5 m-2 mb-0 rounded-2xl text-center font-semibold flex items-center justify-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" /> {success}
              </div>
            )}

            <CardHeader className="text-left space-y-2 pt-2">
              <div className="flex items-center gap-2 text-[10px] font-black text-rose-600 dark:text-rose-400 uppercase tracking-widest bg-rose-500/10 border border-rose-500/20 px-2.5 py-1 rounded-md w-fit">
                <Sparkles className="h-3 w-3" />
                STAFF CREDENTIAL RECOVERY
              </div>
              <CardTitle className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
                <Mail className="h-6 w-6 text-rose-500" />
                Forgot Admin Password?
              </CardTitle>
              <CardDescription className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
                Enter your authorized admin staff email. We will send a secure password reset link via Resend.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4 pt-2">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Staff Email Address</label>
                  <Input
                    type="email"
                    placeholder="admin@netify.ng"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-slate-50 dark:bg-black/50 border-slate-200 dark:border-rose-500/20 text-slate-900 dark:text-white h-11 text-xs focus-visible:ring-rose-500 rounded-xl placeholder:text-slate-400 dark:placeholder:text-slate-600"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-[0_0_20px_rgba(244,63,94,0.3)] transition-all"
                >
                  {loading ? 'Dispatching Instructions...' : 'Send Password Reset Email'}
                </Button>
              </form>
            </CardContent>

            <CardFooter className="flex justify-center border-t border-rose-500/10 pt-4 mt-2">
              <Link href="/login" className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 font-semibold">
                <ArrowLeft className="h-3.5 w-3.5 text-rose-400" /> Back to Staff Sign In
              </Link>
            </CardFooter>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-[11px] text-slate-500 border-t border-rose-500/10 relative z-10 bg-black/20">
        <div className="flex items-center justify-center gap-2">
          <ShieldCheck className="h-3.5 w-3.5 text-rose-400" />
          <span>HQ Admin Staff Security Gateway</span>
        </div>
      </footer>
    </div>
  );
}
