'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import CeoChatAndDiscussionsPage from '../ceo-chat/page';

export default function DiscussionsRedirectPage() {
  const router = useRouter();

  React.useEffect(() => {
    // Seamlessly redirect route to Unified Executive Hub
    router.replace('/ceo-chat');
  }, [router]);

  return <CeoChatAndDiscussionsPage />;
}
