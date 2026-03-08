import { NextResponse } from 'next/server';
import { z } from 'zod';
import { rufloCall } from '@/lib/ruflo';
import { db } from '@/lib/db';
import crypto from 'crypto';
import { requireSession } from '@/lib/requireSession';
import { linearCreateIssue, linearResolveTeamAndStates } from '@/lib/linear';

const Body = z.object({
  type: z.string().min(1),
  description: z.string().min(1),
  priority: z.string().optional(),
  assignTo: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
});

export async function POST(req: Request) {
  try {
    await requireSession();
  } catch {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }

  const json = await req.json().catch(() => null);
  const body = Body.parse(json);

  // Ensure swarm exists (best-effort)
  try {
    await rufloCall('swarm_init');
  } catch {}

  const result = await rufloCall('task_create', [
    `type=${body.type}`,
    `description=${body.description}`,
    ...(body.priority ? [`priority=${body.priority}`] : []),
    ...(body.assignTo?.length ? body.assignTo.map((a) => `assignTo[]=${a}`) : []),
    ...(body.tags?.length ? body.tags.map((t) => `tags[]=${t}`) : []),
  ]);

  const taskId = (result as any)?.taskId || (result as any)?.id || null;

  // Create matching Linear issue (best-effort)
  let linear: any = null;
  try {
    const teamKey = process.env.LINEAR_TEAM_KEY || 'DOR';
    const { team, stateIdByName } = await linearResolveTeamAndStates(teamKey);
    const stateId = stateIdByName.get('Todo');

    const title = `[Doreish] ${body.type.replace(/_/g, ' ')}: ${body.description.split('\n')[0].slice(0, 80)}`;
    linear = await linearCreateIssue({
      teamId: team.id,
      title,
      description: body.description,
      stateId,
    });

    db()
      .prepare(
        `INSERT INTO task_links (id, created_ts, ruflo_task_id, linear_issue_id, linear_issue_key, payload_json)
         VALUES (@id, @created_ts, @ruflo_task_id, @linear_issue_id, @linear_issue_key, @payload_json)`
      )
      .run({
        id: crypto.randomUUID(),
        created_ts: Date.now(),
        ruflo_task_id: taskId || '(unknown)',
        linear_issue_id: linear.id,
        linear_issue_key: linear.identifier,
        payload_json: JSON.stringify({ teamKey, state: 'Todo', url: linear.url }),
      });
  } catch (e: any) {
    linear = { error: e?.message || String(e) };
  }

  db()
    .prepare(
      `INSERT INTO events (id, ts, source, type, severity, session_key, agent_id, payload_json)
       VALUES (@id, @ts, @source, @type, @severity, @session_key, @agent_id, @payload_json)`
    )
    .run({
      id: crypto.randomUUID(),
      ts: Date.now(),
      source: 'ui',
      type: 'ruflo.task_create',
      severity: 'info',
      session_key: null,
      agent_id: null,
      payload_json: JSON.stringify({ request: body, result, linear }),
    });

  return NextResponse.json({ ok: true, result, linear });
}
