# Vocabulary Page UI/UX Optimization

## TL;DR

> **Quick Summary**: Comprehensive UI/UX polish of the `/vocabulary` page — apply unused Duolingo design tokens, fix loading/empty/error states, modernize filter bar into Popover, add hover-reveal card actions, conditional drag-drop zone, stats header, i18n coverage, and unify both tabs' visual patterns.
> 
> **Deliverables**:
> - Skeleton loading, proper empty state, and error+retry for VocabularyList
> - VocabularyCard with card-shadow, hover-reveal actions, drag handle, due-for-review indicator, semantic tokens
> - Filter bar refactored into Search+Sort inline + Filter Popover for advanced filters
> - Group drop zone shown only during active drag
> - Page header with summary stats (client-side from loaded data)
> - Full i18n wiring for all 3 vocabulary components + GroupCard
> - Sentences tab cards unified with same visual treatment
> - All existing tests updated + new TDD tests for all changes
> 
> **Estimated Effort**: Large
> **Parallel Execution**: YES - 3 waves
> **Critical Path**: Task 0 (Popover install) → Task 2 (Filter Popover) → Task 6 (E2E updates)

---

## Context

### Original Request
User requested a review and optimization of the `/vocabulary` page UI/UX, covering all existing features and visual design.

### Interview Summary
**Key Discussions**:
- **Scope**: All 5 identified categories, both Vocabulary and Sentences tabs
- **Filter Bar**: Migrate from inline 4-5 selects to Search+Sort inline + Popover for Mastery/Group filters
- **Card Actions**: Edit/Delete buttons show on hover only (mobile: touch-friendly fallback)
- **Group Drop Zone**: Show only during active DnD operations, hidden otherwise
- **Test Strategy**: TDD with Vitest + React Testing Library; update Playwright E2E in-task

**Research Findings**:
- `globals.css` defines `.card-shadow`, `.card-shadow-hover`, `.btn-shadow` — **none used** by vocabulary components
- `EmptyState` shared component exists — **not used** by VocabularyList
- SentenceList already uses Skeleton loading + proper error state — VocabularyList does not
- i18n keys already defined in `messages/en.json` for most filter labels — **not wired up** in components
- No `VocabularyList.test.tsx` exists — must create from scratch
- E2E tests use English text selectors that will break when i18n is wired

### Metis Review
**Identified Gaps** (addressed):
- **Empty state pattern**: Use shared `EmptyState` component for VocabularyList; also refactor SentenceList to use it for consistency
- **Drag handle intent**: Keep full-card drag AND show GripVertical as visual affordance only (no behavior change)
- **Summary stats**: Client-side only from loaded data (no new API endpoint)
- **GroupCard styling**: Include in scope (same hardcoded color/i18n issues)
- **MasteryIndicator colors**: Defer to future task (functional, just old tokens)
- **E2E test updates**: Include in each task that changes the tested component
- **Popover installation**: Must install shadcn Popover as prerequisite
- **Mobile hover**: Use DropdownMenu as mobile fallback for hover-reveal actions

---

## Work Objectives

### Core Objective
Polish the /vocabulary page to fully leverage the existing Duolingo-inspired design system, fix inconsistencies between Vocabulary and Sentences tabs, and improve interaction quality across loading, filtering, card actions, and drag-drop.

### Concrete Deliverables
- Updated `VocabularyList.tsx` with Skeleton loading, EmptyState, error+retry
- Updated `VocabularyCard.tsx` with card-shadow, hover-reveal, drag handle icon, due badge, semantic tokens
- New `VocabularyFilterPopover.tsx` component replacing inline filter selects
- Updated `VocabularyFilterBar.tsx` with Search+Sort+PopoverTrigger
- Updated `page.tsx` with conditional drop zone + stats header
- Updated `SentenceList.tsx` with card-shadow treatment + EmptyState component
- Updated `GroupCard.tsx` with semantic tokens + i18n
- Updated i18n files (`en.json` + `zh-TW.json`) with new keys
- New + updated unit tests (TDD) for all changed components
- Updated Playwright E2E tests

### Definition of Done
- [ ] `pnpm vitest run` — all tests pass, 0 failures
- [ ] `pnpm exec playwright test e2e/vocabulary-crud.spec.ts e2e/vocabulary-drag-drop.spec.ts` — all pass
- [ ] `pnpm tsc --noEmit` — zero TypeScript errors
- [ ] `pnpm lint` — zero lint errors
- [ ] Zero hardcoded English strings in vocabulary components (all i18n)

### Must Have
- Skeleton loading for VocabularyList (matching SentenceList pattern)
- EmptyState with icon + CTA for VocabularyList
- Error state with retry button for VocabularyList
- Card shadow effects on VocabularyCard and SentenceList cards
- Hover-reveal Edit/Delete with mobile DropdownMenu fallback
- GripVertical drag handle icon (visual only, full-card drag preserved)
- Filter Popover for Mastery Level + Group filters
- Active filter badges with reset
- i18n for VocabularyList, VocabularyCard, VocabularyFilterBar, GroupCard
- Group drop zone hidden when not dragging
- All existing tests passing

### Must NOT Have (Guardrails)
- Must NOT change `VocabularyItem` type or any API routes — this is UI-only
- Must NOT create a new API endpoint for stats — use client-side calculation only
- Must NOT change drag initiation behavior — GripVertical is visual affordance only, entire card remains draggable
- Must NOT refactor MasteryIndicator color system — defer to separate task
- Must NOT remove any existing `data-testid` attributes
- Must NOT add gratuitous animations beyond GroupDropZone entrance/exit
- Must NOT install shadcn components beyond Popover and DropdownMenu (if not installed)
- Must NOT change any Prisma schema or database operations

