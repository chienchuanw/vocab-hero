'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useDeleteGroup } from '@/hooks/useGroupMutations';
import { toast } from 'sonner';
import type { Group } from '@/hooks/useGroups';

/**
 * DeleteGroupDialog component props
 */
export interface DeleteGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group: Group | null;
}

/**
 * DeleteGroupDialog component
 * Confirmation dialog for deleting group
 */
export function DeleteGroupDialog({
  open,
  onOpenChange,
  group,
}: DeleteGroupDialogProps) {
  const deleteMutation = useDeleteGroup();

  const handleDelete = async () => {
    if (!group) return;

    try {
      await deleteMutation.mutateAsync(group.id);
      toast.success('Group deleted successfully');
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete, please try again');
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm Delete</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete "{group?.name}"? 
            {group && group.vocabularyCount > 0 && (
              <span className="block mt-2 text-amber-600 dark:text-amber-500 font-medium">
                This group contains {group.vocabularyCount} vocabulary {group.vocabularyCount === 1 ? 'item' : 'items'}. 
                The vocabulary items will not be deleted, only removed from this group.
              </span>
            )}
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-red-600 hover:bg-red-700"
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

