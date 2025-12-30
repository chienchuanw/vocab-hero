import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { UpdateDailyGoalInput } from '@/lib/validations/daily-goal';

/**
 * Daily Goal interface
 */
export interface DailyGoal {
  id: string;
  userId: string;
  wordsPerDay: number;
  minutesPerDay: number;
  reminderTime: string;
  pushEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * useDailyGoal Hook
 * Fetches the daily goal for a specific user
 *
 * @param userId - User ID
 * @returns TanStack Query result with daily goal data
 */
export function useDailyGoal(userId: string | undefined) {
  return useQuery({
    queryKey: ['dailyGoal', userId],
    queryFn: async () => {
      if (!userId) throw new Error('User ID is required');

      const response = await fetch(`/api/goals?userId=${userId}`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to fetch daily goal');
      }

      const result = await response.json();
      return result.data as DailyGoal;
    },
    enabled: !!userId,
  });
}

/**
 * Update Daily Goal Input with userId
 */
export interface UpdateDailyGoalData extends UpdateDailyGoalInput {
  userId: string;
}

/**
 * useUpdateDailyGoal Hook
 * Mutation for creating or updating daily goal
 *
 * @returns TanStack Query mutation result
 */
export function useUpdateDailyGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateDailyGoalData) => {
      const response = await fetch('/api/goals', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to update daily goal');
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      // Invalidate daily goal query to refetch updated data
      queryClient.invalidateQueries({ queryKey: ['dailyGoal', variables.userId] });
    },
  });
}

