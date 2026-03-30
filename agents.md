# AGENTS.md - Vocab Hero

## Project Structure

pnpm monorepo with three packages:

- `packages/web` — Next.js 16 App Router (primary app)
- `packages/desktop` — Electron wrapper (shares Prisma schema)
- `packages/shared` — Shared Zod schemas and types

All web development happens in `packages/web`. Run commands from repo root using `--filter`.

## Commands

### Build & Dev

```bash
pnpm dev:web                        # Start Next.js dev server (port 3000)
pnpm build:web                      # Production build
pnpm --filter @vocab-hero/web start # Start production server
```

### Lint & Format

```bash
pnpm lint:web                              # ESLint (next/core-web-vitals + typescript + prettier)
pnpm --filter @vocab-hero/web format       # Prettier --write .
pnpm --filter @vocab-hero/web format:check # Prettier --check .
```

### Testing

```bash
pnpm test:web                                            # All unit/integration tests (Vitest)
pnpm --filter @vocab-hero/web test -- path/to/file.test.ts  # Single test file
pnpm --filter @vocab-hero/web test:coverage              # Coverage report (thresholds: 78%)
pnpm --filter @vocab-hero/web test:e2e                   # Playwright E2E (chromium/firefox/webkit)
```

Vitest config: jsdom env, globals enabled, setup at `tests/setup.ts`, 10s timeout.
E2E tests live in `packages/web/e2e/`. Playwright uses baseURL `http://localhost:3000`.

### Database

```bash
pnpm --filter @vocab-hero/web prisma generate           # Generate Prisma client
pnpm --filter @vocab-hero/web prisma migrate dev --name <name>  # Create migration
pnpm --filter @vocab-hero/web prisma db seed             # Seed database
pnpm --filter @vocab-hero/web seed:dev                   # Dev seed data
```

PostgreSQL. Test DB: `postgresql://postgres:postgres@localhost:5432/db_vocab_hero_test`.

## Code Style

### Formatting (Prettier)

- Single quotes, semicolons, 2-space indent
- Trailing commas: `es5`
- Print width: 100
- Arrow parens: always

### TypeScript

- **Strict mode** with `noUncheckedIndexedAccess`, `noImplicitReturns`, `noFallthroughCasesInSwitch`
- Path alias: `@/*` maps to `packages/web/*`
- Never use `any`, `@ts-ignore`, or `@ts-expect-error`
- Use `import type { ... }` for type-only imports
- Use named exports (avoid default exports for components/hooks)

### ESLint Rules

- `no-console: warn` (allow `console.warn` and `console.error` only)
- `@typescript-eslint/no-unused-vars: warn` (prefix unused with `_`)

### Naming Conventions

| What | Convention | Example |
|------|-----------|---------|
| Components | PascalCase file + named export | `VocabularyCard.tsx`, `export function VocabularyCard()` |
| Hooks | camelCase with `use` prefix | `useVocabulary.ts`, `export function useVocabulary()` |
| Utility files | kebab-case | `date-formatter.ts`, `srs-calculator.ts` |
| Test files | Co-located, `.test.ts(x)` suffix | `VocabularyCard.test.tsx`, `route.test.ts` |
| API routes | `route.ts` in App Router dirs | `app/api/vocabulary/route.ts` |
| Prisma models | PascalCase model, snake_case columns | `@map("created_at")`, `@@map("vocabulary_items")` |
| Enums | SCREAMING_SNAKE_CASE values | `FLASHCARD`, `MULTIPLE_CHOICE` |

### Comments

- JSDoc (`/** */`) for public API functions and types
- Traditional Chinese (zh-TW) for inline logic comments
- No emoji in code or comments

### Imports Order

1. External packages (`next`, `react`, third-party)
2. Internal aliases (`@/lib/...`, `@/components/...`, `@/hooks/...`)
3. Relative imports (`./`, `../`)
4. Type imports last (using `import type`)

Barrel exports via `index.ts` files (e.g., `lib/api/index.ts` re-exports `response`, `errors`, `fetch`).

## Architecture Patterns

### API Routes

Standard response format via `@/lib/api`:

```typescript
import { successResponse, ApiErrors } from '@/lib/api';

// Success: { success: true, data: T }
return successResponse(data, 201);

// Error: { success: false, error: { code, message, details? } }
return ApiErrors.VALIDATION_ERROR('Invalid input', zodError.flatten());
return ApiErrors.NOT_FOUND('Vocabulary item not found');
return ApiErrors.INTERNAL_ERROR('Failed to fetch');
```

Custom error classes: `ApiError`, `ValidationError`, `NotFoundError`, `DatabaseError`.
Input validation: Zod schemas in `lib/validations/`.

### Components

- `components/ui/` — shadcn/ui primitives (Button, Card, Dialog, etc.)
- `components/features/<domain>/` — Feature components (vocabulary, study, progress, etc.)
- `components/shared/` — Cross-feature components (Layout, OfflineBanner, etc.)

Styling: Tailwind CSS 4 + `cn()` utility (clsx + tailwind-merge). No inline styles.

### Hooks

TanStack Query for server state. Located in `hooks/` directory.

```typescript
import { useQuery } from '@tanstack/react-query';
export function useVocabulary() {
  return useQuery({ queryKey: ['vocabulary'], queryFn: ... });
}
```

### Database

Prisma ORM with PostgreSQL. Schema at `packages/web/prisma/schema.prisma`.
All models use `cuid()` IDs, `createdAt`/`updatedAt` timestamps with `@map("snake_case")`.

### i18n

`next-intl` for internationalization. Translations loaded server-side via `getMessages()`.

## Testing Patterns

### Unit/Integration Tests (Vitest)

- Co-located with source files (`.test.ts` / `.test.tsx`)
- API tests use `cleanDatabase()` from `@/tests/setup-db` in `beforeEach`
- Component tests use custom `render` from `@/tests/test-utils`
- Use `vi.mock()` for module mocking, `vi.fn()` for function mocks
- `afterEach`: `cleanup()` + `vi.clearAllMocks()` (handled in setup)

### E2E Tests (Playwright)

- Located in `packages/web/e2e/`
- Runs against `http://localhost:3000`
- Auto-starts dev server in non-CI environments

## Key Dependencies

| Package | Purpose |
|---------|---------|
| `next` 16 | App framework |
| `@tanstack/react-query` | Server state management |
| `zod` | Schema validation |
| `@prisma/client` | Database ORM |
| `framer-motion` | Animations |
| `next-intl` | i18n |
| `next-themes` | Dark/light theme |
| `sonner` | Toast notifications |
| `lucide-react` | Icons |
| `recharts` | Charts |
| `msw` | API mocking in tests |

## Prohibited

- `any` type, `@ts-ignore`, `@ts-expect-error`
- `console.log` in production code (use `console.warn`/`console.error`)
- Default exports for components/hooks
- Inline styles (use Tailwind)
- Hardcoded secrets (use env vars)
- Committing without passing lint + tests
