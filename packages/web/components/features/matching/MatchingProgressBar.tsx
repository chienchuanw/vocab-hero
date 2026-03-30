'use client';

export interface MatchingProgressBarProps {
  current: number;
  total: number;
}

export function MatchingProgressBar({ current, total }: MatchingProgressBarProps) {
  const percentage = total > 0 ? Math.min(100, Math.max(0, (current / total) * 100)) : 0;

  return (
    <div className="relative h-4 w-full rounded-full bg-secondary">
      <div
        className="absolute left-0 top-0 h-full rounded-full bg-primary transition-all duration-500 ease-out"
        style={{ width: `${percentage}%` }}
      >
        <div className="absolute -right-3 top-1/2 flex h-6 min-w-[24px] -translate-y-1/2 items-center justify-center rounded-full bg-primary px-1 text-xs font-bold text-primary-foreground shadow-sm ring-2 ring-background">
          {current}
        </div>
      </div>
    </div>
  );
}
