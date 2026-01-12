'use client';

import { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, AlertCircle, Check } from 'lucide-react';
import { useRestorePreview, useRestoreExecute } from '@/hooks/useDataManagement';
import { ExportFormat } from '@/lib/validations/export';

interface RestoreDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type RestoreStep = 'upload' | 'preview' | 'execute';
type DuplicateStrategy = 'skip' | 'overwrite' | 'merge';

const CONFIRMATION_PHRASE = 'RESTORE';

export function RestoreDialog({ open, onOpenChange }: RestoreDialogProps) {
  const [step, setStep] = useState<RestoreStep>('upload');
  const [fileContent, setFileContent] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [strategy, setStrategy] = useState<DuplicateStrategy>('skip');
  const [confirmText, setConfirmText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const restorePreview = useRestorePreview();
  const restoreExecute = useRestoreExecute();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);

    try {
      const text = await file.text();
      setFileContent(text);

      restorePreview.mutate(
        {
          format: ExportFormat.JSON,
          content: text,
        },
        {
          onSuccess: () => {
            setStep('preview');
          },
        }
      );
    } catch (error) {
      console.error('Failed to read file:', error);
    }
  };

  const handleRestore = () => {
    if (confirmText.trim() !== CONFIRMATION_PHRASE) return;

    restoreExecute.mutate(
      {
        format: ExportFormat.JSON,
        content: fileContent,
        strategy,
        confirm: CONFIRMATION_PHRASE,
      },
      {
        onSuccess: () => {
          handleClose();
        },
      }
    );
  };

  const handleClose = () => {
    if (!restorePreview.isPending && !restoreExecute.isPending) {
      onOpenChange(false);
      setTimeout(() => {
        setStep('upload');
        setFileContent('');
        setFileName('');
        setStrategy('skip');
        setConfirmText('');
        restorePreview.reset();
        restoreExecute.reset();
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }, 200);
    }
  };

  const previewData = restorePreview.data;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        {step === 'upload' && (
          <>
            <DialogHeader>
              <DialogTitle>Upload Backup File</DialogTitle>
              <DialogDescription>
                Select a JSON backup file to restore your vocabulary data
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="backup-file">Backup File</Label>
                <Input
                  id="backup-file"
                  type="file"
                  accept=".json"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  disabled={restorePreview.isPending}
                />
              </div>

              {restorePreview.isPending && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analyzing backup file...
                </div>
              )}

              {restorePreview.isError && (
                <div className="flex gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-destructive">Error</p>
                    <p className="text-sm text-muted-foreground">
                      {restorePreview.error?.message || 'Failed to read backup file'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
            </DialogFooter>
          </>
        )}

        {step === 'preview' && previewData && (
          <>
            <DialogHeader>
              <DialogTitle>Preview Restore</DialogTitle>
              <DialogDescription>
                Review what will be restored from <span className="font-mono">{fileName}</span>
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
                <div className="space-y-1">
                  <p className="text-2xl font-bold">{previewData.totalItems}</p>
                  <p className="text-sm text-muted-foreground">Total Items</p>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-green-600">{previewData.newItems.length}</p>
                  <p className="text-sm text-muted-foreground">New Items</p>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-amber-600">{previewData.duplicateCount}</p>
                  <p className="text-sm text-muted-foreground">Duplicates</p>
                </div>
              </div>

              {previewData.duplicateCount > 0 && (
                <div className="space-y-3">
                  <Label>How should duplicates be handled?</Label>
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => setStrategy('skip')}
                      className={`w-full flex items-start gap-3 p-3 border-2 rounded-lg text-left transition-colors ${
                        strategy === 'skip'
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div
                        className={`flex-shrink-0 mt-1 h-4 w-4 rounded-full border-2 flex items-center justify-center ${
                          strategy === 'skip'
                            ? 'border-primary bg-primary'
                            : 'border-muted-foreground'
                        }`}
                      >
                        {strategy === 'skip' && (
                          <Check className="h-3 w-3 text-primary-foreground" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Skip duplicates</p>
                        <p className="text-xs text-muted-foreground">
                          Only import new vocabulary items. Existing items remain unchanged.
                        </p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setStrategy('overwrite')}
                      className={`w-full flex items-start gap-3 p-3 border-2 rounded-lg text-left transition-colors ${
                        strategy === 'overwrite'
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div
                        className={`flex-shrink-0 mt-1 h-4 w-4 rounded-full border-2 flex items-center justify-center ${
                          strategy === 'overwrite'
                            ? 'border-primary bg-primary'
                            : 'border-muted-foreground'
                        }`}
                      >
                        {strategy === 'overwrite' && (
                          <Check className="h-3 w-3 text-primary-foreground" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Overwrite duplicates</p>
                        <p className="text-xs text-muted-foreground">
                          Replace existing items completely with backup data.
                        </p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setStrategy('merge')}
                      className={`w-full flex items-start gap-3 p-3 border-2 rounded-lg text-left transition-colors ${
                        strategy === 'merge'
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div
                        className={`flex-shrink-0 mt-1 h-4 w-4 rounded-full border-2 flex items-center justify-center ${
                          strategy === 'merge'
                            ? 'border-primary bg-primary'
                            : 'border-muted-foreground'
                        }`}
                      >
                        {strategy === 'merge' && (
                          <Check className="h-3 w-3 text-primary-foreground" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Merge duplicates</p>
                        <p className="text-xs text-muted-foreground">
                          Keep existing data but add new groups from backup.
                        </p>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={() => setStep('execute')}>Continue to Restore</Button>
            </DialogFooter>
          </>
        )}

        {step === 'execute' && previewData && (
          <>
            <DialogHeader>
              <DialogTitle>Confirm Restore</DialogTitle>
              <DialogDescription>
                This will restore {previewData.newItems.length} new items
                {previewData.duplicateCount > 0 &&
                  ` and handle ${previewData.duplicateCount} duplicates`}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="confirm-restore">
                  Type <span className="font-mono font-bold">{CONFIRMATION_PHRASE}</span> to confirm
                </Label>
                <Input
                  id="confirm-restore"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder={CONFIRMATION_PHRASE}
                  disabled={restoreExecute.isPending}
                  className="font-mono"
                />
              </div>

              {!confirmText.trim() && confirmText.length > 0 && (
                <p className="text-sm text-destructive">
                  Please type exactly: {CONFIRMATION_PHRASE}
                </p>
              )}

              {restoreExecute.isError && (
                <div className="flex gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-destructive">Error</p>
                    <p className="text-sm text-muted-foreground">
                      {restoreExecute.error?.message || 'Failed to restore data'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setStep('preview')}
                disabled={restoreExecute.isPending}
              >
                Back
              </Button>
              <Button
                onClick={handleRestore}
                disabled={confirmText.trim() !== CONFIRMATION_PHRASE || restoreExecute.isPending}
              >
                {restoreExecute.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Restoring...
                  </>
                ) : (
                  'Restore Data'
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
