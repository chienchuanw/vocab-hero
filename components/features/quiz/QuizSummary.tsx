'use client';

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
  const incorrectAnswers = totalQuestions - correctAnswers;

  return (
    <div className="space-y-8">
      {/* 成績摘要 */}
      <div className="rounded-lg border bg-card p-8 text-center">
        <h2 className="text-3xl font-bold">Quiz Complete!</h2>

        <div className="mt-8 grid grid-cols-3 gap-6">
          <div>
            <div className="text-4xl font-bold text-primary">{correctAnswers}</div>
            <div className="mt-2 text-sm text-muted-foreground">Correct</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-destructive">{incorrectAnswers}</div>
            <div className="mt-2 text-sm text-muted-foreground">Incorrect</div>
          </div>
          <div>
            <div className="text-4xl font-bold">{accuracy.toFixed(1)}%</div>
            <div className="mt-2 text-sm text-muted-foreground">Accuracy</div>
          </div>
        </div>

        <div className="mt-8 flex gap-4 justify-center">
          <Button onClick={onRestart}>Try Again</Button>
          <Button variant="outline" onClick={onExit}>
            Back to Study
          </Button>
        </div>
      </div>

      {/* 答題詳情 */}
      <div>
        <h3 className="text-xl font-bold mb-4">Review Answers</h3>
        <div className="space-y-3">
          {answers.map((answer, index) => (
            <div
              key={answer.questionId}
              className={cn(
                'rounded-lg border p-4',
                answer.isCorrect
                  ? 'border-green-500/50 bg-green-50 dark:bg-green-950/20'
                  : 'border-red-500/50 bg-red-50 dark:bg-red-950/20'
              )}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-muted-foreground">
                      #{index + 1}
                    </span>
                    <div>
                      <div className="font-bold">{answer.word}</div>
                      <div className="text-sm text-muted-foreground">{answer.reading}</div>
                    </div>
                  </div>

                  <div className="mt-3 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Your answer:</span>
                      <span
                        className={cn(
                          'font-medium',
                          answer.isCorrect ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'
                        )}
                      >
                        {answer.selectedAnswer}
                      </span>
                    </div>

                    {!answer.isCorrect && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Correct answer:</span>
                        <span className="font-medium text-green-700 dark:text-green-400">
                          {answer.correctAnswer}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-full text-lg',
                    answer.isCorrect
                      ? 'bg-green-500 text-white'
                      : 'bg-red-500 text-white'
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

