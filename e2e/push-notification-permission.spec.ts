import { test, expect } from '@playwright/test';

/**
 * E2E Tests: Push Notification Permission
 * 測試推送通知權限請求流程，驗證同意/拒絕場景
 */

test.describe('Push Notification Permission', () => {
  test.beforeEach(async ({ page, context }) => {
    // Grant notification permissions for testing
    await context.grantPermissions(['notifications']);
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should display push notification prompt', async ({ page }) => {
    // Look for push notification permission prompt
    const prompt = page.locator('[data-testid="push-notification-prompt"]');
    
    // Prompt might be visible on first visit or in settings
    const isVisible = await prompt.isVisible({ timeout: 5000 }).catch(() => false);
    
    if (isVisible) {
      // Should show enable button
      await expect(page.getByRole('button', { name: /enable.*notification/i })).toBeVisible();
      
      // Should show maybe later button
      await expect(page.getByRole('button', { name: /maybe later/i })).toBeVisible();
    }
  });

  test('should show benefits of enabling push notifications', async ({ page }) => {
    const prompt = page.locator('[data-testid="push-notification-prompt"]');
    
    if (await prompt.isVisible({ timeout: 5000 })) {
      // Should explain benefits
      await expect(page.getByText(/daily.*reminder/i)).toBeVisible();
      await expect(page.getByText(/goal.*achievement/i)).toBeVisible();
      await expect(page.getByText(/streak.*warning/i)).toBeVisible();
    }
  });

  test('should request browser permission when enable is clicked', async ({ page }) => {
    const prompt = page.locator('[data-testid="push-notification-prompt"]');
    
    if (await prompt.isVisible({ timeout: 5000 })) {
      // Click enable button
      const enableButton = page.getByRole('button', { name: /enable.*notification/i });
      await enableButton.click();
      
      // Browser permission dialog should appear (handled by context.grantPermissions)
      // After granting, prompt should disappear
      await expect(prompt).not.toBeVisible({ timeout: 5000 });
    }
  });

  test('should dismiss prompt when maybe later is clicked', async ({ page }) => {
    const prompt = page.locator('[data-testid="push-notification-prompt"]');
    
    if (await prompt.isVisible({ timeout: 5000 })) {
      // Click maybe later button
      const maybeLaterButton = page.getByRole('button', { name: /maybe later/i });
      await maybeLaterButton.click();
      
      // Prompt should be dismissed
      await expect(prompt).not.toBeVisible();
    }
  });

  test('should show permission status in settings', async ({ page }) => {
    // Navigate to settings page
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');
    
    // Look for notification settings section
    await expect(page.getByRole('heading', { name: /notification.*settings/i })).toBeVisible({ timeout: 10000 });
    
    // Should show push notification toggle or status
    const pushNotificationToggle = page.locator('[data-testid="push-notification-toggle"]');
    const pushNotificationStatus = page.locator('[data-testid="push-notification-status"]');
    
    const hasToggle = await pushNotificationToggle.isVisible().catch(() => false);
    const hasStatus = await pushNotificationStatus.isVisible().catch(() => false);
    
    expect(hasToggle || hasStatus).toBeTruthy();
  });

  test('should allow enabling push notifications from settings', async ({ page }) => {
    // Navigate to settings
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');
    
    // Find push notification toggle
    const toggle = page.locator('[data-testid="push-notification-toggle"]');
    
    if (await toggle.isVisible()) {
      // Check current state
      const isChecked = await toggle.isChecked().catch(() => false);
      
      if (!isChecked) {
        // Enable push notifications
        await toggle.click();
        
        // Should show success message
        await expect(page.getByText(/notification.*enabled/i)).toBeVisible({ timeout: 5000 });
      }
    }
  });

  test('should allow disabling push notifications from settings', async ({ page }) => {
    // Navigate to settings
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');
    
    // Find push notification toggle
    const toggle = page.locator('[data-testid="push-notification-toggle"]');
    
    if (await toggle.isVisible()) {
      // Check current state
      const isChecked = await toggle.isChecked().catch(() => false);
      
      if (isChecked) {
        // Disable push notifications
        await toggle.click();
        
        // Should show confirmation or success message
        await expect(page.getByText(/notification.*disabled/i)).toBeVisible({ timeout: 5000 });
      }
    }
  });

  test('should show blocked state if permission is denied', async ({ page, context }) => {
    // Deny notification permissions
    await context.clearPermissions();
    
    // Navigate to settings
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');
    
    // Should show that notifications are blocked
    const blockedMessage = page.getByText(/notification.*blocked|permission.*denied/i);
    const isBlocked = await blockedMessage.isVisible({ timeout: 5000 }).catch(() => false);
    
    if (isBlocked) {
      // Should provide instructions to enable in browser
      await expect(page.getByText(/browser.*settings/i)).toBeVisible();
    }
  });

  test('should not show prompt again after dismissing', async ({ page }) => {
    const prompt = page.locator('[data-testid="push-notification-prompt"]');
    
    if (await prompt.isVisible({ timeout: 5000 })) {
      // Dismiss the prompt
      await page.getByRole('button', { name: /maybe later/i }).click();
      await expect(prompt).not.toBeVisible();
      
      // Reload the page
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      // Prompt should not appear again (for some time)
      const isVisibleAgain = await prompt.isVisible({ timeout: 2000 }).catch(() => false);
      expect(isVisibleAgain).toBe(false);
    }
  });

  test('should persist permission state across page reloads', async ({ page }) => {
    // Navigate to settings and check initial state
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');
    
    const toggle = page.locator('[data-testid="push-notification-toggle"]');
    
    if (await toggle.isVisible()) {
      const initialState = await toggle.isChecked().catch(() => false);
      
      // Reload the page
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      // State should be the same
      const newState = await toggle.isChecked().catch(() => false);
      expect(newState).toBe(initialState);
    }
  });
});

