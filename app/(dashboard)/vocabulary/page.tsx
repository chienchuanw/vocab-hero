'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Layout } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { VocabularyList } from '@/components/features/vocabulary/VocabularyList';
import { VocabularyFilterBar } from '@/components/features/vocabulary/VocabularyFilterBar';
import { AddVocabularyDialog } from '@/components/features/vocabulary/AddVocabularyDialog';
import { EditVocabularyDialog } from '@/components/features/vocabulary/EditVocabularyDialog';
import { DeleteConfirmationDialog } from '@/components/features/vocabulary/DeleteConfirmationDialog';
import {
  useVocabulary,
  type VocabularyQueryParams,
  type VocabularyItem,
} from '@/hooks/useVocabulary';
import { useGroups } from '@/hooks/useGroups';
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
 * Main page for vocabulary management
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

  const vocabularyQuery = useVocabulary(filters);
  const { data: groups } = useGroups();

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

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <Layout streak={0}>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">{t('title')}</h1>
              <p className="text-muted-foreground mt-1">{t('description')}</p>
            </div>
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
              <h2 className="text-sm font-semibold text-gray-700 mb-3">{t('dragToGroups')}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {groups.map((group) => (
                  <GroupCard key={group.id} group={group} />
                ))}
              </div>
            </div>
          )}

          <VocabularyList query={vocabularyQuery} onEdit={handleEdit} onDelete={handleDelete} />

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
      </Layout>

      <DragOverlay>
        {activeVocabulary ? (
          <div data-testid="drag-overlay">
            <VocabularyCard vocabulary={activeVocabulary} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
