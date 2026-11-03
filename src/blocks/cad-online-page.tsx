import { useEffect, useRef, useState } from 'react';
import {
  CheckCircle2,
  Info,
  Loader2,
  Lock,
  Maximize2,
  Minus,
  Plus,
  Smartphone,
  Upload,
} from 'lucide-react';
import { toast } from 'sonner';

import { Link } from '@/core/i18n/navigation';
import { CADCRAFT_VERSION, cadcraftLinks } from '@/config/cadcraft';
import { ctaSecondary } from '@/lib/cta';
import { downloadSharedDrawing } from '@/lib/drawings-client';
import { track } from '@/lib/track';
import { cn } from '@/lib/utils';
import { m } from '@/paraglide/messages.js';
import { useEditorFiles } from '@/hooks/use-editor-files';
import { CloudDrawingsDialog } from '@/blocks/cloud-drawings-dialog';
import { CloudActions, EditorFilesBar } from '@/blocks/editor-files-bar';
import { ProUpsellDialog } from '@/blocks/pro-upsell-dialog';
import { CodeBlock } from '@/components/code-block';

type Renderer = '' | '?webgl' | '?cpu';

// Keep the reference desktop layout and scale the entire editor on every screen.
const VIRTUAL_WIDTH = 1280;
const VIRTUAL_HEIGHT = (VIRTUAL_WIDTH * 1358) / 2182;

function useFitScale() {
  const ref = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState<{ scale: number; height: number } | null>(
    null
  );
  // Hold the iframe until measured so phones don't boot the app twice.
  const [measured, setMeasured] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      setMeasured(true);
      const scale = el.clientWidth / VIRTUAL_WIDTH;
      if (!scale) return;
      setBox({ scale, height: el.clientHeight / scale });
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, box, measured };
}

