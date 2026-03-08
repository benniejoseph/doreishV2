import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireSession } from '@/lib/requireSession';
import { linearResolveTeamAndStates, linearUpdateIssueState } from '@/lib/linear';
import { RUFLO_TO_LINEAR_STATE } from '@/lib/stateMap';

const Body = z.object({
  issueId: z.string().min(1),
  rufloStatus: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    await requireSession();
  } catch {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }

  const json = await req.json().catch(() => null);
  const body = Body.parse(json);

  const teamKey = process.env.LINEAR_TEAM_KEY || 'DOR';
  const { stateIdByName } = await linearResolveTeamAndStates(teamKey);
  const linearName = RUFLO_TO_LINEAR_STATE[body.rufloStatus] || body.rufloStatus;
  const stateId = stateIdByName.get(linearName);
  if (!stateId) return NextResponse.json({ ok: false, error: `Linear state not found: ${linearName}` }, { status: 400 });

  const result = await linearUpdateIssueState({ issueId: body.issueId, stateId });
  return NextResponse.json({ ok: true, result });
}
