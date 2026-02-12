#!/usr/bin/env node

/**
 * resolve-standalone.js
 *
 * Transforms pnpm's symlink-heavy Next.js standalone output into a flat,
 * symlink-free node_modules/ structure suitable for Electron packaging.
 *
 * pnpm standalone output uses a .pnpm/ directory with symlinks for dependency
 * resolution. Electron's electron-builder cannot reliably handle these symlinks
 * when copying to extraResources. This script:
 *
 * 1. Copies all non-symlink files/dirs from the standalone output
 * 2. Walks .pnpm/<pkg>@<ver>/node_modules/<name>/ to find real package dirs
 * 3. Copies each real package to the top-level node_modules/<name>/
 * 4. Handles packages/web/node_modules/ symlinks the same way
 * 5. Removes .pnpm/ from the output (no longer needed)
 * 6. Verifies zero symlinks remain
 */

const fs = require('fs');
const path = require('path');

const STANDALONE_SRC = path.resolve(__dirname, '..', '..', 'web', '.next', 'standalone');
const STANDALONE_DEST = path.resolve(__dirname, '..', 'standalone-resolved');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Recursively copy a directory, skipping symlinks.
 * Returns list of skipped symlink paths for later processing.
 */
function copyDirSkipSymlinks(src, dest, skippedSymlinks = []) {
  fs.mkdirSync(dest, { recursive: true });

  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isSymbolicLink()) {
      skippedSymlinks.push({ src: srcPath, dest: destPath });
      continue;
    }

    if (entry.isDirectory()) {
      copyDirSkipSymlinks(srcPath, destPath, skippedSymlinks);
    } else if (entry.isFile()) {
      fs.copyFileSync(srcPath, destPath);
    }
  }

  return skippedSymlinks;
}

/**
 * Recursively copy a directory (following symlinks — deep copy).
 */
function copyDirDeep(src, dest) {
  // Resolve symlinks at the source level
  const realSrc = fs.realpathSync(src);

  if (!fs.existsSync(realSrc)) {
    console.warn(`  [warn] Source does not exist: ${realSrc}`);
    return;
  }

  const stat = fs.statSync(realSrc);
  if (!stat.isDirectory()) {
    // It's a file, just copy
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(realSrc, dest);
    return;
  }

  fs.mkdirSync(dest, { recursive: true });

  const entries = fs.readdirSync(realSrc, { withFileTypes: true });
  for (const entry of entries) {
    const entrySrc = path.join(realSrc, entry.name);
    const entryDest = path.join(dest, entry.name);

    if (entry.isSymbolicLink()) {
      // Resolve and copy the target
      try {
        const target = fs.realpathSync(entrySrc);
        const targetStat = fs.statSync(target);
        if (targetStat.isDirectory()) {
          copyDirDeep(target, entryDest);
        } else {
          fs.mkdirSync(path.dirname(entryDest), { recursive: true });
          fs.copyFileSync(target, entryDest);
        }
      } catch {
        console.warn(`  [warn] Broken symlink, skipping: ${entrySrc}`);
      }
    } else if (entry.isDirectory()) {
      copyDirDeep(entrySrc, entryDest);
    } else if (entry.isFile()) {
      fs.copyFileSync(entrySrc, entryDest);
    }
  }
}

/**
 * Recursively remove a directory.
 */
function rmrf(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
}

/**
 * Count symlinks recursively in a directory.
 */
