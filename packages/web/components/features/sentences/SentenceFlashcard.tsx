'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSwipeGesture } from '@/hooks/useSwipeGesture';
import { cn } from '@/lib/utils';
import { SpeakerButton } from '@/components/features/audio';
import { ttsEngine } from '@/lib/tts';

export interface SentenceCardData {
  id: string;
  japanese: string;
  english: string;
  notes?: string | null;
}

interface SentenceFlashcardProps {
  sentences: SentenceCardData[];
  initialIndex?: number;
  onClose?: () => void;
  className?: string;
}

export function SentenceFlashcard({
  sentences,
  initialIndex = 0,
  onClose,
  className,
}: SentenceFlashcardProps) {
  const t = useTranslations('sentences.flashcard');
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isFlipped, setIsFlipped] = useState(false);
  const cardRef = useRef<HTMLButtonElement>(null);

  const currentSentence = sentences[currentIndex];
  const totalSentences = sentences.length;

  const handleFlip = useCallback(() => {
    setIsFlipped((prev) => !prev);
  }, []);

  const handleNext = useCallback(() => {
    if (currentIndex < totalSentences - 1) {
      ttsEngine.stop();
      setIsFlipped(false);
      setTimeout(() => setCurrentIndex((prev) => prev + 1), 150);
    }
  }, [currentIndex, totalSentences]);

  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      ttsEngine.stop();
      setIsFlipped(false);
      setTimeout(() => setCurrentIndex((prev) => prev - 1), 150);
    }
  }, [currentIndex]);

  useSwipeGesture({
    elementRef: cardRef,
    onSwipeLeft: handleNext,
    onSwipeRight: handlePrevious,
    threshold: 50,
  });

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        handleFlip();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrevious();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose?.();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleFlip, handleNext, handlePrevious, onClose]);

  if (!currentSentence) {
    return (
      <div className="flex flex-col items-center justify-center h-64 p-4 text-center">
        <p className="text-muted-foreground mb-4">{t('noSentences')}</p>
        <Button onClick={onClose} variant="outline">
          {t('close')}
        </Button>
      </div>
    );
  }

  return (
    <div
      className={cn('flex flex-col items-center w-full max-w-2xl mx-auto p-4', className)}
      data-testid="sentence-flashcard"
    >
      <div className="w-full flex justify-between items-center mb-4">
        <div className="text-sm font-medium text-muted-foreground" data-testid="flashcard-counter">
          {t('counter', { current: currentIndex + 1, total: totalSentences })}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-8 w-8"
          data-testid="flashcard-close"
          aria-label={t('close')}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="relative w-full aspect-[4/3] perspective-1000 mb-6">
        <button
          ref={cardRef}
          type="button"
          onClick={handleFlip}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleFlip();
            }
          }}
          aria-label="Flip card"
          className={cn(
            'w-full h-full transition-transform duration-500 transform-style-3d cursor-pointer relative rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
            isFlipped ? 'rotate-y-180' : ''
          )}
          style={{
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            transformStyle: 'preserve-3d',
          }}
        >
          <Card
            className="absolute w-full h-full backface-hidden flex flex-col items-center justify-center p-8 text-center bg-card border-2"
            style={{ backfaceVisibility: 'hidden' }}
            data-testid="flashcard-front"
          >
            <div className="flex-1 flex flex-col items-center justify-center w-full">
              <p className="text-2xl md:text-3xl font-bold leading-relaxed text-foreground">
                {currentSentence.japanese}
              </p>
            </div>
            <p className="text-sm text-muted-foreground mt-4">{t('flipToReveal')}</p>
          </Card>

          <Card
            className="absolute w-full h-full backface-hidden flex flex-col items-center justify-center p-8 text-center bg-card border-2"
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
            data-testid="flashcard-back"
          >
            <div className="flex-1 flex flex-col items-center justify-center w-full space-y-6">
              <p className="text-xl md:text-2xl font-medium text-foreground">
                {currentSentence.english}
              </p>
              {currentSentence.notes && (
                <div className="bg-muted/50 p-4 rounded-md w-full max-w-md">
                  <p className="text-sm text-muted-foreground italic">{currentSentence.notes}</p>
                </div>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-4">{t('flipBack')}</p>
          </Card>
        </button>

        {!isFlipped && (
          <div className="absolute right-6 top-6 z-10">
            <SpeakerButton text={currentSentence.japanese} size="default" />
          </div>
        )}
      </div>

      <div className="flex items-center gap-4 w-full justify-center">
        <Button
          variant="outline"
          size="lg"
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          className="w-32"
          data-testid="flashcard-prev"
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          {t('previous')}
        </Button>

        <Button
          variant="outline"
          size="lg"
          onClick={handleNext}
          disabled={currentIndex === totalSentences - 1}
          className="w-32"
          data-testid="flashcard-next"
        >
          {t('next')}
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
