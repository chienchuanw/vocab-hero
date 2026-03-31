'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useDeleteGroup } from '@/hooks/useGroupMutations';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import type { Group } from '@/hooks/useGroups';

/**
 * DeleteGroupDialog component props
 */
export interface DeleteGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group: Group | null;
}

/**
 * DeleteGroupDialog component
 * Confirmation dialog for deleting group
 */
export function DeleteGroupDialog({ open, onOpenChange, group }: DeleteGroupDialogProps) {
  const t = useTranslations('groups');
  const tc = useTranslations('common');
  const deleteMutation = useDeleteGroup();

  const handleDelete = async () => {
    if (!group) return;

    try {
      await deleteMutation.mutateAsync(group.id);
      toast.success(t('toast.deleteSuccess'));
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('toast.deleteError'));
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('deleteDialog.title')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('deleteDialog.description', { group: group?.name || '' })}
            {group && group.vocabularyCount > 0 && (
              <span className="block mt-2 text-warning font-medium">
                {t('deleteDialog.warning', { count: group.vocabularyCount })}
              </span>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{tc('cancel')}</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-destructive hover:bg-destructive/90"
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? tc('deleting') : tc('delete')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
