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
import {
  convertDwg,
  DrawingImportError,
  MAX_DXF_BYTES,
  type ImportErrorCode,
} from '@/lib/dwg-import';
import { dxfGeometry } from '@/lib/dxf-activity';
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

/** Outcome of an explicit "Save to cloud". */
export type CloudSaveResult =
  | { ok: true }
  | { ok: false; reason: 'not_ready' }
  | { ok: false; reason: 'empty' }
  | { ok: false; reason: 'error'; message: string };

/**
 * Wires the online editor iframe: logs opened/saved file types (extension
 * and size only), auto-saves the active drawing into this browser — and,
 * for Pro, into cloud drawings — and opens files in the editor on request.
 */
export function useEditorFiles() {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const signedIn = !!session?.user;
  const bridge = useRef<EditorBridge | null>(null);
  const dirty = useRef(false);
  const lastInput = useRef(0);
  const trackedAutosave = useRef(false);
  const trackedFirstDrawing = useRef(false);
  const geometryByName = useRef(new Map<string, string>());
  const slots = useRef(new Map<string, Slot>());
  const [recent, setRecent] = useState<StoredDrawing[]>([]);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [cloudSavedAt, setCloudSavedAt] = useState<number | null>(null);
  const [cloudSaving, setCloudSaving] = useState(false);
  const [cloudFailed, setCloudFailed] = useState(false);
  const [importPhase, setImportPhase] = useState<
    'loading' | 'converting' | 'opening' | null
  >(null);
  const [importError, setImportError] = useState<ImportErrorCode | null>(null);
  const [importedDwg, setImportedDwg] = useState<string | null>(null);
  const importController = useRef<AbortController | null>(null);
  const readyTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(
    () => () => {
      importController.current?.abort();
      bridge.current?.dispose();
      if (readyTimer.current) clearInterval(readyTimer.current);
    },
    []
  );

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

  /** Upload to the cloud; resolves to the error message, or null on success. */
  const uploadToCloud = useCallback(
    async (
      file: File,
      checkpoint: boolean,
      mode: 'manual' | 'autosave' | 'editor_save' = 'autosave'
    ): Promise<string | null> => {
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
        track('cloud_save_success', { mode, checkpoint: checkpoint ? 1 : 0 });
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
        return null;
      } catch (e) {
        track('cloud_save_failed', { mode, stage: 'upload' });
        console.error('[cloud] sync failed', e);
        setCloudFailed(true);
        return (e instanceof Error && e.message) || 'Unknown error';
      } finally {
        setCloudSaving(false);
      }
    },
    [queryClient, slot]
  );

  const store = useCallback(
    async (file: File, checkpoint = false) => {
      if (fileExt(file.name) !== 'dxf') return;
      const geometry = dxfGeometry(await file.text());
      if (!geometry) return;
      if (
        !trackedFirstDrawing.current &&
        lastInput.current > 0 &&
        geometryByName.current.get(file.name) !== geometry
      ) {
        trackedFirstDrawing.current = true;
        track('online_first_drawing');
      }
      geometryByName.current.set(file.name, geometry);
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
      if (
        proRef.current &&
        (await uploadToCloud(
          file,
          checkpoint,
          checkpoint ? 'editor_save' : 'autosave'
        )) !== null
      )
        dirty.current = true;
    },
    [slot, uploadToCloud]
  );

  const autosave = useCallback(async () => {
    const b = bridge.current;
    if (!b || !dirty.current || importController.current) return;
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

  /** Convert locally, open, and confirm through an export from the editor. */
  const openFile = useCallback(
    async (file: File) => {
      if (importController.current) {
        setImportError('busy');
        return false;
      }
      const ext = fileExt(file.name);
      track('online_file_open', { ext, size_kb: Math.round(file.size / 1024) });
      const controller = new AbortController();
      importController.current = controller;
      setImportError(null);
      setImportedDwg(null);
      setImportPhase(ext === 'dwg' ? 'loading' : 'opening');
      const started = Date.now();
      try {
        if (ext !== 'dwg' && ext !== 'dxf')
          throw new DrawingImportError('invalid');
        if (ext === 'dxf' && file.size > MAX_DXF_BYTES)
          throw new DrawingImportError('too_large');
        const drawing =
          ext === 'dwg'
            ? await convertDwg(file, controller.signal, () =>
                setImportPhase('converting')
              )
            : file;
        setImportPhase('opening');
        let b: EditorBridge | null = null;
        for (let waited = 0; waited < READY_WAIT; waited += 250) {
          if (controller.signal.aborted)
            throw new DrawingImportError('cancelled');
          b = bridge.current;
          if (b?.ready()) break;
          await new Promise((r) => setTimeout(r, 250));
        }
        if (!b?.ready()) throw new DrawingImportError('not_ready');
        const confirmed = b.open(drawing)
          ? await b.confirmOpen(drawing.name, controller.signal)
          : null;
        if (!confirmed) {
          throw new DrawingImportError(
            controller.signal.aborted ? 'cancelled' : 'open_failed'
          );
        }
        if (controller.signal.aborted)
          throw new DrawingImportError('cancelled');
        // Keep the editor's decoded DXF in the existing recent-drawings store.
        geometryByName.current.set(
          confirmed.name,
          dxfGeometry(await confirmed.text())
        );
        void store(confirmed).catch(() => {});
        track('online_import_success', {
          ext,
          duration_ms: Date.now() - started,
        });
        if (ext === 'dwg') setImportedDwg(drawing.name);
        return true;
      } catch (error) {
        const code =
          error instanceof DrawingImportError ? error.code : 'conversion';
        setImportError(code);
        track('online_import_failed', { ext, reason: code });
        return false;
      } finally {
        importController.current = null;
        setImportPhase(null);
      }
    },
    [store]
  );

  const onFrameLoad = useCallback(
    (frame: HTMLIFrameElement) => {
      if (bridge.current) importController.current?.abort();
      bridge.current?.dispose();
      if (readyTimer.current) clearInterval(readyTimer.current);
      bridge.current = attachEditor(frame, {
        onUserOpen: (file) => {
          void openFile(file);
          return true;
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
      const started = Date.now();
      const checkReady = () => {
        if (bridge.current?.ready()) {
          track('online_editor_ready', { duration_ms: Date.now() - started });
        } else if (Date.now() - started < READY_WAIT) return;
        else track('online_editor_failed', { reason: 'timeout' });
        if (readyTimer.current) clearInterval(readyTimer.current);
        readyTimer.current = null;
      };
      readyTimer.current = setInterval(checkReady, 250);
      checkReady();
    },
    [openFile, store]
  );

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
  const saveToCloud = useCallback(async (): Promise<CloudSaveResult> => {
    track('cloud_save_click', { pro: proRef.current ? 1 : 0 });
    try {
      // null: editor still booting, or an auto-save snapshot is in flight.
      const file = await bridge.current?.snapshot();
      if (!file) {
        track('cloud_save_failed', {
          mode: 'manual',
          stage: 'snapshot',
          reason: 'not_ready',
        });
        return { ok: false, reason: 'not_ready' };
      }
      if (await isEmptyDxf(file)) {
        track('cloud_save_failed', {
          mode: 'manual',
          stage: 'snapshot',
          reason: 'empty',
        });
        return { ok: false, reason: 'empty' };
      }
      const s = slot(file.name);
      const rows = await putDrawing({
        id: s.localId,
        file,
        cloudId: s.cloudId,
      });
      if (rows.length) setRecent(rows);
      const message = await uploadToCloud(file, true, 'manual');
      return message === null
        ? { ok: true }
        : { ok: false, reason: 'error', message };
    } catch (error) {
      track('cloud_save_failed', { mode: 'manual', stage: 'local' });
      setCloudFailed(true);
      return {
        ok: false,
        reason: 'error',
        message: error instanceof Error ? error.message : 'Save failed',
      };
    }
  }, [slot, uploadToCloud]);

  return {
    importPhase,
    importError,
    importedDwg,
    cancelImport: () => importController.current?.abort(),
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
