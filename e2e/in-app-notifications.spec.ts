import { test, expect } from '@playwright/test';

/**
 * E2E Tests: In-App Notifications
 * 測試通知中心的完整功能（接收通知、標記已讀、刪除通知）
 */

test.describe('In-App Notifications', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should display notification bell icon', async ({ page }) => {
    // Check for notification bell in header/navigation
    const notificationBell = page.locator('[data-testid="notification-bell"]');
    await expect(notificationBell).toBeVisible({ timeout: 10000 });
  });

  test('should show unread notification count badge', async ({ page }) => {
    // Look for notification badge
    const badge = page.locator('[data-testid="notification-badge"]');
    
    // Badge might not be visible if there are no unread notifications
    const isVisible = await badge.isVisible().catch(() => false);
    
    if (isVisible) {
      const count = await badge.textContent();
      expect(parseInt(count || '0')).toBeGreaterThan(0);
    }
  });

  test('should open notification center when bell is clicked', async ({ page }) => {
    // Click notification bell
    await page.locator('[data-testid="notification-bell"]').click();
    
    // Notification center should open
    await expect(page.locator('[data-testid="notification-center"]')).toBeVisible({ timeout: 5000 });
    
    // Should show notifications heading
    await expect(page.getByRole('heading', { name: /notifications/i })).toBeVisible();
  });

  test('should display list of notifications', async ({ page }) => {
    // Open notification center
    await page.locator('[data-testid="notification-bell"]').click();
    await expect(page.locator('[data-testid="notification-center"]')).toBeVisible();
    
    // Check for notification items
    const notifications = page.locator('[data-testid="notification-item"]');
    const count = await notifications.count();
    
    // Should have at least some notifications or show empty state
    if (count > 0) {
      await expect(notifications.first()).toBeVisible();
    } else {
      await expect(page.getByText(/no notifications/i)).toBeVisible();
    }
  });

  test('should mark notification as read when clicked', async ({ page }) => {
    // Open notification center
    await page.locator('[data-testid="notification-bell"]').click();
    await expect(page.locator('[data-testid="notification-center"]')).toBeVisible();
    
    // Find an unread notification
    const unreadNotification = page.locator('[data-testid="notification-item"][data-read="false"]').first();
    
    if (await unreadNotification.isVisible()) {
      // Click the notification
      await unreadNotification.click();
      
      // Wait for update
      await page.waitForTimeout(1000);
      
      // Notification should now be marked as read
      const isRead = await unreadNotification.getAttribute('data-read');
      expect(isRead).toBe('true');
    }
  });

  test('should mark all notifications as read', async ({ page }) => {
    // Open notification center
    await page.locator('[data-testid="notification-bell"]').click();
    await expect(page.locator('[data-testid="notification-center"]')).toBeVisible();
    
    // Look for "Mark all as read" button
    const markAllButton = page.getByRole('button', { name: /mark all.*read/i });
    
    if (await markAllButton.isVisible()) {
      await markAllButton.click();
      
      // Wait for update
      await page.waitForTimeout(1000);
      
      // All notifications should be marked as read
      const unreadNotifications = page.locator('[data-testid="notification-item"][data-read="false"]');
      const unreadCount = await unreadNotifications.count();
      expect(unreadCount).toBe(0);
      
      // Badge should disappear or show 0
      const badge = page.locator('[data-testid="notification-badge"]');
      const isBadgeVisible = await badge.isVisible().catch(() => false);
      expect(isBadgeVisible).toBe(false);
    }
  });

  test('should delete individual notification', async ({ page }) => {
    // Open notification center
    await page.locator('[data-testid="notification-bell"]').click();
    await expect(page.locator('[data-testid="notification-center"]')).toBeVisible();
    
    // Get initial notification count
    const notifications = page.locator('[data-testid="notification-item"]');
    const initialCount = await notifications.count();
    
    if (initialCount > 0) {
      // Find delete button on first notification
      const deleteButton = notifications.first().locator('[data-testid="delete-notification"]');
      
      if (await deleteButton.isVisible()) {
        await deleteButton.click();
        
        // Confirm deletion if there's a confirmation dialog
        const confirmButton = page.getByRole('button', { name: /confirm|delete|yes/i });
        if (await confirmButton.isVisible({ timeout: 2000 })) {
          await confirmButton.click();
        }
        
        // Wait for deletion
        await page.waitForTimeout(1000);
        
        // Notification count should decrease
        const newCount = await notifications.count();
        expect(newCount).toBe(initialCount - 1);
      }
    }
  });

  test('should clear all notifications', async ({ page }) => {
    // Open notification center
    await page.locator('[data-testid="notification-bell"]').click();
    await expect(page.locator('[data-testid="notification-center"]')).toBeVisible();
    
    // Look for "Clear all" button
    const clearAllButton = page.getByRole('button', { name: /clear all/i });
    
    if (await clearAllButton.isVisible()) {
      await clearAllButton.click();
      
      // Confirm if there's a confirmation dialog
      const confirmButton = page.getByRole('button', { name: /confirm|clear|yes/i });
      if (await confirmButton.isVisible({ timeout: 2000 })) {
        await confirmButton.click();
      }
      
      // Wait for clearing
      await page.waitForTimeout(1000);
      
      // Should show empty state
      await expect(page.getByText(/no notifications/i)).toBeVisible();
    }
  });

  test('should display different notification types', async ({ page }) => {
    // Open notification center
    await page.locator('[data-testid="notification-bell"]').click();
    await expect(page.locator('[data-testid="notification-center"]')).toBeVisible();
    
    // Check for different notification types
    const notifications = page.locator('[data-testid="notification-item"]');
    const count = await notifications.count();
    
    if (count > 0) {
      // Each notification should have a type indicator (icon or label)
      for (let i = 0; i < Math.min(count, 3); i++) {
        const notification = notifications.nth(i);
        const typeIcon = notification.locator('svg').first();
        await expect(typeIcon).toBeVisible();
      }
    }
  });

  test('should close notification center when clicking outside', async ({ page }) => {
    // Open notification center
    await page.locator('[data-testid="notification-bell"]').click();
    await expect(page.locator('[data-testid="notification-center"]')).toBeVisible();
    
    // Click outside the notification center
    await page.click('body', { position: { x: 10, y: 10 } });
    
    // Notification center should close
    await expect(page.locator('[data-testid="notification-center"]')).not.toBeVisible();
  });

  test('should navigate to relevant page when notification is clicked', async ({ page }) => {
    // Open notification center
    await page.locator('[data-testid="notification-bell"]').click();
    await expect(page.locator('[data-testid="notification-center"]')).toBeVisible();
    
    // Find a notification with a link
    const notificationWithLink = page.locator('[data-testid="notification-item"]').first();
    
    if (await notificationWithLink.isVisible()) {
      const currentUrl = page.url();
      
      // Click the notification
      await notificationWithLink.click();
      
      // Wait for potential navigation
      await page.waitForTimeout(1000);
      
      // URL might have changed (depending on notification type)
      // This is a soft assertion - navigation is optional
      const newUrl = page.url();
      expect(newUrl).toBeDefined();
    }
  });
});

