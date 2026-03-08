import { NextResponse } from 'next/server';
import { z } from 'zod';
import { rufloCall } from '@/lib/ruflo';
import { requireSession } from '@/lib/requireSession';
import { db } from '@/lib/db';
import crypto from 'crypto';

const Body = z.object({
  taskId: z.string().min(1),
  status: z.string().optional(),
  progress: z.number().min(0).max(100).optional(),
});

export async function POST(req: Request) {
  try {
    await requireSession();
  } catch {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }

  const json = await req.json().catch(() => null);
  const body = Body.parse(json);

  const result = await rufloCall('task_update', [
    `taskId=${body.taskId}`,
    ...(body.status ? [`status=${body.status}`] : []),
    ...(body.progress !== undefined ? [`progress=${body.progress}`] : []),
  ]);

  db().prepare(
    `INSERT INTO events (id, ts, source, type, severity, session_key, agent_id, payload_json)
     VALUES (@id, @ts, @source, @type, @severity, @session_key, @agent_id, @payload_json)`
  ).run({
    id: crypto.randomUUID(),
    ts: Date.now(),
    source: 'ui',
    type: 'ruflo.task_update',
    severity: 'info',
    session_key: null,
    agent_id: null,
    payload_json: JSON.stringify({ request: body, result }),
  });

  return NextResponse.json({ ok: true, result });
}
