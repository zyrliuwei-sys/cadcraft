/**
 * A single, scrollable line of drafting commands, alternating solid and
 * outlined words without a duplicate animation track.
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
    <div className="border-foreground/80 overflow-x-auto border-y py-6 text-[clamp(44px,8vw,120px)] leading-none font-semibold whitespace-nowrap select-none sm:py-8">
      <div className="flex w-max">{track(false)}</div>
    </div>
  );
}
