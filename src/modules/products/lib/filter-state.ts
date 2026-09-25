import type { ProductPriceRange } from "../types";

export type ProductAvailability = "in-stock" | "out-of-stock";

export function normalizeAvailability(
  value: string | undefined | null
): ProductAvailability | undefined {
  return value === "in-stock" || value === "out-of-stock" ? value : undefined;
}

export function availabilityToInStock(
  availability: ProductAvailability | undefined
): boolean | undefined {
  if (availability === "in-stock") return true;
  if (availability === "out-of-stock") return false;
  return undefined;
}

/** A price bound from a URL parameter: a finite, non-negative number or nothing. */
export function normalizePriceBound(
  value: string | undefined | null
): number | undefined {
  if (value == null || value === "") return undefined;
  const parsed = Number.parseFloat(value);
  if (!Number.isFinite(parsed) || parsed < 0) return undefined;
  return parsed;
}

/**
 * The price band a request should actually filter on.
 *
 * Bounds are clamped to the catalogue's own range and dropped when they say
 * nothing — a band that spans the whole catalogue is not a filter, and letting
 * it through would divert every request onto the catalogue sweep for no reason.
 * An inverted pair (min above max) is normalized rather than rejected, because
 * two thumbs on one track can always be dragged past each other.
 */
export function resolvePriceRange(
  min: number | undefined,
  max: number | undefined,
  bounds: ProductPriceRange | null | undefined
): { minPrice?: number; maxPrice?: number } {
  if (min == null && max == null) return {};

  const low = min != null && max != null ? Math.min(min, max) : min;
  const high = min != null && max != null ? Math.max(min, max) : max;

  const minPrice =
    low != null && (!bounds || low > bounds.min) ? low : undefined;
  const maxPrice =
    high != null && (!bounds || high < bounds.max) ? high : undefined;

  return {
    ...(minPrice != null ? { minPrice } : {}),
    ...(maxPrice != null ? { maxPrice } : {}),
  };
}

export function isPriceRangeActive(range: {
  minPrice?: number;
  maxPrice?: number;
}): boolean {
  return range.minPrice != null || range.maxPrice != null;
}
