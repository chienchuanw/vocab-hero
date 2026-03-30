import React, { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Save, Trash2, CheckCheck } from 'lucide-react';
import Image from 'next/image';

export interface OcrPreviewItem {
  id: string;
  japanese: string;
  english: string;
  imageUrl?: string;
  serverImageUrl?: string;
  isProcessing?: boolean;
}

export interface OcrPreviewProps {
  items: OcrPreviewItem[];
  onSave: (item: { japanese: string; english: string; notes?: string; imageUrl?: string }) => void;
  onDiscard: (id: string) => void;
  onSaveAll: (
    items: { japanese: string; english: string; notes?: string; imageUrl?: string }[]
  ) => void;
  className?: string;
}

interface DraftItem {
  japanese?: string;
  english?: string;
  notes?: string;
}

export function OcrPreview({ items, onSave, onDiscard, onSaveAll, className }: OcrPreviewProps) {
  const t = useTranslations('sentences.preview');
  const [drafts, setDrafts] = useState<Record<string, DraftItem>>({});

  const getDraft = useCallback(
    (item: OcrPreviewItem) => {
      const draft = drafts[item.id] || {};
      return {
        japanese: draft.japanese ?? item.japanese,
        english: draft.english ?? item.english,
        notes: draft.notes ?? '',
        imageUrl: item.serverImageUrl,
      };
    },
    [drafts]
  );

  const updateDraft = (id: string, field: keyof DraftItem, value: string) => {
    setDrafts((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }));
  };

  const handleSave = (item: OcrPreviewItem) => {
    const data = getDraft(item);
    onSave(data);
  };

  const handleSaveAll = () => {
    const allData = items.filter((item) => !item.isProcessing).map((item) => getDraft(item));
    onSaveAll(allData);
  };

  if (items.length === 0) {
    return (
      <div className={`text-center p-8 text-muted-foreground ${className}`}>{t('noResults')}</div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-1">
        {items.map((item) => {
          if (item.isProcessing) {
            return (
              <Card key={item.id} className="overflow-hidden" data-testid="ocr-processing-skeleton">
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <Skeleton className="h-32 w-32 rounded-md flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-1/4" />
                      <Skeleton className="h-20 w-full" />
                      <Skeleton className="h-4 w-1/4" />
                      <Skeleton className="h-20 w-full" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          }

          const data = getDraft(item);

          return (
            <Card key={item.id} className="overflow-hidden" data-testid="ocr-preview-item">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  {item.imageUrl && (
                    <div className="relative h-48 w-full md:w-48 flex-shrink-0 rounded-md overflow-hidden border bg-muted">
                      <Image src={item.imageUrl} alt="OCR Source" fill className="object-contain" />
                    </div>
                  )}

                  <div className="flex-1 space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        {t('japanese')}
                      </label>
                      <Textarea
                        value={data.japanese}
                        onChange={(e) => updateDraft(item.id, 'japanese', e.target.value)}
                        placeholder={t('japanese')}
                        className="min-h-[80px] font-japanese text-lg"
                        data-testid="ocr-japanese-input"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        {t('english')}
                      </label>
                      <Textarea
                        value={data.english}
                        onChange={(e) => updateDraft(item.id, 'english', e.target.value)}
                        placeholder={t('english')}
                        className="min-h-[80px]"
                        data-testid="ocr-english-input"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        {t('notes')}
                      </label>
                      <Input
                        value={data.notes}
                        onChange={(e) => updateDraft(item.id, 'notes', e.target.value)}
                        placeholder={t('notes')}
                        data-testid="ocr-notes-input"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-muted/50 p-4 flex justify-end gap-2">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onDiscard(item.id)}
                  data-testid="ocr-discard-button"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {t('discard')}
                </Button>
                <Button size="sm" onClick={() => handleSave(item)} data-testid="ocr-save-button">
                  <Save className="mr-2 h-4 w-4" />
                  {t('save')}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {items.some((item) => !item.isProcessing) && (
        <div className="flex justify-end pt-4 border-t">
          <Button size="lg" onClick={handleSaveAll} data-testid="ocr-save-all-button">
            <CheckCheck className="mr-2 h-4 w-4" />
            {t('saveAll')}
          </Button>
        </div>
      )}
    </div>
  );
}
