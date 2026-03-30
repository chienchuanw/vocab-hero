'use client';

import { cn } from '@/lib/utils';

export interface MatchingCardProps {
  content: string;
  onClick: () => void;
  type?: 'word' | 'meaning';
  isSelected?: boolean;
  isMatched?: boolean;
  isError?: boolean;
  disabled?: boolean;
}

export function MatchingCard({
  content,
  onClick,
  type = 'word',
  isSelected = false,
  isMatched = false,
  isError = false,
  disabled = false,
}: MatchingCardProps) {
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
        'relative flex min-h-[120px] w-full items-center justify-center rounded-lg border-2 p-6 text-center font-medium transition-all duration-200',
        'hover:scale-105 hover:shadow-lg',
        'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
        !isSelected && !isMatched && !isError && 'border-border bg-card hover:border-primary',
        isSelected && !isMatched && !isError && 'border-primary bg-primary/10 ring-2 ring-primary',
        isMatched &&
          'border-green-500 bg-green-100 text-green-800 opacity-50 dark:bg-green-900/30 dark:text-green-400',
        isError &&
          'border-red-500 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
        (disabled || isMatched) && 'cursor-not-allowed',
        type === 'word' ? 'text-2xl' : 'text-lg'
      )}
    >
      <span className="break-words">{content}</span>
    </button>
  );
}
