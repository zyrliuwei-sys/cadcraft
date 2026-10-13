import { useEffect, useState, type ComponentType, type ReactNode } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  Bot,
  Braces,
  Check,
  Download,
  Globe,
  Minus,
  Monitor,
  Terminal,
} from 'lucide-react';

import { Link } from '@/core/i18n/navigation';
import { CADCRAFT_VERSION, cadcraftLinks } from '@/config/cadcraft';
import { ctaPrimary, ctaSecondary } from '@/lib/cta';
import { cn } from '@/lib/utils';
import { m } from '@/paraglide/messages.js';
import { CodeBlock } from '@/components/code-block';
import { CommandMarquee } from '@/components/command-marquee';
import { DimensionLine } from '@/components/dimension-line';
import { DraftingCanvas } from '@/components/drafting-canvas';
import { Reveal } from '@/components/reveal';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

/* ---------------------------------------------------------------- shared */

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="text-signal-ink mb-5 flex items-center gap-3 font-mono text-xs font-medium tracking-[0.08em] uppercase">
      <span className="snap-mark" aria-hidden="true" />
      <span className="shrink-0">{children}</span>
      <span
        className="plot-rule bg-signal/50 h-px w-24 sm:w-40"
        aria-hidden="true"
      />
    </p>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  className,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  className?: string;
}) {
  return (
    <div className={cn('max-w-3xl', className)}>
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <h2 className="font-display text-3xl leading-[1.1] font-semibold text-balance sm:text-4xl lg:text-[44px]">
        {title}
      </h2>
      {subtitle && (
        <p className="text-muted-foreground mt-5 max-w-[68ch] text-[17px] leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
}

function TextLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="group text-foreground decoration-signal inline-flex items-center gap-1.5 font-semibold underline decoration-2 underline-offset-[6px] hover:decoration-[3px]"
    >
      {children}
      <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}

/* ------------------------------------------------------------------ Hero */

export function CadHero() {
  return (
    <DraftingCanvas className="bg-sheet-grid border-b">
      <div
        id="overview"
        className="mx-auto max-w-7xl px-4 pt-12 sm:px-6 lg:pt-16"
      >
        <DimensionLine className="max-w-5xl">
          <h1 className="font-display rise-in text-[40px] leading-[1.04] font-semibold text-balance sm:text-5xl lg:text-[68px]">
            {m['home.hero.title']()}
          </h1>
        </DimensionLine>
        <div className="rise-in-2 mt-8 flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
          <p className="text-muted-foreground max-w-xl text-lg leading-relaxed">
            {m['home.hero.subtitle']()}
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/online" className={ctaPrimary}>
              <Globe className="size-4" />
              {m['home.hero.cta_online']()}
            </Link>
            <Link href="/download" className={ctaSecondary}>
              <Download className="size-4" />
              {m['home.hero.cta_download']()}
            </Link>
          </div>
        </div>

        <figure className="rise-in-3 relative mt-12 lg:mt-16">
          <div className="sheet-settle relative">
            <span
              className="border-signal bg-background absolute -top-1.5 -left-1.5 z-10 size-3 border-2"
              aria-hidden="true"
            />
            <span
              className="border-signal bg-background absolute -right-1.5 -bottom-1.5 z-10 size-3 border-2"
              aria-hidden="true"
            />
            <div className="border-foreground/80 bg-sheet border p-1.5 shadow-[0_40px_80px_-40px_oklch(0.22_0.012_255/0.45)] sm:p-2.5">
              <picture>
                <source
                  type="image/webp"
                  srcSet="/imgs/cadcraft/cadcraft-drawing-960.webp 960w, /imgs/cadcraft/cadcraft-drawing.webp 1680w"
                  sizes="(min-width: 1280px) 1232px, 100vw"
                />
                <img
                  src="/imgs/cadcraft/cadcraft-drawing.webp"
                  alt={m['home.hero.image_alt']()}
                  width={1680}
                  height={1050}
                  fetchPriority="high"
                  className="block h-auto w-full"
                />
              </picture>
            </div>
          </div>
        </figure>
      </div>
      <div className="h-14 lg:h-20" />
    </DraftingCanvas>
  );
}

/* ------------------------------------------- Title block (the signature) */

export function CadTitleBlock() {
  const cells = [
    [m['home.spec.license'](), m['home.spec.license_v']()],
    [m['home.spec.platforms'](), m['home.spec.platforms_v']()],
    [m['home.spec.files'](), m['home.spec.files_v']()],
    [m['home.spec.engine'](), m['home.spec.engine_v']()],
    [m['home.spec.agents'](), m['home.spec.agents_v']()],
    [m['home.spec.release'](), m['home.spec.release_v']()],
  ];
  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:py-16">
      <dl className="border-foreground/80 grid grid-cols-2 border-t border-l md:grid-cols-3 lg:grid-cols-6">
        {cells.map(([k, v]) => (
          <div
            key={k}
            className="border-foreground/80 border-r border-b px-4 py-4"
          >
            <dt className="text-muted-foreground font-mono text-[11px] tracking-[0.08em] uppercase">
              {k}
            </dt>
            <dd className="mt-1.5 text-[15px] leading-snug font-medium">{v}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

/* ------------------------------------------------------------ What is it */

export function CadWhatIs() {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:pb-28">
      <Reveal className="grid gap-10 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-4">
          <h2 className="font-display text-3xl leading-[1.1] font-semibold sm:text-4xl lg:sticky lg:top-24 lg:text-[44px]">
            {m['home.what.title']()}
          </h2>
        </div>
        <div className="space-y-5 text-[17px] leading-[1.75] lg:col-span-8">
          <p className="text-foreground text-xl leading-relaxed">
            {m['home.what.p1']()}
          </p>
          <p className="text-muted-foreground">{m['home.what.p2']()}</p>
          <p className="text-muted-foreground">{m['home.what.p3']()}</p>
          <p className="text-muted-foreground">{m['home.what.p4']()}</p>
          <div className="flex flex-wrap gap-x-8 gap-y-3 pt-3">
            <TextLink href="/download">{m['cad.nav.download']()}</TextLink>
            <TextLink href="/online">{m['cad.nav.online']()}</TextLink>
            <TextLink href="/tutorials">{m['cad.nav.tutorials']()}</TextLink>
            <TextLink href="/vs-autocad">{m['cad.nav.compare']()}</TextLink>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

/* -------------------------------------------------------------- Features */

export function CadFeatures() {
  const tabs = [
    {
      id: 'draw',
      label: m['cad.features.tab_draw'](),
      title: m['cad.features.draw_title'](),
      desc: m['home.features.draw_desc'](),
      commands: [
        'LINE',
        'PLINE',
        'CIRCLE',
        'ARC',
        'RECTANG',
        'POLYGON',
        'ELLIPSE',
        'SPLINE',
        'POINT',
        'XLINE',
        'RAY',
        'DONUT',
        'TEXT',
        'MTEXT',
      ],
    },
    {
      id: 'modify',
      label: m['cad.features.tab_modify'](),
      title: m['cad.features.modify_title'](),
      desc: m['cad.features.modify_desc'](),
      commands: [
        'ERASE',
        'MOVE',
        'COPY',
        'ROTATE',
        'SCALE',
        'MIRROR',
        'STRETCH',
        'OFFSET',
        'TRIM',
        'EXTEND',
        'FILLET',
        'CHAMFER',
        'BREAK',
        'JOIN',
        'EXPLODE',
        'ARRAY',
        'OVERKILL',
      ],
    },
    {
      id: 'precision',
      label: m['cad.features.tab_precision'](),
      title: m['cad.features.precision_title'](),
      desc: m['cad.features.precision_desc'](),
      commands: ['x,y', '@dx,dy', '@d<a', '#x,y', 'Enter', 'Space'],
    },
    {
      id: 'annotate',
      label: m['cad.features.tab_annotate'](),
      title: m['cad.features.annotate_title'](),
      desc: m['cad.features.annotate_desc'](),
      commands: [
        'DIMLINEAR',
        'DIMALIGNED',
        'DIMANGULAR',
        'DIMRADIUS',
        'MLEADER',
        'TABLE',
        'HATCH',
        'BLOCK',
        'INSERT',
      ],
    },
    {
      id: 'layouts',
      label: m['cad.features.tab_layouts'](),
      title: m['cad.features.layouts_title'](),
      desc: m['cad.features.layouts_desc'](),
      commands: ['PLOT', 'PDF', 'SVG', 'PNG', 'DXF R2000', 'DWG R2000'],
    },
    {
      id: 'parametric',
      label: m['cad.features.tab_parametric'](),
      title: m['cad.features.parametric_title'](),
      desc: m['cad.features.parametric_desc'](),
      commands: ['PARAMETERS'],
    },
  ];

  return (
    <section
      id="features"
      className="bg-muted scroll-mt-16 border-y py-20 lg:py-28"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal>
          <SectionHeading
            eyebrow={m['home.features.eyebrow']()}
            title={m['home.features.title']()}
          />
          <Tabs
            defaultValue="draw"
            className="mt-12 flex-col gap-8 lg:flex-row lg:gap-12"
          >
            <TabsList
              variant="line"
              className="h-auto! w-full justify-start gap-6 overflow-x-auto rounded-none border-b p-0 [scrollbar-width:none] lg:w-56 lg:shrink-0 lg:flex-col lg:items-stretch lg:gap-0 lg:border-b-0 lg:border-l"
            >
              {tabs.map((t) => (
                <TabsTrigger
                  key={t.id}
                  value={t.id}
                  className="data-active:text-foreground after:bg-signal! h-auto! flex-none justify-start rounded-none px-0 pb-3 text-[15px] font-semibold lg:py-3 lg:pl-5 lg:after:inset-y-0! lg:after:-left-px! lg:after:h-auto! lg:after:w-[3px]!"
                >
                  {t.label}
                </TabsTrigger>
              ))}
            </TabsList>
            {tabs.map((t) => (
              <TabsContent key={t.id} value={t.id} className="min-w-0 flex-1">
                <div className="grid gap-10 xl:grid-cols-[1fr_1.1fr] [&>*]:min-w-0">
                  <div>
                    <h3 className="font-display text-2xl leading-tight font-semibold sm:text-3xl">
                      {t.title}
                    </h3>
                    <p className="text-muted-foreground mt-4 text-[17px] leading-relaxed">
                      {t.desc}
                    </p>
                  </div>
                  <div className="bg-sheet border p-5 sm:p-6">
                    <p className="text-muted-foreground mb-4 font-mono text-[11px] tracking-[0.08em] uppercase">
                      {m['cad.features.commands_label']()}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {t.commands.map((c) => (
                        <kbd
                          key={c}
                          className="bg-background border-b-foreground/40 border border-b-2 px-2.5 py-1 font-mono text-[13px]"
                        >
                          {c}
                        </kbd>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </Reveal>
      </div>
    </section>
  );
}

export function CadMarquee() {
  return (
    <CommandMarquee
      words={[
        'LINE',
        'CIRCLE',
        'OFFSET',
        'TRIM',
        'FILLET',
        'HATCH',
        'DIMLINEAR',
        'BLOCK',
        'PLOT',
        'ZOOM',
      ]}
    />
  );
}

/* --------------------------------------------------------------- ArtCraft */

export function CadArtCraft() {
  const rows: { k: string; v: string; href?: string }[] = [
    {
      k: m['home.artcraft.k_developer'](),
      v: m['home.artcraft.v_developer'](),
    },
    {
      k: m['home.artcraft.k_source'](),
      v: 'github.com/storytold/cadcraft',
      href: cadcraftLinks.repo,
    },
    {
      k: m['home.artcraft.k_installer'](),
      v: m['home.artcraft.v_installer'](),
      href: cadcraftLinks.launcher,
    },
    {
      k: m['home.artcraft.k_official'](),
      v: 'getartcraft.com/apps/cadcraft',
      href: cadcraftLinks.official,
    },
  ];
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:py-28">
      <Reveal className="grid gap-12 lg:grid-cols-2 lg:gap-20 [&>*]:min-w-0">
        <div>
          <SectionHeading title={m['home.artcraft.title']()} />
          <p className="text-muted-foreground mt-6 text-[17px] leading-[1.75]">
            {m['home.artcraft.p1']()}
          </p>
          <p className="text-muted-foreground mt-4 text-[17px] leading-[1.75]">
            {m['home.artcraft.p2']()}
          </p>
        </div>
        <dl className="border-foreground/80 self-end border-t">
          {rows.map((r) => (
            <div
              key={r.k}
              className="grid grid-cols-[7rem_1fr] gap-4 border-b py-4 sm:grid-cols-[10rem_1fr]"
            >
              <dt className="text-muted-foreground font-mono text-[12px] tracking-[0.06em] uppercase">
                {r.k}
              </dt>
              <dd className="min-w-0 font-medium break-words">
                {r.href ? (
                  <a
                    href={r.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-signal-ink break-all"
                  >
                    {r.v}
                    <ArrowUpRight className="ml-1 inline size-3.5 align-[-2px]" />
                  </a>
                ) : (
                  r.v
                )}
              </dd>
            </div>
          ))}
        </dl>
      </Reveal>
    </section>
  );
}

/* ---------------------------------------------------------------- Agents */

export function CadAgents() {
  const pillars: [ComponentType<{ className?: string }>, string, string][] = [
    [Bot, m['cad.agents.p_mcp_title'](), m['cad.agents.p_mcp_desc']()],
    [Braces, m['cad.agents.p_json_title'](), m['cad.agents.p_json_desc']()],
    [Terminal, m['cad.agents.p_cli_title'](), m['cad.agents.p_cli_desc']()],
  ];
  const tools = [
    'command_line',
    'execute',
    'inspect_drawing',
    'query_entities',
    'render',
    'screenshot',
    'ui_click',
  ];

  return (
    <section
      id="agents"
      className="bg-sheet-grid scroll-mt-16 border-y py-20 lg:py-28"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal>
          <SectionHeading
            eyebrow={m['home.agents.eyebrow']()}
            title={m['home.agents.title']()}
            subtitle={m['home.agents.subtitle']()}
          />
          <p className="text-muted-foreground mt-4 max-w-[68ch] text-[17px] leading-relaxed">
            {m['home.agents.p2']()}
          </p>
          <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:gap-16 [&>*]:min-w-0">
            <ul className="space-y-8">
              {pillars.map(([Icon, title, desc]) => (
                <li key={title} className="flex gap-4">
                  <span className="border-foreground/80 bg-background flex size-10 shrink-0 items-center justify-center border">
                    <Icon className="size-5" />
                  </span>
                  <div>
                    <h3 className="font-semibold">{title}</h3>
                    <p className="text-muted-foreground mt-1 text-[15px] leading-relaxed">
                      {desc}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
            <div className="bg-background border-foreground/80 border">
              <CodeBlock
                className="border-0 border-b"
                code={[
                  'cadcraft-cli mcp',
                  'cadcraft-cli mcp --connect 127.0.0.1:7979',
                  "cadcraft-cli run --sample --script 'CIRCLE 22,3 1\\n' --save out.dxf --export out.png",
                  'cadcraft-cli convert drawing.dwg drawing.svg',
                ].join('\n')}
              />
              <div className="p-5">
                <p className="text-muted-foreground mb-3 font-mono text-[11px] tracking-[0.08em] uppercase">
                  {m['cad.agents.tools_label']()}
                </p>
                <div className="flex flex-wrap gap-2">
                  {tools.map((t) => (
                    <code
                      key={t}
                      className="bg-muted px-2 py-1 font-mono text-[13px]"
                    >
                      {t}
                    </code>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* --------------------------------------------------------------- Compare */

export function CompareTable({
  rows,
  className,
}: {
  rows: { label: string; cc: string; ac: string; ccWins?: boolean }[];
  className?: string;
}) {
  return (
    <div
      className={cn(
        'bg-sheet border-foreground/80 overflow-x-auto border',
        className
      )}
    >
      <table className="w-full min-w-[600px] text-left text-[15px]">
        <thead>
          <tr className="border-foreground/80 border-b">
            <th className="w-[22%] p-4" />
            <th className="p-4">
              <span className="font-display flex items-center gap-2 text-lg font-semibold">
                <img
                  src="/logo.svg"
                  alt=""
                  width={20}
                  height={20}
                  className="size-5"
                />
                {m['cad.compare.col_cadcraft']()}
              </span>
            </th>
            <th className="font-display p-4 text-lg font-semibold">
              {m['cad.compare.col_autocad']()}
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.label} className={cn('align-top', i > 0 && 'border-t')}>
              <th
                scope="row"
                className="text-muted-foreground p-4 font-mono text-[12px] font-normal tracking-[0.04em] uppercase"
              >
                {r.label}
              </th>
              <td className="bg-signal-soft/60 p-4 font-medium">
                <span className="flex gap-2.5">
                  {r.ccWins ? (
                    <Check className="text-signal-ink mt-0.5 size-4 shrink-0" />
                  ) : (
                    <Minus className="text-muted-foreground mt-0.5 size-4 shrink-0" />
                  )}
                  {r.cc}
                </span>
              </td>
              <td className="text-muted-foreground p-4">{r.ac}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function CadCompareTeaser() {
  const rows = [
    {
      label: m['cad.compare.row_price'](),
      cc: m['cad.compare.row_price_cc'](),
      ac: m['cad.compare.row_price_ac'](),
      ccWins: true,
    },
    {
      label: m['cad.compare.row_license'](),
      cc: m['cad.compare.row_license_cc'](),
      ac: m['cad.compare.row_license_ac'](),
      ccWins: true,
    },
    {
      label: m['cad.compare.row_platforms'](),
      cc: m['cad.compare.row_platforms_cc'](),
      ac: m['cad.compare.row_platforms_ac'](),
      ccWins: true,
    },
    {
      label: m['cad.compare.row_agents'](),
      cc: m['cad.compare.row_agents_cc'](),
      ac: m['cad.compare.row_agents_ac'](),
      ccWins: true,
    },
    {
      label: m['cad.compare.row_dwg'](),
      cc: m['cad.compare.row_dwg_cc'](),
      ac: m['cad.compare.row_dwg_ac'](),
    },
    {
      label: m['cad.compare.row_maturity'](),
      cc: m['cad.compare.row_maturity_cc'](),
      ac: m['cad.compare.row_maturity_ac'](),
    },
  ];
  return (
    <section
      id="compare"
      className="mx-auto max-w-7xl scroll-mt-16 px-4 py-20 sm:px-6 lg:py-28"
    >
      <Reveal>
        <SectionHeading
          eyebrow={m['home.compare.eyebrow']()}
          title={m['home.compare.title']()}
          subtitle={m['home.compare.subtitle']()}
        />
        <CompareTable rows={rows} className="mt-10" />
        <div className="mt-8">
          <TextLink href="/vs-autocad">{m['cad.compare.more']()}</TextLink>
        </div>
      </Reveal>
    </section>
  );
}

/* -------------------------------------------------------------- Download */

type Os = 'windows' | 'macos' | 'linux' | null;

function useVisitorOs(): Os {
  const [os, setOs] = useState<Os>(null);
  useEffect(() => {
    const ua = navigator.userAgent;
    if (/Android|iPhone|iPad/i.test(ua)) return;
    if (/Windows/i.test(ua)) setOs('windows');
    else if (/Mac OS X|Macintosh/i.test(ua)) setOs('macos');
    else if (/Linux|X11/i.test(ua)) setOs('linux');
  }, []);
  return os;
}

export function DownloadRows({ className }: { className?: string }) {
  const os = useVisitorOs();
  const rows = [
    {
      icon: Monitor,
      name: m['cad.download.windows'](),
      desc: m['cad.download.windows_desc'](),
      file: 'MSI x64',
      href: cadcraftLinks.windows,
    },
    {
      icon: Monitor,
      name: m['cad.download.macos'](),
      desc: m['cad.download.macos_desc'](),
      file: 'DMG Universal',
      href: cadcraftLinks.macos,
    },
    {
      icon: Terminal,
      name: m['cad.download.linux'](),
      desc: m['cad.download.linux_desc'](),
      file: 'Flatpak x86_64',
      href: cadcraftLinks.linux,
    },
  ];
  return (
    <div className={cn('border-foreground/80 bg-sheet border', className)}>
      {rows.map((r) => (
        <div
          key={r.name}
          className={cn(
            'relative grid items-center gap-4 border-b p-5 sm:grid-cols-[2.5rem_1fr_auto] sm:gap-6 sm:px-6',
            os === r.os &&
              'before:bg-signal before:absolute before:inset-y-0 before:left-0 before:w-[3px]'
          )}
        >
          <r.icon className="hidden size-6 sm:block" />
          <div className="min-w-0">
            <div className="flex flex-wrap items-baseline gap-x-3">
              <h3 className="font-display text-xl font-semibold">{r.name}</h3>
              <span className="text-muted-foreground font-mono text-xs">
                v{CADCRAFT_VERSION} {r.file}
              </span>
              {os === r.os && (
                <span className="text-signal-ink font-mono text-xs">
                  {m['cad.download.detected']()}
                </span>
              )}
            </div>
            <p className="text-muted-foreground mt-1 text-[15px]">{r.desc}</p>
          </div>
          <a
            href={r.href}
            className={cn(ctaPrimary, 'h-11 px-5 text-sm')}
            rel="noopener noreferrer"
          >
            <Download className="size-4" />
            {m['cad.download.btn']()}
          </a>
        </div>
      ))}
      <div className="bg-signal-soft grid items-center gap-4 p-5 sm:grid-cols-[2.5rem_1fr_auto] sm:gap-6 sm:px-6">
        <Globe className="text-signal-ink hidden size-6 sm:block" />
        <div className="min-w-0">
          <div className="flex flex-wrap items-baseline gap-x-3">
            <h3 className="font-display text-xl font-semibold">
              {m['cad.download.web']()}
            </h3>
            <span className="text-muted-foreground font-mono text-xs">
              WebAssembly
            </span>
          </div>
          <p className="text-muted-foreground mt-1 text-[15px]">
            {m['cad.download.web_desc']()}
          </p>
        </div>
        <Link href="/online" className={cn(ctaSecondary, 'h-11 px-5 text-sm')}>
          {m['home.hero.cta_online']()}
        </Link>
      </div>
    </div>
  );
}

export function CadDownload() {
  return (
    <section
      id="download"
      className="bg-muted scroll-mt-16 border-y py-20 lg:py-28"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal className="grid gap-12 lg:grid-cols-12 lg:gap-16 [&>*]:min-w-0">
          <div className="lg:col-span-5">
            <SectionHeading
              title={m['home.download.title']()}
              subtitle={m['home.download.subtitle']()}
            />
            <div className="mt-8">
              <TextLink href="/download">{m['cad.download.guide']()}</TextLink>
            </div>
          </div>
          <DownloadRows className="lg:col-span-7" />
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------- Tutorials */

export function CadLearn() {
  const side = [
    {
      title: m['cad.learn.c2_title'](),
      desc: m['cad.learn.c2_desc'](),
      href: '/tutorials#lesson-5',
      code: 'offset 0.25',
    },
    {
      title: m['cad.learn.c3_title'](),
      desc: m['cad.learn.c3_desc'](),
      href: '/tutorials#lesson-9',
      code: 'cadcraft-cli mcp',
    },
  ];
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:py-28">
      <Reveal>
        <SectionHeading
          title={m['home.learn.title']()}
          subtitle={m['home.learn.subtitle']()}
        />
        <div className="mt-12 grid gap-5 lg:grid-cols-[1.4fr_1fr] [&>*]:min-w-0">
          <Link
            href="/tutorials#lesson-3"
            className="group bg-sheet hover:border-foreground flex flex-col border transition-colors"
          >
            <img
              src="/imgs/cadcraft/cadcraft-canvas.webp"
              alt={m['home.hero.image_alt']()}
              width={1160}
              height={940}
              loading="lazy"
              className="aspect-[16/9] w-full object-cover object-top"
            />
            <div className="flex flex-1 flex-col p-6">
              <h3 className="font-display text-2xl font-semibold">
                {m['cad.learn.c1_title']()}
              </h3>
              <p className="text-muted-foreground mt-2">
                {m['cad.learn.c1_desc']()}
              </p>
              <code className="bg-muted mt-5 block truncate px-3 py-2 font-mono text-[13px]">
                line 0,0 @10,0 @0,5 c
              </code>
            </div>
          </Link>
          <div className="grid gap-5">
            {side.map((c) => (
              <Link
                key={c.href}
                href={c.href}
                className="group bg-sheet hover:border-foreground flex flex-col border p-6 transition-colors"
              >
                <h3 className="font-display text-xl font-semibold">
                  {c.title}
                </h3>
                <p className="text-muted-foreground mt-2 flex-1">{c.desc}</p>
                <code className="bg-muted mt-5 block truncate px-3 py-2 font-mono text-[13px]">
                  {c.code}
                </code>
              </Link>
            ))}
            <Link href="/tutorials" className={cn(ctaSecondary, 'w-full')}>
              {m['cad.learn.all']()}
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

/* ------------------------------------------------------------------- FAQ */

export function faqItems(): [string, string][] {
  return [
    [m['cad.faq.q1'](), m['cad.faq.a1']()],
    [m['cad.faq.q2'](), m['cad.faq.a2']()],
    [m['home.faq.q8'](), m['home.faq.a8']()],
    [m['cad.faq.q3'](), m['cad.faq.a3']()],
    [m['cad.faq.q4'](), m['cad.faq.a4']()],
    [m['cad.faq.q5'](), m['cad.faq.a5']()],
    [m['home.faq.q9'](), m['home.faq.a9']()],
    [m['cad.faq.q6'](), m['cad.faq.a6']()],
    [m['cad.faq.q7'](), m['cad.faq.a7']()],
  ];
}

export function CadFaq() {
  return (
    <section id="faq" className="scroll-mt-16 border-t">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-12 lg:gap-16 lg:py-28">
        <div className="lg:col-span-4">
          <h2 className="font-display text-3xl leading-[1.1] font-semibold sm:text-4xl lg:sticky lg:top-24 lg:text-[44px]">
            {m['cad.faq.title']()}
          </h2>
        </div>
        <Accordion className="border-foreground/80 border-t lg:col-span-8">
          {faqItems().map(([q, a]) => (
            <AccordionItem key={q} value={q} className="border-b">
              <AccordionTrigger className="py-5 text-left text-[17px] font-semibold hover:no-underline">
                {q}
              </AccordionTrigger>
              <AccordionContent
                keepMounted
                className="text-muted-foreground pb-6 text-base leading-relaxed"
              >
                {a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------- CTA */

export function CadCta() {
  return (
    <section className="bg-sheet-grid border-y">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 px-4 py-16 sm:px-6 lg:flex-row lg:items-center lg:py-24">
        <div className="max-w-2xl">
          <h2 className="font-display text-3xl leading-[1.1] font-semibold sm:text-[44px]">
            {m['home.cta.title']()}
            <span className="snap-mark ml-3" aria-hidden="true" />
          </h2>
          <p className="text-muted-foreground mt-4 text-lg">
            {m['home.cta.subtitle']()}
          </p>
        </div>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <Link href="/online" className={ctaPrimary}>
            <Globe className="size-4" />
            {m['home.hero.cta_online']()}
          </Link>
          <Link href="/download" className={ctaSecondary}>
            <Download className="size-4" />
            {m['home.hero.cta_download']()}
          </Link>
        </div>
      </div>
    </section>
  );
}
