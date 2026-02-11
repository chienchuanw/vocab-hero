import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata');
  return {
    title: t('progress.title'),
    description: t('progress.description'),
  };
}

export default function ProgressLayout({ children }: { children: React.ReactNode }) {
  return children;
}
