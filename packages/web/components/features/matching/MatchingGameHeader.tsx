'use client';

import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MatchingProgressBar } from './MatchingProgressBar';

export interface MatchingGameHeaderProps {
  matchedCount: number;
  totalPairs: number;
  elapsedTime: number;
  onClose: () => void;
}

export function MatchingGameHeader({
  matchedCount,
  totalPairs,
  elapsedTime,
  onClose,
}: MatchingGameHeaderProps) {
  const router = useRouter();

  const handleClose = () => {
    onClose();
    router.push('/study');
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <header className="flex w-full items-center justify-between gap-4 p-4">
      <Button
        variant="ghost"
        size="icon"
        onClick={handleClose}
        className="shrink-0 text-muted-foreground hover:text-foreground"
        aria-label="Close game"
      >
        <X className="h-6 w-6" />
      </Button>

      <div className="flex-1 max-w-md">
        <MatchingProgressBar current={matchedCount} total={totalPairs} />
      </div>

      <div className="shrink-0 font-mono text-lg font-medium text-muted-foreground">
        {formatTime(elapsedTime)}
      </div>
    </header>
  );
}
