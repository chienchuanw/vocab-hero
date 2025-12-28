import type { VocabularyItem } from '@/hooks/useVocabulary';

/**
 * Flashcard component props
 */
export interface FlashcardProps {
  vocabulary: VocabularyItem;
  onFlip?: (isFlipped: boolean) => void;
}

