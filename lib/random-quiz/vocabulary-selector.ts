/**
 * Vocabulary Selector
 * 隨機單字選取器 - 跨所有 Group 選取單字
 */

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
 * 從所有單字中隨機選取指定數量
 *
 * @param vocabulary - 單字列表
 * @param count - 要選取的數量
 * @returns 隨機選取的單字陣列
 */
export function selectRandomVocabulary(
  vocabulary: VocabularyItem[],
  count: number
): VocabularyItem[] {
  // 檢查是否有足夠的單字
  if (vocabulary.length < count) {
    throw new Error(
      `Not enough vocabulary items. Need ${count}, but only have ${vocabulary.length}`
    );
  }

  // 使用 Fisher-Yates 洗牌演算法
  const shuffled = [...vocabulary];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  // 取前 count 個項目
  return shuffled.slice(0, count);
}

/**
 * 根據難度選取單字
 *
 * @param vocabulary - 單字列表
 * @param count - 要選取的數量
 * @param difficulty - 難度等級（可選）
 * @returns 選取的單字陣列
 */
export function selectVocabularyByDifficulty(
  vocabulary: VocabularyItem[],
  count: number,
  difficulty?: 'easy' | 'medium' | 'hard'
): VocabularyItem[] {
  // 如果沒有指定難度，隨機選取所有單字
  if (!difficulty) {
    return selectRandomVocabulary(vocabulary, count);
  }

  // 篩選指定難度的單字
  const filtered = vocabulary.filter((v) => v.difficulty === difficulty);

  // 檢查是否有足夠的單字
  if (filtered.length < count) {
    throw new Error(
      `Not enough ${difficulty} vocabulary items. Need ${count}, but only have ${filtered.length}`
    );
  }

  // 從篩選後的單字中隨機選取
  return selectRandomVocabulary(filtered, count);
}

/**
 * 從多個 Group 中平均選取單字
 *
 * @param vocabulary - 單字列表
 * @param count - 要選取的數量
 * @returns 選取的單字陣列
 */
export function selectVocabularyFromGroups(
  vocabulary: VocabularyItem[],
  count: number
): VocabularyItem[] {
  // 按 groupId 分組
  const groups = new Map<string, VocabularyItem[]>();

  vocabulary.forEach((item) => {
    const groupItems = groups.get(item.groupId) || [];
    groupItems.push(item);
    groups.set(item.groupId, groupItems);
  });

  // 計算每個 group 應該選取的數量
  const groupCount = groups.size;
  const itemsPerGroup = Math.floor(count / groupCount);
  const remainder = count % groupCount;

  const selected: VocabularyItem[] = [];

  // 從每個 group 中選取
  let groupIndex = 0;
  for (const [groupId, items] of groups) {
    // 前幾個 group 多選一個（處理餘數）
    const selectCount = itemsPerGroup + (groupIndex < remainder ? 1 : 0);

    // 如果該 group 的單字不夠，選取所有
    const actualCount = Math.min(selectCount, items.length);

    const groupSelected = selectRandomVocabulary(items, actualCount);
    selected.push(...groupSelected);

    groupIndex++;
  }

  // 如果選取的數量不足（某些 group 單字太少），從剩餘單字中補充
  if (selected.length < count) {
    const remaining = vocabulary.filter((v) => !selected.some((s) => s.id === v.id));
    const additional = selectRandomVocabulary(remaining, count - selected.length);
    selected.push(...additional);
  }

  // 洗牌以避免按 group 排序
  return selectRandomVocabulary(selected, selected.length);
}

/**
 * 混合難度選取單字
 * 按照指定比例選取不同難度的單字
 *
 * @param vocabulary - 單字列表
 * @param count - 要選取的數量
 * @param easyRatio - 簡單單字的比例（0-1）
 * @param mediumRatio - 中等單字的比例（0-1）
 * @param hardRatio - 困難單字的比例（0-1）
 * @returns 選取的單字陣列
 */
export function selectMixedDifficulty(
  vocabulary: VocabularyItem[],
  count: number,
  easyRatio: number = 0.4,
  mediumRatio: number = 0.4,
  hardRatio: number = 0.2
): VocabularyItem[] {
  const easyCount = Math.floor(count * easyRatio);
  const mediumCount = Math.floor(count * mediumRatio);
  const hardCount = count - easyCount - mediumCount;

  const selected: VocabularyItem[] = [];

  try {
    const easy = selectVocabularyByDifficulty(vocabulary, easyCount, 'easy');
    selected.push(...easy);
  } catch {
    // 如果簡單單字不夠，跳過
  }

  try {
    const medium = selectVocabularyByDifficulty(vocabulary, mediumCount, 'medium');
    selected.push(...medium);
  } catch {
    // 如果中等單字不夠，跳過
  }

  try {
    const hard = selectVocabularyByDifficulty(vocabulary, hardCount, 'hard');
    selected.push(...hard);
  } catch {
    // 如果困難單字不夠，跳過
  }

  // 如果選取的數量不足，從所有單字中補充
  if (selected.length < count) {
    const remaining = vocabulary.filter((v) => !selected.some((s) => s.id === v.id));
    const additional = selectRandomVocabulary(remaining, count - selected.length);
    selected.push(...additional);
  }

  return selectRandomVocabulary(selected, selected.length);
}

