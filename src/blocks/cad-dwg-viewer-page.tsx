import { Link } from '@/core/i18n/navigation';
import { DocSection } from '@/blocks/cad-doc';
import { DwgViewer } from '@/components/dwg-viewer';
import { PostFaq } from '@/components/post-faq';
import {
  dwgViewerCopy,
  dwgViewerFaq,
  dwgViewerVersions,
} from '@/content/dwg-viewer';

export function CadDwgViewerPage() {
  return (
    <>
      <section className="bg-sheet-grid border-b">
        <div className="mx-auto max-w-7xl px-4 pt-6 pb-8 sm:px-6">
          <h1 className="font-display text-3xl font-semibold sm:text-4xl">
            {dwgViewerCopy.h1}
          </h1>
          <p className="text-muted-foreground mt-2 mb-5 leading-7">
            {dwgViewerCopy.lead}
          </p>
          <DwgViewer labels={dwgViewerCopy} />
        </div>
      </section>
      <div className="mx-auto max-w-3xl space-y-12 px-6 py-10 sm:py-14">
        <p className="text-muted-foreground leading-7">
          Use this page to view a drawing; to modify geometry or save a copy,
          use the{' '}
          <Link href="/online" className="text-signal-ink underline">
            online editor
          </Link>{' '}
          or the{' '}
          <Link href="/download" className="text-signal-ink underline">
            desktop download
          </Link>
          .
        </p>
        <DocSection id="supported-dwg-versions" title="Supported DWG versions">
          <p>
            The reader accepts R13 through the 2018 DWG format. A format code
            describes the saved file, not the year it was sent. The earlier
            R13/R14 formats are listed as supported but have not been fully
            tested.
          </p>
          <div className="overflow-x-auto border">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-muted">
                <tr>
                  {['File code', 'DWG format', 'Browser preview'].map(
                    (label) => (
                      <th
                        key={label}
                        scope="col"
                        className="border-b px-3 py-3 font-semibold"
                      >
                        {label}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {dwgViewerVersions.map(([code, version, support]) => (
                  <tr key={code} className="border-b last:border-0">
                    <th
                      scope="row"
                      className="px-3 py-2 font-mono text-xs font-medium"
                    >
                      {code}
                    </th>
                    <td className="px-3 py-2">{version}</td>
                    <td className="px-3 py-2">{support}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DocSection>
        <DocSection
          id="viewer-vs-editor"
          title="DWG viewer vs. the online editor"
        >
          <div className="overflow-x-auto border">
            <table className="w-full table-fixed border-collapse text-left text-sm">
              <thead className="bg-muted">
                <tr>
                  <th scope="col" className="border-r border-b px-4 py-3">
                    DWG viewer
                  </th>
                  <th scope="col" className="border-b px-4 py-3">
                    Online editor
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  [
                    'Check a DWG someone sent you, without starting a drafting workflow.',
                    'Create or change geometry, work with layers and dimensions.',
                  ],
                  [
                    'Read-only 2D preview with pan, zoom and fit to drawing.',
                    'CAD command line, drawing tools and local file saving.',
                  ],
                  [
                    'Converts DWG locally only to prepare the preview; no drawing is saved or overwritten.',
                    'Imports DWG/DXF and edits or saves a DXF copy; desktop tools provide the DWG save workflow.',
                  ],
                  [
                    'No account required to view a local file.',
                    'No account required for local drawing; cloud features are optional.',
                  ],
                ].map(([viewer, editor]) => (
                  <tr key={viewer} className="border-b last:border-0">
                    <td className="border-r px-4 py-3 align-top">{viewer}</td>
                    <td className="px-4 py-3 align-top">{editor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DocSection>
        <DocSection id="faq" title="DWG viewer FAQ">
          <PostFaq items={dwgViewerFaq} />
        </DocSection>
      </div>
    </>
  );
}
