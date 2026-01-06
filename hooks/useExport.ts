import { useMutation } from '@tanstack/react-query';
import type { ExportOptions } from '@/lib/validations/export';
import { toast } from 'sonner';

interface ExportError {
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

async function exportVocabulary(options: ExportOptions) {
  const response = await fetch('/api/export', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(options),
  });

  if (!response.ok) {
    const errorData = (await response.json()) as ExportError;
    throw new Error(errorData.error.message);
  }

  const today = new Date().toISOString().split('T')[0];
  const extension = options.format;
  const filename = `vocab-hero-export-${today}.${extension}`;

  if (options.format === 'json') {
    const jsonData = await response.json();
    const jsonBlob = new Blob([JSON.stringify(jsonData.data, null, 2)], {
      type: 'application/json',
    });
    downloadFile(jsonBlob, filename);
  } else {
    const csvText = await response.text();
    const csvBlob = new Blob([csvText], { type: 'text/csv;charset=utf-8;' });
    downloadFile(csvBlob, filename);
  }
}

export function useExportVocabulary() {
  return useMutation({
    mutationFn: exportVocabulary,
    onSuccess: () => {
      toast.success('Export successful!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to export vocabulary');
    },
  });
}
