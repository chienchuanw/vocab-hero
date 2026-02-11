/**
 * ExampleSentence component type definitions
 */

export interface ExampleSentenceData {
  id: string;
  sentence: string;
  reading: string | null;
  meaning: string;
  order: number;
}

export interface ExampleSentenceProps {
  sentence: ExampleSentenceData | null;
  className?: string;
  emptyMessage?: string;
}

