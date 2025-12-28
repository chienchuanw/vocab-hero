'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { QuizConfigForm, type QuizConfig } from '@/components/features/quiz/QuizConfigForm';
import { MultipleChoiceQuestion } from '@/components/features/quiz/MultipleChoiceQuestion';
import { useQuizSession } from '@/hooks/useQuizSession';
import { Button } from '@/components/ui/button';
import { generateQuizQuestions } from '@/lib/quiz/quiz-utils';

/**
 * Quiz Study Page
 * 測驗模式學習頁面
 */
export default function QuizStudyPage() {
  const router = useRouter();
  const [config, setConfig] = useState<QuizConfig | null>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const quiz = useQuizSession(questions);

  /**
   * 處理測驗配置提交
   */
  const handleConfigSubmit = async (quizConfig: QuizConfig) => {
    setIsLoading(true);
    setConfig(quizConfig);

    try {
      // 從 API 獲取單字資料
      const response = await fetch(`/api/vocabulary-groups/${quizConfig.groupId}/vocabulary`);

      if (!response.ok) {
        throw new Error('Failed to fetch vocabulary');
      }

      const vocabularyItems = await response.json();

      // 生成測驗題目
      const generatedQuestions = generateQuizQuestions(
        vocabularyItems,
        quizConfig.questionCount,
        quizConfig.quizType
      );

      setQuestions(generatedQuestions);
    } catch (error) {
      console.error('Failed to start quiz:', error);
      alert('Failed to start quiz. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 處理答題
   */
  const handleAnswer = (answer: string, isCorrect: boolean) => {
    quiz.answerQuestion(answer, isCorrect);

    // 延遲後自動前往下一題
    setTimeout(() => {
      if (!quiz.isComplete) {
        quiz.nextQuestion();
      }
    }, 2000);
  };

  /**
   * 處理測驗完成
   */
  const handleComplete = () => {
    router.push('/study/quiz/summary');
  };

  // 顯示配置表單
  if (!config || questions.length === 0) {
    return (
      <div className="container mx-auto max-w-2xl py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Quiz Mode</h1>
          <p className="mt-2 text-muted-foreground">
            Test your knowledge with multiple choice questions
          </p>
        </div>

        <QuizConfigForm
          groups={[]} // TODO: Fetch groups from API
          onSubmit={handleConfigSubmit}
          isLoading={isLoading}
        />
      </div>
    );
  }

  // 顯示測驗完成畫面
  if (quiz.isComplete) {
    return (
      <div className="container mx-auto max-w-2xl py-8">
        <div className="rounded-lg border bg-card p-8 text-center">
          <h2 className="text-2xl font-bold">Quiz Complete!</h2>
          <div className="mt-6 space-y-2">
            <p className="text-lg">
              Score: {quiz.stats.correctAnswers} / {quiz.stats.totalQuestions}
            </p>
            <p className="text-muted-foreground">Accuracy: {quiz.stats.accuracy.toFixed(1)}%</p>
          </div>

          <div className="mt-8 flex gap-4 justify-center">
            <Button onClick={quiz.restart}>Try Again</Button>
            <Button variant="outline" onClick={() => router.push('/study')}>
              Back to Study
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // 顯示當前題目
  return (
    <div className="container mx-auto max-w-3xl py-8">
      <div className="mb-4 flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.push('/study')}>
          ← Exit Quiz
        </Button>
        <div className="text-sm text-muted-foreground">
          {quiz.currentQuestionNumber} / {quiz.totalQuestions}
        </div>
      </div>

      {quiz.currentQuestion && (
        <MultipleChoiceQuestion
          question={quiz.currentQuestion}
          onAnswer={handleAnswer}
          currentQuestionNumber={quiz.currentQuestionNumber}
          totalQuestions={quiz.totalQuestions}
          selectedAnswer={quiz.currentAnswer?.selectedAnswer}
          isCorrect={quiz.currentAnswer?.isCorrect}
        />
      )}
    </div>
  );
}
