import { useMutation, useQueryClient } from '@tanstack/react-query';

/**
 * 新增群組的輸入資料介面
 */
export interface CreateGroupInput {
  name: string;
  description?: string;
}

/**
 * 更新群組的輸入資料介面
 */
export interface UpdateGroupInput {
  name?: string;
  description?: string;
}

/**
 * 管理群組單字的輸入資料介面
 */
export interface ManageGroupVocabularyInput {
  action: 'add' | 'remove';
  vocabularyIds: string[];
}

/**
 * useCreateGroup Hook
 * 新增群組的 mutation
 */
export function useCreateGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateGroupInput) => {
      const response = await fetch('/api/groups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to create group');
      }

      return response.json();
    },
    onSuccess: () => {
      // 重新載入群組列表
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
  });
}

/**
 * useUpdateGroup Hook
 * 更新群組的 mutation
 */
export function useUpdateGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateGroupInput }) => {
      const response = await fetch(`/api/groups/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to update group');
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      // 重新載入群組列表和該群組的詳細資訊
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      queryClient.invalidateQueries({ queryKey: ['groups', variables.id] });
    },
  });
}

/**
 * useDeleteGroup Hook
 * 刪除群組的 mutation
 */
export function useDeleteGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/groups/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to delete group');
      }

      return response.json();
    },
    onSuccess: () => {
      // 重新載入群組列表
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
  });
}

/**
 * useManageGroupVocabulary Hook
 * 管理群組中的單字（新增/移除）
 */
export function useManageGroupVocabulary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ManageGroupVocabularyInput }) => {
      const response = await fetch(`/api/groups/${id}/vocabulary`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to manage group vocabulary');
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      // 重新載入群組詳細資訊和單字列表
      queryClient.invalidateQueries({ queryKey: ['groups', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['vocabulary'] });
    },
  });
}

