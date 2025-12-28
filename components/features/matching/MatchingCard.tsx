'use client';

import { cn } from '@/lib/utils';

/**
 * MatchingCard Props
 */
export interface MatchingCardProps {
  content: string;
  onClick: () => void;
  type?: 'word' | 'meaning';
  isSelected?: boolean;
  isMatched?: boolean;
  isError?: boolean;
  disabled?: boolean;
}

/**
 * MatchingCard Component
 * 配對遊戲卡片元件，支援選取、配對成功、錯誤等狀態
 */
export function MatchingCard({
  content,
  onClick,
  type = 'word',
  isSelected = false,
  isMatched = false,
  isError = false,
  disabled = false,
}: MatchingCardProps) {
  /**
   * 處理點擊事件
   */
  const handleClick = () => {
    if (!disabled && !isMatched) {
      onClick();
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled || isMatched}
      className={cn(
        // 基本樣式
        'relative flex min-h-[120px] w-full items-center justify-center rounded-lg border-2 p-6 text-center font-medium transition-all duration-200',
        // 懸停效果
        'hover:scale-105 hover:shadow-lg',
        // 焦點樣式
        'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
        // 預設狀態
        !isSelected && !isMatched && !isError && 'border-border bg-card hover:border-primary',
        // 選取狀態
        isSelected && !isMatched && !isError && 'border-primary bg-primary/10 ring-2 ring-primary',
        // 配對成功狀態
        isMatched &&
          'border-green-500 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
        // 錯誤狀態
        isError &&
          'border-red-500 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
        // 禁用狀態
        (disabled || isMatched) && 'cursor-not-allowed opacity-60',
        // 文字大小根據類型調整
        type === 'word' ? 'text-2xl' : 'text-lg'
      )}
    >
      {/* 卡片內容 */}
      <span className="break-words">{content}</span>

      {/* 配對成功圖示 */}
      {isMatched && (
        <div className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-green-500 text-white">
          ✓
        </div>
      )}

      {/* 錯誤圖示 */}
      {isError && (
        <div className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white">
          ✗
        </div>
      )}
    </button>
  );
}

