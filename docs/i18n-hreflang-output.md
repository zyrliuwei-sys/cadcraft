# Actual reciprocal hreflang output

Captured from **live HTTPS production HTML** at cadcraft.org on 2026-11-12 after deployment. All 12 canonical pages returned HTTP 200 without redirect. The four versions in each group were compared and have the same five entries, including English itself and x-default.

## /

Checked pages: `/`, `/it/`, `/pt/`, `/de/`.

```html
<link rel="alternate" hreflang="en" href="https://cadcraft.org/" />
<link rel="alternate" hreflang="it-IT" href="https://cadcraft.org/it/" />
<link rel="alternate" hreflang="pt-BR" href="https://cadcraft.org/pt/" />
<link rel="alternate" hreflang="de-DE" href="https://cadcraft.org/de/" />
<link rel="alternate" hreflang="x-default" href="https://cadcraft.org/" />
```

## /download

Checked pages: `/download`, `/it/download`, `/pt/download`, `/de/download`.

```html
<link rel="alternate" hreflang="en" href="https://cadcraft.org/download" />
<link
  rel="alternate"
  hreflang="it-IT"
  href="https://cadcraft.org/it/download"
/>
<link
  rel="alternate"
  hreflang="pt-BR"
  href="https://cadcraft.org/pt/download"
/>
<link
  rel="alternate"
  hreflang="de-DE"
  href="https://cadcraft.org/de/download"
/>
<link
  rel="alternate"
  hreflang="x-default"
  href="https://cadcraft.org/download"
/>
```

## /dwg-viewer

Checked pages: `/dwg-viewer`, `/it/dwg-viewer`, `/pt/dwg-viewer`, `/de/dwg-viewer`.

```html
<link rel="alternate" hreflang="en" href="https://cadcraft.org/dwg-viewer" />
<link
  rel="alternate"
  hreflang="it-IT"
  href="https://cadcraft.org/it/dwg-viewer"
/>
<link
  rel="alternate"
  hreflang="pt-BR"
  href="https://cadcraft.org/pt/dwg-viewer"
/>
<link
  rel="alternate"
  hreflang="de-DE"
  href="https://cadcraft.org/de/dwg-viewer"
/>
<link
  rel="alternate"
  hreflang="x-default"
  href="https://cadcraft.org/dwg-viewer"
/>
```

No retired Chinese, Korean, Indian-English or unshipped page variants are advertised. English-only pages retain self/x-default alternates and have no language switcher.
