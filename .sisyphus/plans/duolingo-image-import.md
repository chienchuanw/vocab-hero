# Duolingo Image Import Feature

## TL;DR

> **Quick Summary**: Build a feature to import Japanese/English sentence pairs from Duolingo screenshots using browser-based OCR (Tesseract.js), with flashcard-style review.
>
> **Deliverables**:
>
> - New `SentenceCard` Prisma model
> - Image upload component with drag-and-drop (batch support)
> - Tesseract.js OCR integration via Web Worker
> - Manual correction UI before saving
> - Flashcard review component for sentences
> - Integration into /vocabulary page as new tab
>
> **Estimated Effort**: Large
> **Parallel Execution**: YES - 3 waves
> **Critical Path**: Task 1 → Task 3 → Task 5 → Task 7 → Task 8

---

## Context

### Original Request

User wants to import Japanese/English sentence pairs from Duolingo screenshots into vocab-hero for flashcard-style learning. The screenshots have a consistent format with Japanese text on top and English translation below.

### Interview Summary

**Key Discussions**:

- **Data Storage**: Independent sentence cards (not attached to vocabulary items)
- **Import Method**: Upload images + automatic OCR recognition
- **Batch Support**: Yes, multiple images at once
- **OCR Technology**: Tesseract.js (browser-based, free)
- **UI Location**: Integrate into /vocabulary page as new tab
- **Learning Mode**: Flashcard-style review (show JP, flip to see EN)
- **Test Strategy**: TDD with Vitest

**Research Findings**:

- Project uses Next.js 16 + TypeScript + Prisma + PostgreSQL
- Existing `ExampleSentence` model requires `vocabularyItemId` (cannot be reused)
- `RestoreDialog.tsx:40-64` shows file upload pattern to follow
- `Flashcard.tsx` has flip animation, keyboard shortcuts, swipe gestures
- `components/ui/tabs.tsx` available for tab integration
- No existing image processing - Tesseract.js is new dependency

### Metis Review

**Identified Gaps** (addressed):

- **OCR failure handling**: Added error states and manual entry fallback
- **Image size limits**: Set 5MB max per image, 10 images per batch
- **Web Worker requirement**: OCR MUST run in Web Worker (non-negotiable)
- **Language model loading**: Progressive loading with IndexedDB caching
- **Duplicate handling**: Allow duplicates (user manages)
- **Edit after save**: Full CRUD support for sentence cards

---

## Work Objectives

### Core Objective

Enable users to quickly import Japanese/English sentence pairs from Duolingo screenshots via browser-based OCR, with manual correction and flashcard-style review.

### Concrete Deliverables

- `prisma/schema.prisma`: New `SentenceCard` model
- `lib/ocr/tesseract-worker.ts`: Web Worker for OCR
- `lib/ocr/duolingo-parser.ts`: Duolingo screenshot text parser
- `components/features/sentences/ImageUpload.tsx`: Drag-and-drop upload
- `components/features/sentences/OcrPreview.tsx`: OCR result editor
- `components/features/sentences/SentenceFlashcard.tsx`: Flashcard component
- `components/features/sentences/SentenceList.tsx`: Sentence cards list
- `app/api/sentences/route.ts`: API endpoints (GET, POST)
- `app/api/sentences/[id]/route.ts`: API endpoints (GET, PUT, DELETE)
- `app/[locale]/vocabulary/page.tsx`: Updated with Sentences tab

### Definition of Done

- [x] `pnpm prisma migrate dev` succeeds
- [x] `curl POST /api/sentences` creates sentence card
- [x] Upload image → OCR extracts JP/EN text
- [x] Manual correction before save works
- [x] Flashcard flip animation works
- [x] All unit tests pass (`pnpm test`)
- [x] E2E tests pass (`pnpm test:e2e`)

### Must Have

- SentenceCard Prisma model (id, japanese, english, notes, timestamps)
- Image upload with drag-and-drop
- Batch upload (up to 10 images)
- Tesseract.js OCR in Web Worker
- Japanese + English language model loading
- Manual correction UI before saving
- Flashcard review with flip animation
- Keyboard navigation (Space to flip, arrows to navigate)
- Integration in /vocabulary page as tab
- Full CRUD API for sentence cards
- TDD with Vitest + Playwright

### Must NOT Have (Guardrails)

- NO spaced repetition (SM-2) for sentence cards in v1
- NO audio TTS for sentences in v1
- NO sentence linking to vocabulary items
- NO progress tracking/statistics
- NO cloud storage for original images
- NO server-side OCR processing
- NO image preprocessing (cropping, rotation)
- NO OCR confidence scoring display
- NO sentence grouping/collections
- NO export/import of sentence cards

---

## Verification Strategy

> **UNIVERSAL RULE: ZERO HUMAN INTERVENTION**
>
> ALL tasks in this plan MUST be verifiable WITHOUT any human action.

### Test Decision

