'use client';

import * as React from 'react';
import { useAuth } from '../../../contexts/auth-context';
import { Card, CardTitle, CardDescription, Button } from '@hq/ui';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

import { useRouter } from 'next/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { dbUser, loading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!loading && !dbUser) {
      router.push('/admin/login');
    }
  }, [dbUser, loading, router]);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="animate-pulse flex space-x-4">
          <div className="rounded-full bg-slate-700 h-10 w-10"></div>
          <div className="flex-1 space-y-6 py-1 col-span-3">
            <div className="h-2 bg-slate-700 rounded"></div>
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-4">
                <div className="h-2 bg-slate-700 rounded col-span-2"></div>
                <div className="h-2 bg-slate-700 rounded col-span-1"></div>
              </div>
              <div className="h-2 bg-slate-700 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const hasAccess =
    dbUser &&
    (dbUser.role === 'SUPER_ADMINISTRATOR' || dbUser.role === 'ADMINISTRATOR');

  if (!hasAccess) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center p-6 text-left">
        <Card className="max-w-md w-full border border-rose-500/20 bg-rose-500/5 backdrop-blur-md rounded-[2rem] p-8 shadow-2xl space-y-6 text-foreground">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-rose-500/10 text-rose-500 border border-rose-500/25 rounded-2xl flex items-center justify-center shrink-0">
              <ShieldAlert size={28} />
            </div>
            <div>
              <CardTitle className="text-xl font-extrabold text-white">Access Denied</CardTitle>
              <CardDescription className="text-rose-400 text-xs mt-0.5 font-semibold">Insufficient User Privileges</CardDescription>
            </div>
          </div>

          <p className="text-sm font-semibold text-foreground/70 leading-relaxed">
            The platform operations and kernel logs dashboard are restricted to designated system administrators. Contact your organization super administrator if you require a role elevate invite.
          </p>

          <div className="flex gap-4 pt-2">
            <Link href="/" className="w-full">
              <Button className="w-full bg-[#0A84FF] hover:bg-blue-600 text-white rounded-xl text-xs font-bold py-2.5 flex items-center justify-center gap-2">
                <ArrowLeft size={14} /> Back to Dashboard
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
