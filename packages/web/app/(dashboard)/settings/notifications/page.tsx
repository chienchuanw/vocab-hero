'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { Layout } from '@/components/shared';
import { NotificationPreferences } from '@/components/features/notifications/NotificationPreferences';
import type { NotificationPreference } from '@/components/features/notifications/NotificationPreferences.types';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const DEFAULT_USER_ID = 'cmjod038p00008o9qathx7chz';

const DEFAULT_PREFERENCES: NotificationPreference = {
  id: '',
  userId: DEFAULT_USER_ID,
  goalAchievementEnabled: true,
  streakWarningEnabled: true,
  studyReminderEnabled: true,
  milestoneEnabled: true,
  pushEnabled: false,
  createdAt: new Date(),
  updatedAt: new Date(),
};

export default function NotificationSettingsPage() {
  const t = useTranslations('settings');
  const queryClient = useQueryClient();

  const {
    data: preferences,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['notificationPreferences', DEFAULT_USER_ID],
    queryFn: async () => {
      const response = await fetch(`/api/notification-preferences?userId=${DEFAULT_USER_ID}`);
      if (!response.ok) {
        throw new Error('Failed to fetch notification preferences');
      }

      const result = await response.json();
      return result.data as NotificationPreference | null;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (updates: Partial<NotificationPreference>) => {
      const response = await fetch('/api/notification-preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: DEFAULT_USER_ID,
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
      queryClient.invalidateQueries({ queryKey: ['notificationPreferences', DEFAULT_USER_ID] });
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
        <div className="container max-w-2xl py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-destructive">Error</h1>
            <p className="text-muted-foreground mt-2">Failed to load notification preferences</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container max-w-2xl py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">{t('notifications')}</h1>
          <p className="text-muted-foreground mt-2">{t('notificationsDesc')}</p>
        </div>
        <NotificationPreferences
          preferences={preferences || DEFAULT_PREFERENCES}
          onUpdate={handleUpdate}
          isLoading={updateMutation.isPending}
        />
      </div>
    </Layout>
  );
}