- **Infrastructure exists**: YES (Vitest + Playwright)
- **Automated tests**: TDD
- **Framework**: Vitest + React Testing Library + Playwright

### If TDD Enabled

Each TODO follows RED-GREEN-REFACTOR:

**Task Structure:**

1. **RED**: Write failing test first
   - Test file: `[path].test.ts`
   - Test command: `pnpm test [file]`
   - Expected: FAIL (test exists, implementation doesn't)
2. **GREEN**: Implement minimum code to pass
   - Command: `pnpm test [file]`
   - Expected: PASS
3. **REFACTOR**: Clean up while keeping green
   - Command: `pnpm test [file]`
   - Expected: PASS (still)

### Agent-Executed QA Scenarios (MANDATORY)

**Verification Tool by Deliverable Type:**

| Type              | Tool          | How Agent Verifies              |
| ----------------- | ------------- | ------------------------------- |
| **Database**      | Bash (prisma) | Run migrations, seed, query     |
| **API**           | Bash (curl)   | Send requests, assert responses |
| **UI Components** | Playwright    | Navigate, interact, assert DOM  |
| **OCR Logic**     | Vitest        | Unit tests with mock images     |

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately):
├── Task 1: Database schema + migration
├── Task 2: Tesseract.js Web Worker setup
└── Task 4: API route scaffolding

Wave 2 (After Wave 1):
├── Task 3: Duolingo OCR parser (depends: 2)
├── Task 5: Image upload component (depends: 2)
└── Task 6: API implementation (depends: 1, 4)

Wave 3 (After Wave 2):
├── Task 7: OCR preview + correction UI (depends: 3, 5)
├── Task 8: Sentence flashcard component (depends: 6)
└── Task 9: Sentence list component (depends: 6)

Wave 4 (Final Integration):
└── Task 10: /vocabulary page integration (depends: 7, 8, 9)

Critical Path: Task 1 → Task 6 → Task 8 → Task 10
Parallel Speedup: ~50% faster than sequential
```

### Dependency Matrix

| Task | Depends On | Blocks | Can Parallelize With |
| ---- | ---------- | ------ | -------------------- |
| 1    | None       | 6      | 2, 4                 |
| 2    | None       | 3, 5   | 1, 4                 |
| 3    | 2          | 7      | 5, 6                 |
| 4    | None       | 6      | 1, 2                 |
| 5    | 2          | 7      | 3, 6                 |
| 6    | 1, 4       | 8, 9   | 3, 5                 |
| 7    | 3, 5       | 10     | 8, 9                 |
| 8    | 6          | 10     | 7, 9                 |
| 9    | 6          | 10     | 7, 8                 |
| 10   | 7, 8, 9    | None   | None (final)         |

### Agent Dispatch Summary

| Wave | Tasks   | Recommended Agents                                                 |
| ---- | ------- | ------------------------------------------------------------------ |
| 1    | 1, 2, 4 | quick (schema), unspecified-high (worker), quick (routes)          |
| 2    | 3, 5, 6 | unspecified-low (parser), visual-engineering (upload), quick (API) |
| 3    | 7, 8, 9 | visual-engineering (UI components)                                 |
| 4    | 10      | visual-engineering (integration)                                   |

---

## TODOs

### Task 1: Database Schema - SentenceCard Model

- [x] 1. Create SentenceCard Prisma model and migration

  **What to do**:
  - Add `SentenceCard` model to `prisma/schema.prisma`
  - Model fields: id (cuid), japanese (String), english (String), notes (String?), createdAt, updatedAt
  - Add index on createdAt for sorting
  - Run migration: `pnpm prisma migrate dev --name add_sentence_cards`

  **Must NOT do**:
  - NO relationship to VocabularyItem
  - NO reviewSchedule relationship
  - NO userId field (single-user app)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Single file change, straightforward schema addition
  - **Skills**: []
    - No special skills needed for Prisma schema

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 2, 4)
  - **Blocks**: Task 6
  - **Blocked By**: None

  **References**:
  - `prisma/schema.prisma:34-51` - VocabularyItem model pattern to follow
  - `prisma/schema.prisma:54-69` - ExampleSentence model for field patterns

  **Acceptance Criteria**:

  **TDD Tests:**
  - [x] Test file: Not applicable (schema change)

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: Migration creates sentence_cards table
    Tool: Bash (prisma)
    Preconditions: Database running, clean state
    Steps:
      1. Run: pnpm prisma migrate dev --name add_sentence_cards
      2. Assert: Migration completes without errors
      3. Run: pnpm prisma db push --force-reset (test environment)
      4. Run: echo "SELECT table_name FROM information_schema.tables WHERE table_name='sentence_cards';" | pnpm prisma db execute --stdin
      5. Assert: Output contains 'sentence_cards'
    Expected Result: Table created successfully
    Evidence: Migration output captured

  Scenario: Prisma client can create SentenceCard
    Tool: Bash (node)
    Preconditions: Migration applied
    Steps:
      1. Run: node -e "const {PrismaClient} = require('@prisma/client'); const p = new PrismaClient(); p.sentenceCard.create({data:{japanese:'test',english:'test'}}).then(console.log).catch(console.error).finally(()=>p.\$disconnect())"
      2. Assert: Output contains 'id' field
      3. Assert: Output contains 'japanese': 'test'
    Expected Result: Record created with all fields
    Evidence: Console output captured
  ```

  **Commit**: YES
  - Message: `feat(db): add SentenceCard model for Duolingo imports`
  - Files: `prisma/schema.prisma`, `prisma/migrations/*`
  - Pre-commit: `pnpm prisma validate`

