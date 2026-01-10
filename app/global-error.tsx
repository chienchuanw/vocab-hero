'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global error boundary caught:', error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-background text-foreground">
          <div className="w-full max-w-md space-y-6 text-center">
            <div className="flex justify-center">
              <AlertCircle className="h-16 w-16 text-destructive" />
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl font-bold">Critical Error</h1>
              <p className="text-muted-foreground">
                A critical error occurred. Please reload the page.
              </p>
            </div>

            {process.env.NODE_ENV === 'development' && (
              <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-left">
                <p className="text-sm font-semibold text-destructive">
                  Error Details (Development Only):
                </p>
                <p className="mt-2 font-mono text-xs text-destructive/80">{error.message}</p>
                {error.digest && (
                  <p className="mt-1 font-mono text-xs text-destructive/60">
                    Digest: {error.digest}
                  </p>
                )}
              </div>
            )}

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button onClick={reset} variant="default">
                Reload Application
              </Button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
