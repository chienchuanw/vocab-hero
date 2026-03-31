'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Layout } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useUserSettings, useUpdateUserSettings } from '@/hooks/useUserSettings';
import { useDefaultUserId } from '@/hooks/useDefaultUserId';
import { TTS_LIMITS } from '@/lib/validations/user-settings';
import { toast } from 'sonner';
import { Loader2, Volume2, Play, Gauge, Music } from 'lucide-react';

interface VoiceOption {
  name: string;
  lang: string;
  voiceURI: string;
}

function AudioSettingsForm({
  settings,
  userId,
}: {
  settings: NonNullable<ReturnType<typeof useUserSettings>['data']>;
  userId: string;
}) {
  const t = useTranslations('settings');
  const updateMutation = useUpdateUserSettings();

  const [formData, setFormData] = useState({
    ttsSpeed: settings.ttsSpeed,
    ttsVolume: settings.ttsVolume,
    ttsPitch: settings.ttsPitch,
    ttsVoice: settings.ttsVoice,
  });

  const [voices, setVoices] = useState<VoiceOption[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      const japaneseVoices = availableVoices
        .filter((voice) => voice.lang.startsWith('ja'))
        .map((voice) => ({
          name: voice.name,
          lang: voice.lang,
          voiceURI: voice.voiceURI,
        }));

      if (japaneseVoices.length > 0) {
        setVoices(japaneseVoices);
      } else {
        setVoices(
          availableVoices.slice(0, 10).map((voice) => ({
            name: voice.name,
            lang: voice.lang,
            voiceURI: voice.voiceURI,
          }))
        );
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await updateMutation.mutateAsync({
        userId,
        ttsSpeed: formData.ttsSpeed,
        ttsVolume: formData.ttsVolume,
        ttsPitch: formData.ttsPitch,
        ttsVoice: formData.ttsVoice,
      });
      toast.success('Audio settings saved successfully!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save settings');
    }
  };

  const handlePreview = () => {
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance('こんにちは、日本語の発音テストです。');
    utterance.rate = formData.ttsSpeed;
    utterance.volume = formData.ttsVolume;
    utterance.pitch = formData.ttsPitch;

    if (formData.ttsVoice) {
      const voice = window.speechSynthesis
        .getVoices()
        .find((v) => v.voiceURI === formData.ttsVoice);
      if (voice) utterance.voice = voice;
    }

    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    setIsPlaying(true);
    window.speechSynthesis.speak(utterance);
  };

  const hasChanges =
    formData.ttsSpeed !== settings.ttsSpeed ||
    formData.ttsVolume !== settings.ttsVolume ||
    formData.ttsPitch !== settings.ttsPitch ||
    formData.ttsVoice !== settings.ttsVoice;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t('audio')}</h1>
        <p className="text-muted-foreground mt-1">{t('audioDesc')}</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Volume2 className="h-5 w-5" />
              Voice Settings
            </CardTitle>
            <CardDescription>Choose a voice for pronunciation playback</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="ttsVoice" className="flex items-center gap-2">
                <Music className="h-4 w-4" />
                Voice
              </Label>
              <Select
                value={formData.ttsVoice || 'default'}
                onValueChange={(value) =>
                  setFormData({ ...formData, ttsVoice: value === 'default' ? null : value })
                }
              >
                <SelectTrigger id="ttsVoice">
                  <SelectValue placeholder="Select a voice" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">System Default</SelectItem>
                  {voices.map((voice) => (
                    <SelectItem key={voice.voiceURI} value={voice.voiceURI}>
                      {voice.name} ({voice.lang})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                {voices.length === 0
                  ? 'Loading available voices...'
                  : `${voices.length} voice${voices.length === 1 ? '' : 's'} available`}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gauge className="h-5 w-5" />
              Playback Settings
            </CardTitle>
            <CardDescription>Adjust speed, volume, and pitch</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="ttsSpeed">Speed</Label>
                <span className="text-sm font-medium tabular-nums">
                  {formData.ttsSpeed.toFixed(1)}x
                </span>
              </div>
              <Slider
                id="ttsSpeed"
                min={TTS_LIMITS.SPEED.MIN}
                max={2}
                step={0.1}
                value={[formData.ttsSpeed]}
                onValueChange={(value) =>
                  setFormData({ ...formData, ttsSpeed: value[0] ?? formData.ttsSpeed })
                }
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Slower</span>
                <span>Faster</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="ttsVolume">Volume</Label>
                <span className="text-sm font-medium tabular-nums">
                  {Math.round(formData.ttsVolume * 100)}%
                </span>
              </div>
              <Slider
                id="ttsVolume"
                min={TTS_LIMITS.VOLUME.MIN}
                max={TTS_LIMITS.VOLUME.MAX}
                step={0.1}
                value={[formData.ttsVolume]}
                onValueChange={(value) =>
                  setFormData({ ...formData, ttsVolume: value[0] ?? formData.ttsVolume })
                }
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Quieter</span>
                <span>Louder</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="ttsPitch">Pitch</Label>
                <span className="text-sm font-medium tabular-nums">
                  {formData.ttsPitch.toFixed(1)}
                </span>
              </div>
              <Slider
                id="ttsPitch"
                min={TTS_LIMITS.PITCH.MIN}
                max={TTS_LIMITS.PITCH.MAX}
                step={0.1}
                value={[formData.ttsPitch]}
                onValueChange={(value) =>
                  setFormData({ ...formData, ttsPitch: value[0] ?? formData.ttsPitch })
                }
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Lower</span>
                <span>Higher</span>
              </div>
            </div>

            <div className="pt-4 border-t">
              <Button type="button" variant="outline" onClick={handlePreview} className="w-full">
                <Play className="mr-2 h-4 w-4" />
                {isPlaying ? 'Stop Preview' : 'Preview Voice'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button type="submit" disabled={updateMutation.isPending || !hasChanges}>
            {updateMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default function AudioSettingsPage() {
  const { data: userId } = useDefaultUserId();
  const { data: settings, isLoading } = useUserSettings(userId || '');

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </Layout>
    );
  }

  if (!settings) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">Failed to load settings</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <AudioSettingsForm key={settings.id} settings={settings} userId={userId || ''} />
    </Layout>
  );
}
