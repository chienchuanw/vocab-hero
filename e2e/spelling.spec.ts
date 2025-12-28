import { test, expect } from '@playwright/test';

/**
 * Spelling Quiz E2E Tests
 * 測試拼寫測驗的完整流程
 */

test.describe('Spelling Quiz', () => {
  test.beforeEach(async ({ page }) => {
    // 前往 Spelling Quiz 頁面
    await page.goto('/study/spelling');
  });

  test('should display spelling quiz page', async ({ page }) => {
    // 檢查頁面標題
    await expect(page.getByRole('heading', { name: /spelling quiz/i })).toBeVisible();

    // 檢查描述文字
    await expect(page.getByText(/type the reading/i)).toBeVisible();

    // 檢查返回按鈕
    await expect(page.getByRole('button', { name: /back to study/i })).toBeVisible();
  });

  test('should navigate back to study page', async ({ page }) => {
    // 點擊返回按鈕
    await page.click('button:has-text("Back to Study")');

    // 應該導航到學習頁面
    await expect(page).toHaveURL('/study');
  });

  test.skip('should display spelling input component', async ({ page }) => {
    // 此測試需要實際的資料庫資料，暫時跳過
    // TODO: 設置測試資料後啟用此測試

    // 應該顯示單字
    // await expect(page.getByText('勉強')).toBeVisible();

    // 應該顯示意思
    // await expect(page.getByText('study')).toBeVisible();

    // 應該有輸入框
    // await expect(page.getByRole('textbox')).toBeVisible();

    // 應該有提交按鈕
    // await expect(page.getByRole('button', { name: /check answer/i })).toBeVisible();
  });

  test.skip('should allow typing Japanese characters', async ({ page }) => {
    // 此測試需要實際的資料庫資料，暫時跳過
    // TODO: 設置測試資料後啟用此測試

    // const input = page.getByRole('textbox');

    // 輸入日文
    // await input.fill('べんきょう');

    // 檢查輸入值
    // await expect(input).toHaveValue('べんきょう');
  });

  test.skip('should show hint when hint button is clicked', async ({ page }) => {
    // 此測試需要實際的資料庫資料，暫時跳過
    // TODO: 設置測試資料後啟用此測試

    // 點擊提示按鈕
    // await page.click('button:has-text("Show Hint")');

    // 應該顯示提示
    // await expect(page.getByText(/hint:/i)).toBeVisible();
    // await expect(page.getByText(/starts with/i)).toBeVisible();
  });

  test.skip('should validate correct answer', async ({ page }) => {
    // 此測試需要實際的資料庫資料，暫時跳過
    // TODO: 設置測試資料後啟用此測試

    // const input = page.getByRole('textbox');

    // 輸入正確答案
    // await input.fill('べんきょう');

    // 提交答案
    // await page.click('button:has-text("Check Answer")');

    // 應該顯示正確反饋
    // await expect(page.getByText(/correct/i)).toBeVisible();
    // await expect(page.getByText('✓')).toBeVisible();
  });

  test.skip('should validate incorrect answer', async ({ page }) => {
    // 此測試需要實際的資料庫資料，暫時跳過
    // TODO: 設置測試資料後啟用此測試

    // const input = page.getByRole('textbox');

    // 輸入錯誤答案
    // await input.fill('べんきよう');

    // 提交答案
    // await page.click('button:has-text("Check Answer")');

    // 應該顯示錯誤反饋
    // await expect(page.getByText(/incorrect/i)).toBeVisible();
    // await expect(page.getByText('✗')).toBeVisible();

    // 應該顯示正確答案
    // await expect(page.getByText(/correct answer:/i)).toBeVisible();
  });

  test.skip('should accept katakana for hiragana answer', async ({ page }) => {
    // 此測試需要實際的資料庫資料，暫時跳過
    // TODO: 設置測試資料後啟用此測試

    // const input = page.getByRole('textbox');

    // 輸入片假名（正確答案是平假名）
    // await input.fill('ベンキョウ');

    // 提交答案
    // await page.click('button:has-text("Check Answer")');

    // 應該接受為正確答案
    // await expect(page.getByText(/correct/i)).toBeVisible();
  });

  test.skip('should show character-level feedback for incorrect answer', async ({ page }) => {
    // 此測試需要實際的資料庫資料，暫時跳過
    // TODO: 設置測試資料後啟用此測試

    // const input = page.getByRole('textbox');

    // 輸入部分錯誤的答案
    // await input.fill('べんきよう');

    // 提交答案
    // await page.click('button:has-text("Check Answer")');

    // 應該顯示字元級別反饋
    // await expect(page.getByText(/character-by-character feedback/i)).toBeVisible();

    // 應該顯示正確和錯誤的字元
    // await expect(page.getByText('✓')).toBeVisible(); // 正確的字元
    // await expect(page.getByText('✗')).toBeVisible(); // 錯誤的字元
  });

  test.skip('should clear input after submission', async ({ page }) => {
    // 此測試需要實際的資料庫資料，暫時跳過
    // TODO: 設置測試資料後啟用此測試

    // const input = page.getByRole('textbox');

    // 輸入答案
    // await input.fill('べんきょう');

    // 提交答案
    // await page.click('button:has-text("Check Answer")');

    // 輸入框應該被清空（如果進入下一題）
    // 或者被禁用（如果停留在當前題）
  });
});

