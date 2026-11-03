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
  /** Return true to handle the import outside the editor (e.g. DWG conversion). */
  onUserOpen?: (file: File) => boolean | void;
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
  /** Confirm the editor can export the imported drawing under its new name. */
  confirmOpen: (name: string, signal: AbortSignal) => Promise<File | null>;
  dispose: () => void;
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
      // The editor ignores keys while it's unfocused (e.g. right after a
      // click on our "Save to cloud" button): focus it for the keystroke,
      // then hand focus back so auto-save never steals it.
      const host = frame.ownerDocument;
      const prev = host.activeElement as HTMLElement | null;
      const refocus =
        prev && prev !== frame && prev !== host.body ? prev : null;
      canvas.focus({ preventScroll: true });
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
      refocus?.focus({ preventScroll: true });
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

    const onChange = (e: Event) => {
      const el = e.target as HTMLInputElement | null;
      if (el?.type !== 'file' || el.dataset.ccRestore) return;
      const file = el.files?.[0];
      if (file && handlers.onUserOpen?.(file)) {
        e.preventDefault();
        e.stopImmediatePropagation();
      }
    };
    // Intercept before the Rust listener reads DWG bytes as unsupported input.
    doc.addEventListener('change', onChange, true);
    const onDrop = (e: DragEvent) => {
      const files = Array.from(e.dataTransfer?.files ?? []);
      if (!files.length || !handlers.onUserOpen) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      for (const file of files) handlers.onUserOpen(file);
    };
    doc.addEventListener('drop', onDrop, true);
    const onInput = (e: Event) => {
      if (e.isTrusted) handlers.onInput?.();
    };
    // Capture phase: the editor stops propagation of its canvas input.
    for (const type of ['keydown', 'pointerup']) {
      doc.addEventListener(type, onInput, true);
    }

    const ready = () =>
      !doc.getElementById('cadcraft_loading') &&
      !!doc.getElementById('cadcraft_canvas');

    const bridge: EditorBridge = {
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
      confirmOpen: async (name, signal) => {
        // A file-picker event alone isn't success. Wait for the active drawing
        // to export under the imported name, proving the editor decoded it.
        const deadline = Date.now() + 10_000;
        while (!signal.aborted && Date.now() < deadline) {
          await new Promise((r) => setTimeout(r, 250));
          if (signal.aborted) return null;
          const file = await bridge.snapshot();
          if (file?.name === name) return file;
        }
        return null;
      },
      dispose: () => {
        if (anchor.click !== anchorClick) anchor.click = anchorClick;
        if (input.click !== inputClick) input.click = inputClick;
        doc.removeEventListener('change', onChange, true);
        doc.removeEventListener('drop', onDrop, true);
        for (const type of ['keydown', 'pointerup'])
          doc.removeEventListener(type, onInput, true);
        pendingSave?.(null);
        pendingSave = null;
        pendingOpen = null;
      },
    };
    return bridge;
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
