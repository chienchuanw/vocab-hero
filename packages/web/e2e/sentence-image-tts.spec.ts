import { test, expect } from '@playwright/test';

test.describe('Sentence Image & TTS Features', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/vocabulary');
    await page.waitForLoadState('networkidle');

    const sentencesTab = page.getByRole('tab', { name: 'Sentences' });
    await sentencesTab.click();
  });

  test('sentence card should display speaker button when sentences exist', async ({ page }) => {
    const sentenceList = page.getByTestId('sentence-list');
    const listVisible = await sentenceList.isVisible().catch(() => false);

    if (listVisible) {
      const speakerButtons = page.getByRole('button', { name: 'Play pronunciation' });
      const count = await speakerButtons.count();
      expect(count).toBeGreaterThan(0);
    }
  });

  test('sentence flashcard should have speaker button on front', async ({ page }) => {
    const studyButton = page.getByTestId('sentence-study');
    const isEnabled = await studyButton.isEnabled().catch(() => false);

    if (isEnabled) {
      await studyButton.click();

      const flashcard = page.getByTestId('sentence-flashcard');
      await expect(flashcard).toBeVisible({ timeout: 5000 });

      const speakerButton = page.getByRole('button', { name: 'Play pronunciation' });
      await expect(speakerButton).toBeVisible();
    }
  });

  test('speaker button click on flashcard should not flip the card', async ({ page }) => {
    const studyButton = page.getByTestId('sentence-study');
    const isEnabled = await studyButton.isEnabled().catch(() => false);

    if (isEnabled) {
      await studyButton.click();

      const flashcard = page.getByTestId('sentence-flashcard');
      await expect(flashcard).toBeVisible({ timeout: 5000 });

      const front = page.getByTestId('flashcard-front');
      const frontParent = front.locator('..');

      const transformBefore = await frontParent.evaluate(
        (el) => getComputedStyle(el).transform
      );

      const speakerButton = page.getByRole('button', { name: 'Play pronunciation' });
      await speakerButton.click();

      await page.waitForTimeout(300);

      const transformAfter = await frontParent.evaluate(
        (el) => getComputedStyle(el).transform
      );

      expect(transformAfter).toBe(transformBefore);
    }
  });

  test('import dialog should open and show upload area', async ({ page }) => {
    await page.getByRole('button', { name: 'Import from Image' }).click();
    await expect(page.getByTestId('image-upload-dropzone')).toBeVisible({ timeout: 5000 });
  });
});
