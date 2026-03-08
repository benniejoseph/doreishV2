import { NextResponse } from 'next/server';
import { rufloCall } from '@/lib/ruflo';

export async function GET(req: Request) {
  const key = req.headers.get('x-doreish-key');
  if (!process.env.DOREISH_INGEST_KEY || key !== process.env.DOREISH_INGEST_KEY) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }

  const result = await rufloCall('agent_list');
  return NextResponse.json({ ok: true, result });
}
