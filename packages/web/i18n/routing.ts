import { defineRouting } from 'next-intl/routing';

export const locales = ['en', 'zh-TW'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

export const routing = defineRouting({
  locales,
  defaultLocale,
  // Cookie-based locale detection, no URL prefix
  localePrefix: 'never',
});
