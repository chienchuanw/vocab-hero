# Learnings - i18n Implementation

## Conventions

<!-- Patterns, naming conventions, coding standards discovered -->

## Patterns

<!-- Reusable code patterns identified -->

## Gotchas

<!-- Pitfalls and workarounds discovered -->

## Task 1: next-intl Setup (2026-02-03)

### Implementation Details

- Installed next-intl 4.8.2
- Cookie-based locale detection (no URL prefix routing)
- `localePrefix: 'never'` in routing config for cookie-only approach

### Key Files Created

- `i18n/routing.ts` - defines locales, defaultLocale, and routing config
- `i18n/request.ts` - getRequestConfig reads locale from cookie, loads messages
- `middleware.ts` - custom middleware for Accept-Language detection + cookie setting
- `messages/en.json`, `messages/zh-TW.json` - placeholder translations

### Configuration Notes

- `createNextIntlPlugin('./i18n/request.ts')` must point to request.ts path
- Plugin wraps around existing plugins: `withNextIntl(withBundleAnalyzer(nextConfig))`
- Layout must be async to use `await getLocale()` and `await getMessages()`
- NextIntlClientProvider placed inside ThemeProvider but wrapping QueryProvider

### Next.js 16 Warning

- Middleware shows deprecation warning recommending "proxy" convention
- Still functional, just a heads up for future Next.js versions
