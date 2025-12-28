import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import type { VocabularyItem } from '@/hooks/useVocabulary';
import { MasteryIndicator } from './MasteryIndicator';
import { calculateMasteryLevel } from '@/lib/srs/mastery';
import { SpeakerButton } from '@/components/features/audio';

/**
 * VocabularyCard component props
 */
export interface VocabularyCardProps {
  vocabulary: VocabularyItem;
  onEdit?: (vocabulary: VocabularyItem) => void;
  onDelete?: (vocabulary: VocabularyItem) => void;
}

/**
 * VocabularyCard component
 * Displays a single vocabulary item card with word, reading, meaning, and mastery level
 */
export function VocabularyCard({ vocabulary, onEdit, onDelete }: VocabularyCardProps) {
  // 計算精熟程度等級
  const masteryLevel = calculateMasteryLevel(
    vocabulary.reviewSchedule
      ? {
          easinessFactor: vocabulary.reviewSchedule.easinessFactor,
          interval: vocabulary.reviewSchedule.interval,
          repetitions: vocabulary.reviewSchedule.repetitions,
        }
      : null
  );

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {/* Word with pronunciation button */}
            <div className="flex items-center gap-2">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {vocabulary.word}
              </h3>
              <SpeakerButton text={vocabulary.word} />
            </div>
            {/* Reading */}
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{vocabulary.reading}</p>
          </div>

          {/* Mastery Indicator */}
          <MasteryIndicator level={masteryLevel} showDescription />
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        {/* Meaning */}
        <p className="text-gray-700 dark:text-gray-300">{vocabulary.meaning}</p>

        {/* Notes (if any) */}
        {vocabulary.notes && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 italic">{vocabulary.notes}</p>
        )}
      </CardContent>

      <CardFooter className="flex justify-between items-center pt-3 border-t">
        {/* Created date */}
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {new Date(vocabulary.createdAt).toLocaleDateString('en-US')}
        </span>

        {/* Action buttons */}
        <div className="flex gap-2">
          {onEdit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(vocabulary)}
              aria-label="Edit word"
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(vocabulary)}
              aria-label="Delete word"
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
