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
  const createMutation = useCreateVocabulary();

  const handleSubmit = async (data: any) => {
    try {
      await createMutation.mutateAsync(data);
      toast.success('Word added successfully!');
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to add word, please try again');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Word</DialogTitle>
          <DialogDescription>
            Fill in word information to create a new learning item
          </DialogDescription>
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
