'use client';

import { useEffect, useState } from 'react';

type Resp<T> = { ok: boolean; result?: T; error?: string };

export default function AgentsPage() {
  const [agents, setAgents] = useState<any[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [spawnType, setSpawnType] = useState('coder');

  async function refresh() {
    setErr(null);
    const r = await fetch('/api/ruflo/agent-list');
    const j = (await r.json()) as Resp<any>;
    if (!j.ok) throw new Error(j.error || 'list failed');
    const list = Array.isArray(j.result) ? j.result : (j.result?.agents || j.result?.data || []);
    setAgents(list);
  }

  async function spawn() {
    setBusy('spawn');
    setErr(null);
    try {
      const r = await fetch('/api/ruflo/agent-spawn', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({ type: spawnType }),
      });
      const j = await r.json();
      if (!j.ok) throw new Error(j.error || 'spawn failed');
      await refresh();
    } catch (e: any) {
      setErr(e?.message || String(e));
    } finally {
      setBusy(null);
    }
  }

  async function terminate(agentId: string) {
    setBusy(`term:${agentId}`);
    setErr(null);
    try {
      const r = await fetch('/api/ruflo/agent-terminate', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({ agentId }),
      });
      const j = await r.json();
      if (!j.ok) throw new Error(j.error || 'terminate failed');
      await refresh();
    } catch (e: any) {
      setErr(e?.message || String(e));
    } finally {
      setBusy(null);
    }
  }

  useEffect(() => {
    refresh().catch((e) => setErr(e.message));
    const t = setInterval(() => refresh().catch(() => {}), 5000);
    return () => clearInterval(t);
  }, []);

  return (
    <main className="p-6">
      <div className="flex items-baseline justify-between">
        <h1 className="text-2xl font-semibold">Ruflo Agents</h1>
        <button
          className="rounded border border-zinc-200 bg-white px-3 py-1 text-sm dark:border-zinc-800 dark:bg-zinc-950"
          onClick={() => refresh()}
          disabled={!!busy}
        >
          Refresh
        </button>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <select
          className="rounded border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950"
          value={spawnType}
          onChange={(e) => setSpawnType(e.target.value)}
        >
          {['coder', 'tester', 'reviewer', 'architect', 'security'].map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <button
          className="rounded bg-emerald-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
          onClick={spawn}
          disabled={busy === 'spawn'}
        >
          {busy === 'spawn' ? 'Spawning…' : 'Spawn agent'}
        </button>
      </div>

      {err ? <div className="mt-4 rounded border border-rose-900 bg-rose-950/40 p-3 text-sm text-rose-200">{err}</div> : null}

      <div className="mt-4 space-y-2">
        {agents.map((a, idx) => {
          const id = a.id || a.agentId || a.name || String(idx);
          return (
            <div key={id} className="rounded border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="font-mono text-sm">{id}</div>
                <button
                  className="rounded bg-rose-600 px-3 py-1 text-sm font-medium text-white disabled:opacity-50"
                  onClick={() => terminate(a.id || a.agentId || id)}
                  disabled={busy === `term:${a.id || a.agentId || id}`}
                >
                  Terminate
                </button>
              </div>
              <pre className="mt-2 max-h-48 overflow-auto rounded bg-zinc-100 p-2 text-xs text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100">
                {JSON.stringify(a, null, 2)}
              </pre>
            </div>
          );
        })}
        {agents.length === 0 ? (
          <div className="rounded border border-dashed border-zinc-300 p-6 text-sm text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
            No agents listed.
          </div>
        ) : null}
      </div>
    </main>
  );
}
