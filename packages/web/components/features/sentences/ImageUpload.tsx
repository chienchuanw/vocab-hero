'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Upload, X, Image as ImageIcon, AlertCircle, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
  onImagesSelected: (files: File[]) => void;
  maxFiles?: number;
  maxSizeBytes?: number;
  isProcessing?: boolean;
  className?: string;
}

export function ImageUpload({
  onImagesSelected,
  maxFiles = 10,
  maxSizeBytes = 5 * 1024 * 1024, // 5MB
  isProcessing = false,
  className,
}: ImageUploadProps) {
  const t = useTranslations('sentences.upload');
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cleanup previews on unmount
  useEffect(() => {
    return () => {
      previews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previews]);

  const addFiles = useCallback(
    (newFiles: File[]) => {
      setError(null);

      if (files.length + newFiles.length > maxFiles) {
        setError(t('tooMany', { max: maxFiles }));
        return;
      }

      const validFiles: File[] = [];
      let validationError: string | null = null;

      for (const file of newFiles) {
        // 驗證檔案類型和大小
        if (!file.type.startsWith('image/')) {
          validationError = t('invalidType');
          break;
        }
        if (file.size > maxSizeBytes) {
          validationError = t('tooLarge', { name: file.name, size: maxSizeBytes / (1024 * 1024) });
          break;
        }
        validFiles.push(file);
      }

      if (validationError) {
        setError(validationError);
        return;
      }

      const newPreviews = validFiles.map((file) => URL.createObjectURL(file));

      setFiles((prev) => [...prev, ...validFiles]);
      setPreviews((prev) => [...prev, ...newPreviews]);
    },
    [files.length, maxFiles, maxSizeBytes, t]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isProcessing) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (isProcessing) return;

    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length > 0) {
      addFiles(droppedFiles);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      addFiles(selectedFiles);
      // Reset input so same file can be selected again if removed
      e.target.value = '';
    }
  };

  const removeFile = (index: number) => {
    if (isProcessing) return;

    const url = previews[index];
    if (url) {
      URL.revokeObjectURL(url);
    }

    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
    setError(null);
  };

  const handleProcess = () => {
    if (files.length > 0 && !isProcessing) {
      onImagesSelected(files);
    }
  };

  const triggerFileInput = () => {
    if (!isProcessing) {
      fileInputRef.current?.click();
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className={cn('space-y-4', className)}>
      <Card
        className={cn(
          'border-2 border-dashed transition-colors cursor-pointer',
          isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25',
          isProcessing && 'opacity-50 cursor-not-allowed',
          error && 'border-destructive/50'
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={triggerFileInput}
        data-testid="image-upload-dropzone"
      >
        <CardContent className="flex flex-col items-center justify-center py-10 text-center space-y-4">
          <div className="p-4 rounded-full bg-muted">
            <Upload className="w-8 h-8 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <h3 className="font-semibold text-lg">{t('title')}</h3>
            <p className="text-sm text-muted-foreground">{t('dropzone')}</p>
          </div>
          <div className="text-xs text-muted-foreground space-y-1">
            <p>{t('maxFiles', { max: maxFiles })}</p>
            <p>{t('maxSize', { size: maxSizeBytes / (1024 * 1024) })}</p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFileSelect}
            disabled={isProcessing}
            data-testid="image-upload-input"
          />
        </CardContent>
      </Card>

      {error && (
        <div
          className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-md"
          data-testid="image-upload-error"
        >
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {files.length > 0 && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {files.map((file, index) => (
              <div key={`${file.name}-${index}`} className="relative group aspect-square">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previews[index]}
                  alt={file.name}
                  className="w-full h-full object-cover rounded-lg border bg-muted"
                  data-testid="image-preview"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                  <Button
                    variant="destructive"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(index);
                    }}
                    disabled={isProcessing}
                    data-testid="image-remove"
                  >
                    <X className="w-4 h-4" />
                    <span className="sr-only">{t('remove')}</span>
                  </Button>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] p-1 rounded-b-lg px-2 flex justify-between items-center">
                  <span className="truncate mr-1">{file.name}</span>
                  <span className="shrink-0 opacity-80">{formatSize(file.size)}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end">
            <Button onClick={handleProcess} disabled={isProcessing} className="w-full sm:w-auto">
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t('processing')}
                </>
              ) : (
                <>
                  <ImageIcon className="w-4 h-4 mr-2" />
                  {t('process')}
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
