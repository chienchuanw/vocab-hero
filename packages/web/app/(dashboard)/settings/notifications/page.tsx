'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { Layout } from '@/components/shared';
import { NotificationPreferences } from '@/components/features/notifications/NotificationPreferences';
import type { NotificationPreference } from '@/components/features/notifications/NotificationPreferences.types';
import { useDefaultUserId } from '@/hooks/useDefaultUserId';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export default function NotificationSettingsPage() {
  const t = useTranslations('settings');
  const queryClient = useQueryClient();
  const { data: userId } = useDefaultUserId();

  const {
    data: preferences,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['notificationPreferences', userId],
    queryFn: async () => {
      if (!userId) return null;
      const response = await fetch(`/api/notification-preferences?userId=${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch notification preferences');
      }

      const result = await response.json();
      return result.data as NotificationPreference | null;
    },
    enabled: !!userId,
  });

  const updateMutation = useMutation({
    mutationFn: async (updates: Partial<NotificationPreference>) => {
      if (!userId) throw new Error('User ID not available');
      const response = await fetch('/api/notification-preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          ...updates,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to update preferences');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notificationPreferences', userId] });
      toast.success('Notification preferences updated');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to update preferences');
    },
  });

  const handleUpdate = (updates: Partial<NotificationPreference>) => {
    updateMutation.mutate(updates);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-destructive">Error</h1>
            <p className="text-muted-foreground mt-1">Failed to load notification preferences</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">{t('notifications')}</h1>
          <p className="text-muted-foreground mt-1">{t('notificationsDesc')}</p>
        </div>
        <NotificationPreferences
          preferences={
            preferences || {
              id: '',
              userId: userId || '',
              goalAchievementEnabled: true,
              streakWarningEnabled: true,
              studyReminderEnabled: true,
              milestoneEnabled: true,
              pushEnabled: false,
              createdAt: new Date(),
              updatedAt: new Date(),
            }
          }
          onUpdate={handleUpdate}
          isLoading={updateMutation.isPending}
        />
      </div>
    </Layout>
  );
}
