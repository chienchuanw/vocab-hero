# Middleware to Proxy Migration

## TL;DR

> **Quick Summary**: Rename `middleware.ts` to `proxy.ts` and update the exported function name to resolve the Next.js 16 deprecation warning.
>
> **Deliverables**:
>
> - `proxy.ts` file replacing the deprecated `middleware.ts`
> - Zero deprecation warnings related to middleware convention
>
> **Estimated Effort**: Quick
> **Parallel Execution**: NO - single sequential task
> **Critical Path**: Task 1 only

---

## Context

### Original Request

Fix the Next.js 16 deprecation warning:

```
The "middleware" file convention is deprecated. Please use "proxy" instead.
```

### Research Findings

- **Next.js 16 Blog**: `proxy.ts` replaces `middleware.ts` to clarify network boundary. Logic stays the same — only the filename and exported function name change.
- **Official Docs** (`/docs/app/getting-started/proxy`): The proxy function can be exported as either a named `proxy` export or a `default` export. The `config` matcher export remains unchanged.
- **Current `middleware.ts`**: Performs locale detection via cookies and `Accept-Language` header. 62 lines. No other files import from it.
- **No test file**: `middleware.test.ts` does not exist, so no test updates needed.

---

## Work Objectives

### Core Objective

Eliminate the deprecated `middleware.ts` file convention by migrating to the new `proxy.ts` convention introduced in Next.js 16.

### Concrete Deliverables

- `proxy.ts` at project root with identical logic to current `middleware.ts`
- Removal of `middleware.ts`

### Definition of Done

- [x] `middleware.ts` no longer exists
- [x] `proxy.ts` exists at project root with correct exported function
- [x] `pnpm dev` runs without the "middleware file convention is deprecated" warning
- [x] Locale detection (cookie-based) continues to work as before

### Must Have

- Preserve all existing locale detection logic unchanged
- Preserve the `config.matcher` export unchanged
- Use named `proxy` export (consistent with Next.js docs convention)

### Must NOT Have (Guardrails)

- Do NOT change any locale detection logic
- Do NOT modify `i18n/routing.ts`, `i18n/request.ts`, or `next.config.ts`
- Do NOT rename helper functions (`isValidLocale`, `getPreferredLocale`) — only the exported entry point
- Do NOT add new dependencies or configuration

---

## Verification Strategy

### Test Decision

- **Infrastructure exists**: YES (Vitest + Playwright)
- **Automated tests**: NO — this is a trivial rename; no unit test existed before and none is needed now
- **Primary verification**: Agent-Executed QA Scenarios

---

## TODOs

