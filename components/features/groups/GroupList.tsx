'use client';

import { GroupCard } from './GroupCard';
import { Loader2 } from 'lucide-react';
import type { Group } from '@/hooks/useGroups';
import type { UseQueryResult } from '@tanstack/react-query';

/**
 * GroupList component props
 */
export interface GroupListProps {
  query: UseQueryResult<Group[], Error>;
  onEdit?: (group: Group) => void;
  onDelete?: (group: Group) => void;
  onClick?: (group: Group) => void;
}

/**
 * GroupList component
 * Displays list of groups
 */
export function GroupList({ query, onEdit, onDelete, onClick }: GroupListProps) {
  const { data: groups, isLoading, isError, error } = query;

  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-gray-600">Loading...</span>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Failed to load: {error.message}</p>
      </div>
    );
  }

  // Empty state
  if (!groups || groups.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No groups yet</p>
        <p className="text-sm text-gray-400 mt-2">
          Click "Add Group" to start organizing your vocabulary
        </p>
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
