import { test, expect } from '@playwright/test';

/**
 * Matching Game E2E Tests
 * 測試配對遊戲的完整流程
 */

test.describe('Matching Game', () => {
  test.beforeEach(async ({ page }) => {
    // 前往 Matching Game 頁面
    await page.goto('/study/matching');
  });

  test('should display matching game page', async ({ page }) => {
    // 檢查頁面標題
    await expect(page.getByRole('heading', { name: /matching game/i })).toBeVisible();

    // 檢查描述文字
    await expect(page.getByText(/match japanese words/i)).toBeVisible();

    // 檢查返回按鈕
    await expect(page.getByRole('button', { name: /back to study/i })).toBeVisible();
  });

  test('should navigate back to study page', async ({ page }) => {
    // 點擊返回按鈕
    await page.click('button:has-text("Back to Study")');

    // 應該導航到學習頁面
    await expect(page).toHaveURL('/study');
  });

  test('should display 10 cards (5 pairs)', async ({ page }) => {
    // 應該有 10 張卡片
    const cards = page.getByRole('button').filter({ hasNot: page.getByText(/back to study/i) });
    await expect(cards).toHaveCount(10);
  });

  test('should display game statistics', async ({ page }) => {
    // 應該顯示配對進度
    await expect(page.getByText(/matched:/i)).toBeVisible();

    // 應該顯示嘗試次數
    await expect(page.getByText(/attempts:/i)).toBeVisible();
  });

  test('should allow selecting cards', async ({ page }) => {
    // 點擊第一張卡片
    const cards = page.getByRole('button').filter({ hasNot: page.getByText(/back to study/i) });
    const firstCard = cards.first();

    await firstCard.click();

    // 卡片應該被選中（有特殊樣式）
    await expect(firstCard).toHaveClass(/ring-2/);
  });

  test('should allow selecting two cards', async ({ page }) => {
    const cards = page.getByRole('button').filter({ hasNot: page.getByText(/back to study/i) });

    // 選擇兩張卡片
    await cards.nth(0).click();
    await cards.nth(1).click();

    // 兩張卡片都應該被選中
    await expect(cards.nth(0)).toHaveClass(/ring-2/);
    await expect(cards.nth(1)).toHaveClass(/ring-2/);
  });

  test('should show match animation on correct match', async ({ page }) => {
    // 此測試需要知道哪些卡片是配對的
    // 由於卡片是隨機洗牌的，這個測試比較困難
    // 可以考慮在測試環境中固定隨機種子
    test.skip();
  });

  test('should show error state on wrong match', async ({ page }) => {
    // 此測試需要知道哪些卡片不是配對的
    // 由於卡片是隨機洗牌的，這個測試比較困難
    test.skip();
  });

  test('should increment attempts counter', async ({ page }) => {
    const cards = page.getByRole('button').filter({ hasNot: page.getByText(/back to study/i) });

    // 初始嘗試次數應該是 0
    await expect(page.getByText(/attempts: 0/i)).toBeVisible();

    // 選擇兩張卡片
    await cards.nth(0).click();
    await cards.nth(1).click();

    // 等待一下讓狀態更新
    await page.waitForTimeout(100);

    // 嘗試次數應該增加
    await expect(page.getByText(/attempts: 1/i)).toBeVisible();
  });

  test('should start timer on first selection', async ({ page }) => {
    const cards = page.getByRole('button').filter({ hasNot: page.getByText(/back to study/i) });

    // 初始應該沒有時間顯示
    await expect(page.getByText(/time:/i)).not.toBeVisible();

    // 選擇第一張卡片
    await cards.first().click();

    // 等待一下
    await page.waitForTimeout(1000);

    // 應該開始顯示時間
    await expect(page.getByText(/time:/i)).toBeVisible();
  });

  test.skip('should show completion screen when all pairs matched', async ({ page }) => {
    // 此測試需要實際完成遊戲
    // 由於需要知道正確的配對，這個測試比較困難
    // 可以考慮在測試環境中使用固定的資料

    // 完成所有配對後應該顯示完成畫面
    // await expect(page.getByText(/perfect|excellent|well done|completed/i)).toBeVisible();

    // 應該顯示時間和嘗試次數
    // await expect(page.getByText(/time:/i)).toBeVisible();
    // await expect(page.getByText(/attempts:/i)).toBeVisible();

    // 應該有重新開始按鈕
    // await expect(page.getByRole('button', { name: /play again/i })).toBeVisible();
  });

  test.skip('should restart game when clicking play again', async ({ page }) => {
    // 此測試需要先完成遊戲
    test.skip();
  });

  test('should disable other cards when two cards are selected', async ({ page }) => {
    const cards = page.getByRole('button').filter({ hasNot: page.getByText(/back to study/i) });

    // 選擇兩張卡片
    await cards.nth(0).click();
    await cards.nth(1).click();

    // 第三張卡片應該被禁用
    await expect(cards.nth(2)).toBeDisabled();
  });

  test('should not allow selecting matched cards', async ({ page }) => {
    // 此測試需要先配對成功
    test.skip();
  });

  test('should display cards in grid layout', async ({ page }) => {
    const grid = page.locator('.grid');

    // 應該有網格佈局
    await expect(grid).toBeVisible();

    // 應該有正確的 grid 類別
    await expect(grid).toHaveClass(/grid-cols-2/);
  });
});

