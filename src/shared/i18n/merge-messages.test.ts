import test from "node:test";
import assert from "node:assert/strict";
import { mergeMessages } from "./merge-messages.ts";

test("a store's override wins over the base string", () => {
  const merged = mergeMessages(
    { home: { title: "Online Store", subtitle: "Neutral" } },
    { home: { title: "Houshang Flowers" } }
  );

  assert.deepEqual(merged, {
    home: { title: "Houshang Flowers", subtitle: "Neutral" },
  });
});

test("anything a store does not restate falls through to the base", () => {
  const base = { home: { a: "1", b: "2" }, faq: { c: "3" } };
  const merged = mergeMessages(base, { home: { a: "one" } });

  assert.equal(merged.faq, base.faq, "untouched namespaces pass through");
  assert.deepEqual(merged.home, { a: "one", b: "2" });
});

test("merges at any depth, not just the top level", () => {
  const merged = mergeMessages(
    { a: { b: { c: { d: "base", e: "keep" } } } },
    { a: { b: { c: { d: "override" } } } }
  );

  assert.deepEqual(merged, { a: { b: { c: { d: "override", e: "keep" } } } });
});

test("does not mutate the base catalogue", () => {
  // The base is a module-level import shared across requests; mutating it would
  // leak one store's copy into the next render.
  const base = { home: { title: "Online Store" } };
  const snapshot = structuredClone(base);

  mergeMessages(base, { home: { title: "Somewhere Else" } });

  assert.deepEqual(base, snapshot);
});

test("an override of a different shape replaces the base outright", () => {
  // A store that replaces a group with a string means it; keeping the base's
  // subtree would render a mix of two stores' copy.
  assert.deepEqual(mergeMessages({ a: { b: "1" } }, { a: "flat" }), {
    a: "flat",
  });
  assert.deepEqual(mergeMessages({ a: "flat" }, { a: { b: "1" } }), {
    a: { b: "1" },
  });
});

test("arrays replace rather than merge", () => {
  assert.deepEqual(mergeMessages({ a: ["x", "y"] }, { a: ["z"] }), {
    a: ["z"],
  });
});

test("empty overrides return the base unchanged", () => {
  const base = { home: { title: "Online Store" } };
  assert.deepEqual(mergeMessages(base, {}), base);
});
