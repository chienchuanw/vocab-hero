import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

/**
 * Study Session interface
 */
export interface StudySession {
  id: string;
  userId: string;
  mode: string;
  studyMode?: 'FLASHCARD' | 'MULTIPLE_CHOICE' | 'SPELLING' | 'MATCHING' | 'RANDOM' | 'LISTENING';
  quizType?: 'WORD_TO_MEANING' | 'MEANING_TO_WORD' | 'MIXED';
  questionCount?: number;
  groupId?: string;
  cardsReviewed: number;
  correctAnswers: number;
  timeSpentMinutes: number;
  startedAt: string;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Quiz Session Configuration
 */
export interface QuizSessionConfig {
  studyMode: 'MULTIPLE_CHOICE' | 'SPELLING' | 'MATCHING' | 'RANDOM' | 'LISTENING';
  quizType?: 'WORD_TO_MEANING' | 'MEANING_TO_WORD' | 'MIXED';
  questionCount?: number;
  groupId?: string;
}

/**
 * Session 統計資料介面
 */
export interface SessionStats {
  totalCards: number;
  correctCount: number;
  correctRate: number;
  timeSpent: number;
}

/**
 * useStudySession Hook
 * 管理學習 session 狀態
 */
export function useStudySession() {
  const queryClient = useQueryClient();
  const [session, setSession] = useState<StudySession | null>(null);

  // 開始新的 session
  const startSessionMutation = useMutation({
    mutationFn: async ({ userId, mode }: { userId: string; mode: string }) => {
      const response = await fetch('/api/study/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, mode }),
      });

      if (!response.ok) {
        throw new Error('Failed to start session');
      }

      const result = await response.json();
      return result.data as StudySession;
    },
    onSuccess: (data) => {
      setSession(data);
      queryClient.invalidateQueries({ queryKey: ['study-sessions'] });
    },
  });

  // 記錄複習進度
  const recordReviewMutation = useMutation({
    mutationFn: async ({
      sessionId,
      cardsReviewed,
      correctAnswers,
      timeSpentMinutes,
    }: {
      sessionId: string;
      cardsReviewed: number;
      correctAnswers: number;
      timeSpentMinutes: number;
    }) => {
      const response = await fetch(`/api/study/sessions/${sessionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cardsReviewed,
          correctAnswers,
          timeSpentMinutes,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to record review');
      }

      const result = await response.json();
      return result.data as StudySession;
    },
    onSuccess: (data) => {
      setSession(data);
    },
  });

  // 結束 session
  const endSessionMutation = useMutation({
    mutationFn: async ({
      sessionId,
      cardsReviewed,
      correctAnswers,
      timeSpentMinutes,
    }: {
      sessionId: string;
      cardsReviewed: number;
      correctAnswers: number;
      timeSpentMinutes: number;
    }) => {
      const response = await fetch(`/api/study/sessions/${sessionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cardsReviewed,
          correctAnswers,
          timeSpentMinutes,
          completedAt: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to end session');
      }

      const result = await response.json();
      return result.data as StudySession;
    },
    onSuccess: (data) => {
      setSession(data);
      queryClient.invalidateQueries({ queryKey: ['study-sessions'] });
    },
  });

  // Start flashcard session
  const startSession = (userId: string, mode: string) => {
    startSessionMutation.mutate({ userId, mode });
  };

  // Start quiz session with quiz-specific configuration
  const startQuizSession = (userId: string, config: QuizSessionConfig) => {
    startSessionMutation.mutate({
      userId,
      mode: 'quiz',
      ...config,
    } as any);
  };

  // Record review progress
  const recordReview = (
    sessionId: string,
    cardsReviewed: number,
    correctAnswers: number,
    timeSpentMinutes: number
  ) => {
    recordReviewMutation.mutate({
      sessionId,
      cardsReviewed,
      correctAnswers,
      timeSpentMinutes,
    });
  };

  // End session
  const endSession = (
    sessionId: string,
    cardsReviewed: number,
    correctAnswers: number,
    timeSpentMinutes: number
  ) => {
    endSessionMutation.mutate({
      sessionId,
      cardsReviewed,
      correctAnswers,
      timeSpentMinutes,
    });
  };

  // Calculate session statistics
  const getSessionStats = (session: StudySession): SessionStats => {
    return {
      totalCards: session.cardsReviewed,
      correctCount: session.correctAnswers,
      correctRate: session.cardsReviewed > 0 ? session.correctAnswers / session.cardsReviewed : 0,
      timeSpent: session.timeSpentMinutes,
    };
  };

  return {
    session,
    startSession,
    startQuizSession,
    recordReview,
    endSession,
    getSessionStats,
    isStarting: startSessionMutation.isPending,
    isRecording: recordReviewMutation.isPending,
    isEnding: endSessionMutation.isPending,
  };
}
