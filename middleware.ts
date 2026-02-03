import { NextResponse, type NextRequest } from 'next/server';
import { locales, defaultLocale, type Locale } from './i18n/routing';

const COOKIE_NAME = 'locale';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
}

function getPreferredLocale(acceptLanguage: string | null): Locale {
  if (!acceptLanguage) return defaultLocale;

  const languages = acceptLanguage
    .split(',')
    .map((lang) => {
      const parts = lang.trim().split(';');
      const code = parts[0]?.trim() ?? '';
      const priority = parts[1] ?? 'q=1';
      return {
        code,
        priority: parseFloat(priority.replace('q=', '')) || 1,
      };
    })
    .filter((lang) => lang.code.length > 0)
    .sort((a, b) => b.priority - a.priority);

  for (const { code } of languages) {
    if (isValidLocale(code)) return code;

    const baseCode = code.split('-')[0];
    if (baseCode === 'zh') return 'zh-TW';
    if (baseCode === 'en') return 'en';
  }

  return defaultLocale;
}

export function middleware(request: NextRequest) {
  const cookieLocale = request.cookies.get(COOKIE_NAME)?.value;
  const response = NextResponse.next();

  if (cookieLocale && isValidLocale(cookieLocale)) {
    return response;
  }

  const acceptLanguage = request.headers.get('accept-language');
  const detectedLocale = getPreferredLocale(acceptLanguage);

  response.cookies.set(COOKIE_NAME, detectedLocale, {
    maxAge: COOKIE_MAX_AGE,
    path: '/',
    sameSite: 'lax',
  });

  return response;
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
