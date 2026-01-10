'use client';

import { useEffect, useState } from 'react';

/**
 * usePrefersReducedMotion Hook
 * 偵測使用者是否偏好減少動畫（prefers-reduced-motion: reduce）
 * 用於無障礙設計，尊重使用者的動畫偏好設定
 */
export function usePrefersReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener('change', handler);

    return () => {
      mediaQuery.removeEventListener('change', handler);
    };
  }, []);

  return prefersReducedMotion;
}
