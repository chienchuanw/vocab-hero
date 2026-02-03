'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { StudyModeCardProps } from './StudyModeCard.types';

/**
 * StudyModeCard Component
 * 顯示單一學習模式的卡片，包含圖示、標題、描述和導航連結
 */
export function StudyModeCard({ mode }: StudyModeCardProps) {
  const t = useTranslations('study');
  const Icon = mode.icon;

  // 根據 mode.id 取得翻譯的標題和描述
  const getTitleAndDescription = () => {
    switch (mode.id) {
      case 'flashcard':
        return { title: t('flashcard'), description: t('flashcardDesc') };
      case 'quiz':
        return { title: t('quiz'), description: t('quizDesc') };
      case 'listening':
        return { title: t('listening'), description: t('listeningDesc') };
      case 'matching':
        return { title: t('matching'), description: t('matchingDesc') };
      case 'random':
        return { title: t('random'), description: t('randomDesc') };
      case 'spelling':
        return { title: t('spelling'), description: t('spellingDesc') };
      default:
        return { title: mode.title, description: mode.description };
    }
  };

  const { title, description } = getTitleAndDescription();

  return (
    <Link href={mode.route} className="block">
      <Card className="h-full transition-all duration-200 hover:shadow-lg hover:scale-105 cursor-pointer">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-primary/10 p-3">
              <Icon className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-xl">{title}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-base">{description}</CardDescription>
        </CardContent>
      </Card>
    </Link>
  );
}
