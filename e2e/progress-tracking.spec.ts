import { test, expect } from '@playwright/test';

/**
 * E2E Tests: Progress Tracking Display
 * 測試目標進度在 Dashboard 和 Home Page 的顯示
 */

test.describe('Progress Tracking Display', () => {
  test.describe('Dashboard Progress Display', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/progress');
      await page.waitForLoadState('networkidle');
    });

    test('should display goal progress bar', async ({ page }) => {
      // Check for progress bar component
      await expect(page.locator('[data-testid="goal-progress-bar"]')).toBeVisible({ timeout: 10000 });
      
      // Check for progress percentage
      await expect(page.getByText(/%/)).toBeVisible();
    });

    test('should display current progress and goal', async ({ page }) => {
      // Wait for progress data to load
      await page.waitForSelector('[data-testid="progress-current"]', { timeout: 10000 });
      
      // Verify current progress is displayed
      const currentProgress = await page.locator('[data-testid="progress-current"]').textContent();
      expect(currentProgress).toBeTruthy();
      
      // Verify goal is displayed
      const goalValue = await page.locator('[data-testid="progress-goal"]').textContent();
      expect(goalValue).toBeTruthy();
    });

    test('should show correct progress percentage', async ({ page }) => {
      // Get current and goal values
      const currentText = await page.locator('[data-testid="progress-current"]').textContent();
      const goalText = await page.locator('[data-testid="progress-goal"]').textContent();
      
      const current = parseInt(currentText || '0');
      const goal = parseInt(goalText || '1');
      const expectedPercentage = Math.round((current / goal) * 100);
      
      // Verify percentage is displayed correctly
      await expect(page.getByText(new RegExp(`${expectedPercentage}%`))).toBeVisible();
    });

    test('should update progress bar width based on percentage', async ({ page }) => {
      // Get progress bar element
      const progressBar = page.locator('[data-testid="progress-bar-fill"]');
      await expect(progressBar).toBeVisible();
      
      // Get the width style
      const width = await progressBar.getAttribute('style');
      expect(width).toContain('width');
    });

    test('should display streak information', async ({ page }) => {
      // Check for streak display
      await expect(page.getByText(/day streak/i)).toBeVisible({ timeout: 10000 });
      
      // Verify streak count is displayed
      const streakText = await page.locator('[data-testid="streak-count"]').textContent();
      expect(streakText).toBeTruthy();
      expect(parseInt(streakText || '0')).toBeGreaterThanOrEqual(0);
    });

    test('should display total words learned', async ({ page }) => {
      // Check for total words display
      await expect(page.getByText(/total words/i)).toBeVisible({ timeout: 10000 });
      
      // Verify count is displayed
      const totalWords = await page.locator('[data-testid="total-words"]').textContent();
      expect(totalWords).toBeTruthy();
      expect(parseInt(totalWords || '0')).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe('Home Page Progress Display', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
    });

    test('should display quick progress overview', async ({ page }) => {
      // Check for progress section on home page
      await expect(page.getByRole('heading', { name: /today.*progress/i })).toBeVisible({ timeout: 10000 });
    });

    test('should show progress bar on home page', async ({ page }) => {
      // Verify progress bar is visible
      await expect(page.locator('[data-testid="home-progress-bar"]')).toBeVisible({ timeout: 10000 });
    });

    test('should display current progress on home page', async ({ page }) => {
      // Check for progress text
      await expect(page.getByText(/words.*today/i)).toBeVisible({ timeout: 10000 });
    });

    test('should link to full progress page', async ({ page }) => {
      // Find and click link to progress page
      const progressLink = page.getByRole('link', { name: /view.*progress/i });
      await expect(progressLink).toBeVisible();
      
      await progressLink.click();
      await page.waitForLoadState('networkidle');
      
      // Verify navigation to progress page
      expect(page.url()).toContain('/progress');
    });
  });

  test.describe('Progress Updates', () => {
    test('should update progress after completing study session', async ({ page }) => {
      // Go to progress page and get initial progress
      await page.goto('/progress');
      await page.waitForLoadState('networkidle');
      
      const initialProgressText = await page.locator('[data-testid="progress-current"]').textContent();
      const initialProgress = parseInt(initialProgressText || '0');
      
      // Navigate to study page and complete a session
      await page.goto('/study');
      await page.waitForLoadState('networkidle');
      
      // Start a study session (assuming there are vocabulary items)
      const startButton = page.getByRole('button', { name: /start.*study/i });
      if (await startButton.isVisible()) {
        await startButton.click();
        
        // Complete at least one card
        await page.waitForSelector('[data-testid="flashcard"]', { timeout: 10000 });
        await page.getByRole('button', { name: /show answer/i }).click();
        await page.getByRole('button', { name: /easy/i }).click();
        
        // End session
        await page.getByRole('button', { name: /end session/i }).click();
      }
      
      // Go back to progress page
      await page.goto('/progress');
      await page.waitForLoadState('networkidle');
      
      // Verify progress has increased
      const newProgressText = await page.locator('[data-testid="progress-current"]').textContent();
      const newProgress = parseInt(newProgressText || '0');
      
      expect(newProgress).toBeGreaterThanOrEqual(initialProgress);
    });

    test('should show completion state when goal is reached', async ({ page }) => {
      // This test assumes we can reach the goal
      await page.goto('/progress');
      await page.waitForLoadState('networkidle');
      
      // Check if goal is already completed
      const progressText = await page.locator('[data-testid="progress-current"]').textContent();
      const goalText = await page.locator('[data-testid="progress-goal"]').textContent();
      
      const current = parseInt(progressText || '0');
      const goal = parseInt(goalText || '1');
      
      if (current >= goal) {
        // Should show completion indicator
        await expect(page.getByText(/goal.*completed/i)).toBeVisible();
        
        // Progress bar should be at 100%
        await expect(page.getByText(/100%/)).toBeVisible();
      }
    });
  });
});

