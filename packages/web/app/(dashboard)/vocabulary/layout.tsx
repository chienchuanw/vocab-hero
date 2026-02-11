import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata');
  return {
    title: t('vocabulary.title'),
    description: t('vocabulary.description'),
  };
}

export default function VocabularyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
