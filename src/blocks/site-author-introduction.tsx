import { siteAuthor } from '@/config/site-author';

export function SiteAuthorIntroduction() {
  // Only publish a biography actually supplied by the owner.
  if (!siteAuthor.name || !siteAuthor.biography) return null;
  return (
    <section aria-label={siteAuthor.name}>
      <h2>{siteAuthor.name}</h2>
      <p>{siteAuthor.biography}</p>
      <p>
        <a href={`mailto:${siteAuthor.email}`}>{siteAuthor.email}</a>
      </p>
    </section>
  );
}