export function CadOnlinePage() {
  const [renderer, setRenderer] = useState<Renderer>('');
  const [uiZoom, setUiZoom] = useState(1);
  const files = useEditorFiles();
  const importInput = useRef<HTMLInputElement>(null);
  const editorShell = useRef<HTMLDivElement>(null);
  const [cloudOpen, setCloudOpen] = useState(false);
  const [upsellOpen, setUpsellOpen] = useState(false);
  const { openFile } = files;
  const importErrors = {
    too_large: m['cad.online.import_error_large'](),
    invalid: m['cad.online.import_error_invalid'](),
    version: m['cad.online.import_error_version'](),
    conversion: m['cad.online.import_error_conversion'](),
    timeout: m['cad.online.import_error_timeout'](),
    cancelled: m['cad.online.import_cancelled'](),
    not_ready: m['cad.online.import_error_ready'](),
    open_failed: m['cad.online.import_error_open'](),
    busy: m['cad.online.import_error_busy'](),
  };
  const importProgress = {
    loading: m['cad.online.import_loading'](),
    converting: m['cad.online.import_converting'](),
    opening: m['cad.online.import_opening'](),
  };

  // /online?share=<token>: open a copy of someone's shared cloud drawing.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('pro') === 'welcome') {
      track('pro_welcome');
      toast.success(m['cad.cloud.welcome']());
    }
    const token = params.get('share');
    if (!token) return;
    track('cloud_share_open');
    downloadSharedDrawing(token)
      .then(openFile)
      .then((ok) => ok && toast.success(m['cad.cloud.shared_opened']()))
      .catch((e) => toast.error(e.message));
  }, [openFile]);

  const saveToCloud = async () => {
    if (!files.pro) {
      track('cloud_save_click', { pro: 0 });
      setUpsellOpen(true);
      return;
    }
    const result = await files.saveToCloud();
    if (result.ok) toast.success(m['cad.cloud.saved']());
    else if (result.reason === 'empty')
      toast.error(m['cad.cloud.save_empty']());
    else if (result.reason === 'not_ready')
      toast.error(m['cad.cloud.save_not_ready']());
    else toast.error(m['cad.cloud.save_failed']({ error: result.message }));
  };
  // v= busts a cached index.html that still points at the previous build's files
  const src = `${cadcraftLinks.app}${renderer}${renderer ? '&' : '?'}ui=2&v=${CADCRAFT_VERSION}`;
  const { ref: frameBoxRef, box, measured } = useFitScale();

  const renderers: [Renderer, string][] = [
    ['', m['cad.online.render_auto']()],
    ['?webgl', m['cad.online.render_webgl']()],
    ['?cpu', m['cad.online.render_cpu']()],
  ];

  const tips = [
    ['line 0,0 @10,0 @0,5 c', m['cad.online.tip1']()],
    ['circle 5,2 1', m['cad.online.tip2']()],
    ['offset 0.25', m['cad.online.tip3']()],
    ['zoom e', m['cad.online.tip4']()],
  ];

  return (
    <>
      <div ref={editorShell} className="bg-background fullscreen:overflow-auto">
        <section className="bg-sheet-grid border-b">
          <div className="mx-auto flex max-w-[1600px] flex-col gap-4 px-4 py-5 sm:px-6 xl:flex-row xl:items-center xl:justify-between xl:gap-8">
            <div className="min-w-0">
              <h1 className="font-display text-2xl font-semibold sm:text-3xl">
                {m['cad.online.h1']()}
              </h1>
              <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                {m['cad.online.lead']()}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 xl:shrink-0 xl:flex-nowrap">
              <input
                ref={importInput}
                type="file"
                accept=".dwg,.dxf"
                aria-label={m['cad.online.import_button']()}
                className="hidden"
                onChange={(event) => {
                  const file = event.currentTarget.files?.[0];
                  event.currentTarget.value = '';
                  if (file) void openFile(file);
                }}
              />
              <button
                type="button"
                onClick={() => importInput.current?.click()}
                disabled={!!files.importPhase}
                className={cn(
                  ctaSecondary,
                  'h-10 px-4 text-sm disabled:cursor-wait disabled:opacity-50'
                )}
              >
                <Upload className="size-4" />
                {m['cad.online.import_button']()}
              </button>
              <div
                className="flex items-center border"
                role="group"
                aria-label={m['cad.online.ui_zoom']()}
              >
                <button
                  type="button"
                  className="flex size-10 items-center justify-center disabled:opacity-40"
                  aria-label={m['cad.online.zoom_out']()}
                  disabled={uiZoom <= 1}
                  onClick={() => setUiZoom((zoom) => Math.max(1, zoom - 0.25))}
                >
                  <Minus className="size-4" />
                </button>
                <button
                  type="button"
                  className="h-10 min-w-14 px-2 text-xs font-semibold"
                  onClick={() => setUiZoom(1)}
                  aria-label={m['cad.online.zoom_fit']()}
                >
                  {Math.round(uiZoom * 100)}%
                </button>
                <button
                  type="button"
                  className="flex size-10 items-center justify-center disabled:opacity-40"
                  aria-label={m['cad.online.zoom_in']()}
                  disabled={uiZoom >= 3}
                  onClick={() => setUiZoom((zoom) => Math.min(3, zoom + 0.25))}
                >
                  <Plus className="size-4" />
                </button>
              </div>
              <div className="flex border p-0.5" role="group">
                {renderers.map(([value, label]) => (
                  <button
                    key={value || 'auto'}
                    type="button"
                    onClick={() => setRenderer(value)}
                    aria-pressed={renderer === value}
                    className={cn(
                      'rounded-[2px] px-3 py-1.5 text-xs font-semibold transition-colors',
                      renderer === value
                        ? 'bg-primary text-primary-foreground'
                        : 'text-foreground/70 hover:text-foreground'
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => {
                  if (document.fullscreenElement)
                    void document.exitFullscreen();
                  else
                    void editorShell.current
                      ?.requestFullscreen()
                      .catch(() => {});
                }}
                className={cn(
                  ctaSecondary,
                  'hidden h-9 px-4 text-sm md:inline-flex'
                )}
              >
                <Maximize2 className="size-4" />
                {m['cad.online.fullscreen']()}
              </button>
              <CloudActions
                pro={files.pro}
                hasCloud={files.cloud.length > 0}
                saving={files.cloudSaving}
                onSave={saveToCloud}
                onShowList={() => setCloudOpen(true)}
              />
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-[1600px] px-0 sm:px-6 sm:py-4">
          <div className="space-y-2 border-x border-t px-4 py-3 text-sm">
            <p className="text-muted-foreground">
              {m['cad.online.import_note']()}
            </p>
            {files.importPhase && (
              <div role="status" className="flex flex-wrap items-center gap-3">
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                <span>{importProgress[files.importPhase]}</span>
                {files.importPhase !== 'opening' && (
                  <button
                    type="button"
                    onClick={files.cancelImport}
                    className="font-semibold underline underline-offset-4"
                  >
                    {m['cad.online.import_cancel']()}
                  </button>
                )}
              </div>
            )}
            {files.importError && (
              <p role="alert" className="text-destructive">
                {importErrors[files.importError]}{' '}
                {files.importError !== 'cancelled' &&
                  files.importError !== 'busy' && (
                    <Link
                      href="/download"
                      className="font-semibold underline underline-offset-4"
                    >
                      {m['cad.online.import_desktop']()}
                    </Link>
                  )}
              </p>
            )}
            {files.importedDwg && (
              <p role="status" className="flex items-start gap-2">
                <CheckCircle2
                  className="mt-0.5 size-4 shrink-0"
                  aria-hidden="true"
                />
                {m['cad.online.import_success']({ name: files.importedDwg })}
              </p>
            )}
          </div>
          <p className="text-muted-foreground flex items-center gap-2 px-4 py-3 text-sm md:hidden">
            <Smartphone className="size-4 shrink-0" />
            {m['cad.online.mobile_note']()}
          </p>
          <EditorFilesBar
            recent={files.recent}
            savedAt={files.savedAt}
            onRestore={files.restore}
            pro={files.pro}
            cloudSavedAt={files.cloudSavedAt}
            cloudSaving={files.cloudSaving}
            cloudFailed={files.cloudFailed}
          />
          <div
            ref={frameBoxRef}
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              for (const file of Array.from(event.dataTransfer.files))
                void openFile(file);
            }}
            className="relative w-full overflow-auto border-y bg-[#22282f] sm:border"
            style={{ aspectRatio: `${VIRTUAL_WIDTH} / ${VIRTUAL_HEIGHT}` }}
          >
            {measured && box && (
              <div
                className="relative"
                style={{
                  width: VIRTUAL_WIDTH * box.scale * uiZoom,
                  height: box.height * box.scale * uiZoom,
                }}
              >
                <iframe
                  key={`${src}${box ? '#fit' : ''}`}
                  src={src}
                  data-fit={box ? '1' : undefined}
                  title="CADCraft"
                  onLoad={(e) => {
                    track('online_app_loaded');
                    files.onFrameLoad(e.currentTarget);
                  }}
                  className="absolute top-0 left-0 block h-full w-full"
                  style={
                    box
                      ? {
                          width: VIRTUAL_WIDTH,
                          height: box.height,
                          transform: `scale(${box.scale * uiZoom})`,
                          transformOrigin: '0 0',
                        }
                      : undefined
                  }
                  allow="fullscreen; clipboard-read; clipboard-write"
                  allowFullScreen
                />
              </div>
            )}
          </div>
          <p className="text-muted-foreground px-4 pt-2 text-xs sm:px-0">
            {m['cad.online.loading_note']()} {m['cad.online.license']()}
          </p>
        </div>
      </div>

      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:py-20">
        <div>
          <h2 className="font-display text-2xl font-semibold">
            {m['cad.online.tips_title']()}
          </h2>
          <div className="mt-6 space-y-4">
            {tips.map(([code, label]) => (
              <div key={code}>
                <p className="mb-1.5 text-sm font-semibold">{label}</p>
                <CodeBlock code={code} />
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-6">
          <div className="rounded-sm border p-6">
            <h3 className="font-display flex items-center gap-2 font-semibold">
              <Info className="size-4" />
              {m['cad.online.render_title']()}
            </h3>
            <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
              {m['cad.online.render_desc']()}
            </p>
            <ul className="mt-4 space-y-2 font-mono text-sm">
              <li className="flex flex-wrap items-baseline gap-x-3">
                <button
                  type="button"
                  className="text-signal-ink hover:underline"
                  onClick={() => setRenderer('?webgl')}
                >
                  /cadcraft-app/?webgl
                </button>
                <span className="text-muted-foreground font-sans">
                  {m['cad.online.render_webgl']()}
                </span>
              </li>
              <li className="flex flex-wrap items-baseline gap-x-3">
                <button
                  type="button"
                  className="text-signal-ink hover:underline"
                  onClick={() => setRenderer('?cpu')}
                >
                  /cadcraft-app/?cpu
                </button>
                <span className="text-muted-foreground font-sans">
                  {m['cad.online.render_cpu']()}
                </span>
              </li>
            </ul>
          </div>
          <div className="bg-sheet-grid border p-6">
            <h3 className="font-display flex items-center gap-2 font-semibold">
              <Lock className="size-4" />
              {m['cad.online.privacy_title']()}
            </h3>
            <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
              {m['cad.online.privacy']()}
            </p>
          </div>
        </div>
      </section>

      <ProUpsellDialog open={upsellOpen} onOpenChange={setUpsellOpen} />
      {(files.pro || files.cloud.length > 0) && (
        <CloudDrawingsDialog
          open={cloudOpen}
          onOpenChange={setCloudOpen}
          drawings={files.cloud}
          onOpenDrawing={files.openCloud}
        />
      )}
    </>
  );
}
