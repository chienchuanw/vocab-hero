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

## Task 5: Translate Remaining Shared Components (2026-02-03)

### Analysis

Reviewed three shared components for i18n translation:

1. **EmptyState.tsx** - No hardcoded strings
   - Takes `title`, `description`, `actionLabel` as props
   - Caller is responsible for providing translated strings
   - Already i18n-ready

2. **Layout.tsx** - No hardcoded strings
   - Pure layout component wrapping Header, PageTransition, BottomNav
   - Header and BottomNav handle their own translations
   - Already i18n-ready

3. **PageTransition.tsx** - No hardcoded strings
   - Animation component with no user-facing text
   - Already i18n-ready

### Conclusion

All three components are already i18n-ready because they don't contain hardcoded user-facing strings. No translation work needed for these components.

### Related Components Already Translated

- BottomNav.tsx - Uses `useTranslations('nav')`
- Header.tsx - Uses `useTranslations('common')`
- Loading.tsx - Uses `useTranslations('common')`
- OfflineBanner.tsx - Uses `useTranslations('common')`
- LanguageSwitcher.tsx - Has hardcoded locale names (not yet translated)


## Task 2: Component Translation (2026-02-03)

### Files Translated
- `app/(home)/page.tsx` - Already had translations (home namespace)
- `components/features/settings/RestoreDialog.tsx` - Added settings.restore namespace
- `components/features/settings/ThemeToggle.tsx` - Added settings.theme namespace
- `components/features/goals/GoalCelebration.tsx` - Added goals namespace
- `components/features/goals/GoalProgressBar.tsx` - Added goals namespace

### Translation Keys Added to messages/en.json

**settings.restore:**
- uploadTitle, uploadDescription, backupFile, analyzing
- previewTitle, previewDescription, totalItems, newItems, duplicates
- duplicateHandling, skipDuplicates, skipDuplicatesDesc
- overwriteDuplicates, overwriteDuplicatesDesc
- mergeDuplicates, mergeDuplicatesDesc
- continueRestore, confirmTitle, confirmDescription, confirmDescriptionAnd
- confirmPrompt, confirmError, restoring, restoreData

**settings.theme:**
- light, dark, system, toggleTheme

**goals:**
- congratulations, goalAchieved
- wordsGoal, timeGoal, complete, goalsAchieved
- words, minutes

### Implementation Pattern
1. Import `useTranslations` from 'next-intl'
2. Call `const t = useTranslations('namespace')` at component start
3. Replace hardcoded strings with `t('key')`
4. For components with dynamic content (like RestoreDialog), use `tc('common')` for shared keys
5. For optional default values (like GoalCelebration), use `message || t('defaultKey')`

### Key Learnings
- Home page was already translated - no changes needed
- ThemeToggle required moving themes array inside component to use translations
- RestoreDialog uses both settings.restore and common namespaces
- GoalCelebration message prop should be optional with fallback to translation
- All components use 'use client' directive (client-side rendering)
- TypeScript strict mode requires proper typing for all props

### Verification
- `pnpm tsc --noEmit` passed successfully
- All 5 files now use next-intl for translations
- No new hardcoded English strings in updated components

## Task 2: Study Pages & Components i18n Translation (2026-02-03)

### Files Translated

**Pages (4):**
- `app/(dashboard)/study/listening/page.tsx` - Added useTranslations('study'), replaced hardcoded strings with translation keys
- `app/(dashboard)/study/matching/page.tsx` - Added useTranslations('study'), replaced hardcoded strings with translation keys
- `app/(dashboard)/study/random/page.tsx` - Added useTranslations('study'), replaced hardcoded strings with translation keys
- `app/(dashboard)/study/spelling/page.tsx` - Added useTranslations('study'), replaced hardcoded strings with translation keys

**Components (3):**
- `components/features/study/StudyModeCard.tsx` - Made client component, added useTranslations('study'), implemented getTitleAndDescription() helper to map mode.id to translation keys
- `components/features/quiz/AnswerFeedback.tsx` - Added useTranslations('quiz'), removed unnecessary comments
- `components/features/quiz/MultipleChoiceQuestion.tsx` - Added useTranslations('quiz'), replaced hardcoded question prompts with translation keys

### Translation Keys Used

**From study namespace:**
- `listening`, `listeningDesc`
- `matching`, `matchingDesc`
- `random`, `randomDesc`
- `spelling`, `spellingDesc`
- `flashcard`, `flashcardDesc`
- `quiz`, `quizDesc`
- `questionType`, `questionTypes.wordToMeaning`, `questionTypes.meaningToWord`
- `startQuiz`, `backToStudy`, `sessionSummary`, `correctRate`, `correctAnswers`, `tryAgain`
- `loading`

**From quiz namespace:**
- `correct`, `incorrect`, `correctAnswer`
- `questionTypes.wordToMeaning`, `questionTypes.meaningToWord`

### Key Implementation Patterns

