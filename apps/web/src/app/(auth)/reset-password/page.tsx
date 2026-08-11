'use client';

import * as React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
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
import { ArrowLeft, CheckCircle2, ShieldAlert, KeyRound, Loader2, Sparkles, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { HQLogo } from '../../../components/hq-logo';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [showNewPassword, setShowNewPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError('Invalid or missing password reset token.');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Password reset failed.');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Password reset failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0A0B10]/85 backdrop-blur-3xl shadow-lg dark:shadow-[0_0_50px_rgba(168,85,247,0.15)] text-foreground p-4 rounded-3xl relative overflow-hidden transition-all duration-300">
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500" />

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-300 text-xs p-3.5 m-2 mb-0 rounded-2xl text-center font-semibold flex items-center justify-center gap-2">
          <ShieldAlert className="h-4 w-4 text-rose-400" /> {error}
        </div>
      )}

      {success ? (
        <CardHeader className="text-center space-y-4 py-10">
          <CheckCircle2 className="h-14 w-14 text-emerald-400 mx-auto animate-bounce" />
          <CardTitle className="text-2xl font-black text-slate-900 dark:text-white">Password Reset Complete!</CardTitle>
          <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
            Your executive password has been updated. Redirecting to portal sign in...
          </CardDescription>
        </CardHeader>
      ) : (
        <>
          <CardHeader className="text-left space-y-2 pt-2">
            <div className="flex items-center gap-2 text-[10px] font-black text-purple-600 dark:text-purple-400 uppercase tracking-widest bg-purple-500/10 border border-purple-500/20 px-2.5 py-1 rounded-md w-fit">
              <Sparkles className="h-3 w-3" />
              SECURITY CREDENTIAL UPDATE
            </div>
            <CardTitle className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
              <KeyRound className="h-6 w-6 text-purple-500 dark:text-purple-400" />
              Set New Password
            </CardTitle>
            <CardDescription className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
              Create a strong, secure password for your owner account.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 pt-2">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">New Password</label>
                <div className="relative">
                  <Input
                    type={showNewPassword ? 'text' : 'password'}
                    placeholder="••••••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="bg-white dark:bg-black/50 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white h-11 text-xs focus-visible:ring-purple-500 rounded-xl placeholder:text-slate-400 dark:placeholder:text-slate-600 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">Confirm New Password</label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="bg-white dark:bg-black/50 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white h-11 text-xs focus-visible:ring-purple-500 rounded-xl placeholder:text-slate-400 dark:placeholder:text-slate-600 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading || !token}
                className="w-full h-11 bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-bold text-xs rounded-xl shadow-[0_0_25px_rgba(168,85,247,0.3)] transition-all"
              >
                {loading ? 'Updating Credentials...' : 'Save New Password & Log In'}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex justify-center border-t border-slate-200 dark:border-white/10 pt-4 mt-2">
            <Link href="/login" className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1.5 font-semibold">
              <ArrowLeft className="h-3.5 w-3.5 text-purple-500 dark:text-purple-400" /> Cancel & Return to Sign In
            </Link>
          </CardFooter>
        </>
      )}
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#050508] text-foreground flex flex-col justify-between font-sans relative overflow-hidden animate-in fade-in duration-500">
      {/* Dynamic Background Mesh Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e1e24_1px,transparent_1px)] [background-size:24px_24px] opacity-20 pointer-events-none" />

      {/* Header Bar */}
      <header className="flex h-20 items-center justify-between border-b border-slate-200 dark:border-white/10 px-6 sm:px-12 bg-white/80 dark:bg-[#0A0B10]/60 backdrop-blur-2xl relative z-10">
        <div className="flex items-center space-x-3">
          <HQLogo size={28} />
          <div className="flex flex-col">
            <span className="font-black tracking-tight text-slate-900 dark:text-white text-base flex items-center gap-2">
              HQ <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent text-xs font-bold uppercase tracking-widest">SECURITY</span>
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium tracking-wide">Password Update Gateway</span>
          </div>
        </div>

        <Badge variant="outline" className="border-purple-500/30 bg-purple-500/10 text-purple-600 dark:text-purple-300 text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-purple-400 animate-ping" />
          ENCRYPTED GATEWAY
        </Badge>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 relative z-10 my-8">
        <div className="w-full max-w-md">
          <React.Suspense
            fallback={
              <Card className="border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0A0B10]/85 p-8 text-center rounded-3xl">
                <Loader2 className="h-8 w-8 animate-spin text-purple-400 mx-auto mb-3" />
                <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Loading Reset Gateway...</p>
              </Card>
            }
          >
            <ResetPasswordForm />
          </React.Suspense>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-[11px] text-slate-500 border-t border-slate-200 dark:border-white/5 relative z-10">
        <div className="flex items-center justify-center gap-2">
          <ShieldCheck className="h-3.5 w-3.5 text-purple-500 dark:text-purple-400" />
          <span>Encrypted Password Update Protocol</span>
        </div>
      </footer>
    </div>
  );
}
