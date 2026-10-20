// Facts about the upstream CADCraft project (github.com/storytold/cadcraft).
// Bump CADCRAFT_VERSION + the hosted web build in public/cadcraft-app/ together.
export const CADCRAFT_VERSION = '0.8.0';

const REPO = 'https://github.com/storytold/cadcraft';
const RELEASE = `${REPO}/releases/download/v${CADCRAFT_VERSION}`;

export const cadcraftLinks = {
  repo: REPO,
  wiki: `${REPO}/wiki`,
  releases: `${REPO}/releases/tag/v${CADCRAFT_VERSION}`,
  official: 'https://getartcraft.com/apps/cadcraft',
  launcher: 'https://github.com/storytold/craft-launcher/releases/latest',
  checksums: `${RELEASE}/SHA256SUMS.txt`,
  windows: `${RELEASE}/cadcraft-${CADCRAFT_VERSION}-windows-x64.msi`,
  macos: `${RELEASE}/cadcraft-${CADCRAFT_VERSION}-macos-universal.dmg`,
  linux: `${RELEASE}/cadcraft-${CADCRAFT_VERSION}-linux-x86_64.flatpak`,
  web: `${RELEASE}/cadcraft-web-${CADCRAFT_VERSION}.zip`,
  /** Self-hosted copy of the official web build (public/cadcraft-app/). */
  app: '/cadcraft-app/index.html',
} as const;
