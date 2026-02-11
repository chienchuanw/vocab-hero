'use client';

import { useEffect } from 'react';
import { useTheme } from 'next-themes';
import { useTranslations } from 'next-intl';
import { Layout } from '@/components/shared';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ThemeToggle } from '@/components/features/settings';
import { useUserSettings, useUpdateUserSettings } from '@/hooks/useUserSettings';
import { toast } from 'sonner';
import { Loader2, Sun, Moon, Monitor } from 'lucide-react';

const DEFAULT_USER_ID = 'cmjod038p00008o9qathx7chz';

export default function ThemeSettingsPage() {
  const t = useTranslations('settings');
  const { theme, setTheme } = useTheme();
  const { data: settings, isLoading } = useUserSettings(DEFAULT_USER_ID);
  const updateMutation = useUpdateUserSettings();

  // Sync theme from database on initial load
  useEffect(() => {
    if (settings?.theme) {
      const dbTheme = settings.theme.toLowerCase();
      if (theme !== dbTheme) {
        setTheme(dbTheme);
      }
    }
  }, [settings?.theme, setTheme, theme]);

  // Persist theme changes to database
  useEffect(() => {
    if (!theme || !settings) return;

    const dbTheme = settings.theme.toLowerCase();
    if (theme !== dbTheme) {
      const themeUppercase = theme.toUpperCase() as 'LIGHT' | 'DARK' | 'SYSTEM';
      updateMutation.mutate(
        { userId: DEFAULT_USER_ID, theme: themeUppercase },
        {
          onError: (error) => {
            toast.error(error instanceof Error ? error.message : 'Failed to save theme');
          },
        }
      );
    }
  }, [theme, settings, updateMutation]);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container max-w-2xl py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">{t('appearance')}</h1>
          <p className="text-muted-foreground mt-2">{t('appearanceDesc')}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t('appearance')}</CardTitle>
            <CardDescription>{t('appearanceDesc')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <ThemeToggle variant="buttons" className="justify-center" />

            <div className="pt-4 border-t">
              <h4 className="text-sm font-medium mb-4">Theme Preview</h4>
              <div className="grid grid-cols-3 gap-4">
                <ThemePreviewCard
                  title="Light"
                  icon={Sun}
                  isActive={theme === 'light'}
                  bgClass="bg-white"
                  textClass="text-gray-900"
                  borderClass="border-gray-200"
                />
                <ThemePreviewCard
                  title="Dark"
                  icon={Moon}
                  isActive={theme === 'dark'}
                  bgClass="bg-gray-900"
                  textClass="text-gray-100"
                  borderClass="border-gray-700"
                />
                <ThemePreviewCard
                  title="System"
                  icon={Monitor}
                  isActive={theme === 'system'}
                  bgClass="bg-gradient-to-br from-white to-gray-900"
                  textClass="text-gray-600"
                  borderClass="border-gray-400"
                />
              </div>
            </div>

            {updateMutation.isPending && (
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Loader2 className="h-3 w-3 animate-spin" />
                Saving preference...
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

interface ThemePreviewCardProps {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  isActive: boolean;
  bgClass: string;
  textClass: string;
  borderClass: string;
}

function ThemePreviewCard({
  title,
  icon: Icon,
  isActive,
  bgClass,
  textClass,
  borderClass,
}: ThemePreviewCardProps) {
  return (
    <div
      className={`
        relative rounded-lg border-2 p-4 text-center transition-all
        ${borderClass} ${bgClass}
        ${isActive ? 'ring-2 ring-primary ring-offset-2' : 'opacity-60'}
      `}
    >
      <Icon className={`h-6 w-6 mx-auto mb-2 ${textClass}`} />
      <span className={`text-xs font-medium ${textClass}`}>{title}</span>
      {isActive && (
        <div className="absolute -top-1 -right-1 h-4 w-4 bg-primary rounded-full flex items-center justify-center">
          <span className="text-[10px] text-primary-foreground">&#10003;</span>
        </div>
      )}
    </div>
  );
}
