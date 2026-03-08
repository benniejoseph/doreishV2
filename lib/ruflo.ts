import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

function mustCwd() {
  // IMPORTANT: mcporter reads project config from ./config/mcporter.json
  // Our ruflo server definition is stored in ~/.openclaw/workspace/config/mcporter.json
  // so we run mcporter with cwd=~/.openclaw/workspace.
  return process.env.OPENCLAW_WORKSPACE || '/Users/benniejoseph/.openclaw/workspace';
}

/**
 * Ruflo call strategy:
 * - Local dev: call mcporter -> ruflo (stdio)
 * - Cloud (Vercel): call a local "doreish-node" over HTTPS (outbound tunnel) when configured.
 */
export async function rufloCall<T = unknown>(tool: string, args: string[] = []): Promise<T> {
  const nodeUrl = process.env.DOREISH_NODE_URL;
  const nodeKey = process.env.DOREISH_NODE_KEY;

  if (nodeUrl) {
    const res = await fetch(`${nodeUrl.replace(/\/$/, '')}/ruflo/call`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        ...(nodeKey ? { 'x-doreish-node-key': nodeKey } : {}),
      },
      body: JSON.stringify({ tool, args }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`doreish-node error (${res.status}): ${text}`);
    }
    return (await res.json()) as T;
  }

  const { stdout } = await execFileAsync('mcporter', ['call', `ruflo.${tool}`, '--output', 'json', ...args], {
    cwd: mustCwd(),
    timeout: 60_000,
    maxBuffer: 10 * 1024 * 1024,
    env: process.env,
  });

  return JSON.parse(stdout) as T;
}
