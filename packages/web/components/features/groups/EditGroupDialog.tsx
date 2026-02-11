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
import { useUpdateGroup } from '@/hooks/useGroupMutations';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import type { Group } from '@/hooks/useGroups';

/**
 * EditGroupDialog component props
 */
export interface EditGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group: Group | null;
}

/**
 * EditGroupDialog component
 * Dialog for editing group
 */
export function EditGroupDialog({ open, onOpenChange, group }: EditGroupDialogProps) {
  const t = useTranslations('groups');
  const tc = useTranslations('common');
  const updateMutation = useUpdateGroup();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  useEffect(() => {
    if (open && group) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        name: group.name,
        description: group.description || '',
      });
    }
  }, [open, group]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!group) return;

    try {
      await updateMutation.mutateAsync({
        id: group.id,
        data: formData,
      });
      toast.success(t('toast.updateSuccess'));
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('toast.updateError'));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t('editDialog.title')}</DialogTitle>
          <DialogDescription>{t('editDialog.description')}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="edit-group-name">{t('form.name')}</Label>
            <Input
              id="edit-group-name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="edit-group-description">{t('form.description')}</Label>
            <Textarea
              id="edit-group-description"
              value={formData.description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={3}
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {tc('cancel')}
            </Button>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? tc('updating') : tc('update')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
