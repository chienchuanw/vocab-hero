import { test, expect } from '@playwright/test';

test.describe('Random Quiz', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/study/random');
  });

  test('should display quiz configuration page', async ({ page }) => {
    // 檢查標題
    await expect(page.getByRole('heading', { name: 'Random Quiz' })).toBeVisible();

    // 檢查配置表單
    await expect(page.getByText('Configure Your Quiz')).toBeVisible();
    await expect(page.getByText('Number of Questions')).toBeVisible();
    await expect(page.getByText('Difficulty Level')).toBeVisible();

    // 檢查開始按鈕
    await expect(page.getByRole('button', { name: 'Start Quiz' })).toBeVisible();
  });

  test('should allow selecting question count', async ({ page }) => {
    // 點擊題數選擇器
    await page.getByRole('combobox', { name: /number of questions/i }).click();

    // 檢查選項
    await expect(page.getByRole('option', { name: '5 questions' })).toBeVisible();
    await expect(page.getByRole('option', { name: '10 questions' })).toBeVisible();
    await expect(page.getByRole('option', { name: '15 questions' })).toBeVisible();
    await expect(page.getByRole('option', { name: '20 questions' })).toBeVisible();

    // 選擇 5 題
    await page.getByRole('option', { name: '5 questions' }).click();
  });

  test('should allow selecting difficulty level', async ({ page }) => {
    // 點擊難度選擇器
    await page.getByRole('combobox', { name: /difficulty level/i }).click();

    // 檢查選項
    await expect(page.getByRole('option', { name: 'All Levels (Mixed)' })).toBeVisible();
    await expect(page.getByRole('option', { name: 'Easy' })).toBeVisible();
    await expect(page.getByRole('option', { name: 'Medium' })).toBeVisible();
    await expect(page.getByRole('option', { name: 'Hard' })).toBeVisible();

    // 選擇 Easy
    await page.getByRole('option', { name: 'Easy' }).click();
  });

  test('should start quiz with selected configuration', async ({ page }) => {
    // 選擇 5 題
    await page.getByRole('combobox', { name: /number of questions/i }).click();
    await page.getByRole('option', { name: '5 questions' }).click();

    // 點擊開始
    await page.getByRole('button', { name: 'Start Quiz' }).click();

    // 檢查是否進入測驗頁面
    await expect(page.getByText('Question 1 of 5')).toBeVisible();
  });

  test('should display quiz progress', async ({ page }) => {
    // 開始測驗
    await page.getByRole('button', { name: 'Start Quiz' }).click();

    // 檢查進度指示
    await expect(page.getByText(/Question \d+ of \d+/)).toBeVisible();
  });

  test('should display mixed question types', async ({ page }) => {
    // 開始測驗
    await page.getByRole('button', { name: 'Start Quiz' }).click();

    // 等待題目載入
    await page.waitForTimeout(500);

    // 檢查是否有題目（可能是選擇題或拼寫題）
    const hasMultipleChoice = await page.getByRole('button', { name: /^[A-D]\./i }).count();
    const hasSpellingInput = await page.getByPlaceholder(/type the reading/i).count();

    // 應該至少有一種題型
    expect(hasMultipleChoice > 0 || hasSpellingInput > 0).toBe(true);
  });

  test.skip('should complete quiz and show summary', async ({ page }) => {
    // 此測試需要實際完成所有題目，由於題目是隨機的，暫時跳過
    // TODO: 使用固定的測試資料來完成此測試
  });

  test('should allow restarting quiz from summary', async ({ page }) => {
    // 此測試需要先完成測驗，暫時跳過
    test.skip();
  });

  test('should allow returning to study page', async ({ page }) => {
    // 點擊返回按鈕
    await page.getByRole('button', { name: '← Back to Study' }).click();

    // 檢查是否返回學習頁面
    await expect(page).toHaveURL('/study');
  });

  test('should display quiz features description', async ({ page }) => {
    // 檢查功能說明
    await expect(page.getByText('What to expect:')).toBeVisible();
    await expect(page.getByText(/Mix of multiple choice and spelling questions/i)).toBeVisible();
    await expect(page.getByText(/Vocabulary from all your groups/i)).toBeVisible();
    await expect(page.getByText(/Instant feedback on each answer/i)).toBeVisible();
    await expect(page.getByText(/Final score and statistics/i)).toBeVisible();
  });

  test('should have default configuration values', async ({ page }) => {
    // 檢查預設值
    // 預設應該是 10 題
    const questionCountButton = page.getByRole('combobox', { name: /number of questions/i });
    await expect(questionCountButton).toContainText('10 questions');

    // 預設應該是 All Levels
    const difficultyButton = page.getByRole('combobox', { name: /difficulty level/i });
    await expect(difficultyButton).toContainText('All Levels (Mixed)');
  });

  test('should navigate back from quiz in progress', async ({ page }) => {
    // 開始測驗
    await page.getByRole('button', { name: 'Start Quiz' }).click();

    // 等待題目載入
    await page.waitForTimeout(500);

    // 點擊返回按鈕
    await page.getByRole('button', { name: '← Back to Study' }).click();

    // 檢查是否返回學習頁面
    await expect(page).toHaveURL('/study');
  });
});

