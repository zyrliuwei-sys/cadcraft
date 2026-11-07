# Release verification: 0.18.0

Checked 2026-11-07 against the official tagged release (commit 32238e83c2c8bf643994132883e94bc96961f649).

| Asset                                | Final HTTP status | Bytes    |
| ------------------------------------ | ----------------- | -------- |
| cadcraft-0.18.0-linux-x86_64.flatpak | 200               | 53032552 |
| cadcraft-0.18.0-macos-universal.dmg  | 200               | 84008749 |
| cadcraft-0.18.0-windows-x64.msi      | 200               | 59494400 |
| cadcraft-web-0.18.0.zip              | 200               | 11252837 |
| SHA256SUMS.txt                       | 200               | 5234     |

The Linux quick download remains the real x86_64 Flatpak; ARM64 packages are separate assets. Both the web archive and the macOS CLI archive matched official SHA256SUMS.txt. The CLI reports 0.18.0 and its release commit.

The official web WASM is 30,321,842 bytes, above the Workers 25 MiB asset limit. It is gzip-compressed without executable changes, split into parts under 5 MiB, and decoded in the browser before initialization. release.json records source and decoded hashes. The browser loaded the release canvas successfully. The 12 DWG import/conversion tests passed, and the reconstructed WASM hash matches the official archive and validates as WebAssembly.

Current marketing strings and links derive from CADCRAFT_VERSION. Dated historical blog tests retain their original tested versions until rerun; changing those labels alone would falsely claim a new test. Priority article refreshes belong to group 6.
