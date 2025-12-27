'use client';

import { GroupCard } from './GroupCard';
import { Loader2 } from 'lucide-react';
import type { Group } from '@/hooks/useGroups';
import type { UseQueryResult } from '@tanstack/react-query';

/**
 * GroupList 元件的 Props
 */
export interface GroupListProps {
  query: UseQueryResult<Group[], Error>;
  onEdit?: (group: Group) => void;
  onDelete?: (group: Group) => void;
  onClick?: (group: Group) => void;
}

/**
 * GroupList 元件
 * 顯示群組列表
 */
export function GroupList({ query, onEdit, onDelete, onClick }: GroupListProps) {
  const { data: groups, isLoading, isError, error } = query;

  // Loading 狀態
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-gray-600">載入中...</span>
      </div>
    );
  }

  // Error 狀態
  if (isError) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">載入失敗：{error.message}</p>
      </div>
    );
  }

  // 空狀態
  if (!groups || groups.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">尚無群組資料</p>
        <p className="text-sm text-gray-400 mt-2">點擊「新增群組」開始組織你的單字</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {groups.map((group) => (
        <GroupCard
          key={group.id}
          group={group}
          onEdit={onEdit}
          onDelete={onDelete}
          onClick={onClick}
        />
      ))}
    </div>
  );
}

