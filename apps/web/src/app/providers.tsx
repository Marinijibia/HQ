'use client';

import * as React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../contexts/auth-context';
import { ThemeProvider } from '../contexts/theme-context';

import { PWAInstallBanner } from '../components/pwa-install-banner';

export function Providers({ children }: { children: React.ReactNode }) {
  // Prevent sharing query client instance between requests under SSR
  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute stale time
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <ThemeProvider>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          {children}
          <PWAInstallBanner />
        </QueryClientProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
