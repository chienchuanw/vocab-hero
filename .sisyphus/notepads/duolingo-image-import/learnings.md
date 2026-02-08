
## SentenceCard Model Implementation

### Completed
- Added `SentenceCard` Prisma model to schema.prisma (after ExampleSentence model)
- Model fields: id, japanese, english, notes, createdAt, updatedAt
- Followed VocabularyItem pattern: @map() for columns, @@map() for table, cuid() for id
- Created index on createdAt for query performance
- Migration created: 20260208151749_add_sentence_cards
- Schema validation passed ✓
- Prisma client regenerated ✓

### Key Patterns Observed
- All models use snake_case for column names via @map()
- All models use @@map() for table names
- All models have createdAt/updatedAt with proper defaults
- Independent models (no relationships) still follow same structure
- Indexes added on frequently queried fields (createdAt in this case)

### Notes
- SentenceCard is intentionally independent (no userId, no relationships)
- Single-user app design - no user association needed
- Ready for Duolingo screenshot import feature

## Tesseract.js Web Worker Setup (Task 2)

### Completed
- Installed tesseract.js v7.0.0 (latest)
- Created `lib/ocr/tesseract-worker.ts` with initializeOcr, recognizeText, terminateOcr exports
- Created `lib/ocr/tesseract-worker.test.ts` with 17 passing tests
- TypeScript strict mode passes clean

### Key Patterns
- Tesseract.js v7 uses `createWorker(langs, oem, options)` API - langs/oem set during creation, no separate initialize/loadLanguage steps
- `vi.hoisted()` is required in Vitest 4 for mock variables used inside `vi.mock()` factory functions - plain `const` declarations are NOT hoisted above the mock
- Module-level singleton pattern for worker instance (matches tts-engine pattern with global `ttsEngine`)
- Progress forwarded via logger callback in createWorker options, stored in module-level variable and swapped per-call
- `import type Tesseract from 'tesseract.js'` for accessing the Worker type without runtime import

### Technical Decisions
- Languages: 'jpn+eng' (combined string, not array) for simultaneous Japanese + English recognition
- OEM mode 1 (LSTM_ONLY) for best accuracy with modern models
- Lazy initialization: recognizeText auto-initializes if worker not yet created
- Worker reuse: single worker instance reused across recognize calls (tesseract.js docs recommend this)
