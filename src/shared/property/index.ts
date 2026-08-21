import developmentConfig from "../../../config/storefront.development.json";
import { routing } from "@/shared/i18n/routing";
import type { PropertyConfig, PropertyMessages } from "@/shared/property/types";
import { isPropertyConfig } from "@/shared/property/validation";

export type {
  PropertyAddress,
  PropertyCheckout,
  PropertyConfig,
  PropertyContact,
  PropertyCurrency,
  PropertyMessages,
  PropertySocial,
  PropertyTrustSeal,
} from "@/shared/property/types";

/**
 * The store this container serves, as supplied by Vendra at startup.
 *
 * This is the only path production uses. One image serves every store, so the
 * identity cannot be built in — it arrives base64-encoded in the environment and
 * is validated against `config/storefront.schema.json` before anything reads it.
 */
function runtimeProperty(): PropertyConfig | null {
  const encoded = process.env.STOREFRONT_CONFIG_BASE64?.trim();

  if (!encoded) return null;

  try {
    const decoded: unknown = JSON.parse(
      Buffer.from(encoded, "base64").toString("utf8")
    );

    if (!isPropertyConfig(decoded)) {
      throw new Error("configuration is missing required fields");
    }

    return decoded as PropertyConfig;
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
function fallbackProperty(): PropertyConfig {
  const isBuild = process.env.NEXT_PHASE === "phase-production-build";

  if (process.env.NODE_ENV === "production" && !isBuild) {
    throw new Error(
      "STOREFRONT_CONFIG_BASE64 is not set. A production storefront is " +
        "configured at runtime by Vendra; see README.md."
    );
  }

  return developmentConfig as PropertyConfig;
}

const runtime = runtimeProperty();

let resolved: PropertyConfig | null = null;

/**
 * The active store configuration.
 *
 * Resolved on first call rather than at module scope. Evaluating it eagerly made
 * merely *importing* this module throw, and it is reachable from the browser
 * bundle through ordinary shared helpers — `@/shared/api/client` pulls it in via
 * `@/shared/lib/config`. The client never reads it (api/client calls the
 * property-dependent getters only when `typeof window === "undefined"`), but the
 * import alone was enough: the page died at module evaluation with
 * "STOREFRONT_CONFIG_BASE64 is not set", which no runtime configuration fixed.
 *
 * Client components must not call this — the variable does not exist in the
 * browser, so it would throw there however the container is configured. Read the
 * store from `useProperty()`, which serves the same config through context.
 */
export function getProperty(): PropertyConfig {
  resolved ??= runtime ?? fallbackProperty();

  return resolved;
}

/**
 * Per-locale message overrides for the active store, deep-merged over the
 * brand-neutral base catalogue in `messages/`.
 *
 * A function rather than a constant so a production container never reads the
 * development fixture's copy: resolution follows the same rules as
 * `getProperty()`, including the refusal to boot unconfigured.
 */
export function getMessageOverrides(): PropertyMessages {
  return getProperty().messages ?? {};
}

/** Brand name for a locale, falling back to the default locale then the slug. */
export function getPropertyName(locale: string): string {
  const property = getProperty();

  return (
    property.name[locale] ?? property.name[routing.defaultLocale] ?? property.slug
  );
}
