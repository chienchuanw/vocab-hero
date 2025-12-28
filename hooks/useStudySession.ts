import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

/**
 * Study Session 介面
 */
export interface StudySession {
  id: string;
  userId: string;
  mode: string;
  cardsReviewed: number;
  correctAnswers: number;
  timeSpentMinutes: number;
  startedAt: string;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
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

  // 開始 session
  const startSession = (userId: string, mode: string) => {
    startSessionMutation.mutate({ userId, mode });
  };

  // 記錄複習
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

  // 結束 session
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

  // 計算統計資料
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
    recordReview,
    endSession,
    getSessionStats,
    isStarting: startSessionMutation.isPending,
    isRecording: recordReviewMutation.isPending,
    isEnding: endSessionMutation.isPending,
  };
}

