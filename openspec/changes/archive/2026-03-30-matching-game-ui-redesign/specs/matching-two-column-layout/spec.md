## ADDED Requirements

### Requirement: Cards arranged in fixed two-column layout
The matching game SHALL display cards in a fixed two-column layout where the left column contains source-language words and the right column contains target-language meanings, arranged in 5 rows.

#### Scenario: Left column shows word cards only
- **WHEN** the matching game is rendered
- **THEN** the left column SHALL contain exactly 5 cards, each displaying a source-language word
- **AND** no meaning cards SHALL appear in the left column

#### Scenario: Right column shows meaning cards only
- **WHEN** the matching game is rendered
- **THEN** the right column SHALL contain exactly 5 cards, each displaying a target-language meaning
- **AND** no word cards SHALL appear in the right column

#### Scenario: Columns are independently shuffled
- **WHEN** the matching game generates card positions
- **THEN** the left column word order SHALL be randomized independently from the right column meaning order
- **AND** matching pairs SHALL NOT be placed on the same row by default

### Requirement: Cross-column matching interaction
The user SHALL be able to select one card from the left column and one card from the right column to form a matching pair. Selecting two cards from the same column SHALL NOT be allowed.

#### Scenario: User selects one card from each column
- **WHEN** the user selects a card from the left column
- **AND** then selects a card from the right column
- **THEN** the system SHALL check if the two cards form a matching pair

#### Scenario: User cannot select two cards from the same column
- **WHEN** the user has selected a card from the left column
- **THEN** other cards in the left column SHALL be visually indicated as non-selectable
- **AND** only cards in the right column SHALL be selectable as the second pick

#### Scenario: User selects right column first then left column
- **WHEN** the user selects a card from the right column first
- **AND** then selects a card from the left column
- **THEN** the system SHALL check if the two cards form a matching pair

### Requirement: Card generator supports column-based output
The matching generator SHALL provide a function that returns cards separated into left (word) and right (meaning) column arrays, each independently shuffled.

#### Scenario: Generator returns two separate arrays
- **WHEN** `generateColumnPairs(vocabulary, 5)` is called
- **THEN** the result SHALL contain a `leftColumn` array with 5 word-type cards
- **AND** a `rightColumn` array with 5 meaning-type cards

#### Scenario: Each column is independently shuffled
- **WHEN** `generateColumnPairs` is called multiple times with the same input
- **THEN** the order of cards in `leftColumn` SHALL vary between calls
- **AND** the order of cards in `rightColumn` SHALL vary between calls independently

### Requirement: Two-column visual layout structure
The card area SHALL render as two visually distinct columns with consistent spacing between them and between rows.

#### Scenario: Layout renders two columns with gap
- **WHEN** the matching game card area is rendered
- **THEN** there SHALL be two columns of equal width
- **AND** a visible gap between the left and right columns

#### Scenario: Each row aligns horizontally
- **WHEN** 5 rows of card pairs are rendered
- **THEN** the left card and right card in each row SHALL be vertically aligned at the same height
