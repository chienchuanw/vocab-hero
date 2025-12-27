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

/**
 * AddGroupDialog 元件的 Props
 */
export interface AddGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * AddGroupDialog 元件
 * 新增群組的 Dialog 彈窗
 */
export function AddGroupDialog({ open, onOpenChange }: AddGroupDialogProps) {
  const createMutation = useCreateGroup();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('請輸入群組名稱');
      return;
    }

    try {
      await createMutation.mutateAsync(formData);
      toast.success('群組新增成功！');
      setFormData({ name: '', description: '' });
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '新增失敗，請稍後再試');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>新增群組</DialogTitle>
          <DialogDescription>建立新的單字群組來組織你的學習內容</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="group-name">群組名稱 *</Label>
            <Input
              id="group-name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="例：JLPT N5 單字"
              required
            />
          </div>
          <div>
            <Label htmlFor="group-description">描述（選填）</Label>
            <Textarea
              id="group-description"
              value={formData.description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="群組的說明或用途..."
              rows={3}
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              取消
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? '新增中...' : '新增群組'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
