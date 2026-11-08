// Render the compiled Worker fetch handler for HTML checks in Node/CI.
// This checks SSR content, not workerd compatibility or remote database state.
import { createServer } from 'node:http';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const worker = (await import(pathToFileURL(resolve(process.argv[2])).href))
  .default;
createServer(async (request, response) => {
  try {
    if (!['GET', 'HEAD'].includes(request.method)) {
      response.writeHead(405).end();
      return;
    }
    const url = new URL(request.url, `http://${request.headers.host}`);
    const result = await worker.fetch(
      new Request(url, { method: request.method, headers: request.headers }),
      {}, // No remote bindings: config/posts use their normal static fallbacks.
      {
        waitUntil: (promise) => {
          void Promise.resolve(promise).catch(() => {});
        },
      }
    );
    response.writeHead(result.status, Object.fromEntries(result.headers));
    response.end(Buffer.from(await result.arrayBuffer()));
  } catch (error) {
    console.error(error.message);
    response.writeHead(500).end('SSR check failed');
  }
}).listen(Number(process.env.PORT), '127.0.0.1');