---

## Verification Strategy

> **UNIVERSAL RULE: ZERO HUMAN INTERVENTION**
>
> ALL tasks are verifiable by running commands or using tools. No human action permitted.

### Test Decision
- **Infrastructure exists**: YES (Vitest + RTL + Playwright)
- **Automated tests**: TDD (Red-Green-Refactor)
- **Framework**: Vitest + @testing-library/react (unit), Playwright (E2E)

### TDD Task Structure
Each TODO follows RED-GREEN-REFACTOR:
1. **RED**: Write/update failing tests first
   - Test file: `[component].test.tsx`
   - Command: `pnpm vitest run [file]`
   - Expected: FAIL
2. **GREEN**: Implement minimum code to pass
   - Command: `pnpm vitest run [file]`
   - Expected: PASS
3. **REFACTOR**: Clean up while keeping green
   - Command: `pnpm vitest run [file]`
   - Expected: PASS

### Agent-Executed QA Scenarios (MANDATORY — ALL tasks)

**Verification Tool by Deliverable Type:**

| Type | Tool | How Agent Verifies |
|------|------|-------------------|
| **Component rendering** | Vitest + RTL | Unit tests with screen assertions |
| **Visual appearance** | Playwright | Navigate, screenshot, assert DOM |
| **Interactions (hover, click)** | Playwright | Mouse events, keyboard, assertions |
| **i18n** | Bash (grep) | Grep for hardcoded English strings |
| **Accessibility** | Playwright | Role queries, aria-label checks |

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately):
├── Task 0: Install shadcn Popover component (prerequisite)
├── Task 1: VocabularyList loading/empty/error states (TDD)
└── Task 3: VocabularyCard visual polish + hover-reveal (TDD)

Wave 2 (After Wave 1):
├── Task 2: VocabularyFilterBar → Filter Popover (TDD) [depends: 0]
├── Task 4: Group Drop Zone conditional visibility (TDD) [depends: 1,3 for pattern]
└── Task 5: Page header stats + Sentences tab unification [depends: 1]

Wave 3 (After Wave 2):
├── Task 6: i18n wiring for all components [depends: 2,3,4]
└── Task 7: E2E test updates + full regression [depends: all]

Critical Path: Task 0 → Task 2 → Task 6 → Task 7
Parallel Speedup: ~40% faster than sequential
```

### Dependency Matrix

| Task | Depends On | Blocks | Can Parallelize With |
|------|------------|--------|---------------------|
| 0 | None | 2 | 1, 3 |
| 1 | None | 4, 5 | 0, 3 |
| 2 | 0 | 6, 7 | 4, 5 |
| 3 | None | 4, 6 | 0, 1 |
| 4 | 1, 3 | 6, 7 | 2, 5 |
| 5 | 1 | 7 | 2, 4 |
| 6 | 2, 3, 4 | 7 | 5 |
| 7 | All | None | None (final) |

### Agent Dispatch Summary

| Wave | Tasks | Recommended Agents |
|------|-------|-------------------|
| 1 | 0, 1, 3 | task(category="quick") for 0; task(category="visual-engineering") for 1 and 3 |
| 2 | 2, 4, 5 | task(category="visual-engineering") for all |
| 3 | 6, 7 | task(category="unspecified-high") for 6; task(category="deep") for 7 |

---

## TODOs

- [x] 0. Install shadcn Popover component

  **What to do**:
  - Run `pnpm dlx shadcn@latest add popover` in `packages/web/`
  - Verify `components/ui/popover.tsx` is created
  - Verify `pnpm tsc --noEmit` passes (no type errors)
  - Check if DropdownMenu is already installed; if not, also install: `pnpm dlx shadcn@latest add dropdown-menu`

  **Must NOT do**:
  - Do not modify any existing component
  - Do not customize the installed Popover beyond shadcn defaults

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Single command, trivial verification
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: shadcn/ui installation knowledge

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 3)
  - **Blocks**: Task 2
  - **Blocked By**: None

  **References**:

  **Pattern References**:
  - `packages/web/components/ui/dialog.tsx` — Existing shadcn component for reference pattern
  - `packages/web/components/ui/dropdown-menu.tsx` — Check if already installed

  **Acceptance Criteria**:

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: Popover component installed successfully
    Tool: Bash
    Preconditions: packages/web/ directory exists
    Steps:
      1. Run: ls packages/web/components/ui/popover.tsx
      2. Assert: file exists (exit code 0)
      3. Run: pnpm tsc --noEmit (in packages/web/)
      4. Assert: exit code 0 (no type errors)
    Expected Result: Popover component file exists and compiles
    Evidence: Command output captured
  ```

  **Commit**: YES (groups with Task 2)
  - Message: `chore(ui): install shadcn popover and dropdown-menu components`
  - Files: `components/ui/popover.tsx`, `components/ui/dropdown-menu.tsx` (if new)

---

