# Vocab Hero macOS Desktop Packaging

## TL;DR

> **Quick Summary**: 將 Vocab Hero Next.js 16 Web 應用打包為 macOS Electron 桌面應用，同時維護 Web 版。採用 pnpm monorepo 架構，共用核心邏輯，分離平台差異（PostgreSQL vs SQLite、瀏覽器 API vs Electron API）。
>
> **Deliverables**:
>
> - pnpm monorepo 架構 (packages: web, desktop, shared)
> - SQLite 資料庫支援 + seed scripts
> - Electron macOS 桌面應用 (.dmg)
> - Electron 原生通知 (取代 Push Notifications)
> - GitHub Releases + electron-updater 自動更新
>
> **Estimated Effort**: XL (6 phases, ~50+ tasks)
> **Parallel Execution**: YES - 部分 phase 內可並行
> **Critical Path**: Phase 0 (PoC) → Phase 1 (Monorepo) → Phase 2 (DB) → Phase 3 (Electron) → Phase 4 (APIs) → Phase 5 (Packaging)

---

## Context

### Original Request

使用者希望將 Vocab Hero 打包為 macOS 本機桌面應用，不需要開啟瀏覽器即可使用，同時保留 Web 版本。

### Interview Summary

**Key Discussions**:

- **Framework**: Electron 是唯一支援完整 Next.js App Router (SSR, API routes, Server Components) 的桌面框架
- **Architecture**: Monorepo (pnpm workspace) — packages: shared, web, desktop
- **Database**: 單一 Prisma schema + 環境切換 provider (PostgreSQL for web, SQLite for desktop)
- **Distribution**: 公開分發 via GitHub Releases + electron-updater
- **Code Signing**: 延後處理（先不申請 Apple Developer）
- **Browser APIs**: Push Notifications → Electron Notification API; TTS → 不需替換（Chromium 原生支援）
- **Platform**: 只要 macOS
- **Auth**: 不需要（目前未實作）

**Research Findings**:

- 專案有 54 production deps, 11 Prisma models, 28 API routes, 34 custom hooks
- Tauri 不可行（無 Node.js runtime）；Nextron 不推薦（App Router 支援差）
- Prisma 完整支援 SQLite，但需處理 ENUM → String、raw SQL 差異
- Web Speech API、MediaRecorder、Tesseract.js 在 Electron (Chromium) 中都正常運作
- NextAuth 未實作，單用戶 app，簡化了桌面版的設計

### Metis Review

**Identified Gaps** (addressed):

- **Prisma ENUM 問題**: 5 個 PostgreSQL enum 在 SQLite 中不存在，需要 String + Zod validation 替代
- **Raw SQL 問題**: `TRUNCATE TABLE ... CASCADE` 在 2 個檔案中使用，SQLite 不支援
- **TTS 不需替換**: Web Speech API 在 Electron Chromium 中完全支援（從 scope 移除）
- **Hardcoded User ID**: `hooks/useTTSConfig.ts` 中硬編碼的 CUID 在 SQLite 中會不同
- **Port 衝突**: Desktop 和 Web 同時運行會衝突 port 3000
- **Prisma binary**: Electron 打包需要包含 Prisma native binary
- **First-run 體驗**: Desktop 需要初始化 SQLite DB + seed
- **`output: 'standalone'`**: 桌面版必須設定此選項
- **Migration history**: PostgreSQL 和 SQLite 不能共用 migration 歷史
- **`useOnlineStatus`**: Electron 中 `navigator.onLine` 不可靠

---

## Work Objectives

### Core Objective

在保持現有 Web 版完全不受影響的前提下，為 Vocab Hero 新增 Electron macOS 桌面應用支援，採用 monorepo 架構共用核心程式碼。

### Concrete Deliverables

- `packages/web/` — 現有 Web 版（PostgreSQL）
- `packages/desktop/` — Electron 桌面版（SQLite）
- `packages/shared/` — 共用邏輯（Zod schemas, utils, types）
- macOS .dmg 安裝包
- GitHub Releases 自動更新機制

### Definition of Done

- [ ] Web 版所有現有測試通過（zero regression）
- [ ] Desktop 版可從 .dmg 安裝並啟動
- [ ] Desktop 版所有核心功能運作（單字學習、復習、進度追蹤）
- [ ] Desktop 版通知功能正常
- [ ] electron-updater 可從 GitHub Releases 檢查更新

### Must Have

- Monorepo 架構 (pnpm workspace)
- SQLite 支援 + seed script
- Electron shell (BrowserWindow + menu)
- 原生通知替代 Push Notifications
- .dmg 打包
- 隨機 port 分配（避免衝突）
- First-run 初始化流程

### Must NOT Have (Guardrails)

- ❌ 不替換 TTS engine（Web Speech API 在 Electron 中正常運作）
- ❌ 不替換 AudioRecorder（MediaRecorder 在 Electron 中正常運作）
- ❌ 不替換 Tesseract.js OCR（正常運作）
- ❌ 不啟用 `nodeIntegration: true`（安全風險）
- ❌ 不停用 `contextIsolation`（安全風險）
- ❌ 不支援 Windows / Linux
- ❌ 不在第一版實作 code signing / notarization
- ❌ 不將 React components 或 hooks 抽到 shared package
- ❌ 不建立 repository/adapter pattern for database
- ❌ 不共用 Prisma migration history between providers
- ❌ 不新增 tray icon, global shortcuts, Touch Bar
- ❌ 不要 AI slop：不過度抽象、不過度 validation、不加不必要的 JSDoc

---

## Verification Strategy (MANDATORY)

> **UNIVERSAL RULE: ZERO HUMAN INTERVENTION**
>
> ALL tasks in this plan MUST be verifiable WITHOUT any human action.

### Test Decision

- **Infrastructure exists**: YES
- **Automated tests**: TDD (per AGENTS.md requirement)
- **Framework**: Vitest 4 + Playwright 1.57 + React Testing Library

### Agent-Executed QA Scenarios (MANDATORY — ALL tasks)

**Verification Tool by Deliverable Type:**

| Type                   | Tool                       | How Agent Verifies                            |
| ---------------------- | -------------------------- | --------------------------------------------- |
| **Monorepo structure** | Bash (pnpm, ls)            | Verify workspace config, package resolution   |
| **Database**           | Bash (prisma, tsx)         | Generate client, push schema, run seed, query |
| **Electron app**       | Playwright Electron + Bash | Launch app, verify window, test features      |
| **API routes**         | Bash (curl)                | Send requests, assert responses               |
| **Packaging**          | Bash (electron-builder)    | Build DMG, verify file exists and size        |

---

## Execution Strategy

### Parallel Execution Waves

```
Phase 0 — Spike/PoC (MUST complete first, de-risks entire project):
└── Task 0: Validate Next.js standalone + Electron integration

Phase 1 — Monorepo Migration (Sequential, high-risk):
├── Task 1: Initialize pnpm workspace
├── Task 2: Move existing code to packages/web
├── Task 3: Create packages/shared with Zod schemas & types
└── Task 4: Verify zero regressions (full test suite)

Phase 2 — Database Abstraction (After Phase 1):
├── Wave 2a (parallel):
│   ├── Task 5: Create SQLite-compatible Prisma schema
│   └── Task 6: Replace ENUM imports with string literals + Zod
├── Wave 2b (after 2a):
│   ├── Task 7: Replace raw SQL (TRUNCATE → DELETE)
│   ├── Task 8: Fix hardcoded user ID in useTTSConfig
│   └── Task 9: Create desktop seed script
└── Task 10: Integration test — full CRUD on SQLite

Phase 3 — Electron Shell (After Phase 2):
├── Task 11: Electron main process + preload script
├── Task 12: Next.js standalone integration (random port)
├── Task 13: First-run initialization flow (DB creation + seed)
├── Task 14: Basic macOS menu bar
└── Task 15: Dev workflow (next dev + electron)

Phase 4 — Platform API Replacements (After Phase 3):
├── Wave 4a (parallel):
│   ├── Task 16: Electron Notification API (replace push)
│   ├── Task 17: Platform-aware useOnlineStatus
│   └── Task 18: Electron microphone permission handling
└── Task 19: Verify all browser APIs work in Electron

Phase 5 — Packaging & Distribution (After Phase 4):
├── Task 20: electron-builder config for macOS DMG
├── Task 21: Prisma binary + WASM bundling (asarUnpack)
├── Task 22: electron-updater + GitHub Releases
└── Task 23: Final integration test — install from DMG and verify
```

