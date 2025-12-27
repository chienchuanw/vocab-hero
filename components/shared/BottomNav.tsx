'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BookOpen, GraduationCap, TrendingUp, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * BottomNav component - Duolingo-style bottom navigation bar
 * Provides navigation to main sections of the application
 */

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  {
    href: '/',
    label: 'Home',
    icon: Home,
  },
  {
    href: '/vocabulary',
    label: 'Vocabulary',
    icon: BookOpen,
  },
  {
    href: '/study',
    label: 'Study',
    icon: GraduationCap,
  },
  {
    href: '/progress',
    label: 'Progress',
    icon: TrendingUp,
  },
  {
    href: '/settings',
    label: 'Settings',
    icon: Settings,
  },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background">
      <div className="mx-auto flex h-16 max-w-screen-xl items-center justify-around px-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 px-3 py-2 transition-colors',
                'hover:text-primary',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <Icon className={cn('h-6 w-6', isActive && 'fill-current')} />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

