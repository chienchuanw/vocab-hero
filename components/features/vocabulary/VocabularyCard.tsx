import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import type { VocabularyItem } from '@/hooks/useVocabulary';

/**
 * VocabularyCard component props
 */
export interface VocabularyCardProps {
  vocabulary: VocabularyItem;
  onEdit?: (vocabulary: VocabularyItem) => void;
  onDelete?: (vocabulary: VocabularyItem) => void;
}

/**
 * Get mastery level color based on score
 */
function getMasteryColor(mastery: number): string {
  if (mastery >= 80) return 'bg-green-500';
  if (mastery >= 60) return 'bg-blue-500';
  if (mastery >= 40) return 'bg-yellow-500';
  if (mastery >= 20) return 'bg-orange-500';
  return 'bg-red-500';
}

/**
 * Get mastery level label based on score
 */
function getMasteryLabel(mastery: number): string {
  if (mastery >= 80) return 'Mastered';
  if (mastery >= 60) return 'Familiar';
  if (mastery >= 40) return 'Learning';
  if (mastery >= 20) return 'Beginner';
  return 'Not Started';
}

/**
 * VocabularyCard component
 * Displays a single vocabulary item card with word, reading, meaning, and mastery level
 */
export function VocabularyCard({ vocabulary, onEdit, onDelete }: VocabularyCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {/* Word */}
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {vocabulary.word}
            </h3>
            {/* Reading */}
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{vocabulary.reading}</p>
          </div>

          {/* Mastery Badge */}
          <Badge className={`${getMasteryColor(vocabulary.mastery)} text-white`}>
            {getMasteryLabel(vocabulary.mastery)}
          </Badge>
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
