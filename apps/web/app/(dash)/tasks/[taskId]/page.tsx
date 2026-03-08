'use client';

import { useEffect, useState } from 'react';

type Resp<T> = { ok: boolean; result?: T; error?: string };

export default function TaskDetailPage({ params }: { params: { taskId: string } }) {
  const taskId = params.taskId;
  const [status, setStatus] = useState<any>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [newStatus, setNewStatus] = useState('In Progress');
  const [progress, setProgress] = useState(0);

  async function refresh() {
    const r = await fetch(`/api/ruflo/task-status?taskId=${encodeURIComponent(taskId)}`);
    const j = (await r.json()) as Resp<any>;
    if (!j.ok) throw new Error(j.error || 'task_status failed');
    setStatus(j.result);
  }

  async function update() {
    setBusy('update');
    setErr(null);
    try {
      const r = await fetch('/api/ruflo/task-update', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ taskId, status: newStatus, progress }),
      });
      const j = await r.json();
      if (!j.ok) throw new Error(j.error || 'task_update failed');
      await refresh();
    } catch (e: any) {
      setErr(e?.message || String(e));
    } finally {
      setBusy(null);
    }
  }

  useEffect(() => {
    refresh().catch((e) => setErr(e.message));
  }, [taskId]);

  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold">Task</h1>
      <div className="mt-1 font-mono text-sm text-zinc-500">{taskId}</div>

      {err ? <div className="mt-4 rounded border border-rose-900 bg-rose-950/40 p-3 text-sm text-rose-200">{err}</div> : null}

      <div className="mt-4 rounded border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="text-xs text-zinc-500">Current status payload</div>
        <pre className="mt-2 max-h-80 overflow-auto rounded bg-zinc-100 p-2 text-xs text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100">
          {JSON.stringify(status, null, 2)}
        </pre>
      </div>

      <div className="mt-4 rounded border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
        <h2 className="font-semibold">Update (canonical: Ruflo)</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          <select
            className="rounded border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950"
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
          >
            {['Todo', 'In Progress', 'In Review', 'Done', 'Cancelled'].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <input
            className="w-32 rounded border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950"
            type="number"
            min={0}
            max={100}
            value={progress}
            onChange={(e) => setProgress(parseInt(e.target.value || '0', 10))}
          />
          <button
            className="rounded bg-zinc-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
            onClick={update}
            disabled={busy === 'update'}
          >
            {busy === 'update' ? 'Updating…' : 'Update task'}
          </button>
        </div>
      </div>
    </main>
  );
}
