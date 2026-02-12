# Fix /settings/goals "Failed to load goals" Error

## TL;DR

> **Quick Summary**: GET /api/goals 在使用者沒有 DailyGoal 記錄時回傳 404，導致 /settings/goals 頁面顯示 "Failed to load goals"。修復方式：將 `findUnique` 改為 `upsert`，當記錄不存在時自動以預設值建立。
> 
> **Deliverables**:
> - Modified GET handler in `/api/goals` route
> - Updated test file reflecting new behavior
> 
> **Estimated Effort**: Quick
> **Parallel Execution**: NO - sequential (single task)
> **Critical Path**: Task 1 (only task)

---

## Context

### Original Request
使用者造訪 `/settings/goals` 頁面時，會看到 "Failed to load goals" 錯誤訊息。

### Interview Summary
**Key Discussions**:
- **Root cause**: `getDefaultUserId()` 只建立 User，不建立 DailyGoal。GET /api/goals 對不存在的記錄回傳 404。
- **Fix strategy**: 使用者選擇 API 層自動建立（最小範圍修復）
- **Scope**: 僅修 API route + 對應測試，不動 page component、hook 或其他檔案

**Research Findings**:
- `recreateDefaultUserData()` 已有建立 DailyGoal 的邏輯，但未在正常流程中使用
- PUT handler 已使用 `upsert` 模式，GET handler 應保持一致
- DailyGoal 的 `userId` 欄位有 `@unique` 約束
- 預設值在三處一致：schema.prisma、PUT handler、`recreateDefaultUserData()`

### Metis Review
**Identified Gaps** (addressed):
- **Race condition**: 兩個同時的 GET 請求可能都找到 null 並嘗試 create → 使用 `upsert` 解決
- **FK constraint error**: 無效 userId 會導致 500 → 在 catch block 處理 Prisma P2003 錯誤
- **Sister bugs**: `/api/settings` 和 `/api/notification-preferences` 有同樣問題 → 明確標記為 OUT OF SCOPE
- **Persistence verification**: 需要測試 auto-created 記錄確實持久化 → 新增 persistence test

---

## Work Objectives

### Core Objective
修改 GET /api/goals handler，當 DailyGoal 不存在時自動以預設值建立並回傳，消除 "Failed to load goals" 錯誤。

### Concrete Deliverables
- `packages/web/app/api/goals/route.ts` — GET handler 改用 `upsert`
- `packages/web/app/api/goals/route.test.ts` — 更新 404 測試為 200 + 新增 persistence test

### Definition of Done
- [x] `pnpm test packages/web/app/api/goals/route.test.ts` → All tests pass
- [x] `pnpm test --run` → Full suite passes, no regressions

### Must Have
- GET /api/goals 對新使用者回傳 200 + 預設值（而非 404）
- 使用 `upsert` 確保並發安全
- 預設值與 PUT handler 一致：wordsPerDay=10, minutesPerDay=30, reminderTime="10:00", pushEnabled=false
- 所有現有測試繼續通過

### Must NOT Have (Guardrails)
- MUST NOT 修改 PUT handler（已正常運作）
- MUST NOT 修改 `default-user.ts`（不是問題來源）
- MUST NOT 修改 client hook `useDailyGoal.ts`（修復在 API 側）
- MUST NOT 修改 page component `settings/goals/page.tsx`（`!goal` 分支成為 dead code safety fallback）
- MUST NOT 修復 `/api/settings` 或 `/api/notification-preferences`（同樣的 bug，另案處理）
- MUST NOT 新增目前未使用的 import
- MUST NOT 在 upsert 前新增獨立的 User 存在性查詢（透過 catch FK error 處理）

---

## Verification Strategy (MANDATORY)

> **UNIVERSAL RULE: ZERO HUMAN INTERVENTION**
> ALL verification is executed by the agent using tools. No exceptions.

### Test Decision
- **Infrastructure exists**: YES
- **Automated tests**: TDD (Red-Green-Refactor)
- **Framework**: Vitest

### TDD Workflow

**RED**: 修改現有 404 測試為期望 200 + 預設值 → 測試失敗（因 GET handler 仍回 404）
**GREEN**: 修改 GET handler 使用 `upsert` → 測試通過
**REFACTOR**: 檢視程式碼是否需要清理

### Agent-Executed QA Scenarios (MANDATORY)

