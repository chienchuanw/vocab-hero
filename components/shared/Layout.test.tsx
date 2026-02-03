import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/tests/test-utils';
import { Layout } from './Layout';

vi.mock('next/navigation', () => ({
  usePathname: vi.fn(() => '/test'),
}));

vi.mock('./PageTransition', () => ({
  PageTransition: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="page-transition">{children}</div>
  ),
}));

describe('Layout', () => {
  it('should render header with streak count', () => {
    render(
      <Layout streak={5}>
        <div>Content</div>
      </Layout>
    );

    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('day streak')).toBeInTheDocument();
  });

  it('should render children inside PageTransition', () => {
    render(
      <Layout streak={0}>
        <div>Test Content</div>
      </Layout>
    );

    const transition = screen.getByTestId('page-transition');
    expect(transition).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('should render bottom navigation', () => {
    render(
      <Layout streak={0}>
        <div>Content</div>
      </Layout>
    );

    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });

  it('should have proper layout structure', () => {
    const { container } = render(
      <Layout streak={0}>
        <div>Content</div>
      </Layout>
    );

    const layout = container.firstChild;
    expect(layout).toHaveClass('flex', 'min-h-screen', 'flex-col');
  });

  it('should apply padding to main content for bottom nav', () => {
    render(
      <Layout streak={0}>
        <div>Content</div>
      </Layout>
    );

    const main = screen.getByRole('main');
    expect(main).toHaveClass('pb-16');
  });
});
