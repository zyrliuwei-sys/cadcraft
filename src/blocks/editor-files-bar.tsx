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

const barButton =
  'hover:border-foreground flex items-center gap-1.5 border px-2 py-1 font-medium transition-colors disabled:opacity-60';

/**
 * Strip above the online editor: auto-save status, recent drawings in this
 * browser, and cloud drawings (Pro) or the way to get them.
 */
export function EditorFilesBar({
  recent,
  savedAt,
  onRestore,
  pro,
  cloudSavedAt,
  cloudSaving,
  onSaveCloud,
  onShowCloud,
}: {
  recent: StoredDrawing[];
  savedAt: number | null;
  onRestore: (drawing: StoredDrawing) => Promise<boolean>;
  pro: boolean;
  cloudSavedAt: number | null;
  cloudSaving: boolean;
  /** Free users get the upsell from here too. */
  onSaveCloud: () => void;
  onShowCloud: () => void;
}) {
  const [opening, setOpening] = useState<string | null>(null);

  const open = async (d: StoredDrawing) => {
    setOpening(d.name);
    await onRestore(d);
    setOpening(null);
  };

  return (
    <div className="hidden flex-wrap items-center gap-x-4 gap-y-2 border-x border-t px-3 py-2 text-xs md:flex">
      {savedAt ? (
        <span className="text-muted-foreground flex items-center gap-1.5">
          <Check className="size-3.5" />
          {m['cad.online.files_saved']({ time: clock(savedAt) })}
        </span>
      ) : (
        !recent.length && (
          <span className="text-muted-foreground flex items-center gap-1.5">
            <Check className="size-3.5" />
            {m['cad.online.files_autosave_on']()}
          </span>
        )
      )}

      {recent.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-muted-foreground flex items-center gap-1.5">
            <History className="size-3.5" />
            {m['cad.online.files_recent']()}
          </span>
          {recent.map((d) => (
            <button
              key={d.name}
              type="button"
              onClick={() => open(d)}
              disabled={opening !== null}
              title={m['cad.online.files_open']()}
              className={cn(
                'hover:border-foreground flex items-center gap-1.5 border px-2 py-1 transition-colors disabled:opacity-60',
                opening === d.name && 'animate-pulse'
              )}
            >
              <FileText className="size-3.5" />
              <span className="max-w-40 truncate font-medium">{d.name}</span>
              <span className="text-muted-foreground">{ago(d.savedAt)}</span>
            </button>
          ))}
        </div>
      )}

      <div className="ml-auto flex items-center gap-2">
        {pro && (cloudSaving || cloudSavedAt) && (
          <span className="text-muted-foreground flex items-center gap-1.5">
            <Cloud className="size-3.5" />
            {cloudSaving
              ? m['cad.cloud.syncing']()
              : m['cad.cloud.synced']({ time: clock(cloudSavedAt!) })}
          </span>
        )}
        <button
          type="button"
          onClick={onSaveCloud}
          disabled={cloudSaving}
          className={barButton}
        >
          <CloudUpload className="size-3.5" />
          {m['cad.cloud.save']()}
          {!pro && (
            <span className="bg-primary text-primary-foreground px-1.5 py-0.5 text-[10px] font-semibold">
              PRO
            </span>
          )}
        </button>
        {pro && (
          <button type="button" onClick={onShowCloud} className={barButton}>
            <FolderOpen className="size-3.5" />
            {m['cad.cloud.title']()}
          </button>
        )}
      </div>
    </div>
  );
}
