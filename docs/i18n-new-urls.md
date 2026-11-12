# Italian, Brazilian Portuguese and German: URL and acceptance list

The latest language selection is **Italian /it/, Brazilian Portuguese /pt/, German /de/**. No Korean language pages are included. All nine pages share the existing templates.

**Status:** the main implementation was committed and pushed by the user during verification, and the deployment is live. All nine canonical HTTPS URLs were subsequently checked on cadcraft.org: HTTP 200, no redirects. A follow-up main commit records the final preview-title coverage check and these reports.

## English DWG prerequisite

On 2026-11-12, https://cadcraft.org/dwg-viewer returned HTTP 200 without a redirect. The browser opened the repository’s real AC1032 DWG and showed a drawing on that URL. Therefore all nine pages, including three viewers, are included.

## Nine new URLs

| Canonical URL                        | HTML language | Live HTTPS result |
| ------------------------------------ | ------------- | ----------------- |
| `https://cadcraft.org/it/`           | `it-IT`       | 200, no redirect  |
| `https://cadcraft.org/pt/`           | `pt-BR`       | 200, no redirect  |
| `https://cadcraft.org/de/`           | `de-DE`       | 200, no redirect  |
| `https://cadcraft.org/it/download`   | `it-IT`       | 200, no redirect  |
| `https://cadcraft.org/pt/download`   | `pt-BR`       | 200, no redirect  |
| `https://cadcraft.org/de/download`   | `de-DE`       | 200, no redirect  |
| `https://cadcraft.org/it/dwg-viewer` | `it-IT`       | 200, no redirect  |
| `https://cadcraft.org/pt/dwg-viewer` | `pt-BR`       | 200, no redirect  |
| `https://cadcraft.org/de/dwg-viewer` | `de-DE`       | 200, no redirect  |

Language roots keep their slash, as the English root does; download/viewer paths have none. The URL, canonical, switcher, head hreflang and sitemap use the identical form.

## Acceptance results

1. **Passed on production:** all nine canonical paths return 200 without redirect. Root English remains English with non-English Accept-Language headers and a prior language cookie. No language cookie is written.
2. **Passed:** html lang, title and description use it-IT, pt-BR or de-DE. Existing English title/H1 messages are unchanged.
3. **Passed:** all 12 pages have the same complete five-link hreflang group for that page, with x-default pointing to English. Actual head output is in [the hreflang report](./i18n-hreflang-output.md).
4. **Passed:** four plain anchor links appear only on these three page groups; a four-language cycle was clicked for home, download and viewer. Blog, legal and other English-only pages have no switcher. Unsupported language-prefixed online/legal URLs return 404 without a redirect to English.
5. **Passed with corrected baseline:** all nine URLs are in the sitemap. The local sitemap is **41 → 50**; production changed from its actual starting count of **39 → 50**, not the stated 38 → 47. No existing URL was removed. See [the sitemap diff](./i18n-sitemap-diff.md).
6. **Passed:** all three language viewers reuse DwgViewer and the unchanged local DWG converter. A real AC1032 file opened in each language in the production preview, on the same URL, with distinct WebApplication and FAQPage data after hydration. At 320×568 after fonts loaded, the complete file-picker button ended at y=558 (Italian), y=544 (Portuguese) and y=522 (German), all within the first viewport. Also checked 390px and 1440px layouts. These are viewport-emulation tests, not physical-phone certification.
7. **Passed:** 233 shared messages per language, complete download body/FAQ, localized viewer body/FAQ and localized home blog previews. Placeholder and numeric-token checks match English, including 20 MB / 64 MB limits, file versions and prices. No complete authored English message remains in the translated page body; product names, commands, filenames and formats are retained.
8. **Delivered:** this URL list, actual hreflang output and sitemap diff.

## Scope preserved

- English homepage title: **CADCraft: Free Open-Source AutoCAD Alternative | ArtCraft CADCraft**.
- English homepage H1: **CADCraft: free, open-source CAD for people and AI agents**.
- All existing English message values are unchanged; four translated guidance keys were added with the original English text. Homepage/download section counts match English, and official download URLs match exactly.
- No translated online editor, blog article, legal page, about or contact page is created. Their links continue to the English pages. Blog card previews on translated homepages are translated; the articles and their slugs/titles/H1s are untouched.
- English DWG copy, template and parser are unchanged. Its route selects the translated template only for the three explicit language URLs and adds the required reciprocal head metadata to English. English DXF/PDF implementations, prices, payments, ads.txt and robots are unchanged by this patch. The two previously local tools were also included when the user pushed main.
- Locale is resolved from explicit URL patterns plus the English base locale. No IP, browser-language or cookie inference; switching uses ordinary anchors. The historical /zh/ retirement redirect remains.
- The header uses a native details menu for language anchors. Its existing navigation collapses before translated labels can overflow; destinations are unchanged.

## Automated checks

- 25 targeted tests passed, including URL scope, preferred-language/cookie isolation, complete translation keys, placeholders/numbers and language-policy regression cases.
- Existing site policy: 9 tests passed.
- Node production build: 59 pages rendered and passed. Its sitemap has 50 entries; the extra checked pages include noindex articles that remain HTTP 200.
- New reciprocal hreflang/switcher/sitemap checks run with the existing build/deploy regression checks. Language source tests run before both Node and Cloudflare builds.
- Cloudflare production build passed the same 59-page SSR checks and Worker binding/config checks.

## Pre-commit security review

The deterministic `security-scan` passed. Manual review covered explicit locale
allowlists, URL-only resolution, safe ordinary language anchors, JSON-LD escaping,
static translation data, and the absence of changes to auth, payments or uploads.

| Severity | Scope               | Finding                                                              | Action                          |
| -------- | ------------------- | -------------------------------------------------------------------- | ------------------------------- |
| Clean    | This language patch | No exposed secrets or reachable injection/access-control issue found | Scanning passed; commit on main |
