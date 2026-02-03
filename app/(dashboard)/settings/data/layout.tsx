import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata');
  return {
    title: t('settings.data.title'),
    description: t('settings.data.description'),
  };
}

export default function DataSettingsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
