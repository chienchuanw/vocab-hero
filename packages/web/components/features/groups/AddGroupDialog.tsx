'use client';

import { useState } from 'react';
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
import { useCreateGroup } from '@/hooks/useGroupMutations';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

/**
 * AddGroupDialog component props
 */
export interface AddGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * AddGroupDialog component
 * Dialog for adding new group
 */
export function AddGroupDialog({ open, onOpenChange }: AddGroupDialogProps) {
  const t = useTranslations('groups');
  const tc = useTranslations('common');
  const createMutation = useCreateGroup();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error(t('form.nameError'));
      return;
    }

    try {
      await createMutation.mutateAsync(formData);
      toast.success(t('toast.addSuccess'));
      setFormData({ name: '', description: '' });
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('toast.addError'));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t('addDialog.title')}</DialogTitle>
          <DialogDescription>{t('addDialog.description')}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="group-name">{t('form.name')}</Label>
            <Input
              id="group-name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder={t('form.namePlaceholder')}
              required
            />
          </div>
          <div>
            <Label htmlFor="group-description">{t('form.description')}</Label>
            <Textarea
              id="group-description"
              value={formData.description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder={t('form.descriptionPlaceholder')}
              rows={3}
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {tc('cancel')}
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? tc('adding') : tc('add')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
