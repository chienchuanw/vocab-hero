import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata');
  return {
    title: t('study.listening.title'),
    description: t('study.listening.description'),
  };
}

export default function ListeningLayout({ children }: { children: React.ReactNode }) {
  return children;
}
