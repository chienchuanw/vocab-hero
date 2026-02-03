'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Home, BookOpen, GraduationCap, TrendingUp, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * BottomNav component - Duolingo-style bottom navigation bar
 * Provides navigation to main sections of the application
 */

interface NavItem {
  href: string;
  labelKey: string;
  icon: React.ComponentType<{ className?: string }>;
}

export function BottomNav() {
  const pathname = usePathname();
  const t = useTranslations('nav');

  const navItems: NavItem[] = [
    {
      href: '/',
      labelKey: 'home',
      icon: Home,
    },
    {
      href: '/vocabulary',
      labelKey: 'vocabulary',
      icon: BookOpen,
    },
    {
      href: '/study',
      labelKey: 'study',
      icon: GraduationCap,
    },
    {
      href: '/progress',
      labelKey: 'progress',
      icon: TrendingUp,
    },
    {
      href: '/settings',
      labelKey: 'settings',
      icon: Settings,
    },
  ];

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
              <span className="text-xs font-medium">{t(item.labelKey)}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
