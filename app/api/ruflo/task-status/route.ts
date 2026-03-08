import { NextResponse } from 'next/server';
import { rufloCall } from '@/lib/ruflo';
import { requireSession } from '@/lib/requireSession';

export async function GET(req: Request) {
  try {
    await requireSession();
  } catch {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }

  const url = new URL(req.url);
  const taskId = url.searchParams.get('taskId');
  if (!taskId) return NextResponse.json({ ok: false, error: 'missing taskId' }, { status: 400 });

  const result = await rufloCall('task_status', [`taskId=${taskId}`]);
  return NextResponse.json({ ok: true, result });
}
