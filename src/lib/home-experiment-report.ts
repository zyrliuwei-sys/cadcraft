import {
  HOME_CTA_EXPERIMENT,
  type HomeCtaVariant,
} from '@/lib/home-cta-experiment';

export interface HomeExperimentRow {
  variant: HomeCtaVariant;
  exposed: number;
  downloads: number;
  editorsReady: number;
}
export interface ExperimentEvent {
  visitorId: string;
  name: string;
  variant: string | null;
  createdAt: Date | number;
}

/** Unique visitors, after visible exposure, within the same reporting window. */
export function summarizeHomeExperiment(
  events: ExperimentEvent[],
  allowed: ReadonlySet<string>
): HomeExperimentRow[] {
  const assignments = new Map<
    string,
    { variant: HomeCtaVariant; at: number; mixed: boolean }
  >();
  const variantOf = (tag: string | null): HomeCtaVariant | null => {
    if (tag === `${HOME_CTA_EXPERIMENT}:control`) return 'control';
    if (tag === `${HOME_CTA_EXPERIMENT}:download_first`)
      return 'download_first';
    return null;
  };
  for (const e of events) {
    const variant = variantOf(e.variant);
    if (!variant || e.name !== 'home_cta_exposure' || !allowed.has(e.visitorId))
      continue;
    const at = Number(e.createdAt);
    const old = assignments.get(e.visitorId);
    if (!old) assignments.set(e.visitorId, { variant, at, mixed: false });
    else {
      old.mixed ||= old.variant !== variant;
      old.at = Math.min(old.at, at);
    }
  }
  const outcomes = {
    control: { downloads: new Set<string>(), editors: new Set<string>() },
    download_first: {
      downloads: new Set<string>(),
      editors: new Set<string>(),
    },
  };
  for (const e of events) {
    const assignment = assignments.get(e.visitorId);
    if (
      !assignment ||
      assignment.mixed ||
      Number(e.createdAt) < assignment.at ||
      variantOf(e.variant) !== assignment.variant
    )
      continue;
    if (e.name === 'download_click')
      outcomes[assignment.variant].downloads.add(e.visitorId);
    if (e.name === 'online_editor_ready')
      outcomes[assignment.variant].editors.add(e.visitorId);
  }
  return (['control', 'download_first'] as const).map((variant) => ({
    variant,
    exposed: [...assignments.values()].filter(
      (a) => a.variant === variant && !a.mixed
    ).length,
    downloads: outcomes[variant].downloads.size,
    editorsReady: outcomes[variant].editors.size,
  }));
}
