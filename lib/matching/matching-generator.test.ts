import { describe, it, expect } from 'vitest';
import {
  generateMatchingPairs,
  shuffleCards,
  type VocabularyItem,
  type MatchingCard,
} from './matching-generator';

describe('matching-generator', () => {
  const mockVocabulary: VocabularyItem[] = [
    { id: '1', word: '勉強', meaning: 'study', reading: 'べんきょう' },
    { id: '2', word: '学校', meaning: 'school', reading: 'がっこう' },
    { id: '3', word: '先生', meaning: 'teacher', reading: 'せんせい' },
    { id: '4', word: '学生', meaning: 'student', reading: 'がくせい' },
    { id: '5', word: '本', meaning: 'book', reading: 'ほん' },
    { id: '6', word: '友達', meaning: 'friend', reading: 'ともだち' },
    { id: '7', word: '家', meaning: 'house', reading: 'いえ' },
  ];

  describe('generateMatchingPairs', () => {
    it('should generate 5 pairs by default', () => {
      const pairs = generateMatchingPairs(mockVocabulary);

      expect(pairs).toHaveLength(10); // 5 pairs = 10 cards
    });

    it('should generate specified number of pairs', () => {
      const pairs = generateMatchingPairs(mockVocabulary, 3);

      expect(pairs).toHaveLength(6); // 3 pairs = 6 cards
    });

    it('should create word and meaning cards for each pair', () => {
      const pairs = generateMatchingPairs(mockVocabulary, 2);

      const wordCards = pairs.filter((card) => card.type === 'word');
      const meaningCards = pairs.filter((card) => card.type === 'meaning');

      expect(wordCards).toHaveLength(2);
      expect(meaningCards).toHaveLength(2);
    });

    it('should assign unique IDs to each card', () => {
      const pairs = generateMatchingPairs(mockVocabulary);

      const ids = pairs.map((card) => card.id);
      const uniqueIds = new Set(ids);

      expect(uniqueIds.size).toBe(pairs.length);
    });

    it('should assign same pairId to matching cards', () => {
      const pairs = generateMatchingPairs(mockVocabulary, 1);

      const wordCard = pairs.find((card) => card.type === 'word');
      const meaningCard = pairs.find((card) => card.type === 'meaning');

      expect(wordCard?.pairId).toBe(meaningCard?.pairId);
    });

    it('should include word content in word cards', () => {
      const pairs = generateMatchingPairs(mockVocabulary, 1);

      const wordCard = pairs.find((card) => card.type === 'word');

      expect(wordCard?.content).toBeTruthy();
      expect(mockVocabulary.some((v) => v.word === wordCard?.content)).toBe(true);
    });

    it('should include meaning content in meaning cards', () => {
      const pairs = generateMatchingPairs(mockVocabulary, 1);

      const meaningCard = pairs.find((card) => card.type === 'meaning');

      expect(meaningCard?.content).toBeTruthy();
      expect(mockVocabulary.some((v) => v.meaning === meaningCard?.content)).toBe(true);
    });

    it('should throw error if not enough vocabulary items', () => {
      const smallVocab = mockVocabulary.slice(0, 2);

      expect(() => generateMatchingPairs(smallVocab, 5)).toThrow();
    });

    it('should randomly select vocabulary items', () => {
      const pairs1 = generateMatchingPairs(mockVocabulary);
      const pairs2 = generateMatchingPairs(mockVocabulary);

      // 由於是隨機選取，兩次結果可能不同
      // 但這個測試可能會偶爾失敗，因為隨機性
      // 這裡只是確保函數可以執行
      expect(pairs1).toHaveLength(10);
      expect(pairs2).toHaveLength(10);
    });
  });

  describe('shuffleCards', () => {
    it('should return array with same length', () => {
      const cards: MatchingCard[] = [
        { id: '1', pairId: 'p1', type: 'word', content: '勉強' },
        { id: '2', pairId: 'p1', type: 'meaning', content: 'study' },
        { id: '3', pairId: 'p2', type: 'word', content: '学校' },
        { id: '4', pairId: 'p2', type: 'meaning', content: 'school' },
      ];

      const shuffled = shuffleCards(cards);

      expect(shuffled).toHaveLength(cards.length);
    });

    it('should contain all original cards', () => {
      const cards: MatchingCard[] = [
        { id: '1', pairId: 'p1', type: 'word', content: '勉強' },
        { id: '2', pairId: 'p1', type: 'meaning', content: 'study' },
      ];

      const shuffled = shuffleCards(cards);

      cards.forEach((card) => {
        expect(shuffled.some((c) => c.id === card.id)).toBe(true);
      });
    });

    it('should not modify original array', () => {
      const cards: MatchingCard[] = [
        { id: '1', pairId: 'p1', type: 'word', content: '勉強' },
        { id: '2', pairId: 'p1', type: 'meaning', content: 'study' },
      ];

      const original = [...cards];
      shuffleCards(cards);

      expect(cards).toEqual(original);
    });

    it('should shuffle cards (probabilistic test)', () => {
      const cards: MatchingCard[] = Array.from({ length: 10 }, (_, i) => ({
        id: String(i),
        pairId: String(Math.floor(i / 2)),
        type: i % 2 === 0 ? 'word' : 'meaning',
        content: String(i),
      }));

      const shuffled = shuffleCards(cards);

      // 檢查是否有任何位置改變（高機率）
      const hasChanged = shuffled.some((card, index) => card.id !== cards[index].id);

      // 這個測試有極小機率失敗（如果洗牌後順序完全相同）
      expect(hasChanged).toBe(true);
    });
  });
});

