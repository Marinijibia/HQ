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
import { HQLogo } from '../../../components/hq-logo';

export default function ForgotPasswordPage() {
  const [email, setEmail] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!email || !email.includes('@')) {
      setError('Please provide a valid executive email address.');
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

      setSuccess(`Password reset instructions dispatched to ${email}. Please check your inbox.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send password reset email.');
    } finally {
      setLoading(false);
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
              HQ <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent text-xs font-bold uppercase tracking-widest">RECOVERY</span>
            </span>
            <span className="text-[10px] text-slate-400 font-medium tracking-wide">Account Security Gateway</span>
          </div>
        </div>

        <Badge variant="outline" className="border-cyan-500/30 bg-cyan-500/10 text-cyan-300 text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping" />
          SECURE DISPATCH
        </Badge>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 relative z-10 my-8">
        <div className="w-full max-w-md">
          <Card className="border border-white/10 bg-[#0A0B10]/85 backdrop-blur-3xl shadow-[0_0_50px_rgba(6,182,212,0.15)] text-foreground p-4 rounded-3xl relative overflow-hidden transition-all duration-300">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600" />

            {error && (
              <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs p-3.5 m-2 mb-0 rounded-2xl text-center font-semibold flex items-center justify-center gap-2">
                <ShieldAlert className="h-4 w-4 text-rose-400" /> {error}
              </div>
            )}

            {success && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs p-3.5 m-2 mb-0 rounded-2xl text-center font-semibold flex items-center justify-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" /> {success}
              </div>
            )}

            <CardHeader className="text-left space-y-2 pt-2">
              <div className="flex items-center gap-2 text-[10px] font-black text-cyan-400 uppercase tracking-widest bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-1 rounded-md w-fit">
                <Sparkles className="h-3 w-3" />
                SECURITY GATEWAY
              </div>
              <CardTitle className="text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
                <Mail className="h-6 w-6 text-cyan-400" />
                Forgot Password?
              </CardTitle>
              <CardDescription className="text-slate-400 text-xs leading-relaxed">
                Enter your account email. We will send a secure password reset link via Resend.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4 pt-2">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300">Executive Account Email</label>
                  <Input
                    type="email"
                    placeholder="executive@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-black/50 border-white/10 text-white h-11 text-xs focus-visible:ring-cyan-500 rounded-xl placeholder:text-slate-600"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-bold text-xs rounded-xl shadow-[0_0_25px_rgba(6,182,212,0.3)] transition-all"
                >
                  {loading ? 'Dispatching Instructions...' : 'Send Password Reset Email'}
                </Button>
              </form>
            </CardContent>

            <CardFooter className="flex justify-center border-t border-white/10 pt-4 mt-2">
              <Link href="/login" className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 font-semibold">
                <ArrowLeft className="h-3.5 w-3.5 text-cyan-400" /> Back to Executive Sign In
              </Link>
            </CardFooter>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-[11px] text-slate-500 border-t border-white/5 relative z-10">
        <div className="flex items-center justify-center gap-2">
          <ShieldCheck className="h-3.5 w-3.5 text-cyan-400" />
          <span>Encrypted Account Recovery System</span>
        </div>
      </footer>
    </div>
  );
}
