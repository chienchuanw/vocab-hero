/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';
import { useStudySession } from './useStudySession';

/**
 * useStudySession Hook Tests
 * Tests for study session management hook
 */

// Mock fetch
global.fetch = vi.fn();

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
}

describe('useStudySession', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('startSession', () => {
    it('should create a new study session', async () => {
      const mockSession = {
        id: 'session-1',
        userId: 'user-1',
        mode: 'flashcard',
        cardsReviewed: 0,
        correctAnswers: 0,
        timeSpentMinutes: 0,
        startedAt: new Date().toISOString(),
        completedAt: null,
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: mockSession }),
      });

      const { result } = renderHook(() => useStudySession(), {
        wrapper: createWrapper(),
      });

      result.current.startSession('user-1', 'flashcard');

      await waitFor(() => {
        expect(result.current.session).toEqual(mockSession);
      });

      expect(global.fetch).toHaveBeenCalledWith('/api/study/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'user-1', mode: 'flashcard' }),
      });
    });
  });

  describe('recordReview', () => {
    it('should update session with review data', async () => {
      const mockSession = {
        id: 'session-1',
        userId: 'user-1',
        mode: 'flashcard',
        cardsReviewed: 1,
        correctAnswers: 1,
        timeSpentMinutes: 5,
        startedAt: new Date().toISOString(),
        completedAt: null,
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: mockSession }),
      });

      const { result } = renderHook(() => useStudySession(), {
        wrapper: createWrapper(),
      });

      result.current.recordReview('session-1', 1, 1, 5);

      await waitFor(() => {
        expect(result.current.session).toEqual(mockSession);
      });
    });
  });

  describe('endSession', () => {
    it('should complete the session', async () => {
      const completedAt = new Date().toISOString();
      const mockSession = {
        id: 'session-1',
        userId: 'user-1',
        mode: 'flashcard',
        cardsReviewed: 10,
        correctAnswers: 8,
        timeSpentMinutes: 15,
        startedAt: new Date().toISOString(),
        completedAt,
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: mockSession }),
      });

      const { result } = renderHook(() => useStudySession(), {
        wrapper: createWrapper(),
      });

      result.current.endSession('session-1', 10, 8, 15);

      await waitFor(() => {
        expect(result.current.session?.completedAt).toBeDefined();
      });
    });
  });

  describe('getSessionStats', () => {
    it('should calculate session statistics', () => {
      const { result } = renderHook(() => useStudySession(), {
        wrapper: createWrapper(),
      });

      const stats = result.current.getSessionStats({
        id: 'session-1',
        userId: 'user-1',
        mode: 'flashcard',
        cardsReviewed: 20,
        correctAnswers: 16,
        timeSpentMinutes: 30,
        startedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      expect(stats.totalCards).toBe(20);
      expect(stats.correctCount).toBe(16);
      expect(stats.correctRate).toBe(0.8);
      expect(stats.timeSpent).toBe(30);
    });
  });

  describe('startQuizSession', () => {
    it('should create a quiz session with quiz-specific fields', async () => {
      const mockQuizSession = {
        id: 'quiz-session-1',
        userId: 'user-1',
        mode: 'quiz',
        studyMode: 'MULTIPLE_CHOICE',
        quizType: 'WORD_TO_MEANING',
        questionCount: 10,
        groupId: 'group-1',
        cardsReviewed: 0,
        correctAnswers: 0,
        timeSpentMinutes: 0,
        startedAt: new Date().toISOString(),
        completedAt: null,
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: mockQuizSession }),
      });

      const { result } = renderHook(() => useStudySession(), {
        wrapper: createWrapper(),
      });

      result.current.startQuizSession('user-1', {
        studyMode: 'MULTIPLE_CHOICE',
        quizType: 'WORD_TO_MEANING',
        questionCount: 10,
        groupId: 'group-1',
      });

      await waitFor(() => {
        expect(result.current.session).toEqual(mockQuizSession);
      });
    });

    it('should create a spelling quiz session', async () => {
      const mockSpellingSession = {
        id: 'spelling-session-1',
        userId: 'user-1',
        mode: 'quiz',
        studyMode: 'SPELLING',
        questionCount: 5,
        cardsReviewed: 0,
        correctAnswers: 0,
        timeSpentMinutes: 0,
        startedAt: new Date().toISOString(),
        completedAt: null,
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: mockSpellingSession }),
      });

      const { result } = renderHook(() => useStudySession(), {
        wrapper: createWrapper(),
      });

      result.current.startQuizSession('user-1', {
        studyMode: 'SPELLING',
        questionCount: 5,
      });

      await waitFor(() => {
        expect(result.current.session).toEqual(mockSpellingSession);
      });
    });
  });
});
