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
