/**
 * Recent drawings kept in this browser (IndexedDB) by the online editor's
 * auto-save, newest first, capped at FREE_DRAWING_LIMIT. Rows are keyed by
 * an id, not the file name: the editor names every new drawing
 * "Drawing1.dxf", and a new one must not overwrite yesterday's.
 * Every call fails soft: private windows and blocked storage just get [].
 */

export const FREE_DRAWING_LIMIT = 3;

export interface StoredDrawing {
  id: string;
  name: string;
  savedAt: number;
  size: number;
  data: Blob;
  /** The cloud drawing this one syncs into (Pro). */
  cloudId?: string;
}

const DB_NAME = 'cadcraft';
const DB_VERSION = 2;
const STORE = 'drawings';

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = req.result;
      if (e.oldVersion < 1) {
        db.createObjectStore(STORE, { keyPath: 'id' });
        return;
      }
      // v1 keyed rows by file name: re-key them by id.
      const old = req.transaction!.objectStore(STORE).getAll();
      old.onsuccess = () => {
        db.deleteObjectStore(STORE);
        const store = db.createObjectStore(STORE, { keyPath: 'id' });
        for (const row of old.result)
          store.put({ ...row, id: crypto.randomUUID() });
      };
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function run<T>(
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore) => IDBRequest<T>
): Promise<T> {
  return openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const tx = db.transaction(STORE, mode);
        const req = fn(tx.objectStore(STORE));
        tx.oncomplete = () => {
          db.close();
          resolve(req.result);
        };
        tx.onerror = () => {
          db.close();
          reject(tx.error);
        };
      })
  );
}

export async function listDrawings(): Promise<StoredDrawing[]> {
  try {
    const rows = await run('readonly', (s) => s.getAll());
    return (rows as StoredDrawing[]).sort((a, b) => b.savedAt - a.savedAt);
  } catch {
    return [];
  }
}

/** Save (or replace) one drawing; returns the recent list after pruning. */
export async function putDrawing(row: {
  id: string;
  file: File;
  cloudId?: string;
}): Promise<StoredDrawing[]> {
  try {
    const stored: StoredDrawing = {
      id: row.id,
      name: row.file.name,
      savedAt: Date.now(),
      size: row.file.size,
      data: row.file,
      cloudId: row.cloudId,
    };
    await run('readwrite', (s) => s.put(stored));
    const rows = await listDrawings();
    for (const old of rows.slice(FREE_DRAWING_LIMIT)) {
      await run('readwrite', (s) => s.delete(old.id));
    }
    return rows.slice(0, FREE_DRAWING_LIMIT);
  } catch {
    return [];
  }
}

/** Link a stored drawing to the cloud drawing it now syncs into. */
export async function setDrawingCloudId(id: string, cloudId: string) {
  try {
    const row = (await run('readonly', (s) => s.get(id))) as
      | StoredDrawing
      | undefined;
    if (row && row.cloudId !== cloudId)
      await run('readwrite', (s) => s.put({ ...row, cloudId }));
  } catch {}
}
