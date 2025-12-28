'use client';

import { useState, useEffect } from 'react';
import { ExampleSentence } from '@/components/features/vocabulary/ExampleSentence';
import { SpeakerButton } from '@/components/features/audio';
import type { FlashcardProps } from './Flashcard.types';
import type { ExampleSentenceData } from '@/components/features/vocabulary/ExampleSentence.types';

/**
 * Flashcard component
 * Displays vocabulary with flip animation
 * Front: word + reading
 * Back: meaning + example sentences
 */
export function Flashcard({ vocabulary, onFlip }: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  // Handle flip
  const handleFlip = () => {
    const newFlippedState = !isFlipped;
    setIsFlipped(newFlippedState);
    onFlip?.(newFlippedState);
  };

  // Handle keyboard events
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        handleFlip();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isFlipped]);

  // Convert example sentences to display format
  const exampleSentences: ExampleSentenceData[] =
    vocabulary.exampleSentences?.map((s) => ({
      id: s.id,
      sentence: s.sentence,
      reading: s.reading,
      meaning: s.meaning,
      order: s.order,
    })) || [];

  return (
    <div className="flashcard-container perspective-1000">
      <button
        onClick={handleFlip}
        className="flashcard-inner relative w-full h-96 transition-transform duration-500 transform-style-3d focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-lg"
        style={{
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          transformStyle: 'preserve-3d',
        }}
        aria-label="Flip card"
      >
        {/* Front Side */}
        <div
          className="flashcard-face absolute w-full h-full backface-hidden bg-card border-2 border-border rounded-lg shadow-lg p-8 flex flex-col items-center justify-center"
          style={{
            backfaceVisibility: 'hidden',
          }}
        >
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-4">
              <h2 className="text-6xl font-bold text-foreground">{vocabulary.word}</h2>
              <div onClick={(e) => e.stopPropagation()}>
                <SpeakerButton text={vocabulary.word} size="default" />
              </div>
            </div>
            <p className="text-3xl text-muted-foreground">{vocabulary.reading}</p>
          </div>
          <p className="absolute bottom-4 text-sm text-muted-foreground">
            Press Space or Click to flip
          </p>
        </div>

        {/* Back Side */}
        <div
          className="flashcard-face absolute w-full h-full backface-hidden bg-card border-2 border-border rounded-lg shadow-lg p-8 overflow-y-auto"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-4xl font-bold text-foreground mb-2">{vocabulary.meaning}</h3>
              {vocabulary.notes && (
                <p className="text-sm text-muted-foreground italic">{vocabulary.notes}</p>
              )}
            </div>

            <div className="border-t pt-4">
              <h4 className="text-lg font-semibold mb-3">Example Sentences</h4>
              {exampleSentences.length > 0 ? (
                <div className="space-y-4">
                  {exampleSentences.map((sentence) => (
                    <ExampleSentence key={sentence.id} sentence={sentence} />
                  ))}
                </div>
              ) : (
                <ExampleSentence sentence={null} />
              )}
            </div>
          </div>
          <p className="absolute bottom-4 left-0 right-0 text-center text-sm text-muted-foreground">
            Press Space or Click to flip back
          </p>
        </div>
      </button>
    </div>
  );
}
