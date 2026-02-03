'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { FileQuestion } from 'lucide-react';

export default function NotFound() {
  const t = useTranslations('errors');
  const tc = useTranslations('common');

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6 text-center">
        <div className="flex justify-center">
          <FileQuestion className="h-16 w-16 text-muted-foreground" />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold">{t('pageNotFound')}</h1>
          <p className="text-muted-foreground">{t('pageNotFoundDesc')}</p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild variant="default">
            <Link href="/">{tc('goHome')}</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/vocabulary">{tc('browseVocabulary')}</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
