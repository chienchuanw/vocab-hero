import { useState, useCallback, useEffect } from 'react';
import {
  isMatchingPair,
  type MatchingCard,
  type ColumnPairs,
} from '@/lib/matching/matching-generator';

export interface MatchingGameState {
  leftColumn: MatchingCard[];
  rightColumn: MatchingCard[];
  selectedCards: string[];
  matchedPairs: string[];
  attempts: number;
  startTime: number | null;
  endTime: number | null;
  isComplete: boolean;
}

export function useMatchingGame(initialColumns: ColumnPairs) {
  const totalPairs = initialColumns.leftColumn.length;

  const [state, setState] = useState<MatchingGameState>({
    leftColumn: initialColumns.leftColumn,
    rightColumn: initialColumns.rightColumn,
    selectedCards: [],
    matchedPairs: [],
    attempts: 0,
    startTime: null,
    endTime: null,
    isComplete: false,
  });

  const findCard = useCallback(
    (cardId: string): MatchingCard | undefined => {
      return state.leftColumn.find((c) => c.id === cardId)
        ?? state.rightColumn.find((c) => c.id === cardId);
    },
    [state.leftColumn, state.rightColumn]
  );

  const getCardColumn = useCallback(
    (cardId: string): 'left' | 'right' | null => {
      if (state.leftColumn.some((c) => c.id === cardId)) return 'left';
      if (state.rightColumn.some((c) => c.id === cardId)) return 'right';
      return null;
    },
    [state.leftColumn, state.rightColumn]
  );

  const firstSelectedColumn = state.selectedCards.length > 0
    ? getCardColumn(state.selectedCards[0]!)
    : null;

  const selectCard = useCallback(
    (cardId: string) => {
      if (state.selectedCards.length >= 2) return;

      const card = findCard(cardId);
      if (!card) return;

      if (state.matchedPairs.includes(card.pairId)) return;
      if (state.selectedCards.includes(cardId)) return;

      if (state.selectedCards.length === 1) {
        const firstColumn = getCardColumn(state.selectedCards[0]!);
        const secondColumn = getCardColumn(cardId);
        if (firstColumn === secondColumn) return;
      }

      setState((prev) => ({
        ...prev,
        selectedCards: [...prev.selectedCards, cardId],
        startTime: prev.startTime === null ? Date.now() : prev.startTime,
      }));
    },
    [state.selectedCards, state.matchedPairs, findCard, getCardColumn]
  );

  useEffect(() => {
    if (state.selectedCards.length === 2) {
      const [card1Id, card2Id] = state.selectedCards;
      const card1 = findCard(card1Id!);
      const card2 = findCard(card2Id!);

      if (card1 && card2) {
        const isMatch = isMatchingPair(card1, card2);

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
            isComplete: isGameComplete,
            endTime: isGameComplete ? Date.now() : prev.endTime,
          };
        });

        setTimeout(() => {
          setState((prev) => ({
            ...prev,
            selectedCards: [],
          }));
        }, 1000);
      }
    }
  }, [state.selectedCards, findCard, totalPairs]);

  const restart = useCallback(() => {
    setState({
      leftColumn: initialColumns.leftColumn,
      rightColumn: initialColumns.rightColumn,
      selectedCards: [],
      matchedPairs: [],
      attempts: 0,
      startTime: null,
      endTime: null,
      isComplete: false,
    });
  }, [initialColumns]);

  const getElapsedTime = useCallback(() => {
    if (!state.startTime) return 0;
    const endTime = state.endTime || Date.now();
    return Math.floor((endTime - state.startTime) / 1000);
  }, [state.startTime, state.endTime]);

  return {
    leftColumn: state.leftColumn,
    rightColumn: state.rightColumn,
    selectedCards: state.selectedCards,
    matchedPairs: state.matchedPairs,
    attempts: state.attempts,
    isComplete: state.isComplete,
    firstSelectedColumn,

    selectCard,
    restart,

    elapsedTime: getElapsedTime(),
    totalPairs,
  };
}
