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
 * DeleteConfirmationDialog 元件的 Props
 */
export interface DeleteConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vocabulary: VocabularyItem | null;
}

/**
 * DeleteConfirmationDialog 元件
 * 刪除確認的 Dialog 彈窗
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
      toast.success('單字已刪除');
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '刪除失敗，請稍後再試');
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>確認刪除</AlertDialogTitle>
          <AlertDialogDescription>
            確定要刪除單字「{vocabulary?.word}」嗎？此操作無法復原。
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>取消</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-red-600 hover:bg-red-700"
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? '刪除中...' : '刪除'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

