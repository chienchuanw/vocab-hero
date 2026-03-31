'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ExampleSentenceInput } from './ExampleSentenceInput';
import type { CreateVocabularyInput } from '@/hooks/useVocabularyMutations';
import type { ExampleSentenceData } from './ExampleSentence.types';

/**
 * AddVocabularyForm component props
 */
export interface AddVocabularyFormProps {
  onSubmit: (data: CreateVocabularyInput) => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

/**
 * AddVocabularyForm component
 * Form component for adding new vocabulary with validation
 */
export function AddVocabularyForm({
  onSubmit,
  onCancel,
  isLoading = false,
}: AddVocabularyFormProps) {
  const t = useTranslations('vocabulary');
  const tc = useTranslations('common');

  const [formData, setFormData] = useState<CreateVocabularyInput>({
    word: '',
    reading: '',
    meaning: '',
    notes: '',
  });

  const [exampleSentences, setExampleSentences] = useState<ExampleSentenceData[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.word.trim()) {
      newErrors.word = t('form.wordError');
    }
    if (!formData.reading.trim()) {
      newErrors.reading = t('form.readingError');
    }
    if (!formData.meaning.trim()) {
      newErrors.meaning = t('form.meaningError');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      // Convert example sentences to API format
      const exampleSentencesData = exampleSentences
        .filter((s) => s.sentence.trim() && s.meaning.trim())
        .map((s, index) => ({
          sentence: s.sentence,
          reading: s.reading || '',
          meaning: s.meaning,
          order: index,
        }));

      onSubmit({
        ...formData,
        exampleSentences: exampleSentencesData.length > 0 ? exampleSentencesData : undefined,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Word */}
      <div>
        <Label htmlFor="word">{t('form.word')}</Label>
        <Input
          id="word"
          value={formData.word}
          onChange={(e) => setFormData({ ...formData, word: e.target.value })}
          placeholder={t('form.wordPlaceholder')}
          className={errors.word ? 'border-destructive' : ''}
        />
        {errors.word && <p className="text-sm text-destructive mt-1">{errors.word}</p>}
      </div>

      {/* Reading */}
      <div>
        <Label htmlFor="reading">{t('form.reading')}</Label>
        <Input
          id="reading"
          value={formData.reading}
          onChange={(e) => setFormData({ ...formData, reading: e.target.value })}
          placeholder={t('form.readingPlaceholder')}
          className={errors.reading ? 'border-destructive' : ''}
        />
        {errors.reading && <p className="text-sm text-destructive mt-1">{errors.reading}</p>}
      </div>

      {/* Meaning */}
      <div>
        <Label htmlFor="meaning">{t('form.meaning')}</Label>
        <Input
          id="meaning"
          value={formData.meaning}
          onChange={(e) => setFormData({ ...formData, meaning: e.target.value })}
          placeholder={t('form.meaningPlaceholder')}
          className={errors.meaning ? 'border-destructive' : ''}
        />
        {errors.meaning && <p className="text-sm text-destructive mt-1">{errors.meaning}</p>}
      </div>

      {/* Notes */}
      <div>
        <Label htmlFor="notes">{t('form.notes')}</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
            setFormData({ ...formData, notes: e.target.value })
          }
          placeholder={t('form.notesPlaceholder')}
          rows={3}
        />
      </div>

      {/* Example Sentences */}
      <ExampleSentenceInput sentences={exampleSentences} onChange={setExampleSentences} />

      {/* Buttons */}
      <div className="flex justify-end gap-2 pt-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            {tc('cancel')}
          </Button>
        )}
        <Button type="submit" disabled={isLoading}>
          {isLoading ? tc('adding') : tc('add')}
        </Button>
      </div>
    </form>
  );
}
