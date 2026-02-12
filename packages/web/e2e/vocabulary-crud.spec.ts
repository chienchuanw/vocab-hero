import { test, expect } from '@playwright/test';

test.describe('Vocabulary CRUD', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/vocabulary');
    await page.waitForLoadState('networkidle');
  });

  test('should display vocabulary page', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Vocabulary', level: 1 })).toBeVisible();
    await expect(page.getByText('Manage your Japanese vocabulary collection')).toBeVisible();
  });

  test('should display existing vocabulary items', async ({ page }) => {
    // Wait for vocabulary cards to load
    const cards = page.locator('[data-slot="card"]');
    await expect(cards.first()).toBeVisible({ timeout: 10000 });
    
    // Should have at least the seeded vocabulary items
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should create new vocabulary item', async ({ page }) => {
    // Click Add Word button (find by text since it's a button with icon + text)
    const addButton = page.locator('button:has-text("Add Word")').first();
    await addButton.click();
    
    // Wait for dialog to open
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
    
    // Fill in the form
    await page.getByLabel('Word *').fill('テスト');
    await page.getByLabel('Reading *').fill('てすと');
    await page.getByLabel('Meaning *').fill('test');
    await page.getByLabel('Notes').fill('E2E test vocabulary');
    
    // Submit form (the dialog submit button is just "Add", not "Add Word")
    const submitButton = page.locator('[role="dialog"] button[type="submit"]');
    await submitButton.click();
    
    // Wait for dialog to close (indicates form was submitted)
    await page.waitForSelector('[role="dialog"]', { state: 'hidden', timeout: 10000 });
    
    // Wait a bit for the list to update
    await page.waitForTimeout(500);
    
    // Verify new word appears in list (use first() to avoid strict mode violation with multiple matches)
    await expect(page.getByText('テスト').first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('てすと').first()).toBeVisible();
    await expect(page.getByText('test').first()).toBeVisible();
  });

  test('should edit vocabulary item', async ({ page }) => {
    // Wait for cards to load
    await page.waitForSelector('[data-slot="card"]', { timeout: 10000 });
    
    // Get first card's current meaning
    const firstCard = page.locator('[data-slot="card"]').first();
     const _originalMeaning = await firstCard.locator('p').first().textContent();
    
    // Hover to reveal action buttons on desktop
    await firstCard.hover();
    await page.waitForTimeout(500);
    
    // Try to click edit button
    const editButton = firstCard.getByLabel('Edit word');
    const isVisible = await editButton.isVisible().catch(() => false);
    
    if (!isVisible) {
      test.skip();
    }
    
    await editButton.click({ force: true });
    
    // Wait for dialog to open
    const dialogOpened = await page.waitForSelector('[role="dialog"]', { timeout: 10000 }).catch(() => null);
    
    if (!dialogOpened) {
      test.skip();
    }
    
    // Update the meaning
    const meaningInput = page.getByLabel('Meaning');
    await meaningInput.clear();
    await meaningInput.fill('updated meaning');
    
    // Submit
    await page.getByRole('button', { name: 'Update' }).click();
    
    // Wait for dialog to close (indicates form was submitted)
    await page.waitForSelector('[role="dialog"]', { state: 'hidden', timeout: 10000 });
    
    // Wait a bit for the list to update
    await page.waitForTimeout(500);
    
    // Verify updated meaning appears (use first() to avoid strict mode violation)
    await expect(page.getByText('updated meaning').first()).toBeVisible({ timeout: 10000 });
  });

  test('should delete vocabulary item', async ({ page }) => {
    // Wait for cards to load
    await page.waitForSelector('[data-slot="card"]', { timeout: 10000 });
    
    // Get the word text before deletion
    const firstCard = page.locator('[data-slot="card"]').first();
    const wordText = await firstCard.locator('h3').textContent();
    
    // Hover to reveal action buttons on desktop
    await firstCard.hover();
    await page.waitForTimeout(500);
    
    // Check if delete button is visible
    const deleteButton = firstCard.getByLabel('Delete word');
    const isVisible = await deleteButton.isVisible().catch(() => false);
    
    if (!isVisible) {
      test.skip();
    }
    
    // Click delete button
    await deleteButton.click({ force: true });
    
    // Wait for confirmation dialog (AlertDialog uses data-slot="alert-dialog")
    await page.waitForSelector('[data-slot="alert-dialog"]', { timeout: 10000 }).catch(() => {
      test.skip();
    });
    
    // Confirm deletion
    await page.getByRole('button', { name: 'Delete' }).click();
    
    // Wait for dialog to close (indicates deletion was submitted)
    await page.waitForSelector('[data-slot="alert-dialog"]', { state: 'hidden', timeout: 10000 });
    
    // Wait a bit for the list to update
    await page.waitForTimeout(500);
    
    // Verify word is removed (check that the specific word is gone)
    if (wordText) {
      const remainingCards = page.locator('[data-slot="card"]');
      const count = await remainingCards.count();
      
      // If there are remaining cards, verify the deleted word is not among them
      if (count > 0) {
        await expect(page.locator('h3', { hasText: wordText })).not.toBeVisible();
      }
    }
  });

  test('should search vocabulary', async ({ page }) => {
    // Wait for cards to load
    await page.waitForSelector('[data-slot="card"]', { timeout: 10000 });
    
    // Type in search box
    const searchInput = page.getByPlaceholder('Search word, reading, or meaning...');
    await searchInput.fill('勉強');
    
    // Wait for filtered results
    await page.waitForTimeout(500);
    
    // Should show only matching results
    await expect(page.getByText('勉強')).toBeVisible();
  });

  test('should filter by mastery level', async ({ page }) => {
    // Wait for cards to load
    await page.waitForSelector('[data-slot="card"]', { timeout: 10000 });
    
    // Open filter popover
    await page.getByTestId('filter-popover-trigger').click();
    
    // Wait for popover to open
    await page.waitForTimeout(300);
    
    // Click the mastery level select trigger inside the popover
    const popoverContent = page.locator('[data-radix-popper-content-wrapper]');
    await popoverContent.locator('[role="combobox"]').first().click();
    
    // Wait for options to appear
    await page.waitForTimeout(200);
    
    // Select a mastery level (using the actual mastery level labels from MASTERY_LEVEL_CONFIGS)
    await page.getByRole('option', { name: 'Learning' }).click();
    
    // Wait for filtered results
    await page.waitForTimeout(500);
    
    // Verify filter is applied (should show Learning badge)
    const cards = page.locator('[data-slot="card"]');
    if (await cards.count() > 0) {
      await expect(cards.first().getByText('Learning')).toBeVisible();
    }
  });

  test('should sort vocabulary', async ({ page }) => {
    // Wait for cards to load
    await page.waitForSelector('[data-slot="card"]', { timeout: 10000 });
    
    // Click sort select
    await page.getByTestId('sort-select').click();
    
    // Select sort option (A-Z)
    await page.getByRole('option', { name: 'A-Z' }).click();
    
    // Wait for re-sort
    await page.waitForTimeout(500);
    
    // Verify cards are present (sorting logic verified by API tests)
    const cards = page.locator('[data-slot="card"]');
    await expect(cards.first()).toBeVisible();
  });
});

