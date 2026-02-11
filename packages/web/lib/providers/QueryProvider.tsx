'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

/**
 * QueryProvider component - TanStack Query provider
 * Provides React Query client to the application
 * Handles server state management and caching
 */

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            gcTime: 5 * 60 * 1000,
            refetchOnWindowFocus: false,
            retry: (failureCount, error) => {
              if (typeof window !== 'undefined' && !navigator.onLine) {
                return false;
              }

              const status = (error as { response?: { status?: number } })?.response?.status;
              if (status && (status === 404 || status === 401 || status === 403)) {
                return false;
              }

              return failureCount < 3;
            },
            retryDelay: (attemptIndex) => {
              return Math.min(1000 * 2 ** attemptIndex, 30000);
            },
          },
          mutations: {
            retry: (failureCount, error) => {
              if (typeof window !== 'undefined' && !navigator.onLine) {
                return false;
              }

              const status = (error as { response?: { status?: number } })?.response?.status;
              if (status && status >= 400 && status < 500) {
                return false;
              }

              return failureCount < 2;
            },
            retryDelay: (attemptIndex) => {
              return Math.min(1000 * 2 ** attemptIndex, 30000);
            },
          },
        },
      })
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
