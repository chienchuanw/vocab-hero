'use client';

import { useTranslations } from 'next-intl';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AddVocabularyForm } from './AddVocabularyForm';
import { useCreateVocabulary, type CreateVocabularyInput } from '@/hooks/useVocabularyMutations';
import { toast } from 'sonner';

/**
 * AddVocabularyDialog component props
 */
export interface AddVocabularyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * AddVocabularyDialog component
 * Dialog for adding new vocabulary
 */
export function AddVocabularyDialog({ open, onOpenChange }: AddVocabularyDialogProps) {
  const t = useTranslations('vocabulary');
  const createMutation = useCreateVocabulary();

  const handleSubmit = async (data: CreateVocabularyInput) => {
    try {
      await createMutation.mutateAsync(data);
      toast.success(t('toast.addSuccess'));
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('toast.addError'));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t('addWordDialog.title')}</DialogTitle>
          <DialogDescription>{t('addWordDialog.description')}</DialogDescription>
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
