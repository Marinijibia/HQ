'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../contexts/auth-context';
import { Loader2 } from 'lucide-react';

export default function MissionTimelinePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = React.use(params);
  const { token } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (token && resolvedParams.id) {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      };
      fetch(`/api/missions/${resolvedParams.id}`, { headers })
        .then((res) => {
          if (res.ok) return res.json();
          throw new Error('Mission not found');
        })
        .then((data) => {
          if (data.conversations && data.conversations.length > 0) {
            router.replace(`/discussions/${data.conversations[0].id}`);
          } else {
            router.replace('/discussions');
          }
        })
        .catch(() => {
          router.replace('/discussions');
        });
    }
  }, [token, resolvedParams.id, router]);

  return (
    <div className="flex h-[70vh] items-center justify-center bg-background select-none">
      <div className="flex flex-col items-center space-y-3">
        <Loader2 className="h-8 w-8 text-hq-cyan animate-spin" />
        <p className="text-xs text-foreground/50">Opening Unified Boardroom Discussion...</p>
      </div>
    </div>
  );
}
