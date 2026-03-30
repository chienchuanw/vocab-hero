## ADDED Requirements

### Requirement: Sentence list cards have TTS pronunciation button
Each sentence card in the sentence list SHALL include a `SpeakerButton` that reads the Japanese text aloud using the existing TTS engine.

#### Scenario: Speaker button renders on sentence card
- **WHEN** a sentence card is rendered in the sentence list
- **THEN** a `SpeakerButton` SHALL be displayed next to the Japanese text in the card header

#### Scenario: Clicking speaker button plays Japanese pronunciation
- **WHEN** the user clicks the speaker button on a sentence card
- **THEN** the TTS engine SHALL speak the sentence's Japanese text using the user's persisted TTS settings (speed, volume, pitch, voice)

#### Scenario: Speaker button shows loading state during playback
- **WHEN** the TTS engine is actively speaking a sentence
- **THEN** the speaker button SHALL display a loading spinner and be disabled until playback completes

#### Scenario: Speaker button hidden when TTS not supported
- **WHEN** the browser does not support the Web Speech API
- **THEN** the speaker button SHALL NOT be rendered on sentence cards

### Requirement: Sentence flashcard front has TTS pronunciation button
The sentence flashcard front side (Japanese) SHALL include a `SpeakerButton` that reads the Japanese sentence aloud.

#### Scenario: Speaker button renders on flashcard front
- **WHEN** a sentence flashcard is displayed showing the Japanese text (front side)
- **THEN** a `SpeakerButton` SHALL be displayed below or beside the Japanese text

#### Scenario: Clicking flashcard speaker button plays pronunciation
- **WHEN** the user clicks the speaker button on the flashcard front
- **THEN** the TTS engine SHALL speak the current sentence's Japanese text

#### Scenario: Speaker button click does not flip the card
- **WHEN** the user clicks the speaker button on the flashcard front
- **THEN** the card SHALL NOT flip to the back side (the click event SHALL be stopped from propagating)

#### Scenario: Speaker button updates when navigating between cards
- **WHEN** the user navigates to the next or previous flashcard
- **THEN** the speaker button SHALL be ready to speak the new card's Japanese text (any ongoing speech SHALL be stopped)
