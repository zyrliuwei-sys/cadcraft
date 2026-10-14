import { ExternalLink as ExternalIcon, ShieldCheck } from 'lucide-react';

import { Link } from '@/core/i18n/navigation';
import { CADCRAFT_VERSION, cadcraftLinks } from '@/config/cadcraft';
import { ctaPrimary, ctaSecondary } from '@/lib/cta';
import { cn } from '@/lib/utils';
import { m } from '@/paraglide/messages.js';
import { DocLayout, DocSection, PageHero, Steps } from '@/blocks/cad-doc';
import { DownloadRows } from '@/blocks/cad-sections';
import { CodeBlock } from '@/components/code-block';

const V = CADCRAFT_VERSION;

export function CadDownloadPage() {
  const toc = [
    { id: 'launcher', label: m['cad.dl.launcher_title']() },
    { id: 'windows', label: m['cad.dl.win_title']() },
    { id: 'macos', label: m['cad.dl.mac_title']() },
    { id: 'linux', label: m['cad.dl.linux_title']() },
    { id: 'freebsd', label: m['cad.dl.bsd_title']() },
    { id: 'verify', label: m['cad.dl.verify_title']() },
    { id: 'source', label: m['cad.dl.source_title']() },
    { id: 'cli', label: m['cad.dl.cli_title']() },
    { id: 'web', label: m['cad.dl.web_title']() },
    { id: 'requirements', label: m['cad.dl.req_title']() },
  ];

  return (
    <>
      <PageHero
        eyebrow={m['cad.dl.version']()}
        title={m['cad.dl.h1']()}
        lead={m['cad.dl.lead']()}
        aside={
          <dl className="border-foreground/80 bg-sheet grid grid-cols-2 border-t border-l">
            {[
              [m['home.spec.release'](), `v${V}`],
              [m['home.spec.license'](), m['home.spec.license_v']()],
              ['Windows', 'x64, ARM64, x86'],
              ['macOS', 'Universal'],
              ['Linux', 'x86_64, aarch64, riscv64'],
              ['FreeBSD', 'x86_64'],
            ].map(([k, v]) => (
              <div
                key={k}
                className="border-foreground/80 border-r border-b px-4 py-4"
              >
                <dt className="text-muted-foreground font-mono text-[11px] tracking-[0.08em] uppercase">
                  {k}
                </dt>
                <dd className="font-display mt-1.5 text-lg leading-snug font-semibold">
                  {v}
                </dd>
              </div>
            ))}
          </dl>
        }
      >
        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href={cadcraftLinks.releases}
            target="_blank"
            rel="noopener noreferrer"
            className={ctaSecondary}
          >
            {m['cad.dl.all_assets']()}
            <ExternalIcon className="size-4" />
          </a>
        </div>
      </PageHero>

      <section className="mx-auto max-w-7xl px-4 pt-14 sm:px-6">
        <h2 className="font-display mb-6 text-2xl font-semibold">
          {m['cad.dl.quick_title']()}
        </h2>
        <DownloadRows />
        <p className="text-muted-foreground mt-4 flex items-start gap-2 text-sm">
          <ShieldCheck className="mt-0.5 size-4 shrink-0" />
          {m['cad.dl.official_note']()}
        </p>
      </section>

      <DocLayout tocTitle={m['cad.dl.toc']()} toc={toc}>
        <DocSection id="launcher" title={m['cad.dl.launcher_title']()}>
          <p>{m['cad.dl.launcher_desc']()}</p>
          <a
            href={cadcraftLinks.launcher}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(ctaPrimary, 'h-10 text-sm')}
          >
            {m['cad.dl.launcher_btn']()}
            <ExternalIcon className="size-4" />
          </a>
        </DocSection>

        <DocSection id="windows" title={m['cad.dl.win_title']()}>
          <Steps
            items={[
              <>
                {m['cad.dl.win_s1']()}{' '}
                <a
                  href={cadcraftLinks.windows}
                  className="text-signal-ink font-semibold hover:underline"
                >
                  cadcraft-{V}-windows-x64.msi
                </a>
              </>,
              m['cad.dl.win_s2'](),
              m['cad.dl.win_s3'](),
            ]}
          />
          <p className="pt-2 font-medium">{m['cad.dl.win_silent']()}</p>
          <CodeBlock
            code={`msiexec /i cadcraft-${V}-windows-x64.msi /qn DESKTOPSHORTCUT=1`}
          />
        </DocSection>

        <DocSection id="macos" title={m['cad.dl.mac_title']()}>
          <Steps
            items={[
              <>
                {m['cad.dl.mac_s1']()}{' '}
                <a
                  href={cadcraftLinks.macos}
                  className="text-signal-ink font-semibold hover:underline"
                >
                  cadcraft-{V}-macos-universal.dmg
                </a>
              </>,
              m['cad.dl.mac_s2'](),
              m['cad.dl.mac_s3'](),
            ]}
          />
        </DocSection>

        <DocSection id="linux" title={m['cad.dl.linux_title']()}>
          <Steps
            items={[
              <>
                <p>
                  {m['cad.dl.linux_s1']()}{' '}
                  <a
                    href={cadcraftLinks.linux}
                    className="text-signal-ink font-semibold hover:underline"
                  >
                    cadcraft-{V}-linux-x86_64.flatpak
                  </a>
                </p>
                <CodeBlock
                  className="mt-3"
                  code={`flatpak install --user cadcraft-${V}-linux-x86_64.flatpak`}
                />
              </>,
              m['cad.dl.linux_s2'](),
            ]}
          />
        </DocSection>

        <DocSection id="freebsd" title={m['cad.dl.bsd_title']()}>
          <p>{m['cad.dl.bsd_desc']()}</p>
        </DocSection>

        <DocSection id="verify" title={m['cad.dl.verify_title']()}>
          <p>
            {m['cad.dl.verify_desc']()}{' '}
            <a
              href={cadcraftLinks.checksums}
              className="text-signal-ink font-semibold hover:underline"
            >
              SHA256SUMS.txt
            </a>
          </p>
          <p className="text-sm font-semibold">macOS / Linux</p>
          <CodeBlock
            code={`shasum -a 256 cadcraft-${V}-macos-universal.dmg\nsha256sum cadcraft-${V}-linux-x86_64.flatpak`}
          />
          <p className="text-sm font-semibold">Windows (PowerShell)</p>
          <CodeBlock
            code={`Get-FileHash .\\cadcraft-${V}-windows-x64.msi -Algorithm SHA256`}
          />
        </DocSection>

        <DocSection id="source" title={m['cad.dl.source_title']()}>
          <p>{m['cad.dl.source_desc']()}</p>
          <CodeBlock
            code={`git clone ${cadcraftLinks.repo}\ncd cadcraft\ncargo run --release -p cadcraft -- --sample`}
          />
        </DocSection>

        <DocSection id="cli" title={m['cad.dl.cli_title']()}>
          <p>{m['cad.dl.cli_desc']()}</p>
          <CodeBlock
            code={
              'cadcraft-cli info drawing.dxf\ncadcraft-cli convert drawing.dxf drawing.svg\ncadcraft-cli mcp'
            }
          />
        </DocSection>

        <DocSection id="web" title={m['cad.dl.web_title']()}>
          <p>
            {m['cad.dl.web_desc']()}{' '}
            <a
              href={cadcraftLinks.web}
              className="text-signal-ink font-semibold hover:underline"
            >
              cadcraft-web-{V}.zip
            </a>
          </p>
          <CodeBlock
            code={
              'unzip cadcraft-web-' +
              V +
              '.zip\ncd cadcraft-web-' +
              V +
              '\npython3 -m http.server 8765'
            }
          />
          <Link
            href="/online"
            className="text-signal-ink inline-block font-semibold hover:underline"
          >
            {m['cad.dl.web_try']()} →
          </Link>
        </DocSection>

        <DocSection id="requirements" title={m['cad.dl.req_title']()}>
          <ul className="list-disc space-y-2 pl-5">
            <li>{m['cad.dl.req_win']()}</li>
            <li>{m['cad.dl.req_mac']()}</li>
            <li>{m['cad.dl.req_linux']()}</li>
            <li>{m['cad.dl.req_freebsd']()}</li>
            <li>{m['cad.dl.req_web']()}</li>
          </ul>
        </DocSection>
      </DocLayout>
    </>
  );
}
