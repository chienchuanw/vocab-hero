#!/usr/bin/env node

// Copy .next/static into the standalone output directory.
// Next.js standalone mode does NOT include static assets — they must be copied manually.
// The standalone output nests under the project directory name:
//   .next/standalone/<project-dir>/server.js
// So static assets go to .next/standalone/<project-dir>/.next/static

const fs = require('fs');
const path = require('path');

const webDir = path.resolve(__dirname, '..', '..', 'web');
const staticSrc = path.join(webDir, '.next', 'static');
const standaloneDir = path.join(webDir, '.next', 'standalone');

if (!fs.existsSync(staticSrc)) {
  console.error('ERROR: .next/static not found. Run the Next.js build first.');
  process.exit(1);
}

if (!fs.existsSync(standaloneDir)) {
  console.error('ERROR: .next/standalone not found. Build with STANDALONE=true.');
  process.exit(1);
}

// Check flat layout first
const flatServerJs = path.join(standaloneDir, 'server.js');
if (fs.existsSync(flatServerJs)) {
  const dest = path.join(standaloneDir, '.next', 'static');
  fs.cpSync(staticSrc, dest, { recursive: true });
  console.log(`Copied static assets to ${dest}`);
  process.exit(0);
}

// Search for nested server.js (up to 3 levels deep)
function findServerDir(dir, depth) {
  if (depth > 3) return null;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const candidate = path.join(dir, entry.name, 'server.js');
    if (fs.existsSync(candidate)) return path.join(dir, entry.name);
    const nested = findServerDir(path.join(dir, entry.name), depth + 1);
    if (nested) return nested;
  }
  return null;
}

const serverDir = findServerDir(standaloneDir, 0);
if (!serverDir) {
  console.error('ERROR: Could not find server.js in standalone output.');
  process.exit(1);
}

const dest = path.join(serverDir, '.next', 'static');
fs.cpSync(staticSrc, dest, { recursive: true });
console.log(`Copied static assets to ${dest}`);
