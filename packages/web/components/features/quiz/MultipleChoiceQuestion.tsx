'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { AnswerFeedback } from './AnswerFeedback';

/**
 * Quiz Question Interface
 */
export interface QuizQuestion {
  id: string;
  vocabularyId: string;
  word: string;
  reading: string;
  correctAnswer: string;
  options: string[];
  type: 'WORD_TO_MEANING' | 'MEANING_TO_WORD';
}

/**
 * MultipleChoiceQuestion Props
 */
export interface MultipleChoiceQuestionProps {
  question: QuizQuestion;
  onAnswer: (answer: string, isCorrect: boolean) => void;
  currentQuestionNumber: number;
  totalQuestions: number;
  selectedAnswer?: string;
  isCorrect?: boolean;
}

/**
 * MultipleChoiceQuestion Component
 * 顯示單一選擇題，包含題目、選項和答案反饋
 */
export function MultipleChoiceQuestion({
  question,
  onAnswer,
  currentQuestionNumber,
  totalQuestions,
  selectedAnswer,
  isCorrect,
}: MultipleChoiceQuestionProps) {
  const t = useTranslations('quiz');
  const tStudy = useTranslations('study');
  const handleOptionClick = (option: string) => {
    // 如果已經選擇答案，不允許再次選擇
    if (selectedAnswer) return;

    const correct = option === question.correctAnswer;
    onAnswer(option, correct);
  };

  /**
   * 取得選項按鈕的樣式
   */
  const getOptionClassName = (option: string) => {
    // 未選擇答案時的預設樣式
    if (!selectedAnswer) {
      return 'bg-card hover:bg-accent';
    }

    // 選擇答案後的樣式
    if (option === question.correctAnswer) {
      // 正確答案永遠顯示綠色
      return 'bg-success text-primary-foreground hover:bg-success/90';
    }

    if (option === selectedAnswer && !isCorrect) {
      // 選錯的答案顯示紅色
      return 'bg-destructive text-destructive-foreground hover:bg-destructive/90';
    }

    // 其他選項保持預設樣式但變暗
    return 'bg-muted opacity-50';
  };

  return (
    <div className="space-y-6">
      <div className="text-center text-sm text-muted-foreground">
        {tStudy('questionProgress', { current: currentQuestionNumber, total: totalQuestions })}
      </div>

      <div className="rounded-lg border bg-card p-8 text-center">
        <div className="space-y-2">
          {question.type === 'WORD_TO_MEANING' ? (
            <>
              <div className="text-4xl font-bold">{question.word}</div>
              <div className="text-xl text-muted-foreground">{question.reading}</div>
              <div className="pt-4 text-sm text-muted-foreground">
                {t('questionTypes.wordToMeaning')}
              </div>
            </>
          ) : (
            <>
              <div className="text-2xl font-bold">{question.correctAnswer}</div>
              <div className="pt-4 text-sm text-muted-foreground">
                {t('questionTypes.meaningToWord')}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {question.options.map((option) => (
          <Button
            key={option}
            variant="outline"
            size="lg"
            className={cn('h-auto min-h-[60px] text-lg transition-all', getOptionClassName(option))}
            onClick={() => handleOptionClick(option)}
            disabled={!!selectedAnswer}
          >
            {question.type === 'WORD_TO_MEANING' ? (
              option
            ) : (
              <div className="space-y-1">
                <div className="font-bold">{option}</div>
              </div>
            )}
          </Button>
        ))}
      </div>

      {selectedAnswer && isCorrect !== undefined && (
        <AnswerFeedback
          isCorrect={isCorrect}
          message={
            isCorrect
              ? t('correct')
              : `${t('incorrect')}. ${t('correctAnswer')}: ${question.correctAnswer}`
          }
        />
      )}
    </div>
  );
}
