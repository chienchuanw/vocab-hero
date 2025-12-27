import { useQuery } from '@tanstack/react-query';

/**
 * Group 項目介面
 */
export interface Group {
  id: string;
  name: string;
  description?: string | null;
  userId: string;
  vocabularyCount: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Group 詳細資訊介面（包含單字列表）
 */
export interface GroupDetail extends Group {
  vocabularyItems: Array<{
    id: string;
    word: string;
    reading: string;
    meaning: string;
    createdAt: string;
  }>;
}

/**
 * useGroups Hook
 * 取得所有群組列表
 *
 * @returns TanStack Query 的 query 結果
 */
export function useGroups() {
  return useQuery({
    queryKey: ['groups'],
    queryFn: async () => {
      const response = await fetch('/api/groups');

      if (!response.ok) {
        throw new Error('Failed to fetch groups');
      }

      const result = await response.json();
      return result.data as Group[];
    },
  });
}

/**
 * useGroup Hook
 * 取得單一群組的詳細資訊
 *
 * @param id - 群組 ID
 * @returns TanStack Query 的 query 結果
 */
export function useGroup(id: string | undefined) {
  return useQuery({
    queryKey: ['groups', id],
    queryFn: async () => {
      if (!id) throw new Error('Group ID is required');

      const response = await fetch(`/api/groups/${id}`);

      if (!response.ok) {
        throw new Error('Failed to fetch group');
      }

      const result = await response.json();
      return result.data as GroupDetail;
    },
    enabled: !!id,
  });
}

