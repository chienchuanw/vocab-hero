import { useState, useCallback, useEffect } from 'react';
import { isMatchingPair, type MatchingCard } from '@/lib/matching/matching-generator';

/**
 * Matching Game State
 */
export interface MatchingGameState {
  cards: MatchingCard[];
  selectedCards: string[]; // Card IDs
  matchedPairs: string[]; // Pair IDs
  attempts: number;
  startTime: number | null;
  endTime: number | null;
  isComplete: boolean;
  showMatchAnimation: boolean;
}

/**
 * useMatchingGame Hook
 * 管理配對遊戲的狀態和邏輯
 */
export function useMatchingGame(initialCards: MatchingCard[]) {
  const [state, setState] = useState<MatchingGameState>({
    cards: initialCards,
    selectedCards: [],
    matchedPairs: [],
    attempts: 0,
    startTime: null,
    endTime: null,
    isComplete: false,
    showMatchAnimation: false,
  });

  /**
   * 開始遊戲計時
   */
  useEffect(() => {
    if (state.startTime === null && state.selectedCards.length > 0) {
      setState((prev) => ({
        ...prev,
        startTime: Date.now(),
      }));
    }
  }, [state.selectedCards.length, state.startTime]);

  /**
   * 檢查遊戲是否完成
   */
  useEffect(() => {
    const totalPairs = initialCards.length / 2;
    if (state.matchedPairs.length === totalPairs && !state.isComplete) {
      setState((prev) => ({
        ...prev,
        isComplete: true,
        endTime: Date.now(),
      }));
    }
  }, [state.matchedPairs.length, state.isComplete, initialCards.length]);

  /**
   * 選擇卡片
   */
  const selectCard = useCallback(
    (cardId: string) => {
      // 如果已經選擇了兩張卡片，或卡片已配對，則忽略
      if (state.selectedCards.length >= 2) return;

      const card = state.cards.find((c) => c.id === cardId);
      if (!card) return;

      // 如果卡片已配對，則忽略
      if (state.matchedPairs.includes(card.pairId)) return;

      // 如果卡片已選擇，則忽略
      if (state.selectedCards.includes(cardId)) return;

      setState((prev) => ({
        ...prev,
        selectedCards: [...prev.selectedCards, cardId],
      }));
    },
    [state.selectedCards, state.cards, state.matchedPairs]
  );

  /**
   * 檢查配對
   */
  useEffect(() => {
    if (state.selectedCards.length === 2) {
      const [card1Id, card2Id] = state.selectedCards;
      const card1 = state.cards.find((c) => c.id === card1Id);
      const card2 = state.cards.find((c) => c.id === card2Id);

      if (card1 && card2) {
        setState((prev) => ({
          ...prev,
          attempts: prev.attempts + 1,
        }));

        if (isMatchingPair(card1, card2)) {
          // 配對成功
          setState((prev) => ({
            ...prev,
            matchedPairs: [...prev.matchedPairs, card1.pairId],
            showMatchAnimation: true,
          }));

          // 延遲清除選擇
          setTimeout(() => {
            setState((prev) => ({
              ...prev,
              selectedCards: [],
              showMatchAnimation: false,
            }));
          }, 1000);
        } else {
          // 配對失敗，延遲清除選擇
          setTimeout(() => {
            setState((prev) => ({
              ...prev,
              selectedCards: [],
            }));
          }, 1000);
        }
      }
    }
  }, [state.selectedCards, state.cards]);

  /**
   * 重新開始遊戲
   */
  const restart = useCallback(() => {
    setState({
      cards: initialCards,
      selectedCards: [],
      matchedPairs: [],
      attempts: 0,
      startTime: null,
      endTime: null,
      isComplete: false,
      showMatchAnimation: false,
    });
  }, [initialCards]);

  /**
   * 計算遊戲時間（秒）
   */
  const getElapsedTime = useCallback(() => {
    if (!state.startTime) return 0;
    const endTime = state.endTime || Date.now();
    return Math.floor((endTime - state.startTime) / 1000);
  }, [state.startTime, state.endTime]);

  return {
    // State
    cards: state.cards,
    selectedCards: state.selectedCards,
    matchedPairs: state.matchedPairs,
    attempts: state.attempts,
    isComplete: state.isComplete,
    showMatchAnimation: state.showMatchAnimation,

    // Actions
    selectCard,
    restart,

    // Computed
    elapsedTime: getElapsedTime(),
  };
}

