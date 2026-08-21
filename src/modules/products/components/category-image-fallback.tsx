import { cn } from "@/shared/lib/utils";

/**
 * The tile a category gets when neither the catalogue nor the theme has a
 * photograph for it.
 *
 * Seven of this shop's thirteen categories carry no media, so the fallback is
 * not an edge case — it is half the band, and repeating one stock photograph
 * seven times reads as a broken page rather than a shop. So this is drawn, not
 * photographed: a botanical mark on the storefront's own porcelain and green,
 * which repeats as an evident house treatment instead of pretending to be a
 * picture of anything. It is inline SVG, so it costs no request, cannot shift
 * layout, and follows the theme into dark mode.
 *
 * `tone` varies the wash across three brand-safe steps so a run of fallbacks
 * has rhythm. It is presentation only — the caller passes the tile's position,
 * never anything about the category itself.
 */
const TONES = [
  "bg-secondary",
  "bg-storefront-brand-soft",
  "bg-accent/70",
] as const;

export function CategoryImageFallback({
  tone = 0,
  className,
}: {
  /** Any integer; the tile's index in the grid is the natural value. */
  tone?: number;
  className?: string;
}) {
  const wash = TONES[Math.abs(tone) % TONES.length];

  return (
    <div
      className={cn(
        "relative flex h-full w-full items-center justify-center",
        wash,
        className
      )}
      /* Decorative: the category's name is drawn beneath it, in the same link. */
      aria-hidden="true"
    >
      {/* A light falling from the top, so the tile has the same soft depth as
          the photographs it sits between rather than reading as a flat swatch. */}
      <span className="absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_0%,color-mix(in_oklch,var(--card)_78%,transparent),transparent_65%)]" />
      <svg
        viewBox="0 0 96 120"
        fill="none"
        className="relative h-[42%] w-auto text-primary/45"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      >
        {/* A single stem with four leaf pairs and a bloom — the simplest mark
            that still reads as "flowers" at a 150px tile. */}
        <path d="M48 116V38" />
        <path d="M48 96c-14 0-22-7-24-19 13-2 22 5 24 19Z" />
        <path d="M48 96c14 0 22-7 24-19-13-2-22 5-24 19Z" />
        <path d="M48 70c-12 0-19-6-21-16 11-2 19 4 21 16Z" />
        <path d="M48 70c12 0 19-6 21-16-11-2-19 4-21 16Z" />
        <circle cx="48" cy="28" r="10" />
        <path d="M48 18c6-8 14-8 18-4-2 6-9 9-18 4Z" />
        <path d="M48 18c-6-8-14-8-18-4 2 6 9 9 18 4Z" />
      </svg>
    </div>
  );
}
