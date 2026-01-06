import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { UpdateUserSettingsInput } from '@/lib/validations/user-settings';

export interface UserSettings {
  id: string;
  userId: string;
  theme: 'LIGHT' | 'DARK' | 'SYSTEM';
  ttsSpeed: number;
  ttsVolume: number;
  ttsPitch: number;
  ttsVoice: string | null;
  cardsPerSession: number;
  defaultStudyMode: string;
  autoAdvance: boolean;
  showReading: boolean;
  language: string;
  createdAt: string;
  updatedAt: string;
}

export function useUserSettings(userId: string | undefined) {
  return useQuery({
    queryKey: ['userSettings', userId],
    queryFn: async () => {
      if (!userId) throw new Error('User ID is required');

      const response = await fetch(`/api/settings?userId=${userId}`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to fetch user settings');
      }

      const result = await response.json();
      return result.data as UserSettings;
    },
    enabled: !!userId,
  });
}

export interface UpdateUserSettingsData extends UpdateUserSettingsInput {
  userId: string;
}

export function useUpdateUserSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateUserSettingsData) => {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to update user settings');
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['userSettings', variables.userId] });
    },
  });
}
