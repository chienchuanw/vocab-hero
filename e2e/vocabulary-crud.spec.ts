import { test, expect } from '@playwright/test';

test.describe('Vocabulary CRUD', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/vocabulary');
    await page.waitForLoadState('networkidle');
  });

  test('should display vocabulary page', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Vocabulary');
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
    // Click Add Word button
    await page.getByRole('button', { name: 'Add Word' }).click();
    
    // Fill in the form
    await page.getByLabel('Word *').fill('テスト');
    await page.getByLabel('Reading *').fill('てすと');
    await page.getByLabel('Meaning *').fill('test');
    await page.getByLabel('Notes').fill('E2E test vocabulary');
    
    // Submit form
    await page.getByRole('button', { name: 'Add Word', exact: true }).click();
    
    // Wait for success toast
    await expect(page.getByText('Word added successfully')).toBeVisible({ timeout: 5000 });
    
    // Verify new word appears in list
    await expect(page.getByText('テスト')).toBeVisible();
    await expect(page.getByText('てすと')).toBeVisible();
    await expect(page.getByText('test')).toBeVisible();
  });

  test('should edit vocabulary item', async ({ page }) => {
    // Wait for cards to load
    await page.waitForSelector('[data-slot="card"]', { timeout: 10000 });
    
    // Click edit button on first card
    const firstCard = page.locator('[data-slot="card"]').first();
    await firstCard.getByLabel('Edit word').click();
    
    // Update the meaning
    const meaningInput = page.getByLabel('Meaning');
    await meaningInput.clear();
    await meaningInput.fill('updated meaning');
    
    // Submit
    await page.getByRole('button', { name: 'Update' }).click();
    
    // Wait for success toast
    await expect(page.getByText('Word updated successfully')).toBeVisible({ timeout: 5000 });
    
    // Verify updated meaning appears
    await expect(page.getByText('updated meaning')).toBeVisible();
  });

  test('should delete vocabulary item', async ({ page }) => {
    // Wait for cards to load
    await page.waitForSelector('[data-slot="card"]', { timeout: 10000 });
    
    // Get the word text before deletion
    const firstCard = page.locator('[data-slot="card"]').first();
    const wordText = await firstCard.locator('h3').textContent();
    
    // Click delete button
    await firstCard.getByLabel('Delete word').click();
    
    // Confirm deletion
    await page.getByRole('button', { name: 'Delete' }).click();
    
    // Wait for success toast
    await expect(page.getByText('Word deleted successfully')).toBeVisible({ timeout: 5000 });
    
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
    const searchInput = page.getByPlaceholder('Search vocabulary...');
    await searchInput.fill('勉強');
    
    // Wait for filtered results
    await page.waitForTimeout(500);
    
    // Should show only matching results
    await expect(page.getByText('勉強')).toBeVisible();
  });

  test('should filter by mastery level', async ({ page }) => {
    // Wait for cards to load
    await page.waitForSelector('[data-slot="card"]', { timeout: 10000 });
    
    // Click mastery filter dropdown
    await page.getByRole('button', { name: 'All Levels' }).click();
    
    // Select a mastery level
    await page.getByRole('option', { name: 'Beginner' }).click();
    
    // Wait for filtered results
    await page.waitForTimeout(500);
    
    // Verify filter is applied (should show Beginner badge)
    const cards = page.locator('[data-slot="card"]');
    if (await cards.count() > 0) {
      await expect(cards.first().getByText('Beginner')).toBeVisible();
    }
  });

  test('should sort vocabulary', async ({ page }) => {
    // Wait for cards to load
    await page.waitForSelector('[data-slot="card"]', { timeout: 10000 });
    
    // Click sort dropdown
    await page.getByRole('button', { name: /Sort by/ }).click();
    
    // Select sort option
    await page.getByRole('option', { name: 'Word (A-Z)' }).click();
    
    // Wait for re-sort
    await page.waitForTimeout(500);
    
    // Verify cards are present (sorting logic verified by API tests)
    const cards = page.locator('[data-slot="card"]');
    await expect(cards.first()).toBeVisible();
  });
});

