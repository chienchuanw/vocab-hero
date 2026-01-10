import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

describe('usePrefersReducedMotion', () => {
  let matchMediaMock: {
    matches: boolean;
    addEventListener: ReturnType<typeof vi.fn>;
    removeEventListener: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    matchMediaMock = {
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };

    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => matchMediaMock)
    );
  });

  it('should return false when prefers-reduced-motion is not set', () => {
    matchMediaMock.matches = false;

    const { result } = renderHook(() => usePrefersReducedMotion());

    expect(result.current).toBe(false);
  });

  it('should return true when prefers-reduced-motion: reduce', () => {
    matchMediaMock.matches = true;

    const { result } = renderHook(() => usePrefersReducedMotion());

    expect(result.current).toBe(true);
  });

  it('should listen to media query changes', () => {
    renderHook(() => usePrefersReducedMotion());

    expect(matchMediaMock.addEventListener).toHaveBeenCalledWith('change', expect.any(Function));
  });

  it('should update when media query changes', () => {
    matchMediaMock.matches = false;

    const { result, rerender } = renderHook(() => usePrefersReducedMotion());

    expect(result.current).toBe(false);

    matchMediaMock.matches = true;
    const changeHandler = matchMediaMock.addEventListener.mock.calls[0]?.[1];
    if (changeHandler) {
      changeHandler({ matches: true });
    }

    rerender();

    expect(result.current).toBe(true);
  });

  it('should cleanup event listener on unmount', () => {
    const { unmount } = renderHook(() => usePrefersReducedMotion());

    unmount();

    expect(matchMediaMock.removeEventListener).toHaveBeenCalledWith('change', expect.any(Function));
  });

  it('should call matchMedia with correct query string', () => {
    renderHook(() => usePrefersReducedMotion());

    expect(window.matchMedia).toHaveBeenCalledWith('(prefers-reduced-motion: reduce)');
  });
});
