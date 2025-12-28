'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { CharacterFeedback } from './CharacterFeedback';

/**
 * SpellingInput Props
 */
export interface SpellingInputProps {
  word: string;
  meaning: string;
  correctReading?: string;
  onSubmit: (answer: string) => void;
  userAnswer?: string;
  isCorrect?: boolean;
  showHint?: boolean;
}

/**
 * SpellingInput Component
 * 支援 IME 輸入的日文拼寫輸入元件
 */
export function SpellingInput({
  word,
  meaning,
  correctReading,
  onSubmit,
  userAnswer,
  isCorrect,
  showHint: initialShowHint = false,
}: SpellingInputProps) {
  const [input, setInput] = useState('');
  const [showHint, setShowHint] = useState(initialShowHint);
  const inputRef = useRef<HTMLInputElement>(null);

  // 自動聚焦輸入框
  useEffect(() => {
    if (!userAnswer && inputRef.current) {
      inputRef.current.focus();
    }
  }, [userAnswer]);

  /**
   * 處理表單提交
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (input.trim()) {
      onSubmit(input.trim());
      setInput('');
      setShowHint(false);
    }
  };

  /**
   * 顯示提示（第一個字元）
   */
  const handleShowHint = () => {
    setShowHint(true);
  };

  /**
   * 取得提示文字（第一個字元）
   */
  const getHintText = () => {
    if (correctReading && showHint) {
      return correctReading.charAt(0);
    }
    return null;
  };

  const hintText = getHintText();

  return (
    <div className="space-y-6">
      {/* 題目卡片 */}
      <div className="rounded-lg border bg-card p-8 text-center">
        <div className="space-y-2">
          <div className="text-4xl font-bold">{word}</div>
          <div className="text-xl text-muted-foreground">{meaning}</div>
          <div className="pt-4 text-sm text-muted-foreground">
            Type the reading in hiragana or katakana
          </div>
        </div>
      </div>

      {/* 輸入表單 */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter the reading..."
            disabled={!!userAnswer}
            className="text-center text-2xl h-16"
            lang="ja"
          />

          {/* 提示文字 */}
          {hintText && (
            <div className="text-center text-sm text-muted-foreground">
              Hint: Starts with <span className="font-bold text-primary">{hintText}</span>
            </div>
          )}
        </div>

        <div className="flex gap-3 justify-center">
          {!userAnswer && correctReading && !showHint && (
            <Button type="button" variant="outline" onClick={handleShowHint}>
              Show Hint
            </Button>
          )}

          <Button type="submit" disabled={!input.trim() || !!userAnswer}>
            Check Answer
          </Button>
        </div>
      </form>

      {/* 答案反饋 */}
      {userAnswer !== undefined && isCorrect !== undefined && (
        <div className="space-y-4">
          <div
            className={cn(
              'rounded-lg p-6 text-center font-medium',
              isCorrect
                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
            )}
          >
            <div className="flex items-center justify-center gap-3">
              <div
                className={cn(
                  'flex h-12 w-12 items-center justify-center rounded-full text-2xl',
                  isCorrect
                    ? 'bg-green-500 text-white dark:bg-green-600'
                    : 'bg-red-500 text-white dark:bg-red-600'
                )}
              >
                {isCorrect ? '✓' : '✗'}
              </div>

              <div className="text-lg">
                {isCorrect ? (
                  'Correct!'
                ) : (
                  <div className="space-y-1">
                    <div>Incorrect</div>
                    {correctReading && (
                      <div className="text-sm">
                        Correct answer: <span className="font-bold">{correctReading}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 字元級別反饋 */}
          {!isCorrect && correctReading && (
            <CharacterFeedback
              userAnswer={userAnswer}
              correctAnswer={correctReading}
              showFeedback={true}
            />
          )}
        </div>
      )}
    </div>
  );
}
