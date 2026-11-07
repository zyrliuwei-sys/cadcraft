# Marketing facts checked against CADCraft v0.18.0

Sources: the tagged README, docs/file-format-parity.md and docs/gaps.md in https://github.com/storytold/cadcraft/tree/v0.18.0, plus src/lib/dwg-format.ts for this host’s separate browser import limits.

- DXF: ASCII R12–2018; binary starts at R13. R12 binary is listed as a gap.
- DWG: desktop uses the acadrust bridge; early R13/R14 support is not fully tested and fidelity varies. Avoid promising universal lossless compatibility.
- Output: PDF plotting, SVG and PNG are implemented; PDF import and complete 3D solid modeling are not.
- SHX: support has landed, so the old “SHX fonts are not read yet” claim is removed.
- Hosted DWG import is this site’s separate beta converter, limited to 20 * 1024 * 1024 bytes, not a feature asserted by upstream release notes.
- FreeBSD release assets include x86_64 and aarch64.
- CADCraft Pro copy derives monthly/yearly amounts from the existing catalog (490 / 2900 USD cents). The catalog, checkout and subscription implementation are unchanged.
- The repeated command track was for animation; it now renders once with horizontal scrolling.
