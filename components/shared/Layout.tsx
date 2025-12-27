import { Header } from './Header';
import { BottomNav } from './BottomNav';

/**
 * Layout component - Main application layout
 * Provides consistent structure with header and bottom navigation
 * Follows Duolingo-style mobile-first design
 */

interface LayoutProps {
  children: React.ReactNode;
  streak?: number;
}

export function Layout({ children, streak = 0 }: LayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <Header streak={streak} />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        <div className="mx-auto max-w-screen-xl px-4 py-6">{children}</div>
      </main>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}

