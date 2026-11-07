import { envConfigs } from '@/config';
import { SITE_URL } from '@/config/site-url';

const name = envConfigs.site_author_name.trim() || 'ben';

export const siteAuthor = {
  name,
  biography:
    envConfigs.site_author_biography.trim() ||
    `I’m ${name}, the independent maintainer of cadcraft.org. My work on this guide focuses on checking release links, documenting installation steps and preserving reproducible CADCraft examples. I want readers to be able to distinguish the upstream software, this hosted browser edition and optional cloud features without guessing. I use the official GitHub releases, tagged project documentation and recorded CLI tests as sources, and make limitations explicit when a workflow is still experimental. CADCraft itself is developed by the ArtCraft team; I do not represent ArtCraft or Autodesk. For corrections, questions or feedback about this guide, contact support@cadcraft.org.`,
  email: 'support@cadcraft.org',
};

export function siteAuthorJsonLd() {
  if (!siteAuthor.name) return undefined;
  return {
    '@type': 'Person',
    name: siteAuthor.name,
    url: `${SITE_URL}/about`,
    email: siteAuthor.email,
  };
}
