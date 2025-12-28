import { describe, it, expect } from 'vitest';
import { validateSpelling, SpellingValidationResult } from './spelling-validator';

describe('spelling-validator', () => {
  describe('validateSpelling', () => {
    it('should accept exact match in hiragana', () => {
      const result = validateSpelling('べんきょう', 'べんきょう');

      expect(result.isCorrect).toBe(true);
      expect(result.normalizedUserAnswer).toBe('べんきょう');
      expect(result.normalizedCorrectAnswer).toBe('べんきょう');
    });

    it('should accept exact match in katakana', () => {
      const result = validateSpelling('コンピュータ', 'コンピュータ');

      expect(result.isCorrect).toBe(true);
    });

    it('should accept hiragana when correct answer is katakana', () => {
      const result = validateSpelling('こんぴゅーた', 'コンピュータ');

      expect(result.isCorrect).toBe(true);
      expect(result.normalizedUserAnswer).toBe('こんぴゅーた');
      expect(result.normalizedCorrectAnswer).toBe('こんぴゅーた');
    });

    it('should accept katakana when correct answer is hiragana', () => {
      const result = validateSpelling('ベンキョウ', 'べんきょう');

      expect(result.isCorrect).toBe(true);
      expect(result.normalizedUserAnswer).toBe('べんきょう');
      expect(result.normalizedCorrectAnswer).toBe('べんきょう');
    });

    it('should reject incorrect answer', () => {
      const result = validateSpelling('べんきよう', 'べんきょう');

      expect(result.isCorrect).toBe(false);
    });

    it('should reject completely different answer', () => {
      const result = validateSpelling('たべる', 'べんきょう');

      expect(result.isCorrect).toBe(false);
    });

    it('should handle empty user answer', () => {
      const result = validateSpelling('', 'べんきょう');

      expect(result.isCorrect).toBe(false);
    });

    it('should handle whitespace in user answer', () => {
      const result = validateSpelling('  べんきょう  ', 'べんきょう');

      expect(result.isCorrect).toBe(true);
    });

    it('should be case-insensitive for kana', () => {
      const result = validateSpelling('ベンキョウ', 'べんきょう');

      expect(result.isCorrect).toBe(true);
    });

    it('should handle mixed hiragana and katakana in user answer', () => {
      const result = validateSpelling('べんキョう', 'べんきょう');

      expect(result.isCorrect).toBe(true);
    });

    it('should provide feedback for incorrect answer', () => {
      const result = validateSpelling('べんきよう', 'べんきょう');

      expect(result.isCorrect).toBe(false);
      expect(result.feedback).toBeDefined();
    });

    it('should handle long vowel marks', () => {
      const result = validateSpelling('こんぴゅーたー', 'コンピュータ');

      expect(result.isCorrect).toBe(false); // Different length
    });

    it('should accept answer with different kana but same pronunciation', () => {
      // This tests the normalization - both should normalize to the same hiragana
      const result = validateSpelling('ベンキョウ', 'べんきょう');

      expect(result.isCorrect).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should handle single character', () => {
      const result = validateSpelling('あ', 'あ');
      expect(result.isCorrect).toBe(true);
    });

    it('should handle single character mismatch', () => {
      const result = validateSpelling('あ', 'い');
      expect(result.isCorrect).toBe(false);
    });

    it('should handle numbers and special characters', () => {
      const result = validateSpelling('123', 'べんきょう');
      expect(result.isCorrect).toBe(false);
    });

    it('should handle mixed Japanese and English', () => {
      const result = validateSpelling('べんきょうstudy', 'べんきょう');
      expect(result.isCorrect).toBe(false);
    });
  });
});

