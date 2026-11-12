import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { PostFaq } from '../src/components/post-faq';
import {
  dwgViewerCopy,
  dwgViewerFaq,
  dwgViewerFaqJsonLd,
  dwgViewerVersions,
} from '../src/content/dwg-viewer';
import { DrawingImportError, MAX_DWG_BYTES } from '../src/lib/dwg-format';
import { openDwgPreview, PreviewError } from '../src/lib/dwg-preview';
import { faqAnswerParts, faqAnswerText } from '../src/lib/faq-links';

test('the viewing tool uses the existing editor limit, one focused title and four matching FAQs', () => {
  assert.ok(dwgViewerCopy.title.length <= 60);
  assert.equal(dwgViewerCopy.h1.toLowerCase(), 'dwg viewer');
  assert.ok(dwgViewerCopy.limits.includes(`${MAX_DWG_BYTES / 1024 / 1024} MB`));
  assert.equal(dwgViewerFaq.length, 4);
  const schema = dwgViewerFaqJsonLd();
  assert.equal(schema['@type'], 'FAQPage');
  for (const [i, [question, answer]] of dwgViewerFaq.entries()) {
    assert.equal(schema.mainEntity[i].name, question);
    assert.equal(
      schema.mainEntity[i].acceptedAnswer.text,
      faqAnswerText(answer)
    );
  }
});

test('DWG version rows reproduce the existing guide, including the unsupported R12 row', () => {
  const guide = readFileSync(
    new URL(
      '../src/content/posts/how-to-open-dwg-file.en.mdx',
      import.meta.url
    ),
    'utf8'
  );
  const codes = [
    ...guide.matchAll(/^\| (AC\d+(?: or lower)?)\s*\|\s*([^|]+)\|/gm),
  ].map((m) => [m[1], m[2].trim()]);
  assert.deepEqual(
    dwgViewerVersions.map(([code, format]) => [code, format]),
    codes
  );
  assert.equal(dwgViewerVersions[0][2], 'Not supported');
  assert.match(dwgViewerVersions[1][2], /not fully tested/);
  assert.match(dwgViewerVersions[2][2], /not fully tested/);
});

test('FAQ links are real same-site anchors and schema keeps the same readable answer', () => {
  const answer =
    'View in the [DWG viewer](/dwg-viewer), then use the [online editor](/online).';
  const html = renderToStaticMarkup(
    createElement(PostFaq, { items: [['Can I open it?', answer]] })
  );
  assert.match(html, /href="\/dwg-viewer"/);
  assert.match(html, /href="\/online"/);
  assert.equal(
    faqAnswerText(answer),
    'View in the DWG viewer, then use the online editor.'
  );
  for (const unsafe of [
    '[link](//evil.example)',
    '[link](javascript:alert(1))',
    '[link](/\\evil.example)',
    '[link](/../secret)',
  ]) {
    assert.ok(faqAnswerParts(unsafe).every((p) => !p.href));
  }
  const escaped = renderToStaticMarkup(
    createElement(PostFaq, {
      items: [['Q', '[<img src=x onerror=alert(1)>](/dwg-viewer)']],
    })
  );
  assert.ok(!escaped.includes('<img'));
});

test('invalid, unsupported and oversized drawings fail before graphics or network initialization', async () => {
  const container = {} as HTMLElement;
  const header = (version: string, size = 128) => {
    const bytes = new Uint8Array(size);
    bytes.set(new TextEncoder().encode(version));
    return bytes;
  };
  for (const [file, code] of [
    [new File(['not a drawing'], 'plan.txt'), 'file_type'],
    [new File(['not a drawing'], 'renamed.dwg'), 'invalid'],
    [new File([header('AC1009')], 'old.dwg'), 'version'],
    [new File([header('AC1032', MAX_DWG_BYTES + 1)], 'large.dwg'), 'too_large'],
  ] as const) {
    await assert.rejects(
      openDwgPreview(file, container, new AbortController().signal, () => {}),
      (error) =>
        (error instanceof PreviewError ||
          error instanceof DrawingImportError) &&
        error.code === code
    );
  }
  const controller = new AbortController();
  controller.abort();
  await assert.rejects(
    openDwgPreview(
      new File([header('AC1032')], 'plan.dwg'),
      container,
      controller.signal,
      () => {}
    ),
    (error) => error instanceof DrawingImportError && error.code === 'cancelled'
  );
});

test('the seven existing blog guides have only the requested new viewer entry points', () => {
  for (const slug of [
    'how-to-open-dwg-file',
    'dwg-to-pdf',
    'dwg-to-dxf',
    'dxf-vs-dwg',
    'pdf-to-dwg',
    'how-to-open-dxf-file',
    'open-source-dwg-editor',
  ]) {
    const text = readFileSync(
      new URL(`../src/content/posts/${slug}.en.mdx`, import.meta.url),
      'utf8'
    );
    assert.equal(
      (text.match(/\]\(\/dwg-viewer\)/g) ?? []).length,
      slug === 'how-to-open-dwg-file' ? 3 : 1,
      slug
    );
    assert.ok(text.split('## Related')[1].includes('](/dwg-viewer)'), slug);
  }
});
