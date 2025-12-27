import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import type { VocabularyItem } from '@/hooks/useVocabulary';

/**
 * VocabularyCard 元件的 Props
 */
export interface VocabularyCardProps {
  vocabulary: VocabularyItem;
  onEdit?: (vocabulary: VocabularyItem) => void;
  onDelete?: (vocabulary: VocabularyItem) => void;
}

/**
 * 根據 mastery 等級取得對應的顏色
 */
function getMasteryColor(mastery: number): string {
  if (mastery >= 80) return 'bg-green-500';
  if (mastery >= 60) return 'bg-blue-500';
  if (mastery >= 40) return 'bg-yellow-500';
  if (mastery >= 20) return 'bg-orange-500';
  return 'bg-red-500';
}

/**
 * 根據 mastery 等級取得對應的文字
 */
function getMasteryLabel(mastery: number): string {
  if (mastery >= 80) return '精通';
  if (mastery >= 60) return '熟悉';
  if (mastery >= 40) return '學習中';
  if (mastery >= 20) return '初學';
  return '未學習';
}

/**
 * VocabularyCard 元件
 * 顯示單一單字的卡片，包含 word, reading, meaning, mastery 顯示
 */
export function VocabularyCard({ vocabulary, onEdit, onDelete }: VocabularyCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {/* 單字 */}
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {vocabulary.word}
            </h3>
            {/* 讀音 */}
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{vocabulary.reading}</p>
          </div>

          {/* Mastery Badge */}
          <Badge className={`${getMasteryColor(vocabulary.mastery)} text-white`}>
            {getMasteryLabel(vocabulary.mastery)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        {/* 意思 */}
        <p className="text-gray-700 dark:text-gray-300">{vocabulary.meaning}</p>

        {/* 筆記（如果有的話） */}
        {vocabulary.notes && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 italic">{vocabulary.notes}</p>
        )}
      </CardContent>

      <CardFooter className="flex justify-between items-center pt-3 border-t">
        {/* 建立時間 */}
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {new Date(vocabulary.createdAt).toLocaleDateString('zh-TW')}
        </span>

        {/* 操作按鈕 */}
        <div className="flex gap-2">
          {onEdit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(vocabulary)}
              aria-label="編輯單字"
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(vocabulary)}
              aria-label="刪除單字"
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}

