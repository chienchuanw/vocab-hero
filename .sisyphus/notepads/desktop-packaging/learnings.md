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
