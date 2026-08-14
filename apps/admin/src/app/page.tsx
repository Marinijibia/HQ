'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/auth-context';

export default function RootPage() {
  const { dbUser, loading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!loading) {
      if (dbUser && (dbUser.role === 'SUPER_ADMINISTRATOR' || dbUser.role === 'ADMINISTRATOR')) {
        router.push('/dashboard');
      } else {
        router.push('/login');
      }
    }
  }, [dbUser, loading, router]);

  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-hq-blue border-t-transparent" />
    </div>
  );
}
