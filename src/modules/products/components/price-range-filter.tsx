"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useFormatPrice } from "@/shared/config/storefront-context";
import type { ProductPriceRange } from "../types";

type Translate = (key: string, values?: Record<string, string | number>) => string;

/**
 * How many stops the track offers between its ends.
 *
 * A step of 1 is meaningless on a catalogue priced in millions of rial and
 * makes the thumb take thousands of arrow presses to cross; a step derived from
 * the span keeps the control the same to use whatever the currency is worth.
 */
const TRACK_STOPS = 100;

/** Kept in step with the thumb drawn by `.store-price-track` in globals.css. */
const THUMB_SIZE = "1.25rem";
const THUMB_RADIUS = "0.625rem";

function trackStep(range: ProductPriceRange): number {
  const span = range.max - range.min;
  if (span <= TRACK_STOPS) return 1;
  return Math.max(1, Math.round(span / TRACK_STOPS));
}

function clamp(value: number, low: number, high: number) {
  return Math.min(high, Math.max(low, value));
}

interface PriceRangeFilterProps {
  /** The catalogue's own extent — the ends of the track. */
  range: ProductPriceRange;
  /** The active band, or the track's ends when nothing is filtered. */
  minPrice: number | undefined;
  maxPrice: number | undefined;
  /**
   * Called once the shopper lets go, never mid-drag: each call is a navigation,
   * and one per pixel would queue a few hundred of them across one gesture.
   */
  onCommit: (next: { minPrice?: number; maxPrice?: number }) => void;
  t: Translate;
  legendClassName?: string;
}

/**
 * The catalogue rail's price band.
 *
 * Two native range inputs share one rail rather than a custom pointer-driven
 * widget, because the thing being built is two values on a scale and that is
 * exactly what two range inputs already are: each one arrow-keys, each one
 * announces its own end of the band, and neither needs a keyboard model
 * written by hand. The rail and the filled band beneath them are presentation
 * only; see `.store-price-track` in globals.css for why the inputs themselves
 * are transparent to the pointer everywhere except their thumbs.
 */
export function PriceRangeFilter({
  range,
  minPrice,
  maxPrice,
  onCommit,
  t,
  legendClassName,
}: PriceRangeFilterProps) {
  const formatPrice = useFormatPrice();
  const step = useMemo(() => trackStep(range), [range]);

  const activeLow = minPrice ?? range.min;
  const activeHigh = maxPrice ?? range.max;

  // The thumbs move on every input event so the drag looks live; the URL only
  // learns about it on release. `draft` is that in-between state.
  const [draft, setDraft] = useState<[number, number]>([activeLow, activeHigh]);

  // Adopt the band whenever it changes underneath us — a cleared filter, a back
  // navigation, a chip dismissed elsewhere on the page.
  const committed = useRef<[number, number]>([activeLow, activeHigh]);
  useEffect(() => {
    if (committed.current[0] === activeLow && committed.current[1] === activeHigh) {
      return;
    }
    committed.current = [activeLow, activeHigh];
    setDraft([activeLow, activeHigh]);
  }, [activeLow, activeHigh]);

  const [low, high] = draft;

  const commit = useCallback(() => {
    if (committed.current[0] === low && committed.current[1] === high) return;
    committed.current = [low, high];
    onCommit({
      // A bound sitting on the end of the track is not a filter, so it leaves
      // the URL entirely rather than pinning a band that excludes nothing.
      minPrice: low > range.min ? low : undefined,
      maxPrice: high < range.max ? high : undefined,
    });
  }, [high, low, onCommit, range.max, range.min]);

  const fraction = (value: number) =>
    range.max === range.min
      ? 0
      : (value - range.min) / (range.max - range.min);

  const lowFraction = fraction(low);
  const highFraction = fraction(high);

  /**
   * Where a thumb's centre actually sits.
   *
   * A range input does not put its thumb centre at 0% and 100%; it insets both
   * ends by half a thumb so the thumb itself never overhangs the control. A
   * band drawn on raw percentages therefore runs past the thumbs at both ends —
   * so the rail and the fill are mapped onto that same inset track instead.
   */
  const trackPosition = (value: number) =>
    `calc(${THUMB_RADIUS} + (100% - ${THUMB_SIZE}) * ${value})`;

  // With two full-width inputs stacked, the one later in the DOM owns any thumb
  // they both cover. Once the lower thumb has been dragged past the middle it
  // is the one a shopper is reaching for, so it comes to the front there.
  const lowOnTop = lowFraction > 0.5;

  const minLabel = t("products.priceMin");
  const maxLabel = t("products.priceMax");

  return (
    <fieldset>
      <legend className={legendClassName}>{t("products.priceFilter")}</legend>

      <div className="mt-4">
        <div className="store-price-track">
          <div
            className="pointer-events-none absolute top-[0.5625rem] h-1 rounded-full bg-sand-300"
            style={{ insetInline: THUMB_RADIUS }}
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute top-[0.5625rem] h-1 rounded-full bg-rose"
            style={{
              insetInlineStart: trackPosition(lowFraction),
              width: `calc((100% - ${THUMB_SIZE}) * ${Math.max(
                0,
                highFraction - lowFraction
              )})`,
            }}
            aria-hidden="true"
          />
          <input
            type="range"
            min={range.min}
            max={range.max}
            step={step}
            value={low}
            aria-label={minLabel}
            aria-valuetext={formatPrice(low)}
            style={lowOnTop ? { zIndex: 1 } : undefined}
            onChange={(event) =>
              setDraft(([, currentHigh]) => [
                clamp(Number(event.target.value), range.min, currentHigh),
                currentHigh,
              ])
            }
            onPointerUp={commit}
            onTouchEnd={commit}
            onKeyUp={commit}
            onBlur={commit}
          />
          <input
            type="range"
            min={range.min}
            max={range.max}
            step={step}
            value={high}
            aria-label={maxLabel}
            aria-valuetext={formatPrice(high)}
            onChange={(event) =>
              setDraft(([currentLow]) => [
                currentLow,
                clamp(Number(event.target.value), currentLow, range.max),
              ])
            }
            onPointerUp={commit}
            onTouchEnd={commit}
            onKeyUp={commit}
            onBlur={commit}
          />
        </div>

        {/* The two numbers under the rail. They are the sighted reading of the
            same values the inputs announce, so they are hidden from assistive
            technology rather than repeated into it.

            Inset to the track rather than to the rail, so each number sits
            under the end of the line it describes — and so neither can end up
            flush against the scrolling rail's own edge, which in RTL put the
            larger number half under the scrollbar. */}
        <p
          className="mt-2.5 flex items-center justify-between gap-3 text-xs text-muted-foreground"
          style={{ paddingInline: THUMB_RADIUS }}
          aria-hidden="true"
        >
          <span>{formatPrice(low)}</span>
          <span className="text-end">{formatPrice(high)}</span>
        </p>
      </div>
    </fieldset>
  );
}
