import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Check,
  Copy,
  FileText,
  FolderOpen,
  History,
  Link2,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';

import {
  deleteCloudDrawing,
  downloadCloudDrawing,
  listCloudVersions,
  shareCloudDrawing,
  shareUrl,
  type CloudDrawing,
} from '@/lib/drawings-client';
import { track } from '@/lib/track';
import { cn } from '@/lib/utils';
import { m } from '@/paraglide/messages.js';
import { getLocale } from '@/paraglide/runtime.js';
import { CLOUD_QUERY_KEY } from '@/hooks/use-editor-files';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const when = (iso: string) =>
  new Date(iso).toLocaleString(getLocale(), {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

const kb = (bytes: number) =>
  bytes < 1024 * 1024
    ? `${Math.max(1, Math.round(bytes / 1024))} KB`
    : `${(bytes / 1024 / 1024).toFixed(1)} MB`;

const iconButton =
  'text-muted-foreground hover:text-foreground hover:bg-muted flex size-8 items-center justify-center transition-colors disabled:opacity-40';

/** Pro: the user's cloud drawings — open, version history, share, delete. */
export function CloudDrawingsDialog({
  open,
  onOpenChange,
  drawings,
  onOpenDrawing,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  drawings: CloudDrawing[];
  onOpenDrawing: (drawing: CloudDrawing, file: File) => Promise<boolean>;
}) {
  const [historyId, setHistoryId] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  async function openIt(drawing: CloudDrawing, version?: string) {
    setBusy(version ?? drawing.id);
    try {
      const file = await downloadCloudDrawing(drawing.id, version);
      track('cloud_open', { version: version ? 1 : 0 });
      onOpenChange(false);
      await onOpenDrawing(drawing, file);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setBusy(null);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{m['cad.cloud.title']()}</DialogTitle>
          <DialogDescription>{m['cad.cloud.desc']()}</DialogDescription>
        </DialogHeader>

        {drawings.length === 0 ? (
          <p className="text-muted-foreground border p-6 text-center text-sm">
            {m['cad.cloud.empty']()}
          </p>
        ) : (
          <ul className="divide-y border">
            {drawings.map((d) => (
              <li key={d.id} className="p-3">
                <div className="flex items-center gap-3">
                  <FileText className="text-muted-foreground size-4 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{d.name}</p>
                    <p className="text-muted-foreground text-xs">
                      {when(d.updatedAt)} · {kb(d.size)}
                    </p>
                  </div>
                  <button
                    type="button"
                    className={iconButton}
                    title={m['cad.cloud.open']()}
                    disabled={busy !== null}
                    onClick={() => openIt(d)}
                  >
                    <FolderOpen className="size-4" />
                  </button>
                  <button
                    type="button"
                    className={cn(
                      iconButton,
                      historyId === d.id && 'text-foreground bg-muted'
                    )}
                    title={m['cad.cloud.history']()}
                    onClick={() =>
                      setHistoryId(historyId === d.id ? null : d.id)
                    }
                  >
                    <History className="size-4" />
                  </button>
                  <ShareButton drawing={d} />
                  <DeleteButton drawing={d} />
                </div>
                {historyId === d.id && (
                  <Versions
                    drawing={d}
                    busy={busy}
                    onOpen={(version) => openIt(d, version)}
                  />
                )}
              </li>
            ))}
          </ul>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Versions({
  drawing,
  busy,
  onOpen,
}: {
  drawing: CloudDrawing;
  busy: string | null;
  onOpen: (version: string) => void;
}) {
  const query = useQuery({
    queryKey: ['cloud-versions', drawing.id, drawing.updatedAt],
    queryFn: () => listCloudVersions(drawing.id),
  });
  if (query.isPending)
    return <p className="text-muted-foreground mt-2 pl-7 text-xs">…</p>;
  return (
    <ul className="mt-2 space-y-1 pl-7">
      {query.data?.versions.map((v) => (
        <li key={v.id} className="flex items-center gap-2 text-xs">
          <span className="flex-1">
            {when(v.createdAt)}
            {v.id === query.data.currentVersionId && (
              <span className="text-muted-foreground">
                {' '}
                · {m['cad.cloud.current']()}
              </span>
            )}
          </span>
          <span className="text-muted-foreground">{kb(v.size)}</span>
          <button
            type="button"
            className="hover:bg-muted border px-2 py-0.5 disabled:opacity-40"
            disabled={busy !== null}
            onClick={() => onOpen(v.id)}
          >
            {m['cad.cloud.open']()}
          </button>
        </li>
      ))}
    </ul>
  );
}

function ShareButton({ drawing }: { drawing: CloudDrawing }) {
  const queryClient = useQueryClient();
  const [copied, setCopied] = useState(false);
  const mutation = useMutation({
    mutationFn: (share: boolean) => shareCloudDrawing(drawing.id, share),
    onSuccess: async ({ shareToken }) => {
      queryClient.invalidateQueries({ queryKey: CLOUD_QUERY_KEY });
      if (!shareToken) {
        toast.success(m['cad.cloud.share_off']());
        return;
      }
      track('cloud_share');
      try {
        await navigator.clipboard.writeText(shareUrl(shareToken));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast.success(m['cad.cloud.share_copied']());
      } catch {
        toast.message(shareUrl(shareToken));
      }
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const shared = !!drawing.shareToken;
  return (
    <>
      <button
        type="button"
        className={cn(iconButton, shared && 'text-foreground')}
        title={m['cad.cloud.share']()}
        disabled={mutation.isPending}
        onClick={() => mutation.mutate(true)}
      >
        {copied ? (
          <Check className="size-4" />
        ) : shared ? (
          <Copy className="size-4" />
        ) : (
          <Link2 className="size-4" />
        )}
      </button>
      {shared && (
        <button
          type="button"
          className="text-muted-foreground hover:text-foreground text-[11px] underline-offset-2 hover:underline"
          disabled={mutation.isPending}
          onClick={() => mutation.mutate(false)}
        >
          {m['cad.cloud.unshare']()}
        </button>
      )}
    </>
  );
}

function DeleteButton({ drawing }: { drawing: CloudDrawing }) {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: () => deleteCloudDrawing(drawing.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CLOUD_QUERY_KEY });
      toast.success(m['cad.cloud.deleted']());
    },
    onError: (e: Error) => toast.error(e.message),
  });
  return (
    <button
      type="button"
      className={cn(iconButton, 'hover:text-destructive')}
      title={m['cad.cloud.delete']()}
      disabled={mutation.isPending}
      onClick={() => {
        if (
          window.confirm(m['cad.cloud.delete_confirm']({ name: drawing.name }))
        )
          mutation.mutate();
      }}
    >
      <Trash2 className="size-4" />
    </button>
  );
}
