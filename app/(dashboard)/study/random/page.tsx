'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Layout } from '@/components/shared';
import { Button } from '@/components/ui/button';
import {
  RandomQuizConfigForm,
  type RandomQuizConfig,
} from '@/components/features/random-quiz/RandomQuizConfig';
import { RandomQuizSummary } from '@/components/features/random-quiz/RandomQuizSummary';
import { MultipleChoiceCard } from '@/components/features/random-quiz/MultipleChoiceCard';
import { SpellingInput } from '@/components/features/spelling/SpellingInput';
import { useRandomQuiz } from '@/hooks/useRandomQuiz';
import { generateMixedQuestions, type VocabularyItem } from '@/lib/random-quiz/question-generator';
import {
  selectRandomVocabulary,
  selectVocabularyByDifficulty,
} from '@/lib/random-quiz/vocabulary-selector';

/**
 * Random Quiz Page
 * 隨機測驗頁面 - 混合不同題型與跨所有 Group 的隨機單字
 */
export default function RandomQuizPage() {
  const router = useRouter();
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizConfig, setQuizConfig] = useState<RandomQuizConfig | null>(null);

  // TODO: 從 API 獲取所有單字資料
  // 暫時使用模擬資料
  const [allVocabulary] = useState<VocabularyItem[]>([
    {
      id: '1',
      word: '勉強',
      meaning: 'study',
      reading: 'べんきょう',
      groupId: 'g1',
      difficulty: 'easy',
    },
    {
      id: '2',
      word: '学校',
      meaning: 'school',
      reading: 'がっこう',
      groupId: 'g1',
      difficulty: 'easy',
    },
    {
      id: '3',
      word: '先生',
      meaning: 'teacher',
      reading: 'せんせい',
      groupId: 'g2',
      difficulty: 'medium',
    },
    {
      id: '4',
      word: '学生',
      meaning: 'student',
      reading: 'がくせい',
      groupId: 'g2',
      difficulty: 'medium',
    },
    { id: '5', word: '本', meaning: 'book', reading: 'ほん', groupId: 'g3', difficulty: 'easy' },
    {
      id: '6',
      word: '友達',
      meaning: 'friend',
      reading: 'ともだち',
      groupId: 'g3',
      difficulty: 'hard',
    },
    { id: '7', word: '家', meaning: 'house', reading: 'いえ', groupId: 'g3', difficulty: 'easy' },
    {
      id: '8',
      word: '食べる',
      meaning: 'to eat',
      reading: 'たべる',
      groupId: 'g4',
      difficulty: 'medium',
    },
    {
      id: '9',
      word: '飲む',
      meaning: 'to drink',
      reading: 'のむ',
      groupId: 'g4',
      difficulty: 'medium',
    },
    {
      id: '10',
      word: '見る',
      meaning: 'to see',
      reading: 'みる',
      groupId: 'g4',
      difficulty: 'easy',
    },
  ]);

  // 生成測驗題目
  const questions = useMemo(() => {
    if (!quizConfig) return [];

    // 根據難度選取單字
    const selectedVocabulary =
      quizConfig.difficulty === 'all'
        ? selectRandomVocabulary(allVocabulary, quizConfig.questionCount)
        : selectVocabularyByDifficulty(
            allVocabulary,
            quizConfig.questionCount,
            quizConfig.difficulty
          );

    // 生成混合題型
    return generateMixedQuestions(selectedVocabulary, quizConfig.questionCount);
  }, [quizConfig, allVocabulary]);

  const quiz = useRandomQuiz(questions);

  /**
   * 開始測驗
   */
  const handleStartQuiz = (config: RandomQuizConfig) => {
    setQuizConfig(config);
    setQuizStarted(true);
  };

  /**
   * 重新開始
   */
  const handleRestart = () => {
    setQuizStarted(false);
    setQuizConfig(null);
    quiz.restart();
  };

  /**
   * 處理選擇題答案
   */
  const handleMultipleChoiceAnswer = (answer: string) => {
    quiz.answerMultipleChoice(answer);

    // 延遲後自動前往下一題
    setTimeout(() => {
      if (!quiz.isComplete) {
        quiz.nextQuestion();
      }
    }, 1500);
  };

  /**
   * 處理拼寫題答案
   */
  const handleSpellingAnswer = (answer: string) => {
    quiz.answerSpelling(answer);

    // 延遲後自動前往下一題
    setTimeout(() => {
      if (!quiz.isComplete) {
        quiz.nextQuestion();
      }
    }, 3000);
  };

  // 顯示配置頁面
  if (!quizStarted) {
    return (
      <Layout streak={0}>
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <div className="mb-4 flex items-center justify-between">
              <h1 className="text-3xl font-bold">Random Quiz</h1>
              <Button variant="ghost" onClick={() => router.push('/study')}>
                ← Back to Study
              </Button>
            </div>
            <p className="text-muted-foreground">
              Test your knowledge with a mix of question types from all your vocabulary
            </p>
          </div>

          <RandomQuizConfigForm onStart={handleStartQuiz} />
        </div>
      </Layout>
    );
  }

  // 顯示完成畫面
  if (quiz.isComplete) {
    return (
      <Layout streak={0}>
        <div className="max-w-2xl mx-auto">
          <RandomQuizSummary
            results={quiz.results}
            totalQuestions={quiz.totalQuestions}
            onRestart={handleRestart}
            onBackToStudy={() => router.push('/study')}
          />
        </div>
      </Layout>
    );
  }

  // 顯示測驗題目
  return (
    <Layout streak={0}>
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <div className="mb-4 flex items-center justify-between">
            <h1 className="text-3xl font-bold">Random Quiz</h1>
            <Button variant="ghost" onClick={() => router.push('/study')}>
              ← Back to Study
            </Button>
          </div>
        </div>

        {/* 進度指示 */}
        <div className="mb-6 text-center text-sm text-muted-foreground">
          Question {quiz.currentQuestionNumber} of {quiz.totalQuestions}
        </div>

        {/* 題目 */}
        {quiz.currentQuestion && (
          <div>
            {quiz.currentQuestion.type === 'multiple-choice' ? (
              <MultipleChoiceCard
                question={quiz.currentQuestion.question}
                options={quiz.currentQuestion.options || []}
                correctAnswer={quiz.currentQuestion.correctAnswer}
                onAnswer={handleMultipleChoiceAnswer}
                userAnswer={quiz.currentResult?.userAnswer}
              />
            ) : (
              <SpellingInput
                word={quiz.currentQuestion.question.split('"')[1] || ''}
                meaning={quiz.currentQuestion.question.split('(')[1]?.split(')')[0] || ''}
                correctReading={quiz.currentQuestion.correctAnswer}
                onSubmit={handleSpellingAnswer}
                userAnswer={quiz.currentResult?.userAnswer}
                isCorrect={quiz.currentResult?.isCorrect}
              />
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
