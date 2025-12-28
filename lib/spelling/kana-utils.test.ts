import { describe, it, expect } from 'vitest';
import {
  hiraganaToKatakana,
  katakanaToHiragana,
  normalizeKana,
  isHiragana,
  isKatakana,
  isMixedKana,
} from './kana-utils';

describe('kana-utils', () => {
  describe('hiraganaToKatakana', () => {
    it('should convert hiragana to katakana', () => {
      expect(hiraganaToKatakana('あいうえお')).toBe('アイウエオ');
      expect(hiraganaToKatakana('かきくけこ')).toBe('カキクケコ');
      expect(hiraganaToKatakana('べんきょう')).toBe('ベンキョウ');
    });

    it('should handle mixed content', () => {
      expect(hiraganaToKatakana('ひらがなとEnglish')).toBe('ヒラガナトEnglish');
    });

    it('should handle empty string', () => {
      expect(hiraganaToKatakana('')).toBe('');
    });

    it('should preserve katakana', () => {
      expect(hiraganaToKatakana('カタカナ')).toBe('カタカナ');
    });
  });

  describe('katakanaToHiragana', () => {
    it('should convert katakana to hiragana', () => {
      expect(katakanaToHiragana('アイウエオ')).toBe('あいうえお');
      expect(katakanaToHiragana('カキクケコ')).toBe('かきくけこ');
      expect(katakanaToHiragana('ベンキョウ')).toBe('べんきょう');
    });

    it('should handle mixed content', () => {
      expect(katakanaToHiragana('カタカナとEnglish')).toBe('かたかなとEnglish');
    });

    it('should handle empty string', () => {
      expect(katakanaToHiragana('')).toBe('');
    });

    it('should preserve hiragana', () => {
      expect(katakanaToHiragana('ひらがな')).toBe('ひらがな');
    });
  });

  describe('normalizeKana', () => {
    it('should convert all kana to hiragana by default', () => {
      expect(normalizeKana('あいうアイウ')).toBe('あいうあいう');
      expect(normalizeKana('ベンキョウ')).toBe('べんきょう');
    });

    it('should convert all kana to katakana when specified', () => {
      expect(normalizeKana('あいうアイウ', 'katakana')).toBe('アイウアイウ');
      expect(normalizeKana('べんきょう', 'katakana')).toBe('ベンキョウ');
    });

    it('should handle empty string', () => {
      expect(normalizeKana('')).toBe('');
    });
  });

  describe('isHiragana', () => {
    it('should return true for hiragana strings', () => {
      expect(isHiragana('あいうえお')).toBe(true);
      expect(isHiragana('べんきょう')).toBe(true);
      expect(isHiragana('ひらがな')).toBe(true);
    });

    it('should return false for non-hiragana strings', () => {
      expect(isHiragana('カタカナ')).toBe(false);
      expect(isHiragana('English')).toBe(false);
      expect(isHiragana('あいうアイウ')).toBe(false);
      expect(isHiragana('')).toBe(false);
    });
  });

  describe('isKatakana', () => {
    it('should return true for katakana strings', () => {
      expect(isKatakana('アイウエオ')).toBe(true);
      expect(isKatakana('ベンキョウ')).toBe(true);
      expect(isKatakana('カタカナ')).toBe(true);
    });

    it('should return false for non-katakana strings', () => {
      expect(isKatakana('ひらがな')).toBe(false);
      expect(isKatakana('English')).toBe(false);
      expect(isKatakana('あいうアイウ')).toBe(false);
      expect(isKatakana('')).toBe(false);
    });
  });

  describe('isMixedKana', () => {
    it('should return true for mixed kana strings', () => {
      expect(isMixedKana('あいうアイウ')).toBe(true);
      expect(isMixedKana('ひらがなとカタカナ')).toBe(true);
    });

    it('should return false for pure hiragana', () => {
      expect(isMixedKana('ひらがな')).toBe(false);
    });

    it('should return false for pure katakana', () => {
      expect(isMixedKana('カタカナ')).toBe(false);
    });

    it('should return false for non-kana strings', () => {
      expect(isMixedKana('English')).toBe(false);
      expect(isMixedKana('')).toBe(false);
    });
  });
});

