import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useSwipeGesture } from './useSwipeGesture';

describe('useSwipeGesture', () => {
  let element: HTMLDivElement;
  let onSwipeLeft: () => void;
  let onSwipeRight: () => void;

  beforeEach(() => {
    element = document.createElement('div');
    onSwipeLeft = vi.fn();
    onSwipeRight = vi.fn();
  });

  it('should call onSwipeLeft when swiping left', () => {
    renderHook(() =>
      useSwipeGesture({
        elementRef: { current: element },
        onSwipeLeft,
        onSwipeRight,
      })
    );

    const touchStart = new TouchEvent('touchstart', {
      touches: [{ clientX: 100, clientY: 50 } as Touch],
    });
    const touchEnd = new TouchEvent('touchend', {
      changedTouches: [{ clientX: 20, clientY: 50 } as Touch],
    });

    element.dispatchEvent(touchStart);
    element.dispatchEvent(touchEnd);

    expect(onSwipeLeft).toHaveBeenCalledTimes(1);
    expect(onSwipeRight).not.toHaveBeenCalled();
  });

  it('should call onSwipeRight when swiping right', () => {
    renderHook(() =>
      useSwipeGesture({
        elementRef: { current: element },
        onSwipeLeft,
        onSwipeRight,
      })
    );

    const touchStart = new TouchEvent('touchstart', {
      touches: [{ clientX: 20, clientY: 50 } as Touch],
    });
    const touchEnd = new TouchEvent('touchend', {
      changedTouches: [{ clientX: 100, clientY: 50 } as Touch],
    });

    element.dispatchEvent(touchStart);
    element.dispatchEvent(touchEnd);

    expect(onSwipeRight).toHaveBeenCalledTimes(1);
    expect(onSwipeLeft).not.toHaveBeenCalled();
  });

  it('should not trigger swipe if distance is below threshold', () => {
    renderHook(() =>
      useSwipeGesture({
        elementRef: { current: element },
        onSwipeLeft,
        onSwipeRight,
        threshold: 50,
      })
    );

    const touchStart = new TouchEvent('touchstart', {
      touches: [{ clientX: 100, clientY: 50 } as Touch],
    });
    const touchEnd = new TouchEvent('touchend', {
      changedTouches: [{ clientX: 80, clientY: 50 } as Touch],
    });

    element.dispatchEvent(touchStart);
    element.dispatchEvent(touchEnd);

    expect(onSwipeLeft).not.toHaveBeenCalled();
    expect(onSwipeRight).not.toHaveBeenCalled();
  });

  it('should use default threshold of 50 pixels', () => {
    renderHook(() =>
      useSwipeGesture({
        elementRef: { current: element },
        onSwipeLeft,
        onSwipeRight,
      })
    );

    const touchStart = new TouchEvent('touchstart', {
      touches: [{ clientX: 100, clientY: 50 } as Touch],
    });
    const touchEnd = new TouchEvent('touchend', {
      changedTouches: [{ clientX: 51, clientY: 50 } as Touch],
    });

    element.dispatchEvent(touchStart);
    element.dispatchEvent(touchEnd);

    expect(onSwipeLeft).not.toHaveBeenCalled();
    expect(onSwipeRight).not.toHaveBeenCalled();
  });

  it('should handle vertical swipes without triggering callbacks', () => {
    renderHook(() =>
      useSwipeGesture({
        elementRef: { current: element },
        onSwipeLeft,
        onSwipeRight,
      })
    );

    const touchStart = new TouchEvent('touchstart', {
      touches: [{ clientX: 50, clientY: 20 } as Touch],
    });
    const touchEnd = new TouchEvent('touchend', {
      changedTouches: [{ clientX: 50, clientY: 100 } as Touch],
    });

    element.dispatchEvent(touchStart);
    element.dispatchEvent(touchEnd);

    expect(onSwipeLeft).not.toHaveBeenCalled();
    expect(onSwipeRight).not.toHaveBeenCalled();
  });

  it('should cleanup event listeners on unmount', () => {
    const { unmount } = renderHook(() =>
      useSwipeGesture({
        elementRef: { current: element },
        onSwipeLeft,
        onSwipeRight,
      })
    );

    const removeEventListenerSpy = vi.spyOn(element, 'removeEventListener');

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('touchstart', expect.any(Function));
    expect(removeEventListenerSpy).toHaveBeenCalledWith('touchend', expect.any(Function));
  });

  it('should not attach listeners if element is null', () => {
    const addEventListenerSpy = vi.spyOn(element, 'addEventListener');

    renderHook(() =>
      useSwipeGesture({
        elementRef: { current: null as HTMLElement | null },
        onSwipeLeft,
        onSwipeRight,
      })
    );

    expect(addEventListenerSpy).not.toHaveBeenCalled();
  });

  it('should handle missing onSwipeLeft callback', () => {
    renderHook(() =>
      useSwipeGesture({
        elementRef: { current: element },
        onSwipeRight,
      })
    );

    const touchStart = new TouchEvent('touchstart', {
      touches: [{ clientX: 100, clientY: 50 } as Touch],
    });
    const touchEnd = new TouchEvent('touchend', {
      changedTouches: [{ clientX: 20, clientY: 50 } as Touch],
    });

    element.dispatchEvent(touchStart);
    element.dispatchEvent(touchEnd);

    expect(onSwipeRight).not.toHaveBeenCalled();
  });

  it('should handle missing onSwipeRight callback', () => {
    renderHook(() =>
      useSwipeGesture({
        elementRef: { current: element },
        onSwipeLeft,
      })
    );

    const touchStart = new TouchEvent('touchstart', {
      touches: [{ clientX: 20, clientY: 50 } as Touch],
    });
    const touchEnd = new TouchEvent('touchend', {
      changedTouches: [{ clientX: 100, clientY: 50 } as Touch],
    });

    element.dispatchEvent(touchStart);
    element.dispatchEvent(touchEnd);

    expect(onSwipeLeft).not.toHaveBeenCalled();
  });
});
