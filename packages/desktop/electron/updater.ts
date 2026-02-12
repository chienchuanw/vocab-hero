import { autoUpdater } from 'electron-updater';
import { app, dialog } from 'electron';

export function setupAutoUpdater(): void {
  // Skip in development
  if (!app.isPackaged) {
    console.log('[updater] Skipping auto-update in development mode');
    return;
  }

  autoUpdater.autoDownload = false;
  autoUpdater.autoInstallOnAppQuit = true;

  autoUpdater.on('checking-for-update', () => {
    console.log('[updater] Checking for updates...');
  });

  autoUpdater.on('update-available', (info) => {
    console.log('[updater] Update available:', info.version);
    dialog.showMessageBox({
      type: 'info',
      title: 'Update Available',
      message: `A new version (${info.version}) is available. Download now?`,
      buttons: ['Download', 'Later'],
    }).then((result) => {
      if (result.response === 0) {
        autoUpdater.downloadUpdate();
      }
    });
  });

  autoUpdater.on('update-not-available', () => {
    console.log('[updater] No updates available');
  });

  autoUpdater.on('download-progress', (progress) => {
    console.log(`[updater] Download progress: ${Math.round(progress.percent)}%`);
  });

  autoUpdater.on('update-downloaded', () => {
    console.log('[updater] Update downloaded');
    dialog.showMessageBox({
      type: 'info',
      title: 'Update Ready',
      message: 'Update downloaded. Restart now to apply?',
      buttons: ['Restart', 'Later'],
    }).then((result) => {
      if (result.response === 0) {
        autoUpdater.quitAndInstall();
      }
    });
  });

  autoUpdater.on('error', (err) => {
    console.error('[updater] Error:', err);
  });

  // Check for updates after a short delay
  setTimeout(() => {
    autoUpdater.checkForUpdates().catch((err) => {
      console.error('[updater] Failed to check for updates:', err);
    });
  }, 5000);
}
