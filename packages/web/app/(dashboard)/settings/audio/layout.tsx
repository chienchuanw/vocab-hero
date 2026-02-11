import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata');
  return {
    title: t('settings.audio.title'),
    description: t('settings.audio.description'),
  };
}

export default function AudioSettingsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
