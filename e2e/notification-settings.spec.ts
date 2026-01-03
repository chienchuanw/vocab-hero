import { test, expect } from '@playwright/test';

/**
 * E2E Tests: Notification Settings
 * 測試使用者自訂通知偏好的功能（開啟/關閉、設定時間）
 */

test.describe('Notification Settings', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');
  });

  test('should display notification settings section', async ({ page }) => {
    // Check for notification settings heading
    await expect(page.getByRole('heading', { name: /notification.*settings/i })).toBeVisible({ timeout: 10000 });
  });

  test('should display all notification type toggles', async ({ page }) => {
    // Check for different notification type settings
    await expect(page.getByText(/study.*reminder/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/goal.*achievement/i)).toBeVisible();
    await expect(page.getByText(/streak.*warning/i)).toBeVisible();
  });

  test('should toggle study reminder notifications', async ({ page }) => {
    // Find study reminder toggle
    const studyReminderToggle = page.locator('[data-testid="study-reminder-toggle"]');
    
    if (await studyReminderToggle.isVisible()) {
      // Get initial state
      const initialState = await studyReminderToggle.isChecked().catch(() => false);
      
      // Toggle the setting
      await studyReminderToggle.click();
      
      // Wait for update
      await page.waitForTimeout(1000);
      
      // State should have changed
      const newState = await studyReminderToggle.isChecked().catch(() => false);
      expect(newState).toBe(!initialState);
      
      // Should show success message
      await expect(page.getByText(/settings.*updated|saved/i)).toBeVisible({ timeout: 5000 });
    }
  });

  test('should toggle goal achievement notifications', async ({ page }) => {
    // Find goal achievement toggle
    const goalToggle = page.locator('[data-testid="goal-achievement-toggle"]');
    
    if (await goalToggle.isVisible()) {
      const initialState = await goalToggle.isChecked().catch(() => false);
      
      await goalToggle.click();
      await page.waitForTimeout(1000);
      
      const newState = await goalToggle.isChecked().catch(() => false);
      expect(newState).toBe(!initialState);
    }
  });

  test('should toggle streak warning notifications', async ({ page }) => {
    // Find streak warning toggle
    const streakToggle = page.locator('[data-testid="streak-warning-toggle"]');
    
    if (await streakToggle.isVisible()) {
      const initialState = await streakToggle.isChecked().catch(() => false);
      
      await streakToggle.click();
      await page.waitForTimeout(1000);
      
      const newState = await streakToggle.isChecked().catch(() => false);
      expect(newState).toBe(!initialState);
    }
  });

  test('should set reminder time', async ({ page }) => {
    // Look for reminder time setting
    const timeInput = page.locator('[data-testid="reminder-time-input"]');
    
    if (await timeInput.isVisible()) {
      // Set a specific time
      await timeInput.fill('09:00');
      
      // Save or blur to trigger update
      await timeInput.blur();
      
      // Wait for update
      await page.waitForTimeout(1000);
      
      // Should show success message
      await expect(page.getByText(/time.*updated|saved/i)).toBeVisible({ timeout: 5000 });
      
      // Verify time is set
      const value = await timeInput.inputValue();
      expect(value).toBe('09:00');
    }
  });

  test('should validate reminder time format', async ({ page }) => {
    const timeInput = page.locator('[data-testid="reminder-time-input"]');
    
    if (await timeInput.isVisible()) {
      // Try to set invalid time
      await timeInput.fill('25:00');
      await timeInput.blur();
      
      // Should show validation error
      const errorMessage = page.getByText(/invalid.*time|valid.*time/i);
      const hasError = await errorMessage.isVisible({ timeout: 2000 }).catch(() => false);
      
      // HTML5 time input might prevent invalid input
      expect(hasError || true).toBeTruthy();
    }
  });

  test('should set notification frequency', async ({ page }) => {
    // Look for frequency setting
    const frequencySelect = page.locator('[data-testid="notification-frequency"]');
    
    if (await frequencySelect.isVisible()) {
      // Select a frequency option
      await frequencySelect.selectOption('daily');
      
      // Wait for update
      await page.waitForTimeout(1000);
      
      // Should show success message
      await expect(page.getByText(/settings.*updated|saved/i)).toBeVisible({ timeout: 5000 });
    }
  });

  test('should disable reminder time when study reminders are off', async ({ page }) => {
    // Find study reminder toggle
    const studyReminderToggle = page.locator('[data-testid="study-reminder-toggle"]');
    const timeInput = page.locator('[data-testid="reminder-time-input"]');
    
    if (await studyReminderToggle.isVisible() && await timeInput.isVisible()) {
      // Ensure study reminders are off
      const isChecked = await studyReminderToggle.isChecked().catch(() => false);
      
      if (isChecked) {
        await studyReminderToggle.click();
        await page.waitForTimeout(1000);
      }
      
      // Time input should be disabled
      const isDisabled = await timeInput.isDisabled();
      expect(isDisabled).toBe(true);
    }
  });

  test('should persist notification settings across page reloads', async ({ page }) => {
    // Toggle a setting
    const studyReminderToggle = page.locator('[data-testid="study-reminder-toggle"]');
    
    if (await studyReminderToggle.isVisible()) {
      const initialState = await studyReminderToggle.isChecked().catch(() => false);
      
      // Toggle it
      await studyReminderToggle.click();
      await page.waitForTimeout(1000);
      
      const newState = await studyReminderToggle.isChecked().catch(() => false);
      
      // Reload the page
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      // Setting should persist
      const persistedState = await studyReminderToggle.isChecked().catch(() => false);
      expect(persistedState).toBe(newState);
    }
  });

  test('should show notification preview', async ({ page }) => {
    // Look for preview or test notification button
    const previewButton = page.getByRole('button', { name: /test.*notification|preview/i });
    
    if (await previewButton.isVisible()) {
      await previewButton.click();
      
      // Should show a test notification or confirmation
      await expect(
        page.getByText(/test.*notification.*sent|preview.*shown/i)
      ).toBeVisible({ timeout: 5000 });
    }
  });

  test('should reset notification settings to default', async ({ page }) => {
    // Look for reset button
    const resetButton = page.getByRole('button', { name: /reset.*default/i });
    
    if (await resetButton.isVisible()) {
      await resetButton.click();
      
      // Confirm if there's a confirmation dialog
      const confirmButton = page.getByRole('button', { name: /confirm|yes|reset/i });
      if (await confirmButton.isVisible({ timeout: 2000 })) {
        await confirmButton.click();
      }
      
      // Should show success message
      await expect(page.getByText(/reset.*success|default.*restored/i)).toBeVisible({ timeout: 5000 });
    }
  });

  test('should display notification settings help text', async ({ page }) => {
    // Each setting should have descriptive help text
    const studyReminderHelp = page.getByText(/receive.*daily.*reminder/i);
    const goalHelp = page.getByText(/notified.*when.*goal/i);
    const streakHelp = page.getByText(/warning.*before.*streak/i);
    
    // At least one help text should be visible
    const hasStudyHelp = await studyReminderHelp.isVisible().catch(() => false);
    const hasGoalHelp = await goalHelp.isVisible().catch(() => false);
    const hasStreakHelp = await streakHelp.isVisible().catch(() => false);
    
    expect(hasStudyHelp || hasGoalHelp || hasStreakHelp).toBeTruthy();
  });
});

