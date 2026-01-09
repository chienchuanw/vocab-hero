import { test, expect } from '@playwright/test';

test.describe('Data Management - Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');
  });

  test('should display data management link in settings hub', async ({ page }) => {
    await expect(page.getByText(/data management/i)).toBeVisible();
  });

  test('should navigate to data management page', async ({ page }) => {
    await page.getByText(/data management/i).click();
    await expect(page).toHaveURL(/\/settings\/data/);
    await expect(page.getByRole('heading', { name: /data management/i })).toBeVisible();
  });
});

test.describe('Data Management - Backup', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/settings/data');
    await page.waitForLoadState('networkidle');
  });

  test('should display backup section', async ({ page }) => {
    await expect(page.getByText(/backup/i).first()).toBeVisible();
    await expect(page.getByRole('button', { name: /download backup/i })).toBeVisible();
  });

  test('should download backup file with correct filename', async ({ page }) => {
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: /download backup/i }).click();

    const download = await downloadPromise;
    const filename = download.suggestedFilename();

    expect(filename).toMatch(/vocab-hero-backup-\d{4}-\d{2}-\d{2}\.json/);
  });

  test('should show success toast after backup download', async ({ page }) => {
    await page.getByRole('button', { name: /download backup/i }).click();
    await expect(page.getByText(/backup downloaded successfully/i)).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Data Management - Delete All Data', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/settings/data');
    await page.waitForLoadState('networkidle');
  });

  test('should display danger zone section', async ({ page }) => {
    await expect(page.getByText(/danger zone/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /delete all data/i })).toBeVisible();
  });

  test('should open delete confirmation dialog', async ({ page }) => {
    await page.getByRole('button', { name: /delete all data/i }).click();

    await expect(page.getByRole('heading', { name: /delete all data/i })).toBeVisible();
    await expect(page.getByText(/this action cannot be undone/i)).toBeVisible();
  });

  test('should require typed confirmation DELETE ALL', async ({ page }) => {
    await page.getByRole('button', { name: /delete all data/i }).click();

    const confirmButton = page.getByRole('button', { name: /confirm delete/i });
    await expect(confirmButton).toBeDisabled();

    const input = page.getByPlaceholder(/type DELETE ALL to confirm/i);
    await input.fill('delete');
    await expect(confirmButton).toBeDisabled();

    await input.fill('DELETE ALL');
    await expect(confirmButton).toBeEnabled();
  });

  test('should cancel delete on Cancel button', async ({ page }) => {
    await page.getByRole('button', { name: /delete all data/i }).click();

    await page.getByRole('button', { name: /cancel/i }).click();

    await expect(page.getByRole('heading', { name: /delete all data/i })).not.toBeVisible();
  });

  test('should cancel delete on Escape key', async ({ page }) => {
    await page.getByRole('button', { name: /delete all data/i }).click();

    await page.keyboard.press('Escape');

    await expect(page.getByRole('heading', { name: /delete all data/i })).not.toBeVisible();
  });

  test('should delete all data with correct confirmation', async ({ page }) => {
    await page.getByRole('button', { name: /delete all data/i }).click();

    const input = page.getByPlaceholder(/type DELETE ALL to confirm/i);
    await input.fill('DELETE ALL');

    await page.getByRole('button', { name: /confirm delete/i }).click();

    await expect(page.getByText(/all data deleted successfully/i)).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Data Management - Restore', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/settings/data');
    await page.waitForLoadState('networkidle');
  });

  test('should display restore section', async ({ page }) => {
    await expect(page.getByText(/restore/i).first()).toBeVisible();
    await expect(page.getByRole('button', { name: /restore from backup/i })).toBeVisible();
  });

  test('should open restore dialog', async ({ page }) => {
    await page.getByRole('button', { name: /restore from backup/i }).click();

    await expect(page.getByRole('heading', { name: /restore from backup/i })).toBeVisible();
    await expect(page.getByText(/upload/i)).toBeVisible();
  });

  test('should upload and preview valid backup file', async ({ page }) => {
    await page.getByRole('button', { name: /restore from backup/i }).click();

    const backupContent = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      itemCount: 2,
      items: [
        {
          word: '日本語',
          reading: 'にほんご',
          meaning: 'Japanese language',
        },
        {
          word: '英語',
          reading: 'えいご',
          meaning: 'English language',
        },
      ],
    };

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'backup.json',
      mimeType: 'application/json',
      buffer: Buffer.from(JSON.stringify(backupContent)),
    });

    await expect(page.getByText(/preview/i)).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/2.*items/i)).toBeVisible();
  });

  test('should display duplicate strategy options', async ({ page }) => {
    await page.getByRole('button', { name: /restore from backup/i }).click();

    const backupContent = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      itemCount: 1,
      items: [
        {
          word: 'テスト',
          reading: 'てすと',
          meaning: 'test',
        },
      ],
    };

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'backup.json',
      mimeType: 'application/json',
      buffer: Buffer.from(JSON.stringify(backupContent)),
    });

    await expect(page.getByText(/skip duplicates/i)).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/overwrite duplicates/i)).toBeVisible();
    await expect(page.getByText(/merge duplicates/i)).toBeVisible();
  });

  test('should require typed confirmation RESTORE', async ({ page }) => {
    await page.getByRole('button', { name: /restore from backup/i }).click();

    const backupContent = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      itemCount: 1,
      items: [
        {
          word: 'テスト',
          reading: 'てすと',
          meaning: 'test',
        },
      ],
    };

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'backup.json',
      mimeType: 'application/json',
      buffer: Buffer.from(JSON.stringify(backupContent)),
    });

    await expect(page.getByText(/preview/i)).toBeVisible({ timeout: 5000 });

    const confirmButton = page.getByRole('button', { name: /confirm restore/i });
    await expect(confirmButton).toBeDisabled();

    const input = page.getByPlaceholder(/type RESTORE to confirm/i);
    await input.fill('restore');
    await expect(confirmButton).toBeDisabled();

    await input.fill('RESTORE');
    await expect(confirmButton).toBeEnabled();
  });

  test('should restore data with skip strategy', async ({ page }) => {
    await page.getByRole('button', { name: /restore from backup/i }).click();

    const backupContent = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      itemCount: 2,
      items: [
        {
          word: '新単語',
          reading: 'しんたんご',
          meaning: 'new word',
        },
        {
          word: '英語',
          reading: 'えいご',
          meaning: 'English',
        },
      ],
    };

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'backup.json',
      mimeType: 'application/json',
      buffer: Buffer.from(JSON.stringify(backupContent)),
    });

    await expect(page.getByText(/preview/i)).toBeVisible({ timeout: 5000 });

    await page.getByText(/skip duplicates/i).click();

    const input = page.getByPlaceholder(/type RESTORE to confirm/i);
    await input.fill('RESTORE');

    await page.getByRole('button', { name: /confirm restore/i }).click();

    await expect(page.getByText(/data restored successfully/i)).toBeVisible({ timeout: 10000 });
  });

  test('should restore data with overwrite strategy', async ({ page }) => {
    await page.getByRole('button', { name: /restore from backup/i }).click();

    const backupContent = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      itemCount: 2,
      items: [
        {
          word: '上書き',
          reading: 'うわがき',
          meaning: 'overwrite',
        },
        {
          word: 'データ',
          reading: 'でーた',
          meaning: 'data',
        },
      ],
    };

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'backup.json',
      mimeType: 'application/json',
      buffer: Buffer.from(JSON.stringify(backupContent)),
    });

    await expect(page.getByText(/preview/i)).toBeVisible({ timeout: 5000 });

    await page.getByText(/overwrite duplicates/i).click();

    const input = page.getByPlaceholder(/type RESTORE to confirm/i);
    await input.fill('RESTORE');

    await page.getByRole('button', { name: /confirm restore/i }).click();

    await expect(page.getByText(/data restored successfully/i)).toBeVisible({ timeout: 10000 });
  });

  test('should restore data with merge strategy', async ({ page }) => {
    await page.getByRole('button', { name: /restore from backup/i }).click();

    const backupContent = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      itemCount: 2,
      items: [
        {
          word: '統合',
          reading: 'とうごう',
          meaning: 'merge',
        },
        {
          word: 'データ',
          reading: 'でーた',
          meaning: 'data',
        },
      ],
    };

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'backup.json',
      mimeType: 'application/json',
      buffer: Buffer.from(JSON.stringify(backupContent)),
    });

    await expect(page.getByText(/preview/i)).toBeVisible({ timeout: 5000 });

    await page.getByText(/merge duplicates/i).click();

    const input = page.getByPlaceholder(/type RESTORE to confirm/i);
    await input.fill('RESTORE');

    await page.getByRole('button', { name: /confirm restore/i }).click();

    await expect(page.getByText(/data restored successfully/i)).toBeVisible({ timeout: 10000 });
  });

  test('should show error for invalid JSON file', async ({ page }) => {
    await page.getByRole('button', { name: /restore from backup/i }).click();

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'invalid.json',
      mimeType: 'application/json',
      buffer: Buffer.from('{ invalid json }'),
    });

    await expect(page.getByText(/invalid|error|failed/i)).toBeVisible({ timeout: 5000 });
  });

  test('should close restore dialog on cancel', async ({ page }) => {
    await page.getByRole('button', { name: /restore from backup/i }).click();

    await expect(page.getByRole('heading', { name: /restore from backup/i })).toBeVisible();

    await page.getByRole('button', { name: /cancel/i }).click();

    await expect(page.getByRole('heading', { name: /restore from backup/i })).not.toBeVisible();
  });
});
