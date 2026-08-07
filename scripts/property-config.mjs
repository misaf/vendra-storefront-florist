#!/usr/bin/env node
/**
 * Emits a property's runtime configuration as the base64 blob the deployment
 * supplies to the container.
 *
 * One image serves the whole fleet, so a property is not baked in — it arrives
 * as `STOREFRONT_CONFIG_BASE64`. This is the bridge between the reviewable
 * `properties/<slug>/property.config.json` in git and the `.env` line the
 * Vendra deploy side renders (`bin/stack property add`). Message overrides in
 * `properties/<slug>/messages/*.json` are folded in, because a runtime property
 * has no per-tenant files on disk to read them from.
 *
 * Usage:
 *   node scripts/property-config.mjs <slug>          # STOREFRONT_CONFIG_BASE64=…
 *   node scripts/property-config.mjs <slug> --raw    # the base64 only
 *   node scripts/property-config.mjs <slug> --json   # the merged JSON, pretty
 */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { validatePropertyConfig } from "./validate-property.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PROPERTIES_DIR = join(ROOT, "properties");
const SCHEMA_FILE = join(PROPERTIES_DIR, "schema.json");

function fail(message) {
  console.error(`[property-config] ${message}`);
  process.exit(1);
}

function listProperties() {
  if (!existsSync(PROPERTIES_DIR)) fail(`No properties/ directory at ${PROPERTIES_DIR}.`);

  return readdirSync(PROPERTIES_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

function readMessages(slug) {
  const messagesDir = join(PROPERTIES_DIR, slug, "messages");

  if (!existsSync(messagesDir)) return null;

  const messages = {};

  for (const file of readdirSync(messagesDir).sort()) {
    if (!file.endsWith(".json")) continue;

    const locale = file.replace(/\.json$/, "");

    try {
      messages[locale] = JSON.parse(readFileSync(join(messagesDir, file), "utf8"));
    } catch (error) {
      fail(`Could not parse properties/${slug}/messages/${file}: ${error.message}`);
    }
  }

  return Object.keys(messages).length > 0 ? messages : null;
}

const args = process.argv.slice(2);
const flags = new Set(args.filter((arg) => arg.startsWith("--")));
const requested = args.find((arg) => !arg.startsWith("--"));
const available = listProperties();
const slug = requested ?? (available.length === 1 ? available[0] : undefined);

if (!slug) {
  fail(
    available.length === 0
      ? "properties/ is empty — add properties/<slug>/property.config.json."
      : `Pass a slug. Available: ${available.join(", ")}.`
  );
}

if (!available.includes(slug)) {
  fail(`Unknown property "${slug}". Available: ${available.join(", ") || "none"}.`);
}

const configPath = join(PROPERTIES_DIR, slug, "property.config.json");

if (!existsSync(configPath)) fail(`Missing ${configPath}.`);

let config;

try {
  config = JSON.parse(readFileSync(configPath, "utf8"));
} catch (error) {
  fail(`Could not parse ${configPath}: ${error.message}`);
}

const messages = readMessages(slug);

if (messages) config.messages = messages;

// Validate the merged document, not the file on disk: this is exactly what the
// container will decode, and the runtime check applies the same schema.
const schema = JSON.parse(readFileSync(SCHEMA_FILE, "utf8"));
const errors = validatePropertyConfig(config, schema);

if (errors.length > 0) {
  fail(`properties/${slug} is invalid:\n  - ${errors.join("\n  - ")}`);
}

if (config.slug !== slug) {
  fail(`properties/${slug}/property.config.json declares slug "${config.slug}".`);
}

if (flags.has("--json")) {
  console.log(JSON.stringify(config, null, 2));
  process.exit(0);
}

const encoded = Buffer.from(JSON.stringify(config), "utf8").toString("base64");

console.log(flags.has("--raw") ? encoded : `STOREFRONT_CONFIG_BASE64=${encoded}`);
