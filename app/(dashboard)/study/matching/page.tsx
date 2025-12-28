'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

/**
 * Matching Game Page
 * 配對遊戲頁面 - 5 組配對、不限時但記錄完成時間
 */
export default function MatchingGamePage() {
  const router = useRouter();

  return (
    <div className="container mx-auto max-w-4xl py-8">
      <div className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Matching Game</h1>
          <Button variant="ghost" onClick={() => router.push('/study')}>
            ← Back to Study
          </Button>
        </div>
        <p className="text-muted-foreground">
          Match Japanese words with their meanings. Find all 5 pairs as quickly as you can!
        </p>
      </div>

      {/* Matching game content will be added in subsequent tasks */}
      <div className="rounded-lg border bg-card p-8 text-center">
        <p className="text-muted-foreground">Matching game interface coming soon...</p>
      </div>
    </div>
  );
}

