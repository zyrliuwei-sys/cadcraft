/**
 * One oversized, slowly drifting line of drafting commands: the site's single
 * typographic moment. Alternates solid and outlined words; pauses on hover;
 * static (and scrollable) under reduced motion.
 */
export function CommandMarquee({ words }: { words: string[] }) {
  const track = (hidden: boolean) => (
    <div
      className="flex shrink-0 items-center"
      aria-hidden={hidden || undefined}
    >
      {words.map((w, i) => (
        <span key={`${w}-${i}`} className="flex items-center">
          <span
            className={
              i % 2 === 0
                ? 'font-display-wide text-foreground'
                : 'font-display-wide text-outline'
            }
          >
            {w}
          </span>
          <span className="snap-mark mx-[0.35em] size-[0.28em]! border-[0.06em]!" />
        </span>
      ))}
    </div>
  );
  return (
    <div className="marquee border-foreground/80 overflow-hidden border-y py-6 text-[clamp(44px,8vw,120px)] leading-none font-semibold whitespace-nowrap select-none sm:py-8">
      <div className="marquee-track flex w-max">
        {track(false)}
        {track(true)}
      </div>
    </div>
  );
}