---

### Task 2: Tesseract.js Web Worker Setup

- [x] 2. Set up Tesseract.js with Web Worker for OCR processing

  **What to do**:
  - Install tesseract.js: `pnpm add tesseract.js`
  - Create `lib/ocr/tesseract-worker.ts` with Web Worker setup
  - Load Japanese (jpn) and English (eng) language models
  - Implement progressive loading with status callbacks
  - Cache language models in IndexedDB for subsequent visits
  - Export `recognizeText(imageFile: File): Promise<string>` function

  **Must NOT do**:
  - NO main thread OCR execution (must use worker)
  - NO server-side processing
  - NO custom language model training

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Complex async setup with Web Workers, requires careful error handling
  - **Skills**: []
    - No UI skills needed

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 4)
  - **Blocks**: Tasks 3, 5
  - **Blocked By**: None

  **References**:
  - Official Tesseract.js docs: https://tesseract.projectnaptha.com/
  - `lib/tts/` - Pattern for browser API wrappers in this project

  **Acceptance Criteria**:

  **TDD Tests:**
  - [x] Test file: `lib/ocr/tesseract-worker.test.ts`
  - [x] Test: Worker initializes without blocking main thread
  - [x] Test: recognizeText returns string for valid image
  - [x] Test: Handles network error during model loading
  - [x] `pnpm test lib/ocr/tesseract-worker.test.ts` → PASS

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: Tesseract.js package installed correctly
    Tool: Bash
    Preconditions: None
    Steps:
      1. Run: pnpm add tesseract.js
      2. Assert: Exit code 0
      3. Run: cat package.json | grep tesseract
      4. Assert: Output contains "tesseract.js"
    Expected Result: Package in dependencies
    Evidence: package.json content

  Scenario: Web Worker loads without main thread blocking
    Tool: Playwright
    Preconditions: Dev server running, test page created
    Steps:
      1. Navigate to: http://localhost:3000/test-ocr
      2. Execute JS: performance.now() before worker init
      3. Wait for: Worker ready signal (max 100ms for init, model loading separate)
      4. Execute JS: performance.now() after
      5. Assert: Difference < 100ms (worker started async)
    Expected Result: Main thread not blocked during init
    Evidence: Performance timing logged
  ```

  **Commit**: YES
  - Message: `feat(ocr): add Tesseract.js Web Worker setup`
  - Files: `lib/ocr/tesseract-worker.ts`, `lib/ocr/tesseract-worker.test.ts`, `package.json`
  - Pre-commit: `pnpm test lib/ocr`

---

### Task 3: Duolingo Screenshot Parser

- [x] 3. Implement Duolingo screenshot text parser

  **What to do**:
  - Create `lib/ocr/duolingo-parser.ts`
  - Parse OCR text output to extract Japanese and English separately
  - Strategy: Japanese characters (Hiragana, Katakana, Kanji) go to japanese field
  - Strategy: ASCII/Latin characters go to english field
  - Handle multi-line text (Duolingo wraps long sentences)
  - Export `parseDuolingoText(rawText: string): {japanese: string, english: string}`

  **Must NOT do**:
  - NO image preprocessing
  - NO position-based parsing (rely on character detection)
  - NO confidence scoring

  **Recommended Agent Profile**:
  - **Category**: `unspecified-low`
    - Reason: Pure string parsing logic, straightforward
  - **Skills**: []
    - No special skills needed

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 5, 6)
  - **Blocks**: Task 7
  - **Blocked By**: Task 2 (needs OCR output format)

  **References**:
  - Japanese character ranges: U+3040-U+30FF (Hiragana/Katakana), U+4E00-U+9FAF (Kanji)
  - Example OCR output format from Duolingo screenshots analyzed earlier

  **Acceptance Criteria**:

  **TDD Tests:**
  - [x] Test file: `lib/ocr/duolingo-parser.test.ts`
  - [x] Test: Extracts Japanese from mixed text
  - [x] Test: Extracts English from mixed text
  - [x] Test: Handles multi-line input
  - [x] Test: Returns empty strings for unrecognized text
  - [x] `pnpm test lib/ocr/duolingo-parser.test.ts` → PASS

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: Parser correctly separates JP and EN
    Tool: Vitest (unit test)
    Preconditions: Parser module exists
    Steps:
      1. Input: "ちょっと暑いんだけど、窓を開けてくれない?\nIt is a little hot, so would you mind opening the window for me?"
      2. Call: parseDuolingoText(input)
      3. Assert: result.japanese === "ちょっと暑いんだけど、窓を開けてくれない?"
      4. Assert: result.english === "It is a little hot, so would you mind opening the window for me?"
    Expected Result: Clean separation of JP/EN
    Evidence: Test output

  Scenario: Parser handles edge case - only Japanese
    Tool: Vitest (unit test)
    Preconditions: Parser module exists
    Steps:
      1. Input: "今日は天気がいいです"
      2. Call: parseDuolingoText(input)
      3. Assert: result.japanese === "今日は天気がいいです"
      4. Assert: result.english === ""
    Expected Result: Empty english field, not error
    Evidence: Test output
  ```

  **Commit**: YES
  - Message: `feat(ocr): add Duolingo screenshot text parser`
  - Files: `lib/ocr/duolingo-parser.ts`, `lib/ocr/duolingo-parser.test.ts`
  - Pre-commit: `pnpm test lib/ocr`

