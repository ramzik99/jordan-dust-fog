import { mkdirSync, copyFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const root = new URL('../', import.meta.url);
mkdirSync(new URL('dist/', root), { recursive: true });
const result = spawnSync(process.execPath, [fileURLToPath(new URL('node_modules/rollup/dist/bin/rollup', root)), '-c'], {
  cwd: fileURLToPath(root), env: { ...process.env, SERVE: 'false' }, stdio: 'inherit',
});
if (result.error) throw result.error;
if (result.status !== 0) process.exit(result.status ?? 1);
copyFileSync(new URL('package.json', root), new URL('dist/package.json', root));
