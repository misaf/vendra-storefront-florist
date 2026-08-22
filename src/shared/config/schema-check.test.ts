import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  checkAgainstSchema,
  isUnknownFieldError,
  type SchemaNode,
} from "./schema-check.ts";

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

test("reports fields the schema does not declare", () => {
  const config = validConfig();
  config.somethingInvented = "x";

  assert.deepEqual(checkAgainstSchema(config, schema), [
    "somethingInvented is not allowed",
  ]);
});

test("an undeclared field is separable from a real validation failure", () => {
  // Boot ignores the first and refuses to start on the second: Vendra deploys
  // independently and still sends `theme`, so a field this image does not know
  // must not take the container down — while a malformed email still must.
  const config = validConfig();
  config.theme = "default";
  (config.contact as Record<string, unknown>).email = "not-an-email";

  const errors = checkAgainstSchema(config, schema);
  const fatal = errors.filter((error) => !isUnknownFieldError(error));

  assert.deepEqual(errors.filter(isUnknownFieldError), ["theme is not allowed"]);
  assert.deepEqual(fatal, ["contact.email is not a valid email"]);
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

test("declares no field Vendra's provisioner cannot send", () => {
  // The schema is the storefront's half of a two-repository contract. A field
  // here that `StorefrontConfigurationMap` and `StorefrontProvisionRequest` do
  // not produce is not configuration — it is a constant nothing can ever set,
  // and it reads as a supported option to whoever finds it next.
  const provisioned = new Set([
    // StorefrontProvisionRequest::for(). `theme` is sent too, but is
    // deliberately not declared here: it belongs to a deploy-time design
    // selection this image no longer has, and boot ignores it as an unknown
    // field like any other.
    "slug",
    "domain",
    "siteUrl",
    // StorefrontConfigurationMap::FIELDS + messages
    "name",
    "businessType",
    "priceCurrency",
    "ogImage",
    "address",
    "contact",
    "social",
    "messages",
  ]);

  const declared = Object.keys(schema.properties ?? {});
  const unreachable = declared.filter((key) => !provisioned.has(key));

  assert.deepEqual(unreachable, []);
});
