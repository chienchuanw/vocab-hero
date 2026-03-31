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
import { useTranslations } from 'next-intl';
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
  const t = useTranslations('vocabulary');
  const tc = useTranslations('common');
  const deleteMutation = useDeleteVocabulary();

  const handleDelete = async () => {
    if (!vocabulary) return;

    try {
      await deleteMutation.mutateAsync(vocabulary.id);
      toast.success(t('toast.deleteSuccess'));
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('toast.deleteError'));
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('deleteDialog.title')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('deleteDialog.description', { word: vocabulary?.word || '' })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{tc('cancel')}</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-destructive hover:bg-destructive/90"
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? tc('deleting') : tc('delete')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
