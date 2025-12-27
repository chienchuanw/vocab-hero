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
  const createMutation = useCreateGroup();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Please enter group name');
      return;
    }

    try {
      await createMutation.mutateAsync(formData);
      toast.success('Group added successfully!');
      setFormData({ name: '', description: '' });
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to add group, please try again');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Group</DialogTitle>
          <DialogDescription>
            Create a new vocabulary group to organize your learning content
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="group-name">Group Name *</Label>
            <Input
              id="group-name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., JLPT N5 Vocabulary"
              required
            />
          </div>
          <div>
            <Label htmlFor="group-description">Description (Optional)</Label>
            <Textarea
              id="group-description"
              value={formData.description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Group description or purpose..."
              rows={3}
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Adding...' : 'Add Group'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
