import { NextResponse } from 'next/server';
import { rufloCall } from '@/lib/ruflo';
import { db } from '@/lib/db';
import crypto from 'crypto';

export async function POST(req: Request) {
  const key = req.headers.get('x-doreish-key');
  if (!process.env.DOREISH_INGEST_KEY || key !== process.env.DOREISH_INGEST_KEY) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }

  const result = await rufloCall('swarm_shutdown');

  db().prepare(
    `INSERT INTO events (id, ts, source, type, severity, session_key, agent_id, payload_json)
     VALUES (@id, @ts, @source, @type, @severity, @session_key, @agent_id, @payload_json)`
  ).run({
    id: crypto.randomUUID(),
    ts: Date.now(),
    source: 'ui',
    type: 'ruflo.swarm_shutdown',
    severity: 'warn',
    session_key: null,
    agent_id: null,
    payload_json: JSON.stringify(result),
  });

  return NextResponse.json({ ok: true, result });
}
