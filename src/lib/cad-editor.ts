/**
 * Same-origin bridge into the hosted CADCraft web build (public/cadcraft-app).
 *
 * The build exposes no JS API, so we drive it the way a user would: Ctrl+S
 * makes it click a temporary `<a download>` holding a blob (we read the blob),
 * Ctrl+O makes it click a hidden file input (we fill it). Saving mid-command
 * doesn't interrupt the command. If upstream changes its DOM, everything here
 * quietly stops working and the editor itself is untouched.
 */

type EditorWindow = Window & typeof globalThis;

export interface EditorHandlers {
  /** The user picked a file with the editor's Open dialog. */
  onUserOpen?: (file: File) => void;
  /** The user saved or exported (the download still happens). */
  onUserSave?: (file: File) => void;
  /** Real keyboard or pointer input inside the editor. */
  onInput?: () => void;
}

export interface EditorBridge {
  ready: () => boolean;
  /** Snapshot of the active drawing as DXF, without downloading anything. */
  snapshot: () => Promise<File | null>;
  /** Open a file in a new editor tab. */
  open: (file: File) => boolean;
}

const SAVE_TIMEOUT = 3000;

export function attachEditor(
  frame: HTMLIFrameElement,
  handlers: EditorHandlers
): EditorBridge | null {
  try {
    const win = frame.contentWindow as EditorWindow | null;
    const doc = frame.contentDocument;
    if (!win || !doc) return null;

    let pendingSave: ((file: File | null) => void) | null = null;
    let pendingOpen: File | null = null;

    const press = (key: string, keyCode: number) => {
      const canvas = doc.getElementById('cadcraft_canvas');
      if (!canvas) return false;
      for (const type of ['keydown', 'keyup']) {
        canvas.dispatchEvent(
          new win.KeyboardEvent(type, {
            key,
            code: `Key${key.toUpperCase()}`,
            keyCode,
            ctrlKey: true,
            bubbles: true,
            cancelable: true,
          })
        );
      }
      return true;
    };

    const anchor = win.HTMLAnchorElement.prototype;
    const anchorClick = anchor.click;
    anchor.click = function (this: HTMLAnchorElement) {
      if (this.download && this.href.startsWith('blob:')) {
        // Read the blob now: the editor may revoke the URL right after.
        const name = this.download;
        const file = fetch(this.href)
          .then((r) => r.blob())
          .then((b) => new File([b], name, { type: b.type }));
        if (pendingSave) {
          const resolve = pendingSave;
          pendingSave = null;
          file.then(resolve, () => resolve(null));
          return; // our snapshot: no download
        }
        file.then((f) => handlers.onUserSave?.(f)).catch(() => {});
      }
      return anchorClick.call(this);
    };

    const input = win.HTMLInputElement.prototype;
    const inputClick = input.click;
    input.click = function (this: HTMLInputElement) {
      if (pendingOpen && this.type === 'file') {
        const file = pendingOpen;
        pendingOpen = null;
        const dt = new win.DataTransfer();
        dt.items.add(new win.File([file], file.name, { type: file.type }));
        this.files = dt.files;
        this.dataset.ccRestore = '1';
        this.dispatchEvent(new win.Event('change', { bubbles: true }));
        delete this.dataset.ccRestore;
        return;
      }
      return inputClick.call(this);
    };

    doc.addEventListener('change', (e) => {
      const el = e.target as HTMLInputElement | null;
      if (el?.type !== 'file' || el.dataset.ccRestore) return;
      const file = el.files?.[0];
      if (file) handlers.onUserOpen?.(file);
    });
    // Capture phase: the editor stops propagation of its canvas input.
    for (const type of ['keydown', 'pointerup']) {
      doc.addEventListener(
        type,
        (e) => {
          if (e.isTrusted) handlers.onInput?.();
        },
        true
      );
    }

    const ready = () =>
      !doc.getElementById('cadcraft_loading') &&
      !!doc.getElementById('cadcraft_canvas');

    return {
      ready,
      snapshot: () =>
        new Promise((resolve) => {
          if (!ready() || pendingSave) return resolve(null);
          pendingSave = resolve;
          setTimeout(() => {
            if (pendingSave === resolve) {
              pendingSave = null;
              resolve(null);
            }
          }, SAVE_TIMEOUT);
          if (!press('s', 83)) {
            pendingSave = null;
            resolve(null);
          }
        }),
      open: (file) => {
        if (!ready()) return false;
        pendingOpen = file;
        const ok = press('o', 79);
        // Don't leave a stale file for the user's next Open click.
        setTimeout(() => {
          if (pendingOpen === file) pendingOpen = null;
        }, SAVE_TIMEOUT);
        return ok;
      },
    };
  } catch {
    return null;
  }
}

const KNOWN_EXTS = ['dxf', 'dwg', 'svg', 'png', 'pdf'];

export function fileExt(name: string) {
  const ext = name.split('.').pop()?.toLowerCase() ?? '';
  return KNOWN_EXTS.includes(ext) ? ext : 'other';
}

/** A DXF whose ENTITIES section is empty (a fresh, untouched drawing). */
export async function isEmptyDxf(file: File) {
  const text = await file.text();
  return /ENTITIES\r?\n\s*0\r?\nENDSEC/.test(text);
}
