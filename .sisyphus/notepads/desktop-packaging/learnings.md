# learnings - Desktop Packaging

## Phase 0 PoC (2026-02-11)

### Standalone Output Path Nesting

- `output: 'standalone'` produces server.js at `.next/standalone/<project-dir>/server.js`, NOT `.next/standalone/server.js`
- This happens because Turbopack infers workspace root from lockfile locations
- When the project is inside a workspace/monorepo, the output nests under the project directory name
- Fix options: set `turbopack.root` in next.config.ts, or dynamically discover server.js path

### Static Assets Require Manual Copy

- `.next/static` must be copied to `.next/standalone/<project>/.next/static` after build
- This is documented Next.js behavior but easy to forget
- Build script should automate: `cp -r .next/static .next/standalone/<project>/.next/static`

### next-intl Messages Are Compiled, Not Copied

- Messages are NOT preserved as raw .json files in standalone output
- They are compiled into optimized JS chunks (e.g., `spike_messages_en_json_5d68360b._.js`)
- Only locales that are actually imported during build are bundled
- Dynamic imports (`import(\`../messages/${locale}.json\`)`) will bundle all referenced locales
- No need to manually copy message files

### Electron + Standalone Server Pattern

- Architecture: Electron spawns `node server.js` as child process, BrowserWindow loads `http://localhost:<port>`
- Server starts in ~75-99ms — very fast, minimal user wait
- Must set `PORT` and `HOSTNAME` env vars when spawning server
- `process.execPath` in Electron points to Electron's Node, not system Node — use explicit `node` path or system Node for spawning
- `nodeIntegration: false` + `contextIsolation: true` works correctly (security best practice)

### pnpm + Electron Setup

- pnpm blocks Electron's postinstall by default
- Must add `"pnpm": {"onlyBuiltDependencies": ["electron"]}` to package.json
- `pnpm approve-builds` is interactive and doesn't work in CI/headless — use the package.json config instead

### Versions Validated

- Next.js 16.1.1 + React 19.2.3 + next-intl 4.8.2 + Electron 40.3.0 = compatible
- Build uses Turbopack by default in Next.js 16
- Electron 40.3.0 is latest stable as of 2026-02

## Task 1: Workspace Initialization (2026-02-11)

### pnpm Workspace Setup

- Creating `pnpm-workspace.yaml` with `packages: ['packages/*']` immediately makes pnpm recognize sub-package.json files
- `pnpm install` after adding workspace config says "Scope: all 4 workspace projects" — confirms auto-detection
- Lockfile update was instant ("Lockfile is up to date, resolution step is skipped") because no new deps were added
- Empty workspace packages (no dependencies) don't show in `pnpm -r list --depth 0` output — use `--depth -1` to see package names only
- Adding workspace-level filter scripts (`pnpm --filter @vocab-hero/web dev`) to root package.json works; they'll be no-ops until code moves
- Existing `tsc --noEmit` and `lint` pass without issues after workspace config is added — no interference with current codebase
- Root package.json keeps `"private": true` — this is required for workspace roots

## Task 2: Move Source to packages/web (2026-02-11)

### git mv for History Preservation

- `git mv` works for tracked files; gitignored files (.env, .env.example, .env.test, next-env.d.ts) must use regular `mv`
- Moving 12 source directories + 8 config files in one batch with `&&` chaining works cleanly
- Git correctly tracks the moves as rename operations

### pnpm Hoisting for eslint-config-next

- `eslint-config-next` requires `next/dist/compiled/babel/eslint-parser` at resolution time
- With pnpm strict mode, `next` isn't accessible from `eslint-config-next`'s node_modules
- Fix: `.npmrc` with `public-hoist-pattern[]=next` hoists `next` to root node_modules
- Also hoist eslint/prettier patterns: `public-hoist-pattern[]=*eslint*` and `public-hoist-pattern[]=*prettier*`

### onlyBuiltDependencies in pnpm v10

- `pnpm approve-builds` is interactive — doesn't work in CI/headless
- Set `"pnpm": {"onlyBuiltDependencies": [...]}` in ROOT package.json (not .npmrc)
- Must include: @prisma/client, @prisma/engines, prisma, msw, esbuild, @swc/core, sharp, @parcel/watcher, unrs-resolver, tesseract.js
- After `.npmrc` change, `CI=true pnpm install` needed because pnpm wants to recreate node_modules

### Prisma Client Generation in Monorepo

- After moving prisma/ to packages/web/, `pnpm prisma generate` must be run from packages/web/
- Prisma looks for schema relative to cwd: `prisma/schema.prisma`
- Prisma client generates to shared hoisted node_modules — works across workspace

