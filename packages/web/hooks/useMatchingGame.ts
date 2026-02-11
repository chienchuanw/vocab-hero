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
   * 選擇卡片
   */
  const selectCard = useCallback(
    (cardId: string) => {
      if (state.selectedCards.length >= 2) return;

      const card = state.cards.find((c) => c.id === cardId);
      if (!card) return;

      if (state.matchedPairs.includes(card.pairId)) return;
      if (state.selectedCards.includes(cardId)) return;

      setState((prev) => ({
        ...prev,
        selectedCards: [...prev.selectedCards, cardId],
        startTime: prev.startTime === null ? Date.now() : prev.startTime,
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
        const isMatch = isMatchingPair(card1, card2);
        const totalPairs = initialCards.length / 2;

        // eslint-disable-next-line react-hooks/set-state-in-effect
        setState((prev) => {
          const newMatchedPairs = isMatch
            ? [...prev.matchedPairs, card1.pairId]
            : prev.matchedPairs;
          const isGameComplete = newMatchedPairs.length === totalPairs;

          return {
            ...prev,
            attempts: prev.attempts + 1,
            matchedPairs: newMatchedPairs,
            showMatchAnimation: isMatch,
            isComplete: isGameComplete,
            endTime: isGameComplete ? Date.now() : prev.endTime,
          };
        });

        setTimeout(() => {
          setState((prev) => ({
            ...prev,
            selectedCards: [],
            showMatchAnimation: false,
          }));
        }, 1000);
      }
    }
  }, [state.selectedCards, state.cards, initialCards.length]);

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
