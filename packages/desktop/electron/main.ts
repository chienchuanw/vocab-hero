import { app, BrowserWindow, ipcMain, Notification, session, shell } from 'electron';
import { spawn, ChildProcess } from 'child_process';
import * as fs from 'fs';
import * as http from 'http';
import * as net from 'net';
import * as path from 'path';

import { initializeDatabase } from './database';
import { setupMenu } from './menu';

let serverPort: number | null = null;

export function getServerPort(): number | null {
  return serverPort;
}

export function setServerPort(port: number): void {
  serverPort = port;
}

let mainWindow: BrowserWindow | null = null;
let serverProcess: ChildProcess | null = null;

// ---------------------------------------------------------------------------
// Server management
// ---------------------------------------------------------------------------

function findAvailablePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.listen(0, () => {
      const addr = server.address() as net.AddressInfo;
      const port = addr.port;
      server.close(() => resolve(port));
    });
    server.on('error', reject);
  });
}

/**
 * Discover the path to `server.js` inside the Next.js standalone output.
 *
 * The standalone build nests the server under the project directory name:
 *   .next/standalone/<project-dir>/server.js
 *
 * In development, `__dirname` is `packages/desktop/dist/electron/`.
 * The web standalone output lives at `packages/web/.next/standalone/`.
 */
function findServerJs(): string {
  // __dirname = packages/desktop/dist/electron
  // ../../.. = packages/desktop, then ../web = packages/web
  const webDir = path.resolve(__dirname, '..', '..', '..', 'web');
  const standaloneDir = path.join(webDir, '.next', 'standalone');

  // Try direct path first (no nesting)
  const directPath = path.join(standaloneDir, 'server.js');
  if (fs.existsSync(directPath)) return directPath;

  // Try nested under project directory names
  // Structure may be .next/standalone/<workspace-root>/<project>/server.js
  // or .next/standalone/<project>/server.js
  const candidates: string[] = [];

  function searchDir(dir: string, depth: number): void {
    if (depth > 3) return; // limit search depth
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (!entry.isDirectory()) continue;
        const serverPath = path.join(dir, entry.name, 'server.js');
        if (fs.existsSync(serverPath)) {
          candidates.push(serverPath);
        } else {
          searchDir(path.join(dir, entry.name), depth + 1);
        }
      }
    } catch {
      // Directory may not exist yet
    }
  }

  searchDir(standaloneDir, 0);

  if (candidates.length > 0) {
    return candidates[0];
  }

  throw new Error(
    `Could not find server.js in standalone output at ${standaloneDir}. ` +
      'Run "pnpm build:next" from packages/desktop first.'
  );
}

function startServer(port: number): ChildProcess {
  const serverPath = findServerJs();

  console.log(`[electron] Starting standalone server: ${serverPath}`);
  console.log(`[electron] Port: ${port}`);

  const child = spawn('node', [serverPath], {
    env: {
      ...process.env,
      PORT: String(port),
      HOSTNAME: 'localhost',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  child.stdout?.on('data', (data: Buffer) => {
    console.log(`[server stdout] ${data.toString().trim()}`);
  });

  child.stderr?.on('data', (data: Buffer) => {
    console.error(`[server stderr] ${data.toString().trim()}`);
  });

  child.on('error', (err) => {
    console.error('[electron] Failed to start server:', err);
  });

  child.on('exit', (code, signal) => {
    console.log(`[electron] Server process exited (code=${code}, signal=${signal})`);
    serverProcess = null;
  });

  serverProcess = child;
  return child;
}

function waitForServer(port: number, timeout = 15000): Promise<void> {
  const start = Date.now();
  console.log('[electron] Waiting for server to be ready...');

  return new Promise((resolve, reject) => {
    const check = () => {
      if (Date.now() - start > timeout) {
        reject(new Error(`Server did not start within ${timeout}ms`));
        return;
      }

      const req = http.get(`http://localhost:${port}`, (res) => {
        res.resume(); // consume response body to free memory
        if (res.statusCode === 200 || res.statusCode === 302) {
          console.log('[electron] Server is ready!');
          resolve();
        } else {
          setTimeout(check, 100);
        }
      });

      req.on('error', () => {
        setTimeout(check, 100);
      });

      // Prevent hanging on slow responses
      req.setTimeout(2000, () => {
        req.destroy();
        setTimeout(check, 100);
      });
    };

    check();
  });
}

function killServer(): void {
  if (serverProcess) {
    console.log('[electron] Killing server process...');
    serverProcess.kill();
    serverProcess = null;
  }
}

// ---------------------------------------------------------------------------
// Window management
// ---------------------------------------------------------------------------

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
    console.log(`[electron] Loading http://localhost:${serverPort}`);
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

// ---------------------------------------------------------------------------
// Security
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// IPC handlers
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// App lifecycle
// ---------------------------------------------------------------------------

app.whenReady().then(async () => {
  setupMenu();
  configureCSP();
  configurePermissions();
  registerIpcHandlers();

  try {
    await initializeDatabase();

    const port = await findAvailablePort();
    startServer(port);
    await waitForServer(port);
    setServerPort(port);
  } catch (err) {
    console.error('[electron] Failed to start:', err);
  }

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Clean up server process on quit
app.on('before-quit', () => {
  killServer();
});

app.on('will-quit', () => {
  killServer();
});

app.on('window-all-closed', () => {
  app.quit();
});
