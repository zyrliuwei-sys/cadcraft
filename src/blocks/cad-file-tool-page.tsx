import { Link } from '@/core/i18n/navigation';
import { SITE_URL } from '@/config/site-url';
import { DocSection } from '@/blocks/cad-doc';
import { LocalFileTool } from '@/components/local-file-tool';
import { PostFaq } from '@/components/post-faq';
import {
  dwgLimit,
  dxfLimit,
  dxfVersions,
  fileToolCopy,
  fileToolFaq,
  fileToolFaqSchema,
  toolErrors,
  type FileToolKind,
} from '@/content/file-tools';

const linkStyle = 'text-signal-ink underline underline-offset-4';
const serialize = (value: unknown) =>
  JSON.stringify(value).replace(/</g, '\\u003c');

export function CadFileToolPage({ kind }: { kind: FileToolKind }) {
  const copy = fileToolCopy[kind];
  const app = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: copy.h1,
    url: `${SITE_URL}${copy.path}`,
    description: copy.description,
    applicationCategory: 'DesignApplication',
    operatingSystem: 'Web browser',
    browserRequirements: 'WebAssembly and WebGL2 support',
    isAccessibleForFree: true,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  };
  return (
    <>
      <script
        id={`${kind}-tool-application`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serialize(app) }}
      />
      <script
        id={`${kind}-tool-faq`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serialize(fileToolFaqSchema(kind)) }}
      />
      <section className="bg-sheet-grid border-b">
        <div className="mx-auto max-w-7xl px-4 pt-6 pb-8 sm:px-6">
          <h1 className="font-display text-3xl font-semibold sm:text-4xl">
            {copy.h1}
          </h1>
          <p className="text-muted-foreground mt-2 mb-5 leading-7">
            {copy.lead}
          </p>
          <LocalFileTool
            output={kind === 'dxf' ? 'svg' : 'pdf'}
            labels={{
              ...copy,
              errors: toolErrors,
              cancel: 'Cancel',
              fit: 'Fit drawing',
              zoomIn: 'Zoom in',
              zoomOut: 'Zoom out',
              download: 'Download PDF',
              stepOne: 'Choose a drawing',
              stepTwo: 'Download PDF',
              ready: 'Your PDF is ready',
              preview:
                kind === 'dxf'
                  ? 'DXF drawing preview'
                  : 'DWG to PDF conversion',
              hint: 'Drag to pan · Scroll, pinch or use the buttons to zoom',
              fidelity:
                kind === 'dxf'
                  ? 'Read-only 2D model-space preview. Missing fonts and unsupported objects may differ from the original.'
                  : 'Beta model-space export. Check text, lineweights and unsupported objects before sharing; keep your original.',
              desktop: 'Try the desktop app',
            }}
          />
          {kind === 'pdf' && (
            <p className="text-muted-foreground mt-3 text-sm">
              For DWG files larger than {dwgLimit} MB, batch jobs or layout
              control, use the{' '}
              <Link href="/download" className={linkStyle}>
                desktop download
              </Link>
              .
            </p>
          )}
        </div>
      </section>
      <div className="mx-auto max-w-3xl space-y-12 px-6 py-10 sm:py-14">
        <p className="text-muted-foreground leading-7">
          {kind === 'dxf'
            ? 'Use this page just to view a DXF. To edit geometry or save a drawing, use the '
            : 'Use this page to turn a drawing into a PDF. To change the drawing first, use the '}
          <Link href="/online" className={linkStyle}>
            online editor
          </Link>
          .
        </p>
        {kind === 'dxf' ? <DxfContent /> : <PdfContent />}
        <DocSection
          id="faq"
          title={kind === 'dxf' ? 'DXF viewer FAQ' : 'DWG to PDF FAQ'}
        >
          <PostFaq items={fileToolFaq[kind]} />
        </DocSection>
        {kind === 'pdf' && (
          <DocSection id="related" title="Related">
            <p>
              <Link href="/blog/dwg-to-pdf" className={linkStyle}>
                DWG to PDF Without Losing Lineweights
              </Link>{' '}
              — the detailed guide to pen weights, plot styles, fonts, layouts
              and CLI batch conversion.
            </p>
          </DocSection>
        )}
      </div>
    </>
  );
}

