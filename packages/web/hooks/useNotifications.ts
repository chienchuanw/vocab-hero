import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { CreateNotificationInput } from '@/lib/validations/notification';

/**
 * useNotifications Hook
 * 管理通知的自訂 Hook，包含查詢、建立、標記已讀等功能
 */

interface Notification {
  id: string;
  userId: string;
  type: 'GOAL_ACHIEVED' | 'STREAK_WARNING' | 'STUDY_REMINDER' | 'MILESTONE_REACHED' | 'FREEZE_USED';
  title: string;
  message: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * 查詢使用者的通知
 */
export function useNotifications(userId: string, isRead?: boolean) {
  return useQuery({
    queryKey: ['notifications', userId, isRead],
    queryFn: async () => {
      const params = new URLSearchParams({ userId });
      if (isRead !== undefined) {
        params.append('isRead', String(isRead));
      }

      const response = await fetch(`/api/notifications?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error?.message || 'Failed to fetch notifications');
      }

      return data.data as Notification[];
    },
  });
}

/**
 * 標記通知為已讀
 */
export function useMarkAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isRead: true }),
      });

      if (!response.ok) {
        throw new Error('Failed to mark notification as read');
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error?.message || 'Failed to mark notification as read');
      }

      return data.data;
    },
    onSuccess: () => {
      // 重新查詢通知列表
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

/**
 * 建立新通知
 */
export function useCreateNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateNotificationInput) => {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        throw new Error('Failed to create notification');
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error?.message || 'Failed to create notification');
      }

      return data.data as Notification;
    },
    onSuccess: () => {
      // 重新查詢通知列表
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

