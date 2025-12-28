'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ExampleSentenceInput } from './ExampleSentenceInput';
import { useUpdateVocabulary } from '@/hooks/useVocabularyMutations';
import { toast } from 'sonner';
import type { VocabularyItem } from '@/hooks/useVocabulary';
import type { ExampleSentenceData } from './ExampleSentence.types';

/**
 * EditVocabularyDialog component props
 */
export interface EditVocabularyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vocabulary: VocabularyItem | null;
}

/**
 * EditVocabularyDialog component
 * Dialog for editing vocabulary
 */
export function EditVocabularyDialog({
  open,
  onOpenChange,
  vocabulary,
}: EditVocabularyDialogProps) {
  const updateMutation = useUpdateVocabulary();
  const [formData, setFormData] = useState({
    word: '',
    reading: '',
    meaning: '',
    notes: '',
  });
  const [exampleSentences, setExampleSentences] = useState<ExampleSentenceData[]>([]);

  // Update form data when vocabulary changes
  useEffect(() => {
    if (vocabulary) {
      setFormData({
        word: vocabulary.word,
        reading: vocabulary.reading,
        meaning: vocabulary.meaning,
        notes: vocabulary.notes || '',
      });

      // Convert example sentences to editable format
      const sentences: ExampleSentenceData[] =
        vocabulary.exampleSentences?.map((s) => ({
          id: s.id,
          sentence: s.sentence,
          reading: s.reading,
          meaning: s.meaning,
          order: s.order,
        })) || [];
      setExampleSentences(sentences);
    }
  }, [vocabulary]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!vocabulary) return;

    try {
      // Convert example sentences to API format
      const exampleSentencesData = exampleSentences
        .filter((s) => s.sentence.trim() && s.meaning.trim())
        .map((s, index) => ({
          sentence: s.sentence,
          reading: s.reading,
          meaning: s.meaning,
          order: index,
        }));

      await updateMutation.mutateAsync({
        id: vocabulary.id,
        data: {
          ...formData,
          exampleSentences: exampleSentencesData.length > 0 ? exampleSentencesData : undefined,
        },
      });
      toast.success('Word updated successfully!');
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update, please try again');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Word</DialogTitle>
          <DialogDescription>Modify word information</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="edit-word">Word</Label>
            <Input
              id="edit-word"
              value={formData.word}
              onChange={(e) => setFormData({ ...formData, word: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="edit-reading">Reading</Label>
            <Input
              id="edit-reading"
              value={formData.reading}
              onChange={(e) => setFormData({ ...formData, reading: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="edit-meaning">Meaning</Label>
            <Input
              id="edit-meaning"
              value={formData.meaning}
              onChange={(e) => setFormData({ ...formData, meaning: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="edit-notes">Notes</Label>
            <Textarea
              id="edit-notes"
              value={formData.notes}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              rows={3}
            />
          </div>

          {/* Example Sentences */}
          <ExampleSentenceInput sentences={exampleSentences} onChange={setExampleSentences} />

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? 'Updating...' : 'Update'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
