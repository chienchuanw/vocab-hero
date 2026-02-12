import { test, expect } from '@playwright/test';

test.describe('Vocabulary Drag and Drop', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/vocabulary');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
  });

  test('should drag vocabulary card to group card', async ({ page }) => {
    await page.waitForSelector('[data-slot="card"]', { timeout: 15000 });

    const vocabCard = page.locator('[data-testid="vocabulary-card"]').first();
    await vocabCard.locator('h3').textContent();

    await page.goto('/groups');
    await page.waitForLoadState('networkidle');
    
    const groupCardCount = await page.locator('[data-testid="group-card"]').count();
    if (groupCardCount === 0) {
      test.skip();
    }
    
    await page.waitForSelector('[data-testid="group-card"]', { timeout: 10000 });

    const groupCard = page.locator('[data-testid="group-card"]').first();
    await groupCard.locator('h3').textContent();

    await page.goto('/vocabulary');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('[data-testid="vocabulary-card"]', { timeout: 10000 });

    const sourceVocabCard = page.locator('[data-testid="vocabulary-card"]').first();
    const sourceBoundingBox = await sourceVocabCard.boundingBox();

    if (sourceBoundingBox) {
      // Start drag to trigger drop zone appearance
      await page.mouse.move(
        sourceBoundingBox.x + sourceBoundingBox.width / 2,
        sourceBoundingBox.y + sourceBoundingBox.height / 2
      );
      await page.mouse.down();

      // Wait for drop zone to appear (AnimatePresence animation)
      await page.waitForSelector('[data-testid="group-drop-zone"]', { timeout: 5000 });

      const targetGroupCard = page.locator('[data-testid="group-drop-zone"]').first();
      const targetBoundingBox = await targetGroupCard.boundingBox();

      if (targetBoundingBox) {
        await expect(page.locator('[data-testid="drag-overlay"]')).toBeVisible();

        await page.mouse.move(
          targetBoundingBox.x + targetBoundingBox.width / 2,
          targetBoundingBox.y + targetBoundingBox.height / 2,
          { steps: 10 }
        );

        await expect(targetGroupCard).toHaveAttribute('data-drag-over', 'true');

        await page.mouse.up();

        await expect(page.getByText(/added to group/i)).toBeVisible({ timeout: 5000 });
      }
    }
  });

  test('should show visual feedback during drag', async ({ page }) => {
    await page.waitForSelector('[data-testid="vocabulary-card"]', { timeout: 10000 });

    const vocabCard = page.locator('[data-testid="vocabulary-card"]').first();
    const boundingBox = await vocabCard.boundingBox();

    if (boundingBox) {
      await page.mouse.move(
        boundingBox.x + boundingBox.width / 2,
        boundingBox.y + boundingBox.height / 2
      );
      await page.mouse.down();
      
      await page.mouse.move(
        boundingBox.x + boundingBox.width / 2 + 15,
        boundingBox.y + boundingBox.height / 2,
        { steps: 3 }
      );

      await expect(page.locator('[data-testid="drag-overlay"]')).toBeVisible({ timeout: 5000 });
      await expect(vocabCard).toHaveAttribute('data-dragging', 'true');

      await page.keyboard.press('Escape');

      await expect(page.locator('[data-testid="drag-overlay"]')).not.toBeVisible();
      await expect(vocabCard).not.toHaveAttribute('data-dragging', 'true');
    }
  });

  test('should handle drag cancellation with Escape key', async ({ page }) => {
    await page.waitForSelector('[data-testid="vocabulary-card"]', { timeout: 10000 });

    const vocabCard = page.locator('[data-testid="vocabulary-card"]').first();
    const boundingBox = await vocabCard.boundingBox();

    if (boundingBox) {
      await page.mouse.move(
        boundingBox.x + boundingBox.width / 2,
        boundingBox.y + boundingBox.height / 2
      );
      await page.mouse.down();
      
      await page.mouse.move(
        boundingBox.x + boundingBox.width / 2 + 15,
        boundingBox.y + boundingBox.height / 2,
        { steps: 3 }
      );

      await page.keyboard.press('Escape');

      await expect(page.getByText(/added to group/i)).not.toBeVisible();
    }
  });

  test('should not allow dragging when no groups available', async ({ page }) => {
    await page.waitForSelector('[data-testid="vocabulary-card"]', { timeout: 10000 });

    const vocabCard = page.locator('[data-testid="vocabulary-card"]').first();
    const boundingBox = await vocabCard.boundingBox();

    if (boundingBox) {
      await page.mouse.move(
        boundingBox.x + boundingBox.width / 2,
        boundingBox.y + boundingBox.height / 2
      );
      await page.mouse.down();

      // Drop zone only appears during drag if groups exist
      // If no groups, drop zone won't appear even during drag
      const dropZone = page.locator('[data-testid="group-drop-zone"]');
      const dropZoneVisible = await dropZone.isVisible({ timeout: 2000 }).catch(() => false);

      if (!dropZoneVisible) {
        // No groups available - drop zone should not appear
        const dragOverlay = page.locator('[data-testid="drag-overlay"]');
        if (await dragOverlay.isVisible()) {
          await expect(dragOverlay).toContainText(/no groups available/i);
        }
      }

      await page.mouse.up();
    }
  });

  test('should maintain vocabulary list state after failed drag', async ({ page }) => {
    await page.waitForSelector('[data-testid="vocabulary-card"]', { timeout: 10000 });

    const initialCardCount = await page.locator('[data-testid="vocabulary-card"]').count();
    const vocabCard = page.locator('[data-testid="vocabulary-card"]').first();
    const vocabWord = await vocabCard.locator('h3').textContent();

    const boundingBox = await vocabCard.boundingBox();

    if (boundingBox) {
      await page.mouse.move(
        boundingBox.x + boundingBox.width / 2,
        boundingBox.y + boundingBox.height / 2
      );
      await page.mouse.down();

      await page.mouse.move(50, 50, { steps: 5 });
      await page.mouse.up();

      await page.waitForTimeout(500);

      const finalCardCount = await page.locator('[data-testid="vocabulary-card"]').count();
      expect(finalCardCount).toBe(initialCardCount);

      // Use first() to avoid strict mode violation with multiple matches
      if (vocabWord) {
        await expect(page.getByText(vocabWord).first()).toBeVisible();
      }
    }
  });
});
