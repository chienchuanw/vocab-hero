import { test, expect } from '@playwright/test';

/**
 * E2E Tests: Goal Settings Flow
 * 測試使用者設定每日目標的完整流程
 */

test.describe('Goal Settings', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to progress page which contains goal settings
    await page.goto('/progress');
    await page.waitForLoadState('networkidle');
  });

  test('should display goal settings section', async ({ page }) => {
    // Check for goal settings heading
    await expect(page.getByRole('heading', { name: /daily goal/i })).toBeVisible();
    
    // Check for current goal display
    await expect(page.getByText(/words per day/i)).toBeVisible();
  });

  test('should display current goal value', async ({ page }) => {
    // Wait for goal data to load
    await page.waitForSelector('[data-testid="goal-value"]', { timeout: 10000 });
    
    // Verify goal value is displayed
    const goalValue = await page.locator('[data-testid="goal-value"]').textContent();
    expect(goalValue).toBeTruthy();
    expect(parseInt(goalValue || '0')).toBeGreaterThan(0);
  });

  test('should open goal settings dialog', async ({ page }) => {
    // Click edit goal button
    await page.getByRole('button', { name: /edit goal/i }).click();
    
    // Verify dialog is open
    await expect(page.getByRole('dialog', { name: /set daily goal/i })).toBeVisible();
    
    // Verify form elements
    await expect(page.getByLabel(/daily goal/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /save/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /cancel/i })).toBeVisible();
  });

  test('should update goal value successfully', async ({ page }) => {
    // Open goal settings dialog
    await page.getByRole('button', { name: /edit goal/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    
    // Get current goal value
    const currentGoalInput = page.getByLabel(/daily goal/i);
    const currentValue = await currentGoalInput.inputValue();
    
    // Set new goal value (different from current)
    const newGoal = parseInt(currentValue) === 10 ? '15' : '10';
    await currentGoalInput.clear();
    await currentGoalInput.fill(newGoal);
    
    // Save changes
    await page.getByRole('button', { name: /save/i }).click();
    
    // Wait for success message
    await expect(page.getByText(/goal updated successfully/i)).toBeVisible({ timeout: 5000 });
    
    // Verify dialog is closed
    await expect(page.getByRole('dialog')).not.toBeVisible();
    
    // Verify new goal is displayed
    await expect(page.getByText(new RegExp(`${newGoal}.*words per day`, 'i'))).toBeVisible();
  });

  test('should validate minimum goal value', async ({ page }) => {
    // Open goal settings dialog
    await page.getByRole('button', { name: /edit goal/i }).click();
    
    // Try to set goal below minimum (1)
    const goalInput = page.getByLabel(/daily goal/i);
    await goalInput.clear();
    await goalInput.fill('0');
    
    // Try to save
    await page.getByRole('button', { name: /save/i }).click();
    
    // Should show validation error
    await expect(page.getByText(/must be at least 1/i)).toBeVisible();
  });

  test('should validate maximum goal value', async ({ page }) => {
    // Open goal settings dialog
    await page.getByRole('button', { name: /edit goal/i }).click();
    
    // Try to set goal above maximum (100)
    const goalInput = page.getByLabel(/daily goal/i);
    await goalInput.clear();
    await goalInput.fill('101');
    
    // Try to save
    await page.getByRole('button', { name: /save/i }).click();
    
    // Should show validation error
    await expect(page.getByText(/must not exceed 100/i)).toBeVisible();
  });

  test('should cancel goal changes', async ({ page }) => {
    // Get current goal value
    const currentGoalText = await page.locator('[data-testid="goal-value"]').textContent();
    
    // Open goal settings dialog
    await page.getByRole('button', { name: /edit goal/i }).click();
    
    // Change goal value
    const goalInput = page.getByLabel(/daily goal/i);
    await goalInput.clear();
    await goalInput.fill('99');
    
    // Click cancel
    await page.getByRole('button', { name: /cancel/i }).click();
    
    // Verify dialog is closed
    await expect(page.getByRole('dialog')).not.toBeVisible();
    
    // Verify goal value hasn't changed
    await expect(page.locator('[data-testid="goal-value"]')).toHaveText(currentGoalText || '');
  });

  test('should persist goal changes across page reloads', async ({ page }) => {
    // Open goal settings and set a specific value
    await page.getByRole('button', { name: /edit goal/i }).click();
    
    const goalInput = page.getByLabel(/daily goal/i);
    await goalInput.clear();
    await goalInput.fill('20');
    
    await page.getByRole('button', { name: /save/i }).click();
    await expect(page.getByText(/goal updated successfully/i)).toBeVisible();
    
    // Reload the page
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Verify goal is still 20
    await expect(page.getByText(/20.*words per day/i)).toBeVisible();
  });

  test('should display goal in settings page', async ({ page }) => {
    // Navigate to settings page
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');
    
    // Should display goal settings section
    await expect(page.getByRole('heading', { name: /daily goal/i })).toBeVisible();
    await expect(page.getByText(/words per day/i)).toBeVisible();
  });
});

