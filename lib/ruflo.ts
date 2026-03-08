import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

function mustCwd() {
  // IMPORTANT: mcporter reads project config from ./config/mcporter.json
  // Our ruflo server definition is stored in ~/.openclaw/workspace/config/mcporter.json
  // so we run mcporter with cwd=~/.openclaw/workspace.
  return process.env.OPENCLAW_WORKSPACE || '/Users/benniejoseph/.openclaw/workspace';
}

export async function rufloCall<T = unknown>(tool: string, args: string[] = []): Promise<T> {
  const { stdout } = await execFileAsync(
    'mcporter',
    ['call', `ruflo.${tool}`, '--output', 'json', ...args],
    {
      cwd: mustCwd(),
      timeout: 60_000,
      maxBuffer: 10 * 1024 * 1024,
      env: process.env,
    }
  );

  return JSON.parse(stdout) as T;
}
