import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata');
  return {
    title: t('study.random.title'),
    description: t('study.random.description'),
  };
}

export default function RandomLayout({ children }: { children: React.ReactNode }) {
  return children;
}
