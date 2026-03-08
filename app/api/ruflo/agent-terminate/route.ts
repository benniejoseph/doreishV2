import { NextResponse } from 'next/server';
import { z } from 'zod';
import { rufloCall } from '@/lib/ruflo';
import { db } from '@/lib/db';
import crypto from 'crypto';

const Body = z.object({
  agentId: z.string().min(1),
});

export async function POST(req: Request) {
  const key = req.headers.get('x-doreish-key');
  if (!process.env.DOREISH_INGEST_KEY || key !== process.env.DOREISH_INGEST_KEY) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }

  const json = await req.json().catch(() => null);
  const body = Body.parse(json);

  const result = await rufloCall('agent_terminate', [`agentId=${body.agentId}`]);

  db().prepare(
    `INSERT INTO events (id, ts, source, type, severity, session_key, agent_id, payload_json)
     VALUES (@id, @ts, @source, @type, @severity, @session_key, @agent_id, @payload_json)`
  ).run({
    id: crypto.randomUUID(),
    ts: Date.now(),
    source: 'ui',
    type: 'ruflo.agent_terminate',
    severity: 'warn',
    session_key: null,
    agent_id: body.agentId,
    payload_json: JSON.stringify(result),
  });

  return NextResponse.json({ ok: true, result });
}
