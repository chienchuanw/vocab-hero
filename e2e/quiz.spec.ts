import { test, expect } from '@playwright/test';

/**
 * Quiz E2E Tests
 * 測試 Quiz 模式的完整流程
 */

test.describe('Quiz Mode', () => {
  test.beforeEach(async ({ page }) => {
    // 前往 Quiz 頁面
    await page.goto('/study/quiz');
  });

  test('should display quiz configuration form', async ({ page }) => {
    // 檢查頁面標題
    await expect(page.getByRole('heading', { name: /quiz mode/i })).toBeVisible();

    // 檢查配置表單元素
    await expect(page.getByText(/select group/i)).toBeVisible();
    await expect(page.getByText(/number of questions/i)).toBeVisible();
    await expect(page.getByText(/question type/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /start quiz/i })).toBeVisible();
  });

  test('should require group selection before starting quiz', async ({ page }) => {
    // 嘗試在未選擇 Group 的情況下開始測驗
    const startButton = page.getByRole('button', { name: /start quiz/i });

    // 按鈕應該被禁用
    await expect(startButton).toBeDisabled();
  });

  test('should allow changing question count', async ({ page }) => {
    // 找到題數輸入框
    const questionCountInput = page.getByLabel(/number of questions/i);

    // 檢查預設值
    await expect(questionCountInput).toHaveValue('10');

    // 修改題數
    await questionCountInput.fill('15');
    await expect(questionCountInput).toHaveValue('15');
  });

  test.skip('should complete full quiz flow', async ({ page }) => {
    // 此測試需要實際的資料庫資料，暫時跳過
    // TODO: 設置測試資料後啟用此測試

    // 1. 選擇 Group
    // await page.selectOption('select[name="group"]', 'test-group-id');

    // 2. 設置題數
    // await page.fill('input[name="questionCount"]', '5');

    // 3. 開始測驗
    // await page.click('button:has-text("Start Quiz")');

    // 4. 回答所有題目
    // for (let i = 0; i < 5; i++) {
    //   await page.click('button:has-text("Option 1")');
    //   await page.waitForTimeout(2000); // 等待自動前往下一題
    // }

    // 5. 檢查結果頁面
    // await expect(page.getByText(/quiz complete/i)).toBeVisible();
    // await expect(page.getByText(/score:/i)).toBeVisible();
    // await expect(page.getByText(/accuracy:/i)).toBeVisible();
  });

  test.skip('should display quiz summary after completion', async ({ page }) => {
    // 此測試需要實際的資料庫資料，暫時跳過
    // TODO: 設置測試資料後啟用此測試

    // 完成測驗後應該顯示摘要
    // await expect(page.getByRole('heading', { name: /quiz complete/i })).toBeVisible();

    // 應該顯示統計資訊
    // await expect(page.getByText(/correct/i)).toBeVisible();
    // await expect(page.getByText(/incorrect/i)).toBeVisible();
    // await expect(page.getByText(/accuracy/i)).toBeVisible();

    // 應該顯示答題詳情
    // await expect(page.getByText(/review answers/i)).toBeVisible();

    // 應該有重新開始和退出按鈕
    // await expect(page.getByRole('button', { name: /try again/i })).toBeVisible();
    // await expect(page.getByRole('button', { name: /back to study/i })).toBeVisible();
  });

  test.skip('should allow restarting quiz from summary', async ({ page }) => {
    // 此測試需要實際的資料庫資料，暫時跳過
    // TODO: 設置測試資料後啟用此測試

    // 在摘要頁面點擊重新開始
    // await page.click('button:has-text("Try Again")');

    // 應該回到配置頁面
    // await expect(page.getByRole('heading', { name: /quiz mode/i })).toBeVisible();
  });

  test.skip('should navigate back to study page from summary', async ({ page }) => {
    // 此測試需要實際的資料庫資料，暫時跳過
    // TODO: 設置測試資料後啟用此測試

    // 在摘要頁面點擊返回
    // await page.click('button:has-text("Back to Study")');

    // 應該導航到學習頁面
    // await expect(page).toHaveURL('/study');
  });

  test.skip('should exit quiz during session', async ({ page }) => {
    // 此測試需要實際的資料庫資料，暫時跳過
    // TODO: 設置測試資料後啟用此測試

    // 在測驗進行中點擊退出
    // await page.click('button:has-text("Exit Quiz")');

    // 應該導航到學習頁面
    // await expect(page).toHaveURL('/study');
  });
});