---

### Task 4: API Route Scaffolding

- [x] 4. Create API route files for sentence cards

  **What to do**:
  - Create `app/api/sentences/route.ts` (GET list, POST create)
  - Create `app/api/sentences/[id]/route.ts` (GET one, PUT update, DELETE)
  - Add validation schema in `lib/validations/sentence.ts`
  - Follow existing API patterns in project

  **Must NOT do**:
  - NO implementation yet (just scaffolding with 501 Not Implemented)
  - NO authentication (single-user app)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Boilerplate scaffolding, follow existing patterns
  - **Skills**: []
    - No special skills needed

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 2)
  - **Blocks**: Task 6
  - **Blocked By**: None

  **References**:
  - `app/api/vocabulary/route.ts` - API pattern to follow (if exists)
  - `lib/validations/import.ts` - Validation schema pattern
  - `lib/validations/notification.ts` - Another validation example

  **Acceptance Criteria**:

  **TDD Tests:**
  - [x] Test file: `app/api/sentences/route.test.ts`
  - [x] Test: GET /api/sentences returns 501 (scaffold)
  - [x] Test: POST /api/sentences returns 501 (scaffold)
  - [x] `pnpm test app/api/sentences` → PASS

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: API routes respond (scaffold)
    Tool: Bash (curl)
    Preconditions: Dev server running
    Steps:
      1. curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/sentences
      2. Assert: HTTP status is 501 (Not Implemented)
      3. curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost:3000/api/sentences
      4. Assert: HTTP status is 501 (Not Implemented)
    Expected Result: Routes exist and respond
    Evidence: HTTP status codes
  ```

  **Commit**: YES
  - Message: `feat(api): scaffold sentence card API routes`
  - Files: `app/api/sentences/route.ts`, `app/api/sentences/[id]/route.ts`, `lib/validations/sentence.ts`
  - Pre-commit: `pnpm test app/api/sentences`

---

### Task 5: Image Upload Component

- [x] 5. Build image upload component with drag-and-drop

  **What to do**:
  - Create `components/features/sentences/ImageUpload.tsx`
  - Support drag-and-drop for multiple images
  - Support click to open file picker
  - Accept image/\* files only
  - Limit: max 10 files, max 5MB each
  - Show upload progress and file previews
  - Trigger OCR processing for each file
  - Emit parsed results to parent component

  **Must NOT do**:
  - NO server upload (process in browser)
  - NO image cropping/editing
  - NO file persistence (process and discard)

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: UI component with drag-and-drop, progress indicators, previews
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: Drag-and-drop UX, progress indicators, file previews

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 3, 6)
  - **Blocks**: Task 7
  - **Blocked By**: Task 2 (needs OCR worker)

  **References**:
  - `components/features/data-management/RestoreDialog.tsx:40-64` - File input pattern
  - `components/ui/input.tsx` - Base input component
  - `components/ui/progress.tsx` - Progress bar component

  **Acceptance Criteria**:

  **TDD Tests:**
  - [x] Test file: `components/features/sentences/ImageUpload.test.tsx`
  - [x] Test: Renders drop zone
  - [x] Test: Accepts dropped image files
  - [x] Test: Rejects non-image files
  - [x] Test: Enforces 10 file limit
  - [x] Test: Shows preview thumbnails
  - [x] `pnpm test components/features/sentences/ImageUpload.test.tsx` → PASS

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: Drag and drop single image
    Tool: Playwright
    Preconditions: Dev server running, test page with ImageUpload
    Steps:
      1. Navigate to: http://localhost:3000/test-upload
      2. Create test image: data URL of 100x100 PNG
      3. Dispatch drop event with image file to .drop-zone
      4. Wait for: .preview-thumbnail visible (timeout: 2s)
      5. Assert: One thumbnail displayed
      6. Assert: OCR processing indicator shown
    Expected Result: Image accepted and processing starts
    Evidence: .sisyphus/evidence/task-5-drop-single.png

  Scenario: Reject non-image file
    Tool: Playwright
    Preconditions: Dev server running
    Steps:
      1. Navigate to: http://localhost:3000/test-upload
      2. Create test file: text/plain content
      3. Dispatch drop event with text file
      4. Wait for: .error-message visible (timeout: 2s)
      5. Assert: Error message contains "image"
      6. Assert: No thumbnails displayed
    Expected Result: Non-image rejected with error
    Evidence: .sisyphus/evidence/task-5-reject-nonimage.png

  Scenario: Enforce 10 file limit
    Tool: Playwright
    Preconditions: Dev server running
    Steps:
      1. Navigate to: http://localhost:3000/test-upload
      2. Create 12 test images
      3. Dispatch drop event with 12 files
      4. Wait for: processing complete
      5. Assert: Only 10 thumbnails displayed
      6. Assert: Warning message about limit
    Expected Result: Extra files rejected
    Evidence: .sisyphus/evidence/task-5-limit-enforced.png
  ```

  **Commit**: YES
  - Message: `feat(ui): add image upload component with drag-and-drop`
  - Files: `components/features/sentences/ImageUpload.tsx`, `components/features/sentences/ImageUpload.test.tsx`
  - Pre-commit: `pnpm test components/features/sentences`

