import { useState } from 'react';
import {
  Check,
  Cloud,
  CloudUpload,
  FileText,
  FolderOpen,
  History,
} from 'lucide-react';

import type { StoredDrawing } from '@/lib/drawing-store';
import { cn } from '@/lib/utils';
import { m } from '@/paraglide/messages.js';
import { getLocale } from '@/paraglide/runtime.js';

function ago(t: number) {
  const rtf = new Intl.RelativeTimeFormat(getLocale(), { numeric: 'auto' });
  const s = Math.round((t - Date.now()) / 1000);
  if (s > -60) return rtf.format(0, 'second');
  if (s > -3600) return rtf.format(Math.round(s / 60), 'minute');
  if (s > -86400) return rtf.format(Math.round(s / 3600), 'hour');
  return rtf.format(Math.round(s / 86400), 'day');
}

const clock = (t: number) =>
  new Date(t).toLocaleTimeString(getLocale(), {
    hour: '2-digit',
    minute: '2-digit',
  });

const chip =
  'hover:border-foreground bg-background flex h-9 items-center gap-2 border px-3 transition-colors disabled:opacity-60';

/**
 * Strip above the online editor: auto-save status, recent drawings in this
 * browser, and where the drawing lives (this browser, or synced to cloud).
 */
export function EditorFilesBar({
  recent,
  savedAt,
  onRestore,
  pro,
  cloudSavedAt,
  cloudSaving,
}: {
  recent: StoredDrawing[];
  savedAt: number | null;
  onRestore: (drawing: StoredDrawing) => Promise<boolean>;
  pro: boolean;
  cloudSavedAt: number | null;
  cloudSaving: boolean;
}) {
  const [opening, setOpening] = useState<string | null>(null);

  const open = async (d: StoredDrawing) => {
    setOpening(d.name);
    await onRestore(d);
    setOpening(null);
  };

  return (
    <div className="bg-muted/50 hidden flex-wrap items-center gap-x-5 gap-y-2 border-x border-t px-4 py-2.5 text-sm md:flex">
      {savedAt ? (
        <span className="text-muted-foreground flex items-center gap-1.5">
          <Check className="size-4" />
          {m['cad.online.files_saved']({ time: clock(savedAt) })}
        </span>
      ) : (
        !recent.length && (
          <span className="text-muted-foreground flex items-center gap-1.5">
            <Check className="size-4" />
            {m['cad.online.files_autosave_on']()}
          </span>
        )
      )}

      {recent.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-muted-foreground flex items-center gap-1.5">
            <History className="size-4" />
            {m['cad.online.files_recent']()}
          </span>
          {recent.map((d) => (
            <button
              key={d.name}
              type="button"
              onClick={() => open(d)}
              disabled={opening !== null}
              title={m['cad.online.files_open']()}
              className={cn(chip, opening === d.name && 'animate-pulse')}
            >
              <FileText className="size-4" />
              <span className="max-w-40 truncate font-medium">{d.name}</span>
              <span className="text-muted-foreground">{ago(d.savedAt)}</span>
            </button>
          ))}
        </div>
      )}

      <div className="ml-auto flex items-center gap-2">
        {pro && (cloudSaving || cloudSavedAt) && (
          <span className="text-muted-foreground flex items-center gap-1.5">
            <Cloud className="size-4" />
            {cloudSaving
              ? m['cad.cloud.syncing']()
              : m['cad.cloud.synced']({ time: clock(cloudSavedAt!) })}
          </span>
        )}
        {!pro && (
          <span className="text-muted-foreground">
            {m['cad.cloud.local_hint']()}
          </span>
        )}
      </div>
    </div>
  );
}

/**
 * Cloud buttons beside the editor controls: Save to cloud (the upsell for
 * free users) and, once there are cloud drawings, the list.
 */
export function CloudActions({
  pro,
  hasCloud,
  saving,
  onSave,
  onShowList,
}: {
  pro: boolean;
  /** Has cloud drawings (still listed after Pro ends). */
  hasCloud: boolean;
  saving: boolean;
  onSave: () => void;
  onShowList: () => void;
}) {
  return (
    <>
      {(pro || hasCloud) && (
        <button
          type="button"
          onClick={onShowList}
          className="hover:border-foreground hidden h-9 items-center gap-2 border px-3 text-sm font-semibold transition-colors md:inline-flex"
        >
          <FolderOpen className="size-4" />
          {m['cad.cloud.title']()}
        </button>
      )}
      <button
        type="button"
        onClick={onSave}
        disabled={saving}
        className="bg-primary text-primary-foreground hover:bg-primary/85 hidden h-9 items-center gap-2 px-4 text-sm font-semibold transition-colors active:translate-y-px disabled:opacity-60 md:inline-flex"
      >
        <CloudUpload className="size-4" />
        {m['cad.cloud.save']()}
        {!pro && (
          <span className="bg-signal px-1.5 py-0.5 text-[11px] leading-none font-bold text-white">
            PRO
          </span>
        )}
      </button>
    </>
  );
}
