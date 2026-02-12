#!/usr/bin/env node

// Copy the generated Prisma client from pnpm's store to a local node_modules/.prisma/client/
// directory that electron-builder can discover.
//
// In pnpm workspaces, the generated client lives at:
//   node_modules/.pnpm/@prisma+client@<ver>_prisma@<ver>/node_modules/.prisma/client/
// electron-builder uses npm-style resolution and expects:
//   node_modules/.prisma/client/
//
// This script dynamically resolves the path so it doesn't hardcode the pnpm store version.

const fs = require('fs');
const path = require('path');

const desktopDir = path.resolve(__dirname, '..');

function findPrismaClientDir() {
  const prismaClientEntry = require.resolve('@prisma/client', {
    paths: [desktopDir],
  });

  // Walk up from resolved entry (e.g. .../@prisma/client/default.js) to find
  // the parent node_modules, then locate sibling .prisma/client/ directory.
  let dir = path.dirname(prismaClientEntry);
  while (dir && path.basename(dir) !== '@prisma') {
    dir = path.dirname(dir);
  }

  if (!dir || path.basename(dir) !== '@prisma') {
    throw new Error(
      `Could not find @prisma directory in resolved path: ${prismaClientEntry}`
    );
  }

  const nodeModulesDir = path.dirname(dir);
  const dotPrismaClient = path.join(nodeModulesDir, '.prisma', 'client');

  if (!fs.existsSync(dotPrismaClient)) {
    throw new Error(
      `Generated Prisma client not found at: ${dotPrismaClient}\n` +
        'Run "pnpm prisma generate" first.'
    );
  }

  return dotPrismaClient;
}

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

const srcDir = findPrismaClientDir();
const destDir = path.join(desktopDir, 'node_modules', '.prisma', 'client');

console.log(`Source:      ${srcDir}`);
console.log(`Destination: ${destDir}`);

if (fs.existsSync(destDir)) {
  fs.rmSync(destDir, { recursive: true, force: true });
}

copyDir(srcDir, destDir);

const criticalFiles = ['default.js', 'package.json', 'schema.prisma'];
const missing = criticalFiles.filter(
  (f) => !fs.existsSync(path.join(destDir, f))
);

if (missing.length > 0) {
  console.error(`ERROR: Missing critical files: ${missing.join(', ')}`);
  process.exit(1);
}

const fileCount = fs.readdirSync(destDir).length;
console.log(`Copied ${fileCount} files to ${destDir}`);

const nativeEngines = fs
  .readdirSync(destDir)
  .filter((f) => f.includes('libquery_engine') || f.includes('query_engine'));
if (nativeEngines.length > 0) {
  console.log(`Native engine(s): ${nativeEngines.join(', ')}`);
} else {
  console.warn('WARNING: No native query engine found in copied files.');
}
