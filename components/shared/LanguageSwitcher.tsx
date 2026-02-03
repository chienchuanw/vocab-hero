'use client';

import { Globe } from 'lucide-react';
import { useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const locales = [
  { code: 'en', name: 'English' },
  { code: 'zh-TW', name: '繁體中文' },
] as const;

/**
 * LanguageSwitcher component - Dropdown for switching app language
 * Uses cookie-based locale storage with page reload on change
 */
export function LanguageSwitcher() {
  const currentLocale = useLocale();

  const setLocale = (locale: string) => {
    document.cookie = `locale=${locale}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
    window.location.reload();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          data-testid="language-switcher"
          aria-label="Switch language"
        >
          <Globe className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {locales.map((locale) => (
          <DropdownMenuItem
            key={locale.code}
            onClick={() => setLocale(locale.code)}
            data-testid={`locale-${locale.code}`}
            className={currentLocale === locale.code ? 'bg-accent' : ''}
          >
            {locale.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
