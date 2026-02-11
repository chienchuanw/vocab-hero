import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * 合併 Tailwind CSS 類別名稱，避免衝突
 *
 * @param inputs - 要合併的類別名稱
 * @returns 合併後的類別名稱字串
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

