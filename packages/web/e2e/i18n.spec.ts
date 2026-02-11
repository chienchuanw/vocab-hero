import { test, expect } from '@playwright/test';

test.describe('i18n Language Switching', () => {
  test.beforeEach(async ({ context }) => {
    // Clear cookies before each test
    await context.clearCookies();
  });

  test('should display language switcher in header', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('language-switcher')).toBeVisible();
  });

  test('should switch to Chinese when selecting zh-TW', async ({ page }) => {
    await page.goto('/');

    // Click language switcher
    await page.getByTestId('language-switcher').click();

    // Select Chinese
    await page.getByTestId('locale-zh-TW').click();

    // Wait for page reload
    await page.waitForLoadState('networkidle');

    // Verify cookie is set
    const cookies = await page.context().cookies();
    const localeCookie = cookies.find((c) => c.name === 'locale');
    expect(localeCookie?.value).toBe('zh-TW');
  });

  test('should display Chinese text after switching locale', async ({ page }) => {
    // Set locale cookie directly
    await page.context().addCookies([
      {
        name: 'locale',
        value: 'zh-TW',
        domain: 'localhost',
        path: '/',
      },
    ]);

    await page.goto('/settings');

    // Check for Chinese text (use main content h1, not header)
    await expect(page.locator('main h1').first()).toContainText('設定');
  });

  test('should have functional language selection on settings page', async ({ page }) => {
    await page.goto('/settings/language');

    // Check that both language options are visible
    await expect(page.getByTestId('language-option-en')).toBeVisible();
    await expect(page.getByTestId('language-option-zh-TW')).toBeVisible();

    // No "Coming Soon" badge
    await expect(page.getByText('Coming Soon')).not.toBeVisible();

    // No Japanese option
    await expect(page.getByText('日本語')).not.toBeVisible();
  });

  test('should persist language preference across navigation', async ({ page }) => {
    // Set Chinese locale
    await page.context().addCookies([
      {
        name: 'locale',
        value: 'zh-TW',
        domain: 'localhost',
        path: '/',
      },
    ]);

    // Navigate to different pages
    await page.goto('/');
    await page.goto('/settings');
    await page.goto('/study');

    // Verify locale cookie persists
    const cookies = await page.context().cookies();
    const localeCookie = cookies.find((c) => c.name === 'locale');
    expect(localeCookie?.value).toBe('zh-TW');
  });
});
