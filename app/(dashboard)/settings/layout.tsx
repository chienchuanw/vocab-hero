import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata');
  return {
    title: t('settings.title'),
    description: t('settings.description'),
  };
}

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
