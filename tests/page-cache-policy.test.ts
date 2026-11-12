import assert from 'node:assert/strict';
import { test } from 'node:test';

import { canonicalRedirectUrl } from '../src/lib/canonical-url';
import { applyPageCachePolicy } from '../src/lib/page-cache-policy';

const origin = 'https://cadcraft.org';
const paths = ['pt', 'it', 'de'].flatMap((language) =>
  ['/', '/download', '/dwg-viewer'].map((page) => `/${language}${page}`)
);

function expectNoStore(response: Response) {
  assert.equal(
    response.headers.get('Cache-Control'),
    'private, no-store, max-age=0'
  );
  assert.equal(response.headers.get('CDN-Cache-Control'), 'no-store');
  assert.equal(
    response.headers.get('Cloudflare-CDN-Cache-Control'),
    'no-store'
  );
  assert.equal(
    response.headers.get('Expires'),
    'Thu, 01 Jan 1970 00:00:00 GMT'
  );
}

test('all nine live language URLs remain canonical and their HTML bypasses downstream caches', async () => {
  for (const path of [...paths, '/pt/future-page', '/de/missing']) {
    const request = new Request(origin + path);
    assert.equal(canonicalRedirectUrl(request.url), null, path);
    const response = applyPageCachePolicy(
      request,
      new Response('unchanged HTML', {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control':
            'public, max-age=86400, s-maxage=86400, stale-while-revalidate=86400',
          'Surrogate-Control': 'max-age=86400',
        },
      })
    );
    expectNoStore(response);
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('Location'), null);
    assert.equal(response.headers.get('Surrogate-Control'), null);
    assert.equal(await response.text(), 'unchanged HTML');
  }
});

test('every redirect is non-cacheable, including immutable canonical redirects and SSR redirects', () => {
  for (const status of [301, 302, 303, 307, 308]) {
    for (const path of [
      ...paths,
      '/download/',
      '/about/',
      '/api/auth/callback',
    ]) {
      const target = origin + '/download';
      const original = Response.redirect(target, status);
      const response = applyPageCachePolicy(
        new Request(origin + path),
        original
      );
      expectNoStore(response);
      assert.equal(response.status, status);
      assert.equal(response.headers.get('Location'), target);
      assert.equal(original.headers.get('Cache-Control'), null);
    }
  }
});

test('the English counterparts also bypass downstream HTML caches without changing their bodies', async () => {
  for (const path of ['/', '/download', '/dwg-viewer']) {
    for (const method of ['GET', 'HEAD']) {
      const response = applyPageCachePolicy(
        new Request(origin + path, { method }),
        new Response(method === 'HEAD' ? null : 'English page', {
          headers: {
            'Content-Type': 'text/html',
            'Set-Cookie': 'session=test; HttpOnly',
          },
        })
      );
      expectNoStore(response);
      assert.equal(
        response.headers.get('Set-Cookie'),
        'session=test; HttpOnly'
      );
      assert.equal(
        await response.text(),
        method === 'HEAD' ? '' : 'English page'
      );
    }
  }
});

test('asset caching and unrelated page policies are preserved', () => {
  for (const [path, contentType] of [
    ['/assets/app.js', 'text/javascript'],
    ['/de/assets/app.js', 'text/javascript'],
    ['/pt/download.json', 'application/json'],
    ['/about', 'text/html'],
    ['/desktop', 'text/html'],
  ]) {
    const original = new Response('asset or other page', {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600',
      },
    });
    assert.equal(
      applyPageCachePolicy(new Request(origin + path), original),
      original
    );
  }
});
