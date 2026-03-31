import { memo } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, GripVertical, MoreHorizontal } from 'lucide-react';
import { format } from 'date-fns';
import type { VocabularyItem } from '@/hooks/useVocabulary';
import { MasteryIndicator } from './MasteryIndicator';
import { calculateMasteryLevel } from '@/lib/srs/mastery';
import { SpeakerButton } from '@/components/features/audio';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuTrigger,
 } from '@/components/ui/dropdown-menu';

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
export const VocabularyCard = memo(function VocabularyCard({ vocabulary, onEdit, onDelete }: VocabularyCardProps) {
   const t = useTranslations('vocabulary');
   const masteryLevel = calculateMasteryLevel(
    vocabulary.reviewSchedule
      ? {
          easinessFactor: vocabulary.reviewSchedule.easinessFactor,
          interval: vocabulary.reviewSchedule.interval,
          repetitions: vocabulary.reviewSchedule.repetitions,
        }
      : null
  );

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `vocabulary-${vocabulary.id}`,
    data: {
      type: 'vocabulary',
      vocabulary,
    },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  const isDue = vocabulary.reviewSchedule?.nextReviewDate
    ? new Date(vocabulary.reviewSchedule.nextReviewDate) <= new Date()
    : false;

  return (
    <Card
      ref={setNodeRef}
      style={style}
      data-testid="vocabulary-card"
      data-dragging={isDragging}
      className="group card-shadow card-shadow-hover"
      {...attributes}
      {...listeners}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-1 flex-1">
            <GripVertical
              className="h-5 w-5 text-muted-foreground/50 shrink-0 cursor-grab"
              data-testid="drag-handle"
            />
            <div className="flex-1">
              {/* Word with pronunciation button */}
              <div className="flex items-center gap-2">
                <h3 className="text-2xl font-bold text-foreground">
                  {vocabulary.word}
                </h3>
                <SpeakerButton text={vocabulary.word} />
              </div>
              {/* Reading */}
              <p className="text-sm text-muted-foreground mt-1">{vocabulary.reading}</p>
            </div>
          </div>

           {/* Mastery Indicator + Due Badge */}
           <div className="flex items-center gap-2">
             {isDue && (
               <Badge variant="destructive" className="text-xs">
                 {t('card.due')}
               </Badge>
             )}
             <MasteryIndicator level={masteryLevel} showDescription />
           </div>
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        {/* Meaning */}
        <p className="text-foreground">{vocabulary.meaning}</p>

        {/* Notes (if any) */}
        {vocabulary.notes && (
          <p className="text-sm text-muted-foreground mt-2 italic">{vocabulary.notes}</p>
        )}
      </CardContent>

      <CardFooter className="flex justify-between items-center pt-3 border-t">
        {/* Created date */}
        <span className="text-xs text-muted-foreground">
          {format(new Date(vocabulary.createdAt), 'yyyy-MM-dd')}
        </span>

         {/* Desktop: hover-reveal action buttons */}
         {(onEdit || onDelete) && (
           <div className="hidden md:flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
             {onEdit && (
               <Button
                 variant="ghost"
                 size="sm"
                 onClick={() => onEdit(vocabulary)}
                 aria-label={t('card.editLabel')}
               >
                 <Edit className="h-4 w-4" />
               </Button>
             )}
             {onDelete && (
               <Button
                 variant="ghost"
                 size="sm"
                 onClick={() => onDelete(vocabulary)}
                 aria-label={t('card.deleteLabel')}
                 className="text-destructive hover:text-destructive hover:bg-destructive/10"
               >
                 <Trash2 className="h-4 w-4" />
               </Button>
             )}
           </div>
         )}

         {/* Mobile: DropdownMenu fallback */}
         {(onEdit || onDelete) && (
           <div className="md:hidden">
             <DropdownMenu>
               <DropdownMenuTrigger asChild>
                 <Button variant="ghost" size="sm" aria-label={t('card.actionsLabel')}>
                   <MoreHorizontal className="h-4 w-4" />
                 </Button>
               </DropdownMenuTrigger>
               <DropdownMenuContent align="end">
                 {onEdit && (
                   <DropdownMenuItem onClick={() => onEdit(vocabulary)}>
                     <Edit className="h-4 w-4 mr-2" />
                     {t('card.edit')}
                   </DropdownMenuItem>
                 )}
                 {onDelete && (
                   <DropdownMenuItem
                     onClick={() => onDelete(vocabulary)}
                     className="text-destructive"
                   >
                     <Trash2 className="h-4 w-4 mr-2" />
                     {t('card.delete')}
                   </DropdownMenuItem>
                 )}
               </DropdownMenuContent>
             </DropdownMenu>
           </div>
         )}
      </CardFooter>
    </Card>
  );
});
