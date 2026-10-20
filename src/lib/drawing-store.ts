/**
 * Recent drawings kept in this browser (IndexedDB) by the online editor's
 * auto-save. Keyed by file name, newest first, capped at FREE_DRAWING_LIMIT.
 * Every call fails soft: private windows and blocked storage just get [].
 */

export const FREE_DRAWING_LIMIT = 3;

export interface StoredDrawing {
  name: string;
  savedAt: number;
  size: number;
  data: Blob;
}

const DB_NAME = 'cadcraft';
const STORE = 'drawings';

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () =>
      req.result.createObjectStore(STORE, { keyPath: 'name' });
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

export async function putDrawing(file: File): Promise<StoredDrawing[]> {
  try {
    const row: StoredDrawing = {
      name: file.name,
      savedAt: Date.now(),
      size: file.size,
      data: file,
    };
    await run('readwrite', (s) => s.put(row));
    const rows = await listDrawings();
    for (const old of rows.slice(FREE_DRAWING_LIMIT)) {
      await run('readwrite', (s) => s.delete(old.name));
    }
    return rows.slice(0, FREE_DRAWING_LIMIT);
  } catch {
    return [];
  }
}
