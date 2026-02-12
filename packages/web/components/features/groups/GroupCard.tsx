import { useTranslations } from 'next-intl';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, BookOpen } from 'lucide-react';
import { format } from 'date-fns';
import type { Group } from '@/hooks/useGroups';
import { useDroppable } from '@dnd-kit/core';

/**
 * GroupCard component props
 */
export interface GroupCardProps {
  group: Group;
  onEdit?: (group: Group) => void;
  onDelete?: (group: Group) => void;
  onClick?: (group: Group) => void;
}

/**
 * GroupCard component
 * Displays a single group card with name, description, and vocabulary count
 */
export function GroupCard({ group, onEdit, onDelete, onClick }: GroupCardProps) {
   const t = useTranslations('groups');
   const { setNodeRef, isOver } = useDroppable({
    id: `group-${group.id}`,
    data: {
      type: 'group',
      group,
    },
  });

  return (
    <Card
      ref={setNodeRef}
      data-testid="group-drop-zone"
      data-drag-over={isOver}
      className={`hover:shadow-lg transition-all duration-200 cursor-pointer ${isOver ? 'ring-2 ring-primary bg-primary/5' : ''}`}
      onClick={() => onClick?.(group)}
    >
       <CardHeader className="pb-3">
         <div className="flex items-start justify-between">
           <div className="flex-1">
             <h3 className="text-xl font-bold text-foreground">{group.name}</h3>
             {group.description && (
               <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                 {group.description}
               </p>
             )}
           </div>
         </div>
       </CardHeader>

        <CardContent className="pb-3">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-muted-foreground" />
            <Badge variant="secondary">
              {t('wordCount', { count: group.vocabularyCount })}
            </Badge>
          </div>
        </CardContent>

       <CardFooter className="flex justify-between items-center pt-3 border-t">
         <span className="text-xs text-muted-foreground">
           {format(new Date(group.createdAt), 'yyyy-MM-dd')}
         </span>

         <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
           {onEdit && (
             <Button variant="ghost" size="sm" onClick={() => onEdit(group)} aria-label={t('editLabel')}>
               <Edit className="h-4 w-4" />
             </Button>
           )}
           {onDelete && (
             <Button
               variant="ghost"
               size="sm"
               onClick={() => onDelete(group)}
               aria-label={t('deleteLabel')}
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
