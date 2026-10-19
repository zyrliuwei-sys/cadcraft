import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';

import { getAuth } from '@/core/auth';
import { recordEvents } from '@/modules/analytics/service';
import { hasPermission } from '@/modules/rbac/service';
import { getUuid } from '@/lib/hash';
import { respErr, respOk } from '@/lib/resp';

// Funnel events from src/lib/track.ts (sent with navigator.sendBeacon).
// Anonymous by design: the visitor id is the browser's; the user id is only
// ever taken from the session, never from the body.

const BOT_UA =
  /bot|crawl|spider|slurp|headless|lighthouse|pagespeed|preview|curl|wget|python|axios|node-fetch/i;

const str = (max: number) => z.string().max(max).optional();
const schema = z.object({
  vid: z.string().regex(/^[\w-]{8,64}$/),
  build: str(16),
  internal: z.boolean().optional(),
  ft: z
    .object({ source: str(64), referrer: str(200), landing: str(200) })
    .optional(),
  events: z
    .array(
      z.object({
        name: z.string().regex(/^[a-z][a-z0-9_]{1,47}$/),
        path: str(200),
        props: z
          .record(z.string(), z.union([z.string(), z.number()]))
          .optional(),
        variant: str(64),
        ts: z.number().optional(),
      })
    )
    .min(1)
    .max(20),
});

function safeJson(raw: string) {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function POST({ request }: { request: Request }) {
  try {
    if (BOT_UA.test(request.headers.get('user-agent') || '')) return respOk();
    // Public endpoint: cap the body before parsing (20 events fit in ~10 KB).
    const raw = await request.text();
    if (raw.length > 16_384) return respErr('Payload too large');
    const body = schema.safeParse(safeJson(raw));
    if (!body.success) return respErr('Invalid events');
    const { vid, build, ft, events } = body.data;

    let userId: string | null = null;
    let internal = !!body.data.internal;
    if ((request.headers.get('cookie') || '').includes('session_token')) {
      const session = await getAuth().api.getSession({
        headers: request.headers,
      });
      if (session?.user) {
        userId = session.user.id;
        if (!internal)
          internal = await hasPermission(session.user.id, 'admin.*');
      }
    }

    // Clamp client clocks: beacons can arrive late, but never from the future
    // or from more than a day ago.
    const now = Date.now();
    const country = request.headers.get('cf-ipcountry') || null;
    await recordEvents(
      events.map((e) => ({
        id: getUuid(),
        name: e.name,
        visitorId: vid,
        userId,
        path: e.path || null,
        props: e.props ? JSON.stringify(e.props).slice(0, 1000) : null,
        source: ft?.source || null,
        referrer: ft?.referrer || null,
        landing: ft?.landing || null,
        country,
        build: build || null,
        variant: e.variant || null,
        internal: internal ? 1 : 0,
        createdAt: new Date(
          e.ts && e.ts <= now && e.ts > now - 86_400_000 ? e.ts : now
        ),
      }))
    );
    return respOk();
  } catch (error: any) {
    return respErr(error.message || 'Failed to record events');
  }
}

export const Route = createFileRoute('/api/events')({
  server: { handlers: { POST } },
});
