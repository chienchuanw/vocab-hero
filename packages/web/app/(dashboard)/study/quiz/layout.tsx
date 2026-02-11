import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata');
  return {
    title: t('study.quiz.title'),
    description: t('study.quiz.description'),
  };
}

export default function QuizLayout({ children }: { children: React.ReactNode }) {
  return children;
}
