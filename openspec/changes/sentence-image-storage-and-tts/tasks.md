## 1. Database & Schema

- [x] 1.1 Add nullable `image_url` column to `SentenceCard` model in `prisma/schema.prisma`
- [x] 1.2 Run `prisma migrate dev --name add-sentence-image-url` to create migration
- [x] 1.3 Update `lib/validations/sentence.ts` Zod schemas to include optional `imageUrl` field in create/update schemas
- [x] 1.4 Write tests for updated Zod schemas (valid with/without imageUrl, invalid imageUrl format)

## 2. Image Upload API

- [x] 2.1 Create `public/uploads/sentences/` directory with `.gitkeep` and add `public/uploads/sentences/*` (except `.gitkeep`) to `.gitignore`
- [x] 2.2 Write tests for `POST /api/sentences/upload` — success, invalid file type, no file, oversized file (TDD: tests first)
- [x] 2.3 Implement `POST /api/sentences/upload` route: accept `multipart/form-data`, validate file type (JPEG/PNG/WebP) and size (≤10MB), save to `public/uploads/sentences/{cuid}.{ext}`, return `{ success: true, data: { imageUrl } }`
- [x] 2.4 Write tests for `DELETE /api/sentences/upload` — success, non-existent file (idempotent)
- [x] 2.5 Implement `DELETE /api/sentences/upload` route: accept `{ imageUrl }` body, delete file from disk, return `{ success: true }`

## 3. Sentence API Updates

- [x] 3.1 Write tests for updated `POST /api/sentences` — create with imageUrl, create without imageUrl
- [x] 3.2 Update `POST /api/sentences` to accept and store `imageUrl` field
- [x] 3.3 Write tests for updated `GET /api/sentences` — response includes imageUrl field
- [x] 3.4 Update `GET /api/sentences` to return `imageUrl` in response (already returned by Prisma, verify serialization)
- [x] 3.5 Write tests for updated `PUT /api/sentences/[id]` — update imageUrl
- [x] 3.6 Update `PUT /api/sentences/[id]` to accept `imageUrl` in update body

## 4. Frontend Hooks & Types

- [x] 4.1 Update `SentenceCard` interface in `hooks/useSentences.ts` to include `imageUrl?: string | null`
- [x] 4.2 Update `CreateSentenceInput` interface to include optional `imageUrl` field
- [x] 4.3 Add `useUploadSentenceImage` mutation hook (POST multipart to `/api/sentences/upload`)
- [x] 4.4 Add `useDeleteSentenceImage` mutation hook (DELETE to `/api/sentences/upload`)
- [x] 4.5 Write tests for new hooks (mock fetch, verify request format)

## 5. OCR Import Flow — Image Upload Integration

- [x] 5.1 Update `OcrPreviewItem` interface in `OcrPreview.tsx` to include `serverImageUrl?: string` (persisted URL distinct from preview `imageUrl`)
- [x] 5.2 Update `handleImagesSelected` in `vocabulary/page.tsx`: upload each image to server via `useUploadSentenceImage` alongside OCR processing, store returned URL in `OcrPreviewItem.serverImageUrl`
- [x] 5.3 Update `handleOcrSave` to include `serverImageUrl` as `imageUrl` in `POST /api/sentences` request
- [x] 5.4 Update `handleOcrSaveAll` to include each item's `serverImageUrl` as `imageUrl`
- [x] 5.5 Update `handleOcrDiscard` to call `useDeleteSentenceImage` when item has `serverImageUrl`
- [x] 5.6 Update import dialog `onOpenChange` close handler to clean up all unsaved uploaded images
- [x] 5.7 Write integration tests for the updated import flow (upload + save, upload + discard, upload + close dialog)

## 6. Sentence List — Image Thumbnail Display

- [x] 6.1 Write tests for `SentenceList` image display: card with imageUrl shows thumbnail, card without imageUrl shows no thumbnail (TDD: tests first)
- [x] 6.2 Update `SentenceList.tsx` to display image thumbnail in card content when `sentence.imageUrl` is present (use `next/image`, max-h-[120px], object-contain)
- [x] 6.3 Verify thumbnail renders correctly with existing card layout (no layout shift)

## 7. Sentence List — TTS Pronunciation

- [x] 7.1 Write tests for `SentenceList` TTS: speaker button renders, click triggers TTS with Japanese text, hidden when unsupported (TDD: tests first)
- [x] 7.2 Import `SpeakerButton` from `@/components/features/audio` in `SentenceList.tsx`
- [x] 7.3 Add `<SpeakerButton text={sentence.japanese} />` next to the Japanese text in each sentence card header
- [x] 7.4 Verify TTS uses persisted user settings (speed, volume, pitch)

## 8. Sentence Flashcard — TTS Pronunciation

- [x] 8.1 Write tests for `SentenceFlashcard` TTS: speaker button renders on front, click plays pronunciation, click does not flip card, button updates on card navigation (TDD: tests first)
- [x] 8.2 Import `SpeakerButton` in `SentenceFlashcard.tsx`
- [x] 8.3 Add `<SpeakerButton text={currentSentence.japanese} />` on the flashcard front side with `onClick` stopPropagation to prevent card flip
- [x] 8.4 Add `ttsEngine.stop()` call in `handleNext` and `handlePrevious` to stop ongoing speech when navigating

## 9. E2E Tests

- [x] 9.1 Write Playwright E2E test: import Duolingo image → verify image uploaded → save sentence → verify image thumbnail in list
- [x] 9.2 Write Playwright E2E test: sentence card TTS button click triggers speech (mock speechSynthesis)
- [x] 9.3 Write Playwright E2E test: flashcard TTS button click plays pronunciation without flipping card

## 10. Final Verification

- [x] 10.1 Run `pnpm lint:web` and fix any lint errors in changed files
- [x] 10.2 Run `pnpm test:web` and verify all tests pass
- [x] 10.3 Run `pnpm build:web` and verify production build succeeds
- [ ] 10.4 Manual smoke test: full import flow (upload → OCR → preview → save → list with thumbnail + TTS)
