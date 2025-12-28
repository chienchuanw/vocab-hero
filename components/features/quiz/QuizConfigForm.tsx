'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';

/**
 * Quiz Configuration Interface
 */
export interface QuizConfig {
  groupId: string;
  questionCount: number;
  quizType: 'WORD_TO_MEANING' | 'MEANING_TO_WORD' | 'MIXED';
}

/**
 * Group Interface
 */
export interface Group {
  id: string;
  name: string;
  vocabularyCount: number;
}

/**
 * QuizConfigForm Props
 */
export interface QuizConfigFormProps {
  groups: Group[];
  onSubmit: (config: QuizConfig) => void;
  isLoading?: boolean;
}

/**
 * QuizConfigForm Component
 * Form for configuring quiz settings before starting
 */
export function QuizConfigForm({ groups, onSubmit, isLoading = false }: QuizConfigFormProps) {
  const [groupId, setGroupId] = useState<string>('');
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [quizType, setQuizType] = useState<'WORD_TO_MEANING' | 'MEANING_TO_WORD' | 'MIXED'>(
    'WORD_TO_MEANING'
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!groupId) {
      return;
    }

    if (questionCount < 1) {
      return;
    }

    onSubmit({
      groupId,
      questionCount,
      quizType,
    });
  };

  // Show empty state if no groups available
  if (groups.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-8 text-center">
        <p className="text-muted-foreground">No groups available. Please create a group first.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Group Selection */}
      <div className="space-y-2">
        <Label htmlFor="group-select">Select Group</Label>
        <Select value={groupId} onValueChange={setGroupId}>
          <SelectTrigger id="group-select">
            <SelectValue placeholder="Choose a vocabulary group" />
          </SelectTrigger>
          <SelectContent>
            {groups.map((group) => (
              <SelectItem key={group.id} value={group.id}>
                {group.name} ({group.vocabularyCount} words)
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Question Count */}
      <div className="space-y-2">
        <Label htmlFor="question-count">Number of Questions</Label>
        <Input
          id="question-count"
          type="number"
          min="1"
          max="50"
          value={questionCount}
          onChange={(e) => setQuestionCount(parseInt(e.target.value, 10) || 10)}
        />
      </div>

      {/* Question Type */}
      <div className="space-y-2">
        <Label htmlFor="question-type">Question Type</Label>
        <Select
          value={quizType}
          onValueChange={(value) =>
            setQuizType(value as 'WORD_TO_MEANING' | 'MEANING_TO_WORD' | 'MIXED')
          }
        >
          <SelectTrigger id="question-type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="WORD_TO_MEANING">Japanese Word → Meaning</SelectItem>
            <SelectItem value="MEANING_TO_WORD">Meaning → Japanese Word</SelectItem>
            <SelectItem value="MIXED">Mixed (Random)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Submit Button */}
      <Button type="submit" className="w-full" disabled={isLoading || !groupId}>
        {isLoading ? 'Starting...' : 'Start Quiz'}
      </Button>
    </form>
  );
}

