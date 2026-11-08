# Editorial cleanup and deployment checks

The public site name is CADCraft / cadcraft.org. About uses **About cadcraft.org**
for the title, H1, Open Graph title and Twitter title, with ben's existing introduction.
Legacy environment names are normalized in the shared app configuration; production,
Docker and example configuration now use CADCraft.

About's `Last updated` is injected once at build time in Asia/Shanghai, so SSR and
hydration use the same date. The separate, genuine review record is in
`src/content/about-review.json`: it does not advance on unrelated builds. The site
check fails if its reviewed version no longer matches `CADCRAFT_VERSION`.

Earlier screenshots, CLI outputs and plotting results are described as recorded
examples without relabeling them as new tests. Current command availability was
checked against the official 0.18.0 CLI catalogue, including XCLIP and image attachment.
All nine existing noindex pages remain available at their existing slugs.

## Commands and deployment gate

- `pnpm check:site:source`: scan the application, content, translations, public text
  assets and deployment configuration.
- `pnpm test:site-check`: negative tests, including black-box failure of the full
  command for source, built-asset, duplicate-Draw and duplicate-loader regressions.
- `pnpm check:site`: scan source and `.output`, then render every sitemap/local
  article page, including noindex articles, to inspect actual HTML.

Both `pnpm build` and `pnpm cf:build` run the tests/source scan before compilation,
and the complete scan/render check afterwards. Existing `cf:ci:build` and
`cf:deploy` therefore fail before uploading if the check fails. Docker CI also uses
`pnpm build`. Missing build output fails rather than silently skipping validation.

The version deny list and ad-code patterns live in `scripts/site-check-policy.mjs`.
The scanner excludes its policy/test fixtures, dependencies, generated Paraglide
cache and unpublished maintenance reports. Dependency/lockfile version numbers are
not CADCraft release claims. Exact `atOptions` identifiers are prohibited; the
unrelated third-party identifier `formatOptions` is valid. SVG/XML namespace URLs
are also valid and are not site navigation links.

For Worker builds, the compiled fetch handler is rendered through a local Node
adapter with no remote bindings. This verifies SSR HTML, not workerd runtime
compatibility or production database content. Node builds use the actual production
server. Both paths use isolated test storage and an ephemeral test secret; the
checker never deploys, migrates or modifies production data.

Canonical URLs, Open Graph URLs, localized links, router output and sitemap entries
all use the same slash-free non-root form. HTTP/www/retired locale/trailing slash
redirects are combined in one 301. Asset directory and API routing is preserved.
