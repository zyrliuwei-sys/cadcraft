import { AsyncLocalStorage } from 'node:async_hooks';

import {
  overwriteServerAsyncLocalStorage,
  type ParaglideAsyncLocalStorage,
} from '../paraglide/runtime.js';
import { paraglideMiddleware } from '../paraglide/server.js';

// Install one store synchronously, before the first request. The generated
// middleware otherwise awaits a dynamic import and can replace the store while
// another cold-start request is already rendering on Workers.
overwriteServerAsyncLocalStorage(
  new AsyncLocalStorage<ReturnType<ParaglideAsyncLocalStorage['getStore']>>()
);

export function withRequestLocale(
  request: Request,
  render: () => Response | Promise<Response>
): Promise<Response> {
  return paraglideMiddleware(request, render);
}
