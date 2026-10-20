// Client for the cloud drawings API (src/routes/api/drawings*). JSON calls go
// through api-client; file downloads return the DXF bytes, or the usual
// { code, message } envelope on error.

import { apiDelete, ApiError, apiGet, apiPatch } from '@/lib/api-client';

export interface CloudDrawing {
  id: string;
  name: string;
  size: number;
  shareToken: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CloudVersion {
  id: string;
  size: number;
  createdAt: string;
}

export const listCloudDrawings = () =>
  apiGet<{ pro: boolean; items: CloudDrawing[] }>('/api/drawings');

export function uploadCloudDrawing(
  file: File,
  opts: { id?: string; checkpoint?: boolean } = {}
) {
  const params = new URLSearchParams({ name: file.name });
  if (opts.id) params.set('id', opts.id);
  if (opts.checkpoint) params.set('checkpoint', '1');
  return apiGet<CloudDrawing>(`/api/drawings?${params}`, {
    method: 'POST',
    body: file,
    headers: { 'Content-Type': 'application/dxf' },
  });
}

export const listCloudVersions = (id: string) =>
  apiGet<{ currentVersionId: string | null; versions: CloudVersion[] }>(
    `/api/drawings/${id}/versions`
  );

export const shareCloudDrawing = (id: string, share: boolean) =>
  apiPatch<{ shareToken: string | null }>(`/api/drawings/${id}`, { share });

export const deleteCloudDrawing = (id: string) =>
  apiDelete(`/api/drawings/${id}`);

async function downloadFile(url: string): Promise<File> {
  const res = await fetch(url);
  if (!res.ok || res.headers.get('content-type')?.includes('json')) {
    const json = await res.json().catch(() => ({}));
    throw new ApiError(json.code ?? -1, json.message || 'Download failed');
  }
  const name = decodeURIComponent(
    res.headers.get('x-drawing-name') || 'Drawing.dxf'
  );
  return new File([await res.blob()], name);
}

export const downloadCloudDrawing = (id: string, version?: string) =>
  downloadFile(
    `/api/drawings/${id}${version ? `?version=${encodeURIComponent(version)}` : ''}`
  );

export const downloadSharedDrawing = (token: string) =>
  downloadFile(`/api/drawings/shared/${encodeURIComponent(token)}`);

export const shareUrl = (token: string) =>
  `${window.location.origin}/online?share=${encodeURIComponent(token)}`;
