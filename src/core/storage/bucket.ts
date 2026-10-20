/**
 * Private object storage for user files, by key.
 *
 * On Cloudflare Workers this is an R2 bucket binding (wrangler.jsonc
 * `r2_buckets`), read from the env that src/server.ts stashes on
 * `globalThis.__CF_ENV__` — no API keys, nothing public. `pnpm dev` runs on
 * Node without bindings, so it falls back to files under `data/<binding>/`.
 */

export interface Bucket {
  put(key: string, data: ArrayBuffer, contentType?: string): Promise<void>;
  get(key: string): Promise<ArrayBuffer | null>;
  delete(keys: string[]): Promise<void>;
}

interface R2Like {
  put(
    key: string,
    value: ArrayBuffer,
    opts?: { httpMetadata?: { contentType?: string } }
  ): Promise<unknown>;
  get(key: string): Promise<{ arrayBuffer(): Promise<ArrayBuffer> } | null>;
  delete(keys: string | string[]): Promise<void>;
}

function r2Bucket(r2: R2Like): Bucket {
  return {
    put: async (key, data, contentType) => {
      await r2.put(key, data, { httpMetadata: { contentType } });
    },
    get: async (key) => (await r2.get(key))?.arrayBuffer() ?? null,
    delete: async (keys) => {
      if (keys.length) await r2.delete(keys);
    },
  };
}

function localBucket(dir: string): Bucket {
  const file = async (key: string) => {
    const path = await import('node:path');
    if (key.split('/').includes('..')) throw new Error('Invalid key');
    return path.join(process.cwd(), 'data', dir, key);
  };
  return {
    put: async (key, data) => {
      const fs = await import('node:fs/promises');
      const path = await import('node:path');
      const target = await file(key);
      await fs.mkdir(path.dirname(target), { recursive: true });
      await fs.writeFile(target, new Uint8Array(data));
    },
    get: async (key) => {
      const fs = await import('node:fs/promises');
      try {
        const buf = await fs.readFile(await file(key));
        return buf.buffer.slice(
          buf.byteOffset,
          buf.byteOffset + buf.byteLength
        ) as ArrayBuffer;
      } catch {
        return null;
      }
    },
    delete: async (keys) => {
      const fs = await import('node:fs/promises');
      for (const key of keys) await fs.rm(await file(key), { force: true });
    },
  };
}

export function getBucket(binding: string): Bucket {
  const g = globalThis as any;
  const env = g.__CF_ENV__ ?? g.__env__;
  const r2 = env?.[binding] as R2Like | undefined;
  return r2 ? r2Bucket(r2) : localBucket(binding.toLowerCase());
}
