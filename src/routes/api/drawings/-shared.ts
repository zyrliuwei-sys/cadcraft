import { getAuth } from '@/core/auth';
import { hasProSubscription } from '@/modules/drawings/service';
import { hasPermission } from '@/modules/rbac/service';
import { respErr } from '@/lib/resp';

/** Signed-in user, and whether they may use cloud drawings (Pro or admin). */
export async function drawingsUser(request: Request) {
  const session = await getAuth().api.getSession({ headers: request.headers });
  if (!session?.user) return null;
  const userId = session.user.id;
  const pro =
    (await hasProSubscription(userId)) ||
    (await hasPermission(userId, 'admin.*'));
  return { userId, pro };
}

export const needPro = () => respErr('Pro required');

/** A safe display name ending in .dxf. */
export function drawingName(raw: string | null | undefined) {
  const base = (raw || 'Drawing.dxf')
    .replace(/[\\/\u0000-\u001f]/g, '')
    .trim()
    .slice(0, 120);
  return /\.dxf$/i.test(base) ? base : `${base || 'Drawing'}.dxf`;
}

/** The DXF bytes, with the name in a header (UTF-8, URI-encoded). */
export function fileResponse(file: { name: string; data: ArrayBuffer }) {
  return new Response(file.data, {
    headers: {
      'content-type': 'application/dxf',
      'cache-control': 'private, no-store',
      'x-drawing-name': encodeURIComponent(file.name),
      // Uploads are arbitrary bytes: never render them inline on our origin.
      'content-disposition': 'attachment',
      'x-content-type-options': 'nosniff',
    },
  });
}
