'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { CreateVocabularyInput } from '@/hooks/useVocabularyMutations';

/**
 * AddVocabularyForm 元件的 Props
 */
export interface AddVocabularyFormProps {
  onSubmit: (data: CreateVocabularyInput) => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

/**
 * AddVocabularyForm 元件
 * 新增單字的表單元件，包含表單驗證
 */
export function AddVocabularyForm({
  onSubmit,
  onCancel,
  isLoading = false,
}: AddVocabularyFormProps) {
  const [formData, setFormData] = useState<CreateVocabularyInput>({
    word: '',
    reading: '',
    meaning: '',
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // 驗證表單
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.word.trim()) {
      newErrors.word = '請輸入單字';
    }
    if (!formData.reading.trim()) {
      newErrors.reading = '請輸入讀音';
    }
    if (!formData.meaning.trim()) {
      newErrors.meaning = '請輸入意思';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 處理表單提交
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* 單字 */}
      <div>
        <Label htmlFor="word">單字 *</Label>
        <Input
          id="word"
          value={formData.word}
          onChange={(e) => setFormData({ ...formData, word: e.target.value })}
          placeholder="例：勉強"
          className={errors.word ? 'border-red-500' : ''}
        />
        {errors.word && <p className="text-sm text-red-500 mt-1">{errors.word}</p>}
      </div>

      {/* 讀音 */}
      <div>
        <Label htmlFor="reading">讀音 *</Label>
        <Input
          id="reading"
          value={formData.reading}
          onChange={(e) => setFormData({ ...formData, reading: e.target.value })}
          placeholder="例：べんきょう"
          className={errors.reading ? 'border-red-500' : ''}
        />
        {errors.reading && <p className="text-sm text-red-500 mt-1">{errors.reading}</p>}
      </div>

      {/* 意思 */}
      <div>
        <Label htmlFor="meaning">意思 *</Label>
        <Input
          id="meaning"
          value={formData.meaning}
          onChange={(e) => setFormData({ ...formData, meaning: e.target.value })}
          placeholder="例：學習、用功"
          className={errors.meaning ? 'border-red-500' : ''}
        />
        {errors.meaning && <p className="text-sm text-red-500 mt-1">{errors.meaning}</p>}
      </div>

      {/* 筆記 */}
      <div>
        <Label htmlFor="notes">筆記（選填）</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
            setFormData({ ...formData, notes: e.target.value })
          }
          placeholder="補充說明或記憶技巧..."
          rows={3}
        />
      </div>

      {/* 按鈕 */}
      <div className="flex justify-end gap-2 pt-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            取消
          </Button>
        )}
        <Button type="submit" disabled={isLoading}>
          {isLoading ? '新增中...' : '新增單字'}
        </Button>
      </div>
    </form>
  );
}