- [x] 1. VocabularyList: Skeleton loading, EmptyState, Error+Retry (TDD)

  **What to do**:
  - **Create test file first** (`VocabularyList.test.tsx`):
    - Test: renders Skeleton cards (3x2 grid) when `isLoading` is true
    - Test: renders EmptyState with BookOpen icon + "Add Word" CTA when items empty
    - Test: renders error message with AlertCircle icon + Retry button when `isError`
    - Test: Retry button calls `refetch()` on click
    - Test: renders vocabulary cards in grid when data exists (existing behavior)
  - **Implement changes** in `VocabularyList.tsx`:
    - Replace spinner loading with Skeleton grid matching card layout (follow `SentenceList.tsx:44-57` pattern)
    - Replace plain text empty state with `EmptyState` component from `@/components/shared/EmptyState`
    - Replace plain error text with AlertCircle icon + descriptive text + Retry Button (follow `SentenceList.tsx:60-69` pattern)
    - Add `data-testid` attributes: `vocabulary-list-loading`, `vocabulary-list-empty`, `vocabulary-list-error`

  **Must NOT do**:
  - Do not change the grid layout for vocabulary cards (keep `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`)
  - Do not change infinite scroll behavior
  - Do not change VocabularyCard component in this task

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: UI component changes with visual/UX considerations
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: UI state patterns, skeleton loading, empty states

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 0, 3)
  - **Blocks**: Tasks 4, 5
  - **Blocked By**: None

  **References**:

  **Pattern References**:
  - `packages/web/components/features/sentences/SentenceList.tsx:44-57` — Skeleton loading pattern to follow
  - `packages/web/components/features/sentences/SentenceList.tsx:60-69` — Error state with AlertCircle + retry pattern
  - `packages/web/components/features/sentences/SentenceList.tsx:72-87` — Empty state pattern (reference, but we use EmptyState component)
  - `packages/web/components/shared/EmptyState.tsx` — Shared empty state component to use (icon + title + description + CTA)

  **Test References**:
  - `packages/web/components/features/vocabulary/VocabularyCard.test.tsx` — Test structure and mocking patterns for vocabulary components
  - `packages/web/components/features/sentences/SentenceList.test.tsx` — Loading/error/empty state test patterns

  **API/Type References**:
  - `packages/web/components/features/vocabulary/VocabularyList.tsx:15-19` — VocabularyListProps interface (query: UseInfiniteQueryResult)

  **WHY Each Reference Matters**:
  - SentenceList patterns are the "gold standard" — VocabularyList should match their quality
  - EmptyState shared component provides consistent empty UI across the app
  - VocabularyCard.test.tsx shows how to mock TanStack Query results

  **Acceptance Criteria**:

  **TDD:**
  - [ ] Test file created: `packages/web/components/features/vocabulary/VocabularyList.test.tsx`
  - [ ] Tests cover: skeleton loading, empty state with icon+CTA, error with retry, normal rendering
  - [ ] `pnpm vitest run VocabularyList.test.tsx` → PASS (all tests)

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: Skeleton loading renders during data fetch
    Tool: Vitest + RTL (unit test)
    Preconditions: VocabularyList.test.tsx created
    Steps:
      1. Render VocabularyList with mock query where isLoading=true
      2. Assert: screen.getByTestId('vocabulary-list-loading') is in document
      3. Assert: Skeleton elements visible (at least 6 skeleton cards in 3-col grid)
      4. Assert: No vocabulary-card elements rendered
    Expected Result: Skeleton grid shown during loading
    Evidence: vitest output captured

  Scenario: EmptyState renders when no vocabulary items
    Tool: Vitest + RTL (unit test)
    Preconditions: VocabularyList.test.tsx created
    Steps:
      1. Render VocabularyList with mock query where data.pages[0].items = []
      2. Assert: EmptyState component visible with BookOpen icon
      3. Assert: CTA button text contains "Add" (or localized equivalent)
    Expected Result: EmptyState with icon and action button
    Evidence: vitest output captured

  Scenario: Error state with retry button
    Tool: Vitest + RTL (unit test)
    Preconditions: VocabularyList.test.tsx created
    Steps:
      1. Render VocabularyList with mock query where isError=true
      2. Assert: error icon visible
      3. Assert: retry button visible
      4. Click retry button
      5. Assert: refetch function called once
    Expected Result: Error UI with functional retry
    Evidence: vitest output captured
  ```

  **Commit**: YES
  - Message: `feat(vocabulary): add skeleton loading, empty state, and error retry to VocabularyList`
  - Files: `VocabularyList.tsx`, `VocabularyList.test.tsx`
  - Pre-commit: `pnpm vitest run VocabularyList`

---

- [x] 2. VocabularyFilterBar: Refactor to Search+Sort + Filter Popover (TDD)

  **What to do**:
  - **Create/update test file** (`VocabularyFilterBar.test.tsx`):
    - Test: renders search input and sort select inline
    - Test: renders Filter button that opens Popover
    - Test: Popover contains Mastery Level select + Group filter select
    - Test: active filters show as Badge count on trigger button
    - Test: "Reset Filters" button clears all advanced filters
    - Test: filter changes call onFiltersChange correctly
  - **Create new component** `VocabularyFilterPopover.tsx`:
    - Popover (desktop) / Sheet (mobile) containing Mastery Level and Group filter selects
    - Active filter count Badge on the trigger button
    - "Reset Filters" button inside Popover
  - **Update `VocabularyFilterBar.tsx`**:
    - Keep Search input + Sort By select inline
    - Remove Sort Order select (merge into Sort By: "Newest First", "Oldest First", "A-Z", "Z-A", "Mastery")
    - Add Filter Popover trigger button with active filter count Badge
    - Remove inline Mastery and Group selects (moved to Popover)

  **Must NOT do**:
  - Do not change filter state shape (VocabularyQueryParams)
  - Do not modify the useVocabulary hook
  - Do not change API query parameters

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Complex UI component refactor with interaction design
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: Popover/Sheet patterns, filter UX, responsive design

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 4, 5)
  - **Blocks**: Tasks 6, 7
  - **Blocked By**: Task 0 (Popover must be installed)

  **References**:

  **Pattern References**:
  - `packages/web/components/features/vocabulary/VocabularyFilterBar.tsx` — Current implementation to refactor
  - `packages/web/components/ui/select.tsx` — Select component already used
  - `packages/web/components/ui/popover.tsx` — New Popover component (after Task 0)
  - `packages/web/components/ui/badge.tsx` — For active filter count

  **API/Type References**:
  - `packages/web/hooks/useVocabulary.ts:7-14` — VocabularyQueryParams interface (must not change)
  - `packages/web/lib/srs/mastery.ts:20-26` — MasteryLevel enum for filter options

  **Documentation References**:
  - `packages/web/messages/en.json:141-156` — Existing i18n keys for filter labels (searchPlaceholder, sortBy, etc.)

  **WHY Each Reference Matters**:
  - VocabularyQueryParams is the contract — filter UI changes must map to same params
  - Existing i18n keys show labels are already defined, just need wiring
  - MasteryLevel enum provides the filter option values

  **Acceptance Criteria**:

  **TDD:**
  - [ ] Test file created: `packages/web/components/features/vocabulary/VocabularyFilterBar.test.tsx`
  - [ ] Tests cover: search inline, sort inline, popover open/close, filter selection, reset, active badge
  - [ ] `pnpm vitest run VocabularyFilterBar.test.tsx` → PASS

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: Filter Popover opens and shows advanced filters
    Tool: Vitest + RTL (unit test)
    Preconditions: VocabularyFilterBar.test.tsx created
    Steps:
      1. Render VocabularyFilterBar with empty filters and groups
      2. Assert: search input is visible
      3. Assert: sort select is visible
      4. Click: button with filter icon / "Filters" label
      5. Assert: Popover content visible with Mastery Level select
      6. Assert: Popover content has Group filter select
    Expected Result: Filter popover opens with advanced filter options
    Evidence: vitest output captured

  Scenario: Active filter count shows on badge
    Tool: Vitest + RTL (unit test)
    Steps:
      1. Render with filters = { masteryLevel: 'NEW', groupId: 'group-1' }
      2. Assert: Badge shows "2" on filter trigger button
      3. Change to filters = { masteryLevel: 'NEW' }
      4. Assert: Badge shows "1"
      5. Change to filters = {} (no advanced filters)
      6. Assert: No badge visible
    Expected Result: Badge accurately reflects active filter count
    Evidence: vitest output captured

  Scenario: Reset clears all advanced filters
    Tool: Vitest + RTL (unit test)
    Steps:
      1. Render with filters = { search: 'test', masteryLevel: 'NEW', groupId: 'g1' }
      2. Open popover, click "Reset Filters"
      3. Assert: onFiltersChange called with { search: 'test' } (search preserved, advanced cleared)
    Expected Result: Only advanced filters cleared, search preserved
    Evidence: vitest output captured
  ```

  **Commit**: YES
  - Message: `refactor(vocabulary): migrate filter bar to popover pattern with active filter badges`
  - Files: `VocabularyFilterBar.tsx`, `VocabularyFilterPopover.tsx` (new), `VocabularyFilterBar.test.tsx`
  - Pre-commit: `pnpm vitest run VocabularyFilterBar`

