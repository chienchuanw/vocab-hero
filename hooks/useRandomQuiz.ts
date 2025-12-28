import { useState, useCallback } from 'react';
import { validateSpelling } from '@/lib/spelling/spelling-validator';
import type { QuizQuestion } from '@/lib/random-quiz/question-generator';

/**
 * Question Result
 */
export interface QuestionResult {
  questionId: string;
  type: 'multiple-choice' | 'spelling';
  isCorrect: boolean;
  userAnswer: string;
  correctAnswer: string;
}

/**
 * Random Quiz State
 */
export interface RandomQuizState {
  questions: QuizQuestion[];
  currentQuestionIndex: number;
  results: QuestionResult[];
  isComplete: boolean;
}

/**
 * useRandomQuiz Hook
 * 管理隨機測驗的狀態和邏輯
 */
export function useRandomQuiz(initialQuestions: QuizQuestion[]) {
  const [state, setState] = useState<RandomQuizState>({
    questions: initialQuestions,
    currentQuestionIndex: 0,
    results: [],
    isComplete: false,
  });

  /**
   * 取得當前題目
   */
  const currentQuestion = state.questions[state.currentQuestionIndex];

  /**
   * 取得當前題目的答案（如果已回答）
   */
  const currentResult = state.results.find((r) => r.questionId === currentQuestion?.id);

  /**
   * 回答選擇題
   */
  const answerMultipleChoice = useCallback(
    (answer: string) => {
      if (!currentQuestion || currentQuestion.type !== 'multiple-choice') return;

      const isCorrect = answer === currentQuestion.correctAnswer;

      setState((prev) => ({
        ...prev,
        results: [
          ...prev.results,
          {
            questionId: currentQuestion.id,
            type: 'multiple-choice',
            isCorrect,
            userAnswer: answer,
            correctAnswer: currentQuestion.correctAnswer,
          },
        ],
      }));
    },
    [currentQuestion]
  );

  /**
   * 回答拼寫題
   */
  const answerSpelling = useCallback(
    (answer: string) => {
      if (!currentQuestion || currentQuestion.type !== 'spelling') return;

      const validation = validateSpelling(answer, currentQuestion.correctAnswer);

      setState((prev) => ({
        ...prev,
        results: [
          ...prev.results,
          {
            questionId: currentQuestion.id,
            type: 'spelling',
            isCorrect: validation.isCorrect,
            userAnswer: answer,
            correctAnswer: currentQuestion.correctAnswer,
          },
        ],
      }));
    },
    [currentQuestion]
  );

  /**
   * 前往下一題
   */
  const nextQuestion = useCallback(() => {
    setState((prev) => {
      const nextIndex = prev.currentQuestionIndex + 1;
      const isComplete = nextIndex >= prev.questions.length;

      return {
        ...prev,
        currentQuestionIndex: nextIndex,
        isComplete,
      };
    });
  }, []);

  /**
   * 重新開始測驗
   */
  const restart = useCallback(() => {
    setState({
      questions: initialQuestions,
      currentQuestionIndex: 0,
      results: [],
      isComplete: false,
    });
  }, [initialQuestions]);

  /**
   * 計算統計數據
   */
  const stats = {
    totalQuestions: state.questions.length,
    answeredQuestions: state.results.length,
    correctAnswers: state.results.filter((r) => r.isCorrect).length,
    incorrectAnswers: state.results.filter((r) => !r.isCorrect).length,
    accuracy:
      state.results.length > 0
        ? (state.results.filter((r) => r.isCorrect).length / state.results.length) * 100
        : 0,
  };

  return {
    // State
    currentQuestion,
    currentResult,
    currentQuestionNumber: state.currentQuestionIndex + 1,
    totalQuestions: state.questions.length,
    isComplete: state.isComplete,
    results: state.results,

    // Actions
    answerMultipleChoice,
    answerSpelling,
    nextQuestion,
    restart,

    // Stats
    stats,
  };
}

