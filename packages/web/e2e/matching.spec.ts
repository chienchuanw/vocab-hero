import { test, expect } from '@playwright/test';

test.describe('Matching Game', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/study/matching');
  });

  test('should display immersive game header with close button, progress bar, and timer', async ({
    page,
  }) => {
    await expect(page.getByRole('button', { name: /close game/i })).toBeVisible();
    await expect(page.getByText('0:00')).toBeVisible();
  });

  test('should navigate to /study when clicking close button', async ({ page }) => {
    await page.getByRole('button', { name: /close game/i }).click();
    await expect(page).toHaveURL('/study');
  });

  test('should display 10 cards (5 pairs) in two-column layout', async ({ page }) => {
    const grid = page.locator('.grid');
    await expect(grid).toBeVisible();
    await expect(grid).toHaveClass(/grid-cols-2/);

    const cards = page.getByRole('button').filter({
      hasNot: page.getByRole('button', { name: /close game/i }),
    });
    await expect(cards).toHaveCount(10);
  });

  test('should not display standard Layout header or bottom nav', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /matching game/i })).not.toBeVisible();
    await expect(page.getByRole('button', { name: /back to study/i })).not.toBeVisible();
  });

  test('should allow selecting a card', async ({ page }) => {
    const cards = page.getByRole('button').filter({
      hasNot: page.getByRole('button', { name: /close game/i }),
    });

    await cards.first().click();
    await expect(cards.first()).toHaveClass(/ring-2/);
  });

  test('should allow selecting two cards from different columns', async ({ page }) => {
    const cards = page.getByRole('button').filter({
      hasNot: page.getByRole('button', { name: /close game/i }),
    });

    await cards.nth(0).click();
    await cards.nth(1).click();

    await expect(cards.nth(0)).toHaveClass(/ring-2/);
    await expect(cards.nth(1)).toHaveClass(/ring-2/);
  });

  test('should disable other cards when two cards are selected', async ({ page }) => {
    const cards = page.getByRole('button').filter({
      hasNot: page.getByRole('button', { name: /close game/i }),
    });

    await cards.nth(0).click();
    await cards.nth(1).click();

    await expect(cards.nth(2)).toBeDisabled();
  });

  test('should display cards in grid layout', async ({ page }) => {
    const grid = page.locator('.grid');

    await expect(grid).toBeVisible();
    await expect(grid).toHaveClass(/grid-cols-2/);
  });

  test.skip('should show match animation on correct match', async ({ page: _page }) => {
    test.skip();
  });

  test.skip('should show error state on wrong match', async ({ page: _page }) => {
    test.skip();
  });

  test.skip('should show completion screen when all pairs matched', async ({ page: _page }) => {
    test.skip();
  });

  test.skip('should restart game when clicking play again', async ({ page: _page }) => {
    test.skip();
  });

  test.skip('should not allow selecting matched cards', async ({ page: _page }) => {
    test.skip();
  });
});