---

- [x] 3. VocabularyCard: Card shadows, hover-reveal actions, drag handle, due indicator (TDD)

  **What to do**:
  - **Update test file** (`VocabularyCard.test.tsx`):
    - Test: card has `card-shadow card-shadow-hover` classes
    - Test: Edit/Delete buttons hidden by default, visible on hover (using CSS class assertions)
    - Test: GripVertical icon rendered as drag handle visual
    - Test: "Due" badge shown when `reviewSchedule.nextReviewDate <= today`
    - Test: "Due" badge NOT shown when not due or no reviewSchedule
    - Test: date formatted with `format()` from date-fns (not hardcoded en-US)
    - Test: semantic color tokens used (no `text-gray-XXX` in JSX)
  - **Update `VocabularyCard.tsx`**:
    - Add `card-shadow card-shadow-hover` classes to Card root
    - Wrap Edit/Delete in a container with `opacity-0 group-hover:opacity-100 transition-opacity` (desktop hover-reveal)
    - Add `md:hidden` DropdownMenu with `...` trigger as mobile fallback for Edit/Delete
    - Add `<GripVertical>` icon in CardHeader as visual drag affordance (NOT as drag handle — keep `{...listeners}` on Card)
    - Add "Due" Badge when `nextReviewDate` is today or past
    - Replace `new Date().toLocaleDateString('en-US')` with `format(new Date(...), 'yyyy-MM-dd')` from date-fns
    - Replace hardcoded `text-gray-900`, `text-gray-600`, `text-gray-500`, `text-gray-700` with `text-foreground`, `text-muted-foreground`
    - Add Card wrapper class `group` for group-hover support

  **Must NOT do**:
  - Do not move `{...listeners}` to GripVertical — card remains fully draggable
  - Do not change VocabularyCardProps interface
  - Do not modify MasteryIndicator component

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Heavy visual/interaction design with CSS hover states, responsive patterns
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: Hover reveal patterns, responsive design, semantic tokens

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 0, 1)
  - **Blocks**: Tasks 4, 6
  - **Blocked By**: None

  **References**:

  **Pattern References**:
  - `packages/web/app/globals.css:246-258` — `.card-shadow` and `.card-shadow-hover` class definitions (MUST USE)
  - `packages/web/components/features/vocabulary/VocabularyCard.tsx:48-119` — Current card implementation
  - `packages/web/components/features/sentences/SentenceList.tsx:115-118` — date-fns format pattern for dates
  - `packages/web/components/ui/dropdown-menu.tsx` — DropdownMenu for mobile fallback

  **Test References**:
  - `packages/web/components/features/vocabulary/VocabularyCard.test.tsx` — Existing test file to extend

  **API/Type References**:
  - `packages/web/hooks/useVocabulary.ts:19-41` — VocabularyItem type with reviewSchedule.nextReviewDate
  - `packages/web/components/features/vocabulary/VocabularyCard.tsx:14-18` — VocabularyCardProps (must not change)

  **WHY Each Reference Matters**:
  - globals.css has card-shadow/card-shadow-hover ready — just need to apply them
  - SentenceList date format is the pattern to follow for consistency
  - DropdownMenu provides accessible mobile fallback for hover-reveal actions
  - VocabularyItem.reviewSchedule.nextReviewDate is the field to check for "due" status

  **Acceptance Criteria**:

  **TDD:**
  - [ ] Tests updated: `packages/web/components/features/vocabulary/VocabularyCard.test.tsx`
  - [ ] Tests cover: card-shadow classes, hover-reveal, drag handle icon, due badge, date format, semantic tokens
  - [ ] `pnpm vitest run VocabularyCard.test.tsx` → PASS

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: Card shadow classes applied
    Tool: Bash (grep)
    Steps:
      1. grep 'card-shadow' packages/web/components/features/vocabulary/VocabularyCard.tsx
      2. Assert: matches found for card-shadow and card-shadow-hover
    Expected Result: Card uses design system shadow classes
    Evidence: grep output captured

  Scenario: No hardcoded gray colors in VocabularyCard
    Tool: Bash (grep)
    Steps:
      1. grep -n 'text-gray-\|bg-gray-' packages/web/components/features/vocabulary/VocabularyCard.tsx
      2. Assert: 0 matches (all replaced with semantic tokens)
    Expected Result: All colors use semantic tokens
    Evidence: grep output captured

  Scenario: Due badge renders for items due for review
    Tool: Vitest + RTL (unit test)
    Steps:
      1. Render VocabularyCard with reviewSchedule.nextReviewDate = yesterday
      2. Assert: Badge with "Due" or equivalent text is visible
      3. Render with nextReviewDate = tomorrow
      4. Assert: No due badge visible
    Expected Result: Due indicator shows only for due items
    Evidence: vitest output captured

  Scenario: Hover-reveal actions on desktop
    Tool: Vitest + RTL (unit test)
    Steps:
      1. Render VocabularyCard with onEdit and onDelete
      2. Assert: action buttons container has opacity-0 class (hidden by default)
      3. Assert: buttons exist in DOM (accessible to screen readers)
    Expected Result: Buttons hidden visually but accessible
    Evidence: vitest output captured
  ```

  **Commit**: YES
  - Message: `feat(vocabulary): enhance VocabularyCard with shadows, hover actions, drag handle, due indicator`
  - Files: `VocabularyCard.tsx`, `VocabularyCard.test.tsx`
  - Pre-commit: `pnpm vitest run VocabularyCard`

---

- [x] 4. Group Drop Zone: Conditional visibility during drag (TDD)

  **What to do**:
  - **Update page test or create test** for drop zone visibility:
    - Test: Group drop zone not rendered when no drag active
    - Test: Group drop zone appears with Framer Motion animation when drag starts
    - Test: Group drop zone disappears when drag ends/cancels
  - **Update `page.tsx`**:
    - Track drag state with existing `activeVocabulary` state (non-null = dragging)
    - Wrap Group drop zone section in `<AnimatePresence>` + `<motion.div>` from framer-motion
    - Only render drop zone when `activeVocabulary !== null`
    - Use fade + slide-down entrance animation
    - Replace hardcoded `border-gray-300` and `text-gray-700` with semantic tokens

  **Must NOT do**:
  - Do not change DndContext configuration
  - Do not modify GroupCard component
  - Do not change drag-drop API call logic

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Animation and conditional UI rendering
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: Framer Motion animation, conditional rendering patterns

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 2, 5)
  - **Blocks**: Tasks 6, 7
  - **Blocked By**: Tasks 1, 3 (validates pattern)

  **References**:

  **Pattern References**:
  - `packages/web/app/(dashboard)/vocabulary/page.tsx:260-271` — Current group drop zone section
  - `packages/web/components/shared/PageTransition.tsx` — Framer Motion animation pattern with AnimatePresence
  - `packages/web/app/(dashboard)/vocabulary/page.tsx:102-106` — handleDragStart sets activeVocabulary

  **WHY Each Reference Matters**:
  - activeVocabulary state already tracks drag state — leverage it for conditional rendering
  - PageTransition shows existing AnimatePresence pattern to follow

  **Acceptance Criteria**:

  **TDD:**
  - [ ] Tests cover: drop zone hidden by default, visible during drag, hidden after drag end
  - [ ] `pnpm vitest run` → PASS (related tests)

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: Drop zone hidden when not dragging
    Tool: Vitest + RTL (unit test)
    Steps:
      1. Render VocabularyPage with groups data
      2. Assert: no element with group-drop-zone visible
    Expected Result: Clean page without drop zone clutter
    Evidence: vitest output captured

  Scenario: Drop zone appears during drag via E2E
    Tool: Playwright
    Steps:
      1. Navigate to /vocabulary
      2. Wait for vocabulary cards to load
      3. Assert: [data-testid="group-drop-zone"] is NOT visible
      4. Start drag on first vocabulary card (mouse.down)
      5. Assert: [data-testid="group-drop-zone"] IS visible
      6. Press Escape to cancel drag
      7. Assert: [data-testid="group-drop-zone"] is NOT visible again
    Expected Result: Drop zone only visible during active drag
    Evidence: .sisyphus/evidence/task-4-dropzone-visibility.png
  ```

  **Commit**: YES
  - Message: `feat(vocabulary): show group drop zone only during active drag`
  - Files: `page.tsx`
  - Pre-commit: `pnpm vitest run`