---

### Task 6: API Implementation

- [x] 6. Implement sentence card API endpoints

  **What to do**:
  - Implement GET /api/sentences (list all, sorted by createdAt desc)
  - Implement POST /api/sentences (create with japanese, english, notes?)
  - Implement GET /api/sentences/[id] (get one)
  - Implement PUT /api/sentences/[id] (update)
  - Implement DELETE /api/sentences/[id] (delete)
  - Use Zod validation for request bodies
  - Return proper error responses

  **Must NOT do**:
  - NO pagination (simple list for MVP)
  - NO filtering/search
  - NO batch operations

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Standard CRUD, follow existing patterns
  - **Skills**: []
    - No special skills needed

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 3, 5)
  - **Blocks**: Tasks 8, 9
  - **Blocked By**: Tasks 1, 4

  **References**:
  - `app/api/vocabulary/route.ts` - Existing API pattern (if exists)
  - `lib/validations/sentence.ts` - Validation schema from Task 4
  - `lib/db/index.ts` - Prisma client import pattern

  **Acceptance Criteria**:

  **TDD Tests:**
  - [x] Test file: `app/api/sentences/route.test.ts` (update from scaffold)
  - [x] Test: GET returns empty array initially
  - [x] Test: POST creates and returns sentence
  - [x] Test: POST validates required fields
  - [x] Test: GET /[id] returns specific sentence
  - [x] Test: PUT updates sentence
  - [x] Test: DELETE removes sentence
  - [x] `pnpm test app/api/sentences` → PASS

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: Full CRUD flow
    Tool: Bash (curl)
    Preconditions: Dev server running, database clean
    Steps:
      1. POST /api/sentences {"japanese":"今日は","english":"Today"}
      2. Assert: Status 201, response has id
      3. Store: id from response
      4. GET /api/sentences
      5. Assert: Status 200, array length 1
      6. GET /api/sentences/{id}
      7. Assert: Status 200, japanese === "今日は"
      8. PUT /api/sentences/{id} {"japanese":"明日は","english":"Tomorrow"}
      9. Assert: Status 200, japanese === "明日は"
      10. DELETE /api/sentences/{id}
      11. Assert: Status 200
      12. GET /api/sentences/{id}
      13. Assert: Status 404
    Expected Result: All CRUD operations work
    Evidence: Response bodies captured

  Scenario: Validation rejects empty japanese
    Tool: Bash (curl)
    Preconditions: Dev server running
    Steps:
      1. POST /api/sentences {"japanese":"","english":"test"}
      2. Assert: Status 400
      3. Assert: Response contains "japanese" error
    Expected Result: Validation error returned
    Evidence: Error response body
  ```

  **Commit**: YES
  - Message: `feat(api): implement sentence card CRUD endpoints`
  - Files: `app/api/sentences/route.ts`, `app/api/sentences/[id]/route.ts`, `app/api/sentences/route.test.ts`
  - Pre-commit: `pnpm test app/api/sentences`

---

### Task 7: OCR Preview and Correction UI

- [x] 7. Build OCR preview component with manual correction

  **What to do**:
  - Create `components/features/sentences/OcrPreview.tsx`
  - Display OCR results (japanese + english) in editable fields
  - Show original image thumbnail for reference
  - Allow user to correct OCR errors before saving
  - Show "Save" and "Discard" buttons per item
  - Handle batch mode (multiple images → multiple previews)
  - Show loading state during OCR processing

  **Must NOT do**:
  - NO auto-save (explicit save action required)
  - NO OCR confidence display
  - NO re-OCR option

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Form UI with multiple states, batch handling
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: Form UX, batch editing, loading states

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 8, 9)
  - **Blocks**: Task 10
  - **Blocked By**: Tasks 3, 5

  **References**:
  - `components/features/vocabulary/AddVocabularyForm.tsx` - Form pattern
  - `components/ui/textarea.tsx` - Text area component
  - `components/ui/card.tsx` - Card layout

  **Acceptance Criteria**:

  **TDD Tests:**
  - [x] Test file: `components/features/sentences/OcrPreview.test.tsx`
  - [x] Test: Renders japanese and english fields
  - [x] Test: Fields are editable
  - [x] Test: Save button calls onSave with edited values
  - [x] Test: Discard button calls onDiscard
  - [x] Test: Shows loading state when processing
  - [x] `pnpm test components/features/sentences/OcrPreview.test.tsx` → PASS

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: Edit and save OCR result
    Tool: Playwright
    Preconditions: Dev server running, test page with OcrPreview
    Steps:
      1. Navigate to: http://localhost:3000/test-preview
      2. Mount component with: {japanese: "test", english: "test", imageUrl: "..."}
      3. Clear: textarea[name="japanese"]
      4. Fill: textarea[name="japanese"] with "修正後の日本語"
      5. Click: button[data-action="save"]
      6. Assert: onSave called with japanese === "修正後の日本語"
    Expected Result: Edited value passed to save handler
    Evidence: .sisyphus/evidence/task-7-edit-save.png

  Scenario: Discard removes preview
    Tool: Playwright
    Preconditions: Dev server running
    Steps:
      1. Navigate to: http://localhost:3000/test-preview
      2. Mount component with OCR result
      3. Click: button[data-action="discard"]
      4. Assert: onDiscard called
      5. Assert: Preview removed from DOM
    Expected Result: Preview discarded
    Evidence: .sisyphus/evidence/task-7-discard.png

  Scenario: Loading state during OCR
    Tool: Playwright
    Preconditions: Dev server running
    Steps:
      1. Navigate to: http://localhost:3000/test-preview
      2. Mount component with: isLoading: true
      3. Assert: Loading spinner visible
      4. Assert: Form fields disabled
    Expected Result: Loading UI shown
    Evidence: .sisyphus/evidence/task-7-loading.png
  ```

  **Commit**: YES
  - Message: `feat(ui): add OCR preview component with manual correction`
  - Files: `components/features/sentences/OcrPreview.tsx`, `components/features/sentences/OcrPreview.test.tsx`
  - Pre-commit: `pnpm test components/features/sentences`

