## Context

The matching game at `/study/matching` currently renders inside the standard `Layout` component (Header + BottomNav), uses a shuffled flat grid of cards (`grid-cols-2 md:grid-cols-4`), displays text-based stats, and shows a full-screen overlay animation on match success. The game state is managed by `useMatchingGame` hook, with card generation in `matching-generator.ts`.

The redesign transforms this into an immersive, focused game experience with a fixed two-column layout, visual progress bar, and subtle inline feedback — while preserving the existing enhanced card visual style and elapsed timer model.

### Current File Map

| File | Role |
|---|---|
| `app/(dashboard)/study/matching/page.tsx` | Page route, game wiring, card state helpers |
| `components/features/matching/MatchingCard.tsx` | Card UI with state-based styling |
| `components/features/matching/MatchAnimation.tsx` | Full-screen match success overlay |
| `components/features/matching/GameComplete.tsx` | Completion screen with stats |
| `hooks/useMatchingGame.ts` | Game state machine (selection, matching, timer) |
| `lib/matching/matching-generator.ts` | Card pair generation, shuffle, match check |

## Goals / Non-Goals

**Goals:**
- Immersive game header replacing standard Layout (X close, progress bar, elapsed timer)
- Fixed two-column card layout (left=word, right=meaning) with 5 rows
- Visual progress bar showing matched pairs progress with milestone markers
- Subtle inline card-level feedback for match success and errors
- Preserve existing enhanced card visual style (border-2, hover effects, shadows)
- Preserve existing elapsed timer model (count up from 0)
- Maintain all existing game logic (selection rules, match detection, completion)
- BDD-driven development with testable scenarios

**Non-Goals:**
- Countdown timer implementation (explicitly deferred)
- API integration for vocabulary data (remains mock data)
- Scoring system changes (keep attempt-based performance rating)
- GameComplete screen redesign (out of scope for this change)
- Mobile-specific responsive breakpoints (two-column works on all sizes)
- Sound effects or haptic feedback

## Decisions

### D1: Two-Column Card Generation Strategy

**Decision**: Modify `matching-generator.ts` to export a `generateColumnPairs` function that returns `{ leftColumn: MatchingCard[], rightColumn: MatchingCard[] }` where left contains shuffled word cards and right contains independently shuffled meaning cards.

**Rationale**: The current `generateShuffledPairs` returns a single flat array. The two-column layout needs separate arrays for left/right columns. Shuffling each column independently ensures the visual positions don't reveal matching pairs.

**Alternative considered**: Shuffle a single array then split by type — rejected because it doesn't guarantee equal column lengths if types aren't perfectly balanced.

### D2: Immersive Header as a Dedicated Component

**Decision**: Create a new `MatchingGameHeader` component in `components/features/matching/` that encapsulates the X close button, progress bar, and elapsed timer. The matching page will stop using the shared `Layout` component.

**Rationale**: The immersive header is matching-game-specific and fundamentally different from the standard Layout. A dedicated component keeps the shared Layout untouched and allows game-specific styling without conditional logic.

**Alternative considered**: Add an `immersive` prop to the shared Layout — rejected because it would add complexity to a shared component for a single consumer.

### D3: Progress Bar as Reusable Component

**Decision**: Create a `MatchingProgressBar` component that accepts `current` (matched pairs count) and `total` (total pairs) props, rendering a filled bar with milestone markers. Place it in `components/features/matching/`.

**Rationale**: While the progress bar could be generic, the milestone markers (showing pair counts) are matching-specific. Starting as a feature component allows iteration without affecting other features. Can be extracted to `components/ui/` later if reuse emerges.

### D4: Inline Feedback Replaces MatchAnimation

**Decision**: Remove `MatchAnimation.tsx` (full-screen overlay). Instead, extend `MatchingCard` to handle match/error feedback inline — matched cards get a green color transition and slight scale-down; error cards get a red flash then reset. Use Tailwind transition classes (no framer-motion needed).

**Rationale**: The full-screen overlay blocks interaction for 1 second and feels heavy. Inline feedback is faster, doesn't interrupt flow, and aligns with the screenshot's minimal aesthetic. Tailwind transitions are sufficient — no new dependencies needed.

### D5: Page Structure Without Layout Wrapper

**Decision**: The matching page will render without the shared `Layout` component when the game is active. It will use `MatchingGameHeader` at the top and the two-column card area below. The `GameComplete` screen will continue using the shared `Layout` for navigation back.

**Rationale**: The immersive mode needs full viewport control without Header/BottomNav chrome. The completion screen benefits from standard navigation since the game is over.

## Risks / Trade-offs

- **[Risk] Removing Layout breaks navigation consistency** → Mitigation: X close button provides clear exit path; GameComplete screen restores standard Layout.
- **[Risk] Two-column layout may feel cramped on very small screens** → Mitigation: Cards already have responsive padding; the two-column layout is simpler than the current 2→4 column responsive grid.
- **[Risk] E2E tests rely on current selectors and layout** → Mitigation: E2E test updates are included in the task plan; existing skipped tests provide opportunity to implement proper matching flow tests.
- **[Trade-off] MatchAnimation removal loses the "celebration moment"** → Accepted: User explicitly chose subtle inline feedback. The GameComplete screen still provides celebration.
