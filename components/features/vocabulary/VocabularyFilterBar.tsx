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
 * VocabularyFilterBar 元件的 Props
 */
export interface VocabularyFilterBarProps {
  filters: VocabularyQueryParams;
  onFiltersChange: (filters: VocabularyQueryParams) => void;
  groups?: Array<{ id: string; name: string }>;
}

/**
 * VocabularyFilterBar 元件
 * 提供搜尋、排序、群組篩選功能
 */
export function VocabularyFilterBar({
  filters,
  onFiltersChange,
  groups = [],
}: VocabularyFilterBarProps) {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      {/* 搜尋框 */}
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          type="text"
          placeholder="搜尋單字、讀音或意思..."
          value={filters.search || ''}
          onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
          className="pl-10"
        />
      </div>

      {/* 排序選擇器 */}
      <Select
        value={filters.sortBy || 'createdAt'}
        onValueChange={(value: string) =>
          onFiltersChange({ ...filters, sortBy: value as VocabularyQueryParams['sortBy'] })
        }
      >
        <SelectTrigger className="w-full md:w-[180px]">
          <SelectValue placeholder="排序方式" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="createdAt">建立時間</SelectItem>
          <SelectItem value="word">單字</SelectItem>
          <SelectItem value="mastery">熟練度</SelectItem>
        </SelectContent>
      </Select>

      {/* 排序順序 */}
      <Select
        value={filters.sortOrder || 'desc'}
        onValueChange={(value: string) =>
          onFiltersChange({ ...filters, sortOrder: value as VocabularyQueryParams['sortOrder'] })
        }
      >
        <SelectTrigger className="w-full md:w-[120px]">
          <SelectValue placeholder="順序" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="asc">升冪</SelectItem>
          <SelectItem value="desc">降冪</SelectItem>
        </SelectContent>
      </Select>

      {/* 群組篩選 */}
      {groups.length > 0 && (
        <Select
          value={filters.groupId || 'all'}
          onValueChange={(value: string) =>
            onFiltersChange({ ...filters, groupId: value === 'all' ? undefined : value })
          }
        >
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="選擇群組" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">所有群組</SelectItem>
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
