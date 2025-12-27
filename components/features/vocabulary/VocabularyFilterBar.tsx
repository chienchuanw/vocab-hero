'use client';

import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search } from 'lucide-react';
import type { VocabularyQueryParams } from '@/hooks/useVocabulary';

/**
 * VocabularyFilterBar component props
 */
export interface VocabularyFilterBarProps {
  filters: VocabularyQueryParams;
  onFiltersChange: (filters: VocabularyQueryParams) => void;
  groups?: Array<{ id: string; name: string }>;
}

/**
 * VocabularyFilterBar component
 * Provides search, sort, and group filter functionality
 */
export function VocabularyFilterBar({
  filters,
  onFiltersChange,
  groups = [],
}: VocabularyFilterBarProps) {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      {/* Search input */}
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          type="text"
          placeholder="Search word, reading, or meaning..."
          value={filters.search || ''}
          onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
          className="pl-10"
        />
      </div>

      {/* Sort by selector */}
      <Select
        value={filters.sortBy || 'createdAt'}
        onValueChange={(value: string) =>
          onFiltersChange({ ...filters, sortBy: value as VocabularyQueryParams['sortBy'] })
        }
      >
        <SelectTrigger className="w-full md:w-[180px]">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="createdAt">Created Date</SelectItem>
          <SelectItem value="word">Word</SelectItem>
          <SelectItem value="mastery">Mastery</SelectItem>
        </SelectContent>
      </Select>

      {/* Sort order */}
      <Select
        value={filters.sortOrder || 'desc'}
        onValueChange={(value: string) =>
          onFiltersChange({ ...filters, sortOrder: value as VocabularyQueryParams['sortOrder'] })
        }
      >
        <SelectTrigger className="w-full md:w-[120px]">
          <SelectValue placeholder="Order" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="asc">Ascending</SelectItem>
          <SelectItem value="desc">Descending</SelectItem>
        </SelectContent>
      </Select>

      {/* Group filter */}
      {groups.length > 0 && (
        <Select
          value={filters.groupId || 'all'}
          onValueChange={(value: string) =>
            onFiltersChange({ ...filters, groupId: value === 'all' ? undefined : value })
          }
        >
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Select group" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Groups</SelectItem>
            {groups.map((group) => (
              <SelectItem key={group.id} value={group.id}>
                {group.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
