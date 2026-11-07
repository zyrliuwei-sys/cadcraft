# Draft guide copy and shared FAQ data

The owner asked us to draft both pages. src/content/guide-copy.ts now contains a 219-word download introduction with 6 FAQs, and a 241-word online introduction with 7 FAQs. The same pairs render visibly and feed each page’s FAQPage JSON-LD. Sources are the verified v0.18.0 release, tagged format/gap documentation and this host’s tested browser import/autosave behavior. No unsupported numeric RAM/OS-version requirement is invented.

Run node scripts/verify-guide-copy.mjs to check body length, FAQ count, nonempty answers and duplicate questions. The build renders no placeholder text or invisible schema when copy is absent. Copy review remains in this dedicated Draft PR; it is not published automatically.

Both page bodies link to /tutorials and /vs-autocad. Homepage body anchors and a contextual paragraph on /tutorials link to /download and /online with descriptive text. Navigation, page URLs, homepage brand metadata, checkout and subscription behavior are unchanged.