function countSymlinks(dir) {
  let count = 0;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isSymbolicLink()) {
      count++;
    } else if (entry.isDirectory()) {
      count += countSymlinks(fullPath);
    }
  }
  return count;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
  console.log('[resolve-standalone] Starting...');
  console.log(`  Source: ${STANDALONE_SRC}`);
  console.log(`  Dest:   ${STANDALONE_DEST}`);

  // Validate source exists
  if (!fs.existsSync(STANDALONE_SRC)) {
    console.error(`[resolve-standalone] ERROR: Standalone output not found at ${STANDALONE_SRC}`);
    console.error('  Run "pnpm build:next" from packages/desktop first.');
    process.exit(1);
  }

  // Clean destination
  if (fs.existsSync(STANDALONE_DEST)) {
    console.log('  Removing old standalone-resolved/...');
    rmrf(STANDALONE_DEST);
  }

  // Step 1: Copy everything except symlinks
  console.log('  Step 1: Copying non-symlink files...');
  const skippedSymlinks = copyDirSkipSymlinks(STANDALONE_SRC, STANDALONE_DEST);
  console.log(`  Skipped ${skippedSymlinks.length} symlinks`);

  // Step 2: Walk .pnpm/ and extract real packages to top-level node_modules/
  const pnpmDir = path.join(STANDALONE_SRC, 'node_modules', '.pnpm');
  const destNodeModules = path.join(STANDALONE_DEST, 'node_modules');

  if (fs.existsSync(pnpmDir)) {
    console.log('  Step 2: Extracting packages from .pnpm/ to flat node_modules/...');

    const pnpmEntries = fs.readdirSync(pnpmDir, { withFileTypes: true });
    let packagesCopied = 0;

    for (const entry of pnpmEntries) {
      // Skip the hoisted node_modules dir inside .pnpm/
      if (entry.name === 'node_modules') continue;
      if (!entry.isDirectory()) continue;

      const pkgNodeModules = path.join(pnpmDir, entry.name, 'node_modules');
      if (!fs.existsSync(pkgNodeModules)) continue;

      // Inside each .pnpm/<pkg>@<ver>/node_modules/, there are real dirs and symlinks.
      // We only want real directories (symlinks point to other packages we'll copy separately).
      const innerEntries = fs.readdirSync(pkgNodeModules, { withFileTypes: true });

      for (const inner of innerEntries) {
        const innerPath = path.join(pkgNodeModules, inner.name);

        if (inner.isSymbolicLink()) {
          // Skip symlinks — they point to other packages that have their own .pnpm entry
          continue;
        }

        if (!inner.isDirectory()) continue;

        // Handle scoped packages (@next, @swc, @img, @prisma, etc.)
        if (inner.name.startsWith('@')) {
          const scopeDir = path.join(pkgNodeModules, inner.name);
          const scopeEntries = fs.readdirSync(scopeDir, { withFileTypes: true });

          for (const scopeEntry of scopeEntries) {
            if (scopeEntry.isSymbolicLink()) continue;
            if (!scopeEntry.isDirectory()) continue;

            const scopedPkgName = `${inner.name}/${scopeEntry.name}`;
            const destPkgDir = path.join(destNodeModules, inner.name, scopeEntry.name);

            if (!fs.existsSync(destPkgDir)) {
              const srcPkgDir = path.join(scopeDir, scopeEntry.name);
              copyDirDeep(srcPkgDir, destPkgDir);
              packagesCopied++;
            }
          }
        } else {
          // Regular package
          const destPkgDir = path.join(destNodeModules, inner.name);

          if (!fs.existsSync(destPkgDir)) {
            copyDirDeep(innerPath, destPkgDir);
            packagesCopied++;
          }
        }
      }
    }

    console.log(`  Copied ${packagesCopied} packages to top-level node_modules/`);
  }

  // Step 3: Handle packages/web/node_modules/ symlinks
  console.log('  Step 3: Resolving packages/web/node_modules/ symlinks...');
  const webNodeModules = path.join(STANDALONE_DEST, 'packages', 'web', 'node_modules');

  if (fs.existsSync(path.join(STANDALONE_SRC, 'packages', 'web', 'node_modules'))) {
    const webNmSrc = path.join(STANDALONE_SRC, 'packages', 'web', 'node_modules');
    const webNmEntries = fs.readdirSync(webNmSrc, { withFileTypes: true });

    for (const entry of webNmEntries) {
      const srcPath = path.join(webNmSrc, entry.name);
      const destPath = path.join(webNodeModules, entry.name);

      if (entry.isSymbolicLink()) {
        // Resolve the symlink and copy the real content
        try {
          const realTarget = fs.realpathSync(srcPath);
          if (fs.statSync(realTarget).isDirectory()) {
            if (!fs.existsSync(destPath)) {
              copyDirDeep(realTarget, destPath);
              console.log(`    Resolved: ${entry.name}`);
            }
          }
        } catch {
          console.warn(`    [warn] Broken symlink in web/node_modules: ${entry.name}`);
        }
      }
    }
  }

  // Step 4: Resolve remaining symlinks by reading targets from SOURCE
  console.log('  Step 4: Resolving remaining symlinks...');
  resolveSymlinksFromSource(STANDALONE_SRC, STANDALONE_DEST);

  // Step 5: Remove .pnpm/ from destination (no longer needed)
  const destPnpmDir = path.join(STANDALONE_DEST, 'node_modules', '.pnpm');
  if (fs.existsSync(destPnpmDir)) {
    console.log('  Step 5: Removing .pnpm/ from output...');
    rmrf(destPnpmDir);
  }

  // Step 6: Verify zero symlinks
  console.log('  Step 6: Verifying zero symlinks...');
  const symlinkCount = countSymlinks(STANDALONE_DEST);
  if (symlinkCount > 0) {
    console.warn(`  [warn] Found ${symlinkCount} remaining symlinks!`);
    listSymlinks(STANDALONE_DEST);
  } else {
    console.log('  Zero symlinks remaining.');
  }

  const topLevelPkgs = fs.readdirSync(path.join(STANDALONE_DEST, 'node_modules'))
    .filter(name => !name.startsWith('.'));
  console.log(`\n[resolve-standalone] Done!`);
  console.log(`  Top-level packages: ${topLevelPkgs.join(', ')}`);

  const criticalFiles = [
    'packages/web/server.js',
    'node_modules/next/package.json',
    'node_modules/react/package.json',
    'node_modules/styled-jsx/package.json',
  ];

  let allGood = true;
  for (const f of criticalFiles) {
    const fullPath = path.join(STANDALONE_DEST, f);
    if (fs.existsSync(fullPath)) {
      console.log(`  [ok] ${f}`);
    } else {
      console.error(`  [MISSING] ${f}`);
      allGood = false;
    }
  }

  if (!allGood) {
    console.error('\n[resolve-standalone] ERROR: Some critical files are missing!');
    process.exit(1);
  }
}

