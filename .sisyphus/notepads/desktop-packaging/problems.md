# problems - Desktop Packaging


## Runtime Bugs in Packaged .app (2026-02-12)

### P1: `spawn('node', ...)` fails in packaged app
- **Location**: `electron/main.ts` → `startServer()` line 150
- **Root cause**: macOS GUI apps get minimal PATH from launchd, doesn't include nvm/homebrew Node
- **Impact**: Server never starts, window shows blank
- **Fix**: Use `utilityProcess.fork()` or `process.execPath` with `--no-electron` flag

### P2: `execSync('npx prisma ...')` fails in packaged app  
- **Location**: `electron/database.ts` → `initializeDatabase()` lines 105/114
- **Root cause**: `npx`, `prisma`, `tsx` not on GUI PATH; also @prisma/client generated for PostgreSQL not SQLite
- **Impact**: Database never created on first run
- **Fix**: Use better-sqlite3 directly or bundle prisma CLI; generate separate @prisma/client for desktop

### P3: Silent failures — no user feedback
- **Location**: `electron/main.ts` lines 337-338
- **Root cause**: `console.error` not visible in macOS GUI apps
- **Impact**: User sees blank window with no explanation
- **Fix**: Use `dialog.showErrorBox()` for production error reporting
