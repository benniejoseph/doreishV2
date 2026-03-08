import { NextResponse } from 'next/server';
import { z } from 'zod';
import crypto from 'crypto';
import { db } from '@/lib/db';

const EventSchema = z.object({
  ts: z.number().int().optional(),
  source: z.string().min(1),
  type: z.string().min(1),
  severity: z.string().optional(),
  session_key: z.string().optional(),
  agent_id: z.string().optional(),
  payload: z.unknown(),
});

export async function POST(req: Request) {
  const key = req.headers.get('x-doreish-key');
  if (!process.env.DOREISH_INGEST_KEY || key !== process.env.DOREISH_INGEST_KEY) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }

  const json = await req.json().catch(() => null);
  const parsed = EventSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'bad_request', details: parsed.error.flatten() }, { status: 400 });
  }

  const e = parsed.data;
  const id = crypto.randomUUID();
  const ts = e.ts ?? Date.now();

  db().prepare(
    `INSERT INTO events (id, ts, source, type, severity, session_key, agent_id, payload_json)
     VALUES (@id, @ts, @source, @type, @severity, @session_key, @agent_id, @payload_json)`
  ).run({
    id,
    ts,
    source: e.source,
    type: e.type,
    severity: e.severity ?? null,
    session_key: e.session_key ?? null,
    agent_id: e.agent_id ?? null,
    payload_json: JSON.stringify(e.payload ?? null),
  });

  return NextResponse.json({ ok: true, id });
}
