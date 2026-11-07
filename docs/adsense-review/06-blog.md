# Blog search focus and reproducible evidence

Nine generic tutorials now receive noindex, follow and are excluded from both local and database sitemap loops: autocad-shortcuts, autocad-commands, how-to-scale-in-autocad, autocad-blocks, autocad-dimensions, model-space-vs-paper-space, how-to-learn-autocad, how-to-hatch-in-autocad, autocad-layers-off-freeze-lock. They remain HTTP 200 with self canonicals and retain their URLs and reader links. The additional five focus on general AutoCAD reference queries rather than CADCraft-specific results.

Seven priority articles each gain a screenshot captured from the real browser or tagged upstream source, a current CLI/MCP check, and downloadable evidence where applicable. They remain indexable and in the sitemap. Current-release platform and 3D references are checked against v0.18.0. The phone screenshot is explicitly browser emulation, not a claimed physical Android test. No synthetic or AI-generated screenshot was used.

Runs: official CLI 0.18.0 / 32238e83; 457 command records; 12 MCP tools; no APK asset; one stored 3D Polyline, no extrude command; 5-circle plate with 3 dimensions and a polyline; 9-circle flange; official bracket with 46 entities. The synthetic perf 100000 output is one macOS/arm64 run, not a cross-machine guarantee. Raw samples and output are under public/examples/review-0180; sources are pinned in the articles.

Historical tests retain the version they actually used. Replacing an old benchmark/version label would falsely imply rerunning every old experiment. These are explicitly distinguished from the fresh verification section. This deliberately does not meet a literal interpretation that no older version string may appear in any historical article.

Production-build HTTP verification checked all nine noindex routes for status 200, robots, self canonical and sitemap exclusion, and all seven priority routes for indexability, evidence and sitemap inclusion.
