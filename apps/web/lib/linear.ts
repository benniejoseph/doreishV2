type GqlResp<T> = { data?: T; errors?: { message: string }[] };

async function linearGql<T>(query: string, variables?: any): Promise<T> {
  const token = process.env.LIN_API_KEY;
  if (!token) throw new Error('LIN_API_KEY missing');

  const res = await fetch('https://api.linear.app/graphql', {
    method: 'POST',
    headers: {
      Authorization: token,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, variables }),
  });

  const json = (await res.json()) as GqlResp<T>;
  if (!res.ok || json.errors?.length) {
    throw new Error(`Linear error: ${json.errors?.[0]?.message || res.statusText}`);
  }
  if (!json.data) throw new Error('Linear: missing data');
  return json.data;
}

export async function linearResolveTeamAndStates(teamKey: string) {
  const data = await linearGql<{
    teams: { nodes: { id: string; key: string; name: string }[] };
    workflowStates: { nodes: { id: string; name: string; type: string; team?: { key: string } }[] };
  }>(
    `query TeamsAndStates {
      teams { nodes { id key name } }
      workflowStates { nodes { id name type } }
    }`
  );

  const team = data.teams.nodes.find((t) => t.key === teamKey);
  if (!team) throw new Error(`Linear team not found: ${teamKey}`);

  const byName = new Map<string, string>();
  for (const s of data.workflowStates.nodes) byName.set(s.name, s.id);

  return { team, stateIdByName: byName };
}

export async function linearUpdateIssueState(input: { issueId: string; stateId: string }) {
  const data = await linearGql<{
    issueUpdate: { success: boolean; issue?: { id: string; identifier: string; url: string } };
  }>(
    `mutation IssueUpdate($id: String!, $input: IssueUpdateInput!) {
      issueUpdate(id: $id, input: $input) {
        success
        issue { id identifier url }
      }
    }`,
    { id: input.issueId, input: { stateId: input.stateId } }
  );

  if (!data.issueUpdate.success || !data.issueUpdate.issue) throw new Error('Linear issueUpdate failed');
  return data.issueUpdate.issue;
}

export async function linearCreateIssue(input: {
  teamId: string;
  title: string;
  description?: string;
  stateId?: string;
}) {
  const data = await linearGql<{
    issueCreate: { success: boolean; issue?: { id: string; identifier: string; url: string } };
  }>(
    `mutation IssueCreate($input: IssueCreateInput!) {
      issueCreate(input: $input) {
        success
        issue { id identifier url }
      }
    }`,
    { input }
  );

  if (!data.issueCreate.success || !data.issueCreate.issue) throw new Error('Linear issueCreate failed');
  return data.issueCreate.issue;
}
