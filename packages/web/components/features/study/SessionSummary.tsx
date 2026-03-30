'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import type { SessionStats } from '@/hooks/useStudySession';

/**
 * SessionSummary component props
 */
export interface SessionSummaryProps {
  stats: SessionStats;
  onContinue?: () => void;
  onEnd?: () => void;
}

/**
 * SessionSummary component
 * 顯示學習 session 的統計摘要
 */
export function SessionSummary({ stats, onContinue, onEnd }: SessionSummaryProps) {
  const t = useTranslations('study');
  const tCommon = useTranslations('common');
  const correctRate = Math.round(stats.correctRate * 100);

  return (
    <div className="max-w-md mx-auto p-8 bg-card border-2 border-border rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-center mb-6">{t('sessionSummary')}</h2>

      <div className="space-y-4 mb-8">
        {/* Total cards */}
        <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
          <span className="text-muted-foreground">{t('totalCards')}</span>
          <span className="text-2xl font-bold">{stats.totalCards}</span>
        </div>

        {/* Correct rate */}
        <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
          <span className="text-muted-foreground">{t('correctRate')}</span>
          <span className="text-2xl font-bold text-primary">{correctRate}%</span>
        </div>

        {/* Correct count */}
        <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
          <span className="text-muted-foreground">{t('correctAnswers')}</span>
          <span className="text-2xl font-bold text-green-600">
            {stats.correctCount} / {stats.totalCards}
          </span>
        </div>

        {/* Time spent */}
        <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
          <span className="text-muted-foreground">{t('timeSpent')}</span>
          <span className="text-2xl font-bold">
            {stats.timeSpent} {t('minutesShort')}
          </span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-4">
        {onContinue && (
          <Button onClick={onContinue} className="flex-1" variant="outline">
            {tCommon('continueStudying')}
          </Button>
        )}
        {onEnd && (
          <Button onClick={onEnd} className="flex-1">
            {tCommon('endSession')}
          </Button>
        )}
      </div>
    </div>
  );
}
