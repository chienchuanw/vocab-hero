import { app, BrowserWindow, ipcMain, Notification, session, shell } from 'electron';
import * as path from 'path';

let serverPort: number | null = null;

export function getServerPort(): number | null {
  return serverPort;
}

export function setServerPort(port: number): void {
  serverPort = port;
}

let mainWindow: BrowserWindow | null = null;

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      sandbox: true,
    },
    titleBarStyle: 'hiddenInset',
    show: false,
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  if (serverPort) {
    mainWindow.loadURL(`http://localhost:${serverPort}`);
  } else {
    mainWindow.loadURL(
      'data:text/html,<html><head><meta charset="utf-8"><title>Vocab Hero</title><style>body{font-family:system-ui,-apple-system,sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;background:#f8fafc;color:#1e293b;}</style></head><body><div style="text-align:center"><h1>Vocab Hero Desktop</h1><p>Loading...</p></div></body></html>'
    );
  }

  // SECURITY: block navigation away from local server and data: URLs
  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (serverPort && url.startsWith(`http://localhost:${serverPort}`)) {
      return;
    }
    if (url.startsWith('data:')) {
      return;
    }
    event.preventDefault();
  });

  // SECURITY: deny new Electron windows; open external links in system browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https://') || url.startsWith('http://')) {
      shell.openExternal(url);
    }
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function configureCSP(): void {
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    const cspDirectives = [
      "default-src 'self'",
      "connect-src 'self' http://localhost:*",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob:",
      "font-src 'self' data:",
      "media-src 'self' blob:",
    ].join('; ');

    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [cspDirectives],
      },
    });
  });
}

// SECURITY: allow microphone ('media' permission) for pronunciation; deny all others
function configurePermissions(): void {
  session.defaultSession.setPermissionRequestHandler((_webContents, permission, callback) => {
    callback(permission === 'media');
  });

  session.defaultSession.setPermissionCheckHandler((_webContents, permission) => {
    return permission === 'media';
  });
}

function registerIpcHandlers(): void {
  ipcMain.on('show-notification', (_event, { title, body }: { title: string; body: string }) => {
    new Notification({ title, body }).show();
  });

  ipcMain.handle('get-app-path', (_event, name: string) => {
    return app.getPath(name as Parameters<typeof app.getPath>[0]);
  });

  ipcMain.handle('get-app-version', () => {
    return app.getVersion();
  });
}

app.whenReady().then(() => {
  configureCSP();
  configurePermissions();
  registerIpcHandlers();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  app.quit();
});
