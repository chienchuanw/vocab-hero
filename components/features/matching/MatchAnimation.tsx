'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

/**
 * MatchAnimation Props
 */
export interface MatchAnimationProps {
  show: boolean;
  onComplete?: () => void;
}

/**
 * MatchAnimation Component
 * 配對成功的動畫效果
 */
export function MatchAnimation({ show, onComplete }: MatchAnimationProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);

      // 動畫持續 1 秒後消失
      const timer = setTimeout(() => {
        setIsVisible(false);
        onComplete?.();
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      {/* 背景閃光效果 */}
      <div
        className={cn(
          'absolute inset-0 bg-green-500/20',
          'animate-in fade-in duration-200',
          'animate-out fade-out duration-500'
        )}
      />

      {/* 成功圖示 */}
      <div
        className={cn(
          'relative flex h-32 w-32 items-center justify-center rounded-full bg-green-500 text-white shadow-2xl',
          'animate-in zoom-in-50 duration-300',
          'animate-out zoom-out-50 fade-out duration-500'
        )}
      >
        <svg
          className="h-20 w-20"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={3}
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>

      {/* 文字提示 */}
      <div
        className={cn(
          'absolute mt-48 text-2xl font-bold text-green-600',
          'animate-in slide-in-from-bottom-4 duration-300',
          'animate-out slide-out-to-bottom-4 fade-out duration-500'
        )}
      >
        Perfect Match!
      </div>
    </div>
  );
}

