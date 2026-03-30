'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Layout } from '@/components/shared';
import { MatchingCard } from '@/components/features/matching/MatchingCard';
import { MatchingGameHeader } from '@/components/features/matching/MatchingGameHeader';
import { GameComplete } from '@/components/features/matching/GameComplete';
import { useMatchingGame } from '@/hooks/useMatchingGame';
import { generateColumnPairs } from '@/lib/matching/matching-generator';

import type { VocabularyItem } from '@/lib/matching/matching-generator';

export default function MatchingGamePage() {
  const router = useRouter();

  // TODO: 從 API 獲取單字資料
  const [vocabulary] = useState<VocabularyItem[]>([
    { id: '1', word: '勉強', meaning: 'study', reading: 'べんきょう' },
    { id: '2', word: '学校', meaning: 'school', reading: 'がっこう' },
    { id: '3', word: '先生', meaning: 'teacher', reading: 'せんせい' },
    { id: '4', word: '学生', meaning: 'student', reading: 'がくせい' },
    { id: '5', word: '本', meaning: 'book', reading: 'ほん' },
  ]);

  const initialColumns = useMemo(() => generateColumnPairs(vocabulary, 5), [vocabulary]);
  const game = useMatchingGame(initialColumns);

  const isCardSelected = (cardId: string) => game.selectedCards.includes(cardId);
  const isCardMatched = (pairId: string) => game.matchedPairs.includes(pairId);

  const isCardError = (cardId: string) => {
    if (game.selectedCards.length === 2 && game.selectedCards.includes(cardId)) {
      const allCards = [...game.leftColumn, ...game.rightColumn];
      const card1 = allCards.find((c) => c.id === game.selectedCards[0]);
      const card2 = allCards.find((c) => c.id === game.selectedCards[1]);
      if (card1 && card2 && card1.pairId !== card2.pairId) {
        return true;
      }
    }
    return false;
  };

  const isCardDisabled = (cardId: string, column: 'left' | 'right') => {
    if (game.selectedCards.length >= 2) return true;
    if (game.selectedCards.length === 1 && game.firstSelectedColumn === column) {
      return !isCardSelected(cardId);
    }
    return false;
  };

  if (game.isComplete) {
    return (
      <Layout streak={0}>
        <div className="max-w-2xl mx-auto">
          <GameComplete
            elapsedTime={game.elapsedTime}
            attempts={game.attempts}
            onRestart={game.restart}
            onBackToStudy={() => router.push('/study')}
          />
        </div>
      </Layout>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <MatchingGameHeader
        matchedCount={game.matchedPairs.length}
        totalPairs={game.totalPairs}
        elapsedTime={game.elapsedTime}
        onClose={() => {}}
      />

      <main className="flex flex-1 flex-col items-center justify-center px-4 pb-8">
        <div className="grid w-full max-w-2xl grid-cols-2 gap-4">
          {Array.from({ length: game.totalPairs }).map((_, rowIndex) => {
            const leftCard = game.leftColumn[rowIndex];
            const rightCard = game.rightColumn[rowIndex];

            if (!leftCard || !rightCard) return null;

            return (
              <div key={leftCard.pairId + rightCard.pairId} className="contents">
                <MatchingCard
                  content={leftCard.content}
                  type={leftCard.type}
                  onClick={() => game.selectCard(leftCard.id)}
                  isSelected={isCardSelected(leftCard.id)}
                  isMatched={isCardMatched(leftCard.pairId)}
                  isError={isCardError(leftCard.id)}
                  disabled={isCardDisabled(leftCard.id, 'left')}
                />
                <MatchingCard
                  content={rightCard.content}
                  type={rightCard.type}
                  onClick={() => game.selectCard(rightCard.id)}
                  isSelected={isCardSelected(rightCard.id)}
                  isMatched={isCardMatched(rightCard.pairId)}
                  isError={isCardError(rightCard.id)}
                  disabled={isCardDisabled(rightCard.id, 'right')}
                />
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
