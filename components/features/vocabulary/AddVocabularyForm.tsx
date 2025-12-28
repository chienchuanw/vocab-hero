'use client';

import { useState } from 'react';
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
      newErrors.word = 'Please enter word';
    }
    if (!formData.reading.trim()) {
      newErrors.reading = 'Please enter reading';
    }
    if (!formData.meaning.trim()) {
      newErrors.meaning = 'Please enter meaning';
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
          reading: s.reading,
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
        <Label htmlFor="word">Word *</Label>
        <Input
          id="word"
          value={formData.word}
          onChange={(e) => setFormData({ ...formData, word: e.target.value })}
          placeholder="e.g., 勉強"
          className={errors.word ? 'border-red-500' : ''}
        />
        {errors.word && <p className="text-sm text-red-500 mt-1">{errors.word}</p>}
      </div>

      {/* Reading */}
      <div>
        <Label htmlFor="reading">Reading *</Label>
        <Input
          id="reading"
          value={formData.reading}
          onChange={(e) => setFormData({ ...formData, reading: e.target.value })}
          placeholder="e.g., べんきょう"
          className={errors.reading ? 'border-red-500' : ''}
        />
        {errors.reading && <p className="text-sm text-red-500 mt-1">{errors.reading}</p>}
      </div>

      {/* Meaning */}
      <div>
        <Label htmlFor="meaning">Meaning *</Label>
        <Input
          id="meaning"
          value={formData.meaning}
          onChange={(e) => setFormData({ ...formData, meaning: e.target.value })}
          placeholder="e.g., study, learn"
          className={errors.meaning ? 'border-red-500' : ''}
        />
        {errors.meaning && <p className="text-sm text-red-500 mt-1">{errors.meaning}</p>}
      </div>

      {/* Notes */}
      <div>
        <Label htmlFor="notes">Notes (Optional)</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
            setFormData({ ...formData, notes: e.target.value })
          }
          placeholder="Additional notes or memory tips..."
          rows={3}
        />
      </div>

      {/* Example Sentences */}
      <ExampleSentenceInput sentences={exampleSentences} onChange={setExampleSentences} />

      {/* Buttons */}
      <div className="flex justify-end gap-2 pt-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Adding...' : 'Add Word'}
        </Button>
      </div>
    </form>
  );
}
