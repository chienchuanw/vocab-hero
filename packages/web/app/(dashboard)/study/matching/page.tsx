'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Loader2 } from 'lucide-react';
import { Layout } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { MatchingCard } from '@/components/features/matching/MatchingCard';
import { MatchingGameHeader } from '@/components/features/matching/MatchingGameHeader';
import { GameComplete } from '@/components/features/matching/GameComplete';
import { useMatchingGame } from '@/hooks/useMatchingGame';
import { useVocabulary } from '@/hooks/useVocabulary';
import { generateColumnPairs } from '@/lib/matching/matching-generator';

import type { VocabularyItem } from '@/lib/matching/matching-generator';

const PAIR_COUNT = 5;

export default function MatchingGamePage() {
  const router = useRouter();
  const t = useTranslations('study');

  const { data, isLoading, isError } = useVocabulary({ limit: 50 });

  const vocabulary: VocabularyItem[] = useMemo(() => {
    const items = data?.pages.flatMap((page) => page.items) ?? [];
    return items.map((item) => ({
      id: item.id,
      word: item.word,
      meaning: item.meaning,
      reading: item.reading,
    }));
  }, [data]);

  const hasEnoughVocabulary = vocabulary.length >= PAIR_COUNT;

  const initialColumns = useMemo(
    () => (hasEnoughVocabulary ? generateColumnPairs(vocabulary, PAIR_COUNT) : null),
    [vocabulary, hasEnoughVocabulary]
  );

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <h1 className="sr-only">{t('matching')}</h1>
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError || !hasEnoughVocabulary || !initialColumns) {
    return (
      <Layout streak={0}>
        <div className="mx-auto max-w-md py-16 text-center">
          <h1 className="text-2xl font-bold">{t('matching')}</h1>
          <p className="mt-4 text-muted-foreground">
            {isError
              ? t('errorLoadingVocabulary')
              : t('notEnoughVocabulary', { count: PAIR_COUNT })}
          </p>
          <Button className="mt-6" onClick={() => router.push('/study')}>
            {t('backToStudy')}
          </Button>
        </div>
      </Layout>
    );
  }

  return <MatchingGameContent initialColumns={initialColumns} />;
}

function MatchingGameContent({
  initialColumns,
}: {
  initialColumns: ReturnType<typeof generateColumnPairs>;
}) {
  const router = useRouter();
  const t = useTranslations('study');
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
        <div className="mx-auto max-w-2xl">
          <h1 className="sr-only">{t('matching')}</h1>
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
      <h1 className="sr-only">{t('matching')}</h1>
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
