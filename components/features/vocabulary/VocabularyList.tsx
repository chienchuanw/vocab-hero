'use client';

import { useEffect, useRef } from 'react';
import { VocabularyCard } from './VocabularyCard';
import { Loader2 } from 'lucide-react';
import type { VocabularyItem } from '@/hooks/useVocabulary';
import type { UseInfiniteQueryResult } from '@tanstack/react-query';

/**
 * VocabularyList component props
 */
export interface VocabularyListProps {
  query: UseInfiniteQueryResult<any, Error>;
  onEdit?: (vocabulary: VocabularyItem) => void;
  onDelete?: (vocabulary: VocabularyItem) => void;
}

/**
 * VocabularyList component
 * Displays vocabulary list with infinite scroll support
 */
export function VocabularyList({ query, onEdit, onDelete }: VocabularyListProps) {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError, error } = query;

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

  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-gray-600">Loading...</span>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Failed to load: {error.message}</p>
      </div>
    );
  }

  // Get all pages data
  const vocabularyItems = data?.pages.flatMap((page: any) => page.items) ?? [];

  // Empty state
  if (vocabularyItems.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No vocabulary items yet</p>
        <p className="text-sm text-gray-400 mt-2">
          Click "Add Word" to start building your collection
        </p>
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
          <div className="flex items-center text-gray-600">
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            <span>Loading more...</span>
          </div>
        )}
      </div>
    </div>
  );
}
