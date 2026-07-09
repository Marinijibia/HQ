'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../contexts/auth-context';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Input } from '@hq/ui';
import { ShieldCheck, LogIn, Sparkles, UserPlus } from 'lucide-react';

export default function LoginPage() {
  const { user, loading, signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();
  const router = useRouter();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [isSignUp, setIsSignUp] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    // Redirect if already authenticated
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError('Please fill in all credentials fields.');
      return;
    }

    try {
      if (isSignUp) {
        await signUpWithEmail(email, password);
      } else {
        await signInWithEmail(email, password);
      }
      router.push('/dashboard');
    } catch (err) {
      const errMsg =
        err instanceof Error ? err.message : 'Authentication failed. Please verify credentials.';
      setError(errMsg);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    try {
      await signInWithGoogle();
      router.push('/dashboard');
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Google authentication failed.';
      setError(errMsg);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4 select-none">
      <Card className="w-full max-w-md border border-hq-graphite/40 bg-hq-graphite/10 backdrop-blur-lg shadow-level-5 text-white animate-in zoom-in-95 duration-300">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto h-12 w-12 rounded-full bg-gradient-to-tr from-hq-blue to-hq-purple flex items-center justify-center text-white mb-3">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-white">
            {isSignUp ? 'Create Boardroom Account' : 'Verify Headquarters Identity'}
          </CardTitle>
          <CardDescription className="text-foreground/50 text-xs">
            {isSignUp
              ? 'Register a new profile to access organizational dashboard channels'
              : 'Authenticate to unlock the C-Suite AI boardroom'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/35 rounded-lg p-3 text-xs text-red-400 text-center">
              {error}
            </div>
          )}

          {/* Email / Password Form */}
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div className="space-y-1.5 text-xs text-left">
              <label className="font-semibold text-foreground/75">Email Address</label>
              <Input
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-hq-graphite/20 border-hq-graphite/40 text-white"
              />
            </div>

            <div className="space-y-1.5 text-xs text-left">
              <label className="font-semibold text-foreground/75">Password</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-hq-graphite/20 border-hq-graphite/40 text-white"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-10 bg-hq-blue hover:bg-hq-blue/90 text-white font-semibold text-sm transition-all"
            >
              {isSignUp ? (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Register Account
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign In
                </>
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-4">
            <div className="flex-grow border-t border-hq-graphite/20"></div>
            <span className="px-3 text-[10px] text-foreground/45 uppercase tracking-wider">
              Or continue with
            </span>
            <div className="flex-grow border-t border-hq-graphite/20"></div>
          </div>

          {/* Google SSO Login */}
          <Button
            onClick={handleGoogleLogin}
            disabled={loading}
            variant="outline"
            className="w-full h-10 border-hq-graphite/40 bg-hq-graphite/10 text-white hover:bg-hq-graphite/20 flex items-center justify-center gap-2 font-semibold text-xs transition-all"
          >
            Sign in with Google Account
          </Button>

          {/* Mode Switcher */}
          <div className="pt-2 text-center text-xs">
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
              }}
              className="text-hq-cyan hover:underline transition-all"
            >
              {isSignUp
                ? 'Already have an account? Sign In'
                : 'Need a boardroom account? Create one'}
            </button>
          </div>

          <div className="pt-2 text-center">
            <p className="text-[10px] text-foreground/45 flex items-center justify-center gap-1.5 leading-normal">
              <Sparkles className="h-3 w-3 text-hq-cyan" />
              Secure identity validation powered by Firebase credentials parameters.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
