import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const npxCmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
const localElectronCli = path.join(root, 'node_modules', 'electron', 'cli.js');
const env = { ...process.env, ELECTRON_START_URL: 'http://localhost:3000' };

const res = fs.existsSync(localElectronCli)
  ? spawnSync(process.execPath, [localElectronCli, '.'], { cwd: root, stdio: 'inherit', env })
  : spawnSync(npxCmd, ['electron', '.'], {
      cwd: root,
      stdio: 'inherit',
      shell: process.platform === 'win32',
      env,
    });

process.exit(res.status ?? 0);
