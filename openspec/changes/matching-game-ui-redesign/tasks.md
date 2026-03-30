## 1. Card Generator — Column-Based Output

- [x] 1.1 Add `generateColumnPairs(vocabulary, pairCount)` function to `lib/matching/matching-generator.ts` that returns `{ leftColumn: MatchingCard[], rightColumn: MatchingCard[] }` with independently shuffled word and meaning arrays
- [x] 1.2 Add unit tests for `generateColumnPairs` in `matching-generator.test.ts`: verifies left column has only word-type cards, right column has only meaning-type cards, both arrays have correct length, and columns are independently shuffled
- [x] 1.3 Keep existing `generateShuffledPairs` function intact (no breaking changes to existing API)

## 2. Game Hook — Cross-Column Selection Logic

- [x] 2.1 Update `useMatchingGame.ts` to accept column-based card input (`leftColumn` + `rightColumn`) and track which column each selected card belongs to
- [x] 2.2 Add cross-column selection enforcement: after selecting a card from one column, only cards from the opposite column are selectable as the second pick
- [x] 2.3 Remove `showMatchAnimation` state flag from the hook (no longer needed without full-screen overlay)
- [x] 2.4 Verify existing match detection, attempt counting, completion, and elapsed timer logic remain unchanged

## 3. Immersive Game Header Component

- [x] 3.1 Create `MatchingGameHeader` component in `components/features/matching/` with three sections: X close button (left), progress bar (center), elapsed timer (right)
- [x] 3.2 Implement X close button that navigates to `/study` using `router.push('/study')`
- [x] 3.3 Implement elapsed timer display formatted as `M:SS`, showing `0:00` before first selection and updating every second during gameplay
- [ ] 3.4 Add unit tests for `MatchingGameHeader`: renders close button, displays timer, shows progress bar, close button navigates to /study

## 4. Visual Progress Bar Component

- [x] 4.1 Create `MatchingProgressBar` component in `components/features/matching/` accepting `current` and `total` props
- [x] 4.2 Implement filled bar visualization (0% to 100%) with smooth transition on progress change
- [x] 4.3 Display current matched count as a visual indicator/badge on the progress bar
- [ ] 4.4 Add unit tests for `MatchingProgressBar`: renders empty at 0, fills proportionally, shows 100% when current equals total, displays count indicator

## 5. Inline Card Feedback

- [x] 5.1 Update `MatchingCard.tsx` to enhance matched state: green color transition with reduced opacity, no checkmark icon overlay needed (keep existing green color scheme but add opacity transition)
- [x] 5.2 Update `MatchingCard.tsx` error state: brief red flash using Tailwind transition classes, auto-reset handled by hook's 800-1000ms timeout
- [x] 5.3 Add selection highlight state that clearly indicates first-pick card (primary color border/ring — preserve existing `isSelected` styling)
- [x] 5.4 Remove `MatchAnimation.tsx` component file entirely
- [ ] 5.5 Update `MatchingCard.test.tsx` to verify inline feedback states: matched cards show green + reduced opacity, error cards show red flash, selected cards show highlight

## 6. Page Restructure — Two-Column Layout + Immersive Mode

- [x] 6.1 Update `matching/page.tsx` to use `generateColumnPairs` instead of `generateShuffledPairs`, passing separate column arrays to the hook
- [x] 6.2 Replace `Layout` wrapper with `MatchingGameHeader` for active gameplay (keep `Layout` for `GameComplete` screen)
- [x] 6.3 Replace the shuffled grid (`grid-cols-2 md:grid-cols-4`) with a fixed two-column layout: left column renders word cards, right column renders meaning cards, 5 rows with consistent gap
- [x] 6.4 Remove `MatchAnimation` import and usage from the page
- [x] 6.5 Remove text-based stats section ("Matched: X / 5 · Attempts · Time") — replaced by header progress bar and timer
- [x] 6.6 Wire `MatchingGameHeader` props: pass `matchedPairs.length`, total pairs count (5), `elapsedTime`, and close handler
- [x] 6.7 Add cross-column selection visual feedback: when a card in one column is selected, visually dim or indicate the same-column cards as non-selectable

## 7. Test Updates

- [ ] 7.1 Update E2E test `matching.spec.ts`: update selectors for immersive header (X button instead of "Back to Study"), two-column layout (no `grid-cols-2` class), progress bar visibility, timer display
- [ ] 7.2 Add E2E scenario: clicking X close button navigates to `/study`
- [ ] 7.3 Add E2E scenario: progress bar fills as pairs are matched
- [ ] 7.4 Verify existing E2E tests for card selection and attempt counting still pass with updated selectors
- [ ] 7.5 Run full test suite (`pnpm test:web`) and fix any regressions
