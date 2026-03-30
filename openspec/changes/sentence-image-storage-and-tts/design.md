## Context

目前 Vocab Hero 的「從圖片匯入」功能流程為：使用者上傳 Duolingo 截圖 → 前端 Tesseract.js OCR 辨識 → Duolingo parser 拆分日英文 → 使用者確認後僅儲存文字到 `SentenceCard` 資料表。圖片在 OCR 處理後即被丟棄（僅以 `URL.createObjectURL` 暫時預覽）。

TTS 發音功能已在單字卡片（`VocabularyCard`）中透過 `SpeakerButton` 元件實作，使用瀏覽器 Web Speech API，但句子卡片（`SentenceList`、`SentenceFlashcard`）尚未整合。

技術棧：Next.js 16 App Router、Prisma + PostgreSQL、TanStack Query、Tailwind CSS 4、Vitest + Playwright。

## Goals / Non-Goals

**Goals:**

- 在 OCR 匯入流程中，將 Duolingo 截圖永久儲存至本地檔案系統
- 在 `SentenceCard` 資料模型中新增 `imageUrl` 欄位
- 在句子列表卡片中顯示來源圖片縮圖
- 在句子列表卡片和閃卡正面加入 TTS 發音按鈕
- 以 BDD 規格驅動需求、TDD 方式實作所有新功能

**Non-Goals:**

- 雲端圖片儲存（S3、Cloudinary 等）— 本次僅用本地檔案系統
- 圖片壓縮、裁切、格式轉換等進階處理
- 閃卡背面（英文翻譯）的 TTS 發音
- 圖片在閃卡學習模式中的顯示
- 圖片的全螢幕/放大檢視功能
- 已存在句子的圖片補傳功能（僅新匯入時儲存）

## Decisions

### Decision 1: 圖片儲存位置 — 本地檔案系統 `public/uploads/sentences/`

**選擇**: 儲存到 Next.js `public/uploads/sentences/` 目錄，以 `{cuid}.{ext}` 命名。

**理由**: 
- 這是個人使用的本地應用，不需要 CDN 或雲端儲存的擴展性
- `public/` 目錄下的檔案可直接透過 URL 存取，無需額外的靜態檔案服務設定
- 不引入新的外部依賴（S3 SDK 等）

**替代方案**:
- *S3/Cloudinary*: 過度設計，增加設定複雜度和費用
- *Database BLOB*: 增加資料庫負擔，不適合圖片儲存
- *Next.js `/tmp` + streaming*: 重啟後遺失，不適合永久儲存

**風險**: `public/` 目錄在 `next build` 時會被複製，大量圖片可能影響建置速度。但個人使用量不大，可接受。

### Decision 2: 圖片上傳 API 設計 — 獨立的 upload 端點

**選擇**: 新增 `POST /api/sentences/upload` 端點，接收 `multipart/form-data`，回傳圖片 URL。句子建立 API 維持 JSON body，透過 `imageUrl` 欄位關聯。

**理由**:
- 分離關注點：圖片上傳與句子建立是兩個獨立操作
- 前端可以在 OCR 處理時就先上傳圖片，不需等到使用者確認儲存
- 維持現有 `POST /api/sentences` 的 JSON 介面不變，向後相容

**替代方案**:
- *合併到 POST /api/sentences 用 multipart*: 破壞現有 API 介面，需要大幅修改前端和測試
- *Base64 編碼嵌入 JSON*: 增加 payload 大小 33%，不適合圖片

### Decision 3: 上傳時機 — OCR 處理階段即上傳

**選擇**: 在 `handleImagesSelected` 中，OCR 處理的同時將圖片上傳到伺服器。上傳成功後，`OcrPreviewItem` 的 `imageUrl` 從 object URL 替換為伺服器 URL。

**理由**:
- 使用者在預覽階段就能看到圖片已被保存
- 若使用者 discard 某張圖片，可呼叫刪除 API 清理已上傳的檔案
- 避免在最終儲存時才上傳，減少使用者等待時間

### Decision 4: TTS 整合 — 直接複用 SpeakerButton

**選擇**: 在 `SentenceList` 和 `SentenceFlashcard` 中直接引入 `SpeakerButton` 元件，傳入 `text={sentence.japanese}`。

**理由**:
- `SpeakerButton` 已封裝完整的 TTS 邏輯（引擎呼叫、loading 狀態、不支援時隱藏）
- 自動使用使用者在設定頁面配置的 TTS 偏好（語速、音量、音調）
- 與 `VocabularyCard` 的實作方式完全一致，維持 UX 一致性

### Decision 5: 資料庫 Migration 策略

**選擇**: 新增 nullable `image_url` 欄位到 `sentence_cards` 資料表。

**理由**:
- Nullable 確保向後相容，既有句子不受影響
- 不需要 data migration，新欄位預設為 `null`
- 未來若需要支援已存在句子的圖片補傳，只需更新該欄位即可

## Risks / Trade-offs

- **[磁碟空間]** → 圖片儲存在本地，長期使用可能佔用大量空間。Mitigation: Duolingo 截圖通常為手機截圖（~200KB-1MB），個人使用量有限。未來可加入清理功能。
- **[孤兒圖片]** → 使用者上傳圖片後 discard 或關閉對話框，圖片已存在磁碟但無對應句子。Mitigation: 在 discard 和對話框關閉時呼叫刪除 API 清理。可考慮定期清理 cron job（non-goal for now）。
- **[public/ 目錄安全性]** → `public/uploads/` 下的檔案可被直接存取。Mitigation: 這是個人應用，無安全風險。若未來需要多用戶支援，需改用認證保護的 API route 提供圖片。
- **[TTS 瀏覽器相容性]** → Web Speech API 在部分瀏覽器不支援日文語音。Mitigation: `SpeakerButton` 已有 `isSupported()` 檢查，不支援時自動隱藏，不影響其他功能。
- **[建置時間]** → `public/uploads/` 中的圖片會被 Next.js build 複製。Mitigation: 可在 `.gitignore` 中排除上傳目錄，僅保留 `.gitkeep`。
