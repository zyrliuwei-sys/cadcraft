import { useCallback, useEffect, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { useSession } from '@/core/auth/client';
import {
  attachEditor,
  fileExt,
  isEmptyDxf,
  type EditorBridge,
} from '@/lib/cad-editor';
import {
  listDrawings,
  putDrawing,
  setDrawingCloudId,
  type StoredDrawing,
} from '@/lib/drawing-store';
import {
  listCloudDrawings,
  uploadCloudDrawing,
  type CloudDrawing,
} from '@/lib/drawings-client';
import { track } from '@/lib/track';

// Snapshot at most this often, and only after the user has paused.
const AUTOSAVE_EVERY = 15_000;
const IDLE_BEFORE_SAVE = 3_000;
const READY_WAIT = 30_000;

/**
 * Where an editor file saves to: its row in this browser and, for Pro, its
 * cloud drawing. Tracked per page load by file name, because the editor
 * names every new drawing "Drawing1.dxf": a new session's Drawing1 gets new
 * slots instead of overwriting the old one. Restoring or opening a stored
 * drawing re-links its slots.
 */
interface Slot {
  localId: string;
  cloudId?: string;
}

export const CLOUD_QUERY_KEY = ['cloud-drawings'];

/**
 * Wires the online editor iframe: logs opened/saved file types (extension
 * and size only), auto-saves the active drawing into this browser — and,
 * for Pro, into cloud drawings — and opens files in the editor on request.
 */
export function useEditorFiles({ onDwg }: { onDwg: () => void }) {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const signedIn = !!session?.user;
  const bridge = useRef<EditorBridge | null>(null);
  const dirty = useRef(false);
  const lastInput = useRef(0);
  const trackedAutosave = useRef(false);
  const slots = useRef(new Map<string, Slot>());
  const [recent, setRecent] = useState<StoredDrawing[]>([]);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [cloudSavedAt, setCloudSavedAt] = useState<number | null>(null);
  const [cloudSaving, setCloudSaving] = useState(false);
  const [cloudFailed, setCloudFailed] = useState(false);

  const cloudQuery = useQuery({
    queryKey: CLOUD_QUERY_KEY,
    queryFn: listCloudDrawings,
    enabled: signedIn,
    staleTime: 60_000,
  });
  const pro = !!cloudQuery.data?.pro;
  const proRef = useRef(pro);
  proRef.current = pro;

  useEffect(() => {
    listDrawings().then(setRecent);
  }, []);

  const slot = useCallback((name: string) => {
    let s = slots.current.get(name);
    if (!s) slots.current.set(name, (s = { localId: crypto.randomUUID() }));
    return s;
  }, []);

  const uploadToCloud = useCallback(
    async (file: File, checkpoint: boolean) => {
      const s = slot(file.name);
      setCloudSaving(true);
      try {
        const upload = (id?: string) =>
          uploadCloudDrawing(file, { id, checkpoint });
        // The linked drawing may have been deleted in another tab.
        const saved = await upload(s.cloudId).catch((e) => {
          if (s.cloudId && /not found/i.test(e.message)) return upload();
          throw e;
        });
        if (s.cloudId !== saved.id) {
          s.cloudId = saved.id;
          void setDrawingCloudId(s.localId, saved.id);
        }
        setCloudSavedAt(Date.now());
        setCloudFailed(false);
        queryClient.setQueryData(
          CLOUD_QUERY_KEY,
          (old: { pro: boolean; items: CloudDrawing[] } | undefined) =>
            old && {
              ...old,
              items: [
                {
                  ...saved,
                  createdAt: String(saved.createdAt),
                  updatedAt: new Date().toISOString(),
                },
                ...old.items.filter((d) => d.id !== saved.id),
              ],
            }
        );
        return true;
      } catch (e) {
        console.error('[cloud] sync failed', e);
        setCloudFailed(true);
        return false;
      } finally {
        setCloudSaving(false);
      }
    },
    [queryClient, slot]
  );

  const store = useCallback(
    async (file: File, checkpoint = false) => {
      if (fileExt(file.name) !== 'dxf' || (await isEmptyDxf(file))) return;
      const s = slot(file.name);
      const rows = await putDrawing({
        id: s.localId,
        file,
        cloudId: s.cloudId,
      });
      if (rows.length) {
        setRecent(rows);
        setSavedAt(Date.now());
      }
      if (!trackedAutosave.current) {
        trackedAutosave.current = true;
        track('online_autosave');
      }
      // Failed sync: stay dirty so the next tick retries.
      if (proRef.current && !(await uploadToCloud(file, checkpoint)))
        dirty.current = true;
    },
    [slot, uploadToCloud]
  );

  const autosave = useCallback(async () => {
    const b = bridge.current;
    if (!b || !dirty.current) return;
    dirty.current = false;
    const file = await b.snapshot();
    if (file) await store(file);
  }, [store]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (Date.now() - lastInput.current >= IDLE_BEFORE_SAVE) void autosave();
    }, AUTOSAVE_EVERY);
    const onHide = () => {
      if (document.visibilityState === 'hidden') void autosave();
    };
    document.addEventListener('visibilitychange', onHide);
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', onHide);
    };
  }, [autosave]);

  const onFrameLoad = useCallback(
    (frame: HTMLIFrameElement) => {
      bridge.current = attachEditor(frame, {
        onUserOpen: (file) => {
          const ext = fileExt(file.name);
          track('online_file_open', {
            ext,
            size_kb: Math.round(file.size / 1024),
          });
          if (ext === 'dwg') onDwg();
        },
        onUserSave: (file) => {
          track('online_file_save', { ext: fileExt(file.name) });
          // An explicit save starts a new cloud version.
          void store(file, true);
        },
        onInput: () => {
          dirty.current = true;
          lastInput.current = Date.now();
        },
      });
    },
    [onDwg, store]
  );

  /** Open a file in a new editor tab, waiting for the editor to boot. */
  const openFile = useCallback(async (file: File) => {
    for (let waited = 0; waited < READY_WAIT; waited += 500) {
      const b = bridge.current;
      if (b?.ready()) return b.open(file);
      await new Promise((r) => setTimeout(r, 500));
    }
    return false;
  }, []);

  const restore = useCallback(
    (drawing: StoredDrawing) => {
      track('online_restore');
      slots.current.set(drawing.name, {
        localId: drawing.id,
        cloudId: drawing.cloudId,
      });
      return openFile(new File([drawing.data], drawing.name));
    },
    [openFile]
  );

  /** Open a cloud drawing; later saves of that name go back into it. */
  const openCloud = useCallback(
    (drawing: CloudDrawing, file: File) => {
      slots.current.set(file.name, {
        localId: crypto.randomUUID(),
        cloudId: drawing.id,
      });
      return openFile(file);
    },
    [openFile]
  );

  /** Save the active drawing to the cloud now, as a new version. */
  const saveToCloud = useCallback(async () => {
    track('cloud_save_click', { pro: proRef.current ? 1 : 0 });
    const file = await bridge.current?.snapshot();
    if (!file || (await isEmptyDxf(file))) return false;
    const s = slot(file.name);
    const rows = await putDrawing({ id: s.localId, file, cloudId: s.cloudId });
    if (rows.length) setRecent(rows);
    return uploadToCloud(file, true);
  }, [slot, uploadToCloud]);

  return {
    onFrameLoad,
    recent,
    savedAt,
    restore,
    openFile,
    openCloud,
    saveToCloud,
    signedIn,
    pro,
    cloud: cloudQuery.data?.items ?? [],
    cloudSavedAt,
    cloudSaving,
    cloudFailed,
  };
}
