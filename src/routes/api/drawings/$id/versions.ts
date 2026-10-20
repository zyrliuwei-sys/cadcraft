import { createFileRoute } from '@tanstack/react-router';

import { listVersions } from '@/modules/drawings/service';
import { respData, respErr } from '@/lib/resp';

import { drawingsUser, needPro } from '../-shared';

async function GET({
  request,
  params,
}: {
  request: Request;
  params: { id: string };
}) {
  try {
    const u = await drawingsUser(request);
    if (!u) return respErr('Unauthorized');
    if (!u.pro) return needPro();
    const result = await listVersions(u.userId, params.id);
    return result ? respData(result) : respErr('Drawing not found');
  } catch (error: any) {
    return respErr(error.message || 'Failed to list versions');
  }
}

export const Route = createFileRoute('/api/drawings/$id/versions')({
  server: { handlers: { GET } },
});
