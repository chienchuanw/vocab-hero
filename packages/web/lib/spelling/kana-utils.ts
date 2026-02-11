/**
 * Kana Utilities
 * 平假名與片假名轉換工具
 */

/**
 * 平假名 Unicode 範圍: U+3040 - U+309F
 * 片假名 Unicode 範圍: U+30A0 - U+30FF
 * 平假名與片假名的 Unicode 差值為 0x60 (96)
 */

const HIRAGANA_START = 0x3040;
const HIRAGANA_END = 0x309f;
const KATAKANA_START = 0x30a0;
const KATAKANA_END = 0x30ff;
const KANA_OFFSET = 0x60;

/**
 * 將平假名轉換為片假名
 */
export function hiraganaToKatakana(text: string): string {
  return text
    .split('')
    .map((char) => {
      const code = char.charCodeAt(0);
      // 檢查是否為平假名
      if (code >= HIRAGANA_START && code <= HIRAGANA_END) {
        return String.fromCharCode(code + KANA_OFFSET);
      }
      return char;
    })
    .join('');
}

/**
 * 將片假名轉換為平假名
 */
export function katakanaToHiragana(text: string): string {
  return text
    .split('')
    .map((char) => {
      const code = char.charCodeAt(0);

      // 片假名長音符號「ー」(U+30FC) 保持不變
      // 在平假名中也使用相同的長音符號
      if (char === 'ー') {
        return char;
      }

      // 檢查是否為片假名
      if (code >= KATAKANA_START && code <= KATAKANA_END) {
        return String.fromCharCode(code - KANA_OFFSET);
      }
      return char;
    })
    .join('');
}

/**
 * 標準化假名（統一轉換為平假名或片假名）
 */
export function normalizeKana(text: string, target: 'hiragana' | 'katakana' = 'hiragana'): string {
  if (target === 'katakana') {
    return hiraganaToKatakana(text);
  }
  return katakanaToHiragana(text);
}

/**
 * 檢查字串是否為純平假名
 */
export function isHiragana(text: string): boolean {
  if (!text || text.length === 0) return false;

  return text.split('').every((char) => {
    const code = char.charCodeAt(0);
    return code >= HIRAGANA_START && code <= HIRAGANA_END;
  });
}

/**
 * 檢查字串是否為純片假名
 */
export function isKatakana(text: string): boolean {
  if (!text || text.length === 0) return false;

  return text.split('').every((char) => {
    const code = char.charCodeAt(0);
    return code >= KATAKANA_START && code <= KATAKANA_END;
  });
}

/**
 * 檢查字串是否包含混合的平假名和片假名
 */
export function isMixedKana(text: string): boolean {
  if (!text || text.length === 0) return false;

  let hasHiragana = false;
  let hasKatakana = false;

  for (const char of text) {
    const code = char.charCodeAt(0);

    if (code >= HIRAGANA_START && code <= HIRAGANA_END) {
      hasHiragana = true;
    } else if (code >= KATAKANA_START && code <= KATAKANA_END) {
      hasKatakana = true;
    }

    // 如果同時包含平假名和片假名，立即返回 true
    if (hasHiragana && hasKatakana) {
      return true;
    }
  }

  return false;
}

/**
 * 檢查字元是否為假名（平假名或片假名）
 */
export function isKana(char: string): boolean {
  if (!char || char.length === 0) return false;

  const code = char.charCodeAt(0);
  return (
    (code >= HIRAGANA_START && code <= HIRAGANA_END) ||
    (code >= KATAKANA_START && code <= KATAKANA_END)
  );
}

/**
 * 計算字串中假名的數量
 */
export function countKana(text: string): number {
  if (!text) return 0;

  return text.split('').filter((char) => isKana(char)).length;
}

/**
 * 移除字串中的所有假名
 */
export function removeKana(text: string): string {
  return text
    .split('')
    .filter((char) => !isKana(char))
    .join('');
}
