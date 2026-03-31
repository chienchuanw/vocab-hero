'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/**
 * Quiz Answer Record
 */
export interface QuizAnswerRecord {
  questionId: string;
  word: string;
  reading: string;
  correctAnswer: string;
  selectedAnswer: string;
  isCorrect: boolean;
}

/**
 * QuizSummary Props
 */
export interface QuizSummaryProps {
  answers: QuizAnswerRecord[];
  totalQuestions: number;
  correctAnswers: number;
  accuracy: number;
  onRestart: () => void;
  onExit: () => void;
}

/**
 * QuizSummary Component
 * 顯示測驗結果摘要和詳細答題記錄
 */
export function QuizSummary({
  answers,
  totalQuestions,
  correctAnswers,
  accuracy,
  onRestart,
  onExit,
}: QuizSummaryProps) {
  const t = useTranslations('quiz');
  const tCommon = useTranslations('common');
  const incorrectAnswers = totalQuestions - correctAnswers;

  return (
    <div className="space-y-8">
      {/* 成績摘要 */}
      <div className="rounded-lg border bg-card p-8 text-center">
        <h2 className="text-3xl font-bold">{t('complete')}</h2>

        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div>
            <div className="text-4xl font-bold text-primary">{correctAnswers}</div>
            <div className="mt-2 text-sm text-muted-foreground">{t('correct')}</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-destructive">{incorrectAnswers}</div>
            <div className="mt-2 text-sm text-muted-foreground">{t('incorrect')}</div>
          </div>
          <div>
            <div className="text-4xl font-bold">{accuracy.toFixed(1)}%</div>
            <div className="mt-2 text-sm text-muted-foreground">{t('accuracy')}</div>
          </div>
        </div>

        <div className="mt-8 flex gap-4 justify-center">
          <Button onClick={onRestart}>{tCommon('tryAgain')}</Button>
          <Button variant="outline" onClick={onExit}>
            {tCommon('backToStudy')}
          </Button>
        </div>
      </div>

      {/* 答題詳情 */}
      <div>
        <h3 className="text-xl font-bold mb-4">{t('reviewAnswers')}</h3>
        <div className="space-y-3">
          {answers.map((answer, index) => (
            <div
              key={answer.questionId}
                className={cn(
                  'rounded-lg border p-4',
                  answer.isCorrect
                    ? 'border-success/50 bg-success/10'
                    : 'border-destructive/50 bg-destructive/10'
                )}
              >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-muted-foreground">#{index + 1}</span>
                    <div>
                      <div className="font-bold">{answer.word}</div>
                      <div className="text-sm text-muted-foreground">{answer.reading}</div>
                    </div>
                  </div>

                  <div className="mt-3 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">{t('yourAnswer')}</span>
                      <span
                        className={cn(
                          'font-medium',
                          answer.isCorrect
                            ? 'text-success'
                            : 'text-destructive'
                        )}
                      >
                        {answer.selectedAnswer}
                      </span>
                    </div>

                    {!answer.isCorrect && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">{t('correctAnswer')}</span>
                        <span className="font-medium text-success">
                          {answer.correctAnswer}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-full text-lg',
                    answer.isCorrect
                      ? 'bg-success text-primary-foreground'
                      : 'bg-destructive text-destructive-foreground'
                  )}
                >
                  {answer.isCorrect ? '✓' : '✗'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
