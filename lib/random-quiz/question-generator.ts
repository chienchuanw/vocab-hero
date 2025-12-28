import { selectRandomVocabulary } from './vocabulary-selector';
import { generateDistractors, shuffleArray } from '../quiz/quiz-utils';

/**
 * Vocabulary Item
 */
export interface VocabularyItem {
  id: string;
  word: string;
  meaning: string;
  reading: string;
  groupId: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}

/**
 * Quiz Question Type
 */
export type QuestionType = 'multiple-choice' | 'spelling';

/**
 * Quiz Question
 */
export interface QuizQuestion {
  id: string;
  type: QuestionType;
  vocabularyId: string;
  question: string;
  correctAnswer: string;
  options?: string[]; // Only for multiple-choice
}

/**
 * 生成混合題型的測驗題目
 *
 * @param vocabulary - 單字列表
 * @param count - 題目數量
 * @returns 混合題型的題目陣列
 */
export function generateMixedQuestions(
  vocabulary: VocabularyItem[],
  count: number
): QuizQuestion[] {
  // 檢查是否有足夠的單字
  if (vocabulary.length < count) {
    throw new Error(
      `Not enough vocabulary items. Need ${count}, but only have ${vocabulary.length}`
    );
  }

  // 隨機選取單字
  const selectedVocabulary = selectRandomVocabulary(vocabulary, count);

  // 計算每種題型的數量（大致平衡）
  const multipleChoiceCount = Math.floor(count / 2);
  const spellingCount = count - multipleChoiceCount;

  const questions: QuizQuestion[] = [];

  // 生成選擇題
  for (let i = 0; i < multipleChoiceCount; i++) {
    const vocab = selectedVocabulary[i];
    const question = generateMultipleChoiceQuestion(vocab, vocabulary);
    questions.push(question);
  }

  // 生成拼寫題
  for (let i = multipleChoiceCount; i < count; i++) {
    const vocab = selectedVocabulary[i];
    const question = generateSpellingQuestion(vocab);
    questions.push(question);
  }

  // 洗牌題目順序
  return shuffleArray(questions);
}

/**
 * 生成選擇題
 */
function generateMultipleChoiceQuestion(
  vocab: VocabularyItem,
  allVocabulary: VocabularyItem[]
): QuizQuestion {
  // 隨機決定題目方向（單字→意思 或 意思→單字）
  const isWordToMeaning = Math.random() > 0.5;

  const question = isWordToMeaning
    ? `What is the meaning of "${vocab.word}"?`
    : `Which word means "${vocab.meaning}"?`;

  const correctAnswer = isWordToMeaning ? vocab.meaning : vocab.word;

  // 生成干擾選項
  const distractorItems = generateDistractors(vocab, allVocabulary, 3);
  const distractors = distractorItems.map((item) => (isWordToMeaning ? item.meaning : item.word));

  // 組合選項並洗牌
  const options = [correctAnswer, ...distractors];
  const shuffledOptions = shuffleArray(options);

  return {
    id: `mc-${vocab.id}`,
    type: 'multiple-choice',
    vocabularyId: vocab.id,
    question,
    correctAnswer,
    options: shuffledOptions,
  };
}

/**
 * 生成拼寫題
 */
function generateSpellingQuestion(vocab: VocabularyItem): QuizQuestion {
  return {
    id: `sp-${vocab.id}`,
    type: 'spelling',
    vocabularyId: vocab.id,
    question: `Type the reading of "${vocab.word}" (${vocab.meaning})`,
    correctAnswer: vocab.reading,
  };
}
