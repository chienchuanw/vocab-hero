const fs = require('fs');
const path = require('path');

// electron-builder skips dot-directories in node_modules, so .prisma/client
// never ends up in the asar. This afterPack hook copies .prisma/client into
// app.asar.unpacked where Electron's require() can find it.
exports.default = async function afterPack(context) {
  const appName = context.packager.appInfo.productFilename;
  const platform = context.electronPlatformName;

  let resourcesDir;
  if (platform === 'darwin') {
    resourcesDir = path.join(context.appOutDir, `${appName}.app`, 'Contents', 'Resources');
  } else {
    resourcesDir = path.join(context.appOutDir, 'resources');
  }

  // context.packager.projectDir is the packages/desktop directory
  const projectDir = context.packager.projectDir;
  const src = path.join(projectDir, 'node_modules', '.prisma');
  const dest = path.join(resourcesDir, 'app.asar.unpacked', 'node_modules', '.prisma');

  if (!fs.existsSync(src)) {
    console.warn(`[after-pack] WARNING: ${src} not found. Run "node scripts/copy-prisma-client.js" first.`);
    return;
  }

  copyDirSync(src, dest);

  const fileCount = fs.readdirSync(path.join(dest, 'client')).length;
  console.log(`[after-pack] Copied .prisma (${fileCount} files) to ${dest}`);

  // electron-builder's extraResources auto-excludes node_modules directories.
  // Copy standalone-resolved (which contains node_modules with all deps) directly
  // into Resources to bypass this filter.
  const standaloneSrc = path.join(projectDir, 'standalone-resolved');
  const standaloneDest = path.join(resourcesDir, 'standalone');

  if (fs.existsSync(standaloneSrc)) {
    console.log(`[after-pack] Copying standalone-resolved → ${standaloneDest}`);
    copyDirSync(standaloneSrc, standaloneDest);
    console.log(`[after-pack] Standalone copy complete`);
  } else {
    console.warn(`[after-pack] WARNING: ${standaloneSrc} not found. Run "node scripts/resolve-standalone.js" first.`);
  }

  // Also copy static assets
  const staticSrc = path.join(projectDir, '..', 'web', '.next', 'static');
  const staticDest = path.join(resourcesDir, 'standalone-static');

  if (fs.existsSync(staticSrc)) {
    copyDirSync(staticSrc, staticDest);
    console.log(`[after-pack] Copied static assets to ${staticDest}`);
  }
};

function copyDirSync(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirSync(s, d);
    } else {
      fs.copyFileSync(s, d);
    }
  }
}
