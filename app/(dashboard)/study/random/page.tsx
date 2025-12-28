'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

/**
 * Random Quiz Page
 * 隨機測驗頁面 - 混合不同題型與跨所有 Group 的隨機單字
 */
export default function RandomQuizPage() {
  const router = useRouter();

  return (
    <div className="container mx-auto max-w-4xl py-8">
      <div className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Random Quiz</h1>
          <Button variant="ghost" onClick={() => router.push('/study')}>
            ← Back to Study
          </Button>
        </div>
        <p className="text-muted-foreground">
          Test your knowledge with a mix of question types from all your vocabulary
        </p>
      </div>

      {/* Random quiz content will be added in subsequent tasks */}
      <div className="rounded-lg border bg-card p-8 text-center">
        <p className="text-muted-foreground">Random quiz interface coming soon...</p>
      </div>
    </div>
  );
}

