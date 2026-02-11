import { test, expect } from '@playwright/test';

test.describe('Sentences Tab', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/vocabulary');
    await page.waitForLoadState('networkidle');
  });

  test('should display Sentences tab on vocabulary page', async ({ page }) => {
    const sentencesTab = page.getByRole('tab', { name: 'Sentences' });
    await expect(sentencesTab).toBeVisible();
  });

  test('should switch to Sentences tab', async ({ page }) => {
    const sentencesTab = page.getByRole('tab', { name: 'Sentences' });
    await sentencesTab.click();

    // Should show the Import from Image button
    await expect(page.getByRole('button', { name: 'Import from Image' })).toBeVisible();
  });

  test('should show sentence list or empty state in Sentences tab', async ({ page }) => {
    const sentencesTab = page.getByRole('tab', { name: 'Sentences' });
    await sentencesTab.click();

    // Should show either the sentence list or the empty state
    const sentenceList = page.getByTestId('sentence-list');
    const emptyState = page.getByTestId('sentence-empty');

    const listVisible = await sentenceList.isVisible().catch(() => false);
    const emptyVisible = await emptyState.isVisible().catch(() => false);

    expect(listVisible || emptyVisible).toBe(true);
  });

  test('should open import dialog when clicking Import from Image', async ({ page }) => {
    const sentencesTab = page.getByRole('tab', { name: 'Sentences' });
    await sentencesTab.click();

    await page.getByRole('button', { name: 'Import from Image' }).click();

    // Dialog should open with upload area
    await expect(page.getByTestId('image-upload-dropzone')).toBeVisible({ timeout: 5000 });
  });

  test('should show Vocabulary tab as default', async ({ page }) => {
    const vocabularyTab = page.getByRole('tab', { name: 'Vocabulary' });
    await expect(vocabularyTab).toHaveAttribute('data-state', 'active');
  });
});
