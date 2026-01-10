import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PageTransition } from './PageTransition';
import * as useReducedMotionHook from '@/hooks/usePrefersReducedMotion';

vi.mock('framer-motion', async () => {
  const actual = await vi.importActual('framer-motion');
  return {
    ...actual,
    motion: {
      div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    },
    AnimatePresence: ({ children }: any) => <div>{children}</div>,
  };
});

vi.mock('next/navigation', () => ({
  usePathname: vi.fn(() => '/test'),
}));

describe('PageTransition', () => {
  beforeEach(() => {
    vi.spyOn(useReducedMotionHook, 'usePrefersReducedMotion').mockReturnValue(false);
  });

  it('should render children', () => {
    render(
      <PageTransition>
        <div>Test Content</div>
      </PageTransition>
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('should use pathname as animation key', () => {
    const { container } = render(
      <PageTransition>
        <div>Content</div>
      </PageTransition>
    );

    const motionDiv = container.querySelector('div[data-pathname]');
    expect(motionDiv).toBeInTheDocument();
  });

  it('should disable animations when prefers-reduced-motion is enabled', () => {
    vi.spyOn(useReducedMotionHook, 'usePrefersReducedMotion').mockReturnValue(true);

    const { container } = render(
      <PageTransition>
        <div>Content</div>
      </PageTransition>
    );

    const motionDiv = container.querySelector('div[data-reduced-motion="true"]');
    expect(motionDiv).toBeInTheDocument();
  });

  it('should apply fade animation when motion is allowed', () => {
    vi.spyOn(useReducedMotionHook, 'usePrefersReducedMotion').mockReturnValue(false);

    const { container } = render(
      <PageTransition>
        <div>Content</div>
      </PageTransition>
    );

    const motionDiv = container.querySelector('div[data-reduced-motion="false"]');
    expect(motionDiv).toBeInTheDocument();
  });
});
