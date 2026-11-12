import assert from 'node:assert/strict';
import { test } from 'node:test';
import { setTimeout } from 'node:timers/promises';

import { withRequestLocale } from '../src/lib/server-locale';
import {
  getLocale,
  localizeUrl,
  serverAsyncLocalStorage,
} from '../src/paraglide/runtime.js';

test('cold concurrent requests share one store instance but retain separate URL locales through async SSR work', async () => {
  const store = serverAsyncLocalStorage;
  assert.ok(store, 'the request store must exist before middleware is called');
  const pages = ['/', '/download', '/dwg-viewer'];
  const variants = [
    ['', 'en'],
    ['/pt', 'pt-BR'],
    ['/it', 'it-IT'],
    ['/de', 'de-DE'],
  ] as const;
  const requests = variants.flatMap(([prefix, locale]) =>
    pages.map((page) => ({
      path: prefix + page,
      locale,
      page,
    }))
  );
  await Promise.all(
    requests.map(async ({ path, locale, page }, i) => {
      const response = await withRequestLocale(
        new Request('https://cadcraft.org' + path),
        async () => {
          assert.equal(getLocale(), locale, path);
          await setTimeout((i % 3) + 1);
          assert.equal(
            serverAsyncLocalStorage,
            store,
            'request handling cannot replace the store'
          );
          assert.equal(getLocale(), locale, path);
          assert.equal(
            localizeUrl(new URL(page, 'https://cadcraft.org')).pathname,
            path
          );
          return new Response(locale);
        }
      );
      assert.equal(response.status, 200);
      assert.equal(response.headers.get('Location'), null);
      assert.equal(await response.text(), locale);
    })
  );
});
