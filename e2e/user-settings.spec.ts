import { test, expect } from '@playwright/test';

test.describe('User Settings - Settings Hub', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');
  });

  test('should display settings hub with navigation links', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /settings/i })).toBeVisible();

    await expect(page.getByText(/appearance/i)).toBeVisible();
    await expect(page.getByText(/audio/i)).toBeVisible();
    await expect(page.getByText(/study/i)).toBeVisible();
    await expect(page.getByText(/daily goals/i)).toBeVisible();
    await expect(page.getByText(/notifications/i)).toBeVisible();
    await expect(page.getByText(/language/i)).toBeVisible();
  });

  test('should navigate to theme settings', async ({ page }) => {
    await page.getByText(/appearance/i).click();
    await expect(page).toHaveURL(/\/settings\/theme/);
  });

  test('should navigate to audio settings', async ({ page }) => {
    await page.getByText(/audio/i).click();
    await expect(page).toHaveURL(/\/settings\/audio/);
  });

  test('should navigate to study settings', async ({ page }) => {
    await page.getByText(/study/i).click();
    await expect(page).toHaveURL(/\/settings\/study/);
  });
});

test.describe('User Settings - Theme', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/settings/theme');
    await page.waitForLoadState('networkidle');
  });

  test('should display theme settings page', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /appearance/i })).toBeVisible();
    await expect(page.getByText(/theme/i)).toBeVisible();
  });

  test('should display theme toggle buttons', async ({ page }) => {
    await expect(page.getByRole('button', { name: /light/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /dark/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /system/i })).toBeVisible();
  });

  test('should switch to dark theme', async ({ page }) => {
    const darkButton = page.getByRole('button', { name: /dark/i });
    await darkButton.click();

    await page.waitForTimeout(500);
    await expect(page.locator('html')).toHaveClass(/dark/);
  });

  test('should switch to light theme', async ({ page }) => {
    const lightButton = page.getByRole('button', { name: /light/i });
    await lightButton.click();

    await page.waitForTimeout(500);
    await expect(page.locator('html')).not.toHaveClass(/dark/);
  });
});

test.describe('User Settings - Study Preferences', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/settings/study');
    await page.waitForLoadState('networkidle');
  });

  test('should display study settings page', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /study preferences/i })).toBeVisible();
  });

  test('should display cards per session slider', async ({ page }) => {
    await expect(page.getByText(/cards per session/i)).toBeVisible();
    await expect(page.getByRole('slider')).toBeVisible();
  });

  test('should display default study mode selector', async ({ page }) => {
    await expect(page.getByText(/default study mode/i)).toBeVisible();
  });

  test('should display show reading toggle', async ({ page }) => {
    await expect(page.getByText(/show reading/i)).toBeVisible();
  });

  test('should display auto-advance toggle', async ({ page }) => {
    await expect(page.getByText(/auto-advance/i)).toBeVisible();
  });

  test('should save study preferences', async ({ page }) => {
    const showReadingSwitch = page.locator('#showReading');

    if (await showReadingSwitch.isVisible()) {
      await showReadingSwitch.click();
      await page.waitForTimeout(300);

      const saveButton = page.getByRole('button', { name: /save/i });
      if (await saveButton.isEnabled()) {
        await saveButton.click();
        await expect(page.getByText(/saved|success/i)).toBeVisible({ timeout: 5000 });
      }
    }
  });
});

test.describe('User Settings - Audio', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/settings/audio');
    await page.waitForLoadState('networkidle');
  });

  test('should display audio settings page', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /audio settings/i })).toBeVisible();
  });

  test('should display voice selection', async ({ page }) => {
    await expect(page.getByText(/voice/i)).toBeVisible();
  });

  test('should display speed slider', async ({ page }) => {
    await expect(page.getByText(/speed/i)).toBeVisible();
  });

  test('should display volume slider', async ({ page }) => {
    await expect(page.getByText(/volume/i)).toBeVisible();
  });

  test('should display pitch slider', async ({ page }) => {
    await expect(page.getByText(/pitch/i)).toBeVisible();
  });

  test('should have preview voice button', async ({ page }) => {
    await expect(page.getByRole('button', { name: /preview/i })).toBeVisible();
  });
});

test.describe('User Settings - Language', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/settings/language');
    await page.waitForLoadState('networkidle');
  });

  test('should display language settings page', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /language/i })).toBeVisible();
  });

  test('should show coming soon badge', async ({ page }) => {
    await expect(page.getByText(/coming soon/i)).toBeVisible();
  });

  test('should display planned languages', async ({ page }) => {
    await expect(page.getByText(/english/i)).toBeVisible();
  });
});

test.describe('User Settings - Persistence', () => {
  test('should persist theme preference across page reloads', async ({ page }) => {
    await page.goto('/settings/theme');
    await page.waitForLoadState('networkidle');

    const darkButton = page.getByRole('button', { name: /dark/i });
    await darkButton.click();
    await page.waitForTimeout(1000);

    await page.reload();
    await page.waitForLoadState('networkidle');

    await expect(page.locator('html')).toHaveClass(/dark/);
  });
});
