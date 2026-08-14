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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.hq.netify.ng';

export default function AdminRegisterPage() {
  const router = useRouter();

  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [checkingSetup, setCheckingSetup] = React.useState(true);
  const [isSetupRequired, setIsSetupRequired] = React.useState<boolean | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const checkStatus = async () => {
      try {
        let res = await fetch('/api/auth/setup-status').catch(() => null);
        if (!res || !res.ok) {
          res = await fetch(`${API_BASE_URL}/auth/setup-status`).catch(() => null);
        }
        if (res && res.ok) {
          const data = await res.json();
          setIsSetupRequired(data.isSetupRequired ?? true);
        } else {
          setIsSetupRequired(true);
        }
      } catch {
        setIsSetupRequired(true);
      } finally {
        setCheckingSetup(false);
      }
    };
    checkStatus();
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all required fields.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify your confirm password.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      let res = await fetch('/api/auth/register-super-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      }).catch(() => null);

      if (!res || !res.ok) {
        res = await fetch(`${API_BASE_URL}/auth/register-super-admin`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password }),
        }).catch(() => null);
      }

      if (!res) {
        throw new Error('Could not connect to HQ API backend server.');
      }

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

  if (checkingSetup) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#070709] text-slate-900 dark:text-white p-4">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-8 h-8 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin" />
          <p className="text-xs text-slate-400 font-semibold">Checking Super Admin Setup Status...</p>
        </div>
      </div>
    );
  }

  if (isSetupRequired === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#070709] text-slate-900 dark:text-white p-4">
        <Card className="max-w-md w-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-8 rounded-3xl space-y-6 text-center shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
            <ShieldAlert size={28} />
          </div>
          <div className="space-y-2">
            <h2 className="text-lg font-black tracking-tight">Super Admin Registration Closed</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              An initial Super Administrator has already been registered on this HQ instance. Further Super Admin setup is locked for security.
            </p>
          </div>
          <Button
            onClick={() => router.push('/login')}
            className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-xs py-3 rounded-2xl shadow-lg"
          >
            Proceed to Super Admin Sign In
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#070709] text-slate-900 dark:text-white p-4 relative overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/10 via-blue-500/5 to-purple-600/10 blur-3xl pointer-events-none" />

      <Card className="max-w-md w-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/90 backdrop-blur-2xl p-8 rounded-3xl space-y-6 shadow-2xl relative z-10">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-500 to-purple-600 p-[1.5px]">
              <div className="w-full h-full bg-white dark:bg-slate-950 rounded-[14px] flex items-center justify-center text-slate-900 dark:text-white font-bold text-base">
                👑
              </div>
            </div>
            <div>
              <h1 className="text-base font-black tracking-tight">HQ Super Admin Setup</h1>
              <p className="text-[11px] text-slate-400 font-medium">Initial System Bootstrap</p>
            </div>
          </div>
          <Badge variant="ai" className="text-[9px] font-bold uppercase">
            INITIAL SETUP
          </Badge>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold flex items-center gap-2">
            <ShieldAlert size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-extrabold text-slate-600 dark:text-slate-300 uppercase tracking-wider block">
              Super Admin Full Name
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Master Administrator"
              required
              className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white h-11 rounded-2xl px-4 focus:border-cyan-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-extrabold text-slate-600 dark:text-slate-300 uppercase tracking-wider block">
              Super Admin Email Address
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@hq.netify.ng"
              required
              className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white h-11 rounded-2xl px-4 focus:border-cyan-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-extrabold text-slate-600 dark:text-slate-300 uppercase tracking-wider block">
              Super Admin Password
            </label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters..."
              required
              minLength={8}
              className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white h-11 rounded-2xl px-4 focus:border-cyan-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-extrabold text-slate-600 dark:text-slate-300 uppercase tracking-wider block">
              Confirm Super Admin Password
            </label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter password..."
              required
              minLength={8}
              className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white h-11 rounded-2xl px-4 focus:border-cyan-500"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-black text-xs h-12 rounded-2xl shadow-xl flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Registering Super Admin...
              </>
            ) : (
              <>
                <UserPlus size={16} /> Complete Super Admin Registration
              </>
            )}
          </Button>
        </form>

        <div className="pt-2 text-center">
          <button
            onClick={() => router.push('/login')}
            className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium flex items-center justify-center gap-1 mx-auto transition-colors"
          >
            <ArrowLeft size={14} /> Back to Sign In
          </button>
        </div>
      </Card>
    </div>
  );
}

