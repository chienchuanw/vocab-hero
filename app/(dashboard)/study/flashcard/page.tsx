'use client';

import { useState } from 'react';
import { Layout } from '@/components/shared';
import { useDueVocabulary } from '@/hooks/useVocabulary';
import { useUserSettings } from '@/hooks/useUserSettings';
import { Flashcard } from '@/components/features/study/Flashcard';
import { QualityRatingButtons } from '@/components/features/study/QualityRatingButtons';
import type { QualityRating } from '@/components/features/study/QualityRatingButtons.types';

const DEFAULT_USER_ID = 'cmjod038p00008o9qathx7chz';
const DEFAULT_CARDS_PER_SESSION = 20;

export default function FlashcardStudyPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [ratings, setRatings] = useState<Record<string, QualityRating>>({});

  const { data: settings } = useUserSettings(DEFAULT_USER_ID);
  const cardsPerSession = settings?.cardsPerSession ?? DEFAULT_CARDS_PER_SESSION;

  const { data: vocabulary, isLoading, error } = useDueVocabulary(cardsPerSession);

  const handleRate = (quality: QualityRating) => {
    if (!vocabulary || currentIndex >= vocabulary.length) return;

    const currentVocab = vocabulary[currentIndex];
    if (!currentVocab) return;

    setRatings((prev) => ({
      ...prev,
      [currentVocab.id]: quality,
    }));

    if (currentIndex < vocabulary.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setIsFlipped(false);
    }
  };

  const handleFlip = (flipped: boolean) => {
    setIsFlipped(flipped);
  };

  const handleNext = () => {
    if (!vocabulary) return;
    if (currentIndex < vocabulary.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setIsFlipped(false);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setIsFlipped(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <Layout streak={0}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading vocabulary...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Error state
  if (error) {
    return (
      <Layout streak={0}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <p className="text-destructive text-lg mb-4">Error loading vocabulary</p>
            <p className="text-muted-foreground">{error.message}</p>
          </div>
        </div>
      </Layout>
    );
  }

  // No vocabulary state
  if (!vocabulary || vocabulary.length === 0) {
    return (
      <Layout streak={0}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <p className="text-lg mb-4">No vocabulary items due for review</p>
            <p className="text-muted-foreground">Great job! Check back later.</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Session complete state
  if (currentIndex >= vocabulary.length) {
    return (
      <Layout streak={0}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Session Complete!</h2>
            <p className="text-muted-foreground mb-4">You reviewed {vocabulary.length} cards</p>
          </div>
        </div>
      </Layout>
    );
  }

  const currentVocab = vocabulary[currentIndex];

  // 確保 currentVocab 存在才渲染
  if (!currentVocab) {
    return null;
  }

  return (
    <Layout streak={0}>
      <div className="max-w-4xl mx-auto">
        {/* Progress indicator */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted-foreground">
              Card {currentIndex + 1} / {vocabulary.length}
            </span>
            <span className="text-sm text-muted-foreground">
              {Object.keys(ratings).length} rated
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{
                width: `${((currentIndex + 1) / vocabulary.length) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Flashcard */}
        <div className="mb-8">
          <Flashcard
            vocabulary={currentVocab}
            onFlip={handleFlip}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        </div>

        {/* Rating buttons - only show when card is flipped */}
        {isFlipped && (
          <div className="mt-8">
            <QualityRatingButtons onRate={handleRate} />
          </div>
        )}

        {/* Instructions */}
        {!isFlipped && (
          <div className="text-center text-sm text-muted-foreground mt-4">
            <p>Press Space or Click to flip the card</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
