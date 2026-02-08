export interface ParsedSentence {
  japanese: string;
  english: string;
}

/**
 * 判斷字元是否為日文字元（平假名、片假名、漢字、全形標點符號）
 */
function isJapaneseCharacter(char: string): boolean {
  const code = char.charCodeAt(0);

  return (
    (code >= 0x3040 && code <= 0x309f) || // Hiragana
    (code >= 0x30a0 && code <= 0x30ff) || // Katakana
    (code >= 0x4e00 && code <= 0x9faf) || // Kanji
    (code >= 0x3000 && code <= 0x303f) || // CJK Symbols and Punctuation
    (code >= 0xff00 && code <= 0xffef) // Fullwidth Forms
  );
}

/**
 * 判斷一行文字的主要語言類型（根據字元數量的多數決定）
 */
function classifyLine(line: string): 'japanese' | 'english' | 'empty' {
  const trimmedLine = line.trim();

  if (trimmedLine.length === 0) {
    return 'empty';
  }

  let japaneseCount = 0;
  let totalCount = 0;

  for (const char of trimmedLine) {
    if (char.trim().length > 0) {
      totalCount++;
      if (isJapaneseCharacter(char)) {
        japaneseCount++;
      }
    }
  }

  if (totalCount === 0) {
    return 'empty';
  }

  return japaneseCount > totalCount / 2 ? 'japanese' : 'english';
}

/**
 * 解析 Duolingo 截圖的 OCR 文字，分離日文和英文內容
 */
export function parseDuolingoText(rawText: string): ParsedSentence {
  const lines = rawText.split('\n');

  const japaneseLines: string[] = [];
  const englishLines: string[] = [];

  for (const line of lines) {
    const classification = classifyLine(line);

    if (classification === 'japanese') {
      japaneseLines.push(line.trim());
    } else if (classification === 'english') {
      englishLines.push(line.trim());
    }
  }

  return {
    japanese: japaneseLines.join(' '),
    english: englishLines.join(' '),
  };
}
