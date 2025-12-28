'use client';

import { useState } from 'react';
import { useDueVocabulary } from '@/hooks/useVocabulary';
import { Flashcard } from '@/components/features/study/Flashcard';
import { QualityRatingButtons } from '@/components/features/study/QualityRatingButtons';
import type { QualityRating } from '@/components/features/study/QualityRatingButtons.types';

/**
 * FlashcardStudy Page
 * 單字卡學習頁面
 * 支援翻卡、評分、鍵盤快捷鍵
 */
export default function FlashcardStudyPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [ratings, setRatings] = useState<Record<string, QualityRating>>({});

  // 取得需要複習的單字
  const { data: vocabulary, isLoading, error } = useDueVocabulary(20);

  // 處理評分
  const handleRate = (quality: QualityRating) => {
    if (!vocabulary || currentIndex >= vocabulary.length) return;

    const currentVocab = vocabulary[currentIndex];
    if (!currentVocab) return;

    // 記錄評分
    setRatings((prev) => ({
      ...prev,
      [currentVocab.id]: quality,
    }));

    // 移動到下一張卡片
    if (currentIndex < vocabulary.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setIsFlipped(false);
    }
  };

  // 處理翻卡
  const handleFlip = (flipped: boolean) => {
    setIsFlipped(flipped);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading vocabulary...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-destructive text-lg mb-4">Error loading vocabulary</p>
          <p className="text-muted-foreground">{error.message}</p>
        </div>
      </div>
    );
  }

  // No vocabulary state
  if (!vocabulary || vocabulary.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-lg mb-4">No vocabulary items due for review</p>
          <p className="text-muted-foreground">Great job! Check back later.</p>
        </div>
      </div>
    );
  }

  // Session complete state
  if (currentIndex >= vocabulary.length) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Session Complete!</h2>
          <p className="text-muted-foreground mb-4">You reviewed {vocabulary.length} cards</p>
        </div>
      </div>
    );
  }

  const currentVocab = vocabulary[currentIndex];

  // 確保 currentVocab 存在才渲染
  if (!currentVocab) {
    return null;
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      {/* Progress indicator */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-muted-foreground">
            Card {currentIndex + 1} / {vocabulary.length}
          </span>
          <span className="text-sm text-muted-foreground">{Object.keys(ratings).length} rated</span>
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
        <Flashcard vocabulary={currentVocab} onFlip={handleFlip} />
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
  );
}
