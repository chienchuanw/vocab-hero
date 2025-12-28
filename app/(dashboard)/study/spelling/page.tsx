'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

/**
 * Spelling Quiz Page
 * 拼寫測驗頁面 - 支援 IME 輸入和平假名/片假名互換驗證
 */
export default function SpellingQuizPage() {
  const router = useRouter();

  return (
    <div className="container mx-auto max-w-3xl py-8">
      <div className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Spelling Quiz</h1>
          <Button variant="ghost" onClick={() => router.push('/study')}>
            ← Back to Study
          </Button>
        </div>
        <p className="text-muted-foreground">
          Test your spelling by typing the Japanese reading of vocabulary words
        </p>
      </div>

      {/* Spelling quiz content will be added in subsequent tasks */}
      <div className="rounded-lg border bg-card p-8 text-center">
        <p className="text-muted-foreground">Spelling quiz interface coming soon...</p>
      </div>
    </div>
  );
}

