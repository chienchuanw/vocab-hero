'use client';

import { useState } from 'react';
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

/**
 * Vocabulary Page
 * Main page for vocabulary management
 */
export default function VocabularyPage() {
  // Filter state
  const [filters, setFilters] = useState<VocabularyQueryParams>({
    sortBy: 'createdAt',
    sortOrder: 'desc',
    limit: 12,
  });

  // Dialog state
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedVocabulary, setSelectedVocabulary] = useState<VocabularyItem | null>(null);

  // Data queries
  const vocabularyQuery = useVocabulary(filters);
  const { data: groups } = useGroups();

  // Handle edit
  const handleEdit = (vocabulary: VocabularyItem) => {
    setSelectedVocabulary(vocabulary);
    setEditDialogOpen(true);
  };

  // Handle delete
  const handleDelete = (vocabulary: VocabularyItem) => {
    setSelectedVocabulary(vocabulary);
    setDeleteDialogOpen(true);
  };

  return (
    <Layout streak={0}>
      <div className="space-y-6">
        {/* Page header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Vocabulary</h1>
            <p className="text-muted-foreground mt-1">Manage your Japanese vocabulary collection</p>
          </div>
          <Button onClick={() => setAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Word
          </Button>
        </div>

        {/* Filter bar */}
        <VocabularyFilterBar
          filters={filters}
          onFiltersChange={setFilters}
          groups={groups?.map((g) => ({ id: g.id, name: g.name })) || []}
        />

        {/* Vocabulary list */}
        <VocabularyList query={vocabularyQuery} onEdit={handleEdit} onDelete={handleDelete} />

        {/* Dialogs */}
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
  );
}
