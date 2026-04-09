# Vocab Hero - Findings

**Last Updated:** 2026-04-10

---

## 1. Current Project Status

### Overall Health: Good (Feature-rich, some integration gaps)

Vocab Hero is a well-structured pnpm monorepo with three packages. The app has 6 study modes, 30 API routes, 13 database models, full i18n, and solid CI/CD. Code quality is high: strict TypeScript (zero `any` usage), enforced conventions, and 78%+ test coverage.

### Feature Completeness Matrix

| Feature | Status | Notes |
|---------|--------|-------|
| Flashcard Study | Done | Flip animation, quality rating, progress |
| Quiz Study | Partial | Groups not fetched (empty array passed) |
| Spelling Study | Partial | Mock data, TODO for API fetch |
| Matching Study | Done | Recently redesigned (immersive header, two-column) |
| Listening Study | Done | Multiple-choice + typing, audio replay |
| Random Study | Partial | Mock vocabulary data, TODO for API fetch |
| Vocabulary CRUD | Done | Cursor pagination, search, sort, filter, groups |
| Groups/Decks | Done | Full CRUD, vocabulary assignment |
| SRS (SM-2) | Done | Algorithm in shared package, ReviewSchedule model |
| Progress Dashboard | Partial | Mock data, TODO for live API data |
| Home Page | Partial | Mock daily progress, TODO for live data |
| Goals & Streaks | Done | Daily targets, streak tracking, freeze support |
| Sentence Cards | Done | CRUD + Duolingo OCR import via Tesseract.js |
| Notifications | Done | In-app + push framework, preferences |
| Settings | Done | Theme, TTS, study prefs, language, data management |
| i18n | Done | EN + zh-TW fully translated (545 lines each) |
| Desktop App | Minimal | Electron wrapper, macOS only, untested |
| CI/CD | Done | Lint, typecheck, test, coverage, build |

---

## 2. Current Problems

### Critical (Blocks user-facing functionality)

#### P1: `/api/study` route is a stub
- **File:** `packages/web/app/api/study/route.ts` lines 10, 24
- **Impact:** GET returns `[]`, POST returns placeholder — no study session persistence via this endpoint
- **Note:** `/api/study/sessions` routes ARE implemented and functional. The `/api/study` route may be dead code or an older endpoint.

#### P2: Quiz page passes empty groups
- **File:** `packages/web/app/(dashboard)/study/quiz/page.tsx` line 95
- **Impact:** `QuizConfigForm` receives `groups={[]}` — users cannot select vocabulary groups for quiz mode
- **Fix:** Fetch groups via `useGroups()` hook (already exists)

#### P3: Study pages use hardcoded mock data
- **Files:**
  - `app/(dashboard)/study/spelling/page.tsx:19` — mock questions
  - `app/(dashboard)/study/random/page.tsx:32` — mock vocabulary
- **Impact:** Spelling and Random modes don't pull real vocabulary from DB
- **Fix:** Replace mock data with API calls using existing hooks

#### P4: Home & Progress pages show placeholder data
- **Files:**
  - `app/(home)/page.tsx:19` — TODO: fetch today's actual progress
  - `app/(dashboard)/progress/page.tsx:29` — same TODO
- **Impact:** Users see static/fake progress numbers
- **Fix:** Call `/api/progress` endpoint (already implemented)

### Moderate (Quality & maintainability)

#### M1: 14 E2E tests skipped — no test data fixtures
- **Files:** `e2e/quiz.spec.ts` (5), `e2e/spelling.spec.ts` (8), `e2e/random-quiz.spec.ts` (1)
- **Reason:** All say "TODO: 設置測試資料後啟用此測試" (enable after test data setup)
- **Fix:** Create E2E seed script or Playwright fixtures that populate vocabulary/groups before tests

#### M2: SM-2 integration may not trigger from study sessions
- The algorithm exists in `packages/shared/src/srs/sm2.ts`
- `ReviewSchedule` model tracks SRS data
- `/api/vocabulary/[id]/review` route exists for posting reviews
- **Risk:** Need to verify that study mode completion actually calls the review endpoint to update SRS

