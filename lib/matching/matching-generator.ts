/**
 * Matching Game Generator
 * 配對遊戲生成器 - 生成配對卡片和洗牌邏輯
 */

/**
 * Vocabulary Item
 */
export interface VocabularyItem {
  id: string;
  word: string;
  meaning: string;
  reading: string;
}

/**
 * Matching Card
 */
export interface MatchingCard {
  id: string;
  pairId: string;
  type: 'word' | 'meaning';
  content: string;
}

/**
 * 生成配對卡片
 * 從單字列表中隨機選取指定數量的配對
 *
 * @param vocabulary - 單字列表
 * @param pairCount - 配對數量（預設 5）
 * @returns 配對卡片陣列（未洗牌）
 */
export function generateMatchingPairs(
  vocabulary: VocabularyItem[],
  pairCount: number = 5
): MatchingCard[] {
  // 檢查是否有足夠的單字
  if (vocabulary.length < pairCount) {
    throw new Error(
      `Not enough vocabulary items. Need ${pairCount}, but only have ${vocabulary.length}`
    );
  }

  // 隨機選取指定數量的單字
  const selectedVocabulary = selectRandomItems(vocabulary, pairCount);

  // 為每個單字生成一對卡片（單字卡 + 意思卡）
  const cards: MatchingCard[] = [];

  selectedVocabulary.forEach((vocab, index) => {
    const pairId = `pair-${index}`;

    // 單字卡
    cards.push({
      id: `word-${vocab.id}`,
      pairId,
      type: 'word',
      content: vocab.word,
    });

    // 意思卡
    cards.push({
      id: `meaning-${vocab.id}`,
      pairId,
      type: 'meaning',
      content: vocab.meaning,
    });
  });

  return cards;
}

/**
 * 洗牌卡片
 * 使用 Fisher-Yates 演算法
 *
 * @param cards - 卡片陣列
 * @returns 洗牌後的卡片陣列（新陣列）
 */
export function shuffleCards<T>(cards: T[]): T[] {
  // 建立副本以避免修改原陣列
  const shuffled = [...cards];

  // Fisher-Yates 洗牌演算法
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
}

/**
 * 從陣列中隨機選取指定數量的項目
 *
 * @param items - 項目陣列
 * @param count - 要選取的數量
 * @returns 隨機選取的項目陣列
 */
function selectRandomItems<T>(items: T[], count: number): T[] {
  // 建立副本以避免修改原陣列
  const shuffled = shuffleCards(items);

  // 取前 count 個項目
  return shuffled.slice(0, count);
}

/**
 * 檢查兩張卡片是否配對
 *
 * @param card1 - 第一張卡片
 * @param card2 - 第二張卡片
 * @returns 是否配對成功
 */
export function isMatchingPair(card1: MatchingCard, card2: MatchingCard): boolean {
  // 檢查是否為同一對（pairId 相同）
  // 且類型不同（一個是單字，一個是意思）
  return card1.pairId === card2.pairId && card1.type !== card2.type;
}

/**
 * 生成並洗牌配對卡片
 * 這是一個便利函數，結合了生成和洗牌
 *
 * @param vocabulary - 單字列表
 * @param pairCount - 配對數量（預設 5）
 * @returns 洗牌後的配對卡片陣列
 */
export function generateShuffledPairs(
  vocabulary: VocabularyItem[],
  pairCount: number = 5
): MatchingCard[] {
  const pairs = generateMatchingPairs(vocabulary, pairCount);
  return shuffleCards(pairs);
}

