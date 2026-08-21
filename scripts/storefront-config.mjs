#!/usr/bin/env node
/**
 * Encodes a storefront configuration as the base64 blob a container runs on.
 *
 * One image serves every store, so a store is never built in — it arrives as
 * `STOREFRONT_CONFIG_BASE64`. Vendra renders that value itself when it
 * provisions a container; this script is the manual equivalent, for local
 * development and for operators registering a store by hand.
 *
 * Usage:
 *   node scripts/storefront-config.mjs                 # the development fixture
 *   node scripts/storefront-config.mjs <path.json>     # any config document
 *   node scripts/storefront-config.mjs --raw           # the base64 only
 *   node scripts/storefront-config.mjs --json          # the validated JSON, pretty
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
// Node strips the types: one checker serves the app and this script.
import { checkAgainstSchema } from "../src/shared/property/schema-check.ts";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SCHEMA_FILE = join(ROOT, "config", "storefront.schema.json");
const DEFAULT_CONFIG = join(ROOT, "config", "storefront.development.json");

function fail(message) {
  console.error(`[storefront-config] ${message}`);
  process.exit(1);
}

function readJson(path, label) {
  if (!existsSync(path)) fail(`Missing ${label} at ${path}.`);

  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch (error) {
    fail(`Could not parse ${path}: ${error.message}`);
  }
}

const args = process.argv.slice(2);
const flags = new Set(args.filter((arg) => arg.startsWith("--")));
const requested = args.find((arg) => !arg.startsWith("--"));
const configPath = requested ? resolve(requested) : DEFAULT_CONFIG;

const config = readJson(configPath, "config");
const schema = readJson(SCHEMA_FILE, "schema");

// Validate exactly what the container will decode. The runtime applies the same
// schema on boot, so a config that fails here would fail there — better to find
// out before a store is provisioned than after it refuses to start.
const errors = checkAgainstSchema(config, schema);

if (errors.length > 0) {
  fail(`${configPath} is invalid:\n  - ${errors.join("\n  - ")}`);
}

if (flags.has("--json")) {
  console.log(JSON.stringify(config, null, 2));
  process.exit(0);
}

const encoded = Buffer.from(JSON.stringify(config), "utf8").toString("base64");

console.log(flags.has("--raw") ? encoded : `STOREFRONT_CONFIG_BASE64=${encoded}`);
