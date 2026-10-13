import assert from 'node:assert/strict';
import { test } from 'node:test';

import { enforceMinIntervalRateLimit } from '../src/lib/rate-limit';
import { safeInternalPath } from '../src/lib/redirect';

test('auth redirects reject external origins, normalized backslashes and auth loops', () => {
  for (const input of [
    '//evil.example',
    '/\\evil.example',
    'https://evil.example/path',
    '/sign-in',
    '/zh/sign-in',
    '/\tevil.example',
  ]) {
    assert.equal(safeInternalPath(input), null, input);
  }
  for (const input of [
    '/download',
    '/settings/billing?paid=1',
    '/online#canvas',
  ]) {
    assert.equal(safeInternalPath(input), input);
  }
});

test('changing cookies or forwarded IP does not reset a Cloudflare client rate-limit bucket', () => {
  const request = (cookie: string, forwardedIp: string) =>
    new Request('https://cadcraft.org/api/payment/checkout', {
      method: 'POST',
      headers: {
        'cf-connecting-ip': '203.0.113.1',
        'x-forwarded-for': forwardedIp,
        cookie,
      },
    });
  const options = { intervalMs: 60_000, keyPrefix: 'security-regression-test' };
  assert.equal(
    enforceMinIntervalRateLimit(request('a=1', '192.0.2.1'), options),
    null
  );
  assert.equal(
    enforceMinIntervalRateLimit(request('a=2', '192.0.2.2'), options)?.status,
    429
  );
});
