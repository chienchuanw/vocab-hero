# Learnings

## 2026-02-12 Session Start
- Project is a monorepo: main code at `packages/web/`
- Duolingo-inspired design system with OKLch colors in globals.css
- `.card-shadow`, `.card-shadow-hover`, `.btn-shadow` defined but UNUSED by vocabulary components
- EmptyState shared component exists but VocabularyList uses plain text instead
- SentenceList has better patterns (Skeleton, error+retry) than VocabularyList
- i18n keys exist in en.json for filter labels but not wired in components
- VocabularyCard uses hardcoded text-gray-XXX instead of semantic tokens
- DropdownMenu component already exists at components/ui/dropdown-menu.tsx
- date-fns already used in SentenceList for date formatting
- framer-motion v12.25.0 installed, used in PageTransition
- @dnd-kit/core handles drag-and-drop, activeVocabulary state tracks drag state

## TDD Implementation: VocabularyList States (2026-02-12)

### RED-GREEN-REFACTOR Cycle Completed
- **RED Phase**: Created comprehensive test suite with 5 tests covering skeleton loading, empty state, error+retry, and card rendering
- **GREEN Phase**: Implemented skeleton grid (6 placeholders), error state with AlertCircle icon + Retry button, EmptyState component integration
- **Key Pattern**: SentenceList served as gold standard — copied skeleton grid pattern (44-57 lines) and error handling (60-69 lines)

### Implementation Details
- **Skeleton Loading**: Grid of 6 Skeleton components (h-48 w-full) matching card layout
- **Error State**: AlertCircle icon + heading + error message + Retry button with refetch callback
- **Empty State**: Integrated shared EmptyState component with BookOpen icon and "Add Word" action label
- **Test Mocks**: 
  - @dnd-kit/core mocked (useDraggable returns idle state)
  - @/lib/tts mocked (ttsEngine with isSupported, speak, stop, getState)
  - createMockQuery factory creates complete UseInfiniteQueryResult mock with all required properties
- **Data Attributes**: Added data-testid to all state containers for reliable test targeting

### Test Coverage
- ✅ Skeleton loading state (isLoading=true)
- ✅ Empty state (no items)
- ✅ Error state with retry functionality
- ✅ Refetch callback on retry button click
- ✅ Card rendering with data

### Code Quality
- No TypeScript diagnostics
- All 5 tests passing
- Follows existing patterns from SentenceList
- Uses semantic Tailwind tokens (destructive, muted-foreground) instead of hardcoded colors
- Proper infinite scroll observer cleanup in useEffect

### Patterns Adopted
- Skeleton grid pattern from SentenceList (6 placeholders)
- Error state with AlertCircle icon + Retry button
- EmptyState component for consistent empty states
- data-testid attributes for reliable test queries
- Semantic color tokens (destructive, muted-foreground) over hardcoded colors

## TDD Implementation: VocabularyCard Enhancement (2026-02-12)

### RED-GREEN-REFACTOR Cycle Completed
- **RED Phase**: Added 8 new tests covering card shadows, drag handle, due badge, and semantic colors
- **GREEN Phase**: Implemented all features with semantic color tokens and responsive design
- **Key Pattern**: Replaced hardcoded gray colors with semantic tokens (foreground, muted-foreground, destructive)

### Implementation Details
- **Card Shadows**: Applied `.card-shadow` and `.card-shadow-hover` classes from globals.css (previously unused)
- **Drag Handle**: Added GripVertical icon with `data-testid="drag-handle"` for visual affordance
- **Due Badge**: Conditional Badge component (destructive variant) when nextReviewDate <= today
- **Semantic Colors**: 
  - Replaced `text-gray-900 dark:text-gray-100` → `text-foreground`
  - Replaced `text-gray-600 dark:text-gray-400` → `text-muted-foreground`
  - Replaced `text-red-600 hover:text-red-700 hover:bg-red-50` → `text-destructive hover:text-destructive hover:bg-destructive/10`
- **Date Formatting**: Changed from `toLocaleDateString('en-US')` to `format(date, 'yyyy-MM-dd')` for consistency with SentenceList
- **Responsive Actions**: 
  - Desktop: Hidden buttons revealed on hover with `group-hover:opacity-100`
  - Mobile: DropdownMenu with MoreHorizontal icon (md:hidden)

### Test Coverage
- ✅ Card has card-shadow and card-shadow-hover classes
- ✅ Card has group class for hover support
- ✅ Drag handle icon renders with data-testid
- ✅ Due badge shows when item is due for review
- ✅ Due badge hidden when item not due
- ✅ Due badge hidden when no review schedule
- ✅ No hardcoded gray colors in rendered HTML
- ✅ Date format is yyyy-MM-dd

### Code Quality
- No TypeScript diagnostics
- All 24 tests passing (18 existing + 6 new)
- Follows existing patterns from globals.css and component library
- Uses semantic Tailwind tokens throughout
- Proper accessibility with aria-labels and semantic HTML

### Patterns Adopted
- Semantic color tokens (foreground, muted-foreground, destructive) over hardcoded colors
- Group-based hover states for desktop interactions
- Responsive design with md: breakpoint for mobile fallback
- Badge component for status indicators
- DropdownMenu for mobile action menus
- date-fns format() for consistent date formatting

## Group Drop Zone Animation Implementation

### Changes Made
- **File**: `packages/web/app/(dashboard)/vocabulary/page.tsx`
- **Import**: Added `AnimatePresence, motion` from `framer-motion` (line 5)
- **Animation**: Wrapped group drop zone (lines 261-281) with:
  - `AnimatePresence` for exit animations
  - `motion.div` with fade + slide animation (opacity 0→1, y: -10→0)
  - Visibility tied to `activeVocabulary` state (only shows during drag)
  - 0.2s duration for snappy feel

### Key Details
- Used existing `activeVocabulary` state (set by `handleDragStart`, cleared by `handleDragEnd`)
- Replaced hardcoded colors: `border-gray-300` → `border-muted-foreground/30`, `text-gray-700` → `text-muted-foreground`
- Added `data-testid="group-drop-zone"` for testing
- TypeScript check passed with no errors

### Pattern Matched
Followed the same animation pattern as `PageTransition.tsx` (fade + slide with 0.2s duration)

## VocabularyFilterBar Refactoring (Completed)

### Implementation Details
- **Refactored layout**: Search + Sort inline, advanced filters (Mastery Level + Group) moved to Popover
- **Active filter badge**: Shows count of active advanced filters (masteryLevel + groupId only)
- **Reset functionality**: Button to clear all advanced filters at once
- **UI improvements**:
  - Search icon uses `text-muted-foreground` instead of `text-gray-400`
  - Sort options renamed: "Created Date" → "Newest First", "Word" → "A-Z"
  - Popover aligns to the right (`align="end"`)
  - Badge displays count in a compact circular format

### Test Coverage
- 6 tests covering:
  - Search input rendering
  - Sort select rendering with data-testid
  - Filter popover trigger rendering
  - Active filter count badge display
  - Badge hidden when no advanced filters
  - Search input change handler

### Key Patterns Used
- TDD: Tests written first, then implementation
- Component composition: Popover + Badge + Button for advanced filter UI
- Filter state management: Destructuring to separate advanced filters from others
- Accessibility: Proper labels and semantic HTML in popover content

