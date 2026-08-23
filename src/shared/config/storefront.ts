import "server-only";

import developmentConfig from "../../../config/storefront.development.json";
import schema from "../../../config/storefront.schema.json";
import { routing } from "@/shared/i18n/routing";
import {
  checkAgainstSchema,
  isUnknownFieldError,
  type SchemaNode,
} from "@/shared/config/schema-check";
import type {
  StorefrontConfig,
  StorefrontMessages,
} from "@/shared/config/types";

/**
 * Resolution of the store configuration this container serves.
 *
 * Server-only in practice: it reads `process.env`, which does not exist in the
 * browser. Client components read the same document through
 * `StorefrontConfigProvider`, handed down from the root layout's server render.
 */

/**
 * Validate an unknown config against `config/storefront.schema.json`.
 *
 * Strict: an undeclared field is an error. That is what
 * `scripts/storefront-config.mjs` wants, where a config is being *authored* and
 * an unrecognised key is a typo worth catching before a store is provisioned.
 * Boot applies a laxer policy — see `runtimeConfig()`.
 */
export function validateStorefrontConfig(value: unknown): string[] {
  return checkAgainstSchema(value, schema as SchemaNode);
}

/**
 * The store this container serves, as supplied by Vendra at startup.
 *
 * This is the only path production uses. One image serves every store, so the
 * identity cannot be built in — it arrives base64-encoded in the environment and
 * is validated against `config/storefront.schema.json` before anything reads it.
 */
function runtimeConfig(): StorefrontConfig | null {
  const encoded = process.env.STOREFRONT_CONFIG_BASE64?.trim();

  if (!encoded) return null;

  try {
    const decoded: unknown = JSON.parse(
      Buffer.from(encoded, "base64").toString("utf8")
    );

    /*
     | A field the schema does not declare is reported, not fatal.
     |
     | This is the receiving end of a two-repository contract, and the two ship
     | separately. Vendra already sends one field this image ignores (`theme`,
     | left over from when a storefront picked a design at deploy time), and
     | rejecting the document over it would take the whole fleet down for a
     | backend change that concerns none of it. Anything the schema *does*
     | declare is still strict: a malformed email or a missing domain is a
     | storefront that would render wrong, and that is worth refusing to boot
     | over.
     */
    const errors = validateStorefrontConfig(decoded);
    const fatal = errors.filter((error) => !isUnknownFieldError(error));

    if (fatal.length > 0) {
      throw new Error(fatal.join("; "));
    }

    for (const error of errors) {
      console.warn(`[storefront-config] ignoring unknown field: ${error}`);
    }

    return decoded as StorefrontConfig;
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown error";
    throw new Error(`Invalid STOREFRONT_CONFIG_BASE64: ${message}`);
  }
}

/**
 * The development fixture, so a fresh clone runs with `npm run dev` alone.
 *
 * It is deliberately the same shape as the runtime blob — decode
 * `STOREFRONT_CONFIG_BASE64` and you get this document — so development
 * exercises the production code path rather than a parallel one.
 *
 * Production never reaches it: a container with no runtime configuration would
 * otherwise serve the fixture's brand under a real store's domain, so refusing
 * to boot is the lesser failure. The build itself is exempt — `next build` runs
 * with NODE_ENV=production and legitimately has no store, because the image is
 * built once for the whole fleet.
 */
function fallbackConfig(): StorefrontConfig {
  const isBuild = process.env.NEXT_PHASE === "phase-production-build";

  if (process.env.NODE_ENV === "production" && !isBuild) {
    throw new Error(
      "STOREFRONT_CONFIG_BASE64 is not set. A production storefront is " +
        "configured at runtime by Vendra; see README.md."
    );
  }

  return developmentConfig as StorefrontConfig;
}

const runtime = runtimeConfig();

let resolved: StorefrontConfig | null = null;

/**
 * The active store configuration.
 *
 * Resolve lazily so build-time module discovery can import server modules
 * without selecting the development fixture or requiring a store identity.
 * Runtime requests still fail closed in production when Vendra has not
 * provisioned the container.
 *
 * This module is guarded by `server-only`. Client components read the serialized
 * store from `useStorefrontConfig()` instead.
 */
export function getStorefrontConfig(): StorefrontConfig {
  resolved ??= runtime ?? fallbackConfig();

  return resolved;
}

/**
 * Per-locale message overrides for the active store, deep-merged over the
 * brand-neutral base catalogue in `messages/`.
 *
 * A function rather than a constant so a production container never reads the
 * development fixture's copy: resolution follows the same rules as
 * `getStorefrontConfig()`, including the refusal to boot unconfigured.
 */
export function getMessageOverrides(): StorefrontMessages {
  return getStorefrontConfig().messages ?? {};
}

/** Brand name for a locale, falling back to the default locale then the slug. */
export function getStorefrontName(locale: string): string {
  const config = getStorefrontConfig();

  return (
    config.name[locale] ?? config.name[routing.defaultLocale] ?? config.slug
  );
}
