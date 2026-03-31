'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';

/**
 * Question Result
 */
export interface QuestionResult {
  questionId: string;
  type: 'multiple-choice' | 'spelling';
  isCorrect: boolean;
  userAnswer: string;
  correctAnswer: string;
}

/**
 * RandomQuizSummary Props
 */
export interface RandomQuizSummaryProps {
  results: QuestionResult[];
  totalQuestions: number;
  onRestart: () => void;
  onBackToStudy: () => void;
}

/**
 * RandomQuizSummary Component
 * 隨機測驗結果統計頁面
 */
export function RandomQuizSummary({
  results,
  totalQuestions,
  onRestart,
  onBackToStudy,
}: RandomQuizSummaryProps) {
  const t = useTranslations('study');
  const tCommon = useTranslations('common');

  // 計算統計數據
  const correctCount = results.filter((r) => r.isCorrect).length;
  const incorrectCount = results.filter((r) => !r.isCorrect).length;
  const accuracy = totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;

  // 按題型分類統計
  const multipleChoiceResults = results.filter((r) => r.type === 'multiple-choice');
  const spellingResults = results.filter((r) => r.type === 'spelling');

  const multipleChoiceCorrect = multipleChoiceResults.filter((r) => r.isCorrect).length;
  const spellingCorrect = spellingResults.filter((r) => r.isCorrect).length;

  const multipleChoiceAccuracy =
    multipleChoiceResults.length > 0
      ? (multipleChoiceCorrect / multipleChoiceResults.length) * 100
      : 0;

  const spellingAccuracy =
    spellingResults.length > 0 ? (spellingCorrect / spellingResults.length) * 100 : 0;

  /**
   * 根據準確率給予評價
   */
  const getPerformanceRating = () => {
    if (accuracy >= 90) {
      return { title: t('randomQuizSummary.excellent'), emoji: '🏆', color: 'text-success' };
    }
    if (accuracy >= 75) {
      return { title: t('randomQuizSummary.greatJob'), emoji: '⭐', color: 'text-info' };
    }
    if (accuracy >= 60) {
      return { title: t('randomQuizSummary.goodEffort'), emoji: '👍', color: 'text-warning' };
    }
    return { title: t('randomQuizSummary.keepPracticing'), emoji: '💪', color: 'text-warning' };
  };

  const rating = getPerformanceRating();

  return (
    <div className="rounded-lg border bg-card p-8">
      <div className="space-y-6">
        {/* 標題和評價 */}
        <div className="text-center">
          <div className="text-6xl mb-4">{rating.emoji}</div>
          <h2 className={`text-3xl font-bold ${rating.color}`}>{rating.title}</h2>
          <p className="mt-2 text-muted-foreground">{t('randomQuizSummary.completed')}</p>
        </div>

        {/* 總體統計 */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-lg border bg-muted/50 p-4 text-center">
            <div className="text-sm text-muted-foreground">{t('randomQuizSummary.accuracy')}</div>
            <div className="mt-1 text-3xl font-bold">{accuracy.toFixed(1)}%</div>
          </div>

          <div className="rounded-lg border bg-success/10 p-4 text-center">
            <div className="text-sm text-muted-foreground">{t('randomQuizSummary.correct')}</div>
            <div className="mt-1 text-3xl font-bold text-success">
              {correctCount}
            </div>
          </div>

          <div className="rounded-lg border bg-destructive/10 p-4 text-center">
            <div className="text-sm text-muted-foreground">{t('randomQuizSummary.incorrect')}</div>
            <div className="mt-1 text-3xl font-bold text-destructive">
              {incorrectCount}
            </div>
          </div>
        </div>

        {/* 按題型統計 */}
        <div className="space-y-3">
          <h3 className="font-medium">{t('randomQuizSummary.performanceByType')}</h3>

          <div className="space-y-2">
            {/* Multiple Choice */}
            {multipleChoiceResults.length > 0 && (
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <div className="font-medium">{t('randomQuizSummary.multipleChoice')}</div>
                  <div className="text-sm text-muted-foreground">
                    {t('randomQuizSummary.correctCount', {
                      correct: multipleChoiceCorrect,
                      total: multipleChoiceResults.length,
                    })}
                  </div>
                </div>
                <div className="text-lg font-bold">{multipleChoiceAccuracy.toFixed(1)}%</div>
              </div>
            )}

            {/* Spelling */}
            {spellingResults.length > 0 && (
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <div className="font-medium">{t('randomQuizSummary.spelling')}</div>
                  <div className="text-sm text-muted-foreground">
                    {t('randomQuizSummary.correctCount', {
                      correct: spellingCorrect,
                      total: spellingResults.length,
                    })}
                  </div>
                </div>
                <div className="text-lg font-bold">{spellingAccuracy.toFixed(1)}%</div>
              </div>
            )}
          </div>
        </div>

        {/* 按鈕 */}
        <div className="flex gap-4 pt-4">
          <Button onClick={onRestart} size="lg" className="flex-1">
            {tCommon('tryAgain')}
          </Button>
          <Button onClick={onBackToStudy} variant="outline" size="lg" className="flex-1">
            {tCommon('backToStudy')}
          </Button>
        </div>
      </div>
    </div>
  );
}
