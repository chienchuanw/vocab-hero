/**
 * Listening Quiz Types
 * Type definitions for listening quiz functionality
 */

/**
 * Type of listening question
 */
export type ListeningQuestionType = 'multiple-choice' | 'typing';

/**
 * Listening quiz configuration
 */
export interface ListeningQuizConfig {
  /**
   * Type of questions to generate
   */
  questionType: ListeningQuestionType;

  /**
   * Number of questions in the quiz
   */
  questionCount: number;

  /**
   * Maximum number of replay attempts per question
   */
  maxReplays: number;

  /**
   * Vocabulary group IDs to include
   */
  groupIds?: string[];

  /**
   * Specific vocabulary IDs to include
   */
  vocabularyIds?: string[];
}

/**
 * Listening question data
 */
export interface ListeningQuestion {
  /**
   * Question ID
   */
  id: string;

  /**
   * Vocabulary item being tested
   */
  vocabularyId: string;

  /**
   * Japanese word to be spoken
   */
  word: string;

  /**
   * Reading (hiragana/katakana)
   */
  reading: string;

  /**
   * Correct answer (meaning)
   */
  correctAnswer: string;

  /**
   * Question type
   */
  type: ListeningQuestionType;

  /**
   * Answer options (for multiple choice)
   */
  options?: string[];

  /**
   * Number of times audio has been replayed
   */
  replaysUsed: number;
}

/**
 * User's answer to a listening question
 */
export interface ListeningAnswer {
  /**
   * Question ID
   */
  questionId: string;

  /**
   * User's answer
   */
  answer: string;

  /**
   * Whether the answer is correct
   */
  isCorrect: boolean;

  /**
   * Time taken to answer (milliseconds)
   */
  timeMs: number;

  /**
   * Number of replays used
   */
  replaysUsed: number;
}

/**
 * Listening quiz session state
 */
export interface ListeningQuizState {
  /**
   * Quiz configuration
   */
  config: ListeningQuizConfig;

  /**
   * All questions in the quiz
   */
  questions: ListeningQuestion[];

  /**
   * Current question index
   */
  currentQuestionIndex: number;

  /**
   * User's answers
   */
  answers: ListeningAnswer[];

  /**
   * Quiz start time
   */
  startedAt: Date;

  /**
   * Quiz completion time
   */
  completedAt?: Date;

  /**
   * Whether quiz is complete
   */
  isComplete: boolean;
}

/**
 * Listening quiz statistics
 */
export interface ListeningQuizStats {
  /**
   * Total questions
   */
  totalQuestions: number;

  /**
   * Correct answers
   */
  correctAnswers: number;

  /**
   * Accuracy percentage
   */
  accuracy: number;

  /**
   * Average time per question (seconds)
   */
  averageTimeSeconds: number;

  /**
   * Total replays used
   */
  totalReplays: number;

  /**
   * Average replays per question
   */
  averageReplays: number;
}

