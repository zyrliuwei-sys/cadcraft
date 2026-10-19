import { createFileRoute } from '@tanstack/react-router';

import { getAuth } from '@/core/auth';
import { getFunnelReport } from '@/modules/analytics/service';
import { hasPermission } from '@/modules/rbac/service';
import { respData, respErr } from '@/lib/resp';

const MAX_RANGE_MS = 90 * 86_400_000;

// ?from=<ms>&to=<ms>&tz=<minutes east of UTC>. The dashboard computes the
// range in the admin's own timezone (today, yesterday-to-this-moment, …).
async function GET({ request }: { request: Request }) {
  try {
    const session = await getAuth().api.getSession({
      headers: request.headers,
    });
    if (!session?.user) return respErr('Unauthorized');
    if (!(await hasPermission(session.user.id, 'admin.*'))) {
      return respErr('Forbidden');
    }

    const { searchParams } = new URL(request.url);
    const to = Number(searchParams.get('to')) || Date.now();
    const from = Number(searchParams.get('from')) || to - 86_400_000;
    const tz = Number(searchParams.get('tz')) || 0;
    if (from >= to || to - from > MAX_RANGE_MS) {
      return respErr('Invalid range');
    }

    return respData(
      await getFunnelReport({
        from: new Date(from),
        to: new Date(to),
        tzOffsetMin: Math.max(-840, Math.min(840, tz)),
      })
    );
  } catch (error: any) {
    return respErr(error.message || 'Failed to load analytics');
  }
}

export const Route = createFileRoute('/api/admin/analytics')({
  server: { handlers: { GET } },
});
