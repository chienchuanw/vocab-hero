import { cn } from '@/lib/utils';
import type { ExampleSentenceProps } from './ExampleSentence.types';

/**
 * ExampleSentence component
 * 
 * Displays a single example sentence with Japanese text, reading (furigana), and translation.
 * Shows a placeholder message when no sentence is provided.
 * 
 * @param sentence - Example sentence data object
 * @param className - Optional CSS class name for styling
 * @param emptyMessage - Custom message to display when no sentence is provided
 * @returns React component
 */
export function ExampleSentence({
  sentence,
  className,
  emptyMessage = 'No example sentences',
}: ExampleSentenceProps) {
  // Display empty state when no sentence is provided
  if (!sentence) {
    return (
      <div className={cn('text-sm text-gray-500 dark:text-gray-400 italic', className)}>
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={cn('space-y-1', className)}>
      {/* Japanese sentence */}
      <p className="text-base text-gray-900 dark:text-gray-100 font-medium">
        {sentence.sentence}
      </p>

      {/* Reading (furigana) - only show if provided */}
      {sentence.reading && (
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {sentence.reading}
        </p>
      )}

      {/* English translation */}
      <p className="text-sm text-gray-700 dark:text-gray-300">
        {sentence.meaning}
      </p>
    </div>
  );
}

