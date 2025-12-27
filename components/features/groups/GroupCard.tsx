import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, BookOpen } from 'lucide-react';
import type { Group } from '@/hooks/useGroups';

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
  return (
    <Card
      className="hover:shadow-lg transition-shadow duration-200 cursor-pointer"
      onClick={() => onClick?.(group)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{group.name}</h3>
            {group.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                {group.description}
              </p>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-gray-500" />
          <Badge variant="secondary">
            {group.vocabularyCount} {group.vocabularyCount === 1 ? 'word' : 'words'}
          </Badge>
        </div>
      </CardContent>

      <CardFooter className="flex justify-between items-center pt-3 border-t">
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {new Date(group.createdAt).toLocaleDateString('en-US')}
        </span>

        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          {onEdit && (
            <Button variant="ghost" size="sm" onClick={() => onEdit(group)} aria-label="Edit group">
              <Edit className="h-4 w-4" />
            </Button>
          )}
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(group)}
              aria-label="Delete group"
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