### Dependency Matrix

| Task | Depends On         | Blocks          | Can Parallelize With |
| ---- | ------------------ | --------------- | -------------------- |
| 0    | None               | 1-23 (go/no-go) | None                 |
| 1    | 0                  | 2               | None                 |
| 2    | 1                  | 3, 4            | None                 |
| 3    | 2                  | 5, 6            | None                 |
| 4    | 2, 3               | 5               | None                 |
| 5    | 4                  | 7, 9, 10        | 6                    |
| 6    | 4                  | 7, 10           | 5                    |
| 7    | 5, 6               | 10              | 8, 9                 |
| 8    | 4                  | 10              | 7, 9                 |
| 9    | 5                  | 10, 13          | 7, 8                 |
| 10   | 7, 8, 9            | 11              | None                 |
| 11   | 10                 | 12, 13, 14      | None                 |
| 12   | 11                 | 15, 16-19       | 13, 14               |
| 13   | 9, 11              | 19              | 12, 14               |
| 14   | 11                 | 19              | 12, 13               |
| 15   | 12                 | None            | 16-18                |
| 16   | 12                 | 19              | 17, 18               |
| 17   | 12                 | 19              | 16, 18               |
| 18   | 12                 | 19              | 16, 17               |
| 19   | 13, 14, 16, 17, 18 | 20              | None                 |
| 20   | 19                 | 21, 23          | None                 |
| 21   | 20                 | 23              | 22                   |
| 22   | 20                 | 23              | 21                   |
| 23   | 21, 22             | None            | None                 |

### Agent Dispatch Summary

| Phase | Tasks | Recommended Agents                                                          |
| ----- | ----- | --------------------------------------------------------------------------- |
| 0     | 0     | task(category="deep", load_skills=[], ...) — PoC spike                      |
| 1     | 1-4   | task(category="unspecified-high", load_skills=[], ...) — monorepo migration |
| 2     | 5-10  | task(category="unspecified-high", load_skills=[], ...) — database           |
| 3     | 11-15 | task(category="deep", load_skills=[], ...) — Electron                       |
| 4     | 16-19 | task(category="unspecified-low", load_skills=[], ...)                       |
| 5     | 20-23 | task(category="unspecified-high", load_skills=[], ...) — packaging          |

---

## TODOs

### Phase 0: Spike / Proof of Concept

