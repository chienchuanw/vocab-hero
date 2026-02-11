import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { ExportFormat } from '@/lib/validations/export';

interface DeleteAllDataInput {
  confirm: string;
}

interface BackupOptions {
  format: ExportFormat;
  groupIds?: string[];
  dateFrom?: string;
  dateTo?: string;
}

interface RestorePreviewInput {
  format: ExportFormat;
  content: string;
}

interface RestoreExecuteInput {
  format: ExportFormat;
  content: string;
  strategy: 'skip' | 'overwrite' | 'merge';
  confirm: string;
}

interface ApiError {
  success: false;
  error: {
    message: string;
  };
}

function downloadFile(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

async function deleteAllData(input: DeleteAllDataInput) {
  const response = await fetch('/api/data/delete-all', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const errorData = (await response.json()) as ApiError;
    throw new Error(errorData.error.message);
  }

  return response.json();
}

async function createBackup(options: BackupOptions) {
  const response = await fetch('/api/backup', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(options),
  });

  if (!response.ok) {
    const errorData = (await response.json()) as ApiError;
    throw new Error(errorData.error.message);
  }

  const jsonData = await response.json();
  const today = new Date().toISOString().split('T')[0];
  const filename = `vocab-hero-backup-${today}.json`;

  const jsonBlob = new Blob([JSON.stringify(jsonData.data, null, 2)], {
    type: 'application/json',
  });
  downloadFile(jsonBlob, filename);
}

async function previewRestore(input: RestorePreviewInput) {
  const response = await fetch('/api/restore/preview', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const errorData = (await response.json()) as ApiError;
    throw new Error(errorData.error.message);
  }

  const result = await response.json();
  return result.data;
}

async function executeRestore(input: RestoreExecuteInput) {
  const response = await fetch('/api/restore/execute', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const errorData = (await response.json()) as ApiError;
    throw new Error(errorData.error.message);
  }

  const result = await response.json();
  return result.data;
}

export function useDeleteAllData() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAllData,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vocabulary'] });
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      queryClient.invalidateQueries({ queryKey: ['progress'] });
      toast.success('All data deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete data');
    },
  });
}

export function useBackup() {
  return useMutation({
    mutationFn: createBackup,
    onSuccess: () => {
      toast.success('Backup created successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create backup');
    },
  });
}

export function useRestorePreview() {
  return useMutation({
    mutationFn: previewRestore,
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to preview restore');
    },
  });
}

export function useRestoreExecute() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: executeRestore,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['vocabulary'] });
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      toast.success(
        `Restore complete! Created: ${data.created}, Updated: ${data.updated}, Skipped: ${data.skipped}`
      );
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to restore data');
    },
  });
}