### tsconfig.json Strategy

- packages/web/tsconfig.json: Full config with `"paths": {"@/*": ["./*"]}` — resolves relative to packages/web/
- Root tsconfig.json: Minimal `{"references": [{"path": "packages/web"}], "files": []}` — just points IDE to subproject
- `__dirname` in vitest.config.mts correctly resolves to packages/web/ after move — relative paths work

### Verification Results

- `pnpm tsc --noEmit` from packages/web: Only 3 pre-existing ThemeProvider errors (next-themes typing issue)
- `pnpm lint` from packages/web: Zero errors
- `pnpm build` from packages/web: Compiles all 48 routes successfully
- `pnpm test run` from packages/web: 103 test files, 1132 tests passed, 4 skipped (same as before)

### New Root Files Created

- `.npmrc`: pnpm hoisting configuration for eslint/next
- Root `package.json`: Only workspace filter scripts + `pnpm.onlyBuiltDependencies` config

## Task 3: Shared Package Creation (2026-02-11)

### Platform Detection Without DOM Types

- `packages/shared/tsconfig.json` uses `"lib": ["ES2022"]` (no DOM) since it's a platform-agnostic package
- `navigator` type isn't available without DOM lib — use `declare const navigator` ambient declaration for the specific shape needed
- `navigator.userAgent` approach for Electron detection is simpler and works with `contextIsolation: true`

### Direct TS Source Imports for Workspace Packages

- No build step needed: `"main": "./src/index.ts"` and `"types": "./src/index.ts"` point directly to source
- Consuming packages (Next.js via Turbopack) transpile the TS source on-the-fly
- `composite: true` in tsconfig enables project references for incremental builds if needed later

### Zod Installation in Workspace

- Adding `zod` to `packages/shared/package.json` dependencies, then `pnpm install` from root: resolves and installs cleanly (Packages: +1)
- pnpm correctly scopes zod to the shared package while deduping with any existing workspace copies

### SM-2 File Copy Strategy

- Exact copy of SM-2 files from packages/web — relative imports (`'./sm2.types'`) work unchanged
- Web package retains its own copy; Task 6 will update web imports to use `@vocab-hero/shared`

### Verification

- `pnpm tsc --noEmit` in packages/shared: passes cleanly (zero errors)
- `pnpm tsc --noEmit` in packages/web: still passes cleanly (zero web files modified)
- `git diff --name-only packages/web/`: empty — confirmed no web changes

## Task 5: Desktop SQLite Prisma Schema (2026-02-11)

### SQLite vs PostgreSQL Prisma Schema Differences

- SQLite does not support `enum` blocks — all enum types must be replaced with `String`
- Enum default values change syntax: `@default(FLASHCARD)` becomes `@default("FLASHCARD")` (quoted strings)
- Same pattern for all 5 enums: StudyMode, QuizType, NotificationType, NotificationPriority, ThemePreference
- `binaryTargets = ["native", "darwin-arm64"]` added for macOS Apple Silicon compatibility
- `provider = "sqlite"` with `url = env("DATABASE_URL")` where URL is `file:./dev.db` format

### Prisma Client Generation in Desktop Package

- `prisma db push` from packages/desktop/ generates client to hoisted node_modules: `node_modules/.pnpm/@prisma+client@6.1.0_prisma@6.1.0/node_modules/@prisma/client`
- This means web and desktop share the same @prisma/client binary but each has its own schema
- The LAST `prisma generate` wins for the shared client — need to be careful in CI to generate for the right context
- For development, each `prisma db push` auto-generates client for that schema

### Implicit Many-to-Many Works in SQLite

- Prisma implicit M:N (VocabularyGroup ↔ VocabularyItem via `VocabularyGroup[]` / `VocabularyItem[]`) works in SQLite
- Prisma creates the junction table `_VocabularyGroupToVocabularyItem` automatically
- Connect/disconnect/include all work as expected

### .gitignore for SQLite

- Root .gitignore didn't have `*.db` or `*.db-journal` patterns — added them
- SQLite journal files (`*.db-journal`) must also be gitignored (WAL mode creates these)

## Task 4: Replace Prisma enum imports with @vocab-hero/shared (2026-02-11)

