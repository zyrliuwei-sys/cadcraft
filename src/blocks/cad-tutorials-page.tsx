import type { ReactNode } from 'react';
import {
  AlertTriangle,
  ExternalLink as ExternalIcon,
  Globe,
} from 'lucide-react';

import { Link } from '@/core/i18n/navigation';
import { cadcraftLinks } from '@/config/cadcraft';
import { ctaPrimary } from '@/lib/cta';
import { m } from '@/paraglide/messages.js';
import { DocLayout, DocSection, PageHero, Steps } from '@/blocks/cad-doc';
import { CodeBlock } from '@/components/code-block';
import { SheetFrame } from '@/components/sheet-frame';

function Note({ children }: { children: ReactNode }) {
  return (
    <p className="border-signal bg-signal-soft flex gap-2.5 border-l-[3px] p-4 text-sm">
      <AlertTriangle className="text-signal-ink mt-0.5 size-4 shrink-0" />
      <span>{children}</span>
    </p>
  );
}

export function CadTutorialsPage() {
  const lessons: { title: string; body: ReactNode }[] = [
    {
      title: m['cad.tut.l1_title'](),
      body: (
        <>
          <p>{m['cad.tut.l1_body']()}</p>
          <Steps
            items={[
              m['cad.tut.l1_s1'](),
              m['cad.tut.l1_s2'](),
              m['cad.tut.l1_s3'](),
            ]}
          />
        </>
      ),
    },
    {
      title: m['cad.tut.l2_title'](),
      body: (
        <>
          <p>{m['cad.tut.l2_body']()}</p>
          <ul className="list-disc space-y-2 pl-5">
            <li>{m['cad.tut.l2_s1']()}</li>
            <li>{m['cad.tut.l2_s2']()}</li>
            <li>{m['cad.tut.l2_s3']()}</li>
            <li>{m['cad.tut.l2_s4']()}</li>
            <li>{m['cad.tut.l2_s5']()}</li>
          </ul>
        </>
      ),
    },
    {
      title: m['cad.tut.l3_title'](),
      body: (
        <>
          <p>{m['cad.tut.l3_body']()}</p>
          <p className="font-medium">{m['cad.tut.l3_s1']()}</p>
          <CodeBlock code="line 0,0 @10,0 @0,5 c" />
          <p className="font-medium">{m['cad.tut.l3_s2']()}</p>
          <CodeBlock code="circle 5,2 1" />
          <p className="text-muted-foreground text-sm">
            {m['cad.tut.l3_s3']()}
          </p>
        </>
      ),
    },
    {
      title: m['cad.tut.l4_title'](),
      body: (
        <>
          <p>{m['cad.tut.l4_body']()}</p>
          <ul className="list-disc space-y-2 pl-5">
            <li>{m['cad.tut.l4_s1']()}</li>
            <li>{m['cad.tut.l4_s2']()}</li>
            <li>{m['cad.tut.l4_s3']()}</li>
          </ul>
        </>
      ),
    },
    {
      title: m['cad.tut.l5_title'](),
      body: (
        <>
          <p>{m['cad.tut.l5_body']()}</p>
          <p className="font-medium">{m['cad.tut.l5_s1']()}</p>
          <CodeBlock code="offset 0.25" />
          <ul className="list-disc space-y-2 pl-5">
            <li>{m['cad.tut.l5_s2']()}</li>
            <li>{m['cad.tut.l5_s3']()}</li>
          </ul>
          <p className="text-muted-foreground text-sm">
            {m['cad.tut.l5_s4']()}
          </p>
        </>
      ),
    },
    {
      title: m['cad.tut.l6_title'](),
      body: (
        <>
          <p>{m['cad.tut.l6_body']()}</p>
          <ul className="list-disc space-y-2 pl-5">
            <li>{m['cad.tut.l6_s1']()}</li>
            <li>{m['cad.tut.l6_s2']()}</li>
            <li>{m['cad.tut.l6_s3']()}</li>
            <li>{m['cad.tut.l6_s4']()}</li>
          </ul>
        </>
      ),
    },
    {
      title: m['cad.tut.l7_title'](),
      body: <p>{m['cad.tut.l7_body']()}</p>,
    },
    {
      title: m['cad.tut.l8_title'](),
      body: (
        <>
          <p>{m['cad.tut.l8_body']()}</p>
          <CodeBlock code="zoom e" />
          <Note>{m['cad.tut.l8_note']()}</Note>
        </>
      ),
    },
    {
      title: m['cad.tut.l9_title'](),
      body: (
        <>
          <p>{m['cad.tut.l9_body']()}</p>
          <CodeBlock
            code={
              "cadcraft-cli run --sample --script 'CIRCLE 22,3 1\\n' --save out.dxf --export out.png"
            }
          />
          <p className="font-medium">{m['cad.tut.l9_s1']()}</p>
          <CodeBlock
            code={
              'cadcraft-cli info drawing.dxf\ncadcraft-cli convert drawing.dxf drawing.svg\ncadcraft-cli convert drawing.dwg detail.png --window 0,0,20000,15000'
            }
          />
          <p className="font-medium">{m['cad.tut.l9_s2']()}</p>
          <CodeBlock
            code={'cadcraft-cli mcp\ncadcraft-cli mcp --connect 127.0.0.1:7979'}
          />
        </>
      ),
    },
  ];

  const toc = lessons.map((l, i) => ({
    id: `lesson-${i + 1}`,
    label: l.title,
  }));

  return (
    <>
      <PageHero
        eyebrow={m['cad.nav.tutorials']()}
        title={m['cad.tut.h1']()}
        lead={m['cad.tut.lead']()}
        aside={
          <SheetFrame>
            <img
              src="/imgs/cadcraft/cadcraft-canvas.webp"
              alt={m['cad.tut.hero_alt']()}
              width={1160}
              height={940}
              className="block h-auto w-full"
            />
          </SheetFrame>
        }
      >
        <Link href="/online" target="_blank" className={`${ctaPrimary} mt-8`}>
          <Globe className="size-4" />
          {m['cad.tut.open_online']()}
        </Link>
      </PageHero>
      <DocLayout tocTitle={m['cad.tut.toc']()} toc={toc}>
        {lessons.map((l, i) => (
          <DocSection key={i} id={`lesson-${i + 1}`} title={l.title}>
            {l.body}
          </DocSection>
        ))}
        <section className="bg-sheet-grid border-foreground/80 border p-8">
          <h2 className="font-display text-xl font-semibold">
            {m['cad.tut.next_title']()}
          </h2>
          <p className="text-muted-foreground mt-2">
            {m['cad.tut.next_desc']()}
          </p>
          <a
            href={cadcraftLinks.repo}
            target="_blank"
            rel="noopener noreferrer"
            className="text-signal-ink mt-4 inline-flex items-center gap-1.5 font-semibold hover:underline"
          >
            github.com/storytold/cadcraft
            <ExternalIcon className="size-4" />
          </a>
        </section>
      </DocLayout>
    </>
  );
}
