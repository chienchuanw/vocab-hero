import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import type { MasteryLevel } from '@/lib/srs/mastery';

/**
 * Vocabulary 查詢參數介面
 */
export interface VocabularyQueryParams {
  search?: string;
  sortBy?: 'createdAt' | 'word' | 'mastery';
  sortOrder?: 'asc' | 'desc';
  groupId?: string;
  masteryLevel?: MasteryLevel;
  limit?: number;
}

/**
 * Vocabulary 項目介面
 */
export interface VocabularyItem {
  id: string;
  word: string;
  reading: string;
  meaning: string;
  notes?: string | null;
  mastery: number;
  createdAt: string;
  updatedAt: string;
  reviewSchedule?: {
    easinessFactor: number;
    interval: number;
    repetitions: number;
    nextReviewDate: string;
  } | null;
}

/**
 * Vocabulary 列表回應介面
 */
interface VocabularyListResponse {
  success: boolean;
  data: {
    items: VocabularyItem[];
    nextCursor: string | null;
    hasNextPage: boolean;
  };
}

/**
 * 建立查詢字串
 */
function buildQueryString(params: VocabularyQueryParams, cursor?: string): string {
  const searchParams = new URLSearchParams();

  if (params.search) searchParams.set('search', params.search);
  if (params.sortBy) searchParams.set('sortBy', params.sortBy);
  if (params.sortOrder) searchParams.set('sortOrder', params.sortOrder);
  if (params.groupId) searchParams.set('groupId', params.groupId);
  if (params.masteryLevel) searchParams.set('masteryLevel', params.masteryLevel);
  if (params.limit) searchParams.set('limit', params.limit.toString());
  if (cursor) searchParams.set('cursor', cursor);

  return searchParams.toString();
}

/**
 * useVocabulary Hook
 * 使用 infinite query 支援無限滾動載入單字列表
 *
 * @param params - 查詢參數（搜尋、排序、篩選）
 * @returns TanStack Query 的 infinite query 結果
 */
export function useVocabulary(params: VocabularyQueryParams = {}) {
  return useInfiniteQuery({
    queryKey: ['vocabulary', params],
    queryFn: async ({ pageParam }) => {
      const queryString = buildQueryString(params, pageParam);
      const response = await fetch(`/api/vocabulary?${queryString}`);

      if (!response.ok) {
        throw new Error('Failed to fetch vocabulary');
      }

      const result: VocabularyListResponse = await response.json();
      return result.data;
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => {
      return lastPage.hasNextPage ? lastPage.nextCursor : undefined;
    },
  });
}

/**
 * useVocabularyItem Hook
 * 取得單一單字的詳細資訊
 *
 * @param id - 單字 ID
 * @returns TanStack Query 的 query 結果
 */
export function useVocabularyItem(id: string | undefined) {
  return useQuery({
    queryKey: ['vocabulary', id],
    queryFn: async () => {
      if (!id) throw new Error('Vocabulary ID is required');

      const response = await fetch(`/api/vocabulary/${id}`);

      if (!response.ok) {
        throw new Error('Failed to fetch vocabulary item');
      }

      const result = await response.json();
      return result.data;
    },
    enabled: !!id,
  });
}
