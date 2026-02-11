'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Check, X } from 'lucide-react';

/**
 * MultipleChoiceCard Props
 */
export interface MultipleChoiceCardProps {
  question: string;
  options: string[];
  correctAnswer: string;
  onAnswer: (answer: string, isCorrect: boolean) => void;
  userAnswer?: string;
}

/**
 * MultipleChoiceCard Component
 * 顯示選擇題卡片（用於 Random Quiz）
 */
export function MultipleChoiceCard({
  question,
  options,
  correctAnswer,
  onAnswer,
  userAnswer,
}: MultipleChoiceCardProps) {
  const isAnswered = userAnswer !== undefined;

  const handleOptionClick = (option: string) => {
    if (isAnswered) return;
    const isCorrect = option === correctAnswer;
    onAnswer(option, isCorrect);
  };

  return (
    <div className="space-y-6">
      {/* 題目 */}
      <div className="rounded-lg border-2 border-gray-200 bg-white p-6 text-center">
        <p className="text-xl font-medium text-gray-900">{question}</p>
      </div>

      {/* 選項 */}
      <div className="grid gap-3">
        {options.map((option, index) => {
          const isSelected = userAnswer === option;
          const isCorrectOption = option === correctAnswer;
          const showFeedback = isAnswered;

          return (
            <Button
              key={index}
              variant="outline"
              className={cn(
                'h-auto min-h-[60px] w-full justify-start px-6 py-4 text-left text-base transition-all',
                !isAnswered && 'hover:border-blue-500 hover:bg-blue-50',
                isAnswered && 'cursor-default',
                showFeedback && isSelected && isCorrectOption && 'border-green-500 bg-green-50',
                showFeedback && isSelected && !isCorrectOption && 'border-red-500 bg-red-50',
                showFeedback && !isSelected && isCorrectOption && 'border-green-500 bg-green-50'
              )}
              onClick={() => handleOptionClick(option)}
              disabled={isAnswered}
            >
              <span className="flex-1">{option}</span>
              {showFeedback && isSelected && isCorrectOption && (
                <Check className="ml-2 h-5 w-5 text-green-600" />
              )}
              {showFeedback && isSelected && !isCorrectOption && (
                <X className="ml-2 h-5 w-5 text-red-600" />
              )}
              {showFeedback && !isSelected && isCorrectOption && (
                <Check className="ml-2 h-5 w-5 text-green-600" />
              )}
            </Button>
          );
        })}
      </div>
    </div>
  );
}

