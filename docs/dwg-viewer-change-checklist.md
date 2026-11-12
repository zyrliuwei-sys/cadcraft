# DWG viewer: page-by-page change checklist

All changes are on `main`. No new blog article, language version, homepage section,
navigation item, robots rule, blog slug or pricing/payment change is included.

| Page                           | Change to check after publishing                                                                                                                                                                                                                                  |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/dwg-viewer`                  | New English tool. A working drop zone/file picker is in the first viewport. Reuses the editor's local DWG converter and its 20 MB input limit; no account or drawing upload. A 2D read-only preview stays on this page, with pan, zoom, fit and file replacement. |
| `/dwg-viewer` body             | Viewing/editing guidance links to `/online` and `/download`; existing guide's AC1009–AC1032 format rows with R12 rejection and R13/R14 caveats; a two-column viewer/editor comparison; four FAQs.                                                                 |
| `/dwg-viewer` metadata         | Title: **DWG Viewer — Free, Online & No Sign-In**. H1: **DWG viewer**. Free/browser/no registration/2018-format description. Separate WebApplication and FAQPage JSON-LD scripts remain distinct after hydration.                                                 |
| `/blog/how-to-open-dwg-file`   | Add **DWG viewer** in Step 4; add **Open a DWG online — free DWG viewer** in Related; revise the existing online-opening FAQ to link to the viewer first, then the editor. Title and H1 are unchanged.                                                            |
| `/download`                    | Add **Just need to look at a DWG? Use the free DWG viewer.** in the body, linking to the tool.                                                                                                                                                                    |
| `/online`                      | Add **Only viewing? Try the free DWG viewer instead.** in the body. The existing import and editor stay unchanged.                                                                                                                                                |
| `/blog/dwg-to-pdf`             | Add one **Free DWG viewer** link in Related only.                                                                                                                                                                                                                 |
| `/blog/dwg-to-dxf`             | Add one **Free DWG viewer** link in Related only.                                                                                                                                                                                                                 |
| `/blog/dxf-vs-dwg`             | Add one **Free DWG viewer** link in Related only.                                                                                                                                                                                                                 |
| `/blog/pdf-to-dwg`             | Add one **Free DWG viewer** link in Related only.                                                                                                                                                                                                                 |
| `/blog/how-to-open-dxf-file`   | Add one **Free DWG viewer** link in Related only.                                                                                                                                                                                                                 |
| `/blog/open-source-dwg-editor` | Add one **Free DWG viewer** link in Related only.                                                                                                                                                                                                                 |
| `/sitemap.xml`                 | Add `/dwg-viewer` with the same canonical URL shape as other public pages. No other crawl rules change.                                                                                                                                                           |

The requested existing-page placements produce eleven clickable viewer links across
nine existing pages: three on the DWG-opening guide, two on the entry pages, and six
Related links. No extra viewer links were added to existing pages.

## Implementation notes

- `convertDwg` and its disposable worker are reused, including header checks,
  supported versions, converted-DXF bound, cancellation and timeout.
- `dxf-viewer` is lazy-loaded after conversion, not included in the initial tool
  UI. DXF parsing/geometry preparation uses a second worker and local Blob URL.
- A bundled Noto Sans font avoids a third-party font request. Font/layout/entity
  fidelity limitations are visible below a successful preview. This is a 2D
  model-space preview, not a replacement for full AutoCAD rendering.
- No editor iframe, cloud save, editing commands or drawing persistence are added.
- Viewer dependency and font attribution are in `public/licenses/dwg-viewer` and
  `public/fonts/dwg-viewer/OFL.txt`.
- Editorial FAQ links support only simple same-site paths. Visible answers and
  FAQPage text share the same link-label normalization.

## Verification

The test suite `tests/dwg-viewer.test.ts` covers the shared size limit, version-table
agreement, visible/schema FAQ consistency, safe real anchors, fail-fast invalid /
unsupported / oversized files, cancellation, and the exact requested blog-link scope.
The existing browser DWG tests exercise a real AC1032 drawing and worker cleanup.

### Checked on 2026-11-12

- Node production build: passed. Site regression check scanned 478 source files,
  649 build files and 48 rendered pages; canonical URLs, sitemap, existing ad
  loader counts and the homepage Draw strip passed.
- Cloudflare Worker build: `pnpm cf:build` passed, including binding/config
  validation and the same 48-page SSR regression check. No deploy was run.
- TypeScript: `tsc --noEmit` passed. Targeted tests: **16 passed, 0 failed**
  (`dwg-viewer`, existing DWG import, canonical URL and blog indexing suites).
- Raw `/dwg-viewer` HTML contains the requested title, exactly one H1, and
  separate **WebApplication** and **FAQPage** scripts with four questions.
  Both script types also remain correct in the hydrated browser DOM.
- Actual file-picker and drop events opened the repository's 1,081,979-byte
  `sample_AC1032.dwg` fixture in the production preview. Visible geometry,
  zoom, fit, file replacement and reopening after errors were checked; the URL
  stayed `/dwg-viewer`, exactly one preview canvas remained, and no JavaScript
  errors or unhandled promise rejections were observed during these actions.
- Invalid DWG, unsupported AC1009 and input larger than 20 MB showed the
  corresponding errors in the browser. Cancellation and worker timeout are
  covered by the existing converter tests.
- At **320×568, 390×844, 768×900 and 1440×900**, both the file-picker button and
  the shared size/account restriction are visible without scrolling. No
  horizontal page overflow was found. Mobile and desktop dark-mode drawing
  previews were visually inspected; this is viewport emulation, not a
  physical-phone compatibility claim.
- All **11** requested inbound anchors were clicked from their actual rendered
  source pages and reached `/dwg-viewer`, including the FAQ answer link.
- `/sitemap.xml` includes `https://cadcraft.org/dwg-viewer`. Homepage content,
  existing blog titles/H1s/slugs, robots rules, `ads.txt` and payment files have
  no changes in this patch.

This checklist describes a local production preview. It does not claim a
production deployment or successful rendering of every DWG entity/version.

### Pre-commit security review

The `security-scan` staged-file scanner passed. Manual review covered local-file
size/header validation, worker cancellation/cleanup, same-site FAQ anchors,
escaped JSON-LD, dependency sources and the bundled font/license files.

| Severity | Scope      | Finding                                                              | Action                            |
| -------- | ---------- | -------------------------------------------------------------------- | --------------------------------- |
| Clean    | This patch | No secret exposure or reachable injection/access-control issue found | Scanning passed; commit on `main` |