- [x] 1. Rename `middleware.ts` to `proxy.ts` and update exported function

  **What to do**:
  1. Create `proxy.ts` at project root with the exact contents of `middleware.ts`, but with the following changes:
     - Rename the exported function from `middleware` to `proxy`
     - All other code (imports, constants, helper functions, config export) stays identical
  2. Delete `middleware.ts`

  **Current `middleware.ts` structure** (for reference):

  ```
  - Imports: NextResponse, NextRequest from 'next/server'; locale config from './i18n/routing'
  - Constants: COOKIE_NAME = 'locale', COOKIE_MAX_AGE = 60 * 60 * 24 * 365
  - Helper: isValidLocale(locale: string): locale is Locale
  - Helper: getPreferredLocale(acceptLanguage: string | null): Locale
  - Export: function middleware(request: NextRequest) → RENAME TO proxy
  - Export: config = { matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'] }
  ```

  **The ONLY change** is line 39:

  ```diff
  - export function middleware(request: NextRequest) {
  + export function proxy(request: NextRequest) {
  ```

  **Must NOT do**:
  - Do not modify any logic inside the function
  - Do not change imports, constants, or helper functions
  - Do not change the `config` export

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: [`git-master`]
    - `git-master`: Needed for clean atomic commit after the rename

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential (only task)
  - **Blocks**: None
  - **Blocked By**: None

  **References**:

  **Pattern References**:
  - `middleware.ts:1-62` — The complete current file; copy everything, only rename the exported function on line 39

  **Documentation References**:
  - Next.js 16 Blog (proxy section): "Rename `middleware.ts` → `proxy.ts` and rename the exported function to `proxy`. Logic stays the same."
  - Next.js Proxy Docs (`/docs/app/getting-started/proxy`): Named `proxy` export or default export both work. `config.matcher` unchanged.

  **Acceptance Criteria**:
  - [x] File `middleware.ts` does not exist: `ls middleware.ts` returns "No such file"
  - [x] File `proxy.ts` exists at project root: `ls proxy.ts` succeeds
  - [x] `proxy.ts` exports a function named `proxy`: `grep "export function proxy" proxy.ts` returns a match
  - [x] `proxy.ts` exports the same matcher config: `grep "matcher" proxy.ts` returns the matcher pattern
  - [x] All helper functions preserved: `grep "isValidLocale\|getPreferredLocale" proxy.ts` returns both matches
  - [x] TypeScript compiles without errors: `pnpm tsc --noEmit` passes

  **Agent-Executed QA Scenarios**:

  ```
  Scenario: Dev server runs without middleware deprecation warning
    Tool: Bash
    Preconditions: proxy.ts exists, middleware.ts deleted
    Steps:
      1. Run: pnpm dev &
      2. Wait 10 seconds for server startup
      3. Run: curl -s http://localhost:3000 > /dev/null
      4. Capture server output from startup
      5. Assert: stdout does NOT contain "middleware" and "deprecated"
      6. Assert: stdout contains "Ready" or similar startup confirmation
      7. Kill dev server
    Expected Result: No deprecation warning about middleware convention
    Evidence: Terminal output captured

  Scenario: Locale cookie is set for new visitor (no existing cookie)
    Tool: Bash (curl)
    Preconditions: Dev server running on localhost:3000
    Steps:
      1. curl -v -H "Accept-Language: zh-TW,zh;q=0.9,en;q=0.8" http://localhost:3000 2>&1
      2. Assert: Response headers contain "set-cookie" with "locale=zh-TW"
      3. curl -v -H "Accept-Language: en-US,en;q=0.9" http://localhost:3000 2>&1
      4. Assert: Response headers contain "set-cookie" with "locale=en"
    Expected Result: Locale cookie is correctly set based on Accept-Language
    Evidence: curl verbose output captured

  Scenario: Existing locale cookie is respected (no overwrite)
    Tool: Bash (curl)
    Preconditions: Dev server running on localhost:3000
    Steps:
      1. curl -v -b "locale=zh-TW" -H "Accept-Language: en-US" http://localhost:3000 2>&1
      2. Assert: Response headers do NOT contain "set-cookie" with "locale=en"
    Expected Result: Existing valid cookie is not overwritten by Accept-Language
    Evidence: curl verbose output captured
  ```

  **Commit**: YES
  - Message: `refactor: rename middleware.ts to proxy.ts for Next.js 16 compatibility`
  - Files: `proxy.ts` (new), `middleware.ts` (deleted)
  - Pre-commit: `pnpm tsc --noEmit`

---

## Commit Strategy

| After Task | Message                                                                   | Files                                 | Verification        |
| ---------- | ------------------------------------------------------------------------- | ------------------------------------- | ------------------- |
| 1          | `refactor: rename middleware.ts to proxy.ts for Next.js 16 compatibility` | `proxy.ts`, `middleware.ts` (deleted) | `pnpm tsc --noEmit` |

---

## Success Criteria

### Verification Commands

```bash
# File renamed correctly
test ! -f middleware.ts && test -f proxy.ts && echo "PASS" || echo "FAIL"

# TypeScript compiles
pnpm tsc --noEmit  # Expected: no errors

# Function correctly named
grep -c "export function proxy" proxy.ts  # Expected: 1
```

### Final Checklist

- [x] `middleware.ts` removed
- [x] `proxy.ts` created with identical logic (only function name changed)
- [x] No deprecation warning on `pnpm dev`
- [x] Locale detection works (cookie set for new visitors, respected for returning visitors)
- [x] TypeScript compilation passes
