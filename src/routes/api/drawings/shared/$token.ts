import { createFileRoute } from '@tanstack/react-router';

import { readSharedDrawing } from '@/modules/drawings/service';
import { respErr } from '@/lib/resp';

import { fileResponse } from '../-shared';

// Public, read-only: anyone holding the link's token gets the current version.
async function GET({ params }: { params: { token: string } }) {
  try {
    if (!/^[\w-]{16,64}$/.test(params.token)) return respErr('Invalid link');
    const file = await readSharedDrawing(params.token);
    return file ? fileResponse(file) : respErr('This link is no longer shared');
  } catch (error: any) {
    return respErr(error.message || 'Failed to read drawing');
  }
}

export const Route = createFileRoute('/api/drawings/shared/$token')({
  server: { handlers: { GET } },
});
