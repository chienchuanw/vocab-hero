'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';

export interface GameCompleteProps {
  elapsedTime: number;
  attempts: number;
  onRestart: () => void;
  onBackToStudy: () => void;
}

export function GameComplete({
  elapsedTime,
  attempts,
  onRestart,
  onBackToStudy,
}: GameCompleteProps) {
  const t = useTranslations('study');
  const tc = useTranslations('common');

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getPerformanceRating = (): {
    title: string;
    message: string;
    emoji: string;
  } => {
    if (attempts === 5) {
      return {
        title: t('gameComplete.perfect'),
        message: t('gameComplete.perfectMessage'),
        emoji: '🏆',
      };
    }

    if (attempts <= 7) {
      return {
        title: t('gameComplete.excellent'),
        message: t('gameComplete.excellentMessage'),
        emoji: '⭐',
      };
    }

    if (attempts <= 10) {
      return {
        title: t('gameComplete.wellDone'),
        message: t('gameComplete.wellDoneMessage'),
        emoji: '👍',
      };
    }

    return {
      title: t('gameComplete.completed'),
      message: t('gameComplete.completedMessage'),
      emoji: '✨',
    };
  };

  const rating = getPerformanceRating();

  return (
    <div className="rounded-lg border bg-card p-8">
      <div className="text-center space-y-6">
        <div className="text-6xl">{rating.emoji}</div>

        <div>
          <h2 className="text-3xl font-bold">{rating.title}</h2>
          <p className="mt-2 text-muted-foreground">{rating.message}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-6">
          <div className="rounded-lg border bg-muted/50 p-4">
            <div className="text-sm text-muted-foreground">{t('gameComplete.time')}</div>
            <div className="mt-1 text-3xl font-bold">{formatTime(elapsedTime)}</div>
          </div>

          <div className="rounded-lg border bg-muted/50 p-4">
            <div className="text-sm text-muted-foreground">{t('gameComplete.attempts')}</div>
            <div className="mt-1 text-3xl font-bold">{attempts}</div>
          </div>
        </div>

        <div className="flex gap-4 justify-center pt-4">
          <Button onClick={onRestart} size="lg">
            {t('playAgain')}
          </Button>
          <Button onClick={onBackToStudy} variant="outline" size="lg">
            {tc('backToStudy')}
          </Button>
        </div>
      </div>
    </div>
  );
}
