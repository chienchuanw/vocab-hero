# i18n Implementation for Vocab Hero

## TL;DR

> **Quick Summary**: Add internationalization (i18n) support for English and Traditional Chinese (zh-TW) using next-intl with cookie-based locale storage and browser language auto-detection.
>
> **Deliverables**:
>
> - next-intl configured with middleware for auto-detection
> - Translation files: `messages/en.json`, `messages/zh-TW.json`
> - Language switcher in Header (Globe dropdown)
> - Updated Settings/Language page with functional selection
> - All 20 pages and 50+ components translated
> - Vitest tests for i18n functionality
>
> **Estimated Effort**: Large
> **Parallel Execution**: YES - 3 waves
> **Critical Path**: Task 1 (Setup) → Task 3 (Files) → Task 5-9 (Translation) → Task 10 (Tests)

---

## Context

### Original Request

Add internationalization support for Vocab Hero application UI, supporting Traditional Chinese (zh-TW) and English (en). Japanese support is NOT needed at this time.

### Interview Summary

**Key Discussions**:

- **Routing Strategy**: No URL prefix (cookie-based) - URL stays the same
- **Default Language**: Auto-detect from browser, fallback to English
- **Language Switcher**: Both Header dropdown AND Settings/Language page
- **Translation Scope**: All pages (~20) and components (~50+) at once
- **Translation Source**: AI generates initial Chinese translations
- **Test Strategy**: Vitest tests after implementation
- **zh-CN Handling**: Not supported - fallback to English
- **Metadata**: Translate page titles and descriptions
- **Missing Keys**: Fallback to English silently

**Research Findings**:

- next-intl is the recommended solution (Benchmark Score: 89.7)
- Full App Router support with Server/Client Components
- Cookie-based approach works without URL prefix
- `<html lang>` must be dynamic for accessibility

### Metis Review

**Identified Gaps** (addressed):

- **Page count correction**: Actually 20 pages (not ~14)
- **`<html lang>` attribute**: Must be dynamic based on locale
- **zh-CN handling**: Explicitly excluded, fallback to English
- **Metadata translation**: Requires generateMetadata() pattern
- **Missing key behavior**: Fallback to English silently

**Guardrails Applied**:

- DO NOT create custom i18n wrapper hooks
- DO NOT add languages beyond en + zh-TW
- DO NOT add date/time/number formatting (separate scope)
- DO NOT translate API responses or error messages
- DO NOT store language preference in database

---

## Work Objectives

### Core Objective

Enable users to switch the application UI between English and Traditional Chinese, with automatic browser language detection and cookie-based persistence.

### Concrete Deliverables

- `pnpm add next-intl` installed
- `middleware.ts` for locale detection
- `i18n/request.ts` for server-side config
- `i18n/routing.ts` for locale configuration
- `messages/en.json` with all UI strings (namespaced)
- `messages/zh-TW.json` with all translated strings
- `components/shared/LanguageSwitcher.tsx` (Globe dropdown)
- Updated `components/shared/Header.tsx` with language switcher
- Updated `app/(dashboard)/settings/language/page.tsx` with functional selection
- Dynamic `<html lang={locale}>` in layout
- Updated `app/layout.tsx` with NextIntlClientProvider
- All pages using `generateMetadata()` for translated titles
- Vitest test file for i18n functionality

### Definition of Done

- [ ] `pnpm build` completes without errors
- [ ] `pnpm tsc --noEmit` passes
- [ ] `pnpm lint` passes
- [ ] `pnpm test` passes
- [ ] Language can be switched via Header dropdown
- [ ] Language can be switched via Settings/Language page
- [ ] Browser language auto-detection works
- [ ] All UI text displays correctly in both languages
- [ ] Translation files have matching keys (no missing translations)

### Must Have

- next-intl configured for App Router (non-URL based routing)
- Two locales: `en` (English), `zh-TW` (Traditional Chinese)
- Cookie-based locale persistence (1 year expiration)
- Browser Accept-Language detection
- Header language switcher (Globe icon with dropdown)
- Settings/Language page with full selection UI
- All pages translated
- All components with UI text translated
- Dynamic `<html lang>` attribute
- Translated page metadata (titles, descriptions)

### Must NOT Have (Guardrails)

- NO custom i18n utility wrappers (use next-intl hooks directly)
- NO additional languages (only en, zh-TW)
- NO date/time/number locale formatting (separate scope)
- NO API error message translation (keep English for debugging)
- NO database storage for language preference (cookie only)
- NO URL-based locale routing (no /en, /zh-TW prefix)
- NO translation validation/management scripts
- NO Japanese language support (explicitly excluded)
- NO zh-CN (Simplified Chinese) support

---

## Verification Strategy

> **UNIVERSAL RULE: ZERO HUMAN INTERVENTION**
>
> ALL tasks in this plan MUST be verifiable WITHOUT any human action.
> Agent-Executed QA Scenarios are MANDATORY for all tasks.

### Test Decision

- **Infrastructure exists**: YES (Vitest + Playwright configured)
- **Automated tests**: Tests-after implementation
- **Framework**: Vitest for unit tests, Playwright for E2E

### Agent-Executed QA Scenarios (MANDATORY)

**Verification Tool by Deliverable Type:**

