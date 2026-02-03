import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata');
  return {
    title: t('settings.language.title'),
    description: t('settings.language.description'),
  };
}

export default function LanguageSettingsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
