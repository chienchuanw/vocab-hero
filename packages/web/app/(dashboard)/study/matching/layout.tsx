import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata');
  return {
    title: t('study.matching.title'),
    description: t('study.matching.description'),
  };
}

export default function MatchingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
