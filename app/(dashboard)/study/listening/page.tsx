'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ListeningQuestion } from '@/components/features/listening';
import { useStudySession } from '@/hooks/useStudySession';
import { useVocabulary } from '@/hooks/useVocabulary';
import {
  generateListeningQuestion,
  generateDistractors,
  validateListeningAnswer,
  calculateListeningStats,
} from '@/lib/listening';
import type {
  ListeningQuestion as ListeningQuestionType,
  ListeningAnswer,
  ListeningQuestionType as QuestionType,
} from '@/lib/listening';

/**
 * ListeningQuiz Page
 *
 * Main page for listening quiz mode where users hear Japanese audio
 * and select or type the correct meaning.
 */
export default function ListeningQuizPage() {
  const router = useRouter();
  const { data: vocabularyQueryData } = useVocabulary();
  const { startQuizSession, endSession, session } = useStudySession();

  const [questionType, setQuestionType] = useState<QuestionType>('multiple-choice');
  const [questionCount, setQuestionCount] = useState(10);
  const [maxReplays, setMaxReplays] = useState(3);
  const [isConfiguring, setIsConfiguring] = useState(true);
  const [questions, setQuestions] = useState<ListeningQuestionType[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<ListeningAnswer[]>([]);
  const [startTime, setStartTime] = useState<number>(0);
  const [isComplete, setIsComplete] = useState(false);

  // 從 infinite query 中提取所有單字資料
  const vocabularyData = vocabularyQueryData?.pages.flatMap((page) => page.items) ?? [];

  // Generate questions when quiz starts
  const handleStartQuiz = () => {
    if (!vocabularyData || vocabularyData.length === 0) {
      alert('No vocabulary available. Please add vocabulary first.');
      return;
    }

    // Generate questions
    const generatedQuestions: ListeningQuestionType[] = [];
    const vocabPool = [...vocabularyData].sort(() => Math.random() - 0.5);

    for (let i = 0; i < Math.min(questionCount, vocabPool.length); i++) {
      const vocab = vocabPool[i];
      if (!vocab) continue; // 跳過 undefined 的項目

      const distractors =
        questionType === 'multiple-choice' ? generateDistractors(vocabPool, vocab.meaning, 3) : [];

      const question = generateListeningQuestion(
        {
          id: vocab.id,
          word: vocab.word,
          reading: vocab.reading,
          meaning: vocab.meaning,
        },
        questionType,
        distractors
      );

      generatedQuestions.push(question);
    }

    setQuestions(generatedQuestions);
    setIsConfiguring(false);
    setStartTime(Date.now());

    // Start session
    const userId = 'default-user';
    startQuizSession(userId, {
      studyMode: 'LISTENING',
      questionCount: generatedQuestions.length,
    });
  };

  // Handle answer submission
  const handleAnswer = (answer: string) => {
    const currentQuestion = questions[currentIndex];
    if (!currentQuestion) return; // 防止 undefined

    const isCorrect = validateListeningAnswer(answer, currentQuestion.correctAnswer);
    const timeMs = Date.now() - startTime;

    const answerRecord: ListeningAnswer = {
      questionId: currentQuestion.id,
      answer,
      isCorrect,
      timeMs,
      replaysUsed: currentQuestion.replaysUsed,
    };

    const newAnswers = [...answers, answerRecord];
    setAnswers(newAnswers);

    // Move to next question or finish
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setStartTime(Date.now());
    } else {
      // Quiz complete
      setIsComplete(true);
      if (session) {
        const stats = calculateListeningStats(newAnswers);
        endSession(
          session.id,
          stats.totalQuestions,
          stats.correctAnswers,
          Math.round((Date.now() - startTime) / 60000)
        );
      }
    }
  };

  // Handle replay
  const handleReplay = () => {
    const updatedQuestions = [...questions];
    const currentQuestion = updatedQuestions[currentIndex];
    if (!currentQuestion) return; // 防止 undefined

    currentQuestion.replaysUsed += 1;
    setQuestions(updatedQuestions);
  };

  if (isConfiguring) {
    return (
      <div className="container max-w-2xl mx-auto py-8">
        <Card className="p-6">
          <h1 className="text-3xl font-bold mb-6">Listening Quiz</h1>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Question Type</label>
              <div className="flex gap-4">
                <Button
                  variant={questionType === 'multiple-choice' ? 'default' : 'outline'}
                  onClick={() => setQuestionType('multiple-choice')}
                >
                  Multiple Choice
                </Button>
                <Button
                  variant={questionType === 'typing' ? 'default' : 'outline'}
                  onClick={() => setQuestionType('typing')}
                >
                  Typing
                </Button>
              </div>
            </div>

            <Button onClick={handleStartQuiz} className="w-full" size="lg">
              Start Quiz
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (isComplete) {
    const stats = calculateListeningStats(answers);
    return (
      <div className="container max-w-2xl mx-auto py-8">
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-4">Quiz Complete!</h2>
          <div className="space-y-2">
            <p>Accuracy: {stats.accuracy.toFixed(1)}%</p>
            <p>
              Correct: {stats.correctAnswers}/{stats.totalQuestions}
            </p>
            <p>Total Replays: {stats.totalReplays}</p>
          </div>
          <Button onClick={() => router.push('/study')} className="mt-6">
            Back to Study
          </Button>
        </Card>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];

  // 如果沒有當前問題，顯示載入中
  if (!currentQuestion) {
    return (
      <div className="container max-w-2xl mx-auto py-8">
        <Card className="p-6">
          <p className="text-center text-gray-600">Loading question...</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl mx-auto py-8">
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          Question {currentIndex + 1} of {questions.length}
        </p>
      </div>

      <ListeningQuestion
        question={currentQuestion}
        onAnswer={handleAnswer}
        maxReplays={maxReplays}
        onReplay={handleReplay}
      />
    </div>
  );
}
