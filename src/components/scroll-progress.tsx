/** Thin signal-orange reading-progress rule under the header (CSS scroll timeline, no JS). */
export function ScrollProgress() {
  return (
    <div
      aria-hidden="true"
      className="scroll-progress bg-signal pointer-events-none fixed top-16 left-0 z-40 h-[2px] w-full origin-left"
    />
  );
}
