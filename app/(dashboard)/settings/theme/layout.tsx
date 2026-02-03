import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata');
  return {
    title: t('settings.theme.title'),
    description: t('settings.theme.description'),
  };
}

export default function ThemeSettingsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
