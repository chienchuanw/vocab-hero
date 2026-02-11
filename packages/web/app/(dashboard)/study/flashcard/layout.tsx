import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata');
  return {
    title: t('study.flashcard.title'),
    description: t('study.flashcard.description'),
  };
}

export default function FlashcardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
