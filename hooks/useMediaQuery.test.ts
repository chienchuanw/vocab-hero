import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useMediaQuery } from './useMediaQuery';

describe('useMediaQuery', () => {
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

  it('should return false when media query does not match', () => {
    matchMediaMock.matches = false;

    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'));

    expect(result.current).toBe(false);
  });

  it('should return true when media query matches', () => {
    matchMediaMock.matches = true;

    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'));

    expect(result.current).toBe(true);
  });

  it('should update when media query changes', () => {
    matchMediaMock.matches = false;

    const { result, rerender } = renderHook(() => useMediaQuery('(min-width: 768px)'));

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
    const { unmount } = renderHook(() => useMediaQuery('(min-width: 768px)'));

    unmount();

    expect(matchMediaMock.removeEventListener).toHaveBeenCalledWith('change', expect.any(Function));
  });

  it('should handle mobile breakpoint (max-width: 767px)', () => {
    matchMediaMock.matches = true;

    const { result } = renderHook(() => useMediaQuery('(max-width: 767px)'));

    expect(result.current).toBe(true);
  });

  it('should handle tablet breakpoint (min-width: 768px)', () => {
    matchMediaMock.matches = true;

    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'));

    expect(result.current).toBe(true);
  });

  it('should handle desktop breakpoint (min-width: 1024px)', () => {
    matchMediaMock.matches = false;

    const { result } = renderHook(() => useMediaQuery('(min-width: 1024px)'));

    expect(result.current).toBe(false);
  });
});
