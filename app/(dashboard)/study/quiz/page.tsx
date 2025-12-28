'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Layout } from '@/components/shared';
import { QuizConfigForm, type QuizConfig } from '@/components/features/quiz/QuizConfigForm';
import { MultipleChoiceQuestion } from '@/components/features/quiz/MultipleChoiceQuestion';
import { QuizSummary, type QuizAnswerRecord } from '@/components/features/quiz/QuizSummary';
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
      <Layout streak={0}>
        <div className="max-w-2xl mx-auto">
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
      </Layout>
    );
  }

  // 顯示測驗完成畫面
  if (quiz.isComplete) {
    // 轉換答案記錄格式
    const answerRecords: QuizAnswerRecord[] = quiz.answers.map((answer) => {
      const question = questions.find((q) => q.id === answer.questionId);
      return {
        questionId: answer.questionId,
        word: question?.word || '',
        reading: question?.reading || '',
        correctAnswer: question?.correctAnswer || '',
        selectedAnswer: answer.selectedAnswer,
        isCorrect: answer.isCorrect,
      };
    });

    return (
      <Layout streak={0}>
        <div className="max-w-3xl mx-auto">
          <QuizSummary
            answers={answerRecords}
            totalQuestions={quiz.stats.totalQuestions}
            correctAnswers={quiz.stats.correctAnswers}
            accuracy={quiz.stats.accuracy}
            onRestart={quiz.restart}
            onExit={() => router.push('/study')}
          />
        </div>
      </Layout>
    );
  }

  // 顯示當前題目
  return (
    <Layout streak={0}>
      <div className="max-w-3xl mx-auto">
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
    </Layout>
  );
}
