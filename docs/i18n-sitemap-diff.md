# Sitemap comparison

| Snapshot                                                    | URL count |
| ----------------------------------------------------------- | --------: |
| Stated background                                           |        38 |
| Actual production sitemap fetched on 2026-11-12             |        39 |
| Previous local production build, before this language patch |        41 |
| New local production build                                  |        50 |

The previous local build already contains the two locally committed tools /dxf-viewer and /dwg-to-pdf that are absent from the production snapshot. This patch adds nine URLs to that local baseline: **41 + 9 = 50**. Production was already at 39, so 47 would require dropping existing URLs or ignoring earlier local work. This patch preserves every existing entry rather than removing pages to match a stale count.

## Added (9)

- `https://cadcraft.org/it/`
- `https://cadcraft.org/pt/`
- `https://cadcraft.org/de/`
- `https://cadcraft.org/it/download`
- `https://cadcraft.org/pt/download`
- `https://cadcraft.org/de/download`
- `https://cadcraft.org/it/dwg-viewer`
- `https://cadcraft.org/pt/dwg-viewer`
- `https://cadcraft.org/de/dwg-viewer`

## Removed (0)

None. All 41 previous local entries remain.

## Hreflang changes

- The three English page groups now declare en, it-IT, pt-BR, de-DE and x-default.
- Each of the nine new entries carries the identical five-link group.
- All other pages remain English-only; no localized blog, online-editor or legal URLs are added.
- Root slashes match the actual canonical URLs. Non-root pages keep the existing no-trailing-slash form.
- No robots or other crawl rules are changed.
