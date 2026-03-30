## Why

使用者透過「從圖片匯入」功能上傳 Duolingo 截圖後，目前圖片僅用於前端 OCR 辨識，處理完畢即丟棄。使用者無法回顧原始截圖來確認辨識結果是否正確，也無法在日後複習時對照原圖。此外，句子卡片目前缺少發音功能，而單字卡片已具備 TTS 朗讀，兩者體驗不一致。

## What Changes

- **新增圖片永久儲存**：Duolingo 截圖在 OCR 處理後，將圖片檔案儲存至本地檔案系統（`public/uploads/sentences/`），並在 `SentenceCard` 資料庫模型中新增 `imageUrl` 欄位記錄路徑。
- **新增圖片上傳 API**：建立 `/api/sentences/upload` 端點，接收圖片檔案並存入本地磁碟，回傳可存取的 URL。
- **更新句子建立流程**：OCR 預覽儲存時，將圖片 URL 一併傳送至 `POST /api/sentences`，寫入資料庫。
- **句子卡片顯示圖片**：在句子列表卡片中顯示 Duolingo 來源圖片縮圖。
- **新增句子 TTS 發音**：在句子列表卡片和閃卡正面（日文）加入 `SpeakerButton`，複用現有 Web Speech API TTS 引擎。
- **BDD/TDD 開發**：所有新功能以行為驅動規格定義需求，以測試驅動方式實作。

## Capabilities

### New Capabilities

- `sentence-image-storage`: 涵蓋 Duolingo 截圖的上傳、本地檔案系統儲存、資料庫 imageUrl 欄位、以及句子卡片中的圖片顯示。
- `sentence-tts`: 涵蓋句子卡片（列表與閃卡）的日文 TTS 發音功能，複用現有 SpeakerButton 元件與 TTS 引擎。

### Modified Capabilities

（無現有 spec 需要修改）

## Impact

- **Database**: `SentenceCard` model 新增 `image_url` nullable 欄位，需要 Prisma migration。
- **API**: 
  - 新增 `POST /api/sentences/upload` 圖片上傳端點。
  - 修改 `POST /api/sentences` 和 `PUT /api/sentences/[id]` 支援 `imageUrl` 欄位。
  - 修改 `GET /api/sentences` 回傳 `imageUrl`。
- **Frontend Components**:
  - `SentenceList.tsx` — 加入圖片縮圖顯示 + SpeakerButton。
  - `SentenceFlashcard.tsx` — 加入 SpeakerButton。
  - `OcrPreview.tsx` / `vocabulary/page.tsx` — 儲存時一併上傳圖片。
- **Hooks**: `useSentences.ts` 的型別與 mutation 需支援 `imageUrl`。
- **Validations**: `sentence.ts` Zod schema 需新增 `imageUrl` 欄位。
- **File System**: 需建立 `public/uploads/sentences/` 目錄，並加入 `.gitkeep`。
- **Dependencies**: 無新增外部依賴（圖片上傳用 Next.js 內建 API route 處理，TTS 複用現有引擎）。