#### M3: 26 directories missing barrel exports (index.ts)
- 13 under `components/features/` and 13 under `lib/`
- Convention says barrel exports via `index.ts` files
- **Impact:** Import paths are longer and less consistent

#### M4: Console.log in production code
- `packages/desktop/electron/` — 3 files (acceptable for Electron main process)
- `packages/web/lib/push-notifications/service-worker.ts` — 5 console.log calls
- Convention allows only `console.warn`/`console.error`

---

## 3. Features That Could Be Developed

### High Priority (Address existing gaps)

#### F1: Wire up live data for study pages
- **Scope:** Replace mock data in Spelling, Random, Quiz, Home, and Progress pages with real API calls
- **Effort:** Small — hooks and API routes already exist
- **Impact:** High — makes 3 study modes + 2 pages actually functional
- **Dependencies:** None

#### F2: E2E test data fixtures
- **Scope:** Create a seed/fixture system for Playwright E2E tests, enable 14 skipped tests
- **Effort:** Medium — need seed script + fixture helpers
- **Impact:** High — unblocks full E2E coverage for quiz, spelling, random modes

#### F3: SRS integration verification & completion
- **Scope:** Ensure study session completion triggers SM-2 review updates via `/api/vocabulary/[id]/review`
- **Effort:** Small-Medium — trace the flow, add missing calls if needed
- **Impact:** Critical — SRS is the core differentiator from simple flashcard apps

### Medium Priority (New features)

#### F4: Vocabulary import from CSV/Excel
- **Scope:** Bulk import vocabulary from spreadsheet files (CSV exists as export, add import)
- **Effort:** Medium — `/api/import` exists for JSON, extend to CSV
- **Impact:** Onboarding — users can import existing word lists

#### F5: Study statistics & analytics dashboard
- **Scope:** Enhance progress page with: study time trends, accuracy by mode, SRS forecast (upcoming reviews), weakest vocabulary
- **Effort:** Medium — data exists in StudySession + ProgressLog + ReviewSchedule
- **Impact:** Medium — helps users understand their learning patterns

#### F6: Multi-user support
- **Scope:** Database schema has User model but app uses single default user. Add auth, user switching.
- **Effort:** Large — auth system, session management, data isolation
- **Impact:** High for sharing/family use, low for solo learner MVP

### Lower Priority (Polish & expansion)

#### F7: Desktop app hardening
- **Scope:** Add E2E tests, Windows/Linux builds, SQLite vs PostgreSQL documentation
- **Effort:** Medium-Large
- **Impact:** Expands platform reach

#### F8: Offline mode / PWA
- **Scope:** Service worker for offline study, sync when back online
- **Effort:** Large — offline DB, sync logic, conflict resolution
- **Impact:** High for mobile/commute use case

#### F9: Barrel export cleanup
- **Scope:** Add missing `index.ts` files to 26 directories
- **Effort:** Small — mechanical task
- **Impact:** Code consistency and cleaner imports

#### F10: Gamification enhancements
- **Scope:** XP system, levels, achievements, daily challenges
- **Effort:** Medium — new models, UI components, reward logic
- **Impact:** Aligns with Duolingo-inspired design philosophy

---

## 4. Tech Stack Summary

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| UI | React 19, Tailwind CSS 4, shadcn/ui (new-york) |
| State | TanStack React Query |
| Database | PostgreSQL + Prisma ORM |
| Validation | Zod |
| i18n | next-intl (en, zh-TW) |
| Testing | Vitest (unit) + Playwright (E2E) |
| Animation | Framer Motion + canvas-confetti |
| Desktop | Electron (macOS) |
| CI/CD | GitHub Actions |
| SRS | SM-2 algorithm (shared package) |

---

## 5. Architecture Notes

- **API response format:** `{ success: true, data }` or `{ success: false, error: { code, message } }` via `@/lib/api`
- **All Prisma models:** cuid() IDs, createdAt/updatedAt with @map("snake_case")
- **Path alias:** `@/*` maps to `packages/web/*`
- **Named exports only** — no default exports for components/hooks
- **13 Prisma models:** User, VocabularyItem, ExampleSentence, SentenceCard, VocabularyGroup, ReviewSchedule, StudySession, ProgressLog, DailyGoal, UserStreak, Notification, NotificationPreference, UserSettings
