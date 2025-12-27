'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AddVocabularyForm } from './AddVocabularyForm';
import { useCreateVocabulary } from '@/hooks/useVocabularyMutations';
import { toast } from 'sonner';

/**
 * AddVocabularyDialog 元件的 Props
 */
export interface AddVocabularyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * AddVocabularyDialog 元件
 * 新增單字的 Dialog 彈窗
 */
export function AddVocabularyDialog({ open, onOpenChange }: AddVocabularyDialogProps) {
  const createMutation = useCreateVocabulary();

  const handleSubmit = async (data: any) => {
    try {
      await createMutation.mutateAsync(data);
      toast.success('單字新增成功！');
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '新增失敗，請稍後再試');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>新增單字</DialogTitle>
          <DialogDescription>填寫單字資訊，建立新的學習項目</DialogDescription>
        </DialogHeader>
        <AddVocabularyForm
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
          isLoading={createMutation.isPending}
        />
      </DialogContent>
    </Dialog>
  );
}

