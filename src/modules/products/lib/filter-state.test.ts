import test from "node:test";
import assert from "node:assert/strict";
import {
  isPriceRangeActive,
  normalizePriceBound,
  resolvePriceRange,
} from "./filter-state.ts";

const TRACK = { min: 20, max: 200 };

test("a price bound is read only from a finite, non-negative number", () => {
  assert.equal(normalizePriceBound("45"), 45);
  assert.equal(normalizePriceBound("45.5"), 45.5);
  assert.equal(normalizePriceBound("0"), 0);

  for (const value of ["", null, undefined, "abc", "-1", "NaN", "Infinity"]) {
    assert.equal(
      normalizePriceBound(value),
      undefined,
      `${String(value)} is not a price`
    );
  }
});

test("a bound sitting on the end of the track is not a filter", () => {
  // This is what keeps "?minPrice=20" on a catalogue that starts at 20 from
  // diverting every request onto the full-catalogue sweep for no reason.
  assert.deepEqual(resolvePriceRange(20, 200, TRACK), {});
  assert.deepEqual(resolvePriceRange(10, 500, TRACK), {});
  assert.deepEqual(resolvePriceRange(50, 200, TRACK), { minPrice: 50 });
  assert.deepEqual(resolvePriceRange(20, 150, TRACK), { maxPrice: 150 });
  assert.deepEqual(resolvePriceRange(50, 150, TRACK), {
    minPrice: 50,
    maxPrice: 150,
  });
});

test("an inverted pair is normalized rather than rejected", () => {
  // Two thumbs on one track can always be dragged past each other, and a URL
  // can always be hand-edited. Neither should produce a band matching nothing.
  assert.deepEqual(resolvePriceRange(150, 50, TRACK), {
    minPrice: 50,
    maxPrice: 150,
  });
});

test("no bounds at all is no band", () => {
  assert.deepEqual(resolvePriceRange(undefined, undefined, TRACK), {});
  assert.deepEqual(resolvePriceRange(undefined, undefined, null), {});
});

test("without a track, any bound given is honoured", () => {
  // The track is unknown when the catalogue could not be swept. A bound the
  // shopper asked for is still applied — it just cannot be checked for being
  // redundant.
  assert.deepEqual(resolvePriceRange(50, undefined, null), { minPrice: 50 });
  assert.deepEqual(resolvePriceRange(undefined, 150, null), { maxPrice: 150 });
});

test("a one-ended band is still a band", () => {
  assert.equal(isPriceRangeActive({}), false);
  assert.equal(isPriceRangeActive({ minPrice: 50 }), true);
  assert.equal(isPriceRangeActive({ maxPrice: 150 }), true);
  assert.equal(isPriceRangeActive({ minPrice: 50, maxPrice: 150 }), true);
});

test("a zero lower bound below the track's own floor is dropped", () => {
  // A shop whose cheapest item is 20 gets no filter from "at least 0", but the
  // bound must not be dropped merely for being falsy — 0 is a real number here.
  assert.deepEqual(resolvePriceRange(0, undefined, TRACK), {});
  assert.deepEqual(resolvePriceRange(0, undefined, { min: 0, max: 200 }), {});
  assert.deepEqual(resolvePriceRange(5, undefined, { min: 0, max: 200 }), {
    minPrice: 5,
  });
});
