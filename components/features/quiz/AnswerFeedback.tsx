'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

/**
 * AnswerFeedback Props
 */
export interface AnswerFeedbackProps {
  isCorrect: boolean;
  message: string;
  onAnimationComplete?: () => void;
}

/**
 * AnswerFeedback Component
 * 顯示答題後的動畫反饋
 */
export function AnswerFeedback({ isCorrect, message, onAnimationComplete }: AnswerFeedbackProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // 延遲顯示動畫
    const showTimer = setTimeout(() => {
      setIsVisible(true);
    }, 50);

    // 動畫完成後的回調
    if (onAnimationComplete) {
      const completeTimer = setTimeout(() => {
        onAnimationComplete();
      }, 2000);

      return () => {
        clearTimeout(showTimer);
        clearTimeout(completeTimer);
      };
    }

    return () => {
      clearTimeout(showTimer);
    };
  }, [onAnimationComplete]);

  return (
    <div
      className={cn(
        'transform transition-all duration-500 ease-out',
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0',
        'rounded-lg p-6 text-center font-medium shadow-lg',
        isCorrect
          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
          : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
      )}
    >
      <div className="flex items-center justify-center gap-3">
        {/* 圖示 */}
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

        {/* 訊息 */}
        <div className="text-lg">{message}</div>
      </div>
    </div>
  );
}

