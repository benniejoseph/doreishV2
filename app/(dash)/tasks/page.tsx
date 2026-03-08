'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

type Resp<T> = { ok: boolean; result?: T; error?: string };

export default function TasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [err, setErr] = useState<string | null>(null);

  async function refresh() {
    const r = await fetch('/api/ruflo/task-list');
    const j = (await r.json()) as Resp<any>;
    if (!j.ok) throw new Error(j.error || 'task_list failed');
    const list = Array.isArray(j.result) ? j.result : (j.result?.tasks || j.result?.data || []);
    setTasks(list);
  }

  useEffect(() => {
    refresh().catch((e) => setErr(e.message));
    const t = setInterval(() => refresh().catch(() => {}), 7000);
    return () => clearInterval(t);
  }, []);

  return (
    <main className="p-6">
      <div className="flex items-baseline justify-between">
        <h1 className="text-2xl font-semibold">Tasks</h1>
        <button
          className="rounded border border-zinc-200 bg-white px-3 py-1 text-sm dark:border-zinc-800 dark:bg-zinc-950"
          onClick={() => refresh().catch(() => {})}
        >
          Refresh
        </button>
      </div>

      {err ? <div className="mt-4 rounded border border-rose-900 bg-rose-950/40 p-3 text-sm text-rose-200">{err}</div> : null}

      <div className="mt-4 space-y-2">
        {tasks.map((t, i) => {
          const id = t.id || t.taskId || String(i);
          return (
            <div key={id} className="rounded border border-zinc-200 bg-white p-3 text-sm dark:border-zinc-800 dark:bg-zinc-950">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="font-mono">{id}</div>
                <Link className="underline" href={`/tasks/${encodeURIComponent(id)}`}>Details</Link>
              </div>
              <pre className="mt-2 max-h-48 overflow-auto rounded bg-zinc-100 p-2 text-xs text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100">
                {JSON.stringify(t, null, 2)}
              </pre>
            </div>
          );
        })}
        {tasks.length === 0 ? <div className="text-sm text-zinc-500">No tasks.</div> : null}
      </div>
    </main>
  );
}
