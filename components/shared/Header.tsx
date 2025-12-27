'use client';

import { Badge } from '@/components/ui/badge';
import { Flame } from 'lucide-react';

/**
 * Header component - Top navigation bar
 * Displays app logo, streak counter, and user info
 */

interface HeaderProps {
  streak?: number;
}

export function Header({ streak = 0 }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-screen-xl items-center justify-between px-4">
        {/* Logo and App Name */}
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <span className="text-xl font-bold">VH</span>
          </div>
          <h1 className="text-xl font-bold">Vocab Hero</h1>
        </div>

        {/* Streak Counter */}
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="flex items-center gap-1 px-3 py-1">
            <Flame className="h-4 w-4 text-orange-500" />
            <span className="font-semibold">{streak}</span>
            <span className="text-xs text-muted-foreground">day streak</span>
          </Badge>
        </div>
      </div>
    </header>
  );
}