---

- [x] 5. Page header stats + Sentences tab card shadow unification

  **What to do**:
  - **Add summary stats section** to page header in `page.tsx`:
    - Calculate from loaded vocabulary data: total loaded count, mastery distribution counts
    - Use a simple flex row of stat badges/pills (not full StatCard — keep it lightweight)
    - Show: total count, NEW/LEARNING/FAMILIAR/LEARNED/MASTERED counts as colored badges
    - Make "Add Word" button more prominent with Duolingo `.btn-shadow` class
  - **Update `SentenceList.tsx`**:
    - Add `card-shadow card-shadow-hover` classes to sentence Card components
    - Refactor inline empty state to use shared `EmptyState` component (matching Task 1 pattern)
  - **Update `GroupCard.tsx`**:
    - Replace hardcoded `text-gray-900`, `text-gray-600`, `text-gray-500` with semantic tokens
    - Replace `'en-US'` date locale with `format()` from date-fns

  **Must NOT do**:
  - Do not create a new API endpoint for stats
  - Do not add heavy chart components (keep stats lightweight)
  - Do not change SentenceList data fetching or CRUD logic

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Multiple visual polish items across components
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: Stats display, card effects, visual consistency

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 2, 4)
  - **Blocks**: Task 7
  - **Blocked By**: Task 1 (EmptyState pattern)

  **References**:

  **Pattern References**:
  - `packages/web/app/globals.css:236-244` — `.btn-shadow` class for Duolingo-style CTA button
  - `packages/web/app/globals.css:246-258` — `.card-shadow` / `.card-shadow-hover` for SentenceList cards
  - `packages/web/components/shared/EmptyState.tsx` — Shared component for SentenceList empty state refactor
  - `packages/web/components/features/sentences/SentenceList.tsx:99-165` — Current SentenceList cards (add shadow classes)
  - `packages/web/components/features/groups/GroupCard.tsx:31-86` — GroupCard with hardcoded colors to fix
  - `packages/web/lib/srs/mastery.ts:44-80` — MASTERY_LEVEL_CONFIGS for stat badge colors

  **WHY Each Reference Matters**:
  - btn-shadow gives CTA the Duolingo raised button feel
  - card-shadow on SentenceList unifies visual treatment with VocabularyCard
  - EmptyState component ensures consistent empty state across both tabs
  - MASTERY_LEVEL_CONFIGS provides color mapping for stat badges

  **Acceptance Criteria**:

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: Page header shows mastery distribution stats
    Tool: Playwright
    Steps:
      1. Navigate to /vocabulary
      2. Wait for vocabulary cards to load
      3. Assert: stat badges visible (showing counts per mastery level)
      4. Assert: "Add Word" button has btn-shadow class
      5. Screenshot: .sisyphus/evidence/task-5-stats-header.png
    Expected Result: Stats visible in header area with prominent CTA
    Evidence: .sisyphus/evidence/task-5-stats-header.png

  Scenario: SentenceList cards have shadow effects
    Tool: Bash (grep)
    Steps:
      1. grep 'card-shadow' packages/web/components/features/sentences/SentenceList.tsx
      2. Assert: matches found
    Expected Result: Card shadow classes applied to sentence cards
    Evidence: grep output captured

  Scenario: GroupCard uses semantic tokens
    Tool: Bash (grep)
    Steps:
      1. grep -n 'text-gray-\|bg-gray-' packages/web/components/features/groups/GroupCard.tsx
      2. Assert: 0 matches
    Expected Result: No hardcoded gray colors in GroupCard
    Evidence: grep output captured
  ```

  **Commit**: YES
  - Message: `feat(vocabulary): add stats header, unify card shadows, fix GroupCard tokens`
  - Files: `page.tsx`, `SentenceList.tsx`, `GroupCard.tsx`
  - Pre-commit: `pnpm vitest run`

---

- [x] 6. i18n wiring for all vocabulary components

  **What to do**:
  - **Wire `useTranslations('vocabulary')`** into:
    - `VocabularyList.tsx`: "Loading...", "Failed to load:", "No vocabulary items yet", "Loading more..."
    - `VocabularyCard.tsx`: aria-labels "Edit word", "Delete word"
    - `VocabularyFilterBar.tsx`: "Search word, reading, or meaning...", "Sort by", "Created Date", "Word", "Mastery", "Ascending", "Descending", "All Levels", "All Groups", "Mastery Level"
    - `GroupCard.tsx`: "word"/"words" count text, aria-labels
    - `ExampleSentenceInput.tsx`: "Example Sentences (Optional)", "Add Example Sentence", "Sentence N", "Japanese Sentence", "Reading (Furigana)", "Translation", placeholder texts
  - **Add new i18n keys** to BOTH `messages/en.json` AND `messages/zh-TW.json`:
    - Keys for VocabularyList states: `vocabulary.loading`, `vocabulary.loadingMore`, `vocabulary.error`, `vocabulary.empty`, `vocabulary.emptyAction`, `vocabulary.retry`
    - Keys for VocabularyCard: `vocabulary.card.editLabel`, `vocabulary.card.deleteLabel`, `vocabulary.card.dueForReview`
    - Keys for new filter popover labels: `vocabulary.filters`, `vocabulary.resetFilters`
    - Keys for GroupCard: `vocabulary.wordCount` (with pluralization)
    - Keys for ExampleSentenceInput labels and placeholders
  - **Update existing test assertions** that match on English text strings

  **Must NOT do**:
  - Do not change component logic or layout
  - Do not change i18n key structure for existing keys (only add new ones)
  - Do not modify the i18n provider configuration

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Touches many files, requires careful coordination of keys across 2 language files and 5+ components
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: i18n patterns, next-intl usage

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Task 5)
  - **Parallel Group**: Wave 3
  - **Blocks**: Task 7
  - **Blocked By**: Tasks 2, 3, 4 (components must be finalized first)

  **References**:

  **Pattern References**:
  - `packages/web/app/(dashboard)/vocabulary/page.tsx:54` — `useTranslations('vocabulary')` already used at page level
  - `packages/web/components/features/vocabulary/AddVocabularyForm.tsx:31-32` — Pattern for `useTranslations` in child component
  - `packages/web/components/features/vocabulary/DeleteConfirmationDialog.tsx:36-37` — Pattern for dual translations (vocabulary + common)

  **Documentation References**:
  - `packages/web/messages/en.json:136-198` — Existing vocabulary i18n keys (many already defined, just not wired)
  - `packages/web/messages/zh-TW.json` — Must add zh-TW translations for all new keys

  **WHY Each Reference Matters**:
  - en.json already has keys like `vocabulary.searchPlaceholder` — don't duplicate, wire them
  - AddVocabularyForm shows the pattern for using useTranslations in feature components
  - Both language files must stay in sync

  **Acceptance Criteria**:

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: Zero hardcoded English strings in vocabulary components
    Tool: Bash (grep)
    Steps:
      1. grep -rn "Loading\.\.\.\|Failed to load\|No vocabulary\|Search word\|Sort by\|All Levels\|All Groups\|Created Date\|Ascending\|Descending\|Edit word\|Delete word\|Loading more" packages/web/components/features/vocabulary/
      2. Assert: 0 matches
      3. grep -rn "Example Sentences\|Add Example Sentence\|Japanese Sentence\|Reading (Furigana)\|Translation" packages/web/components/features/vocabulary/ExampleSentenceInput.tsx
      4. Assert: 0 matches
    Expected Result: All user-facing strings moved to i18n
    Evidence: grep output captured

  Scenario: Both language files have matching keys
    Tool: Bash
    Steps:
      1. Count vocabulary-related keys in en.json
      2. Count vocabulary-related keys in zh-TW.json
      3. Assert: counts match
    Expected Result: No missing translations
    Evidence: Command output captured

  Scenario: All unit tests still pass after i18n wiring
    Tool: Bash
    Steps:
      1. pnpm vitest run (in packages/web/)
      2. Assert: 0 failures
    Expected Result: Tests updated for i18n mocked strings
    Evidence: vitest output captured
  ```

  **Commit**: YES
  - Message: `feat(i18n): wire translations for all vocabulary components and add zh-TW keys`
  - Files: `VocabularyList.tsx`, `VocabularyCard.tsx`, `VocabularyFilterBar.tsx`, `GroupCard.tsx`, `ExampleSentenceInput.tsx`, `en.json`, `zh-TW.json`, affected `.test.tsx` files
  - Pre-commit: `pnpm vitest run`

