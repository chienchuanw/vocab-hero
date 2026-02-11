'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Layout } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { Plus, ImageIcon } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { VocabularyList } from '@/components/features/vocabulary/VocabularyList';
import { VocabularyFilterBar } from '@/components/features/vocabulary/VocabularyFilterBar';
import { AddVocabularyDialog } from '@/components/features/vocabulary/AddVocabularyDialog';
import { EditVocabularyDialog } from '@/components/features/vocabulary/EditVocabularyDialog';
import { DeleteConfirmationDialog } from '@/components/features/vocabulary/DeleteConfirmationDialog';
import { ImageUpload } from '@/components/features/sentences/ImageUpload';
import { OcrPreview, type OcrPreviewItem } from '@/components/features/sentences/OcrPreview';
import { SentenceFlashcard } from '@/components/features/sentences/SentenceFlashcard';
import { SentenceList } from '@/components/features/sentences/SentenceList';
import {
  useVocabulary,
  type VocabularyQueryParams,
  type VocabularyItem,
} from '@/hooks/useVocabulary';
import { useGroups } from '@/hooks/useGroups';
import { useSentences, useCreateSentence } from '@/hooks/useSentences';
import { recognizeText } from '@/lib/ocr/tesseract-worker';
import { parseDuolingoText } from '@/lib/ocr/duolingo-parser';
import {
  DndContext,
  DragOverlay,
  MouseSensor,
  TouchSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { VocabularyCard } from '@/components/features/vocabulary/VocabularyCard';
import { GroupCard } from '@/components/features/groups/GroupCard';
import { toast } from 'sonner';

/**
 * Vocabulary Page
 * Main page for vocabulary and sentence management
 */
export default function VocabularyPage() {
  const t = useTranslations('vocabulary');
  const [filters, setFilters] = useState<VocabularyQueryParams>({
    sortBy: 'createdAt',
    sortOrder: 'desc',
    limit: 12,
  });

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedVocabulary, setSelectedVocabulary] = useState<VocabularyItem | null>(null);
  const [activeVocabulary, setActiveVocabulary] = useState<VocabularyItem | null>(null);

  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [studyDialogOpen, setStudyDialogOpen] = useState(false);
  const [isOcrProcessing, setIsOcrProcessing] = useState(false);
  const [ocrItems, setOcrItems] = useState<OcrPreviewItem[]>([]);

  const vocabularyQuery = useVocabulary(filters);
  const { data: groups } = useGroups();
  const { data: sentences } = useSentences();
  const createSentence = useCreateSentence();

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor)
  );

  const handleEdit = (vocabulary: VocabularyItem) => {
    setSelectedVocabulary(vocabulary);
    setEditDialogOpen(true);
  };

  const handleDelete = (vocabulary: VocabularyItem) => {
    setSelectedVocabulary(vocabulary);
    setDeleteDialogOpen(true);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const vocabulary = active.data.current?.vocabulary as VocabularyItem;
    setActiveVocabulary(vocabulary);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveVocabulary(null);

    if (!over) return;

    const vocabulary = active.data.current?.vocabulary as VocabularyItem;
    const group = over.data.current?.group;

    if (vocabulary && group) {
      try {
        const response = await fetch(`/api/groups/${group.id}/vocabulary`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'add',
            vocabularyIds: [vocabulary.id],
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to add vocabulary to group');
        }

        toast.success(t('toast.addToGroupSuccess', { word: vocabulary.word, group: group.name }));
        vocabularyQuery.refetch();
      } catch {
        toast.error(t('toast.addToGroupError'));
      }
    }
  };

  const handleDragCancel = () => {
    setActiveVocabulary(null);
  };

  const handleImagesSelected = async (files: File[]) => {
    setIsOcrProcessing(true);

    const placeholders: OcrPreviewItem[] = files.map((file, index) => ({
      id: `ocr-${Date.now()}-${index}`,
      japanese: '',
      english: '',
      imageUrl: URL.createObjectURL(file),
      isProcessing: true,
    }));
    setOcrItems(placeholders);

    const results: OcrPreviewItem[] = [];
    for (const [i, file] of files.entries()) {
      const placeholder = placeholders[i];
      if (!placeholder) continue;

      try {
        const ocrResult = await recognizeText(file);
        const parsed = parseDuolingoText(ocrResult.text);
        results.push({
          ...placeholder,
          japanese: parsed.japanese,
          english: parsed.english,
          isProcessing: false,
        });
      } catch (error) {
        console.error('OCR failed for file:', file.name, error);
        results.push({
          ...placeholder,
          japanese: '',
          english: '',
          isProcessing: false,
        });
      }
    }

    setOcrItems(results);
    setIsOcrProcessing(false);
  };

  const handleOcrSave = async (item: { japanese: string; english: string; notes?: string }) => {
    try {
      await createSentence.mutateAsync({
        japanese: item.japanese,
        english: item.english,
        notes: item.notes,
      });
      toast.success('Sentence saved');
    } catch (error) {
      console.error('Failed to save sentence:', error);
      toast.error('Failed to save sentence');
    }
  };

  const handleOcrDiscard = (id: string) => {
    setOcrItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleOcrSaveAll = async (
    items: { japanese: string; english: string; notes?: string }[]
  ) => {
    try {
      for (const item of items) {
        await createSentence.mutateAsync({
          japanese: item.japanese,
          english: item.english,
          notes: item.notes,
        });
      }
      toast.success(`${items.length} sentences saved`);
      setImportDialogOpen(false);
      setOcrItems([]);
    } catch (error) {
      console.error('Failed to save sentences:', error);
      toast.error('Failed to save sentences');
    }
  };

  return (
    <Layout streak={0}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground mt-1">{t('description')}</p>
        </div>

        <Tabs defaultValue="vocabulary">
          <TabsList>
            <TabsTrigger value="vocabulary">{t('tabs.vocabulary')}</TabsTrigger>
            <TabsTrigger value="sentences">{t('tabs.sentences')}</TabsTrigger>
          </TabsList>

          <TabsContent value="vocabulary">
            <DndContext
              sensors={sensors}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDragCancel={handleDragCancel}
            >
              <div className="space-y-6">
                <div className="flex justify-end">
                  <Button onClick={() => setAddDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    {t('addWord')}
                  </Button>
                </div>

                <VocabularyFilterBar
                  filters={filters}
                  onFiltersChange={setFilters}
                  groups={groups?.map((g) => ({ id: g.id, name: g.name })) || []}
                />

                {groups && groups.length > 0 && (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                    <h2 className="text-sm font-semibold text-gray-700 mb-3">
                      {t('dragToGroups')}
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {groups.map((group) => (
                        <GroupCard key={group.id} group={group} />
                      ))}
                    </div>
                  </div>
                )}

                <VocabularyList
                  query={vocabularyQuery}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />

                <AddVocabularyDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} />
                <EditVocabularyDialog
                  open={editDialogOpen}
                  onOpenChange={setEditDialogOpen}
                  vocabulary={selectedVocabulary}
                />
                <DeleteConfirmationDialog
                  open={deleteDialogOpen}
                  onOpenChange={setDeleteDialogOpen}
                  vocabulary={selectedVocabulary}
                />
              </div>

              <DragOverlay>
                {activeVocabulary ? (
                  <div data-testid="drag-overlay">
                    <VocabularyCard vocabulary={activeVocabulary} />
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>
          </TabsContent>

          <TabsContent value="sentences">
            <div className="space-y-6">
              <div className="flex justify-end">
                <Button onClick={() => setImportDialogOpen(true)}>
                  <ImageIcon className="h-4 w-4 mr-2" />
                  {t('importFromImage')}
                </Button>
              </div>

              <SentenceList onStudy={() => setStudyDialogOpen(true)} onEdit={() => {}} />
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog
        open={importDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setImportDialogOpen(false);
            setOcrItems([]);
            setIsOcrProcessing(false);
          }
        }}
      >
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('importFromImage')}</DialogTitle>
            <DialogDescription>{t('importFromImageDescription')}</DialogDescription>
          </DialogHeader>

          {ocrItems.length === 0 ? (
            <ImageUpload onImagesSelected={handleImagesSelected} isProcessing={isOcrProcessing} />
          ) : (
            <OcrPreview
              items={ocrItems}
              onSave={handleOcrSave}
              onDiscard={handleOcrDiscard}
              onSaveAll={handleOcrSaveAll}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={studyDialogOpen} onOpenChange={setStudyDialogOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh]" showCloseButton={false}>
          <SentenceFlashcard
            sentences={(sentences || []).map((s) => ({
              id: s.id,
              japanese: s.japanese,
              english: s.english,
              notes: s.notes,
            }))}
            onClose={() => setStudyDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
