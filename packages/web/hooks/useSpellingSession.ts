import { useState, useCallback } from 'react';
import { validateSpelling } from '@/lib/spelling/spelling-validator';

/**
 * Spelling Question
 */
export interface SpellingQuestion {
  id: string;
  vocabularyId: string;
  word: string;
  meaning: string;
  correctReading: string;
}

/**
 * Spelling Answer
 */
export interface SpellingAnswer {
  questionId: string;
  userAnswer: string;
  isCorrect: boolean;
}

/**
 * Spelling Session State
 */
export interface SpellingSessionState {
  questions: SpellingQuestion[];
  currentQuestionIndex: number;
  answers: SpellingAnswer[];
  isComplete: boolean;
}

/**
 * useSpellingSession Hook
 * 管理拼寫測驗的狀態和邏輯
 */
export function useSpellingSession(initialQuestions: SpellingQuestion[]) {
  const [state, setState] = useState<SpellingSessionState>({
    questions: initialQuestions,
    currentQuestionIndex: 0,
    answers: [],
    isComplete: false,
  });

  /**
   * 取得當前題目
   */
  const currentQuestion = state.questions[state.currentQuestionIndex];

  /**
   * 取得當前題目的答案（如果已回答）
   */
  const currentAnswer = state.answers.find((a) => a.questionId === currentQuestion?.id);

  /**
   * 回答當前題目
   */
  const answerQuestion = useCallback(
    (answer: string) => {
      if (!currentQuestion) return;

      // 驗證答案
      const validation = validateSpelling(answer, currentQuestion.correctReading);

      setState((prev) => ({
        ...prev,
        answers: [
          ...prev.answers,
          {
            questionId: currentQuestion.id,
            userAnswer: answer,
            isCorrect: validation.isCorrect,
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
   * 前往上一題
   */
  const previousQuestion = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentQuestionIndex: Math.max(0, prev.currentQuestionIndex - 1),
    }));
  }, []);

  /**
   * 重新開始測驗
   */
  const restart = useCallback(() => {
    setState({
      questions: initialQuestions,
      currentQuestionIndex: 0,
      answers: [],
      isComplete: false,
    });
  }, [initialQuestions]);

  /**
   * 計算測驗統計
   */
  const stats = {
    totalQuestions: state.questions.length,
    answeredQuestions: state.answers.length,
    correctAnswers: state.answers.filter((a) => a.isCorrect).length,
    incorrectAnswers: state.answers.filter((a) => !a.isCorrect).length,
    accuracy:
      state.answers.length > 0
        ? (state.answers.filter((a) => a.isCorrect).length / state.answers.length) * 100
        : 0,
  };

  return {
    // State
    currentQuestion,
    currentAnswer,
    currentQuestionNumber: state.currentQuestionIndex + 1,
    totalQuestions: state.questions.length,
    isComplete: state.isComplete,
    answers: state.answers,

    // Actions
    answerQuestion,
    nextQuestion,
    previousQuestion,
    restart,

    // Stats
    stats,
  };
}

