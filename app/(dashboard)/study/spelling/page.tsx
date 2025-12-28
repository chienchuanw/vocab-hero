'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Layout } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { SpellingInput } from '@/components/features/spelling/SpellingInput';
import { useSpellingSession, type SpellingQuestion } from '@/hooks/useSpellingSession';

/**
 * Spelling Quiz Page
 * 拼寫測驗頁面 - 支援 IME 輸入和平假名/片假名互換驗證
 */
export default function SpellingQuizPage() {
  const router = useRouter();

  // TODO: 從 API 獲取題目資料
  // 暫時使用模擬資料
  const [questions] = useState<SpellingQuestion[]>([
    {
      id: '1',
      vocabularyId: 'v1',
      word: '勉強',
      meaning: 'study',
      correctReading: 'べんきょう',
    },
    {
      id: '2',
      vocabularyId: 'v2',
      word: '学校',
      meaning: 'school',
      correctReading: 'がっこう',
    },
    {
      id: '3',
      vocabularyId: 'v3',
      word: '先生',
      meaning: 'teacher',
      correctReading: 'せんせい',
    },
  ]);

  const spelling = useSpellingSession(questions);

  /**
   * 處理答題
   */
  const handleAnswer = (answer: string) => {
    spelling.answerQuestion(answer);

    // 延遲後自動前往下一題
    setTimeout(() => {
      if (!spelling.isComplete) {
        spelling.nextQuestion();
      }
    }, 3000);
  };

  // 顯示完成畫面
  if (spelling.isComplete) {
    return (
      <Layout streak={0}>
        <div className="max-w-2xl mx-auto">
          <div className="rounded-lg border bg-card p-8 text-center">
            <h2 className="text-2xl font-bold">Spelling Quiz Complete!</h2>
            <div className="mt-6 space-y-2">
              <p className="text-lg">
                Score: {spelling.stats.correctAnswers} / {spelling.stats.totalQuestions}
              </p>
              <p className="text-muted-foreground">
                Accuracy: {spelling.stats.accuracy.toFixed(1)}%
              </p>
            </div>

            <div className="mt-8 flex gap-4 justify-center">
              <Button onClick={spelling.restart}>Try Again</Button>
              <Button variant="outline" onClick={() => router.push('/study')}>
                Back to Study
              </Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout streak={0}>
      <div className="max-w-3xl mx-auto">
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

        {/* 進度指示 */}
        <div className="mb-6 text-center text-sm text-muted-foreground">
          Question {spelling.currentQuestionNumber} of {spelling.totalQuestions}
        </div>

        {/* 拼寫輸入 */}
        {spelling.currentQuestion && (
          <SpellingInput
            word={spelling.currentQuestion.word}
            meaning={spelling.currentQuestion.meaning}
            correctReading={spelling.currentQuestion.correctReading}
            onSubmit={handleAnswer}
            userAnswer={spelling.currentAnswer?.userAnswer}
            isCorrect={spelling.currentAnswer?.isCorrect}
          />
        )}
      </div>
    </Layout>
  );
}
