import type {
  ListeningQuestion,
  ListeningQuestionType,
  ListeningAnswer,
  ListeningQuizStats,
} from './listening.types';

/**
 * Vocabulary item interface for question generation
 */
interface VocabularyItem {
  id: string;
  word: string;
  reading: string;
  meaning: string;
}

/**
 * Generate a listening question from vocabulary item
 *
 * @param vocabulary - Vocabulary item to create question from
 * @param type - Type of question (multiple-choice or typing)
 * @param distractors - Wrong answer options for multiple choice
 * @returns Generated listening question
 */
export function generateListeningQuestion(
  vocabulary: VocabularyItem,
  type: ListeningQuestionType,
  distractors: string[] = []
): ListeningQuestion {
  const question: ListeningQuestion = {
    id: `listening-${vocabulary.id}-${Date.now()}`,
    vocabularyId: vocabulary.id,
    word: vocabulary.word,
    reading: vocabulary.reading,
    correctAnswer: vocabulary.meaning,
    type,
    replaysUsed: 0,
  };

  // Add options for multiple choice questions
  if (type === 'multiple-choice') {
    const options = [vocabulary.meaning, ...distractors.slice(0, 3)];
    question.options = shuffleArray(options);
  }

  return question;
}

/**
 * Calculate statistics from listening quiz answers
 *
 * @param answers - List of user answers
 * @returns Calculated statistics
 */
export function calculateListeningStats(answers: ListeningAnswer[]): ListeningQuizStats {
  if (answers.length === 0) {
    return {
      totalQuestions: 0,
      correctAnswers: 0,
      accuracy: 0,
      averageTimeSeconds: 0,
      totalReplays: 0,
      averageReplays: 0,
    };
  }

  const correctAnswers = answers.filter((a) => a.isCorrect).length;
  const totalTime = answers.reduce((sum, a) => sum + a.timeMs, 0);
  const totalReplays = answers.reduce((sum, a) => sum + a.replaysUsed, 0);

  return {
    totalQuestions: answers.length,
    correctAnswers,
    accuracy: (correctAnswers / answers.length) * 100,
    averageTimeSeconds: Math.round(totalTime / answers.length / 1000),
    totalReplays,
    averageReplays: totalReplays / answers.length,
  };
}

/**
 * Check if audio can be replayed for a question
 *
 * @param question - The listening question
 * @param maxReplays - Maximum allowed replays (0 for unlimited)
 * @returns Whether replay is allowed
 */
export function canReplayAudio(question: ListeningQuestion, maxReplays: number): boolean {
  // Allow unlimited replays if maxReplays is 0
  if (maxReplays === 0) {
    return true;
  }

  return question.replaysUsed < maxReplays;
}

/**
 * Shuffle array using Fisher-Yates algorithm
 *
 * @param array - Array to shuffle
 * @returns Shuffled array
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = shuffled[i];
    shuffled[i] = shuffled[j]!;
    shuffled[j] = temp!;
  }
  return shuffled;
}

/**
 * Validate user answer against correct answer
 *
 * @param userAnswer - User's answer
 * @param correctAnswer - Correct answer
 * @returns Whether the answer is correct
 */
export function validateListeningAnswer(userAnswer: string, correctAnswer: string): boolean {
  // Normalize both answers for comparison
  const normalizedUser = userAnswer.trim().toLowerCase();
  const normalizedCorrect = correctAnswer.trim().toLowerCase();

  return normalizedUser === normalizedCorrect;
}

/**
 * Generate distractor options from vocabulary pool
 *
 * @param vocabularyPool - Pool of vocabulary items
 * @param correctAnswer - The correct answer to exclude
 * @param count - Number of distractors to generate
 * @returns Array of distractor meanings
 */
export function generateDistractors(
  vocabularyPool: VocabularyItem[],
  correctAnswer: string,
  count: number = 3
): string[] {
  const distractors = vocabularyPool
    .filter((v) => v.meaning !== correctAnswer)
    .map((v) => v.meaning);

  // Shuffle and take required count
  const shuffled = shuffleArray(distractors);
  return shuffled.slice(0, count);
}
