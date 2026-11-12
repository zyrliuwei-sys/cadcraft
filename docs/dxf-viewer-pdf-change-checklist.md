# DXF viewer and DWG-to-PDF tool checklist

All changes are made on the existing `main` branch. This patch adds two English
tools, not blog articles. Publishing is a separate step.

## New pages

| Page          | Title / H1                                                      | Behavior                                                                                                                                                                                                                                                                                          |
| ------------- | --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/dxf-viewer` | **DXF Viewer — Free, Online & No Sign-In** / **DXF viewer**     | First-screen file picker/drop zone; a read-only 2D model-space preview renders here, with pan, zoom and fit. ASCII R12–2018; binary R13–2018. Binary R12 is explicitly rejected. DXF input uses the editor's existing 64 MB limit.                                                                |
| `/dwg-to-pdf` | **DWG to PDF — Free Browser Converter (Beta)** / **DWG to PDF** | Choose DWG/DXF, wait for conversion, then download the PDF here. DWG uses the existing beta 20 MB local importer; DXF uses the existing 64 MB limit. Single-file, model-space extents on one PDF page. The body and related section link to the desktop workflow and the existing deep PDF guide. |

Each has exactly one H1 and separate WebApplication and FAQPage scripts in SSR
HTML and the hydrated DOM. The viewer has four FAQs; the PDF converter has three.
Both URLs are added to the sitemap. No navigation or other crawl rules change.

## The seven requested internal-link placements

| Request | Source page / location                                   | Change                                                                                                                                                                                                 |
| ------- | -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1       | `/blog/dwg-to-pdf` → Related                             | First bullet: **Convert DWG to PDF in your browser — free, no install** → `/dwg-to-pdf`.                                                                                                               |
| 2       | Same blog → **Can I convert DWG to PDF in the browser?** | Answer begins with the converter link, followed by beta and 20 MB limits. Other FAQ answers are unchanged.                                                                                             |
| 3       | `/blog/how-to-open-dxf-file` → Step 2                    | Add **Just want to look at it? Open it in the free DXF viewer.** immediately above the five-way comparison table, with a link to `/dxf-viewer`.                                                        |
| 4       | Same blog → Related                                      | Add **DXF viewer** → `/dxf-viewer`.                                                                                                                                                                    |
| 5       | `/blog/dwg-to-dxf` and `/blog/dxf-vs-dwg` → Related      | Each adds one **DXF viewer** link to `/dxf-viewer`.                                                                                                                                                    |
| 6       | `/online` → Body                                         | Replace the previous viewer sentence with **Only need to look at it? Open the DXF viewer / DWG viewer.** Both names are real links. This retains the previous DWG viewer entry without duplicating it. |
| 7       | `/download` → Body                                       | Add **Need a PDF instead? Convert DWG to PDF in the browser.** → `/dwg-to-pdf`. Existing DWG viewer guidance stays.                                                                                    |

These seven groups contain nine clickable anchors across six existing pages;
one anchor is the retained `/online` → `/dwg-viewer` link.

## Implementation and limits

- `src/lib/cad-tool-engine.ts` runs a fresh, noninteractive instance of the exact
  `/online` WASM application and reuses its existing file bridge, DXF reader and
  plotter. DWG conversion calls the existing `convertDwg`; no new converter or
  PDF-writing library is introduced.
- The DXF viewer displays the engine's SVG output as an image. It does not embed
  editable UI or insert drawing-controlled SVG as inline HTML. Binary files are
  decoded by CADCraft, not misinterpreted by an ASCII-only parser.
- PDF output is captured as a local Blob, checked for a PDF header and EOF marker,
  and exposed through a download link. The file does not auto-download or navigate.
- Filenames stay out of the fixed export command. Input/output sizes are bounded;
  cancellation, failure and normal completion dispose of the processor frame.
  Replaced/unmounted results revoke their Blob URLs. No cloud/autosave hooks are
  mounted by either tool.
- Font fidelity is qualified: missing SHX uses stroke substitution; TrueType is
  searchable only when usable font resources can be embedded, otherwise outlining
  may occur. PDF layers require a PDF reader with optional-content support.
- Desktop is described as having **no 20 MB browser cap**, not infinite memory.
  For paper-space layouts, batch jobs, font control or larger files, use desktop.
- Upstream implementation references: [v0.18.0 web shell](https://github.com/storytold/cadcraft/blob/v0.18.0/apps/cadcraft-web/src/main.rs),
  [DXF reader](https://github.com/storytold/cadcraft/blob/v0.18.0/crates/dxf/src/lib.rs),
  [PDF plotter](https://github.com/storytold/cadcraft/blob/v0.18.0/crates/io/src/pdf.rs),
  [font embedding](https://github.com/storytold/cadcraft/blob/v0.18.0/crates/io/src/pdf/fonts.rs).

## Preserved pages

The two named blog Titles and all existing blog H1s/headings/slugs are preserved.
The four changed blogs have only the requested FAQ/Step 2/Related edits. There
are no redirects or merges. Homepage, `/dwg-viewer`, header navigation, pricing,
payments, robots and `ads.txt` are unchanged.

## Verification

- Targeted tests: 21 passed, 0 failed, covering format/version/size gates, PDF
  result validation, cancellation before engine startup, metadata/FAQ agreement,
  existing DWG import/viewer behavior and link scope.
- Browser: ASCII R12 and binary R13/2018 produced visible DXF previews without
  leaving `/dxf-viewer`; binary R12 displayed an unsupported-version error.
- Node production build and its 50-page SSR regression check passed. TypeScript
  (`tsc --noEmit`) passed. Raw production HTML returned 200 for both tools,
  contained exactly one H1 and two distinct structured-data scripts, and the
  sitemap contained both canonical URLs. The hydrated DOM retained both types.
- Final Cloudflare build (`pnpm cf:build`) also passed: Worker bindings/config,
  484 source files, 664 build files and 50 rendered pages passed the site checks.
  No push or production deployment was performed for this patch.
- In the production preview, a real AC1032 DWG produced a **115,753-byte PDF 1.7**
  with PDF optional-content layers. Clicking Download PDF saved the file and
  kept the URL at `/dwg-to-pdf`. Poppler reopened and rendered its one page;
  geometry was visually inspected. Binary R13 DXF also produced a PDF on this
  page. These are checked examples, not a lossless-conversion guarantee.
- A binary 2018 DXF dropped on `/dxf-viewer` displayed its drawing. Zoom, fit,
  replacement and cancellation were exercised; successful and cancelled jobs
  left zero processor iframes. No JS errors or unhandled rejections were seen
  during that production-preview sequence. Dark-mode output was inspected.
- At **320×568, 390×844 and 1440×900**, both tools' file-picker buttons and file
  limits were visible without scrolling, with no horizontal page overflow.
  Mobile checks use browser viewport emulation, not a physical-phone claim.
- All nine source anchors in the seven requested groups were clicked in the
  production browser preview, including the existing online DWG viewer link.
  The PDF tool's Related link back to the original PDF guide was also clicked.

## Pre-commit security review

The deterministic `security-scan` and manual diff review cover size/header/output
checks, fixed export commands, iframe/Blob cleanup, drawing-safe image rendering,
JSON-LD escaping, existing safe FAQ anchors and lack of new server/upload routes.

| Severity | Scope      | Finding                                                              | Action                            |
| -------- | ---------- | -------------------------------------------------------------------- | --------------------------------- |
| Clean    | This patch | No exposed secrets or reachable injection/access-control issue found | Scanning passed; commit on `main` |
