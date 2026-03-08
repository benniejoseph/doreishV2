import { NextResponse } from 'next/server';
import { rufloCall } from '@/lib/ruflo';
import { requireSession } from '@/lib/requireSession';

export async function GET() {
  try {
    await requireSession();
  } catch {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }

  const result = await rufloCall('task_list');
  return NextResponse.json({ ok: true, result });
}
