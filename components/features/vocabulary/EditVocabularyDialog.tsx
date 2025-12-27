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
import { useUpdateVocabulary } from '@/hooks/useVocabularyMutations';
import { toast } from 'sonner';
import type { VocabularyItem } from '@/hooks/useVocabulary';

/**
 * EditVocabularyDialog 元件的 Props
 */
export interface EditVocabularyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vocabulary: VocabularyItem | null;
}

/**
 * EditVocabularyDialog 元件
 * 編輯單字的 Dialog 彈窗
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

  // 當 vocabulary 改變時更新表單資料
  useEffect(() => {
    if (vocabulary) {
      setFormData({
        word: vocabulary.word,
        reading: vocabulary.reading,
        meaning: vocabulary.meaning,
        notes: vocabulary.notes || '',
      });
    }
  }, [vocabulary]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!vocabulary) return;

    try {
      await updateMutation.mutateAsync({
        id: vocabulary.id,
        data: formData,
      });
      toast.success('單字更新成功！');
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '更新失敗，請稍後再試');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>編輯單字</DialogTitle>
          <DialogDescription>修改單字資訊</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="edit-word">單字</Label>
            <Input
              id="edit-word"
              value={formData.word}
              onChange={(e) => setFormData({ ...formData, word: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="edit-reading">讀音</Label>
            <Input
              id="edit-reading"
              value={formData.reading}
              onChange={(e) => setFormData({ ...formData, reading: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="edit-meaning">意思</Label>
            <Input
              id="edit-meaning"
              value={formData.meaning}
              onChange={(e) => setFormData({ ...formData, meaning: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="edit-notes">筆記</Label>
            <Textarea
              id="edit-notes"
              value={formData.notes}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              rows={3}
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              取消
            </Button>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? '更新中...' : '更新'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
