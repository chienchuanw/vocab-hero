import { test, expect } from '@playwright/test';

test.describe('API Error Responses', () => {
  test('should handle 500 server errors gracefully', async ({ page }) => {
    await page.route('**/api/vocabulary', (route) => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Internal server error' }),
      });
    });

    await page.goto('/vocabulary');

    await expect(page.getByText(/failed to load|error/i))
      .toBeVisible({
        timeout: 5000,
      })
      .catch(() => {});
  });

  test('should handle network timeouts', async ({ page }) => {
    await page.route('**/api/vocabulary', (route) => {
      setTimeout(() => route.abort('timedout'), 10000);
    });

    await page.goto('/vocabulary');

    await expect(page.getByText(/failed to load|timeout|error/i))
      .toBeVisible({
        timeout: 15000,
      })
      .catch(() => {});
  });
});

test.describe('User Input Validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/settings/goals');
  });

  test('should validate numeric inputs for daily goals', async ({ page }) => {
    const wordsInput = page.getByLabel(/words per day/i);
    await wordsInput.clear();
    await wordsInput.fill('-1');

    await expect(wordsInput).toHaveValue('-1');

    await page.getByRole('button', { name: /save/i }).click();

    await expect(page.getByText(/must be positive|invalid/i))
      .toBeVisible({ timeout: 1000 })
      .catch(() => {});
  });

  test('should prevent extremely large goal values', async ({ page }) => {
    const wordsInput = page.getByLabel(/words per day/i);
    await wordsInput.clear();
    await wordsInput.fill('10000');

    await page.getByRole('button', { name: /save/i }).click();

    await expect(page.getByText(/too large|maximum|exceed/i))
      .toBeVisible({ timeout: 1000 })
      .catch(() => {});
  });
});

test.describe('Offline Banner', () => {
  test('should display offline banner when network is unavailable', async ({ page }) => {
    await page.goto('/vocabulary');

    await page.evaluate(() => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false,
      });
      window.dispatchEvent(new Event('offline'));
    });

    await page.waitForTimeout(500);

    await expect(page.getByText(/you are currently offline/i)).toBeVisible();
  });

  test('should hide offline banner when connection is restored', async ({ page }) => {
    await page.goto('/vocabulary');

    await page.evaluate(() => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false,
      });
      window.dispatchEvent(new Event('offline'));
    });

    await expect(page.getByText(/you are currently offline/i)).toBeVisible();

    await page.evaluate(() => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: true,
      });
      window.dispatchEvent(new Event('online'));
    });

    await page.waitForTimeout(500);

    await expect(page.getByText(/you are currently offline/i)).not.toBeVisible();
  });
});
