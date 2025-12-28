/**
 * Quiz Utilities
 * Provides utility functions for quiz question generation and management
 */

export interface VocabularyItem {
  id: string;
  word: string;
  reading: string;
  meaning: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: VocabularyItem;
  type: 'WORD_TO_MEANING' | 'MEANING_TO_WORD';
}

/**
 * Shuffle an array using Fisher-Yates algorithm
 * Returns a new shuffled array without modifying the original
 *
 * @param array - Array to shuffle
 * @returns New shuffled array
 */
export function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = result[i];
    result[i] = result[j]!;
    result[j] = temp!;
  }
  return result;
}

/**
 * Generate distractor options for a quiz question
 * Selects random vocabulary items from the pool, excluding the correct answer
 *
 * @param correctAnswer - The correct vocabulary item
 * @param vocabularyPool - Pool of vocabulary items to select from
 * @param count - Number of distractors to generate
 * @returns Array of distractor vocabulary items
 */
export function generateDistractors(
  correctAnswer: VocabularyItem,
  vocabularyPool: VocabularyItem[],
  count: number
): VocabularyItem[] {
  // Filter out the correct answer from the pool
  const availableItems = vocabularyPool.filter((item) => item.id !== correctAnswer.id);

  // If not enough items available, return what we have
  if (availableItems.length <= count) {
    return shuffleArray(availableItems);
  }

  // Randomly select the requested number of distractors
  const shuffled = shuffleArray(availableItems);
  return shuffled.slice(0, count);
}

/**
 * Generate quiz questions from a vocabulary pool
 * Creates multiple choice questions with 4 options each
 *
 * @param vocabularyPool - Pool of vocabulary items to generate questions from
 * @param questionCount - Number of questions to generate
 * @param quizType - Type of quiz (WORD_TO_MEANING or MEANING_TO_WORD)
 * @returns Array of quiz questions
 */
export function generateQuizQuestions(
  vocabularyPool: VocabularyItem[],
  questionCount: number,
  quizType: 'WORD_TO_MEANING' | 'MEANING_TO_WORD' | 'MIXED'
): QuizQuestion[] {
  // Limit question count to available vocabulary
  const actualCount = Math.min(questionCount, vocabularyPool.length);

  // Shuffle and select vocabulary items for questions
  const shuffledPool = shuffleArray(vocabularyPool);
  const selectedItems = shuffledPool.slice(0, actualCount);

  // Generate questions
  return selectedItems.map((item, index) => {
    // Determine question type
    let questionType: 'WORD_TO_MEANING' | 'MEANING_TO_WORD';
    if (quizType === 'MIXED') {
      questionType = Math.random() < 0.5 ? 'WORD_TO_MEANING' : 'MEANING_TO_WORD';
    } else {
      questionType = quizType;
    }

    // Generate distractors
    const distractors = generateDistractors(item, vocabularyPool, 3);

    // Create options based on question type
    let options: string[];
    let question: string;

    if (questionType === 'WORD_TO_MEANING') {
      // Question shows Japanese word, options are meanings
      question = `What is the meaning of "${item.word}" (${item.reading})?`;
      options = [item.meaning, ...distractors.map((d) => d.meaning)];
    } else {
      // Question shows meaning, options are Japanese words
      question = `Which word means "${item.meaning}"?`;
      options = [item.word, ...distractors.map((d) => d.word)];
    }

    // Shuffle options so correct answer is not always first
    const shuffledOptions = shuffleArray(options);

    return {
      id: `question-${index + 1}`,
      question,
      options: shuffledOptions,
      correctAnswer: item,
      type: questionType,
    };
  });
}
