'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function OrganizationRedirectPage() {
  const router = useRouter();

  React.useEffect(() => {
    // Redirect to unified Settings under Organization tab
    router.replace('/settings?tab=organization');
  }, [router]);

  return (
    <div className="flex h-[70vh] items-center justify-center bg-background select-none">
      <div className="flex flex-col items-center space-y-3">
        <Loader2 className="h-8 w-8 text-hq-cyan animate-spin" />
        <p className="text-xs text-foreground/50">Redirecting to Organization Settings...</p>
      </div>
    </div>
  );
}
