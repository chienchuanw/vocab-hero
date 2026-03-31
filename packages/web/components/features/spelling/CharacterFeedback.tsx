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
  const feedbackItems = Array.from({ length: maxLength }, (_, itemIndex) => ({
    key: `${userAnswer}-${correctAnswer}-${itemIndex}`,
    userChar: normalizedUser[itemIndex] || '',
    correctChar: normalizedCorrect[itemIndex] || '',
  }));

  return (
    <div className="space-y-3">
      <div className="text-sm font-medium text-muted-foreground">Character-by-character feedback:</div>

      <div className="flex flex-wrap gap-2 justify-center">
        {feedbackItems.map((item) => {
          const { key, userChar, correctChar } = item;
          const isCorrect = userChar === correctChar;
          const isMissing = !userChar && correctChar;
          const isExtra = userChar && !correctChar;

          return (
            <div
              key={key}
              className={cn(
                'flex flex-col items-center gap-1 rounded-lg border-2 p-3 min-w-[60px]',
                isCorrect && 'border-success bg-success/10',
                !isCorrect && userChar && 'border-destructive bg-destructive/10',
                isMissing && 'border-warning bg-warning/10'
              )}
            >
              {/* 使用者輸入的字元 */}
              <div
                className={cn(
                  'text-2xl font-bold',
                  isCorrect && 'text-success',
                  !isCorrect && userChar && 'text-destructive',
                  isMissing && 'text-warning'
                )}
              >
                {userChar || '?'}
              </div>

              {/* 正確/錯誤指示 */}
              <div className="text-xs">
                {isCorrect && <span className="text-success">✓</span>}
                {!isCorrect && userChar && (
                  <span className="text-destructive">✗</span>
                )}
                {isMissing && (
                  <span className="text-warning">Missing</span>
                )}
                {isExtra && <span className="text-destructive">Extra</span>}
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
