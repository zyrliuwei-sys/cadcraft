import { Download } from 'lucide-react';

import {
  CADCRAFT_VERSION,
  cadcraftCliPackages,
  cadcraftLinks,
} from '@/config/cadcraft';

type Props = {
  notes: Record<keyof typeof cadcraftCliPackages, string>;
  releaseLabel: string;
  checksumsLabel: string;
};

const platforms = ['macOS', 'Windows', 'Linux'] as const;

export function CadCliDownloads({
  notes,
  releaseLabel,
  checksumsLabel,
}: Props) {
  return (
    <div className="border-border bg-sheet my-5 border">
      <div className="bg-sheet-grid flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b px-4 py-3">
        <a
          href={cadcraftLinks.releases}
          className="text-signal-ink text-sm font-semibold underline-offset-4 hover:underline"
        >
          {releaseLabel} v{CADCRAFT_VERSION}
        </a>
        <a
          href={cadcraftLinks.checksums}
          className="text-muted-foreground hover:text-foreground font-mono text-xs underline underline-offset-4"
        >
          {checksumsLabel}
        </a>
      </div>
      <ul className="divide-border divide-y">
        {platforms.map((platform) => (
          <li
            key={platform}
            className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 px-4 py-4"
          >
            <div>
              <h3 className="font-display text-foreground text-base font-semibold">
                {platform}
              </h3>
              <p className="text-muted-foreground text-sm">{notes[platform]}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {cadcraftCliPackages[platform].map(({ label, url }) => (
                <a
                  key={label}
                  href={url}
                  aria-label={`${platform} ${label}`}
                  className="hover:border-signal hover:text-signal-ink inline-flex min-h-10 items-center gap-2 border px-3 font-mono text-xs font-medium transition-colors"
                >
                  <Download aria-hidden="true" className="size-3.5" />
                  {label}
                </a>
              ))}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
