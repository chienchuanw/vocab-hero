import { test, expect } from '@playwright/test';

test.describe('Groups CRUD', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/groups');
    await page.waitForLoadState('networkidle');
  });

  test('should display groups page', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Groups');
    await expect(page.getByText('Organize your vocabulary into groups')).toBeVisible();
  });

  test('should display existing groups', async ({ page }) => {
    // Wait for group cards to load
    const cards = page.locator('[data-slot="card"]');
    await expect(cards.first()).toBeVisible({ timeout: 10000 });
    
    // Should have at least the seeded groups
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should create new group', async ({ page }) => {
    // Click Add Group button
    await page.getByRole('button', { name: 'Add Group' }).click();
    
    // Fill in the form
    await page.getByLabel('Group Name *').fill('E2E Test Group');
    await page.getByLabel('Description').fill('Created by E2E test');
    
    // Submit form
    await page.getByRole('button', { name: 'Add Group' }).click();
    
    // Wait for success toast
    await expect(page.getByText('Group added successfully')).toBeVisible({ timeout: 5000 });
    
    // Verify new group appears in list
    await expect(page.getByText('E2E Test Group')).toBeVisible();
    await expect(page.getByText('Created by E2E test')).toBeVisible();
  });

  test('should display vocabulary count in group card', async ({ page }) => {
    // Wait for cards to load
    await page.waitForSelector('[data-slot="card"]', { timeout: 10000 });
    
    // Check that vocabulary count badge is visible
    const firstCard = page.locator('[data-slot="card"]').first();
    await expect(firstCard.getByText(/\d+ word(s)?/)).toBeVisible();
  });

  test('should edit group', async ({ page }) => {
    // Wait for cards to load
    await page.waitForSelector('[data-slot="card"]', { timeout: 10000 });
    
    // Click edit button on first card
    const firstCard = page.locator('[data-slot="card"]').first();
    await firstCard.getByLabel('Edit group').click();
    
    // Update the description
    const descriptionInput = page.getByLabel('Description');
    await descriptionInput.clear();
    await descriptionInput.fill('Updated by E2E test');
    
    // Submit
    await page.getByRole('button', { name: 'Update' }).click();
    
    // Wait for success toast
    await expect(page.getByText('Group updated successfully')).toBeVisible({ timeout: 5000 });
    
    // Verify updated description appears
    await expect(page.getByText('Updated by E2E test')).toBeVisible();
  });

  test('should delete group', async ({ page }) => {
    // Wait for cards to load
    await page.waitForSelector('[data-slot="card"]', { timeout: 10000 });
    
    // Get the group name before deletion
    const firstCard = page.locator('[data-slot="card"]').first();
    const groupName = await firstCard.locator('h3').textContent();
    
    // Click delete button
    await firstCard.getByLabel('Delete group').click();
    
    // Confirm deletion
    await page.getByRole('button', { name: 'Delete' }).click();
    
    // Wait for success toast
    await expect(page.getByText('Group deleted successfully')).toBeVisible({ timeout: 5000 });
    
    // Verify group is removed
    if (groupName) {
      const remainingCards = page.locator('[data-slot="card"]');
      const count = await remainingCards.count();
      
      // If there are remaining cards, verify the deleted group is not among them
      if (count > 0) {
        await expect(page.locator('h3', { hasText: groupName })).not.toBeVisible();
      }
    }
  });

  test('should show warning when deleting group with vocabulary', async ({ page }) => {
    // Wait for cards to load
    await page.waitForSelector('[data-slot="card"]', { timeout: 10000 });
    
    // Find a group with vocabulary items
    const cards = page.locator('[data-slot="card"]');
    const count = await cards.count();
    
    for (let i = 0; i < count; i++) {
      const card = cards.nth(i);
      const vocabCountText = await card.getByText(/\d+ word(s)?/).textContent();
      
      if (vocabCountText && !vocabCountText.includes('0 word')) {
        // This group has vocabulary items
        await card.getByLabel('Delete group').click();
        
        // Check for warning message
        await expect(page.getByText(/This group contains \d+ vocabulary/)).toBeVisible();
        await expect(page.getByText(/The vocabulary items will not be deleted/)).toBeVisible();
        
        // Cancel deletion
        await page.getByRole('button', { name: 'Cancel' }).click();
        break;
      }
    }
  });

  test('should navigate between groups and vocabulary pages', async ({ page }) => {
    // Should be on groups page
    await expect(page.locator('h1')).toContainText('Groups');
    
    // Navigate to vocabulary page using bottom nav
    await page.getByRole('link', { name: 'Vocabulary' }).click();
    await expect(page.locator('h1')).toContainText('Vocabulary');
    
    // Navigate back to groups
    await page.getByRole('link', { name: 'Groups' }).click();
    await expect(page.locator('h1')).toContainText('Groups');
  });
});

