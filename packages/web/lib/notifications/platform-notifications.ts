/**
 * Platform-aware notification utility
 * 根據運行環境自動選擇合適的通知 API
 * - Electron: 使用 window.electronAPI.sendNotification (IPC 到主進程)
 * - Web: 使用瀏覽器 Notification API
 */

/**
 * Show a native OS notification using the appropriate API for the current platform.
 * Automatically detects Electron vs web environment and uses the correct API.
 */
export function showPlatformNotification(title: string, body: string): void {
  // Electron path: use IPC to main process
  if (typeof window !== 'undefined' && window.electronAPI?.isElectron) {
    window.electronAPI.sendNotification(title, body);
    return;
  }

  // Web path: use browser Notification API
  if (typeof window !== 'undefined' && 'Notification' in window) {
    if (Notification.permission === 'granted') {
      new Notification(title, { body });
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          new Notification(title, { body });
        }
      });
    }
  }
}

/**
 * Check if notifications are supported on the current platform.
 * Returns true for both Electron and web environments with Notification API support.
 */
export function isNotificationSupported(): boolean {
  if (typeof window === 'undefined') return false;
  if (window.electronAPI?.isElectron) return true;
  return 'Notification' in window;
}
