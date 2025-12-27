import { Skeleton } from '@/components/ui/skeleton';
import { Loader2 } from 'lucide-react';

/**
 * Loading component - Display loading state
 * Provides spinner and skeleton screen options
 */

interface LoadingProps {
  variant?: 'spinner' | 'skeleton';
  text?: string;
}

export function Loading({ variant = 'spinner', text = 'Loading...' }: LoadingProps) {
  if (variant === 'skeleton') {
    return <LoadingSkeleton />;
  }

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  );
}

/**
 * LoadingSkeleton component - Skeleton screen for content loading
 * Used for vocabulary cards, lists, etc.
 */
export function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-32 w-full" />
    </div>
  );
}

/**
 * CardSkeleton component - Skeleton for vocabulary card
 */
export function CardSkeleton() {
  return (
    <div className="space-y-3 rounded-lg border p-6">
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-full" />
    </div>
  );
}

