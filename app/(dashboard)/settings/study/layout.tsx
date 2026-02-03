import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata');
  return {
    title: t('settings.study.title'),
    description: t('settings.study.description'),
  };
}

export default function StudySettingsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