```
Scenario: Verify /settings/goals page loads without error
  Tool: Bash (curl)
  Preconditions: Dev server running on localhost:3000, default user exists
  Steps:
    1. curl -s http://localhost:3000/api/user/default → Get userId
    2. curl -s -w "\n%{http_code}" "http://localhost:3000/api/goals?userId={userId}"
    3. Assert: HTTP status is 200
    4. Assert: response.success === true
    5. Assert: response.data.wordsPerDay === 10
    6. Assert: response.data.minutesPerDay === 30
    7. Assert: response.data.reminderTime === "10:00"
    8. Assert: response.data.pushEnabled === false
  Expected Result: API returns 200 with default goal values
  Evidence: Response body captured

Scenario: Verify auto-created goal persists
  Tool: Bash (curl)
  Preconditions: Previous scenario completed, same userId
  Steps:
    1. curl -s "http://localhost:3000/api/goals?userId={userId}" → Get id from response
    2. curl -s "http://localhost:3000/api/goals?userId={userId}" → Get id again
    3. Assert: Both responses return same id
  Expected Result: Same record returned on subsequent calls
  Evidence: Response bodies captured

Scenario: Invalid userId returns appropriate error (not 500)
  Tool: Bash (curl)
  Preconditions: Dev server running
  Steps:
    1. curl -s -w "\n%{http_code}" "http://localhost:3000/api/goals?userId=nonexistent-user-id-12345"
    2. Assert: HTTP status is NOT 500
    3. Assert: response.success === false
  Expected Result: Graceful error (404 or 400), not server crash
  Evidence: Response body captured
```

---

## Execution Strategy

### Single Task — No Parallel Execution Needed

This is a single focused task. No dependency matrix required.

---

## TODOs

