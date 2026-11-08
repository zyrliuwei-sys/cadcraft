import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  canonicalPagePath,
  canonicalPageUrl,
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

test('all page URL producers strip trailing slashes without dropping query/hash or changing the root', () => {
  assert.equal(
    canonicalPagePath('/about/?ref=footer#team'),
    '/about?ref=footer#team'
  );
  assert.equal(canonicalPagePath('/?ref=footer#top'), '/?ref=footer#top');
  assert.equal(
    canonicalPageUrl('https://cadcraft.org/about/?ref=x#ben'),
    'https://cadcraft.org/about?ref=x#ben'
  );
  for (const path of ['/about/', '/blog/', '/download/', '/tutorials/']) {
    const destination = canonicalRedirectUrl(
      'http://www.cadcraft.org/zh' + path + '?ref=x#top'
    );
    assert.equal(
      destination,
      'https://cadcraft.org' + path.slice(0, -1) + '?ref=x#top'
    );
    assert.equal(canonicalRedirectUrl(destination!), null);
  }
  assert.equal(
    canonicalRedirectUrl('https://cadcraft.org/cadcraft-app/'),
    null
  );
  assert.equal(canonicalRedirectUrl('https://cadcraft.org/api/auth/'), null);
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
