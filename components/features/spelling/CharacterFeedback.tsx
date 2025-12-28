'use client';

import { cn } from '@/lib/utils';
import { normalizeKana } from '@/lib/spelling/kana-utils';

/**
 * CharacterFeedback Props
 */
export interface CharacterFeedbackProps {
  userAnswer: string;
  correctAnswer: string;
  showFeedback: boolean;
}

/**
 * CharacterFeedback Component
 * 顯示逐字元的正確/錯誤視覺回饋
 */
export function CharacterFeedback({
  userAnswer,
  correctAnswer,
  showFeedback,
}: CharacterFeedbackProps) {
  if (!showFeedback || !userAnswer) {
    return null;
  }

  // 標準化為平假名進行比較
  const normalizedUser = normalizeKana(userAnswer, 'hiragana');
  const normalizedCorrect = normalizeKana(correctAnswer, 'hiragana');

  // 取得較長的長度以顯示所有字元
  const maxLength = Math.max(normalizedUser.length, normalizedCorrect.length);

  return (
    <div className="space-y-3">
      <div className="text-sm font-medium text-muted-foreground">Character-by-character feedback:</div>

      <div className="flex flex-wrap gap-2 justify-center">
        {Array.from({ length: maxLength }).map((_, index) => {
          const userChar = normalizedUser[index] || '';
          const correctChar = normalizedCorrect[index] || '';
          const isCorrect = userChar === correctChar;
          const isMissing = !userChar && correctChar;
          const isExtra = userChar && !correctChar;

          return (
            <div
              key={index}
              className={cn(
                'flex flex-col items-center gap-1 rounded-lg border-2 p-3 min-w-[60px]',
                isCorrect && 'border-green-500 bg-green-50 dark:bg-green-950/20',
                !isCorrect && userChar && 'border-red-500 bg-red-50 dark:bg-red-950/20',
                isMissing && 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20'
              )}
            >
              {/* 使用者輸入的字元 */}
              <div
                className={cn(
                  'text-2xl font-bold',
                  isCorrect && 'text-green-700 dark:text-green-400',
                  !isCorrect && userChar && 'text-red-700 dark:text-red-400',
                  isMissing && 'text-yellow-700 dark:text-yellow-400'
                )}
              >
                {userChar || '?'}
              </div>

              {/* 正確/錯誤指示 */}
              <div className="text-xs">
                {isCorrect && <span className="text-green-600 dark:text-green-400">✓</span>}
                {!isCorrect && userChar && (
                  <span className="text-red-600 dark:text-red-400">✗</span>
                )}
                {isMissing && (
                  <span className="text-yellow-600 dark:text-yellow-400">Missing</span>
                )}
                {isExtra && <span className="text-red-600 dark:text-red-400">Extra</span>}
              </div>

              {/* 顯示正確答案（如果錯誤） */}
              {!isCorrect && correctChar && (
                <div className="text-xs text-muted-foreground">
                  Should be: <span className="font-bold">{correctChar}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 摘要統計 */}
      <div className="text-center text-sm text-muted-foreground">
        {normalizedUser.length} characters entered, {normalizedCorrect.length} expected
      </div>
    </div>
  );
}

