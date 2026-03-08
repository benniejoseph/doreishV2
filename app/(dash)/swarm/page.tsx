'use client';

import { useEffect, useState } from 'react';

type Resp<T> = { ok: boolean; result?: T; error?: string };

type SwarmStatus = {
  status: string;
  agentCount: number;
  taskCount: number;
};

export default function SwarmPage() {
  const [status, setStatus] = useState<SwarmStatus | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function fetchStatus() {
    setErr(null);
    const r = await fetch('/api/ruflo/swarm-status');
    const j = (await r.json()) as Resp<SwarmStatus>;
    if (!j.ok) throw new Error(j.error || 'status failed');
    setStatus(j.result || null);
  }

  async function act(kind: 'init' | 'shutdown') {
    setBusy(kind);
    setErr(null);
    try {
      const r = await fetch(`/api/ruflo/swarm-${kind}`, {
        method: 'POST',
      });
      const j = await r.json();
      if (!j.ok) throw new Error(j.error || 'action failed');
      await fetchStatus();
    } catch (e: any) {
      setErr(e?.message || String(e));
    } finally {
      setBusy(null);
    }
  }

  useEffect(() => {
    fetchStatus().catch((e) => setErr(e.message));
    const t = setInterval(() => fetchStatus().catch(() => {}), 5000);
    return () => clearInterval(t);
  }, []);

  return (
    <main className="p-6">
      <div className="flex items-baseline justify-between">
        <h1 className="text-2xl font-semibold">Ruflo Swarm</h1>
        <button
          className="rounded border border-zinc-200 bg-white px-3 py-1 text-sm dark:border-zinc-800 dark:bg-zinc-950"
          onClick={() => fetchStatus()}
          disabled={!!busy}
        >
          Refresh
        </button>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <div className="rounded border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="text-xs text-zinc-500">Status</div>
          <div className="mt-1 font-mono text-lg">{status?.status ?? '—'}</div>
        </div>
        <div className="rounded border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="text-xs text-zinc-500">Agents</div>
          <div className="mt-1 font-mono text-lg">{status?.agentCount ?? '—'}</div>
        </div>
        <div className="rounded border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="text-xs text-zinc-500">Tasks</div>
          <div className="mt-1 font-mono text-lg">{status?.taskCount ?? '—'}</div>
        </div>
      </div>

      <div className="mt-4 flex gap-3">
        <button
          className="rounded bg-emerald-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
          onClick={() => act('init')}
          disabled={busy === 'init'}
        >
          {busy === 'init' ? 'Starting…' : 'Start swarm'}
        </button>
        <button
          className="rounded bg-rose-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
          onClick={() => act('shutdown')}
          disabled={busy === 'shutdown'}
        >
          {busy === 'shutdown' ? 'Stopping…' : 'Shutdown swarm'}
        </button>
      </div>

      {err ? <div className="mt-4 rounded border border-rose-900 bg-rose-950/40 p-3 text-sm text-rose-200">{err}</div> : null}

      <div className="mt-6 text-xs text-zinc-500">
        Controls require Google auth (cookie session).
      </div>
    </main>
  );
}
