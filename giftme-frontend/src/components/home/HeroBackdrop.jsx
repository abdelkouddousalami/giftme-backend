/**
 * Everything behind the hero's type.
 *
 * This replaces the old decorative system — a drawn ribbon, five glimmering
 * sparkles, drifting dots and two breathing blush blobs — with light and
 * texture only. Nothing here is a shape you can name, nothing loops, and
 * nothing is pink: depth comes from a warm field falling from above the fold,
 * a cooler one low on the left to stop the page going uniformly beige, and a
 * single tile of grain so the ivory reads as paper rather than as #FAF7F1.
 *
 * All of it is `aria-hidden`, `pointer-events-none` and stacked behind the
 * content column, so the hero can be read, laid out and animated without
 * knowing this exists.
 */
function HeroBackdrop() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      {/* Warm light from above the fold. Sand rather than blush — the whole
          point of the repalette. */}
      <span className="absolute inset-x-[-10%] -top-[35%] block h-[90%] opacity-75 [background:radial-gradient(58%_58%_at_50%_50%,var(--color-sand)_0%,transparent_68%)]" />

      {/* A cool field low on the left, at a quarter of the warm one's strength.
          Its only job is to keep the lower half of the hero from reading as a
          single flat beige wash. */}
      <span className="absolute -bottom-[30%] -left-[18%] block aspect-square w-[min(44rem,82%)] opacity-55 [background:radial-gradient(circle,var(--color-secondary-light)_0%,transparent_62%)]" />

      <span className="grain" />
    </div>
  )
}

export default HeroBackdrop