### Key Findings
- seed-dev.ts used Prisma runtime enum dot-access (StudyMode.FLASHCARD) which must become string literals ('FLASHCARD') since shared exports Zod-inferred types, not objects
- The notificationMessages object used computed keys [NotificationType.GOAL_ACHIEVED] which became plain string keys 'GOAL_ACHIEVED' with explicit Record<NotificationType, ...> typing
- randomChoice needed explicit generic <NotificationPriority> to maintain type safety with string literal arrays
- 4 files had type-only imports (simple swap), 1 file (seed-dev.ts) had runtime enum usage requiring 8 separate dot-access replacements
- grep on packages/web/ catches .next/ build cache files - use --include='*.ts' --include='*.tsx' to filter source only
- pnpm install with workspace:* just resolved existing packages, no downloads needed
- Test baseline confirmed: 103 files, 1132 passed, 4 skipped (unchanged)

## Task 11: Electron Main Process & Preload Script (2026-02-11)

### Electron TypeScript Compilation Strategy

- Electron main/preload files target Node.js (CommonJS), not browser — need separate tsconfig with `"module": "commonjs"` and `"moduleResolution": "node"`
- Source lives in `electron/`, compiles to `dist/electron/` — `package.json` `"main"` points to `dist/electron/main.js`
- `tsconfig.electron.json` is separate from the general `tsconfig.json` (which targets ESNext/bundler for Prisma code)
- `pnpm build:electron` compiles cleanly; output includes `.js` + `.js.map` for both main and preload

### Electron Security Configuration

- `nodeIntegration: false` + `contextIsolation: true` + `sandbox: true` — full security lockdown
- CSP configured via `session.defaultSession.webRequest.onHeadersReceived` — adds Content-Security-Policy header to all responses
- CSP allows `connect-src http://localhost:*` for the local Next.js server
- Permission handler: only `'media'` (microphone) is allowed; all other permissions denied
- Navigation restricted: only `data:` URLs and `http://localhost:<serverPort>` allowed
- New windows denied; external URLs opened in system browser via `shell.openExternal`

### Preload Script / contextBridge API

- `contextBridge.exposeInMainWorld('electronAPI', {...})` exposes safe IPC bridge to renderer
- Exposed: `platform`, `isElectron`, `sendNotification`, `getAppPath`, `getVersion`
- IPC channels: `show-notification` (one-way), `get-app-path` (invoke), `get-app-version` (invoke)

### Electron Types Hoisting Side Effect

- Installing Electron in `packages/desktop` causes Electron's ambient DOM type extensions to be hoisted
- This makes `document.createElement('a')` return type conflict with Electron's `WebviewTag` in packages/web test files
- The `useExport.test.ts` error is pre-existing (confirmed by testing before/after stash) — not caused by this task
- Fix would require either isolating Electron types or casting in the test file

### electron-builder & electron-winstaller

- `electron-builder` installs cleanly; `electron-winstaller` build script is blocked by pnpm (Windows-only, not needed on macOS)
- Warning about `electron-winstaller` is harmless — only needed for Windows builds

### Package.json Configuration

- `"main": "dist/electron/main.js"` — Electron reads this to find the main process entry
- `"electron:dev": "pnpm build:electron && electron ."` — compile then launch
- `electron` added to root `pnpm.onlyBuiltDependencies` to allow postinstall script

## Task: Next.js Standalone + Electron Integration

### Conditional Standalone in next.config.ts

- Used `STANDALONE=true` env var to conditionally set `output: 'standalone'` and `images: { unoptimized: true }`
- This avoids needing a separate next.config.ts for desktop — web's config handles both modes
- `images: { unoptimized: true }` is required because standalone mode has no image optimization server

### Server Path Discovery

- `__dirname` in compiled Electron main process = `packages/desktop/dist/electron/`
- Path to web's standalone: `path.resolve(__dirname, '..', '..', '..', 'web', '.next', 'standalone')`
- Implemented recursive search (up to depth 3) for `server.js` to handle workspace root nesting
- Both flat (`standalone/server.js`) and nested (`standalone/<project>/server.js`) layouts supported

### Build Script Architecture

- `build:next` runs from packages/web via `cd ../web && STANDALONE=true pnpm build`
- Static asset copy extracted to `scripts/copy-static.js` for maintainability (was inline Node -e initially)
- `build` = `build:next` + `build:electron` in sequence
- `electron:dev` only compiles TS, doesn't rebuild Next.js (for fast iteration)

### Electron Main Process Lifecycle

- Order: configureCSP → configurePermissions → registerIpcHandlers → findAvailablePort → startServer → waitForServer → setServerPort → createWindow
- Server failure is graceful — window still shows with placeholder HTML
- Cleanup via both `before-quit` and `will-quit` events for robustness
- `req.setTimeout(2000)` in waitForServer prevents hanging on slow responses
- `res.resume()` in HTTP polling prevents memory leaks from unconsumed response bodies