---

- [x] 7. E2E test updates + full regression

  **What to do**:
  - **Update `e2e/vocabulary-crud.spec.ts`**:
    - Line 10-11: Update text assertions for i18n'd page title/description
    - Line 26: "Add Word" button selector — verify still works (button text may change with i18n)
    - Line 52: `getByLabel('Edit word')` — update if aria-label changed
    - Line 78: `getByLabel('Delete word')` — update if aria-label changed  
    - Line 103: Search placeholder selector — update for i18n'd placeholder
    - Line 118: `getByRole('button', { name: 'All Levels' })` — update for Popover trigger
    - Line 138: Sort selector — update for new combined sort options
    - Add new test: hover-reveal actions (hover card → buttons appear → click edit)
  - **Update `e2e/vocabulary-drag-drop.spec.ts`**:
    - Line 28: `[data-testid="group-drop-zone"]` — now conditionally rendered, must trigger drag first
    - Update test flow: start drag → wait for drop zone to appear → complete drag
    - Verify drag overlay still works with new card design
  - **Run full regression**:
    - `pnpm vitest run` (all unit tests)
    - `pnpm exec playwright test e2e/vocabulary-crud.spec.ts e2e/vocabulary-drag-drop.spec.ts`
    - `pnpm tsc --noEmit`
    - `pnpm lint`

  **Must NOT do**:
  - Do not skip any E2E test — all must pass
  - Do not delete any test — only update selectors/assertions
  - Do not add overly brittle tests (prefer data-testid over text selectors where possible)

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: Complex E2E test debugging requires understanding component behavior chain
  - **Skills**: [`playwright`, `frontend-ui-ux`]
    - `playwright`: Playwright test patterns, selector strategies, debugging
    - `frontend-ui-ux`: Understanding of UI changes to update tests correctly

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential (final task)
  - **Blocks**: None (final)
  - **Blocked By**: All previous tasks

  **References**:

  **Pattern References**:
  - `packages/web/e2e/vocabulary-crud.spec.ts` — All 6 tests to update
  - `packages/web/e2e/vocabulary-drag-drop.spec.ts` — All 5 tests to update (drop zone now conditional)

  **WHY Each Reference Matters**:
  - E2E tests use English text selectors that will break with i18n changes
  - Drag-drop tests expect drop zone visible before drag — now it appears during drag
  - CRUD tests use getByLabel which depends on aria-label attributes

  **Acceptance Criteria**:

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: All E2E tests pass
    Tool: Bash (Playwright)
    Preconditions: Dev server running, database seeded
    Steps:
      1. pnpm exec playwright test e2e/vocabulary-crud.spec.ts --reporter=line
      2. Assert: all 6 tests pass
      3. pnpm exec playwright test e2e/vocabulary-drag-drop.spec.ts --reporter=line
      4. Assert: all 5 tests pass
    Expected Result: 11/11 E2E tests pass
    Evidence: Playwright output captured

  Scenario: Full regression — all unit tests pass
    Tool: Bash (Vitest)
    Steps:
      1. pnpm vitest run (in packages/web/)
      2. Assert: 0 failures
    Expected Result: All unit tests pass
    Evidence: vitest output captured

  Scenario: TypeScript and lint checks pass
    Tool: Bash
    Steps:
      1. pnpm tsc --noEmit (in packages/web/)
      2. Assert: exit code 0
      3. pnpm lint (in packages/web/)
      4. Assert: exit code 0
    Expected Result: Zero type errors and zero lint errors
    Evidence: Command output captured
  ```

  **Commit**: YES
  - Message: `test(e2e): update vocabulary E2E tests for new UI patterns and i18n`
  - Files: `e2e/vocabulary-crud.spec.ts`, `e2e/vocabulary-drag-drop.spec.ts`
  - Pre-commit: `pnpm exec playwright test e2e/vocabulary-crud.spec.ts e2e/vocabulary-drag-drop.spec.ts`

---

## Commit Strategy

| After Task | Message | Key Files | Verification |
|------------|---------|-----------|--------------|
| 0 | `chore(ui): install shadcn popover and dropdown-menu` | `components/ui/popover.tsx` | `pnpm tsc --noEmit` |
| 1 | `feat(vocabulary): skeleton loading, empty state, error retry` | `VocabularyList.tsx`, `.test.tsx` | `pnpm vitest run VocabularyList` |
| 2 | `refactor(vocabulary): filter bar to popover pattern` | `VocabularyFilterBar.tsx`, `VocabularyFilterPopover.tsx` | `pnpm vitest run VocabularyFilterBar` |
| 3 | `feat(vocabulary): card shadows, hover actions, due indicator` | `VocabularyCard.tsx`, `.test.tsx` | `pnpm vitest run VocabularyCard` |
| 4 | `feat(vocabulary): conditional group drop zone visibility` | `page.tsx` | `pnpm vitest run` |
| 5 | `feat(vocabulary): stats header, card shadow unification` | `page.tsx`, `SentenceList.tsx`, `GroupCard.tsx` | `pnpm vitest run` |
| 6 | `feat(i18n): wire translations for vocabulary components` | 5+ components, `en.json`, `zh-TW.json` | `pnpm vitest run` |
| 7 | `test(e2e): update E2E for new UI and i18n` | `e2e/*.spec.ts` | `playwright test` |

---

## Success Criteria

### Verification Commands
```bash
# All unit tests pass
pnpm vitest run                          # Expected: 0 failures

# E2E tests pass
pnpm exec playwright test e2e/vocabulary-crud.spec.ts e2e/vocabulary-drag-drop.spec.ts
                                         # Expected: 11/11 pass

# TypeScript compiles
pnpm tsc --noEmit                        # Expected: 0 errors

# No lint errors
pnpm lint                                # Expected: 0 errors

# No hardcoded English in vocabulary components
grep -rn "Loading\.\.\.\|Failed to load\|No vocabulary\|Search word\|All Levels" packages/web/components/features/vocabulary/
                                         # Expected: 0 matches

# Card shadow classes used
grep -rn "card-shadow" packages/web/components/features/vocabulary/VocabularyCard.tsx
                                         # Expected: matches found

# No hardcoded gray in updated components
grep -rn "text-gray-\|bg-gray-" packages/web/components/features/vocabulary/VocabularyCard.tsx packages/web/components/features/groups/GroupCard.tsx
                                         # Expected: 0 matches
```

### Final Checklist
- [ ] VocabularyList has Skeleton loading, EmptyState, Error+Retry
- [ ] VocabularyCard has card-shadow, hover-reveal, drag handle icon, due badge, semantic tokens
- [ ] Filter bar uses Popover for advanced filters with active badges + reset
- [ ] Group drop zone only visible during drag (with animation)
- [ ] Page header shows mastery stats + prominent CTA
- [ ] SentenceList cards have card-shadow
- [ ] GroupCard uses semantic tokens + date-fns formatting
- [ ] All strings in vocabulary components use i18n (en + zh-TW)
- [ ] All unit tests pass
- [ ] All E2E tests pass
- [ ] Zero TypeScript errors
- [ ] Zero lint errors
