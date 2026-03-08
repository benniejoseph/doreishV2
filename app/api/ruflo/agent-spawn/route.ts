import { NextResponse } from 'next/server';
import { z } from 'zod';
import { rufloCall } from '@/lib/ruflo';
import { db } from '@/lib/db';
import crypto from 'crypto';

const Body = z.object({
  type: z.string().min(1).default('coder'),
  name: z.string().optional(),
});

export async function POST(req: Request) {
  const key = req.headers.get('x-doreish-key');
  if (!process.env.DOREISH_INGEST_KEY || key !== process.env.DOREISH_INGEST_KEY) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }

  const json = await req.json().catch(() => ({}));
  const body = Body.parse(json);

  // NOTE: ruflo.agent_spawn schema may accept more params; we start minimal.
  const result = await rufloCall('agent_spawn', [`type=${body.type}`]);

  db().prepare(
    `INSERT INTO events (id, ts, source, type, severity, session_key, agent_id, payload_json)
     VALUES (@id, @ts, @source, @type, @severity, @session_key, @agent_id, @payload_json)`
  ).run({
    id: crypto.randomUUID(),
    ts: Date.now(),
    source: 'ui',
    type: 'ruflo.agent_spawn',
    severity: 'info',
    session_key: null,
    agent_id: null,
    payload_json: JSON.stringify({ request: body, result }),
  });

  return NextResponse.json({ ok: true, result });
}
