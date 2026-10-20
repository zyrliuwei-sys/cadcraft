import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';

import {
  deleteDrawing,
  readDrawing,
  renameDrawing,
  setSharing,
} from '@/modules/drawings/service';
import { respData, respErr, respOk } from '@/lib/resp';

import { drawingName, drawingsUser, fileResponse, needPro } from './-shared';

type Ctx = { request: Request; params: { id: string } };

// GET returns the DXF (`?version=` for an older one). PATCH renames and/or
// turns the view-only share link on or off. DELETE removes every version.
// Reading, unsharing and deleting stay open after Pro ends; the owner check
// is in the service.

async function GET({ request, params }: Ctx) {
  try {
    const u = await drawingsUser(request);
    if (!u) return respErr('Unauthorized');
    const version = new URL(request.url).searchParams.get('version');
    const file = await readDrawing(u.userId, params.id, version);
    return file ? fileResponse(file) : respErr('Drawing not found');
  } catch (error: any) {
    return respErr(error.message || 'Failed to read drawing');
  }
}

const patchSchema = z.object({
  name: z.string().max(200).optional(),
  share: z.boolean().optional(),
});

async function PATCH({ request, params }: Ctx) {
  try {
    const u = await drawingsUser(request);
    if (!u) return respErr('Unauthorized');
    const body = patchSchema.safeParse(await request.json().catch(() => null));
    if (!body.success) return respErr('Invalid request');
    if (!u.pro && (body.data.name !== undefined || body.data.share))
      return needPro();
    if (body.data.name !== undefined) {
      await renameDrawing(u.userId, params.id, drawingName(body.data.name));
    }
    if (body.data.share !== undefined) {
      const shareToken = await setSharing(u.userId, params.id, body.data.share);
      return respData({ shareToken });
    }
    return respOk();
  } catch (error: any) {
    return respErr(error.message || 'Failed to update drawing');
  }
}

async function DELETE({ request, params }: Ctx) {
  try {
    const u = await drawingsUser(request);
    if (!u) return respErr('Unauthorized');
    const ok = await deleteDrawing(u.userId, params.id);
    return ok ? respOk() : respErr('Drawing not found');
  } catch (error: any) {
    return respErr(error.message || 'Failed to delete drawing');
  }
}

export const Route = createFileRoute('/api/drawings/$id')({
  server: { handlers: { GET, PATCH, DELETE } },
});
