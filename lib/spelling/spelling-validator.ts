import { normalizeKana } from './kana-utils';

/**
 * Spelling Validation Result
 */
export interface SpellingValidationResult {
  isCorrect: boolean;
  normalizedUserAnswer: string;
  normalizedCorrectAnswer: string;
  feedback?: string;
}

/**
 * 驗證拼寫答案
 * 接受平假名/片假名互換
 *
 * @param userAnswer - 使用者輸入的答案
 * @param correctAnswer - 正確答案
 * @returns 驗證結果
 */
export function validateSpelling(
  userAnswer: string,
  correctAnswer: string
): SpellingValidationResult {
  // 移除前後空白
  const trimmedUserAnswer = userAnswer.trim();
  const trimmedCorrectAnswer = correctAnswer.trim();

  // 空答案視為錯誤
  if (!trimmedUserAnswer) {
    return {
      isCorrect: false,
      normalizedUserAnswer: '',
      normalizedCorrectAnswer: trimmedCorrectAnswer,
      feedback: 'Answer cannot be empty',
    };
  }

  // 將兩個答案都標準化為平假名進行比較
  const normalizedUser = normalizeKana(trimmedUserAnswer, 'hiragana');
  const normalizedCorrect = normalizeKana(trimmedCorrectAnswer, 'hiragana');

  // 比較標準化後的答案
  const isCorrect = normalizedUser === normalizedCorrect;

  return {
    isCorrect,
    normalizedUserAnswer: normalizedUser,
    normalizedCorrectAnswer: normalizedCorrect,
    feedback: isCorrect ? undefined : 'Incorrect spelling',
  };
}

/**
 * 計算兩個字串的相似度（Levenshtein Distance）
 * 可用於提供更詳細的反饋
 */
export function calculateSimilarity(str1: string, str2: string): number {
  const len1 = str1.length;
  const len2 = str2.length;

  // 建立距離矩陣
  const matrix: number[][] = Array(len1 + 1)
    .fill(null)
    .map(() => Array(len2 + 1).fill(0));

  // 初始化第一行和第一列
  for (let i = 0; i <= len1; i++) {
    matrix[i]![0] = i;
  }
  for (let j = 0; j <= len2; j++) {
    matrix[0]![j] = j;
  }

  // 計算編輯距離
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[i]![j] = Math.min(
        matrix[i - 1]![j]! + 1, // 刪除
        matrix[i]![j - 1]! + 1, // 插入
        matrix[i - 1]![j - 1]! + cost // 替換
      );
    }
  }

  const distance = matrix[len1]![len2]!;
  const maxLength = Math.max(len1, len2);

  // 返回相似度百分比（0-100）
  return maxLength === 0 ? 100 : ((maxLength - distance) / maxLength) * 100;
}

/**
 * 提供詳細的拼寫反饋
 * 指出哪些字元是錯誤的
 */
export function getDetailedFeedback(
  userAnswer: string,
  correctAnswer: string
): {
  isCorrect: boolean;
  similarity: number;
  incorrectPositions: number[];
  feedback: string;
} {
  const normalizedUser = normalizeKana(userAnswer.trim(), 'hiragana');
  const normalizedCorrect = normalizeKana(correctAnswer.trim(), 'hiragana');

  const isCorrect = normalizedUser === normalizedCorrect;
  const similarity = calculateSimilarity(normalizedUser, normalizedCorrect);

  // 找出錯誤的位置
  const incorrectPositions: number[] = [];
  const minLength = Math.min(normalizedUser.length, normalizedCorrect.length);

  for (let i = 0; i < minLength; i++) {
    if (normalizedUser[i] !== normalizedCorrect[i]) {
      incorrectPositions.push(i);
    }
  }

  // 如果長度不同，標記額外的字元
  if (normalizedUser.length !== normalizedCorrect.length) {
    const maxLength = Math.max(normalizedUser.length, normalizedCorrect.length);
    for (let i = minLength; i < maxLength; i++) {
      incorrectPositions.push(i);
    }
  }

  let feedback = '';
  if (isCorrect) {
    feedback = 'Perfect!';
  } else if (similarity >= 80) {
    feedback = 'Very close! Check your spelling carefully.';
  } else if (similarity >= 50) {
    feedback = 'Some characters are correct, but there are mistakes.';
  } else {
    feedback = 'Incorrect. Try again!';
  }

  return {
    isCorrect,
    similarity,
    incorrectPositions,
    feedback,
  };
}
