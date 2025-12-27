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
import type { Group } from '@/hooks/useGroups';

/**
 * EditGroupDialog 元件的 Props
 */
export interface EditGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group: Group | null;
}

/**
 * EditGroupDialog 元件
 * 編輯群組的 Dialog 彈窗
 */
export function EditGroupDialog({ open, onOpenChange, group }: EditGroupDialogProps) {
  const updateMutation = useUpdateGroup();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  useEffect(() => {
    if (group) {
      setFormData({
        name: group.name,
        description: group.description || '',
      });
    }
  }, [group]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!group) return;

    try {
      await updateMutation.mutateAsync({
        id: group.id,
        data: formData,
      });
      toast.success('群組更新成功！');
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '更新失敗，請稍後再試');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>編輯群組</DialogTitle>
          <DialogDescription>修改群組資訊</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="edit-group-name">群組名稱</Label>
            <Input
              id="edit-group-name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="edit-group-description">描述</Label>
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
