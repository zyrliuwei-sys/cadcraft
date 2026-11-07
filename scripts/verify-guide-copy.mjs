import assert from 'node:assert/strict';

import { guideCopy } from '../src/content/guide-copy.ts';

for (const [page, copy] of Object.entries(guideCopy)) {
  if (!copy) {
    console.log(`${page}: awaiting owner-supplied body and FAQ copy`);
    process.exitCode = 1;
    continue;
  }
  const words = copy.paragraphs.join(' ').trim().split(/\s+/).length;
  assert.ok(
    words >= 150 && words <= 250,
    `${page}: body must be 150–250 words`
  );
  assert.ok(
    copy.faq.length >= 5 && copy.faq.length <= 8,
    `${page}: expected 5–8 FAQs`
  );
  assert.ok(
    copy.faq.every(([q, a]) => q.trim() && a.trim()),
    `${page}: empty FAQ`
  );
  assert.equal(new Set(copy.faq.map(([q]) => q)).size, copy.faq.length);
  console.log(
    `${page}: ${words} body words, ${copy.faq.length} visible/schema FAQs`
  );
}
