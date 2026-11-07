import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  canonicalRedirectUrl,
  canonicalSiteOrigin,
} from '../src/lib/canonical-url';

test('HTTP, www and retired locale resolve to one final HTTPS destination', () => {
  for (const input of [
    'http://www.cadcraft.org/zh/download?ref=guide',
    'https://www.cadcraft.org/zh/download?ref=guide',
    'http://cadcraft.org/download?ref=guide',
  ]) {
    const final = canonicalRedirectUrl(input);
    assert.equal(final, 'https://cadcraft.org/download?ref=guide');
    assert.equal(canonicalRedirectUrl(final!), null);
  }
  assert.equal(
    canonicalRedirectUrl('http://cadcraft.org/'),
    'https://cadcraft.org/'
  );
});

test('canonical origin repairs production configuration and leaves local development usable', () => {
  assert.equal(
    canonicalSiteOrigin('http://www.cadcraft.org/'),
    'https://cadcraft.org'
  );
  assert.equal(
    canonicalSiteOrigin('https://cadcraft.org/'),
    'https://cadcraft.org'
  );
  assert.equal(canonicalRedirectUrl('http://localhost:3000/online'), null);
  assert.equal(
    canonicalSiteOrigin('http://localhost:3000'),
    'http://localhost:3000'
  );
  assert.equal(
    canonicalRedirectUrl('http://localhost:3000/zh'),
    'http://localhost:3000/'
  );
});
