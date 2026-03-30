## Why

The current matching game UI at `/study/matching` uses a standard page layout with shuffled card grid, text-based stats, and a full-screen match animation overlay. This feels like a regular page rather than an engaging, focused game experience. The UI needs to be redesigned to provide an immersive game mode with a fixed two-column layout (source vs target), a visual progress bar, and subtle inline feedback — improving usability and making the game feel polished and purposeful.

## What Changes

- **Immersive game header**: Replace the standard `Layout` wrapper (title + "Back to Study" button + description) with a focused game header containing an X close button, a visual progress bar with milestones, and the elapsed timer display.
- **Fixed two-column card layout**: Change from a shuffled flat grid (`grid-cols-2 md:grid-cols-4`) to a fixed two-column layout where the left column always shows source-language words and the right column always shows target-language meanings, arranged in 5 rows.
- **Visual progress bar**: Replace the text-based "Matched: X / 5" stats with a visual progress bar component that fills as pairs are matched, including milestone markers.
- **Subtle inline match feedback**: Remove the full-screen `MatchAnimation` overlay (green flash + large checkmark). Replace with card-level inline feedback — matched cards change appearance (color transition, fade/shrink) without blocking the game flow.
- **Card layout structure update**: Cards retain the current enhanced visual style (border-2, hover:scale-105, hover:shadow-lg) but are restructured into the two-column arrangement with appropriate sizing for the new layout.

## Capabilities

### New Capabilities
- `matching-immersive-header`: Immersive game header component with X close button, visual progress bar, and elapsed timer — replacing the standard page layout for the matching game.
- `matching-two-column-layout`: Fixed two-column card arrangement (left=source words, right=target meanings) with 5 rows, replacing the shuffled grid layout.
- `matching-inline-feedback`: Subtle card-level match/error feedback animations replacing the full-screen overlay animation.

### Modified Capabilities
<!-- No existing spec-level capabilities are being modified -->

## Impact

- **Components modified**: `matching/page.tsx`, `MatchingCard.tsx`, `MatchAnimation.tsx` (removed or replaced)
- **Components created**: New immersive header component, progress bar component
- **Hooks modified**: `useMatchingGame.ts` may need minor adjustments for two-column card generation
- **Generator modified**: `matching-generator.ts` needs to support generating separate left/right column arrays instead of a single shuffled array
- **E2E tests**: `matching.spec.ts` assertions will need updates (grid layout selectors, header elements, stats display)
- **Unit tests**: `MatchingCard.test.tsx` and `matching-generator.test.ts` will need updates
- **No API changes**: Data model and API routes are unaffected
- **No dependency additions**: Uses existing Tailwind + cn() utility patterns
