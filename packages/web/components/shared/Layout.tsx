import { Header } from './Header';
import { BottomNav } from './BottomNav';
import { PageTransition } from './PageTransition';

interface LayoutProps {
  children: React.ReactNode;
  streak?: number;
}

export function Layout({ children, streak = 0 }: LayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header streak={streak} />

      <main className="flex-1 pb-16">
        <PageTransition>
          <div className="mx-auto max-w-screen-xl px-4 py-6">{children}</div>
        </PageTransition>
      </main>

      <BottomNav />
    </div>
  );
}
