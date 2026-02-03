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

## i18n Test Patterns (2026-02-03)

### Unit Test Structure
- Import JSON translation files directly for testing key parity
- Recursive helper functions work well for checking nested empty values
- Test namespaces count to catch missing translation sections

### E2E Test Patterns
- Use `context.clearCookies()` in beforeEach for clean state
- Set locale cookie directly with `context.addCookies()` to skip UI interaction
- Test IDs used: `language-switcher`, `locale-en`, `locale-zh-TW`, `language-option-en`, `language-option-zh-TW`
- Use `waitForLoadState('networkidle')` after locale switch for page reload
