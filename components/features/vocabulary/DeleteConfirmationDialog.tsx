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
import { useDeleteVocabulary } from '@/hooks/useVocabularyMutations';
import { toast } from 'sonner';
import type { VocabularyItem } from '@/hooks/useVocabulary';

/**
 * DeleteConfirmationDialog component props
 */
export interface DeleteConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vocabulary: VocabularyItem | null;
}

/**
 * DeleteConfirmationDialog component
 * Confirmation dialog for deleting vocabulary
 */
export function DeleteConfirmationDialog({
  open,
  onOpenChange,
  vocabulary,
}: DeleteConfirmationDialogProps) {
  const deleteMutation = useDeleteVocabulary();

  const handleDelete = async () => {
    if (!vocabulary) return;

    try {
      await deleteMutation.mutateAsync(vocabulary.id);
      toast.success('Word deleted successfully');
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
            Are you sure you want to delete "{vocabulary?.word}"? This action cannot be undone.
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
