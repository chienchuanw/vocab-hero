'use client';

import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
 } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
   Popover,
   PopoverContent,
   PopoverTrigger,
 } from '@/components/ui/popover';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import type { VocabularyQueryParams } from '@/hooks/useVocabulary';
import { MasteryLevel, MASTERY_LEVEL_CONFIGS } from '@/lib/srs/mastery';

export interface VocabularyFilterBarProps {
  filters: VocabularyQueryParams;
  onFiltersChange: (filters: VocabularyQueryParams) => void;
  groups?: Array<{ id: string; name: string }>;
}

export function VocabularyFilterBar({
   filters,
   onFiltersChange,
   groups = [],
 }: VocabularyFilterBarProps) {
   const t = useTranslations('vocabulary');
   const activeFilterCount = [
     filters.masteryLevel,
     filters.groupId,
   ].filter(Boolean).length;

  const handleResetAdvancedFilters = () => {
    const { masteryLevel: _masteryLevel, groupId: _groupId, ...rest } = filters;
    onFiltersChange(rest);
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6">
       <div className="flex-1 relative">
         <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder={t('searchPlaceholder')}
            value={filters.search || ''}
            onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
            className="pl-10"
            aria-label={t('searchPlaceholder')}
          />
        </div>

       <Select
         value={filters.sortBy || 'createdAt'}
         onValueChange={(value: string) =>
           onFiltersChange({ ...filters, sortBy: value as VocabularyQueryParams['sortBy'] })
         }
       >
          <SelectTrigger
            className="w-full md:w-[180px]"
            data-testid="sort-select"
            aria-label={t('sortBy')}
          >
            <SelectValue placeholder={t('sortBy')} />
          </SelectTrigger>
         <SelectContent>
           <SelectItem value="createdAt">{t('filter.newestFirst')}</SelectItem>
           <SelectItem value="word">{t('filter.az')}</SelectItem>
           <SelectItem value="mastery">{t('sortOptions.mastery')}</SelectItem>
         </SelectContent>
       </Select>

       <Select
         value={filters.sortOrder || 'desc'}
         onValueChange={(value: string) =>
           onFiltersChange({ ...filters, sortOrder: value as VocabularyQueryParams['sortOrder'] })
         }
       >
          <SelectTrigger className="w-full md:w-[120px]" aria-label={t('order')}>
            <SelectValue placeholder={t('order')} />
          </SelectTrigger>
         <SelectContent>
           <SelectItem value="asc">{t('orderOptions.ascending')}</SelectItem>
           <SelectItem value="desc">{t('orderOptions.descending')}</SelectItem>
         </SelectContent>
       </Select>

       <Popover>
         <PopoverTrigger asChild>
           <Button variant="outline" className="relative" data-testid="filter-popover-trigger">
             <SlidersHorizontal className="h-4 w-4 mr-2" />
             {t('filter.title')}
             {activeFilterCount > 0 && (
               <Badge
                 variant="secondary"
                 className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
                 data-testid="filter-count-badge"
               >
                 {activeFilterCount}
               </Badge>
             )}
           </Button>
         </PopoverTrigger>
         <PopoverContent className="w-80" align="end">
           <div className="space-y-4">
             <div className="flex items-center justify-between">
               <h4 className="font-medium text-sm">{t('filter.advanced')}</h4>
               {activeFilterCount > 0 && (
                 <Button
                   variant="ghost"
                   size="sm"
                   onClick={handleResetAdvancedFilters}
                   className="text-xs h-auto py-1"
                 >
                   <X className="h-3 w-3 mr-1" />
                   {t('filter.reset')}
                 </Button>
               )}
            </div>

              <div className="space-y-2">
                <label
                  htmlFor="vocabulary-filter-mastery-level"
                  className="text-sm font-medium text-muted-foreground"
                >
                  {t('masteryLevel')}
                </label>
                <Select
                  value={filters.masteryLevel || 'all'}
                  onValueChange={(value: string) =>
                   onFiltersChange({
                     ...filters,
                     masteryLevel: value === 'all' ? undefined : (value as MasteryLevel),
                   })
                 }
                >
                  <SelectTrigger
                    id="vocabulary-filter-mastery-level"
                    aria-label={t('masteryLevel')}
                  >
                    <SelectValue placeholder={t('allLevels')} />
                  </SelectTrigger>
                 <SelectContent>
                   <SelectItem value="all">{t('allLevels')}</SelectItem>
                  {Object.values(MasteryLevel).map((level) => {
                    const config = MASTERY_LEVEL_CONFIGS[level];
                    return (
                      <SelectItem key={level} value={level}>
                        {config.label}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

              {groups.length > 0 && (
                <div className="space-y-2">
                  <label
                    htmlFor="vocabulary-filter-group"
                    className="text-sm font-medium text-muted-foreground"
                  >
                    {t('selectGroup')}
                  </label>
                  <Select
                    value={filters.groupId || 'all'}
                    onValueChange={(value: string) =>
                      onFiltersChange({ ...filters, groupId: value === 'all' ? undefined : value })
                    }
                  >
                    <SelectTrigger id="vocabulary-filter-group" aria-label={t('selectGroup')}>
                      <SelectValue placeholder={t('allGroups')} />
                    </SelectTrigger>
                   <SelectContent>
                     <SelectItem value="all">{t('allGroups')}</SelectItem>
                    {groups.map((group) => (
                      <SelectItem key={group.id} value={group.id}>
                        {group.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
