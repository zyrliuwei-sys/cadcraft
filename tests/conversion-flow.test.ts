import assert from 'node:assert/strict';
import { test } from 'node:test';

import { getPricingProduct } from '../src/config/pricing';
import {
  canResumeCheckout,
  CHECKOUT_INTENT_TTL,
  checkoutCallback,
  cleanCheckoutPath,
  parseCheckoutIntent,
  type CheckoutIntent,
} from '../src/lib/checkout-intent';
import { dxfGeometry } from '../src/lib/dxf-activity';
import { desktopDownloadPlatform } from '../src/lib/home-cta-experiment';
import {
  summarizeHomeExperiment,
  type ExperimentEvent,
} from '../src/lib/home-experiment-report';

const intent: CheckoutIntent = {
  productId: 'cad_pro_monthly',
  source: 'cloud_dialog',
  returnTo: '/online?pro=welcome',
  token: 'one-use-test-token',
  createdAt: 1000,
};

test('auth callback preserves the selected plan, upgrade source and payment destination', () => {
  const path = checkoutCallback('/pricing?utm_source=test', intent);
  assert.deepEqual(parseCheckoutIntent(path), { ...intent, createdAt: 0 });
  assert.equal(
    cleanCheckoutPath(path),
    '/pricing?utm_source=test&upgrade_from=cloud_dialog'
  );
  assert.equal(
    canResumeCheckout(parseCheckoutIntent(path)!, JSON.stringify(intent), 2000),
    true
  );
});

test('forged, modified, expired and missing tab intents require a new confirmation', () => {
  const saved = JSON.stringify(intent);
  for (const candidate of [
    { ...intent, token: 'forged' },
    { ...intent, productId: 'cad_pro_yearly' },
    { ...intent, source: 'pricing' },
    { ...intent, returnTo: '/settings/billing' },
  ])
    assert.equal(canResumeCheckout(candidate, saved, 2000), false);
  assert.equal(
    canResumeCheckout(intent, saved, 1000 + CHECKOUT_INTENT_TTL),
    false
  );
  assert.equal(canResumeCheckout(intent, saved, 999), false);
  assert.equal(canResumeCheckout(intent, null, 2000), false);
  assert.equal(canResumeCheckout(intent, 'broken json', 2000), false);
});

test('checkout URLs reject unknown catalog and inherited object keys, and external return URLs', () => {
  assert.equal(getPricingProduct('__proto__'), null);
  assert.equal(getPricingProduct('constructor'), null);
  assert.equal(parseCheckoutIntent('/pricing?checkout=__proto__'), null);
  assert.equal(parseCheckoutIntent('/pricing?checkout=unknown'), null);
  const parsed = parseCheckoutIntent(
    '/pricing?checkout=cad_pro_yearly&checkout_return=https://evil.example&upgrade_from=bad%20source'
  );
  assert.ok(parsed);
  assert.equal(parsed.source, 'pricing');
  assert.equal(parsed.returnTo.startsWith('/'), true);
  assert.equal(parsed.returnTo.includes('evil.example'), false);
});

test('direct desktop downloads exclude mobile devices and unsupported platforms', () => {
  assert.equal(
    desktopDownloadPlatform('Mozilla Windows NT 10.0 Win64 x64', 'Win32'),
    'windows'
  );
  assert.equal(
    desktopDownloadPlatform('Mozilla Macintosh Intel Mac OS X', 'MacIntel'),
    'macos'
  );
  assert.equal(
    desktopDownloadPlatform('Mozilla Macintosh', 'MacIntel', 5),
    null
  );
  assert.equal(
    desktopDownloadPlatform('Mozilla Android Mobile', 'Linux'),
    null
  );
  assert.equal(desktopDownloadPlatform('Mozilla Linux', 'Linux x86_64'), null);
  assert.equal(desktopDownloadPlatform('Mozilla Windows ARM64', 'Win32'), null);
});

test('experiment conversion requires exposure, excludes internal/mixed visitors and deduplicates outcomes', () => {
  const rows: ExperimentEvent[] = [];
  const add = (
    visitorId: string,
    name: string,
    at: number,
    variant = 'control'
  ) =>
    rows.push({
      visitorId,
      name,
      createdAt: at,
      variant: `home_cta_v1:${variant}`,
    });
  add('a', 'download_click', 5);
  add('a', 'home_cta_exposure', 10); // Before exposure does not convert.
  add('b', 'home_cta_exposure', 10);
  add('b', 'download_click', 11);
  add('b', 'download_click', 12);
  add('b', 'online_editor_ready', 13);
  add('internal', 'home_cta_exposure', 10);
  add('internal', 'download_click', 11);
  add('mixed', 'home_cta_exposure', 10);
  add('mixed', 'home_cta_exposure', 11, 'download_first');
  add('mixed', 'download_click', 12);
  add('c', 'home_cta_exposure', 10, 'download_first');
  add('c', 'download_click', 12, 'download_first');
  assert.deepEqual(
    summarizeHomeExperiment(rows, new Set(['a', 'b', 'mixed', 'c'])),
    [
      { variant: 'control', exposed: 2, downloads: 1, editorsReady: 1 },
      { variant: 'download_first', exposed: 1, downloads: 1, editorsReady: 0 },
    ]
  );
});

test('first drawing signal ignores empty drawings and save-time metadata', () => {
  const file = (entities: string, metadata: string) =>
    `0\nSECTION\n2\nHEADER\n${metadata}\n0\nENDSEC\n0\nSECTION\n2\nENTITIES\n${entities}0\nENDSEC\n0\nEOF\n`;
  assert.equal(dxfGeometry(file('', 'one')), '');
  const line = '0\nLINE\n10\n0\n20\n0\n11\n10\n21\n0\n';
  assert.equal(dxfGeometry(file(line, 'one')), dxfGeometry(file(line, 'two')));
  assert.notEqual(dxfGeometry(file(line, 'one')), '');
});