---

### Task 8: Sentence Flashcard Component

- [x] 8. Build flashcard component for sentence review

  **What to do**:
  - Create `components/features/sentences/SentenceFlashcard.tsx`
  - Display Japanese sentence on front
  - Flip animation reveals English translation
  - Keyboard support: Space to flip, Left/Right to navigate
  - Touch/swipe support for mobile
  - Show card count (e.g., "3 / 10")

  **Must NOT do**:
  - NO spaced repetition scoring
  - NO TTS audio
  - NO progress persistence

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Animation, keyboard/touch interactions
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: Flip animation, gesture handling

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 7, 9)
  - **Blocks**: Task 10
  - **Blocked By**: Task 6

  **References**:
  - `components/features/study/Flashcard.tsx` - MAIN REFERENCE: Existing flashcard with flip, keyboard, swipe
  - `hooks/useSwipeGesture.ts` - Swipe gesture hook
  - `components/ui/card.tsx` - Card component

  **Acceptance Criteria**:

  **TDD Tests:**
  - [x] Test file: `components/features/sentences/SentenceFlashcard.test.tsx`
  - [x] Test: Renders Japanese text
  - [x] Test: Flips to show English on click
  - [x] Test: Space key triggers flip
  - [x] Test: Arrow keys navigate
  - [x] `pnpm test components/features/sentences/SentenceFlashcard.test.tsx` → PASS

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: Flip animation works
    Tool: Playwright
    Preconditions: Dev server running, test page with SentenceFlashcard
    Steps:
      1. Navigate to: http://localhost:3000/test-flashcard
      2. Mount with: {japanese: "今日は", english: "Today"}
      3. Assert: .card-front visible, text contains "今日は"
      4. Assert: .card-back NOT visible
      5. Click: .flashcard
      6. Wait for: animation complete (300ms)
      7. Assert: .card-back visible, text contains "Today"
    Expected Result: Card flips to reveal English
    Evidence: .sisyphus/evidence/task-8-flip.png

  Scenario: Keyboard navigation
    Tool: Playwright
    Preconditions: Dev server running, multiple cards loaded
    Steps:
      1. Navigate to: http://localhost:3000/test-flashcard
      2. Mount with: 3 sentence cards
      3. Assert: Card 1 displayed, counter shows "1 / 3"
      4. Press: ArrowRight
      5. Assert: Card 2 displayed, counter shows "2 / 3"
      6. Press: Space
      7. Assert: Card flipped
      8. Press: ArrowLeft
      9. Assert: Card 1 displayed again
    Expected Result: Keyboard controls work
    Evidence: .sisyphus/evidence/task-8-keyboard.png
  ```

  **Commit**: YES
  - Message: `feat(ui): add sentence flashcard component`
  - Files: `components/features/sentences/SentenceFlashcard.tsx`, `components/features/sentences/SentenceFlashcard.test.tsx`
  - Pre-commit: `pnpm test components/features/sentences`

---

### Task 9: Sentence List Component

- [x] 9. Build sentence cards list with CRUD actions

  **What to do**:
  - Create `components/features/sentences/SentenceList.tsx`
  - Fetch and display all sentence cards
  - Show Japanese (primary) and English (secondary) for each
  - Add edit and delete buttons per card
  - Use TanStack Query for data fetching
  - Create `hooks/useSentences.ts` for data management

  **Must NOT do**:
  - NO pagination
  - NO search/filter
  - NO drag-and-drop reordering

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: List UI with actions, data fetching integration
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: List layout, action buttons

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 7, 8)
  - **Blocks**: Task 10
  - **Blocked By**: Task 6

  **References**:
  - `components/features/vocabulary/VocabularyList.tsx` - List pattern (if exists)
  - `hooks/useVocabulary.ts` - TanStack Query pattern
  - `hooks/useVocabularyMutations.ts` - Mutation pattern

  **Acceptance Criteria**:

  **TDD Tests:**
  - [x] Test file: `components/features/sentences/SentenceList.test.tsx`
  - [x] Test file: `hooks/useSentences.test.ts`
  - [x] Test: Renders empty state when no sentences
  - [x] Test: Renders list of sentences
  - [x] Test: Edit button opens edit mode
  - [x] Test: Delete button removes sentence
  - [x] `pnpm test components/features/sentences/SentenceList.test.tsx` → PASS
  - [x] `pnpm test hooks/useSentences.test.ts` → PASS

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: Display sentence list
    Tool: Playwright
    Preconditions: Dev server running, 3 sentences in database
    Steps:
      1. Navigate to: http://localhost:3000/test-list
      2. Wait for: .sentence-item (count: 3)
      3. Assert: First item contains Japanese text
      4. Assert: First item contains English text
      5. Assert: Edit button visible on each item
      6. Assert: Delete button visible on each item
    Expected Result: All sentences displayed
    Evidence: .sisyphus/evidence/task-9-list.png

  Scenario: Delete sentence from list
    Tool: Playwright
    Preconditions: Dev server running, 3 sentences in database
    Steps:
      1. Navigate to: http://localhost:3000/test-list
      2. Wait for: .sentence-item (count: 3)
      3. Click: First item's delete button
      4. Wait for: Confirmation dialog (if exists)
      5. Confirm deletion
      6. Wait for: .sentence-item (count: 2)
      7. Assert: Deleted item no longer in list
    Expected Result: Sentence removed
    Evidence: .sisyphus/evidence/task-9-delete.png

  Scenario: Empty state
    Tool: Playwright
    Preconditions: Dev server running, database empty
    Steps:
      1. Navigate to: http://localhost:3000/test-list
      2. Wait for: .empty-state visible
      3. Assert: Empty message displayed
      4. Assert: Possibly shows "Import" CTA
    Expected Result: Friendly empty state shown
    Evidence: .sisyphus/evidence/task-9-empty.png
  ```

  **Commit**: YES
  - Message: `feat(ui): add sentence list component with CRUD`
  - Files: `components/features/sentences/SentenceList.tsx`, `components/features/sentences/SentenceList.test.tsx`, `hooks/useSentences.ts`, `hooks/useSentences.test.ts`
  - Pre-commit: `pnpm test components/features/sentences && pnpm test hooks/useSentences`

