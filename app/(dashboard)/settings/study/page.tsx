'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Layout } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
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
import { STUDY_MODES, CARDS_PER_SESSION_LIMITS } from '@/lib/validations/user-settings';
import { toast } from 'sonner';
import { Loader2, BookOpen, LayoutGrid, Eye, Play } from 'lucide-react';

const DEFAULT_USER_ID = 'cmjod038p00008o9qathx7chz';

const STUDY_MODE_LABELS: Record<string, string> = {
  FLASHCARD: 'Flashcard',
  MULTIPLE_CHOICE: 'Quiz',
  SPELLING: 'Spelling',
  MATCHING: 'Matching',
  RANDOM: 'Random',
  LISTENING: 'Listening',
};

function StudySettingsForm({
  settings,
}: {
  settings: NonNullable<ReturnType<typeof useUserSettings>['data']>;
}) {
  const t = useTranslations('settings');
  const updateMutation = useUpdateUserSettings();

  const [formData, setFormData] = useState({
    cardsPerSession: settings.cardsPerSession,
    defaultStudyMode: settings.defaultStudyMode,
    autoAdvance: settings.autoAdvance,
    showReading: settings.showReading,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await updateMutation.mutateAsync({
        userId: DEFAULT_USER_ID,
        cardsPerSession: formData.cardsPerSession,
        defaultStudyMode: formData.defaultStudyMode as
          | 'FLASHCARD'
          | 'MULTIPLE_CHOICE'
          | 'SPELLING'
          | 'MATCHING'
          | 'RANDOM'
          | 'LISTENING',
        autoAdvance: formData.autoAdvance,
        showReading: formData.showReading,
      });
      toast.success('Study preferences saved successfully!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save preferences');
    }
  };

  const hasChanges =
    formData.cardsPerSession !== settings.cardsPerSession ||
    formData.defaultStudyMode !== settings.defaultStudyMode ||
    formData.autoAdvance !== settings.autoAdvance ||
    formData.showReading !== settings.showReading;

  return (
    <div className="container max-w-2xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{t('study')}</h1>
        <p className="text-muted-foreground mt-2">{t('studyDesc')}</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LayoutGrid className="h-5 w-5" />
              Session Settings
            </CardTitle>
            <CardDescription>Configure how your study sessions work</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="cardsPerSession">Cards Per Session</Label>
                <span className="text-sm font-medium tabular-nums">{formData.cardsPerSession}</span>
              </div>
              <Slider
                id="cardsPerSession"
                min={CARDS_PER_SESSION_LIMITS.MIN}
                max={CARDS_PER_SESSION_LIMITS.MAX}
                step={5}
                value={[formData.cardsPerSession]}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    cardsPerSession: value[0] ?? formData.cardsPerSession,
                  })
                }
                className="w-full"
              />
              <p className="text-sm text-muted-foreground">
                Number of cards to review per session ({CARDS_PER_SESSION_LIMITS.MIN}-
                {CARDS_PER_SESSION_LIMITS.MAX})
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="defaultStudyMode" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Default Study Mode
              </Label>
              <Select
                value={formData.defaultStudyMode}
                onValueChange={(value) => setFormData({ ...formData, defaultStudyMode: value })}
              >
                <SelectTrigger id="defaultStudyMode">
                  <SelectValue placeholder="Select a study mode" />
                </SelectTrigger>
                <SelectContent>
                  {STUDY_MODES.map((mode) => (
                    <SelectItem key={mode} value={mode}>
                      {STUDY_MODE_LABELS[mode] || mode}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                The study mode that opens by default when starting a session
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Display Options
            </CardTitle>
            <CardDescription>Control what you see during study sessions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="showReading">Show Reading (Furigana)</Label>
                <p className="text-sm text-muted-foreground">
                  Display reading hints above kanji characters
                </p>
              </div>
              <Switch
                id="showReading"
                checked={formData.showReading}
                onCheckedChange={(checked) => setFormData({ ...formData, showReading: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="autoAdvance" className="flex items-center gap-2">
                  <Play className="h-4 w-4" />
                  Auto-Advance
                </Label>
                <p className="text-sm text-muted-foreground">
                  Automatically move to next card after answering
                </p>
              </div>
              <Switch
                id="autoAdvance"
                checked={formData.autoAdvance}
                onCheckedChange={(checked) => setFormData({ ...formData, autoAdvance: checked })}
              />
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

export default function StudySettingsPage() {
  const { data: settings, isLoading } = useUserSettings(DEFAULT_USER_ID);

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
      <StudySettingsForm key={settings.id} settings={settings} />
    </Layout>
  );
}
