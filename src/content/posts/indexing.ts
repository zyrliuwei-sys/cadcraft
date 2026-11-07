// Keep these URLs available to readers while narrowing search indexing to the
// site's CADCraft experience. Shared by the route and both sitemap sources.
export const NOINDEX_BLOG_SLUGS = new Set([
  'autocad-shortcuts',
  'autocad-commands',
  'how-to-scale-in-autocad',
  'autocad-blocks',
  'autocad-dimensions',
  'model-space-vs-paper-space',
  'how-to-learn-autocad',
  'how-to-hatch-in-autocad',
  'autocad-layers-off-freeze-lock',
]);

export function isBlogPostIndexable(slug: string): boolean {
  return !NOINDEX_BLOG_SLUGS.has(slug);
}
