## ADDED Requirements

### Requirement: Matching game renders without standard Layout
The matching game page SHALL NOT render the shared `Layout` component (Header, BottomNav) during active gameplay. The page SHALL use a dedicated `MatchingGameHeader` component instead.

#### Scenario: Game page does not show standard navigation
- **WHEN** the user navigates to `/study/matching`
- **THEN** the standard app Header and BottomNav SHALL NOT be visible
- **AND** the `MatchingGameHeader` component SHALL be rendered at the top of the page

#### Scenario: Completion screen restores standard Layout
- **WHEN** the game is complete (all pairs matched)
- **THEN** the `GameComplete` screen SHALL render inside the standard `Layout` component

### Requirement: Close button exits the game
The `MatchingGameHeader` SHALL display an X (close) button on the left side that navigates the user back to `/study`.

#### Scenario: User taps close button
- **WHEN** the user clicks the X close button in the game header
- **THEN** the user SHALL be navigated to `/study`

#### Scenario: Close button is always visible during gameplay
- **WHEN** the matching game is in progress (not complete)
- **THEN** the X close button SHALL be visible and clickable

### Requirement: Elapsed timer display in header
The `MatchingGameHeader` SHALL display the elapsed game time on the right side, formatted as `M:SS`.

#### Scenario: Timer shows zero before first selection
- **WHEN** the game has started but no card has been selected yet
- **THEN** the timer SHALL display `0:00`

#### Scenario: Timer counts up during gameplay
- **WHEN** the user has selected at least one card
- **THEN** the timer SHALL display the elapsed time since the first card selection, updating every second

#### Scenario: Timer stops on game completion
- **WHEN** all pairs have been matched
- **THEN** the timer SHALL stop and display the final elapsed time

### Requirement: Visual progress bar in header
The `MatchingGameHeader` SHALL display a visual progress bar between the close button and the timer, showing the number of matched pairs relative to the total.

#### Scenario: Progress bar starts empty
- **WHEN** the game begins with 0 matched pairs
- **THEN** the progress bar SHALL be empty (0% filled)

#### Scenario: Progress bar fills as pairs are matched
- **WHEN** the user matches N pairs out of 5 total
- **THEN** the progress bar SHALL be filled to N/5 (e.g., 20% per pair)

#### Scenario: Progress bar shows current count
- **WHEN** the user has matched 3 out of 5 pairs
- **THEN** the progress bar SHALL display the current matched count (3) as a visual indicator on the bar

#### Scenario: Progress bar is fully filled on completion
- **WHEN** all 5 pairs have been matched
- **THEN** the progress bar SHALL be 100% filled
