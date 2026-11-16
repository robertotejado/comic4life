import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const args = process.argv.slice(2);
const targetArgs = args.length > 0 ? args : ['--win'];
const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const npxCmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';

if (process.platform === 'win32' && (targetArgs.includes('--mac') || targetArgs.includes('-mwl'))) {
  console.error(
    '\n[Aviso] No es posible compilar el instalador .dmg de macOS directamente desde Windows (Apple requiere macOS / hdiutil).\n' +
      '-> En Windows ejecuta: npm run dist:win\n' +
      '-> Para generar Windows (.exe), macOS (.dmg) y Linux (.deb) a la vez, usa el workflow de GitHub Actions incluido (.github/workflows/build-desktop.yml).\n'
  );
  process.exit(1);
}

function runNode(nodeArgs, extraEnv = {}) {
  const res = spawnSync(process.execPath, nodeArgs, {
    cwd: root,
    stdio: 'inherit',
    shell: false,
    env: { ...process.env, ...extraEnv },
  });
  if (res.status !== 0) {
    process.exit(res.status ?? 1);
  }
}

function runShell(cmd, cmdArgs, extraEnv = {}) {
  const res = spawnSync(cmd, cmdArgs, {
    cwd: root,
    stdio: 'inherit',
    shell: process.platform === 'win32',
    env: { ...process.env, ...extraEnv },
  });
  if (res.status !== 0) {
    process.exit(res.status ?? 1);
  }
}

function resolvePkgBin(pkgName, binName) {
  const pkgDir = path.join(root, 'node_modules', pkgName);
  const pkgJsonPath = path.join(pkgDir, 'package.json');
  if (!fs.existsSync(pkgJsonPath)) return null;
  try {
    const pkg = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));
    const binField = pkg.bin;
    const rel =
      typeof binField === 'string'
        ? binField
        : binField && typeof binField === 'object'
          ? binField[binName] || Object.values(binField)[0]
          : null;
    if (!rel) return null;
    const full = path.join(pkgDir, rel);
    return fs.existsSync(full) ? full : null;
  } catch {
    return null;
  }
}

console.log('[1/3] Building Comic4Life web bundle for Electron...');
const viteBin = resolvePkgBin('vite', 'vite');
if (viteBin) {
  runNode([viteBin, 'build', '--mode', 'electron']);
} else {
  runShell(npxCmd, ['vite', 'build', '--mode', 'electron']);
}

const localElectronPkg = path.join(root, 'node_modules', 'electron', 'package.json');
const localBuilderPkg = path.join(root, 'node_modules', 'electron-builder', 'package.json');

if (!fs.existsSync(localElectronPkg) || !fs.existsSync(localBuilderPkg)) {
  console.log('[2/3] Installing local Electron & electron-builder...');
  runShell(npmCmd, [
    'install',
    '--no-save',
    '--foreground-scripts',
    'electron@35.1.5',
    'electron-builder@25.1.8',
  ]);
}

const electronPathTxt = path.join(root, 'node_modules', 'electron', 'path.txt');
const electronInstallScript = path.join(root, 'node_modules', 'electron', 'install.js');
if (!fs.existsSync(electronPathTxt) && fs.existsSync(electronInstallScript)) {
  console.log('[2b/3] Completing Electron binary download...');
  runNode([electronInstallScript]);
}

console.log(`[3/3] Packaging native installer (${targetArgs.join(' ')})...`);
const builderBin = resolvePkgBin('electron-builder', 'electron-builder');
if (builderBin) {
  runNode([builderBin, '--config', 'electron-builder.yml', ...targetArgs, '--publish', 'never']);
} else {
  runShell(npxCmd, ['electron-builder', '--config', 'electron-builder.yml', ...targetArgs, '--publish', 'never']);
}
