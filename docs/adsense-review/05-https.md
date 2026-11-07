# HTTP / HTTPS audit

Baseline on 2026-11-07: http://cadcraft.org/ returned 200; http://www.cadcraft.org/download redirected to http://cadcraft.org/download (not HTTPS).

The server now combines production HTTP→HTTPS, www→bare host, and retired /zh prefix normalization in a single 301, preserving path and query. Localhost HTTP remains available for development. No untrusted Forwarded/Host redirect destination is accepted from request headers; the function normalizes the request URL with fixed production hosts.

SEO origin normalization repairs a production VITE_APP_URL accidentally set to http://www.cadcraft.org. pageHead, sitemap, robots sitemap reference, website/image JSON-LD and author URLs use the canonical HTTPS origin. XML/SVG http namespace identifiers are intentionally preserved: those are specifications, not crawl destinations. No robots disallow rule was changed.

Deployment is required before the live origin can meet this acceptance criterion. Recheck http/https with and without www after deployment; each noncanonical request must have a single Location to its final HTTPS URL. GSC historical HTTP impressions will not disappear immediately.
