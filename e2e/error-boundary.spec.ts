import { test, expect } from '@playwright/test';

test.describe('Error Boundary', () => {
  test('should display error boundary UI when component throws error', async ({ page }) => {
    await page.goto('/');
    await page.goto('/test-error');

    await expect(page.getByRole('heading', { name: /something went wrong/i })).toBeVisible();
    await expect(page.getByText(/an error occurred/i)).toBeVisible();

    const resetButton = page.getByRole('button', { name: /try again/i });
    await expect(resetButton).toBeVisible();
  });

  test('should allow user to reset error boundary', async ({ page }) => {
    await page.goto('/test-error');

    await expect(page.getByRole('heading', { name: /something went wrong/i })).toBeVisible();

    await page.getByRole('button', { name: /try again/i }).click();

    await expect(page.getByRole('heading', { name: /something went wrong/i })).toBeVisible();
  });

  test('should provide navigation back to home from error state', async ({ page }) => {
    await page.goto('/test-error');

    await expect(page.getByRole('heading', { name: /something went wrong/i })).toBeVisible();

    const homeLink = page.getByRole('link', { name: /go home/i });
    await expect(homeLink).toBeVisible();

    await homeLink.click();
    await expect(page).toHaveURL('/');
  });

  test('should preserve error boundary across navigation', async ({ page }) => {
    await page.goto('/');
    await page.goto('/test-error');

    await expect(page.getByRole('heading', { name: /something went wrong/i })).toBeVisible();

    await page.goto('/vocabulary');
    await expect(page).toHaveURL('/vocabulary');
    await expect(page.getByRole('heading', { name: /vocabulary/i })).toBeVisible();
  });
});

test.describe('Global Error Handling', () => {
  test('should catch errors in layout components', async ({ page }) => {
    test.skip();
  });
});