- [x] 0. Validate Next.js 16 Standalone + Electron PoC

  **What to do**:
  - 在專案根目錄建立一個臨時 `spike/` 目錄
  - 建立最小 Next.js 16 App Router app with `output: 'standalone'`
  - 安裝 Electron，建立 main process 啟動 standalone server
  - 驗證 BrowserWindow 載入 Next.js 頁面
  - 驗證 API route 可以正常呼叫
  - 驗證 `next-intl` 的 message JSON 被包含在 standalone output
  - 測試完成後刪除 `spike/` 目錄
  - 記錄發現的問題和解決方案到 `.sisyphus/evidence/phase0-findings.md`

  **Must NOT do**:
  - 不要在 spike 中使用完整的 Vocab Hero code
  - 不要花時間美化 spike

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: 需要深度研究和問題排解，spike 可能遇到未預期的問題
  - **Skills**: []
  - **Skills Evaluated but Omitted**:
    - `playwright`: PoC 階段不需要瀏覽器自動化測試

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential (Phase 0 gate)
  - **Blocks**: ALL subsequent tasks (go/no-go gate)
  - **Blocked By**: None

  **References**:

  **Pattern References**:
  - `next.config.ts` — 現有 Next.js 配置，需要加入 `output: 'standalone'`
  - `lib/db/prisma.ts` — Prisma singleton pattern，了解目前的 DB 連接方式

  **Documentation References**:
  - Next.js standalone output: https://nextjs.org/docs/app/api-reference/config/next-config-js/output
  - Electron quick start: https://www.electronjs.org/docs/latest/tutorial/quick-start

  **Acceptance Criteria**:

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: Next.js standalone build completes
    Tool: Bash
    Preconditions: spike/ directory with minimal Next.js app
    Steps:
      1. cd spike && pnpm build
      2. Assert: .next/standalone/server.js exists
      3. Assert: exit code 0
    Expected Result: Standalone server bundle created
    Evidence: Build output captured

  Scenario: Electron loads Next.js standalone page
    Tool: Bash
    Preconditions: Standalone build complete, Electron installed
    Steps:
      1. Start standalone server: node .next/standalone/server.js &
      2. Wait for: "Ready on http://localhost:3000" (timeout: 15s)
      3. curl -s http://localhost:3000 | grep -c "<html"
      4. Assert: count >= 1 (HTML page returned)
      5. Kill server process
    Expected Result: Next.js serves pages from standalone output
    Evidence: curl response body saved

  Scenario: API route works in standalone mode
    Tool: Bash
    Preconditions: Standalone server running
    Steps:
      1. curl -s http://localhost:3000/api/health
      2. Assert: HTTP 200
      3. Assert: response contains expected JSON
    Expected Result: API routes functional in standalone mode
    Evidence: Response body captured
  ```

  **Commit**: NO (spike is throwaway, will be deleted)

---

### Phase 1: Monorepo Migration

- [x] 1. Initialize pnpm Workspace Configuration

  **What to do**:
  - 建立 `pnpm-workspace.yaml` 定義 workspace packages
  - 建立 `packages/` 目錄結構: `packages/web/`, `packages/desktop/`, `packages/shared/`
  - 更新根目錄 `package.json` 設定 workspace scripts
  - 設定 TypeScript project references (tsconfig paths)
  - 確認 pnpm workspace resolution 正確

  **Must NOT do**:
  - 不要移動任何現有檔案（下一個 task 處理）
  - 不要安裝新的依賴

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: 需要對 monorepo 架構有深入理解
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential
  - **Blocks**: Task 2
  - **Blocked By**: Task 0

  **References**:

  **Pattern References**:
  - `package.json` — 現有依賴和 scripts，需要保留並重新組織
  - `tsconfig.json` — 現有 TypeScript 配置

  **Documentation References**:
  - pnpm workspaces: https://pnpm.io/workspaces

  **Acceptance Criteria**:

  ```
  Scenario: Workspace configuration is valid
    Tool: Bash
    Steps:
      1. cat pnpm-workspace.yaml
      2. Assert: contains "packages/web", "packages/desktop", "packages/shared"
      3. pnpm -r list --depth 0
      4. Assert: lists all 3 packages without errors
    Expected Result: pnpm recognizes all workspace packages
    Evidence: pnpm list output captured
  ```

  **Commit**: YES
  - Message: `build(monorepo): initialize pnpm workspace structure`
  - Files: `pnpm-workspace.yaml, package.json, packages/*/package.json, tsconfig.json`

---

- [ ] 2. Move Existing Code to packages/web

  **What to do**:
  - 使用 `git mv` 將所有現有原始碼移到 `packages/web/`
  - 移動的目錄: `app/`, `components/`, `hooks/`, `lib/`, `prisma/`, `tests/`, `e2e/`, `public/`, `i18n/`, `messages/`
  - 移動設定檔: `next.config.ts`, `postcss.config.mjs`, `tailwind.config.ts` (如存在), `vitest.config.mts`, `playwright.config.ts`, `.env*`
  - 更新 `packages/web/package.json` with 所有現有依賴
  - 更新所有 import paths 中的 `@/*` alias 確保正常運作
  - 更新 `packages/web/tsconfig.json` paths
  - 執行 `pnpm install` 重新連結依賴

  **Must NOT do**:
  - 不要改變任何程式碼邏輯
  - 不要重命名任何檔案（除了移動路徑）
  - 不要移除任何依賴

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: 大量檔案操作，需要確保零遺漏
  - **Skills**: [`git-master`]
    - `git-master`: 使用 git mv 保留完整 git 歷史

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential
  - **Blocks**: Tasks 3, 4
  - **Blocked By**: Task 1

  **References**:

  **Pattern References**:
  - `tsconfig.json` — 現有 path aliases (`@/*`)
  - `vitest.config.mts` — 測試路徑配置
  - `playwright.config.ts` — E2E 測試配置

  **Acceptance Criteria**:

  ```
  Scenario: Web package builds successfully
    Tool: Bash
    Steps:
      1. cd packages/web && pnpm build
      2. Assert: exit code 0
      3. Assert: .next/ directory exists
    Expected Result: Next.js build succeeds in new location
    Evidence: Build output captured

  Scenario: All import paths resolve
    Tool: Bash
    Steps:
      1. cd packages/web && pnpm tsc --noEmit
      2. Assert: exit code 0, zero type errors
    Expected Result: TypeScript compilation succeeds
    Evidence: tsc output captured

  Scenario: Dev server starts
    Tool: Bash
    Steps:
      1. cd packages/web && pnpm dev &
      2. Wait for "Ready" in stdout (timeout: 30s)
      3. curl -s http://localhost:3000 | grep -c "<html"
      4. Assert: count >= 1
      5. Kill dev server
    Expected Result: Dev server starts and serves pages
    Evidence: curl response captured
  ```

  **Commit**: YES
  - Message: `refactor(monorepo): move existing code to packages/web`
  - Files: `packages/web/**`
  - Pre-commit: `cd packages/web && pnpm tsc --noEmit`

---

- [ ] 3. Create packages/shared with Zod Schemas & Types

  **What to do**:
  - 建立 `packages/shared/package.json` 和 `packages/shared/tsconfig.json`
  - 從 Prisma enums 建立對應的 Zod schemas 和 TypeScript 型別:
    - `StudyMode`, `QuizType`, `NotificationType`, `NotificationPriority`, `ThemePreference`
  - 建立共用的 validation schemas (Zod) for API request/response
  - 建立共用的 utility functions (SM-2 演算法等純函數)
  - 建立平台檢測 utility: `isElectron()` / `isWeb()`
  - 在 `packages/web/` 中將 Prisma enum imports 改為使用 shared package 的 Zod constants

  **Must NOT do**:
  - 不要將 React components 或 hooks 放入 shared
  - 不要建立 repository pattern 或 adapter pattern
  - 不要過度抽象 — 只抽取確實兩個平台都會用的東西

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: 涉及跨 package 的型別設計
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential (after Task 2)
  - **Blocks**: Tasks 5, 6
  - **Blocked By**: Task 2

  **References**:

  **Pattern References**:
  - `prisma/schema.prisma` — 5 個 enum 定義需要轉換為 Zod schemas
  - `lib/srs/sm2.ts` — SM-2 演算法，純函數適合放入 shared
  - `lib/api/response.ts` — API response pattern

  **API/Type References**:
  - `@prisma/client` — 生成的 enum types 需要被 shared 的 Zod types 取代

  **External References**:
  - Zod docs: https://zod.dev/?id=enums

  **Acceptance Criteria**:

  ```
  Scenario: Shared package builds and exports correctly
    Tool: Bash
    Steps:
      1. cd packages/shared && pnpm build (or tsc --noEmit)
      2. Assert: exit code 0
      3. Verify exports: StudyMode, QuizType, NotificationType, etc.
    Expected Result: Shared package compiles with all exports
    Evidence: tsc output

  Scenario: Web package uses shared types successfully
    Tool: Bash
    Steps:
      1. cd packages/web && pnpm tsc --noEmit
      2. Assert: exit code 0
      3. grep -r "from '@vocab-hero/shared'" packages/web/
      4. Assert: imports found in relevant files
    Expected Result: Web package imports from shared without errors
    Evidence: grep output
  ```

  **Commit**: YES
  - Message: `feat(shared): add shared Zod schemas, types, and utilities`
  - Files: `packages/shared/**`

---

- [ ] 4. Verify Zero Regressions — Full Test Suite

  **What to do**:
  - 執行 `packages/web/` 的完整 Vitest test suite
  - 執行 `packages/web/` 的完整 Playwright E2E test suite
  - 比對測試結果與 monorepo 遷移前的 pass/fail 數量
  - 修復任何因遷移造成的測試失敗
  - 記錄測試結果到 `.sisyphus/evidence/phase1-test-results.md`

  **Must NOT do**:
  - 不要跳過任何失敗的測試
  - 不要修改測試邏輯（除非是路徑相關的修復）

  **Recommended Agent Profile**:
  - **Category**: `unspecified-low`
    - Reason: 主要是執行測試和修復路徑問題
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential (gate for Phase 2)
  - **Blocks**: Task 5
  - **Blocked By**: Tasks 2, 3

  **References**:

  **Pattern References**:
  - `vitest.config.mts` — 測試配置
  - `playwright.config.ts` — E2E 配置
  - `tests/setup.ts` — 測試設定

  **Acceptance Criteria**:

  ```
  Scenario: All unit tests pass
    Tool: Bash
    Steps:
      1. cd packages/web && pnpm test --run
      2. Assert: exit code 0
      3. Assert: pass count matches pre-migration count
    Expected Result: Zero test regressions
    Evidence: Test output captured to .sisyphus/evidence/phase1-test-results.md

  Scenario: All E2E tests pass
    Tool: Bash
    Steps:
      1. cd packages/web && pnpm test:e2e
      2. Assert: exit code 0
    Expected Result: E2E tests pass in monorepo structure
    Evidence: Playwright report captured
  ```

  **Commit**: YES (if fixes needed)
  - Message: `fix(web): resolve test path issues after monorepo migration`

---

### Phase 2: Database Abstraction

- [ ] 5. Create SQLite-Compatible Prisma Schema for Desktop

  **What to do**:
  - 在 `packages/desktop/prisma/` 建立 `schema.prisma`，provider 設為 `sqlite`
  - 將所有 5 個 enum (`StudyMode`, `QuizType`, `NotificationType`, `NotificationPriority`, `ThemePreference`) 改為 String fields
  - 處理型別差異:
    - PostgreSQL enum → String (with `@default("FLASHCARD")` etc.)
    - DateTime fields 保持不變（Prisma 處理 SQLite 日期序列化）
    - 保持 `@id @default(cuid())` — cuid 在 SQLite 中正常運作
  - 設定 `binaryTargets = ["native", "darwin-arm64"]` in generator
  - 設定 SQLite connection string: `file:${app.getPath('userData')}/vocab-hero.db`（暫用相對路徑開發）
  - 執行 `prisma db push` 驗證 schema 正確
  - 確認隱式多對多關聯 (`_VocabularyGroupToVocabularyItem`) 在 SQLite 中正常

  **Must NOT do**:
  - 不要修改 `packages/web/prisma/schema.prisma`（PostgreSQL version 不動）
  - 不要共用 migration history
  - 不要建立 adapter pattern

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: 需要仔細處理 schema 差異
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2a (with Task 6)
  - **Blocks**: Tasks 7, 9, 10
  - **Blocked By**: Task 4

  **References**:

  **Pattern References**:
  - `prisma/schema.prisma` — 完整的 PostgreSQL schema (311 lines, 11 models, 5 enums)
  - `lib/db/prisma.ts` — Prisma singleton pattern

  **Documentation References**:
  - Prisma SQLite reference: https://www.prisma.io/docs/orm/overview/databases/sqlite
  - Prisma binary targets: https://www.prisma.io/docs/orm/reference/prisma-schema-reference#binarytargets

  **Acceptance Criteria**:

  ```
  Scenario: SQLite schema pushes successfully
    Tool: Bash
    Steps:
      1. cd packages/desktop && DATABASE_URL="file:./test.db" npx prisma db push --force-reset
      2. Assert: exit code 0
      3. Assert: test.db file exists
    Expected Result: SQLite database created from schema
    Evidence: prisma db push output

  Scenario: Basic CRUD works on SQLite
    Tool: Bash
    Steps:
      1. DATABASE_URL="file:./test.db" npx tsx -e "
         const { PrismaClient } = require('./node_modules/.prisma/client');
         const prisma = new PrismaClient();
         const user = await prisma.user.create({ data: { name: 'Test User', email: 'test@test.com' } });
         console.log('Created:', user.id);
         const found = await prisma.user.findUnique({ where: { id: user.id } });
         console.log('Found:', found ? 'YES' : 'NO');
         await prisma.$disconnect();"
      2. Assert: "Created:" and "Found: YES" in output
    Expected Result: CRUD operations work on SQLite
    Evidence: Script output captured

  Scenario: Many-to-many relation works
    Tool: Bash
    Steps:
      1. Create VocabularyItem, create VocabularyGroup, connect them
      2. Query VocabularyGroup with items
      3. Assert: connected item returned
    Expected Result: Implicit M:N relation works in SQLite
    Evidence: Query output
  ```

  **Commit**: YES
  - Message: `feat(desktop): add SQLite-compatible Prisma schema`
  - Files: `packages/desktop/prisma/schema.prisma`

---

- [ ] 6. Replace Prisma ENUM Imports with String Literals + Zod Validation

  **What to do**:
  - 使用 `ast_grep_search` 找出所有從 `@prisma/client` import enum 的位置
  - 將所有 `import { StudyMode, ... } from '@prisma/client'` 改為從 `@vocab-hero/shared` import
  - 更新所有使用 enum 值的地方（例如 `StudyMode.FLASHCARD` → `'FLASHCARD'` 或 shared constants）
  - 在 API routes 中加入 Zod validation 確保 string 值的正確性
  - 確認 TypeScript 型別推斷正確

  **Must NOT do**:
  - 不要改變 API 的行為或回傳值
  - 不要加入不必要的 validation（只在接收外部輸入時驗證）

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: 需要全專案搜尋和批量修改
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2a (with Task 5)
  - **Blocks**: Tasks 7, 10
  - **Blocked By**: Task 4

  **References**:

  **Pattern References**:
  - `packages/shared/` — Zod enum schemas (from Task 3)
  - `app/api/settings/route.ts` — 使用 StudyMode/ThemePreference enum 的 API route 範例

  **Tool References**:
  - Use `ast_grep_search` pattern: `import { $$$, StudyMode, $$$ } from '@prisma/client'`
  - Use `lsp_find_references` on each enum to find all usages

  **Acceptance Criteria**:

  ```
  Scenario: No direct Prisma enum imports remain
    Tool: Bash
    Steps:
      1. grep -r "import.*StudyMode.*from.*@prisma/client" packages/web/
      2. grep -r "import.*QuizType.*from.*@prisma/client" packages/web/
      3. grep -r "import.*NotificationType.*from.*@prisma/client" packages/web/
      4. Assert: zero matches for all enum imports
    Expected Result: All enum imports use shared package
    Evidence: grep output (empty = pass)

  Scenario: TypeScript still compiles
    Tool: Bash
    Steps:
      1. cd packages/web && pnpm tsc --noEmit
      2. Assert: exit code 0
    Expected Result: No type errors after enum replacement
    Evidence: tsc output
  ```

  **Commit**: YES
  - Message: `refactor(web): replace Prisma enum imports with shared Zod constants`
  - Files: All files that imported Prisma enums

---

- [ ] 7. Replace Raw SQL (TRUNCATE → Provider-Aware DELETE)

  **What to do**:
  - 修改 `app/api/data/delete-all/route.ts`:
    - 將 `TRUNCATE TABLE ... RESTART IDENTITY CASCADE` 替換為按照 FK 依賴順序的 `DELETE FROM` statements
    - 使用 Prisma `$transaction` 包裝多個 delete
  - 修改 `tests/setup-db.ts`:
    - 同樣替換 TRUNCATE 為 DELETE
  - 確保刪除順序正確（先刪子表，後刪父表），遵守 FK 約束

  **Must NOT do**:
  - 不要改變 API endpoint 的行為（仍然刪除所有資料）
  - 不要使用 `prisma.$executeRaw` 新的 raw SQL（用 Prisma client 的 `deleteMany`）

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 只有 2 個檔案需要修改
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2b (with Tasks 8, 9)
  - **Blocks**: Task 10
  - **Blocked By**: Tasks 5, 6

  **References**:

  **Pattern References**:
  - `app/api/data/delete-all/route.ts` — 需要修改的 API route
  - `tests/setup-db.ts` — 需要修改的測試設定
  - `prisma/schema.prisma` — FK 關聯順序（確定刪除順序）

  **Acceptance Criteria**:

  ```
  Scenario: Delete-all works on PostgreSQL
    Tool: Bash
    Steps:
      1. cd packages/web && curl -X DELETE http://localhost:3000/api/data/delete-all
      2. Assert: HTTP 200
      3. Assert: response contains success indication
    Expected Result: Data deletion works on PostgreSQL
    Evidence: Response body

  Scenario: No raw SQL remains
    Tool: Bash
    Steps:
      1. grep -r "TRUNCATE" packages/web/app/ packages/web/tests/
      2. Assert: zero matches
    Expected Result: All raw SQL replaced
    Evidence: grep output (empty)
  ```

  **Commit**: YES
  - Message: `fix(db): replace TRUNCATE with provider-agnostic deleteMany`
  - Files: `packages/web/app/api/data/delete-all/route.ts`, `packages/web/tests/setup-db.ts`

---

- [ ] 8. Fix Hardcoded User ID in useTTSConfig

  **What to do**:
  - 修改 `hooks/useTTSConfig.ts`:
    - 移除 `const DEFAULT_USER_ID = 'cmjod038p00008o9qathx7chz'`
    - 改為動態查詢預設使用者 ID（例如透過 API 或 context）
  - 搜尋專案中是否有其他硬編碼的 CUID
  - 建立取得當前使用者的機制（單用戶 app 可用最簡方案）

  **Must NOT do**:
  - 不要引入複雜的 auth/session 機制
  - 不要改變 TTS 功能的行為

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 單一 hook 修改
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2b (with Tasks 7, 9)
  - **Blocks**: Task 10
  - **Blocked By**: Task 4

  **References**:

  **Pattern References**:
  - `hooks/useTTSConfig.ts:5` — 硬編碼的 `DEFAULT_USER_ID`
  - Other hooks that reference user context — 了解現有 user resolution pattern

  **Acceptance Criteria**:

  ```
  Scenario: No hardcoded CUIDs in codebase
    Tool: Bash
    Steps:
      1. grep -rn "cmjod038p00008" packages/
      2. Assert: zero matches
    Expected Result: Hardcoded user ID removed
    Evidence: grep output (empty)

  Scenario: TTS config still works
    Tool: Bash
    Steps:
      1. cd packages/web && pnpm tsc --noEmit
      2. Assert: exit code 0
    Expected Result: TypeScript compiles after refactor
    Evidence: tsc output
  ```

  **Commit**: YES
  - Message: `fix(tts): remove hardcoded user ID, use dynamic user resolution`
  - Files: `packages/web/hooks/useTTSConfig.ts`

---

- [ ] 9. Create Desktop Seed Script

  **What to do**:
  - 在 `packages/desktop/prisma/seed.ts` 建立 seed script
  - Seed 內容:
    - 預設使用者（單用戶 app）
    - 預設 UserSettings, DailyGoal, UserStreak
    - NotificationPreference
    - 範例 VocabularyGroup + VocabularyItems (用於 demo/testing)
  - 確保 seed 使用 string 值（非 Prisma enum）for StudyMode 等
  - 設定 `packages/desktop/package.json` 的 `prisma.seed` 指令

  **Must NOT do**:
  - 不要 seed 大量資料（保持輕量）
  - 不要硬編碼特定的 CUID（讓 Prisma 自動生成）

  **Recommended Agent Profile**:
  - **Category**: `unspecified-low`
    - Reason: 直接的 seed 腳本撰寫
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2b (with Tasks 7, 8)
  - **Blocks**: Tasks 10, 13
  - **Blocked By**: Task 5

  **References**:

  **Pattern References**:
  - `prisma/seed.ts` — 現有的 PostgreSQL seed script（如果存在）
  - `prisma/schema.prisma` — Model 定義，了解必填欄位和預設值

  **Acceptance Criteria**:

  ```
  Scenario: Seed runs successfully on SQLite
    Tool: Bash
    Steps:
      1. cd packages/desktop
      2. DATABASE_URL="file:./test.db" npx prisma db push --force-reset
      3. DATABASE_URL="file:./test.db" npx prisma db seed
      4. Assert: exit code 0
      5. Verify: user, settings, vocabulary group exist via Prisma query
    Expected Result: Seed populates all required tables
    Evidence: Seed output + query results
  ```

  **Commit**: YES
  - Message: `feat(desktop): add SQLite seed script with default data`
  - Files: `packages/desktop/prisma/seed.ts`

---

- [ ] 10. Integration Test — Full CRUD on SQLite

  **What to do**:
  - 撰寫整合測試驗證所有 11 個 Prisma model 的 CRUD 在 SQLite 上正常
  - 特別測試:
    - DateTime 欄位的排序和篩選
    - Many-to-many 關聯 (VocabularyGroup ↔ VocabularyItem)
    - Cascade delete (ExampleSentence → VocabularyItem)
    - 唯一約束 (ReviewSchedule.vocabularyItemId, ProgressLog.userId+date)
    - String enum 值的正確性
  - 測試 SQLite WAL mode 設定
  - 記錄結果到 `.sisyphus/evidence/phase2-sqlite-tests.md`

  **Must NOT do**:
  - 不要測試 PostgreSQL（那是 web package 的事）

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: 全面的整合測試
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential (gate for Phase 3)
  - **Blocks**: Task 11
  - **Blocked By**: Tasks 7, 8, 9

  **References**:

  **Pattern References**:
  - `tests/setup-db.ts` — 現有測試 DB 設定 pattern
  - `prisma/schema.prisma` — 所有 model 定義和關聯

  **Acceptance Criteria**:

  ```
  Scenario: All 11 models CRUD works on SQLite
    Tool: Bash
    Steps:
      1. Run integration test suite targeting SQLite
      2. Assert: all tests pass
      3. Assert: DateTime ordering correct
      4. Assert: cascade delete works
      5. Assert: unique constraints enforced
    Expected Result: Full Prisma compatibility on SQLite verified
    Evidence: Test output to .sisyphus/evidence/phase2-sqlite-tests.md
  ```

  **Commit**: YES
  - Message: `test(desktop): add SQLite integration tests for all models`

---

### Phase 3: Electron Shell

- [ ] 11. Electron Main Process + Preload Script

  **What to do**:
  - 在 `packages/desktop/` 安裝 Electron 依賴: `electron`, `electron-builder`
  - 建立 `packages/desktop/electron/main.ts`:
    - Electron app 生命週期管理 (ready, window-all-closed, activate)
    - `BrowserWindow` 建立（`nodeIntegration: false`, `contextIsolation: true`）
    - Preload script 載入
  - 建立 `packages/desktop/electron/preload.ts`:
    - 使用 `contextBridge.exposeInMainWorld` 暴露安全的 API
    - 暴露: `platform` info, `notification` API, `app.getPath` 結果
  - 設定 Electron security best practices:
    - CSP headers
    - Permission request handler (for microphone)
    - 禁用 remote module

  **Must NOT do**:
  - 不要啟用 `nodeIntegration`
  - 不要停用 `contextIsolation`
  - 不要加入 tray icon 或 global shortcuts

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: Electron 安全配置需要深度理解
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential
  - **Blocks**: Tasks 12, 13, 14
  - **Blocked By**: Task 10

  **References**:

  **Documentation References**:
  - Electron security: https://www.electronjs.org/docs/latest/tutorial/security
  - Electron BrowserWindow: https://www.electronjs.org/docs/latest/api/browser-window
  - contextBridge: https://www.electronjs.org/docs/latest/api/context-bridge

  **Acceptance Criteria**:

  ```
  Scenario: Electron window opens
    Tool: Bash
    Steps:
      1. cd packages/desktop && npx electron .
      2. Assert: window opens (process doesn't crash within 5s)
      3. Assert: no security warnings in console
    Expected Result: Electron app starts with secure config
    Evidence: Console output captured

  Scenario: Security settings enforced
    Tool: Bash
    Steps:
      1. grep "nodeIntegration" packages/desktop/electron/main.ts
      2. Assert: nodeIntegration is false
      3. grep "contextIsolation" packages/desktop/electron/main.ts
      4. Assert: contextIsolation is true
    Expected Result: Security best practices in code
    Evidence: grep output
  ```

  **Commit**: YES
  - Message: `feat(desktop): add Electron main process with security best practices`
  - Files: `packages/desktop/electron/main.ts`, `packages/desktop/electron/preload.ts`, `packages/desktop/package.json`

---

- [ ] 12. Next.js Standalone Integration (Random Port)

  **What to do**:
  - 在 `packages/desktop/next.config.ts` 設定 `output: 'standalone'`
  - 修改 Electron main process:
    - Build 時: 使用 standalone output
    - Dev 時: 啟動 `next dev` 子進程
    - 偵測可用 port（避免 3000 衝突），使用 `net.createServer` 找空 port
    - 啟動 standalone server (`node .next/standalone/server.js`)
    - 等待 server ready 後 `loadURL('http://localhost:PORT')`
  - 處理 `next-intl` message files 的 standalone bundling:
    - 確認 `messages/en.json`, `messages/zh-TW.json` 被包含
    - 如果 standalone 沒有包含，手動 copy
  - 處理 Next.js Image optimization:
    - 設定 `images: { unoptimized: true }` 或 custom loader
  - 處理 server 關閉時的 cleanup

  **Must NOT do**:
  - 不要使用固定 port
  - 不要跳過 `next-intl` message file 的驗證

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: Next.js standalone + Electron 整合需要深度除錯
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 13, 14 — but 13 and 14 also depend on 11)
  - **Blocks**: Tasks 15, 16-19
  - **Blocked By**: Task 11

  **References**:

  **Pattern References**:
  - Phase 0 PoC findings: `.sisyphus/evidence/phase0-findings.md`
  - `next.config.ts` — 現有配置 (bundle analyzer + next-intl)
  - `i18n/request.ts` — i18n 配置
  - `messages/en.json`, `messages/zh-TW.json` — i18n messages

  **Documentation References**:
  - Next.js standalone: https://nextjs.org/docs/app/api-reference/config/next-config-js/output
  - Next.js custom server: https://nextjs.org/docs/app/building-your-application/configuring/custom-server

  **Acceptance Criteria**:

  ```
  Scenario: Standalone build includes i18n messages
    Tool: Bash
    Steps:
      1. cd packages/desktop && pnpm build
      2. ls .next/standalone/messages/
      3. Assert: en.json and zh-TW.json exist
    Expected Result: i18n files bundled in standalone
    Evidence: ls output

  Scenario: App runs on random port (not 3000)
    Tool: Bash
    Steps:
      1. Start another process on port 3000 (simulate conflict)
      2. Launch Electron app
      3. Assert: app starts on different port
      4. curl the detected port → Assert: HTML returned
    Expected Result: Port conflict handled gracefully
    Evidence: Console logs showing port selection

  Scenario: Next.js pages load in Electron
    Tool: Playwright (Electron testing)
    Steps:
      1. Launch Electron app
      2. Wait for main window (timeout: 15s)
      3. Assert: page title contains "Vocab Hero"
      4. Navigate to vocabulary page
      5. Assert: page renders without errors
    Expected Result: Full Next.js app running in Electron
    Evidence: .sisyphus/evidence/task-12-nextjs-in-electron.png
  ```

  **Commit**: YES
  - Message: `feat(desktop): integrate Next.js standalone with Electron + random port`
  - Files: `packages/desktop/next.config.ts`, `packages/desktop/electron/main.ts`

---

- [ ] 13. First-Run Initialization Flow

  **What to do**:
  - 在 Electron main process 中實作 first-run 檢測:
    - 檢查 `app.getPath('userData')` 中是否存在 `vocab-hero.db`
    - 如果不存在: 建立 DB → push schema → 執行 seed
    - 如果存在: 直接啟動（未來可以加 migration check）
  - 設定 `DATABASE_URL` 環境變數指向 `app.getPath('userData')/vocab-hero.db`
  - 在 Electron 啟動時設定 SQLite WAL mode (`PRAGMA journal_mode=WAL`)
  - 顯示初始化進度（loading 畫面或 splash screen）

  **Must NOT do**:
  - 不要在 renderer process 中直接存取 database
  - 不要 hardcode database 路徑

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: 需要處理多種 edge cases (first run, DB exists, DB corrupt)
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Task 12)
  - **Blocks**: Task 19
  - **Blocked By**: Tasks 9, 11

  **References**:

  **Pattern References**:
  - `packages/desktop/prisma/seed.ts` — seed script (from Task 9)
  - `packages/desktop/prisma/schema.prisma` — SQLite schema (from Task 5)

  **Documentation References**:
  - Electron app.getPath: https://www.electronjs.org/docs/latest/api/app#appgetpathname

  **Acceptance Criteria**:

  ```
  Scenario: First run creates database and seeds data
    Tool: Bash
    Steps:
      1. Remove any existing vocab-hero.db from userData path
      2. Launch Electron app
      3. Wait for app ready (timeout: 30s)
      4. Assert: vocab-hero.db exists in userData path
      5. Query: SELECT count(*) FROM User → Assert: >= 1
    Expected Result: DB created and seeded on first launch
    Evidence: DB file exists, query result

  Scenario: Subsequent launch skips initialization
    Tool: Bash
    Steps:
      1. Launch Electron app (DB already exists)
      2. Measure: startup time
      3. Assert: app ready within 10s (no re-seed)
    Expected Result: Fast startup when DB exists
    Evidence: Timing output
  ```

  **Commit**: YES
  - Message: `feat(desktop): add first-run database initialization flow`

---

- [ ] 14. Basic macOS Menu Bar

  **What to do**:
  - 建立 macOS 原生 menu bar:
    - App menu: About, Preferences, Quit
    - Edit menu: Undo, Redo, Cut, Copy, Paste, Select All
    - View menu: Reload, Toggle DevTools (dev only), Full Screen
    - Window menu: Minimize, Close
    - Help menu: Learn More (link to GitHub)
  - 使用 Electron `Menu.buildFromTemplate()`
  - 確保標準 macOS keyboard shortcuts 正常運作 (⌘C, ⌘V, ⌘Q 等)

  **Must NOT do**:
  - 不要加入自訂的複雜功能
  - 不要加入 tray icon

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 標準的 Electron menu setup
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 12, 13)
  - **Blocks**: Task 19
  - **Blocked By**: Task 11

  **References**:

  **Documentation References**:
  - Electron Menu: https://www.electronjs.org/docs/latest/api/menu

  **Acceptance Criteria**:

  ```
  Scenario: Menu bar has all standard items
    Tool: Playwright (Electron)
    Steps:
      1. Launch Electron app
      2. Inspect menu bar items
      3. Assert: App, Edit, View, Window, Help menus exist
      4. Assert: Cmd+Q quits the app
    Expected Result: Standard macOS menu bar
    Evidence: Screenshot of menu
  ```

  **Commit**: YES
  - Message: `feat(desktop): add standard macOS menu bar`

---

- [ ] 15. Development Workflow (next dev + Electron)

  **What to do**:
  - 設定 `packages/desktop/package.json` scripts:
    - `dev`: 同時啟動 `next dev` + `electron .`（使用 `concurrently`）
    - `build`: `next build` → `electron-builder`
    - `start`: Production mode launch
  - 確保 hot reload (HMR) 在 Electron 中正常運作
  - 設定 electron 的 dev mode 偵測（使用 `electron-is-dev` 或環境變數）
  - 在 dev mode 中自動開啟 DevTools

  **Must NOT do**:
  - 不要在 production build 中開啟 DevTools

  **Recommended Agent Profile**:
  - **Category**: `unspecified-low`
    - Reason: Script 配置
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential (after Task 12)
  - **Blocks**: None
  - **Blocked By**: Task 12

  **References**:

  **Documentation References**:
  - concurrently: https://www.npmjs.com/package/concurrently
  - electron-is-dev: https://www.npmjs.com/package/electron-is-dev

  **Acceptance Criteria**:

  ```
  Scenario: Dev mode starts with HMR
    Tool: Bash
    Steps:
      1. cd packages/desktop && pnpm dev
      2. Wait for Electron window (timeout: 30s)
      3. Modify a React component file
      4. Assert: change reflected in Electron window without restart
    Expected Result: Hot reload works in Electron dev mode
    Evidence: Console output showing HMR
  ```

  **Commit**: YES
  - Message: `feat(desktop): add dev workflow with HMR support`

---

### Phase 4: Platform API Replacements

- [ ] 16. Electron Notification API (Replace Push Notifications)

  **What to do**:
  - 建立 `packages/desktop/lib/notifications/electron-notifications.ts`:
    - 使用 Electron `Notification` API 取代 Service Worker push notifications
    - 實作: 顯示通知、點擊通知的 callback
  - 建立平台抽象層（或條件 import）:
    - Web: 使用現有的 Service Worker push
    - Desktop: 使用 Electron Notification
  - 透過 preload script 暴露 notification API 給 renderer
  - 移除 desktop 版中的 Service Worker 相關代碼（`sw.js` registration）

  **Must NOT do**:
  - 不要加入 notification scheduling（簡單的即時通知即可）
  - 不要加入 badge count
  - 不要修改 web 版的 push notification 邏輯

  **Recommended Agent Profile**:
  - **Category**: `unspecified-low`
    - Reason: 直接的 API 替換
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4a (with Tasks 17, 18)
  - **Blocks**: Task 19
  - **Blocked By**: Task 12

  **References**:

  **Pattern References**:
  - `lib/push-notifications/service-worker.ts` — 現有 push notification 實作
  - `packages/desktop/electron/preload.ts` — 預載腳本（暴露 API）

  **Documentation References**:
  - Electron Notification: https://www.electronjs.org/docs/latest/api/notification

  **Acceptance Criteria**:

  ```
  Scenario: Desktop notification displays
    Tool: Playwright (Electron)
    Steps:
      1. Launch Electron app
      2. Trigger a notification (e.g., goal achieved)
      3. Assert: macOS notification appeared (via Electron Notification mock/spy)
    Expected Result: Native macOS notification shown
    Evidence: Test output with notification assertion

  Scenario: No Service Worker registration in desktop
    Tool: Bash
    Steps:
      1. grep -r "serviceWorker.register" packages/desktop/
      2. Assert: zero matches (or properly guarded by platform check)
    Expected Result: SW not registered in Electron
    Evidence: grep output
  ```

  **Commit**: YES
  - Message: `feat(desktop): replace push notifications with Electron Notification API`

---

- [ ] 17. Platform-Aware useOnlineStatus

  **What to do**:
  - 修改 `hooks/useOnlineStatus.ts`:
    - 在 Electron 中: 使用 Electron 的 `net.isOnline()` 或回傳 `true`（桌面 app 通常假設在線）
    - 在 Web 中: 保持現有的 `navigator.onLine` 邏輯
  - 使用平台檢測 (`isElectron()` from shared) 選擇實作

  **Must NOT do**:
  - 不要建立複雜的 network monitoring
  - 不要改變 web 版行為

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 單一 hook 修改
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4a (with Tasks 16, 18)
  - **Blocks**: Task 19
  - **Blocked By**: Task 12

  **References**:

  **Pattern References**:
  - `hooks/useOnlineStatus.ts` — 現有實作
  - `packages/shared/` — `isElectron()` utility (from Task 3)

  **Acceptance Criteria**:

  ```
  Scenario: Online status works in desktop
    Tool: Bash
    Steps:
      1. cd packages/web && pnpm tsc --noEmit
      2. Assert: exit code 0
    Expected Result: Hook compiles for both platforms
    Evidence: tsc output
  ```

  **Commit**: YES
  - Message: `fix(hooks): make useOnlineStatus platform-aware for Electron`

---

- [ ] 18. Electron Microphone Permission Handling

  **What to do**:
  - 在 Electron main process 中設定 `session.setPermissionRequestHandler`:
    - 允許 `media` 權限（for AudioRecorder / microphone access）
    - 拒絕其他不必要的權限
  - 確保 `navigator.mediaDevices.getUserMedia` 在 Electron 中正常運作
  - 處理 macOS 系統級麥克風權限 prompt

  **Must NOT do**:
  - 不要自動授權所有權限（只允許 media）

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 單一設定修改
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4a (with Tasks 16, 17)
  - **Blocks**: Task 19
  - **Blocked By**: Task 12

  **References**:

  **Pattern References**:
  - `lib/audio/recorder.ts` — 現有的 AudioRecorder 實作
  - `packages/desktop/electron/main.ts` — Electron main process

  **Documentation References**:
  - Electron permissions: https://www.electronjs.org/docs/latest/api/session#sespermissionrequesthandler

  **Acceptance Criteria**:

  ```
  Scenario: Microphone permission is handled
    Tool: Bash
    Steps:
      1. grep "setPermissionRequestHandler" packages/desktop/electron/main.ts
      2. Assert: handler exists and allows 'media' permission
    Expected Result: Permission handler configured
    Evidence: grep output
  ```

  **Commit**: YES
  - Message: `feat(desktop): add Electron microphone permission handling`

---

- [ ] 19. Verify All Browser APIs in Electron — Full Integration Test

  **What to do**:
  - 在 Electron 中啟動完整 app，逐一測試所有功能:
    - 單字瀏覽 + CRUD
    - 學習模式 (Flashcard, Multiple Choice, etc.)
    - TTS 語音朗讀
    - OCR 圖片辨識
    - 通知功能
    - 進度追蹤和統計圖表
    - 設定頁面（主題切換、語言切換）
    - 匯入/匯出（CSV/備份）
  - 記錄所有通過/失敗的功能
  - 修復發現的問題

  **Must NOT do**:
  - 不要跳過任何功能的測試

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: 全面整合測試，可能發現多種問題
  - **Skills**: [`playwright`]
    - `playwright`: 自動化 Electron 測試

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential (gate for Phase 5)
  - **Blocks**: Task 20
  - **Blocked By**: Tasks 13, 14, 16, 17, 18

  **References**:

  **Pattern References**:
  - `e2e/` — 24 個現有 E2E 測試可作為參考

  **Documentation References**:
  - Playwright Electron: https://playwright.dev/docs/api/class-electron

  **Acceptance Criteria**:

  ```
  Scenario: Core vocabulary CRUD works
    Tool: Playwright (Electron)
    Steps:
      1. Launch Electron app
      2. Navigate to vocabulary page
      3. Create new vocabulary item (word: "テスト", reading: "てすと", meaning: "test")
      4. Assert: item appears in list
      5. Edit item
      6. Assert: changes saved
      7. Delete item
      8. Assert: item removed
    Expected Result: Full CRUD cycle works
    Evidence: .sisyphus/evidence/task-19-crud.png

  Scenario: TTS works in Electron
    Tool: Playwright (Electron)
    Steps:
      1. Navigate to vocabulary page
      2. Click TTS button on a vocabulary item
      3. Assert: no JavaScript errors in console
      4. Assert: speechSynthesis API was called (spy/mock)
    Expected Result: TTS functions without errors
    Evidence: Console output captured

  Scenario: Theme switching works
    Tool: Playwright (Electron)
    Steps:
      1. Navigate to settings
      2. Switch theme to dark
      3. Assert: body has dark theme class
      4. Switch back to light
      5. Assert: body has light theme class
    Expected Result: Theme persists in Electron
    Evidence: .sisyphus/evidence/task-19-theme.png

  Scenario: i18n language switching works
    Tool: Playwright (Electron)
    Steps:
      1. Navigate to settings
      2. Switch language to zh-TW
      3. Assert: UI text in Traditional Chinese
      4. Switch to en
      5. Assert: UI text in English
    Expected Result: Language switching works in Electron
    Evidence: .sisyphus/evidence/task-19-i18n.png
  ```

  **Commit**: YES (if fixes needed)
  - Message: `fix(desktop): resolve integration issues found in full Electron testing`

---

### Phase 5: Packaging & Distribution

- [ ] 20. electron-builder Configuration for macOS DMG

  **What to do**:
  - 安裝 `electron-builder` 和相關依賴
  - 建立 `packages/desktop/electron-builder.yml` (或 package.json config):
    - Target: `dmg` (macOS)
    - App ID: `com.vocab-hero.desktop`
    - App name: "Vocab Hero"
    - App icon: `.icns` format for macOS
    - Category: `public.app-category.education`
    - Files to include/exclude
  - 建立 app icon (.icns)
  - 設定 `afterSign` hook placeholder (for future code signing)
  - 測試 build 並驗證 .dmg 產出

  **Must NOT do**:
  - 不要配置 code signing（延後）
  - 不要配置 Windows/Linux targets

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: electron-builder 配置有很多細節
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential
  - **Blocks**: Tasks 21, 23
  - **Blocked By**: Task 19

  **References**:

  **Documentation References**:
  - electron-builder docs: https://www.electron.build/
  - electron-builder macOS config: https://www.electron.build/mac

  **Acceptance Criteria**:

  ```
  Scenario: DMG is built successfully
    Tool: Bash
    Steps:
      1. cd packages/desktop && pnpm build && pnpm electron:build
      2. ls dist/*.dmg
      3. Assert: .dmg file exists
      4. Assert: file size > 100MB (contains Electron + Next.js)
    Expected Result: macOS DMG installer created
    Evidence: ls -la output of dist/

  Scenario: DMG can be mounted and app runs
    Tool: Bash
    Steps:
      1. hdiutil attach dist/Vocab-Hero-*.dmg
      2. ls /Volumes/Vocab-Hero/
      3. Assert: "Vocab Hero.app" exists
      4. open "/Volumes/Vocab-Hero/Vocab Hero.app"
      5. Wait 15s
      6. Assert: app process running (ps aux | grep Electron)
      7. hdiutil detach /Volumes/Vocab-Hero
    Expected Result: App installs and runs from DMG
    Evidence: Process list output
  ```

  **Commit**: YES
  - Message: `feat(desktop): add electron-builder config for macOS DMG`

---

- [ ] 21. Prisma Binary + WASM Bundling (asarUnpack)

  **What to do**:
  - 配置 electron-builder 的 `asarUnpack` 包含:
    - Prisma query engine binary (`node_modules/.prisma/client/libquery_engine-*`)
    - Prisma schema file
    - Tesseract.js WASM files (如果打包進 app)
  - 驗證打包後的 app 中 Prisma client 能正常連接 SQLite
  - 驗證 Tesseract.js WASM 初始化正常

  **Must NOT do**:
  - 不要 unpack 所有 node_modules（會增加體積）

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Prisma binary bundling 是常見的 Electron 陷阱
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 5 (with Task 22)
  - **Blocks**: Task 23
  - **Blocked By**: Task 20

  **References**:

  **Documentation References**:
  - electron-builder asarUnpack: https://www.electron.build/configuration#Configuration-asarUnpack
  - Prisma with Electron: https://www.prisma.io/docs/orm/prisma-client/deployment/bundlers

  **Acceptance Criteria**:

  ```
  Scenario: Prisma works in packaged app
    Tool: Bash
    Steps:
      1. Build and package the app
      2. Launch packaged app (not dev mode)
      3. Verify database operations work (create a vocabulary item)
    Expected Result: Prisma query engine loads in packaged Electron
    Evidence: App functional test output

  Scenario: Tesseract.js WASM loads in packaged app
    Tool: Bash
    Steps:
      1. Launch packaged app
      2. Navigate to OCR feature
      3. Attempt OCR on a test image
      4. Assert: no WASM loading errors
    Expected Result: WASM files accessible in packaged app
    Evidence: Console output
  ```

  **Commit**: YES
  - Message: `fix(desktop): configure asarUnpack for Prisma and WASM binaries`

---

- [ ] 22. electron-updater + GitHub Releases Configuration

  **What to do**:
  - 安裝 `electron-updater`
  - 在 Electron main process 中配置 auto-update:
    - Check for updates on app startup
    - 通知使用者有新版本
    - 下載和安裝更新
  - 配置 electron-builder `publish` 設定指向 GitHub Releases
  - 建立 GitHub Actions workflow for automated releases (或手動流程文件)
  - 在 main process 中處理 update events:
    - `checking-for-update`
    - `update-available`
    - `update-downloaded`
    - `error`

  **Must NOT do**:
  - 不要自動重啟 app（讓使用者選擇）
  - 不要在 development mode 中 check updates

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Auto-update 配置較複雜
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 5 (with Task 21)
  - **Blocks**: Task 23
  - **Blocked By**: Task 20

  **References**:

  **Documentation References**:
  - electron-updater: https://www.electron.build/auto-update
  - GitHub Releases: https://docs.github.com/en/repositories/releasing-projects-on-github

  **Acceptance Criteria**:

  ```
  Scenario: Update check code exists and is configured
    Tool: Bash
    Steps:
      1. grep -r "autoUpdater" packages/desktop/electron/
      2. Assert: autoUpdater imported and configured
      3. grep "publish" packages/desktop/electron-builder.yml
      4. Assert: GitHub provider configured
    Expected Result: Auto-update infrastructure in place
    Evidence: grep output

  Scenario: Update check doesn't crash in dev mode
    Tool: Bash
    Steps:
      1. cd packages/desktop && pnpm dev
      2. Wait 15s
      3. Assert: no crash (update check should be skipped in dev)
    Expected Result: Dev mode handles missing updates gracefully
    Evidence: Console output
  ```

  **Commit**: YES
  - Message: `feat(desktop): add electron-updater for GitHub Releases auto-update`

---

- [ ] 23. Final Integration Test — Install from DMG and Verify

  **What to do**:
  - 完整的 end-to-end 驗證:
    1. 從零開始 build DMG
    2. 安裝到 /Applications
    3. First-run: 驗證 DB 初始化和 seed
    4. 測試所有核心功能
    5. 驗證 auto-update 檢查（即使沒有實際更新）
    6. 測試 quit 和重新啟動
  - 記錄完整的測試報告到 `.sisyphus/evidence/final-integration-report.md`
  - 列出已知限制和 future work items

  **Must NOT do**:
  - 不要跳過任何功能測試

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: 最終驗收測試
  - **Skills**: [`playwright`]
    - `playwright`: Electron 自動化測試

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential (final task)
  - **Blocks**: None (project complete)
  - **Blocked By**: Tasks 21, 22

  **References**:

  **All previous tasks' evidence files**

  **Acceptance Criteria**:

  ```
  Scenario: Full install-from-scratch experience
    Tool: Bash + Playwright (Electron)
    Steps:
      1. cd packages/desktop && pnpm build && pnpm electron:build
      2. hdiutil attach dist/Vocab-Hero-*.dmg
      3. cp -r "/Volumes/Vocab-Hero/Vocab Hero.app" /Applications/
      4. hdiutil detach /Volumes/Vocab-Hero
      5. open "/Applications/Vocab Hero.app"
      6. Wait for app ready (timeout: 30s)
      7. Assert: first-run initialization completed
      8. Test: Create vocabulary → Study → Review → Check progress
      9. Test: TTS, theme switch, language switch
      10. Test: Export/backup
      11. Quit app → Relaunch → Assert: data persisted
    Expected Result: Complete user journey works from fresh install
    Evidence: .sisyphus/evidence/final-integration-report.md

  Scenario: App quits cleanly
    Tool: Bash
    Steps:
      1. Launch app
      2. Send SIGTERM or Cmd+Q
      3. Assert: process exits with code 0
      4. Assert: no zombie processes
    Expected Result: Clean shutdown
    Evidence: Process list output
  ```

  **Commit**: YES
  - Message: `test(desktop): add final integration test suite`

---

## Commit Strategy

| After Task(s) | Message                                                                    | Key Files                                  |
| ------------- | -------------------------------------------------------------------------- | ------------------------------------------ |
| 1             | `build(monorepo): initialize pnpm workspace structure`                     | `pnpm-workspace.yaml`, root `package.json` |
| 2             | `refactor(monorepo): move existing code to packages/web`                   | `packages/web/**`                          |
| 3             | `feat(shared): add shared Zod schemas, types, and utilities`               | `packages/shared/**`                       |
| 4             | `fix(web): resolve test path issues after monorepo migration`              | Test config files                          |
| 5             | `feat(desktop): add SQLite-compatible Prisma schema`                       | `packages/desktop/prisma/`                 |
| 6             | `refactor(web): replace Prisma enum imports with shared Zod constants`     | Multiple source files                      |
| 7             | `fix(db): replace TRUNCATE with provider-agnostic deleteMany`              | 2 files                                    |
| 8             | `fix(tts): remove hardcoded user ID, use dynamic user resolution`          | 1 hook file                                |
| 9             | `feat(desktop): add SQLite seed script with default data`                  | `packages/desktop/prisma/seed.ts`          |
| 10            | `test(desktop): add SQLite integration tests for all models`               | Test files                                 |
| 11            | `feat(desktop): add Electron main process with security best practices`    | `packages/desktop/electron/`               |
| 12            | `feat(desktop): integrate Next.js standalone with Electron + random port`  | Electron + Next config                     |
| 13            | `feat(desktop): add first-run database initialization flow`                | Electron main process                      |
| 14            | `feat(desktop): add standard macOS menu bar`                               | Electron main process                      |
| 15            | `feat(desktop): add dev workflow with HMR support`                         | `package.json` scripts                     |
| 16            | `feat(desktop): replace push notifications with Electron Notification API` | Notification files                         |
| 17            | `fix(hooks): make useOnlineStatus platform-aware for Electron`             | 1 hook file                                |
| 18            | `feat(desktop): add Electron microphone permission handling`               | Electron main process                      |
| 19            | `fix(desktop): resolve integration issues found in full Electron testing`  | Various                                    |
| 20            | `feat(desktop): add electron-builder config for macOS DMG`                 | Build config                               |
| 21            | `fix(desktop): configure asarUnpack for Prisma and WASM binaries`          | Build config                               |
| 22            | `feat(desktop): add electron-updater for GitHub Releases auto-update`      | Auto-update files                          |
| 23            | `test(desktop): add final integration test suite`                          | Test files + report                        |

---

## Success Criteria

### Verification Commands

```bash
# Phase 1: Web still works
cd packages/web && pnpm build && pnpm test --run  # Expected: all pass

# Phase 2: SQLite database works
cd packages/desktop && DATABASE_URL="file:./test.db" npx prisma db push  # Expected: exit 0

# Phase 3: Electron app launches
cd packages/desktop && pnpm dev  # Expected: Electron window with Vocab Hero

# Phase 5: DMG builds
cd packages/desktop && pnpm electron:build  # Expected: dist/*.dmg exists
```

### Final Checklist

- [ ] All Web "Must Have" present (zero regression)
- [ ] All Desktop "Must Have" present (all core features work)
- [ ] All "Must NOT Have" absent (no security violations, no scope creep)
- [ ] All unit tests pass (both packages)
- [ ] DMG installs and runs on clean macOS
- [ ] Auto-update infrastructure configured
- [ ] .sisyphus/evidence/ contains all test reports
