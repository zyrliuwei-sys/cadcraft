// Brand call-to-action buttons: square graphite slab, or a 1.5px outlined slab.
const base =
  'inline-flex h-12 items-center justify-center gap-2 px-6 text-[15px] font-semibold whitespace-nowrap transition-[background-color,color,transform] active:translate-y-px';
export const ctaPrimary = `${base} bg-primary text-primary-foreground hover:bg-primary/85`;
export const ctaSecondary = `${base} border-[1.5px] border-foreground text-foreground hover:bg-foreground hover:text-background`;
