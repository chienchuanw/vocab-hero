'use client';

import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { Layout } from '@/components/shared';
import { Card, CardContent } from '@/components/ui/card';
import { Check } from 'lucide-react';

const locales = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'zh-TW', name: '繁體中文', nativeName: '繁體中文' },
];

export default function LanguageSettingsPage() {
  const t = useTranslations('language');
  const currentLocale = useLocale();

  const setLocale = (locale: string) => {
    document.cookie = `locale=${locale}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
    window.location.reload();
  };

  return (
    <Layout>
      <div className="container max-w-2xl py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground mt-2">{t('description')}</p>
        </div>

        <div className="grid gap-4">
          {locales.map((locale) => (
            <Card
              key={locale.code}
              className={`cursor-pointer transition-colors hover:bg-accent ${
                currentLocale === locale.code ? 'border-primary bg-accent' : ''
              }`}
              onClick={() => setLocale(locale.code)}
              data-testid={`language-option-${locale.code}`}
            >
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium">{locale.nativeName}</p>
                  {locale.code !== currentLocale && (
                    <p className="text-sm text-muted-foreground">{locale.name}</p>
                  )}
                </div>
                {currentLocale === locale.code && <Check className="h-5 w-5 text-primary" />}
              </CardContent>
            </Card>
          ))}
        </div>

        <p className="text-sm text-muted-foreground mt-6">
          {t('current')}: {locales.find((l) => l.code === currentLocale)?.nativeName}
        </p>
      </div>
    </Layout>
  );
}