function resolveSymlinksFromSource(srcRoot, destRoot) {
  walkForMissingSymlinks(srcRoot, destRoot, srcRoot, destRoot);
}

function walkForMissingSymlinks(srcDir, destDir, srcRoot, destRoot) {
  if (!fs.existsSync(srcDir)) return;

  const entries = fs.readdirSync(srcDir, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);

    if (entry.isSymbolicLink()) {
      if (!fs.existsSync(destPath)) {
        try {
          const realTarget = fs.realpathSync(srcPath);
          if (fs.statSync(realTarget).isDirectory()) {
            copyDirDeep(realTarget, destPath);
          } else {
            fs.mkdirSync(path.dirname(destPath), { recursive: true });
            fs.copyFileSync(realTarget, destPath);
          }
          console.log(`    Resolved from source: ${path.relative(destRoot, destPath)}`);
        } catch {
          console.warn(`    [warn] Could not resolve: ${path.relative(srcRoot, srcPath)}`);
        }
      }
    } else if (entry.isDirectory()) {
      walkForMissingSymlinks(srcPath, destPath, srcRoot, destRoot);
    }
  }
}

function listSymlinks(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isSymbolicLink()) {
      const target = fs.readlinkSync(fullPath);
      console.log(`    symlink: ${fullPath} -> ${target}`);
    } else if (entry.isDirectory()) {
      listSymlinks(fullPath);
    }
  }
}

main();