| Type                  | Tool       | How Agent Verifies                           |
| --------------------- | ---------- | -------------------------------------------- |
| **Configuration**     | Bash       | Check files exist, run build, run type check |
| **Translation Files** | Bash (jq)  | Compare keys between files, verify counts    |
| **Language Switcher** | Playwright | Navigate, click, assert DOM/cookie changes   |
| **Settings Page**     | Playwright | Select language, verify persistence          |
| **Browser Detection** | Playwright | Set browser locale, verify auto-selection    |

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately):
├── Task 1: Install and configure next-intl infrastructure
└── Task 2: Extract all translatable strings (analysis only)

Wave 2 (After Wave 1):
├── Task 3: Create translation files (en.json, zh-TW.json)
└── Task 4: Create LanguageSwitcher component + update Header

Wave 3 (After Wave 2):
├── Task 5: Translate shared components (Layout, Header, BottomNav, etc.)
├── Task 6: Translate settings pages
├── Task 7: Translate study mode pages
├── Task 8: Translate vocabulary/groups/progress pages
└── Task 9: Update Settings/Language page with functional selection

Wave 4 (After Wave 3):
├── Task 10: Add metadata translation (generateMetadata)
└── Task 11: Write Vitest + Playwright tests

Critical Path: Task 1 → Task 3 → Tasks 5-9 → Task 11
Parallel Speedup: ~35% faster than sequential
```

### Dependency Matrix

| Task | Depends On | Blocks    | Can Parallelize With |
| ---- | ---------- | --------- | -------------------- |
| 1    | None       | 3, 4, 5-9 | 2                    |
| 2    | None       | 3         | 1                    |
| 3    | 1, 2       | 5-9, 10   | 4                    |
| 4    | 1          | 9, 11     | 3                    |
| 5    | 3          | 10, 11    | 6, 7, 8, 9           |
| 6    | 3          | 10, 11    | 5, 7, 8, 9           |
| 7    | 3          | 10, 11    | 5, 6, 8, 9           |
| 8    | 3          | 10, 11    | 5, 6, 7, 9           |
| 9    | 3, 4       | 11        | 5, 6, 7, 8           |
| 10   | 5-9        | 11        | None                 |
| 11   | All        | None      | None (final)         |

### Agent Dispatch Summary

| Wave | Tasks  | Recommended Agent                                                                   |
| ---- | ------ | ----------------------------------------------------------------------------------- |
| 1    | 1, 2   | `delegate_task(category="unspecified-high", load_skills=[], ...)`                   |
| 2    | 3, 4   | `delegate_task(category="visual-engineering", load_skills=["frontend-ui-ux"], ...)` |
| 3    | 5-9    | Dispatch parallel (5 agents)                                                        |
| 4    | 10, 11 | Sequential final tasks                                                              |

---

## TODOs

### Task 1: Install and Configure next-intl Infrastructure

**What to do**:

1. Install next-intl: `pnpm add next-intl`
2. Create `i18n/routing.ts` with locale configuration:
   - locales: `['en', 'zh-TW']`
   - defaultLocale: `'en'`
3. Create `i18n/request.ts` with `getRequestConfig`:
   - Handle locale from cookie
   - Load messages from `messages/{locale}.json`
   - Fallback to 'en' if cookie missing or invalid
4. Update `next.config.ts` with next-intl plugin
5. Create `middleware.ts`:
   - Detect locale from cookie first
   - Fallback to Accept-Language header
   - Set cookie if not present (1 year expiration)
   - NO URL rewriting (cookie-based only)
6. Update `app/layout.tsx`:
   - Wrap children with `NextIntlClientProvider`
   - Make `<html lang={locale}>` dynamic
7. Create placeholder translation files:
   - `messages/en.json` with `{ "common": { "loading": "Loading..." } }`
   - `messages/zh-TW.json` with `{ "common": { "loading": "載入中..." } }`

**Must NOT do**:

- DO NOT add URL-based locale routing
- DO NOT add more than 2 locales
- DO NOT create custom wrapper hooks

**Recommended Agent Profile**:

- **Category**: `unspecified-high`
- **Skills**: `[]` (no special skills needed)
  - Reason: Infrastructure setup, standard Next.js configuration

**Parallelization**:

- **Can Run In Parallel**: YES
- **Parallel Group**: Wave 1 (with Task 2)
- **Blocks**: Tasks 3, 4, 5-9
- **Blocked By**: None (can start immediately)

**References**:

- `next.config.ts:1-13` - Current Next.js config to modify
- `app/layout.tsx:1-50` - Root layout to add provider
- `lib/providers/QueryProvider.tsx` - Existing provider pattern to follow
- next-intl docs: App Router setup guide

**Acceptance Criteria**:

- [ ] `pnpm list next-intl` shows installed version
- [ ] `ls i18n/routing.ts i18n/request.ts` shows both files exist
- [ ] `ls middleware.ts` shows file exists
- [ ] `ls messages/en.json messages/zh-TW.json` shows both files exist
- [ ] `pnpm build` completes without errors
- [ ] `pnpm tsc --noEmit` passes

**Agent-Executed QA Scenarios:**

```
Scenario: next-intl installation verified
  Tool: Bash
  Preconditions: None
  Steps:
    1. Run: pnpm list next-intl
    2. Assert: Output contains version number (e.g., "next-intl 3.x.x")
  Expected Result: Package is installed
  Evidence: Command output captured

