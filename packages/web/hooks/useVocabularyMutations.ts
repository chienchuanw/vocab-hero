import { useMutation, useQueryClient } from '@tanstack/react-query';

/**
 * 新增單字的輸入資料介面
 */
export interface CreateVocabularyInput {
  word: string;
  reading: string;
  meaning: string;
  notes?: string;
  exampleSentences?: Array<{
    sentence: string;
    reading: string;
    meaning: string;
    order: number;
  }>;
  groupIds?: string[];
}

/**
 * 更新單字的輸入資料介面
 */
export interface UpdateVocabularyInput {
  word?: string;
  reading?: string;
  meaning?: string;
  notes?: string;
  exampleSentences?: Array<{
    sentence: string;
    reading: string;
    meaning: string;
    order: number;
  }>;
}

/**
 * useCreateVocabulary Hook
 * 新增單字的 mutation
 */
export function useCreateVocabulary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateVocabularyInput) => {
      const response = await fetch('/api/vocabulary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to create vocabulary');
      }

      return response.json();
    },
    onSuccess: () => {
      // 重新載入單字列表
      queryClient.invalidateQueries({ queryKey: ['vocabulary'] });
    },
  });
}

/**
 * useUpdateVocabulary Hook
 * 更新單字的 mutation
 */
export function useUpdateVocabulary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateVocabularyInput }) => {
      const response = await fetch(`/api/vocabulary/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to update vocabulary');
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      // 重新載入單字列表和該單字的詳細資訊
      queryClient.invalidateQueries({ queryKey: ['vocabulary'] });
      queryClient.invalidateQueries({ queryKey: ['vocabulary', variables.id] });
    },
  });
}

/**
 * useDeleteVocabulary Hook
 * 刪除單字的 mutation
 */
export function useDeleteVocabulary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/vocabulary/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to delete vocabulary');
      }

      return response.json();
    },
    onSuccess: () => {
      // 重新載入單字列表
      queryClient.invalidateQueries({ queryKey: ['vocabulary'] });
    },
  });
}
