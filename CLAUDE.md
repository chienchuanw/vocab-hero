# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Vocab Hero is a Japanese vocabulary learning app with spaced repetition (SM-2 algorithm), six study modes (flashcard, quiz, spelling, matching, listening, random), and Duolingo screenshot OCR import. Target users are casual hobbyist learners with 5-15 minute daily sessions.

## Monorepo Structure

pnpm monorepo with three packages:

- `packages/web` — Next.js 16 App Router (primary app, where most development happens)
- `packages/desktop` — Electron wrapper for macOS
- `packages/shared` — Zod schemas, enums, and SM-2 SRS algorithm

Run commands from repo root using `pnpm --filter @vocab-hero/web <script>`.

## Commands

```bash
# Dev & Build
pnpm dev:web                        # Next.js dev server (port 3000)
pnpm build:web                      # Production build

# Lint & Format
pnpm lint:web                              # ESLint
pnpm --filter @vocab-hero/web format       # Prettier --write
pnpm --filter @vocab-hero/web format:check # Prettier check

# Tests
pnpm test:web                                               # All unit/integration (Vitest)
pnpm --filter @vocab-hero/web test -- path/to/file.test.ts  # Single test file
pnpm --filter @vocab-hero/web test:coverage                 # Coverage (threshold: 78%)
pnpm --filter @vocab-hero/web test:e2e                      # Playwright E2E

# Database
pnpm --filter @vocab-hero/web prisma generate
pnpm --filter @vocab-hero/web prisma migrate dev --name <name>
pnpm --filter @vocab-hero/web prisma db seed
```

## Tech Stack

- **Frontend:** Next.js 16 (App Router), React 19, Tailwind CSS 4, shadcn/ui (new-york style)
- **State:** TanStack React Query for server state
- **Database:** PostgreSQL with Prisma ORM (`packages/web/prisma/schema.prisma`)
- **Validation:** Zod schemas in `lib/validations/`
- **i18n:** next-intl (English + Traditional Chinese zh-TW), translations in `/messages/`
- **Testing:** Vitest (jsdom, 10s timeout) + Playwright (chromium/firefox/webkit)
- **Animations:** Framer Motion + canvas-confetti for celebrations

## Architecture

### API Routes

Standard response format via `@/lib/api`:
- Success: `{ success: true, data: T }` — use `successResponse(data, status)`
- Error: `{ success: false, error: { code, message, details? } }` — use `ApiErrors.VALIDATION_ERROR()`, `ApiErrors.NOT_FOUND()`, `ApiErrors.INTERNAL_ERROR()`

### Components

- `components/ui/` — shadcn/ui primitives
- `components/features/<domain>/` — Feature components (vocabulary, study, progress, etc.)
- `components/shared/` — Cross-feature components
- Styling: Tailwind + `cn()` utility (clsx + tailwind-merge), no inline styles

### Hooks

TanStack Query hooks in `hooks/` directory. Named exports with `use` prefix.

### Database

All Prisma models use `cuid()` IDs, `createdAt`/`updatedAt` with `@map("snake_case")`.

## Code Conventions

- **TypeScript strict mode** with `noUncheckedIndexedAccess` — never use `any`, `@ts-ignore`, or `@ts-expect-error`
- **Path alias:** `@/*` maps to `packages/web/*`
- **Named exports only** (no default exports for components/hooks)
- **Import order:** external packages → internal aliases (`@/`) → relative → type imports
- **Barrel exports** via `index.ts` files
- **Prettier:** single quotes, semicolons, 2-space indent, trailing commas es5, 100 char width
- **Console:** only `console.warn`/`console.error` allowed (no `console.log`)
- **Unused vars:** prefix with `_`
- **Comments:** JSDoc for public APIs; Traditional Chinese (zh-TW) for inline logic comments
- **Naming:** PascalCase components, camelCase hooks (`use` prefix), kebab-case utils, SCREAMING_SNAKE_CASE enums

## Testing

- **Unit/integration tests** co-located as `.test.ts(x)` files
- Setup file at `tests/setup.ts` (mocks ResizeObserver, IntersectionObserver, matchMedia, Web Speech API, etc.)
- API tests use `cleanDatabase()` from `@/tests/setup-db` in `beforeEach`
- Component tests use custom `render` from `@/tests/test-utils`
- E2E tests in `packages/web/e2e/`, run against localhost:3000

## Design Context

Duolingo-inspired UI with Anki's SRS depth. Playful, encouraging, gamified surface with serious spaced repetition underneath. See `.impeccable.md` for full design tokens (oklch colors, Geist fonts, 1rem base radius, animation specs).
