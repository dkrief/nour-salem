import { spawnSync } from 'node:child_process';
if (!process.env.npm_execpath) throw new Error('Lancer avec npm run build:release.');
const result = spawnSync(process.execPath, [process.env.npm_execpath, 'run', 'build'], {
  env: { ...process.env, BUILD_MODE: 'production' }, stdio: 'inherit',
});
process.exit(result.status ?? 1);
