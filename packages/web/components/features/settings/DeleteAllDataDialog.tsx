'use client';

import { useState } from 'react';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { useDeleteAllData } from '@/hooks/useDataManagement';
import { useTranslations } from 'next-intl';

interface DeleteAllDataDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CONFIRMATION_PHRASE = 'DELETE ALL';

export function DeleteAllDataDialog({ open, onOpenChange }: DeleteAllDataDialogProps) {
  const t = useTranslations('settings');
  const tc = useTranslations('common');
  const [confirmText, setConfirmText] = useState('');

  const deleteAllData = useDeleteAllData();

  const deleteItems = [
    t('deleteItems.vocabulary'),
    t('deleteItems.groups'),
    t('deleteItems.sentences'),
    t('deleteItems.sessions'),
    t('deleteItems.progress'),
    t('deleteItems.schedules'),
  ];

  const confirmMatches = confirmText.trim() === CONFIRMATION_PHRASE;
  const canDelete = confirmMatches && !deleteAllData.isPending;

  const handleDelete = () => {
    if (canDelete) {
      deleteAllData.mutate(
        { confirm: CONFIRMATION_PHRASE },
        {
          onSuccess: () => {
            onOpenChange(false);
            setConfirmText('');
          },
        }
      );
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!deleteAllData.isPending) {
      onOpenChange(newOpen);
      if (!newOpen) {
        setConfirmText('');
      }
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent className="max-w-2xl">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 p-2 bg-destructive/10 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <AlertDialogTitle className="text-2xl">{t('deleteAllData')}</AlertDialogTitle>
              <AlertDialogDescription className="mt-1">
                {t('deleteAllDataDesc')}
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-3">
            <p className="text-sm font-medium">{t('deleteWarning')}</p>
            <ul className="space-y-2 p-4 bg-muted/50 rounded-lg list-disc list-inside">
              {deleteItems.map((item, index) => (
                <li key={index} className="text-sm text-muted-foreground">
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="confirm-text">{t('deleteConfirmPrompt')}</Label>
              <Input
                id="confirm-text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder={t('deleteConfirmText')}
                disabled={deleteAllData.isPending}
                className="font-mono"
              />
            </div>
            {!confirmMatches && confirmText.length > 0 && (
              <p className="text-sm text-destructive">{t('deleteConfirmError')}</p>
            )}
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteAllData.isPending}>{tc('cancel')}</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            disabled={!canDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleteAllData.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {tc('deleting')}
              </>
            ) : (
              t('deleteAllData')
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
