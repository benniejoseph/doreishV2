'use client';

import { useEffect, useState } from 'react';

type Resp<T> = { ok: boolean; result?: T; error?: string };

export default function RunbooksPage() {
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [repoPath, setRepoPath] = useState('');
  const [ref, setRef] = useState('HEAD');
  const [tasks, setTasks] = useState<any[]>([]);

  async function refreshTasks() {
    const r = await fetch('/api/ruflo/task-list');
    const j = (await r.json()) as Resp<any>;
    if (!j.ok) throw new Error(j.error || 'task_list failed');
    const list = Array.isArray(j.result) ? j.result : (j.result?.tasks || j.result?.data || []);
    setTasks(list);
  }

  async function createTask(type: string, description: string, tags: string[] = []) {
    setBusy(type);
    setErr(null);
    try {
      const r = await fetch('/api/ruflo/task-create', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({ type, description, priority: 'high', tags }),
      });
      const j = await r.json();
      if (!j.ok) throw new Error(j.error || 'task_create failed');
      await refreshTasks();
    } catch (e: any) {
      setErr(e?.message || String(e));
    } finally {
      setBusy(null);
    }
  }

  useEffect(() => {
    refreshTasks().catch(() => {});
    const t = setInterval(() => refreshTasks().catch(() => {}), 7000);
    return () => clearInterval(t);
  }, []);

  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold">Runbooks</h1>
      <p className="mt-2 text-sm text-zinc-500">
        One-click workflows (MVP). For now these create Ruflo tasks; we’ll add collection + report rendering next.
      </p>

      {err ? <div className="mt-4 rounded border border-rose-900 bg-rose-950/40 p-3 text-sm text-rose-200">{err}</div> : null}

      <section className="mt-6 rounded border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
        <h2 className="font-semibold">1) Code review + bug/security report</h2>
        <div className="mt-3 grid gap-2 md:grid-cols-2">
          <input
            className="rounded border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950"
            placeholder="Repo path (local) e.g. /Users/.../myrepo"
            value={repoPath}
            onChange={(e) => setRepoPath(e.target.value)}
          />
          <input
            className="rounded border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950"
            placeholder="Git ref/range (e.g. HEAD~1..HEAD or HEAD)"
            value={ref}
            onChange={(e) => setRef(e.target.value)}
          />
        </div>
        <button
          className="mt-3 rounded bg-zinc-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
          disabled={busy === 'code_review'}
          onClick={() =>
            createTask(
              'code_review',
              `Review codebase for bugs, security issues, inefficiencies, dead code, and logic flaws. Produce a complete report.\n\nTarget repo: ${repoPath || '(not set)'}\nRef: ${ref}`,
              ['code', 'security', 'review']
            )
          }
        >
          {busy === 'code_review' ? 'Creating…' : 'Run code review'}
        </button>
      </section>

      <section className="mt-4 rounded border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
        <h2 className="font-semibold">2) Instagram multi-page post (tradertaper.com, ICT principles)</h2>
        <button
          className="mt-3 rounded bg-zinc-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
          disabled={busy === 'ig_post'}
          onClick={() =>
            createTask(
              'marketing_creative',
              'Create an Instagram carousel (8–10 slides) for tradertaper.com about ICT trading principles. Provide: hook slide, slide-by-slide copy, suggested visuals, CTA, caption, and hashtag set. Audience: Indian retail traders; tone: confident, educational, not scammy.',
              ['marketing', 'instagram', 'trading']
            )
          }
        >
          {busy === 'ig_post' ? 'Creating…' : 'Generate IG carousel'}
        </button>
      </section>

      <section className="mt-4 rounded border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
        <h2 className="font-semibold">3) Check customer emails + draft replies</h2>
        <button
          className="mt-3 rounded bg-zinc-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
          disabled={busy === 'email_draft'}
          onClick={() =>
            createTask(
              'customer_email',
              'Check for new customer emails and draft replies (DO NOT SEND). Extract action items + suggested reply. If Gmail integration is not available, output a checklist of what data is needed and a reply template.',
              ['support', 'email']
            )
          }
        >
          {busy === 'email_draft' ? 'Creating…' : 'Draft customer replies'}
        </button>
      </section>

      <section className="mt-6">
        <div className="flex items-baseline justify-between">
          <h2 className="font-semibold">Tasks</h2>
          <button
            className="rounded border border-zinc-200 bg-white px-3 py-1 text-sm dark:border-zinc-800 dark:bg-zinc-950"
            onClick={() => refreshTasks().catch(() => {})}
          >
            Refresh
          </button>
        </div>

        <div className="mt-2 space-y-2">
          {tasks.map((t, i) => (
            <div key={t.id || t.taskId || i} className="rounded border border-zinc-200 bg-white p-3 text-sm dark:border-zinc-800 dark:bg-zinc-950">
              <div className="font-mono">{t.id || t.taskId || '(no id)'}</div>
              <pre className="mt-2 max-h-48 overflow-auto rounded bg-zinc-100 p-2 text-xs text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100">
                {JSON.stringify(t, null, 2)}
              </pre>
            </div>
          ))}
          {tasks.length === 0 ? <div className="text-sm text-zinc-500">No tasks yet.</div> : null}
        </div>
      </section>
    </main>
  );
}