---

### Task 10: Vocabulary Page Integration

- [x] 10. Integrate sentence features into /vocabulary page

  **What to do**:
  - Add "Sentences" tab to `/vocabulary` page using Tabs component
  - Tab content: SentenceList + ImageUpload trigger
  - Add "Import from Image" button that opens upload modal
  - Add "Study Sentences" button that opens flashcard review
  - Use existing page layout patterns

  **Must NOT do**:
  - NO new route (integrate into existing page)
  - NO changes to vocabulary functionality

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Page integration, modal flows, tab navigation
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: Tab integration, modal UX

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 4 (final)
  - **Blocks**: None
  - **Blocked By**: Tasks 7, 8, 9

  **References**:
  - `app/[locale]/vocabulary/page.tsx` - Page to modify
  - `components/ui/tabs.tsx` - Tabs component
  - `components/ui/dialog.tsx` - Modal component
  - `app/[locale]/progress/page.tsx` - Tabs usage example

  **Acceptance Criteria**:

  **TDD Tests:**
  - [x] E2E test file: `e2e/sentences.spec.ts`
  - [x] Test: Vocabulary page has Sentences tab
  - [x] Test: Sentences tab shows sentence list
  - [x] Test: Import button opens upload modal
  - [x] Test: Study button opens flashcard view
  - [x] `pnpm test:e2e e2e/sentences.spec.ts` → PASS

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: Complete import flow
    Tool: Playwright
    Preconditions: Dev server running
    Steps:
      1. Navigate to: http://localhost:3000/vocabulary
      2. Click: Tab "Sentences"
      3. Assert: Sentence list (or empty state) visible
      4. Click: "Import from Image" button
      5. Assert: Upload modal opens
      6. Drop: Test Duolingo screenshot image
      7. Wait for: OCR processing complete
      8. Assert: Preview shows JP and EN text
      9. Click: "Save"
      10. Assert: Modal closes
      11. Assert: New sentence appears in list
    Expected Result: Full import flow works
    Evidence: .sisyphus/evidence/task-10-import-flow.png

  Scenario: Study mode flow
    Tool: Playwright
    Preconditions: Dev server running, 3 sentences in database
    Steps:
      1. Navigate to: http://localhost:3000/vocabulary
      2. Click: Tab "Sentences"
      3. Click: "Study Sentences" button
      4. Assert: Flashcard view opens
      5. Assert: First sentence displayed
      6. Press: Space
      7. Assert: Card flips
      8. Press: ArrowRight
      9. Assert: Next card displayed
    Expected Result: Study flow works
    Evidence: .sisyphus/evidence/task-10-study-flow.png

  Scenario: Tab persistence
    Tool: Playwright
    Preconditions: Dev server running
    Steps:
      1. Navigate to: http://localhost:3000/vocabulary
      2. Click: Tab "Sentences"
      3. Assert: URL contains ?tab=sentences (or state preserved)
      4. Refresh page
      5. Assert: Sentences tab still active
    Expected Result: Tab selection persists
    Evidence: .sisyphus/evidence/task-10-tab-persist.png
  ```

  **Commit**: YES
  - Message: `feat(ui): integrate sentences into vocabulary page`
  - Files: `app/[locale]/vocabulary/page.tsx`, `e2e/sentences.spec.ts`
  - Pre-commit: `pnpm test:e2e e2e/sentences.spec.ts`

---

## Commit Strategy

| After Task | Message                                         | Files                                    | Verification      |
| ---------- | ----------------------------------------------- | ---------------------------------------- | ----------------- |
| 1          | `feat(db): add SentenceCard model`              | schema.prisma                            | prisma validate   |
| 2          | `feat(ocr): add Tesseract.js Web Worker`        | lib/ocr/\*                               | pnpm test lib/ocr |
| 3          | `feat(ocr): add Duolingo text parser`           | lib/ocr/\*                               | pnpm test lib/ocr |
| 4          | `feat(api): scaffold sentence routes`           | app/api/sentences/\*                     | pnpm test         |
| 5          | `feat(ui): add image upload component`          | components/features/sentences/\*         | pnpm test         |
| 6          | `feat(api): implement sentence CRUD`            | app/api/sentences/\*                     | pnpm test         |
| 7          | `feat(ui): add OCR preview component`           | components/features/sentences/\*         | pnpm test         |
| 8          | `feat(ui): add sentence flashcard`              | components/features/sentences/\*         | pnpm test         |
| 9          | `feat(ui): add sentence list`                   | components/features/sentences/_, hooks/_ | pnpm test         |
| 10         | `feat(ui): integrate sentences into vocabulary` | app/[locale]/vocabulary/\*               | pnpm test:e2e     |

---

## Success Criteria

### Verification Commands

```bash
# Database
pnpm prisma migrate dev  # Expected: Migration applies successfully

# Unit Tests
pnpm test  # Expected: All tests pass

# E2E Tests
pnpm test:e2e e2e/sentences.spec.ts  # Expected: All scenarios pass

# API Health Check
curl http://localhost:3000/api/sentences  # Expected: 200 OK, JSON array
```

### Final Checklist

- [x] SentenceCard table exists in database
- [x] Tesseract.js loads JP+EN models without blocking UI
- [x] OCR extracts text from Duolingo screenshots
- [x] Manual correction UI allows editing before save
- [x] Flashcard flip animation is smooth
- [x] Keyboard navigation works (Space, arrows)
- [x] Full CRUD operations work via API
- [x] /vocabulary page has working Sentences tab
- [x] All unit tests pass
- [x] All E2E tests pass
- [x] NO spaced repetition implemented (guardrail)
- [x] NO TTS audio implemented (guardrail)
- [x] NO server-side OCR (guardrail)
