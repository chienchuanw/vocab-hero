'use client';

import { Button } from '@/components/ui/button';

/**
 * GameComplete Props
 */
export interface GameCompleteProps {
  elapsedTime: number;
  attempts: number;
  onRestart: () => void;
  onBackToStudy: () => void;
}

/**
 * GameComplete Component
 * 遊戲完成畫面，顯示時間和嘗試次數
 */
export function GameComplete({
  elapsedTime,
  attempts,
  onRestart,
  onBackToStudy,
}: GameCompleteProps) {
  /**
   * 格式化時間（秒 -> 分:秒）
   */
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  /**
   * 根據表現給予評價
   */
  const getPerformanceRating = (): {
    title: string;
    message: string;
    emoji: string;
  } => {
    // 完美表現：5 次嘗試（每對只嘗試一次）
    if (attempts === 5) {
      return {
        title: 'Perfect!',
        message: 'You matched all pairs on the first try!',
        emoji: '🏆',
      };
    }

    // 優秀表現：6-7 次嘗試
    if (attempts <= 7) {
      return {
        title: 'Excellent!',
        message: 'Great memory and focus!',
        emoji: '⭐',
      };
    }

    // 良好表現：8-10 次嘗試
    if (attempts <= 10) {
      return {
        title: 'Well Done!',
        message: 'Good job completing the game!',
        emoji: '👍',
      };
    }

    // 一般表現：超過 10 次嘗試
    return {
      title: 'Completed!',
      message: 'Keep practicing to improve your score!',
      emoji: '✨',
    };
  };

  const rating = getPerformanceRating();

  return (
    <div className="rounded-lg border bg-card p-8">
      <div className="text-center space-y-6">
        {/* 表情符號 */}
        <div className="text-6xl">{rating.emoji}</div>

        {/* 標題 */}
        <div>
          <h2 className="text-3xl font-bold">{rating.title}</h2>
          <p className="mt-2 text-muted-foreground">{rating.message}</p>
        </div>

        {/* 統計資料 */}
        <div className="grid grid-cols-2 gap-6 py-6">
          <div className="rounded-lg border bg-muted/50 p-4">
            <div className="text-sm text-muted-foreground">Time</div>
            <div className="mt-1 text-3xl font-bold">{formatTime(elapsedTime)}</div>
          </div>

          <div className="rounded-lg border bg-muted/50 p-4">
            <div className="text-sm text-muted-foreground">Attempts</div>
            <div className="mt-1 text-3xl font-bold">{attempts}</div>
          </div>
        </div>

        {/* 按鈕 */}
        <div className="flex gap-4 justify-center pt-4">
          <Button onClick={onRestart} size="lg">
            Play Again
          </Button>
          <Button onClick={onBackToStudy} variant="outline" size="lg">
            Back to Study
          </Button>
        </div>
      </div>
    </div>
  );
}

