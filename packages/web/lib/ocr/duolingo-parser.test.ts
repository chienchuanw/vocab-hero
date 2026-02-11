import { describe, it, expect } from 'vitest';
import { parseDuolingoText } from './duolingo-parser';

describe('parseDuolingoText', () => {
  it('should extract Japanese and English from mixed text', () => {
    const input =
      'ちょっと暑いんだけど、窓を開けてくれない?\nIt is a little hot, so would you mind opening the window for me?';
    const result = parseDuolingoText(input);

    expect(result.japanese).toBe('ちょっと暑いんだけど、窓を開けてくれない?');
    expect(result.english).toBe('It is a little hot, so would you mind opening the window for me?');
  });

  it('should handle only Japanese input', () => {
    const input = '今日は天気がいいです';
    const result = parseDuolingoText(input);

    expect(result.japanese).toBe('今日は天気がいいです');
    expect(result.english).toBe('');
  });

  it('should handle only English input', () => {
    const input = 'Hello world';
    const result = parseDuolingoText(input);

    expect(result.japanese).toBe('');
    expect(result.english).toBe('Hello world');
  });

  it('should handle empty input', () => {
    const input = '';
    const result = parseDuolingoText(input);

    expect(result.japanese).toBe('');
    expect(result.english).toBe('');
  });

  it('should handle multi-line Japanese and English', () => {
    const input = '私は学生です。\n毎日勉強しています。\nI am a student.\nI study every day.';
    const result = parseDuolingoText(input);

    expect(result.japanese).toBe('私は学生です。 毎日勉強しています。');
    expect(result.english).toBe('I am a student. I study every day.');
  });

  it('should trim whitespace from results', () => {
    const input = '  こんにちは  \n  Hello  ';
    const result = parseDuolingoText(input);

    expect(result.japanese).toBe('こんにちは');
    expect(result.english).toBe('Hello');
  });

  it('should handle OCR noise with extra newlines and spaces', () => {
    const input = '\n\nこんにちは\n\n\nHello\n\n';
    const result = parseDuolingoText(input);

    expect(result.japanese).toBe('こんにちは');
    expect(result.english).toBe('Hello');
  });

  it('should handle mixed lines by majority character type', () => {
    const input = 'こんにちは123\nHello世界';
    const result = parseDuolingoText(input);

    // "こんにちは123" has majority Japanese characters
    // "Hello世界" has majority Latin characters
    expect(result.japanese).toBe('こんにちは123');
    expect(result.english).toBe('Hello世界');
  });

  it('should handle fullwidth punctuation as Japanese', () => {
    const input = 'こんにちは、元気ですか?\nHello, how are you?';
    const result = parseDuolingoText(input);

    expect(result.japanese).toBe('こんにちは、元気ですか?');
    expect(result.english).toBe('Hello, how are you?');
  });

  it('should concatenate multiple Japanese lines with spaces', () => {
    const input = '私は\n学生です';
    const result = parseDuolingoText(input);

    expect(result.japanese).toBe('私は 学生です');
  });

  it('should concatenate multiple English lines with spaces', () => {
    const input = 'I am\na student';
    const result = parseDuolingoText(input);

    expect(result.english).toBe('I am a student');
  });
});
