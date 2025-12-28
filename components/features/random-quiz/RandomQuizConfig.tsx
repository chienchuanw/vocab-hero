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

/**
 * Random Quiz Configuration
 */
export interface RandomQuizConfig {
  questionCount: number;
  difficulty: 'all' | 'easy' | 'medium' | 'hard';
}

/**
 * RandomQuizConfig Props
 */
export interface RandomQuizConfigProps {
  onStart: (config: RandomQuizConfig) => void;
}

/**
 * RandomQuizConfig Component
 * 隨機測驗配置表單
 */
export function RandomQuizConfigForm({ onStart }: RandomQuizConfigProps) {
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [difficulty, setDifficulty] = useState<'all' | 'easy' | 'medium' | 'hard'>('all');

  /**
   * 處理開始測驗
   */
  const handleStart = () => {
    onStart({
      questionCount,
      difficulty,
    });
  };

  return (
    <div className="rounded-lg border bg-card p-8">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Configure Your Quiz</h2>
          <p className="mt-2 text-muted-foreground">
            Customize your random quiz with mixed question types
          </p>
        </div>

        {/* 題數選擇 */}
        <div className="space-y-2">
          <Label htmlFor="question-count">Number of Questions</Label>
          <Select
            value={questionCount.toString()}
            onValueChange={(value) => setQuestionCount(parseInt(value))}
          >
            <SelectTrigger id="question-count">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5 questions</SelectItem>
              <SelectItem value="10">10 questions</SelectItem>
              <SelectItem value="15">15 questions</SelectItem>
              <SelectItem value="20">20 questions</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 難度選擇 */}
        <div className="space-y-2">
          <Label htmlFor="difficulty">Difficulty Level</Label>
          <Select value={difficulty} onValueChange={(value: any) => setDifficulty(value)}>
            <SelectTrigger id="difficulty">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels (Mixed)</SelectItem>
              <SelectItem value="easy">Easy</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="hard">Hard</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 說明 */}
        <div className="rounded-lg bg-muted p-4 text-sm">
          <h3 className="font-medium">What to expect:</h3>
          <ul className="mt-2 space-y-1 text-muted-foreground">
            <li>• Mix of multiple choice and spelling questions</li>
            <li>• Vocabulary from all your groups</li>
            <li>• Instant feedback on each answer</li>
            <li>• Final score and statistics</li>
          </ul>
        </div>

        {/* 開始按鈕 */}
        <Button onClick={handleStart} size="lg" className="w-full">
          Start Quiz
        </Button>
      </div>
    </div>
  );
}

