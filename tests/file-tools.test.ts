import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import {
  dxfVersions,
  fileToolCopy,
  fileToolFaq,
  fileToolFaqSchema,
} from '../src/content/file-tools';
import {
  CadToolError,
  exportLocalDrawing,
  validateToolDxf,
  validateToolOutput,
} from '../src/lib/cad-tool-engine';
import { MAX_DXF_BYTES } from '../src/lib/dwg-format';

const fixture = (name: string) =>
  new File(
    [
      new Uint8Array(
        readFileSync(new URL(`./fixtures/dxf/${name}`, import.meta.url))
      ),
    ],
    name
  );

test('DXF gate accepts ASCII R12/2018 and binary R13/2018, rejects binary R12 and other input', async () => {
  for (const name of [
    'ascii-AC1009.dxf',
    'ascii-AC1032.dxf',
    'binary-AC1012.dxf',
    'binary-AC1032.dxf',
  ]) {
    const type = await validateToolDxf(fixture(name));
    assert.equal(type.binary, name.startsWith('binary'));
    assert.equal(type.version, name.match(/AC\d+/)?.[0]);
  }
  const reject = async (file: File, code: string) =>
    assert.rejects(
      validateToolDxf(file),
      (e) => e instanceof CadToolError && e.code === code
    );
  await reject(fixture('binary-AC1009.dxf'), 'version');
  await reject(new File(['not DXF'], 'renamed.dxf'), 'invalid');
  await reject(new File(['0\nSECTION\n'], 'drawing.txt'), 'file_type');
  await reject(
    new File(['0\nSECTION\n2\nHEADER\n9\n$ACADVER\n1\nAC1099\n'], 'future.dxf'),
    'version'
  );
  const large = fixture('ascii-AC1032.dxf');
  Object.defineProperty(large, 'size', { value: MAX_DXF_BYTES + 1 });
  await reject(large, 'too_large');
  await validateToolDxf(
    new File(
      ['999\ncomment\n0\nSECTION\n2\nENTITIES\n0\nENDSEC\n0\nEOF\n'],
      'headerless.dxf'
    )
  );
});

test('cancelled or invalid tool input never starts a browser engine', async () => {
  const signal = new AbortController();
  signal.abort();
  await assert.rejects(
    exportLocalDrawing(
      fixture('ascii-AC1009.dxf'),
      'svg',
      signal.signal,
      () => {}
    ),
    (e) => e instanceof CadToolError && e.code === 'cancelled'
  );
  await assert.rejects(
    exportLocalDrawing(
      new File(['wrong'], 'plan.pdf'),
      'pdf',
      new AbortController().signal,
      () => {}
    ),
    (e) => e instanceof CadToolError && e.code === 'file_type'
  );
});

test('output gate rejects renamed, truncated and oversized PDF results', async () => {
  await validateToolOutput(
    new Blob(['%PDF-1.7\n' + ' '.repeat(200) + '\n%%EOF']),
    'pdf'
  );
  await validateToolOutput(
    new Blob([
      '<svg xmlns="http://www.w3.org/2000/svg">' + ' '.repeat(200) + '</svg>',
    ]),
    'svg'
  );
  for (const text of [
    '<html>' + ' '.repeat(200),
    '%PDF-1.7\n' + ' '.repeat(200),
    '%PDF-1.7\n%%EOF',
  ])
    await assert.rejects(
      validateToolOutput(new Blob([text]), 'pdf'),
      (e) => e instanceof CadToolError && e.code === 'export'
    );
  const large = new Blob(['%PDF-1.7']);
  Object.defineProperty(large, 'size', { value: MAX_DXF_BYTES + 1 });
  await assert.rejects(validateToolOutput(large, 'pdf'));
});

test('tool metadata targets separate intents and FAQ schemas match visible copy', () => {
  for (const kind of ['dxf', 'pdf'] as const) {
    assert.ok(fileToolCopy[kind].title.length <= 60);
    assert.equal(
      fileToolFaqSchema(kind).mainEntity.length,
      fileToolFaq[kind].length
    );
  }
  assert.equal(fileToolFaq.dxf.length, 4);
  assert.equal(fileToolFaq.pdf.length, 3);
  assert.match(fileToolCopy.dxf.limits, /64 MB/);
  assert.match(fileToolCopy.pdf.limits, /20 MB/);
  assert.ok(!fileToolCopy.pdf.title.toLowerCase().includes('dxf'));
  assert.equal(dxfVersions.length, 9);
  assert.match(dxfVersions[0][3], /^No/);
  assert.ok(
    dxfVersions.slice(1).every((row) => row[2] === 'Yes' && row[3] === 'Yes')
  );
});

test('the two existing blog titles and requested link placements stay distinct', () => {
  const read = (slug: string) =>
    readFileSync(
      new URL(`../src/content/posts/${slug}.en.mdx`, import.meta.url),
      'utf8'
    );
  const pdf = read('dwg-to-pdf'),
    dxf = read('how-to-open-dxf-file');
  assert.match(pdf, /title: 'DWG to PDF Without Losing Lineweights'/);
  assert.match(dxf, /title: 'How to Open a DXF File: 5 Free Ways'/);
  assert.equal((pdf.match(/\]\(\/dwg-to-pdf\)/g) || []).length, 2);
  assert.ok(
    pdf
      .split('## Related')[1]
      .trimStart()
      .startsWith(
        '- [Convert DWG to PDF in your browser — free, no install](/dwg-to-pdf)'
      )
  );
  assert.equal((dxf.match(/\]\(\/dxf-viewer\)/g) || []).length, 2);
  for (const slug of ['dwg-to-dxf', 'dxf-vs-dwg'])
    assert.ok(
      read(slug).split('## Related')[1].includes('[DXF viewer](/dxf-viewer)')
    );
});