function DxfContent() {
  return (
    <>
      <DocSection id="ascii-or-binary" title="ASCII or binary?">
        <p>
          Before opening a DXF, inspect its first line in a text editor. A
          readable group code such as <code>0</code> followed by{' '}
          <code>SECTION</code> identifies ASCII DXF; a <code>999</code> comment
          may come first. If the bytes begin with{' '}
          <code>AutoCAD Binary DXF</code> followed by control characters, it is
          binary. Changing the filename does not change the encoding.
        </p>
        <p>
          The header’s <code>$ACADVER</code> value identifies the saved format.
          ASCII R12–2018 is readable here; binary requires R13 or newer, through
          2018. Binary R12 cannot be read. A headerless ASCII file can also open
          if its ENTITIES section is valid.
        </p>
      </DocSection>
      <DocSection id="dxf-versions" title="Which DXF versions open here">
        <p>
          These are file-format revisions, not the year the file was received.
          Supported format does not guarantee every custom object or layout will
          look identical. The input limit is {dxfLimit} MB, using the same limit
          as the online editor.
        </p>
        <div className="overflow-x-auto border">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-muted">
              <tr>
                {[
                  'Code',
                  'DXF version',
                  'ASCII in browser',
                  'Binary in browser',
                ].map((x) => (
                  <th
                    key={x}
                    scope="col"
                    className="border-b px-3 py-3 font-semibold"
                  >
                    {x}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dxfVersions.map((row) => (
                <tr key={row[0]} className="border-b last:border-0">
                  {row.map((v, i) =>
                    i === 0 ? (
                      <th
                        key={i}
                        scope="row"
                        className="px-3 py-2 font-mono text-xs"
                      >
                        {v}
                      </th>
                    ) : (
                      <td key={i} className="px-3 py-2">
                        {v}
                      </td>
                    )
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DocSection>
      <DocSection id="font-differences" title="Why text looks different">
        <p>
          When the original SHX font is unavailable, CADCraft substitutes its
          single-line stroke font. Different character widths can shift labels
          and change wrapping. The preview does not upload or locate the
          sender’s font files, and it is not an exact typography check.
        </p>
        <p>
          You can set a TrueType substitute with <code>SETVAR FONTALT</code> in
          the{' '}
          <Link href="/online" className={linkStyle}>
            online editor
          </Link>{' '}
          or desktop app, choosing a font with the characters you need. Inspect
          alignment and line breaks after substituting; this read-only page does
          not change the original drawing or its text styles.
        </p>
      </DocSection>
    </>
  );
}

function PdfContent() {
  return (
    <>
      <DocSection id="conversion-content" title="What survives the conversion">
        <p>
          The same CADCraft plotter used by the online editor produces vector
          PDF output: supported lines and curves remain vector paths rather than
          a screenshot. This tool fits model-space extents onto one page; it
          does not reproduce every paper-space layout or an AutoCAD CTB/STB
          automatically.
        </p>
        <p>
          TrueType/OpenType text remains searchable when a usable font can be
          embedded. SHX text is plotted as strokes or outlines and is not
          searchable; missing fonts or fallback outlining can change the result.
          Drawing layers are written as PDF optional-content layers, though the
          PDF reader must support them to show layer controls.
        </p>
        <p>
          DXF to PDF uses the same reader and plotter, with a {dxfLimit} MB DXF
          input limit. DWG import is beta and uses the existing local DWG-to-DXF
          step first. Unsupported custom objects, lineweight settings and font
          substitution can affect the output, so review the PDF before sending
          it.
        </p>
      </DocSection>
      <DocSection id="browser-vs-desktop" title="Browser limit vs. desktop">
        <div className="overflow-x-auto border">
          <table className="w-full table-fixed border-collapse text-left text-sm">
            <thead className="bg-muted">
              <tr>
                <th scope="col" className="border-r border-b px-4 py-3">
                  Browser converter
                </th>
                <th scope="col" className="border-b px-4 py-3">
                  <Link href="/download" className={linkStyle}>
                    Desktop download
                  </Link>
                </th>
              </tr>
            </thead>
            <tbody>
              {[
                [
                  `Up to ${dwgLimit} MB per DWG; beta local import.`,
                  `No ${dwgLimit} MB browser cap; practical limits depend on memory and drawing complexity.`,
                ],
                [
                  'One drawing at a time; download the PDF here.',
                  'CLI batch conversion for folders of DWG or DXF files.',
                ],
                [
                  'Model-space extents, fitted to a single PDF page.',
                  'Plot settings, layout selection and CLI options for more control.',
                ],
                [
                  'No installation or account; processing on this device.',
                  'Install the free application; local work does not require an account.',
                ],
              ].map(([a, b]) => (
                <tr key={a} className="border-b last:border-0">
                  <td className="border-r px-4 py-3 align-top">{a}</td>
                  <td className="px-4 py-3 align-top">{b}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DocSection>
    </>
  );
}
