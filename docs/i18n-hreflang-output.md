# Actual reciprocal hreflang output

Captured from raw local production HTML on 2026-11-12. These are the emitted absolute production URLs, not a proposed matrix. The four versions in each group were compared byte for byte and are identical. English is included; x-default always points to English.

## /

Checked pages: `/`, `/it/`, `/pt/`, `/de/`. Each returned HTTP 200 without redirect.

```html
<link rel="alternate" hreflang="en" href="https://cadcraft.org/" />
<link rel="alternate" hreflang="it-IT" href="https://cadcraft.org/it/" />
<link rel="alternate" hreflang="pt-BR" href="https://cadcraft.org/pt/" />
<link rel="alternate" hreflang="de-DE" href="https://cadcraft.org/de/" />
<link rel="alternate" hreflang="x-default" href="https://cadcraft.org/" />
```

## /download

Checked pages: `/download`, `/it/download`, `/pt/download`, `/de/download`. Each returned HTTP 200 without redirect.

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

Checked pages: `/dwg-viewer`, `/it/dwg-viewer`, `/pt/dwg-viewer`, `/de/dwg-viewer`. Each returned HTTP 200 without redirect.

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

No zh, ko, Indian English, or unshipped page variants are advertised. Nontranslated pages retain only en and x-default declarations, with no language switcher.
