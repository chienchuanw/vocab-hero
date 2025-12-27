'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { VocabularyList } from '@/components/features/vocabulary/VocabularyList';
import { VocabularyFilterBar } from '@/components/features/vocabulary/VocabularyFilterBar';
import { AddVocabularyDialog } from '@/components/features/vocabulary/AddVocabularyDialog';
import { EditVocabularyDialog } from '@/components/features/vocabulary/EditVocabularyDialog';
import { DeleteConfirmationDialog } from '@/components/features/vocabulary/DeleteConfirmationDialog';
import { useVocabulary, type VocabularyQueryParams, type VocabularyItem } from '@/hooks/useVocabulary';
import { useGroups } from '@/hooks/useGroups';

/**
 * Vocabulary 頁面
 * 單字管理的主頁面
 */
export default function VocabularyPage() {
  // 篩選條件狀態
  const [filters, setFilters] = useState<VocabularyQueryParams>({
    sortBy: 'createdAt',
    sortOrder: 'desc',
    limit: 12,
  });

  // Dialog 狀態
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedVocabulary, setSelectedVocabulary] = useState<VocabularyItem | null>(null);

  // 資料查詢
  const vocabularyQuery = useVocabulary(filters);
  const { data: groups } = useGroups();

  // 處理編輯
  const handleEdit = (vocabulary: VocabularyItem) => {
    setSelectedVocabulary(vocabulary);
    setEditDialogOpen(true);
  };

  // 處理刪除
  const handleDelete = (vocabulary: VocabularyItem) => {
    setSelectedVocabulary(vocabulary);
    setDeleteDialogOpen(true);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 頁面標題與新增按鈕 */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">單字管理</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">管理你的日語單字庫</p>
        </div>
        <Button onClick={() => setAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          新增單字
        </Button>
      </div>

      {/* 篩選列 */}
      <VocabularyFilterBar
        filters={filters}
        onFiltersChange={setFilters}
        groups={groups?.map((g) => ({ id: g.id, name: g.name })) || []}
      />

      {/* 單字列表 */}
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
  );
}

