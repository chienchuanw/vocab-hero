import { useMemo } from 'react';
import { useUserSettings } from './useUserSettings';
import type { TTSConfig } from '@/lib/tts';

const DEFAULT_USER_ID = 'cmjod038p00008o9qathx7chz';

export function useTTSConfig(userId: string = DEFAULT_USER_ID) {
  const { data: settings, isLoading, error } = useUserSettings(userId);

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
