'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../contexts/auth-context';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button } from '@hq/ui';
import { ShieldCheck, LogIn, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const { user, loading, signInWithGoogle } = useAuth();
  const router = useRouter();
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    // Redirect if already authenticated
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const handleLogin = async () => {
    setError(null);
    try {
      await signInWithGoogle();
      router.push('/dashboard');
    } catch (err) {
      const errMsg =
        err instanceof Error ? err.message : 'Authentication failed. Please verify credentials.';
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
            Verify Headquarters Identity
          </CardTitle>
          <CardDescription className="text-foreground/50 text-xs">
            Authenticate to unlock the C-Suite AI boardroom
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/35 rounded-lg p-3 text-xs text-red-400 text-center">
              {error}
            </div>
          )}

          <Button
            onClick={handleLogin}
            disabled={loading}
            className="w-full h-11 bg-gradient-to-r from-hq-blue to-hq-purple hover:from-hq-blue/90 hover:to-hq-purple/90 text-white flex items-center justify-center gap-2 font-semibold text-sm transition-all"
          >
            <LogIn className="h-4 w-4" />
            {loading ? 'Authenticating...' : 'Sign in with Google Account'}
          </Button>

          <div className="pt-2 text-center">
            <p className="text-[10px] text-foreground/45 flex items-center justify-center gap-1.5 leading-normal">
              <Sparkles className="h-3 w-3 text-hq-cyan" />
              Secure single sign-on powered by Firebase Identity Guards.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
