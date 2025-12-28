'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, Plus } from 'lucide-react';
import type { ExampleSentenceData } from './ExampleSentence.types';

/**
 * ExampleSentenceInput component props
 */
export interface ExampleSentenceInputProps {
  sentences: ExampleSentenceData[];
  onChange: (sentences: ExampleSentenceData[]) => void;
}

/**
 * ExampleSentenceInput component
 * Manages adding, editing, and deleting example sentences in forms
 */
export function ExampleSentenceInput({ sentences, onChange }: ExampleSentenceInputProps) {
  // Add new sentence
  const handleAdd = () => {
    const newSentence: ExampleSentenceData = {
      id: `temp-${Date.now()}`,
      sentence: '',
      reading: '',
      meaning: '',
      order: sentences.length,
    };
    onChange([...sentences, newSentence]);
  };

  // Update sentence field
  const handleUpdate = (index: number, field: keyof ExampleSentenceData, value: string) => {
    const updated = sentences.map((s, i) => (i === index ? { ...s, [field]: value } : s));
    onChange(updated);
  };

  // Delete sentence
  const handleDelete = (index: number) => {
    const updated = sentences.filter((_, i) => i !== index);
    // Reorder remaining sentences
    const reordered = updated.map((s, i) => ({ ...s, order: i }));
    onChange(reordered);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Example Sentences (Optional)</Label>
        <Button type="button" variant="outline" size="sm" onClick={handleAdd}>
          <Plus className="h-4 w-4 mr-1" />
          Add Example Sentence
        </Button>
      </div>

      {sentences.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No example sentences added yet. Click the button above to add one.
        </p>
      )}

      {sentences.map((sentence, index) => (
        <div key={sentence.id} className="border rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Sentence {index + 1}</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleDelete(index)}
              aria-label="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          <div>
            <Label htmlFor={`sentence-${sentence.id}`}>Japanese Sentence</Label>
            <Input
              id={`sentence-${sentence.id}`}
              value={sentence.sentence}
              onChange={(e) => handleUpdate(index, 'sentence', e.target.value)}
              placeholder="e.g., 私は毎日勉強します"
            />
          </div>

          <div>
            <Label htmlFor={`reading-${sentence.id}`}>Reading (Furigana)</Label>
            <Input
              id={`reading-${sentence.id}`}
              value={sentence.reading || ''}
              onChange={(e) => handleUpdate(index, 'reading', e.target.value)}
              placeholder="e.g., わたしはまいにちべんきょうします"
            />
          </div>

          <div>
            <Label htmlFor={`meaning-${sentence.id}`}>Translation</Label>
            <Input
              id={`meaning-${sentence.id}`}
              value={sentence.meaning}
              onChange={(e) => handleUpdate(index, 'meaning', e.target.value)}
              placeholder="e.g., I study every day"
            />
          </div>
        </div>
      ))}
    </div>
  );
}
