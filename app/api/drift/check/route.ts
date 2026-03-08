import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/requireSession';
import { db } from '@/lib/db';

// MVP drift endpoint: returns task link rows; UI will compare later.
export async function GET() {
  try {
    await requireSession();
  } catch {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }

  const rows = db()
    .prepare(`SELECT ruflo_task_id, linear_issue_id, linear_issue_key, payload_json FROM task_links ORDER BY created_ts DESC LIMIT 200`)
    .all();

  return NextResponse.json({ ok: true, links: rows });
}
