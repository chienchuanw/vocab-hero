'use client';

import { useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { VocabularyCard } from './VocabularyCard';
import { Loader2, AlertCircle, BookOpen } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/shared/EmptyState';
import type { VocabularyItem } from '@/hooks/useVocabulary';
import type { UseInfiniteQueryResult, InfiniteData } from '@tanstack/react-query';

interface VocabularyPageData {
  items: VocabularyItem[];
  nextCursor: string | null;
  hasNextPage: boolean;
}

export interface VocabularyListProps {
  query: UseInfiniteQueryResult<InfiniteData<VocabularyPageData, unknown>, Error>;
  onEdit?: (vocabulary: VocabularyItem) => void;
  onDelete?: (vocabulary: VocabularyItem) => void;
}

/**
 * VocabularyList component
 * Displays vocabulary list with infinite scroll support
 */
export function VocabularyList({ query, onEdit, onDelete }: VocabularyListProps) {
   const t = useTranslations('vocabulary');
   const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError, error, refetch } = query;

  // Infinite scroll observer
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  // Loading state - Skeleton grid
  if (isLoading) {
    return (
      <div className="space-y-4" data-testid="vocabulary-list-loading">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-48 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

   // Error state with retry
   if (isError) {
     return (
       <div className="flex flex-col items-center justify-center py-12 text-center space-y-4" data-testid="vocabulary-list-error">
         <AlertCircle className="h-12 w-12 text-destructive" />
         <h3 className="text-lg font-semibold">{t('list.error')}</h3>
         <p className="text-sm text-muted-foreground">{error?.message}</p>
         <Button onClick={() => refetch()} variant="outline">
           {t('list.retry')}
         </Button>
       </div>
     );
   }

  // Get all pages data
  const vocabularyItems = data?.pages.flatMap((page) => page.items) ?? [];

   // Empty state using shared EmptyState component
   if (vocabularyItems.length === 0) {
     return (
       <div data-testid="vocabulary-list-empty">
         <EmptyState
           icon={BookOpen}
           title={t('list.empty')}
           description={t('list.emptyDescription')}
           actionLabel={t('list.emptyAction')}
         />
       </div>
     );
   }

  return (
    <div className="space-y-4">
      {/* Vocabulary cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {vocabularyItems.map((vocabulary: VocabularyItem) => (
          <VocabularyCard
            key={vocabulary.id}
            vocabulary={vocabulary}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>

       {/* Infinite scroll trigger */}
       <div ref={observerTarget} className="h-10 flex justify-center items-center">
         {isFetchingNextPage && (
           <div className="flex items-center text-muted-foreground">
             <Loader2 className="h-5 w-5 animate-spin mr-2" />
             <span>{t('list.loadingMore')}</span>
           </div>
         )}
       </div>
    </div>
  );
}
