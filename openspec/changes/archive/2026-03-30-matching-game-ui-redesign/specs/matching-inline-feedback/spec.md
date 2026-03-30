## ADDED Requirements

### Requirement: Matched cards show inline success feedback
When two cards are correctly matched, both cards SHALL display an inline success state using color transition and visual change, without any full-screen overlay or blocking animation.

#### Scenario: Correct match shows green transition
- **WHEN** the user selects two cards that form a correct pair
- **THEN** both cards SHALL transition to a matched visual state (green color scheme)
- **AND** the matched cards SHALL remain visible in their positions with reduced opacity or scale
- **AND** no full-screen overlay animation SHALL be displayed

#### Scenario: Matched cards become non-interactive
- **WHEN** two cards have been successfully matched
- **THEN** both matched cards SHALL be visually distinct from unmatched cards (e.g., opacity reduction)
- **AND** clicking on matched cards SHALL have no effect

#### Scenario: Game flow is not blocked by match feedback
- **WHEN** a correct match occurs
- **THEN** the user SHALL be able to select the next pair immediately after the match is registered
- **AND** the feedback animation SHALL NOT block or delay subsequent card selections

### Requirement: Error cards show inline error feedback
When two cards are incorrectly matched, both cards SHALL display a brief inline error state, then reset to their default state.

#### Scenario: Incorrect match shows red flash
- **WHEN** the user selects two cards that do not form a correct pair
- **THEN** both cards SHALL briefly display an error visual state (red color scheme)
- **AND** after a short delay (approximately 800ms-1000ms), both cards SHALL return to their default unselected state

#### Scenario: Error feedback does not use full-screen overlay
- **WHEN** an incorrect match occurs
- **THEN** no full-screen overlay or blocking animation SHALL be displayed
- **AND** the error feedback SHALL be contained within the card elements themselves

### Requirement: MatchAnimation overlay is removed
The full-screen `MatchAnimation` component (green flash + large checkmark overlay) SHALL be removed from the matching game page.

#### Scenario: No full-screen animation on match
- **WHEN** any match (correct or incorrect) occurs during gameplay
- **THEN** no full-screen overlay SHALL appear
- **AND** no pointer-events-blocking layer SHALL be rendered

### Requirement: Card selection state feedback
When a card is selected (first pick), it SHALL display a clear visual selection indicator.

#### Scenario: First card selection shows highlight
- **WHEN** the user selects a card as the first pick
- **THEN** the card SHALL display a selection highlight (primary color border/ring)
- **AND** the card SHALL remain highlighted until the second card is selected

#### Scenario: Selection clears after pair evaluation
- **WHEN** two cards have been selected and evaluated (match or error)
- **THEN** the selection highlight SHALL be removed from both cards
- **AND** cards SHALL return to their appropriate state (matched or default)
