import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default function TimelinePage() {
  const rows = db().prepare(
    `SELECT id, ts, source, type, severity, session_key, agent_id, payload_json
     FROM events
     ORDER BY ts DESC
     LIMIT 200`
  ).all() as any[];

  return (
    <main className="p-6">
      <div className="flex items-baseline justify-between">
        <h1 className="text-2xl font-semibold">Timeline</h1>
        <div className="text-xs text-neutral-500">latest 200 events</div>
      </div>

      <div className="mt-4 space-y-2">
        {rows.map((r) => (
          <div key={r.id} className="rounded border border-neutral-800 bg-neutral-950/40 p-3">
            <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm">
              <span className="font-mono text-neutral-400">{new Date(r.ts).toLocaleString()}</span>
              <span className="rounded bg-neutral-800 px-2 py-0.5 font-mono">{r.source}</span>
              <span className="rounded bg-neutral-800 px-2 py-0.5 font-mono">{r.type}</span>
              {r.severity ? <span className="rounded bg-neutral-800 px-2 py-0.5 font-mono">{r.severity}</span> : null}
              {r.session_key ? <span className="text-neutral-400">session: {r.session_key}</span> : null}
              {r.agent_id ? <span className="text-neutral-400">agent: {r.agent_id}</span> : null}
            </div>
            <pre className="mt-2 max-h-48 overflow-auto rounded bg-neutral-900 p-2 text-xs text-neutral-200">
              {JSON.stringify(JSON.parse(r.payload_json), null, 2)}
            </pre>
          </div>
        ))}
        {rows.length === 0 ? (
          <div className="rounded border border-dashed border-neutral-800 p-6 text-neutral-400">
            No events yet. POST to /api/events with x-doreish-key.
          </div>
        ) : null}
      </div>
    </main>
  );
}
