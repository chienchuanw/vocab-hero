import { test, expect } from '@playwright/test';

test.describe('404 Not Found Page', () => {
  test('should display 404 page for non-existent routes', async ({ page }) => {
    await page.goto('/this-route-does-not-exist');

    await expect(page.getByRole('heading', { name: /page not found/i })).toBeVisible();
    await expect(page.getByText(/the page you are looking for/i)).toBeVisible();
  });

  test('should provide navigation back to home', async ({ page }) => {
    await page.goto('/non-existent-page');

    await expect(page.getByRole('heading', { name: /page not found/i })).toBeVisible();

    const homeLink = page.getByRole('link', { name: /go home/i });
    await expect(homeLink).toBeVisible();

    await homeLink.click();
    await expect(page).toHaveURL('/');
  });

  test('should display 404 for invalid vocabulary ID', async ({ page }) => {
    await page.goto('/vocabulary/invalid-id-12345');

    await expect(page.getByRole('heading', { name: /page not found/i })).toBeVisible();
  });

  test('should display 404 for invalid group ID', async ({ page }) => {
    await page.goto('/groups/invalid-id-12345');

    await expect(page.getByRole('heading', { name: /page not found/i })).toBeVisible();
  });
});
