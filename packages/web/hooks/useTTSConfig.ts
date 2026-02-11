import { useMemo } from 'react';
import { useUserSettings } from './useUserSettings';
import { useDefaultUserId } from './useDefaultUserId';
import type { TTSConfig } from '@/lib/tts';

export function useTTSConfig(userId?: string) {
  const { data: defaultUserId } = useDefaultUserId();
  const resolvedUserId = userId || defaultUserId;
  const { data: settings, isLoading, error } = useUserSettings(resolvedUserId || '');

  const ttsConfig: TTSConfig | undefined = useMemo(() => {
    if (!settings) return undefined;

    return {
      speed: settings.ttsSpeed,
      volume: settings.ttsVolume,
      pitch: settings.ttsPitch,
      voiceName: settings.ttsVoice || undefined,
      lang: 'ja-JP',
    };
  }, [settings]);

  return {
    ttsConfig,
    isLoading,
    error,
  };
}
