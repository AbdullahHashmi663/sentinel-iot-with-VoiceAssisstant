import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const command = process.argv[2] || 'dev';
const child = spawn(process.execPath, [require.resolve('next/dist/bin/next'), command, ...(command === 'build' ? [] : ['--hostname', '127.0.0.1', '--port', '3001'])], {
  stdio: 'inherit', env: { ...process.env, SENTINEL_INTERFACE: 'client', NEXT_TELEMETRY_DISABLED: '1' },
});
child.on('error', error => { console.error(error.message); process.exitCode = 1; });
child.on('exit', code => { process.exitCode = code || 0; });
process.on('SIGINT', () => child.kill('SIGINT'));
process.on('SIGTERM', () => child.kill('SIGTERM'));