- [x] 1. Fix GET /api/goals to auto-create DailyGoal with defaults (TDD)

  **What to do**:

  **RED phase** (write/update failing tests first):
  1. Open `packages/web/app/api/goals/route.test.ts`
  2. Modify the test at line 28-37: `'should return 404 when no daily goal exists for user'`
     - Rename to: `'should auto-create and return default daily goal when none exists'`
     - Change assertion from `expect(response.status).toBe(404)` → `expect(response.status).toBe(200)`
     - Change `expect(data.success).toBe(false)` → `expect(data.success).toBe(true)`
     - Add assertions for default values:
       - `expect(data.data.wordsPerDay).toBe(10)`
       - `expect(data.data.minutesPerDay).toBe(30)`
       - `expect(data.data.reminderTime).toBe('10:00')`
       - `expect(data.data.pushEnabled).toBe(false)`
       - `expect(data.data.userId).toBe(testUserId)`
       - `expect(data.data.id).toBeDefined()`
  3. Add a NEW test after the modified one: `'should return the same auto-created goal on subsequent calls'`
     - First GET → capture `data.data.id`
     - Second GET with same userId → capture second `data.data.id`
     - Assert both ids are equal
  4. Run: `pnpm test packages/web/app/api/goals/route.test.ts` → Confirm the modified test FAILS (404 !== 200)

  **GREEN phase** (make tests pass):
  5. Open `packages/web/app/api/goals/route.ts`
  6. Replace the GET handler body (lines 24-30, the `findUnique` + 404 block) with `upsert`:
     ```typescript
     const dailyGoal = await prisma.dailyGoal.upsert({
       where: { userId },
       update: {},
       create: {
         userId,
         wordsPerDay: 10,
         minutesPerDay: 30,
         reminderTime: '10:00',
         pushEnabled: false,
       },
     });
     ```
  7. Remove the `if (!dailyGoal)` null check (lines 28-30) since `upsert` always returns a record
  8. Keep the existing `return successResponse(dailyGoal)` on the next line
  9. Run: `pnpm test packages/web/app/api/goals/route.test.ts` → Confirm ALL tests PASS

  **REFACTOR phase**:
  10. Review the code — ensure the catch block still handles errors gracefully
  11. For FK constraint errors (invalid userId), the existing catch block returns 500. Optionally improve by checking for Prisma error code `P2003` and returning 404 instead. This is a minor improvement — implement only if it doesn't complicate the code significantly.
  12. Run full suite: `pnpm test --run` → Confirm no regressions

  **Must NOT do**:
  - Do NOT modify the PUT handler
  - Do NOT modify `useDailyGoal.ts` or `page.tsx`
  - Do NOT modify `default-user.ts`
  - Do NOT fix `/api/settings` or `/api/notification-preferences` (same bug, separate scope)
  - Do NOT add a separate User existence query before upsert

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Single-file bug fix with well-defined scope, ~25 lines changed across 2 files
  - **Skills**: [`git-master`]
    - `git-master`: For clean atomic commit after fix is verified
  - **Skills Evaluated but Omitted**:
    - `playwright`: Not needed — no browser testing required, curl-based QA is sufficient
    - `frontend-ui-ux`: No UI changes in scope

  **Parallelization**:
  - **Can Run In Parallel**: NO (single task)
  - **Parallel Group**: N/A
  - **Blocks**: None
  - **Blocked By**: None

  **References** (CRITICAL):

  **Pattern References** (existing code to follow):
  - `packages/web/app/api/goals/route.ts:72-82` — PUT handler's `upsert` pattern. **Follow this exact pattern** for the GET handler fix. Note how it structures `where`, `update`, and `create` blocks.
  - `packages/web/app/api/goals/route.ts:24-36` — Current GET handler implementation. **This is what you're replacing.** Lines 24-26 are the `findUnique`, lines 28-30 are the null check returning 404.

  **API/Type References** (contracts to implement against):
  - `packages/web/lib/api/response.ts` — `successResponse()` and `ApiErrors` used in the route
  - `packages/web/prisma/schema.prisma:189-203` — DailyGoal model with default values and `@unique` on `userId`

  **Test References** (testing patterns to follow):
  - `packages/web/app/api/goals/route.test.ts:28-37` — The 404 test to modify → now expects 200 + defaults
  - `packages/web/app/api/goals/route.test.ts:39-63` — Existing "goal exists" test as pattern reference for assertions
  - `packages/web/app/api/goals/route.test.ts:15-26` — `beforeEach` setup: how test user is created (without DailyGoal)
  - `packages/web/tests/setup-db.ts` — `cleanDatabase()` utility used in test setup

  **WHY Each Reference Matters**:
  - PUT handler upsert: Copy this exact pattern to avoid inventing a different approach
  - Schema defaults: Ensure the `create` block in GET matches schema defaults exactly
  - Existing 404 test: This is the test to modify — understand current assertions before changing
  - Test setup: Understand that `beforeEach` creates User without DailyGoal — this is the scenario being tested

  **Acceptance Criteria**:

  **TDD (tests):**
  - [x] Test renamed: `'should auto-create and return default daily goal when none exists'`
  - [x] Test asserts: response.status === 200, data.success === true
  - [x] Test asserts all default values: wordsPerDay=10, minutesPerDay=30, reminderTime="10:00", pushEnabled=false
  - [x] New test added: `'should return the same auto-created goal on subsequent calls'`
  - [x] `pnpm test packages/web/app/api/goals/route.test.ts` → PASS (all tests, 0 failures)
  - [x] `pnpm test --run` → PASS (full suite, no regressions)

  **Agent-Executed QA Scenarios:**

  ```
  Scenario: Full test suite passes
    Tool: Bash
    Preconditions: Database accessible, test env configured
    Steps:
      1. Run: pnpm test packages/web/app/api/goals/route.test.ts
      2. Assert: Exit code 0
      3. Assert: Output contains no failures
      4. Run: pnpm test --run
      5. Assert: Exit code 0
    Expected Result: All tests pass
    Evidence: Terminal output captured

  Scenario: API returns 200 with defaults for new user (via curl on dev server)
    Tool: Bash (curl)
    Preconditions: Dev server running on localhost:3000
    Steps:
      1. curl -s http://localhost:3000/api/user/default | jq .userId
      2. curl -s "http://localhost:3000/api/goals?userId={userId}" | jq .
      3. Assert: .success == true
      4. Assert: .data.wordsPerDay == 10
      5. Assert: .data.minutesPerDay == 30
    Expected Result: 200 response with default goal values
    Evidence: Response body captured in terminal
  ```

  **Evidence to Capture:**
  - [x] Terminal output of `pnpm test packages/web/app/api/goals/route.test.ts`
  - [x] Terminal output of `pnpm test --run`
  - [x] Each evidence file named: task-1-{scenario-slug}.txt

  **Commit**: YES
  - Message: `fix(api): auto-create default DailyGoal in GET /api/goals when none exists`
  - Files: `packages/web/app/api/goals/route.ts`, `packages/web/app/api/goals/route.test.ts`
  - Pre-commit: `pnpm test packages/web/app/api/goals/route.test.ts`

---

## Commit Strategy

| After Task | Message | Files | Verification |
|------------|---------|-------|--------------|
| 1 | `fix(api): auto-create default DailyGoal in GET /api/goals when none exists` | `route.ts`, `route.test.ts` | `pnpm test packages/web/app/api/goals/route.test.ts` |

---

## Success Criteria

### Verification Commands
```bash
# Run specific test file
pnpm test packages/web/app/api/goals/route.test.ts  # Expected: All tests pass

# Run full test suite
pnpm test --run  # Expected: No regressions
```

### Final Checklist
- [x] GET /api/goals returns 200 + default values for users without DailyGoal
- [x] GET /api/goals returns existing DailyGoal when one exists (unchanged behavior)
- [x] GET /api/goals returns 400 when userId missing (unchanged behavior)
- [x] Auto-created goal persists across subsequent GET calls
- [x] PUT handler untouched
- [x] Page component untouched
- [x] Client hook untouched
- [x] All tests pass

### Known Follow-up Items (OUT OF SCOPE)
- `/api/settings` has the same `findUnique` → 404 bug
- `/api/notification-preferences` may have the same bug
- Page component `!goal` branch is now dead code for valid users (harmless safety fallback)
