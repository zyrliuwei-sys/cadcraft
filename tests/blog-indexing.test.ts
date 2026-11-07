import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  isBlogPostIndexable,
  NOINDEX_BLOG_SLUGS,
} from '../src/content/posts/indexing';

test('the requested generic tutorials leave search indexing, within the 8–10 page scope', () => {
  assert.ok(NOINDEX_BLOG_SLUGS.size >= 8 && NOINDEX_BLOG_SLUGS.size <= 10);
  for (const slug of [
    'autocad-shortcuts',
    'autocad-commands',
    'how-to-scale-in-autocad',
    'autocad-blocks',
  ]) {
    assert.equal(isBlogPostIndexable(slug), false);
  }
});

test('ranked CADCraft articles remain indexable without changing their slugs', () => {
  for (const slug of [
    'cadcraft-github',
    'cadcraft-android',
    'cadcraft-3d',
    'cad-in-rust',
    'text-to-cad',
    'autocad-ai-agent-mcp',
    'cadcraft-vs-autocad-command-line',
  ]) {
    assert.equal(isBlogPostIndexable(slug), true);
  }
});