Scenario: Configuration files exist
  Tool: Bash
  Preconditions: None
  Steps:
    1. Run: ls -la i18n/routing.ts i18n/request.ts middleware.ts
    2. Assert: All three files listed with non-zero size
  Expected Result: All config files created
  Evidence: ls output captured

Scenario: Build succeeds with i18n config
  Tool: Bash
  Preconditions: All config files created
  Steps:
    1. Run: pnpm build
    2. Assert: Exit code 0
    3. Assert: Output contains "Compiled successfully" or similar
  Expected Result: No build errors with new i18n setup
  Evidence: Build output captured
```

**Commit**: YES

- Message: `feat(i18n): add next-intl infrastructure`
- Files: `package.json`, `pnpm-lock.yaml`, `next.config.ts`, `middleware.ts`, `i18n/*`, `app/layout.tsx`, `messages/*`
- Pre-commit: `pnpm build && pnpm tsc --noEmit`

---

### Task 2: Extract All Translatable Strings (Analysis)

**What to do**:

1. Use `ast_grep_search` to find all hardcoded strings in components
2. Document all strings organized by namespace:
   - `common`: Loading, errors, buttons (Save, Cancel, etc.)
   - `nav`: Navigation labels (Home, Settings, etc.)
   - `settings`: Settings page strings
   - `study`: Study mode strings
   - `vocabulary`: Vocabulary-related strings
   - `groups`: Group management strings
   - `progress`: Progress page strings
3. Create a markdown report of all found strings
4. Identify patterns: arrays of labels, inline strings, config objects

**Must NOT do**:

- DO NOT modify any source files yet
- DO NOT create translation files yet (Task 3)

**Recommended Agent Profile**:

- **Category**: `unspecified-low`
- **Skills**: `[]`
  - Reason: Analysis only, no coding

**Parallelization**:

- **Can Run In Parallel**: YES
- **Parallel Group**: Wave 1 (with Task 1)
- **Blocks**: Task 3
- **Blocked By**: None (can start immediately)

**References**:

- `components/shared/BottomNav.tsx:19-45` - navItems array pattern
- `components/shared/Header.tsx:33` - Inline string pattern
- `app/(dashboard)/settings/page.tsx:44-87` - settingsLinks config pattern
- `components/features/study/QualityRatingButtons.tsx` - Button labels

**Acceptance Criteria**:

- [ ] String extraction report created (can be in .sisyphus/evidence/)
- [ ] All namespaces documented with string counts
- [ ] At least 100 unique strings identified

**Agent-Executed QA Scenarios:**

```
Scenario: String extraction report created
  Tool: Bash
  Preconditions: None
  Steps:
    1. Run: ls .sisyphus/evidence/i18n-strings-report.md
    2. Assert: File exists
    3. Run: wc -l .sisyphus/evidence/i18n-strings-report.md
    4. Assert: Line count > 50
  Expected Result: Comprehensive string report exists
  Evidence: Report file path

Scenario: Key namespaces identified
  Tool: Bash
  Preconditions: Report exists
  Steps:
    1. Run: grep -E "^##\s+(common|nav|settings|study|vocabulary)" .sisyphus/evidence/i18n-strings-report.md
    2. Assert: At least 5 namespace headers found
  Expected Result: All major namespaces documented
  Evidence: Grep output captured
```

**Commit**: NO (analysis only, no code changes)

---

### Task 3: Create Translation Files

**What to do**:

1. Based on Task 2 extraction report, create `messages/en.json`:
   - Organized by namespace (common, nav, settings, study, vocabulary, groups, progress)
   - All English strings from current codebase
2. Create `messages/zh-TW.json`:
   - Same structure as en.json
   - AI-generated Traditional Chinese translations
   - Review key translations for accuracy
3. Ensure key parity between both files
4. Use flat namespace structure (e.g., `settings.title`, `settings.description`)

**Must NOT do**:

- DO NOT add nested namespaces beyond 2 levels
- DO NOT include Japanese translations
- DO NOT translate vocabulary content (user data)

**Recommended Agent Profile**:

- **Category**: `writing`
- **Skills**: `[]`
  - Reason: Translation content creation

**Parallelization**:

- **Can Run In Parallel**: YES
- **Parallel Group**: Wave 2 (with Task 4)
- **Blocks**: Tasks 5-9, 10
- **Blocked By**: Tasks 1, 2

**References**:

- Task 2 extraction report
- `messages/en.json` (placeholder from Task 1)
- `messages/zh-TW.json` (placeholder from Task 1)

**Acceptance Criteria**:

- [ ] `jq 'keys | length' messages/en.json` returns count > 100
- [ ] `jq 'keys | length' messages/zh-TW.json` returns same count as en.json
- [ ] `diff <(jq -S 'keys' messages/en.json) <(jq -S 'keys' messages/zh-TW.json)` returns empty
- [ ] JSON files are valid (no syntax errors)

**Agent-Executed QA Scenarios:**

```
Scenario: Translation files have matching keys
  Tool: Bash
  Preconditions: Both translation files exist
  Steps:
    1. Run: diff <(jq -S 'keys' messages/en.json) <(jq -S 'keys' messages/zh-TW.json)
    2. Assert: Output is empty (no differences)
  Expected Result: All keys match between files
  Evidence: Diff output (should be empty)

Scenario: Sufficient translation coverage
  Tool: Bash
  Preconditions: Translation files exist
  Steps:
    1. Run: jq 'keys | length' messages/en.json
    2. Assert: Count > 100
    3. Run: jq 'keys | length' messages/zh-TW.json
    4. Assert: Count matches en.json
  Expected Result: Comprehensive translation coverage
  Evidence: Key counts captured

Scenario: JSON syntax valid
  Tool: Bash
  Preconditions: Translation files exist
  Steps:
    1. Run: jq empty messages/en.json && echo "EN_VALID"
    2. Assert: Output contains "EN_VALID"
    3. Run: jq empty messages/zh-TW.json && echo "ZH_VALID"
    4. Assert: Output contains "ZH_VALID"
  Expected Result: Both files are valid JSON
  Evidence: Validation output captured
```

**Commit**: YES

- Message: `feat(i18n): add translation files for en and zh-TW`
- Files: `messages/en.json`, `messages/zh-TW.json`
- Pre-commit: `jq empty messages/en.json && jq empty messages/zh-TW.json`

---

### Task 4: Create LanguageSwitcher Component and Update Header

**What to do**:

1. Create `components/shared/LanguageSwitcher.tsx`:
   - Globe icon button with dropdown
   - Show current locale with native name
   - Options: "English", "繁體中文"
   - Use next-intl's `useLocale()` and cookie update
   - Use shadcn/ui DropdownMenu component
   - Add `data-testid` attributes for testing
2. Update `components/shared/Header.tsx`:
   - Import and add LanguageSwitcher
   - Position: Right side, before streak badge (if exists)
3. Export from `components/shared/index.ts`

**Must NOT do**:

- DO NOT add language names in English (use native: 繁體中文, not "Traditional Chinese")
- DO NOT create elaborate animations
- DO NOT add more than 2 language options

**Recommended Agent Profile**:

- **Category**: `visual-engineering`
- **Skills**: `["frontend-ui-ux"]`
  - Reason: UI component creation with good UX

**Parallelization**:

- **Can Run In Parallel**: YES
- **Parallel Group**: Wave 2 (with Task 3)
- **Blocks**: Task 9, 11
- **Blocked By**: Task 1

**References**:

- `components/shared/Header.tsx:1-50` - Current Header structure
- `components/shared/ThemeToggle.tsx` or `components/features/settings/ThemeToggle.tsx` - Similar toggle pattern
- `components/ui/dropdown-menu.tsx` - shadcn DropdownMenu component
- `lucide-react` Globe icon

**Acceptance Criteria**:

- [ ] `ls components/shared/LanguageSwitcher.tsx` shows file exists
- [ ] `grep "LanguageSwitcher" components/shared/Header.tsx` finds import
- [ ] `grep "data-testid" components/shared/LanguageSwitcher.tsx` finds test IDs
- [ ] `pnpm tsc --noEmit` passes

**Agent-Executed QA Scenarios:**

```
Scenario: LanguageSwitcher renders and toggles
  Tool: Playwright (playwright skill)
  Preconditions: Dev server running on localhost:3000
  Steps:
    1. Navigate to: http://localhost:3000
    2. Wait for: [data-testid="language-switcher"] visible (timeout: 10s)
    3. Click: [data-testid="language-switcher"]
    4. Wait for: [data-testid="locale-zh-TW"] visible
    5. Assert: [data-testid="locale-en"] visible
    6. Click: [data-testid="locale-zh-TW"]
    7. Wait for: 1 second (cookie update)
    8. Assert: Cookie "locale" equals "zh-TW"
    9. Screenshot: .sisyphus/evidence/task-4-language-switcher.png
  Expected Result: Language switcher works and sets cookie
  Evidence: .sisyphus/evidence/task-4-language-switcher.png

Scenario: Header displays LanguageSwitcher
  Tool: Playwright (playwright skill)
  Preconditions: Dev server running
  Steps:
    1. Navigate to: http://localhost:3000
    2. Wait for: header visible
    3. Assert: [data-testid="language-switcher"] is inside header element
  Expected Result: Switcher is in header
  Evidence: Screenshot captured
```

**Commit**: YES

- Message: `feat(i18n): add LanguageSwitcher component to Header`
- Files: `components/shared/LanguageSwitcher.tsx`, `components/shared/Header.tsx`, `components/shared/index.ts`
- Pre-commit: `pnpm tsc --noEmit`

---

### Task 5: Translate Shared Components

**What to do**:

1. Update `components/shared/Layout.tsx` with translations
2. Update `components/shared/Header.tsx` with translations (streak text, etc.)
3. Update `components/shared/BottomNav.tsx`:
   - Replace hardcoded `label` strings with `useTranslations('nav')`
4. Update `components/shared/EmptyState.tsx` with translations
5. Update `components/shared/Loading.tsx` with translations
6. Update `components/shared/OfflineBanner.tsx` with translations

**Must NOT do**:

- DO NOT change component logic
- DO NOT add new features

**Recommended Agent Profile**:

- **Category**: `quick`
- **Skills**: `[]`
  - Reason: Simple string replacement pattern

**Parallelization**:

- **Can Run In Parallel**: YES
- **Parallel Group**: Wave 3 (with Tasks 6, 7, 8, 9)
- **Blocks**: Tasks 10, 11
- **Blocked By**: Task 3

**References**:

- `components/shared/BottomNav.tsx:19-45` - navItems with labels
- `components/shared/Header.tsx:33` - "day streak" text
- `components/shared/EmptyState.tsx` - Empty state messages
- `messages/en.json` - Translation keys to use

**Acceptance Criteria**:

- [ ] `grep -r "useTranslations" components/shared/` finds usage in all components with text
- [ ] No hardcoded user-facing strings remain in shared components
- [ ] `pnpm tsc --noEmit` passes

**Agent-Executed QA Scenarios:**

```
Scenario: BottomNav displays translated labels
  Tool: Playwright (playwright skill)
  Preconditions: Dev server running, locale cookie set to zh-TW
  Steps:
    1. Clear cookies
    2. Set cookie: locale=zh-TW
    3. Navigate to: http://localhost:3000
    4. Wait for: nav element visible
    5. Assert: Navigation contains Chinese text (e.g., "首頁", "設定")
    6. Screenshot: .sisyphus/evidence/task-5-nav-zh-TW.png
  Expected Result: Navigation shows Chinese labels
  Evidence: .sisyphus/evidence/task-5-nav-zh-TW.png

Scenario: Shared components have no hardcoded strings
  Tool: Bash
  Preconditions: Components updated
  Steps:
    1. Run: grep -rE ">[A-Z][a-z]+<" components/shared/*.tsx | grep -v "test" | grep -v ".types.ts"
    2. Assert: No matches OR only technical strings (component names, etc.)
  Expected Result: All user-facing strings use translations
  Evidence: Grep output captured
```

**Commit**: YES (groups with Tasks 6-9)

- Message: `feat(i18n): translate shared components`
- Files: `components/shared/*.tsx`
- Pre-commit: `pnpm tsc --noEmit`

---

### Task 6: Translate Settings Pages

**What to do**:

1. Update `app/(dashboard)/settings/page.tsx`:
   - Translate page title, description
   - Translate settingsLinks array labels
2. Update `app/(dashboard)/settings/theme/page.tsx`
3. Update `app/(dashboard)/settings/audio/page.tsx`
4. Update `app/(dashboard)/settings/study/page.tsx`
5. Update `app/(dashboard)/settings/goals/page.tsx`
6. Update `app/(dashboard)/settings/notifications/page.tsx`
7. Update `app/(dashboard)/settings/data/page.tsx`
8. Update related settings components in `components/features/settings/`

**Must NOT do**:

- DO NOT translate Settings/Language page (Task 9)
- DO NOT change settings logic

**Recommended Agent Profile**:

- **Category**: `quick`
- **Skills**: `[]`
  - Reason: String replacement pattern

**Parallelization**:

- **Can Run In Parallel**: YES
- **Parallel Group**: Wave 3 (with Tasks 5, 7, 8, 9)
- **Blocks**: Tasks 10, 11
- **Blocked By**: Task 3

**References**:

- `app/(dashboard)/settings/page.tsx:44-87` - settingsLinks array
- `app/(dashboard)/settings/theme/page.tsx` - Theme settings
- `components/features/settings/ThemeToggle.tsx` - Toggle component
- `messages/en.json` - settings namespace keys

**Acceptance Criteria**:

- [ ] `grep -r "useTranslations" app/\(dashboard\)/settings/` finds usage
- [ ] `pnpm tsc --noEmit` passes

**Agent-Executed QA Scenarios:**

```
Scenario: Settings page displays in Chinese
  Tool: Playwright (playwright skill)
  Preconditions: Dev server running
  Steps:
    1. Set cookie: locale=zh-TW
    2. Navigate to: http://localhost:3000/settings
    3. Wait for: h1 visible
    4. Assert: h1 contains "設定" (not "Settings")
    5. Assert: Card descriptions are in Chinese
    6. Screenshot: .sisyphus/evidence/task-6-settings-zh-TW.png
  Expected Result: Settings page fully translated
  Evidence: .sisyphus/evidence/task-6-settings-zh-TW.png
```

**Commit**: YES (groups with Tasks 5, 7, 8, 9)

- Message: `feat(i18n): translate settings pages`
- Files: `app/(dashboard)/settings/**/*.tsx`, `components/features/settings/*.tsx`
- Pre-commit: `pnpm tsc --noEmit`

---

### Task 7: Translate Study Mode Pages

**What to do**:

1. Update `app/(dashboard)/study/page.tsx` - Study mode selection
2. Update `app/(dashboard)/study/flashcard/page.tsx`
3. Update `app/(dashboard)/study/listening/page.tsx`
4. Update `app/(dashboard)/study/matching/page.tsx`
5. Update `app/(dashboard)/study/quiz/page.tsx`
6. Update `app/(dashboard)/study/random/page.tsx`
7. Update `app/(dashboard)/study/spelling/page.tsx`
8. Update study-related components in `components/features/study/`, `components/features/quiz/`, etc.

**Must NOT do**:

- DO NOT translate vocabulary content (Japanese words, meanings - that's user data)
- DO NOT change study logic

**Recommended Agent Profile**:

- **Category**: `quick`
- **Skills**: `[]`
  - Reason: String replacement pattern

**Parallelization**:

- **Can Run In Parallel**: YES
- **Parallel Group**: Wave 3 (with Tasks 5, 6, 8, 9)
- **Blocks**: Tasks 10, 11
- **Blocked By**: Task 3

**References**:

- `app/(dashboard)/study/page.tsx` - Study mode selection
- `components/features/study/Flashcard.tsx` - Flashcard component
- `components/features/study/QualityRatingButtons.tsx` - Rating buttons
- `components/features/quiz/QuizConfigForm.tsx` - Quiz config

**Acceptance Criteria**:

- [ ] `grep -r "useTranslations" app/\(dashboard\)/study/` finds usage
- [ ] `grep -r "useTranslations" components/features/study/` finds usage
- [ ] `pnpm tsc --noEmit` passes

**Agent-Executed QA Scenarios:**

```
Scenario: Study page displays in Chinese
  Tool: Playwright (playwright skill)
  Preconditions: Dev server running
  Steps:
    1. Set cookie: locale=zh-TW
    2. Navigate to: http://localhost:3000/study
    3. Wait for: Main content visible
    4. Assert: Page heading/cards are in Chinese
    5. Screenshot: .sisyphus/evidence/task-7-study-zh-TW.png
  Expected Result: Study mode selection translated
  Evidence: .sisyphus/evidence/task-7-study-zh-TW.png
```

**Commit**: YES (groups with Tasks 5, 6, 8, 9)

- Message: `feat(i18n): translate study mode pages`
- Files: `app/(dashboard)/study/**/*.tsx`, `components/features/study/*.tsx`, `components/features/quiz/*.tsx`, etc.
- Pre-commit: `pnpm tsc --noEmit`

---

### Task 8: Translate Vocabulary, Groups, Progress Pages

**What to do**:

1. Update `app/(dashboard)/vocabulary/page.tsx`
2. Update `app/(dashboard)/groups/page.tsx`
3. Update `app/(dashboard)/progress/page.tsx`
4. Update `app/page.tsx` (home page)
5. Update `app/error.tsx`, `app/not-found.tsx`
6. Update vocabulary components in `components/features/vocabulary/`
7. Update groups components in `components/features/groups/`
8. Update progress components in `components/features/progress/`

**Must NOT do**:

- DO NOT translate user vocabulary data (Japanese words, meanings)
- DO NOT translate user group names

**Recommended Agent Profile**:

- **Category**: `quick`
- **Skills**: `[]`
  - Reason: String replacement pattern

**Parallelization**:

- **Can Run In Parallel**: YES
- **Parallel Group**: Wave 3 (with Tasks 5, 6, 7, 9)
- **Blocks**: Tasks 10, 11
- **Blocked By**: Task 3

**References**:

- `app/(dashboard)/vocabulary/page.tsx` - Vocabulary list
- `app/(dashboard)/groups/page.tsx` - Groups management
- `app/(dashboard)/progress/page.tsx` - Progress charts
- `components/features/vocabulary/VocabularyCard.tsx` - Card component

**Acceptance Criteria**:

- [ ] `grep -r "useTranslations" app/\(dashboard\)/vocabulary/` finds usage
- [ ] `grep -r "useTranslations" app/\(dashboard\)/groups/` finds usage
- [ ] `grep -r "useTranslations" app/\(dashboard\)/progress/` finds usage
- [ ] `pnpm tsc --noEmit` passes

**Agent-Executed QA Scenarios:**

```
Scenario: Home page displays in Chinese
  Tool: Playwright (playwright skill)
  Preconditions: Dev server running
  Steps:
    1. Set cookie: locale=zh-TW
    2. Navigate to: http://localhost:3000
    3. Wait for: Main content visible
    4. Assert: UI text is in Chinese (not vocabulary data)
    5. Screenshot: .sisyphus/evidence/task-8-home-zh-TW.png
  Expected Result: Home page UI translated
  Evidence: .sisyphus/evidence/task-8-home-zh-TW.png
```

**Commit**: YES (groups with Tasks 5, 6, 7, 9)

- Message: `feat(i18n): translate vocabulary, groups, progress pages`
- Files: `app/(dashboard)/vocabulary/*.tsx`, `app/(dashboard)/groups/*.tsx`, `app/(dashboard)/progress/*.tsx`, `app/page.tsx`, `app/error.tsx`, `app/not-found.tsx`, relevant components
- Pre-commit: `pnpm tsc --noEmit`

---

### Task 9: Update Settings/Language Page with Functional Selection

**What to do**:

1. Update `app/(dashboard)/settings/language/page.tsx`:
   - Remove "Coming Soon" badge
   - Remove Japanese from planned languages list
   - Add functional language selection UI:
     - Radio buttons or card selection for en/zh-TW
     - Show current selection highlighted
     - On select: update cookie, refresh UI
   - Add description text explaining language change
   - Translate page content itself
2. Use `useTranslations('settings.language')` namespace
3. Add `data-testid` attributes for testing

**Must NOT do**:

- DO NOT add Japanese option
- DO NOT add "more languages coming soon" text
- DO NOT persist to database

**Recommended Agent Profile**:

- **Category**: `visual-engineering`
- **Skills**: `["frontend-ui-ux"]`
  - Reason: UX for language selection page

**Parallelization**:

- **Can Run In Parallel**: YES
- **Parallel Group**: Wave 3 (with Tasks 5, 6, 7, 8)
- **Blocks**: Task 11
- **Blocked By**: Tasks 3, 4

**References**:

- `app/(dashboard)/settings/language/page.tsx:1-79` - Current placeholder page
- `components/shared/LanguageSwitcher.tsx` - Reuse locale change logic
- shadcn/ui RadioGroup or Card components for selection

**Acceptance Criteria**:

- [ ] `grep "Coming Soon" app/\(dashboard\)/settings/language/page.tsx` returns empty
- [ ] `grep "日本語" app/\(dashboard\)/settings/language/page.tsx` returns empty
- [ ] `grep "data-testid" app/\(dashboard\)/settings/language/page.tsx` finds test IDs
- [ ] `pnpm tsc --noEmit` passes

**Agent-Executed QA Scenarios:**

```
Scenario: Language selection works from settings page
  Tool: Playwright (playwright skill)
  Preconditions: Dev server running
  Steps:
    1. Clear cookies
    2. Navigate to: http://localhost:3000/settings/language
    3. Wait for: [data-testid="language-option-en"] visible
    4. Assert: Only 2 language options present (en, zh-TW)
    5. Assert: No "Coming Soon" badge visible
    6. Click: [data-testid="language-option-zh-TW"]
    7. Wait for: UI refresh
    8. Assert: Cookie "locale" equals "zh-TW"
    9. Assert: Page heading is now in Chinese
    10. Screenshot: .sisyphus/evidence/task-9-language-settings.png
  Expected Result: Language can be changed from settings
  Evidence: .sisyphus/evidence/task-9-language-settings.png

Scenario: Japanese option not present
  Tool: Playwright (playwright skill)
  Preconditions: Dev server running
  Steps:
    1. Navigate to: http://localhost:3000/settings/language
    2. Assert: No element with text "日本語" or "Japanese"
    3. Assert: Exactly 2 language options visible
  Expected Result: Only en and zh-TW options
  Evidence: Screenshot captured
```

**Commit**: YES (groups with Tasks 5-8)

- Message: `feat(i18n): add functional language selection to settings`
- Files: `app/(dashboard)/settings/language/page.tsx`
- Pre-commit: `pnpm tsc --noEmit`

---

### Task 10: Add Metadata Translation (generateMetadata)

**What to do**:

1. Create `i18n/getTranslations.ts` helper for metadata (if needed)
2. Update root `app/layout.tsx`:
   - Export `generateMetadata()` function
   - Return translated title and description
3. Update all page files to use `generateMetadata`:
   - `app/page.tsx`
   - `app/(dashboard)/settings/page.tsx`
   - `app/(dashboard)/settings/*/page.tsx` (all settings pages)
   - `app/(dashboard)/study/page.tsx`
   - `app/(dashboard)/study/*/page.tsx` (all study pages)
   - `app/(dashboard)/vocabulary/page.tsx`
   - `app/(dashboard)/groups/page.tsx`
   - `app/(dashboard)/progress/page.tsx`
4. Add metadata translations to `messages/en.json` and `messages/zh-TW.json`

**Must NOT do**:

- DO NOT change page content (done in Tasks 5-9)

**Recommended Agent Profile**:

- **Category**: `quick`
- **Skills**: `[]`
  - Reason: Pattern application across files

**Parallelization**:

- **Can Run In Parallel**: NO
- **Parallel Group**: Wave 4 (with Task 11, sequential)
- **Blocks**: Task 11
- **Blocked By**: Tasks 5-9

**References**:

- `app/layout.tsx:18-21` - Current static metadata
- next-intl docs: Server-side translations for generateMetadata
- `messages/en.json` - Add metadata namespace

**Acceptance Criteria**:

- [ ] `grep "generateMetadata" app/layout.tsx` finds function
- [ ] `grep "generateMetadata" app/page.tsx` finds function
- [ ] `grep -r "generateMetadata" app/\(dashboard\)/` finds functions in most pages
- [ ] `pnpm build` succeeds

**Agent-Executed QA Scenarios:**

```
Scenario: Page title changes with locale
  Tool: Playwright (playwright skill)
  Preconditions: Dev server running
  Steps:
    1. Set cookie: locale=en
    2. Navigate to: http://localhost:3000/settings
    3. Assert: document.title contains "Settings" (or English equivalent)
    4. Set cookie: locale=zh-TW
    5. Reload page
    6. Assert: document.title contains "設定" (or Chinese equivalent)
  Expected Result: Page title translates
  Evidence: Title values captured

Scenario: Home page metadata translated
  Tool: Playwright (playwright skill)
  Preconditions: Dev server running
  Steps:
    1. Set cookie: locale=zh-TW
    2. Navigate to: http://localhost:3000
    3. Assert: document.title is in Chinese
  Expected Result: Home page title translated
  Evidence: Screenshot captured
```

**Commit**: YES

- Message: `feat(i18n): add translated page metadata`
- Files: All page files, `messages/*.json`
- Pre-commit: `pnpm build`

---

### Task 11: Write Vitest + Playwright Tests

**What to do**:

1. Create `__tests__/i18n/` directory for i18n tests
2. Create `__tests__/i18n/translations.test.ts`:
   - Test translation file key parity
   - Test all namespaces have content
   - Test no empty string values
3. Create `__tests__/i18n/locale-detection.test.ts`:
   - Test middleware locale detection logic
   - Test cookie fallback behavior
4. Create `e2e/i18n.spec.ts` (Playwright):
   - Test language switcher in Header
   - Test Settings/Language page selection
   - Test browser language detection
   - Test persistence across navigation
5. Update test configuration if needed

**Must NOT do**:

- DO NOT create excessive test cases (focus on critical paths)
- DO NOT test every translation string

**Recommended Agent Profile**:

- **Category**: `unspecified-high`
- **Skills**: `["playwright"]`
  - Reason: E2E testing requires Playwright skill

**Parallelization**:

- **Can Run In Parallel**: NO
- **Parallel Group**: Wave 4 (final task)
- **Blocks**: None (final)
- **Blocked By**: All previous tasks

**References**:

- `vitest.config.ts` - Test configuration
- `playwright.config.ts` - E2E configuration
- `e2e/` - Existing E2E tests
- `__tests__/` - Existing test patterns

**Acceptance Criteria**:

- [ ] `pnpm test i18n` passes (Vitest)
- [ ] `pnpm test:e2e e2e/i18n.spec.ts` passes (Playwright)
- [ ] At least 5 Vitest tests for i18n
- [ ] At least 3 Playwright E2E tests for i18n

**Agent-Executed QA Scenarios:**

```
Scenario: Vitest i18n tests pass
  Tool: Bash
  Preconditions: Test files created
  Steps:
    1. Run: pnpm test __tests__/i18n/ --run
    2. Assert: Exit code 0
    3. Assert: Output shows test count >= 5
  Expected Result: All unit tests pass
  Evidence: Test output captured

Scenario: Playwright i18n tests pass
  Tool: Bash
  Preconditions: Dev server running, test file created
  Steps:
    1. Run: pnpm test:e2e e2e/i18n.spec.ts
    2. Assert: Exit code 0
    3. Assert: Output shows test count >= 3
  Expected Result: All E2E tests pass
  Evidence: Test output captured
```

**Commit**: YES

- Message: `test(i18n): add i18n unit and E2E tests`
- Files: `__tests__/i18n/*.ts`, `e2e/i18n.spec.ts`
- Pre-commit: `pnpm test --run && pnpm test:e2e e2e/i18n.spec.ts`

---

## Commit Strategy

| After Task | Message                                                | Files                                                                           | Verification                      |
| ---------- | ------------------------------------------------------ | ------------------------------------------------------------------------------- | --------------------------------- |
| 1          | `feat(i18n): add next-intl infrastructure`             | package.json, next.config.ts, middleware.ts, i18n/_, app/layout.tsx, messages/_ | `pnpm build && pnpm tsc --noEmit` |
| 3          | `feat(i18n): add translation files for en and zh-TW`   | messages/\*.json                                                                | `jq empty messages/*.json`        |
| 4          | `feat(i18n): add LanguageSwitcher component to Header` | components/shared/LanguageSwitcher.tsx, Header.tsx, index.ts                    | `pnpm tsc --noEmit`               |
| 5-9        | `feat(i18n): translate all UI components and pages`    | All .tsx files                                                                  | `pnpm tsc --noEmit`               |
| 10         | `feat(i18n): add translated page metadata`             | All page files                                                                  | `pnpm build`                      |
| 11         | `test(i18n): add i18n unit and E2E tests`              | **tests**/i18n/\*, e2e/i18n.spec.ts                                             | `pnpm test --run`                 |

---

## Success Criteria

### Verification Commands

```bash
# Build verification
pnpm build && echo "BUILD_SUCCESS"
# Expected: BUILD_SUCCESS

# Type check
pnpm tsc --noEmit && echo "TYPES_OK"
# Expected: TYPES_OK

# Lint check
pnpm lint && echo "LINT_OK"
# Expected: LINT_OK

# Test verification
pnpm test --run && echo "TESTS_OK"
# Expected: TESTS_OK

# Translation file parity
diff <(jq -S 'keys' messages/en.json) <(jq -S 'keys' messages/zh-TW.json)
# Expected: Empty output (no differences)

# Key count verification
jq 'keys | length' messages/en.json
# Expected: > 100
```

### Final Checklist

- [ ] All "Must Have" present
- [ ] All "Must NOT Have" absent
- [ ] All tests pass (Vitest + Playwright)
- [ ] Language can be switched from Header
- [ ] Language can be switched from Settings/Language
- [ ] Browser detection works (clears cookie, uses Accept-Language)
- [ ] Cookie persists language choice
- [ ] All pages display correctly in both languages
- [ ] Page metadata (titles) translate correctly
- [ ] No TypeScript errors
- [ ] No lint errors
- [ ] Build succeeds
