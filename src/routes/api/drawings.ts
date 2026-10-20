import { createFileRoute } from '@tanstack/react-router';

import {
  listDrawings,
  MAX_DRAWING_BYTES,
  saveDrawing,
} from '@/modules/drawings/service';
import { respData, respErr } from '@/lib/resp';

import { drawingName, drawingsUser, needPro } from './drawings/-shared';

// Cloud drawings (CADCraft Online Pro). GET lists them — also after Pro
// ends, so people keep access to what they saved; POST (Pro only) uploads a
// DXF as the raw request body: `?name=` and, to add a version, `?id=`.

async function GET({ request }: { request: Request }) {
  try {
    const u = await drawingsUser(request);
    if (!u) return respErr('Unauthorized');
    const items = await listDrawings(u.userId);
    return respData({ pro: u.pro, items });
  } catch (error: any) {
    return respErr(error.message || 'Failed to list drawings');
  }
}

async function POST({ request }: { request: Request }) {
  try {
    const u = await drawingsUser(request);
    if (!u) return respErr('Unauthorized');
    if (!u.pro) return needPro();

    const declared = Number(request.headers.get('content-length') || 0);
    if (declared > MAX_DRAWING_BYTES) return respErr('File too large');
    const data = await request.arrayBuffer();
    if (!data.byteLength) return respErr('Empty file');
    if (data.byteLength > MAX_DRAWING_BYTES) return respErr('File too large');

    const params = new URL(request.url).searchParams;
    const drawing = await saveDrawing(u.userId, {
      id: params.get('id') || undefined,
      name: drawingName(params.get('name')),
      data,
      checkpoint: params.get('checkpoint') === '1',
    });
    return respData(drawing);
  } catch (error: any) {
    return respErr(error.message || 'Failed to save drawing');
  }
}

export const Route = createFileRoute('/api/drawings')({
  server: { handlers: { GET, POST } },
});
