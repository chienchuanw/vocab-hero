'use client';

import { useEffect, useRef } from 'react';
import { VocabularyCard } from './VocabularyCard';
import { Loader2 } from 'lucide-react';
import type { VocabularyItem } from '@/hooks/useVocabulary';
import type { UseInfiniteQueryResult } from '@tanstack/react-query';

/**
 * VocabularyList 元件的 Props
 */
export interface VocabularyListProps {
  query: UseInfiniteQueryResult<any, Error>;
  onEdit?: (vocabulary: VocabularyItem) => void;
  onDelete?: (vocabulary: VocabularyItem) => void;
}

/**
 * VocabularyList 元件
 * 顯示單字列表，支援 infinite scroll
 */
export function VocabularyList({ query, onEdit, onDelete }: VocabularyListProps) {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError, error } = query;

  // Infinite scroll 的觀察器
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

  // Loading 狀態
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-gray-600">載入中...</span>
      </div>
    );
  }

  // Error 狀態
  if (isError) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">載入失敗：{error.message}</p>
      </div>
    );
  }

  // 取得所有頁面的資料
  const vocabularyItems = data?.pages.flatMap((page: any) => page.items) ?? [];

  // 空狀態
  if (vocabularyItems.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">尚無單字資料</p>
        <p className="text-sm text-gray-400 mt-2">點擊「新增單字」開始建立你的單字庫</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 單字卡片列表 */}
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

      {/* Infinite scroll 觸發點 */}
      <div ref={observerTarget} className="h-10 flex justify-center items-center">
        {isFetchingNextPage && (
          <div className="flex items-center text-gray-600">
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            <span>載入更多...</span>
          </div>
        )}
      </div>
    </div>
  );
}
