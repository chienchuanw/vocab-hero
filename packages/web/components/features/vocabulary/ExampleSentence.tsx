import { cn } from '@/lib/utils';
import { SpeakerButton } from '@/components/features/audio';
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
  showAudio = true,
}: ExampleSentenceProps) {
  // Display empty state when no sentence is provided
  if (!sentence) {
    return (
      <div className={cn('text-sm text-muted-foreground italic', className)}>
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={cn('space-y-1', className)}>
      {/* Japanese sentence with pronunciation button */}
      <div className="flex items-start gap-2">
        <p className="text-base text-foreground font-medium flex-1">
          {sentence.sentence}
        </p>
        {showAudio && <SpeakerButton text={sentence.sentence} />}
      </div>

      {/* Reading (furigana) - only show if provided */}
      {sentence.reading && (
        <p className="text-sm text-muted-foreground">{sentence.reading}</p>
      )}

      {/* English translation */}
      <p className="text-sm text-foreground">{sentence.meaning}</p>
    </div>
  );
}