1. **Page Components**: Import useTranslations at top, initialize with `const t = useTranslations('study')`, replace all hardcoded UI strings
2. **StudyModeCard**: Implemented helper function to map mode.id to translation keys for dynamic title/description
3. **Quiz Components**: Use quiz namespace for feedback messages, maintain existing logic while translating UI text

### Verification

- All 7 files successfully translated
- `pnpm tsc --noEmit` passes with no errors
- All translation keys exist in messages/en.json

## Task 6: Add generateMetadata() to All Pages (2026-02-03)

### Implementation Strategy

**Key Discovery:** Client components cannot export `generateMetadata()`. Solution: Use layout files instead.

- Root layout (`app/layout.tsx`) already had metadata
- Home layout (`app/(home)/layout.tsx`) already had metadata
- Main section layouts (study, vocabulary, groups, progress, settings) already had metadata

### Files Created (13 layout files)

**Settings nested layouts (7):**
- `app/(dashboard)/settings/audio/layout.tsx`
- `app/(dashboard)/settings/data/layout.tsx`
- `app/(dashboard)/settings/goals/layout.tsx`
- `app/(dashboard)/settings/language/layout.tsx`
- `app/(dashboard)/settings/notifications/layout.tsx`
- `app/(dashboard)/settings/study/layout.tsx`
- `app/(dashboard)/settings/theme/layout.tsx`

**Study nested layouts (6):**
- `app/(dashboard)/study/flashcard/layout.tsx`
- `app/(dashboard)/study/listening/layout.tsx`
- `app/(dashboard)/study/matching/layout.tsx`
- `app/(dashboard)/study/quiz/layout.tsx`
- `app/(dashboard)/study/random/layout.tsx`
- `app/(dashboard)/study/spelling/layout.tsx`

### Translation Keys Added to messages/en.json

**Metadata namespace expanded with nested keys:**
- `metadata.settings.audio.{title,description}`
- `metadata.settings.data.{title,description}`
- `metadata.settings.goals.{title,description}`
- `metadata.settings.language.{title,description}`
- `metadata.settings.notifications.{title,description}`
- `metadata.settings.study.{title,description}`
- `metadata.settings.theme.{title,description}`
- `metadata.study.flashcard.{title,description}`
- `metadata.study.listening.{title,description}`
- `metadata.study.matching.{title,description}`
- `metadata.study.quiz.{title,description}`
- `metadata.study.random.{title,description}`
- `metadata.study.spelling.{title,description}`

### Pattern Used

```typescript
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata');
  return {
    title: t('settings.audio.title'),
    description: t('settings.audio.description'),
  };
}

export default function AudioSettingsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
```

### Verification

- `pnpm build` succeeded with all 41 routes compiled
- All metadata keys properly translated based on locale
- No TypeScript errors
- Build time: 3.3s compilation + 194.7ms page generation

### Key Learnings

1. **Layout-based metadata:** Use layout files for nested routes to override parent metadata
2. **Naming convention:** Nested metadata keys follow route structure (e.g., `settings.audio.title`)
3. **Server-side only:** `generateMetadata()` must be in server components (layouts work perfectly)
4. **Locale-aware:** Metadata automatically changes based on current locale from cookie

## Task 7: Add Missing Translations to zh-TW.json (2026-02-03)

### Problem
i18n unit tests were failing because `messages/zh-TW.json` was missing three sections that existed in `messages/en.json`:
1. `goals` namespace
2. `settings.restore` namespace
3. `settings.theme` namespace

Plus nested metadata keys for settings and study pages.

### Solution
Added all missing sections to `messages/zh-TW.json` with Traditional Chinese translations:

**Sections Added:**

1. **goals namespace** (8 keys):
   - congratulations: "恭喜！"
   - goalAchieved: "您已完成每日目標！"
   - wordsGoal, timeGoal, complete, goalsAchieved, words, minutes

2. **settings.restore namespace** (17 keys):
   - uploadTitle, uploadDescription, backupFile, analyzing
   - previewTitle, previewDescription, totalItems, newItems, duplicates
   - duplicateHandling, skipDuplicates, skipDuplicatesDesc
   - overwriteDuplicates, overwriteDuplicatesDesc
   - mergeDuplicates, mergeDuplicatesDesc
   - continueRestore, confirmTitle, confirmDescription, confirmDescriptionAnd
   - confirmPrompt, confirmError, restoring, restoreData

3. **settings.theme namespace** (4 keys):
   - light: "淺色"
   - dark: "深色"
   - system: "系統"
   - toggleTheme: "切換主題"

4. **Nested metadata keys** (13 keys):
   - settings.audio, settings.data, settings.goals, settings.language
   - settings.notifications, settings.study, settings.theme
   - study.flashcard, study.listening, study.matching
   - study.quiz, study.random, study.spelling

### Verification
- `pnpm test __tests__/i18n/ --run` - All 7 tests passed ✓
- `pnpm build` - Build succeeded with all 41 routes ✓
- No TypeScript errors

### Key Learnings
- Translation parity is critical for i18n tests
- Nested keys follow the same structure in both language files
- Traditional Chinese translations should be natural and idiomatic
- Test suite catches missing translation keys early
