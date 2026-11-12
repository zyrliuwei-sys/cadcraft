import { Link } from '@/core/i18n/navigation';
import { m } from '@/paraglide/messages.js';
import { getLocale } from '@/paraglide/runtime.js';
import { PostFaq } from '@/components/post-faq';
import { getGuideCopy, type GuidePage } from '@/content/guide-copy';

export function CadGuideContent({ page }: { page: GuidePage }) {
  const copy = getGuideCopy(page, getLocale());
  return (
    <section className="mx-auto max-w-3xl space-y-6 px-6 py-12">
      {copy && (
        <>
          <h2 className="font-display text-2xl font-semibold">
            {page === 'download'
              ? m['cad.guide.download_intro']()
              : m['cad.guide.online_intro']()}
          </h2>
          {copy.paragraphs.map((paragraph) => (
            <p key={paragraph} className="text-muted-foreground leading-7">
              {paragraph}
            </p>
          ))}
          <p className="text-muted-foreground leading-7">
            {page === 'download'
              ? m['cad.guide.viewer_prefix']()
              : 'Only need to look at it? Open the '}
            {page === 'online' && (
              <>
                <Link href="/dxf-viewer" className="text-signal-ink underline">
                  DXF viewer
                </Link>
                {' / '}
              </>
            )}
            <Link href="/dwg-viewer" className="text-signal-ink underline">
              {page === 'download'
                ? m['cad.guide.viewer_label']()
                : 'DWG viewer'}
            </Link>
            .
          </p>
          {page === 'download' && (
            <p className="text-muted-foreground leading-7">
              {m['cad.guide.pdf_prefix']()}{' '}
              <Link href="/dwg-to-pdf" className="text-signal-ink underline">
                {m['cad.guide.pdf_link']()}
              </Link>
            </p>
          )}
          {copy.faq.length > 0 && (
            <>
              <h2 className="font-display text-2xl font-semibold">
                {m['cad.guide.faq']()}
              </h2>
              <PostFaq items={copy.faq} />
            </>
          )}
        </>
      )}
      <p className="text-muted-foreground leading-7">
        {m['cad.guide.learn_prefix']()}{' '}
        <Link href="/tutorials" className="text-signal-ink underline">
          {m['cad.guide.tutorials_link']()}
        </Link>
        {' · '}
        <Link href="/vs-autocad" className="text-signal-ink underline">
          {m['cad.guide.compare_link']()}
        </Link>
      </p>
    </section>
  );
}

export function CadPracticeLinks() {
  return (
    <p className="text-muted-foreground mx-auto max-w-7xl px-6 pt-8 leading-7">
      {m['cad.guide.practice_prefix']()}{' '}
      <Link href="/online" className="text-signal-ink underline">
        {m['cad.guide.online_link']()}
      </Link>
      {' · '}
      <Link href="/download" className="text-signal-ink underline">
        {m['cad.guide.download_link']()}
      </Link>
    </p>
  );
}
