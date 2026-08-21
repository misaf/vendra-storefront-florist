import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { checkAgainstSchema, type SchemaNode } from "./schema-check.ts";

const ROOT = join(import.meta.dirname, "..", "..", "..");
const read = (...parts: string[]) =>
  JSON.parse(readFileSync(join(ROOT, ...parts), "utf8"));

const schema: SchemaNode = read("config", "storefront.schema.json");
const devConfig = read("config", "storefront.development.json");

/** A minimal document that satisfies the real schema. */
function validConfig(): Record<string, unknown> {
  return structuredClone(devConfig);
}

test("the development fixture satisfies the real schema", () => {
  // If this fails, `npm run dev` boots into a config the runtime would reject.
  assert.deepEqual(checkAgainstSchema(devConfig, schema), []);
});

test("every required field is actually required", () => {
  for (const field of schema.required ?? []) {
    const config = validConfig();
    delete config[field];

    const errors = checkAgainstSchema(config, schema);
    assert.ok(
      errors.some((e) => e.startsWith(`${field} is required`)),
      `removing ${field} should be an error, got: ${errors.join("; ") || "none"}`
    );
  }
});

test("a blank required field counts as missing", () => {
  // A field present but empty is one someone meant to fill in; shipping it
  // would render an empty brand name.
  const config = validConfig();
  config.businessType = "";

  // It also trips minLength, which is fine — two reasons are more useful than
  // one. What matters is that "present but blank" does not pass as supplied.
  const errors = checkAgainstSchema(config, schema);
  assert.ok(
    errors.includes("businessType is required"),
    `expected a required error, got: ${errors.join("; ") || "none"}`
  );
});

test("accepts `theme` for provisioner compatibility, and ignores it", () => {
  // Vendra provisioners still send it; additionalProperties:false would
  // otherwise reject the whole config over a field nothing reads.
  const config = validConfig();
  config.theme = "default";

  assert.deepEqual(checkAgainstSchema(config, schema), []);
});

test("rejects fields the schema does not declare", () => {
  const config = validConfig();
  config.somethingInvented = "x";

  assert.deepEqual(checkAgainstSchema(config, schema), [
    "somethingInvented is not allowed",
  ]);
});

test("validates nested objects and reports a dotted path", () => {
  const config = validConfig();
  (config.contact as Record<string, unknown>).email = "not-an-email";

  assert.deepEqual(checkAgainstSchema(config, schema), [
    "contact.email is not a valid email",
  ]);
});

test("validates uri format on siteUrl", () => {
  const config = validConfig();
  config.siteUrl = "not a url";

  assert.deepEqual(checkAgainstSchema(config, schema), [
    "siteUrl is not a valid uri",
  ]);
});

test("enforces numeric bounds on checkout pricing", () => {
  const config = validConfig();
  config.checkout = { shippingFee: 0, taxRate: -1 };

  const errors = checkAgainstSchema(config, schema);
  assert.ok(errors.includes("checkout.shippingFee must be > 0"), errors.join("; "));
  assert.ok(errors.includes("checkout.taxRate must be >= 0"), errors.join("; "));
});

test("rejects a non-object config", () => {
  for (const value of [null, "a string", 42, ["an", "array"]]) {
    assert.deepEqual(checkAgainstSchema(value, schema), [
      "config must be an object",
    ]);
  }
});

test("reports every problem at once, not just the first", () => {
  // The script prints these before a store is provisioned; one at a time would
  // mean one round trip per typo.
  const errors = checkAgainstSchema({}, schema);
  assert.equal(errors.length, (schema.required ?? []).length);
});
