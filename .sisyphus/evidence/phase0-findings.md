# Phase 0: Next.js 16 Standalone + Electron PoC Findings

**Date**: 2026-02-11
**Verdict**: **GO**
**Next.js version**: 16.1.1
**Electron version**: 40.3.0
**React version**: 19.2.3
**next-intl version**: 4.8.2

---

## Test Results Summary

| #   | Test                              | Result | Notes                                                     |
| --- | --------------------------------- | ------ | --------------------------------------------------------- |
| 1   | Build with `output: 'standalone'` | PASS   | `pnpm build` succeeds, produces standalone output         |
| 2   | Standalone server serves HTML     | PASS   | HTTP 200, full SSR HTML with i18n text rendered           |
| 3   | API routes work in standalone     | PASS   | `/api/health` returns `{"status":"ok","timestamp":"..."}` |
| 4   | next-intl messages bundled        | PASS   | Messages compiled into JS chunks (not raw JSON)           |
| 5   | Electron launches BrowserWindow   | PASS   | Server spawned as child process, page loaded, clean exit  |

---

## Detailed Findings

### Test 1: Build

**Command**: `pnpm build` (in spike/ directory with `output: 'standalone'` in next.config.ts)

**Result**: Build succeeds in ~2s with Turbopack.

**Key finding — standalone output path nesting**:

- The standalone server is NOT at `.next/standalone/server.js`
- It is at `.next/standalone/<project-dir-name>/server.js`
- In our case: `.next/standalone/spike/server.js`
- This is because Next.js detected the workspace root at the parent directory (due to multiple lockfiles)
- The build emitted a warning: "Next.js inferred your workspace root, but it may not be correct"

**Implication for real project**: When building the actual Vocab Hero app, the server.js path will depend on the project directory structure and workspace root detection. We may need to set `turbopack.root` in next.config.ts explicitly, or dynamically discover the server.js path at runtime.

**Static assets**: Must manually copy `.next/static` → `.next/standalone/<project>/. next/static` for the standalone server to serve CSS/JS chunks. This is a documented Next.js requirement.

### Test 2: Standalone Server Serves HTML

**Command**: `PORT=3099 HOSTNAME=localhost node .next/standalone/spike/server.js`

**Result**: Server starts in ~75ms. Curl returns HTTP 200 with full SSR HTML.

**Key findings**:

- Server startup is extremely fast (~75-99ms)
- The `PORT` and `HOSTNAME` env vars work as expected
- The rendered HTML includes the i18n-translated text: "Hello from standalone Next.js!"
- Static pages are pre-rendered at build time (the `/` route was marked as `Static`)

### Test 3: API Routes Work

**Command**: `curl http://localhost:3099/api/health`

**Result**: `{"status":"ok","timestamp":"2026-02-11T09:14:37.569Z"}`

**Key finding**: API routes work perfectly in standalone mode. The `/api/health` route was marked as `Dynamic` (server-rendered on demand), confirming dynamic API routes work in standalone output.

### Test 4: next-intl Messages Bundled

**Finding**: Messages are NOT bundled as raw JSON files. They are compiled into optimized JS chunks.

- `en.json` → `.next/standalone/spike/.next/server/chunks/ssr/spike_messages_en_json_5d68360b._.js`
- Content: `module.exports=[1769,a=>{a.v({hello:"Hello from standalone Next.js!"})}];`

**Only imported locales are bundled**: Since our spike hardcoded `locale = 'en'`, only `en.json` was compiled. The `zh-TW.json` was not included because it was never imported. In the real app with dynamic locale switching (via `import(`../messages/${locale}.json`)`), all locale files will be bundled.

**Implication**: No need to manually copy message JSON files to standalone output. The next-intl plugin + Turbopack handles bundling automatically.

### Test 5: Electron Launch

**Setup**: Electron 40.3.0, main.js spawns `node server.js` as child process, waits for HTTP readiness, then opens BrowserWindow.

**Result**: Full success. Console output:

```
[electron] Starting standalone server: .../spike/server.js
[electron] Waiting for server to be ready...
[server stdout] Ready in 99ms
[electron] Server is ready!
[electron] Loading http://localhost:3098
[electron] Page loaded successfully!
[electron] BrowserWindow created successfully!
[electron] SPIKE TEST PASSED - all systems go
[electron] Killing server process...
Electron exit code: 0
```

**Key findings**:

- `process.execPath` inside Electron points to the Electron binary's bundled Node, NOT system Node. However, spawning `node server.js` via system Node works fine.
- Server startup is fast enough (~99ms) that a 15s timeout is very generous
- BrowserWindow successfully loads the Next.js page
- Clean shutdown: killing server process on `will-quit` works correctly
- Security settings `nodeIntegration: false, contextIsolation: true` do not interfere

---

## Architecture Validated

```
Electron Main Process
  ├── spawn child_process: node server.js (PORT=N, HOSTNAME=localhost)
  ├── poll http://localhost:N until ready
  └── BrowserWindow.loadURL(http://localhost:N)
```

This architecture works. The standalone server runs independently as a Node.js process, and Electron's BrowserWindow acts as the renderer.

---

## Gotchas & Workarounds

1. **Standalone output path nesting**: server.js is at `.next/standalone/<dir>/server.js`, not `.next/standalone/server.js`. The Electron main process must know the correct path. Consider using `turbopack.root` config or dynamically discovering server.js.

2. **Static assets must be copied**: `.next/static` must be copied to the standalone output directory. This is a known Next.js requirement for standalone mode.

3. **Electron build scripts**: When using pnpm, Electron's postinstall script is blocked by default. Must add `"pnpm": {"onlyBuiltDependencies": ["electron"]}` to package.json.

4. **Port allocation**: The spike used hardcoded ports (3098/3099). The real implementation needs random port allocation to avoid conflicts when multiple instances run.

5. **Workspace root detection**: Next.js 16 with Turbopack auto-detects workspace root via lockfile scanning. In a monorepo or nested project, this may affect the standalone output structure. Consider setting `turbopack.root` explicitly.

---

## GO Decision Rationale

All 5 test scenarios passed without any blocking issues:

- Next.js 16.1.1 standalone output works correctly
- API routes function in standalone mode
- next-intl messages are bundled automatically
- Electron can spawn the standalone server and render pages
- Security settings (no nodeIntegration, contextIsolation enabled) work fine

The gotchas identified (path nesting, static asset copying, port allocation) are all solvable engineering problems, not architectural blockers.

**Recommendation**: Proceed with Phase 1 (next.config.ts modification for standalone output in the main project).
