import { Link } from '@/core/i18n/navigation';
import { getLocale } from '@/paraglide/runtime.js';
import { DocSection } from '@/blocks/cad-doc';
import { DwgViewer } from '@/components/dwg-viewer';
import { PostFaq } from '@/components/post-faq';
import { dwgViewerVersions } from '@/content/dwg-viewer';
import { localizedDwgContent } from '@/content/localized-dwg-viewer';

export function LocalizedDwgViewerPage() {
  const content = localizedDwgContent(getLocale())!;
  const { copy, body } = content;
  const rows = dwgViewerVersions.map(([code, version], i) => [
    i === 0 ? body.firstCode : code,
    i === 0 ? body.firstVersion : version,
    body.support[i === 0 ? 0 : i < 3 ? 1 : 2],
  ]);
  return (
    <>
      <section className="bg-sheet-grid border-b">
        <div className="mx-auto max-w-7xl px-4 pt-4 pb-8 sm:px-6">
          <h1 className="font-display text-3xl font-semibold sm:text-4xl">
            {copy.h1}
          </h1>
          <p className="text-muted-foreground mt-2 mb-3 leading-7">
            {copy.lead}
          </p>
          <DwgViewer labels={copy} />
        </div>
      </section>
      <div className="mx-auto max-w-3xl space-y-12 px-6 py-10 sm:py-14">
        <p className="text-muted-foreground leading-7">
          {body.intro[0]}
          <Link href="/online" className="text-signal-ink underline">
            {body.intro[1]}
          </Link>
          {body.intro[2]}
          <Link href="/download" className="text-signal-ink underline">
            {body.intro[3]}
          </Link>
          {body.intro[4]}
        </p>
        <DocSection id="supported-dwg-versions" title={body.versionsTitle}>
          <p>{body.versionsDescription}</p>
          <div className="overflow-x-auto border">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-muted">
                <tr>
                  {body.columns.map((label) => (
                    <th
                      key={label}
                      scope="col"
                      className="border-b px-3 py-3 font-semibold"
                    >
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map(([code, version, support]) => (
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
        <DocSection id="viewer-vs-editor" title={body.comparisonTitle}>
          <div className="overflow-x-auto border">
            <table className="w-full table-fixed border-collapse text-left text-sm">
              <thead className="bg-muted">
                <tr>
                  <th scope="col" className="border-r border-b px-4 py-3">
                    {body.comparisonColumns[0]}
                  </th>
                  <th scope="col" className="border-b px-4 py-3">
                    {body.comparisonColumns[1]}
                  </th>
                </tr>
              </thead>
              <tbody>
                {body.comparison.map(([viewer, editor]) => (
                  <tr key={viewer} className="border-b last:border-0">
                    <td className="border-r px-4 py-3 align-top">{viewer}</td>
                    <td className="px-4 py-3 align-top">{editor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DocSection>
        <DocSection id="faq" title={body.faqTitle}>
          <PostFaq items={body.faq as [string, string][]} />
        </DocSection>
      </div>
    </>
  );
}
