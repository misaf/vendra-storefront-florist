import { propertyConfig, propertyMessages } from "@/generated/property";
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

function bundledProperty(): PropertyConfig {
  // One image serves the whole fleet, so a production container with no runtime
  // configuration would silently serve whichever property happened to be bundled
  // at build time — another tenant's brand, under this tenant's domain. Refusing
  // to boot is the lesser failure.
  //
  // The build itself is exempt: `next build` runs with NODE_ENV=production and
  // legitimately has no runtime config, since the image is built once for every
  // property. Only a running container must insist on one.
  const isBuild = process.env.NEXT_PHASE === "phase-production-build";

  if (process.env.NODE_ENV === "production" && !isBuild) {
    throw new Error(
      "STOREFRONT_CONFIG_BASE64 is not set. A production storefront must be " +
        "configured at runtime; see DEPLOYMENT.md."
    );
  }

  return propertyConfig;
}

const runtime = runtimeProperty();

let resolved: PropertyConfig | null = null;

/**
 * Runtime property configuration, falling back to the bundled example locally.
 *
 * Resolved on first call rather than at module scope. Evaluating it eagerly made
 * merely *importing* this module throw, and it is reachable from the browser
 * bundle through ordinary shared helpers — `cn()` in @/shared/lib/utils, and
 * @/shared/api/client via @/shared/lib/config. Neither reads the property in the
 * browser (api/client calls the property-dependent getters only when
 * `typeof window === "undefined"`), but the import alone was enough: the page
 * died at module evaluation with "STOREFRONT_CONFIG_BASE64 is not set", which no
 * amount of runtime configuration could fix.
 *
 * Client components must not call this — the variable does not exist in the
 * browser, so it would throw there however the container is configured. Read the
 * property from `useProperty()`, which serves the same config through context.
 */
export function getProperty(): PropertyConfig {
  resolved ??= runtime ?? bundledProperty();

  return resolved;
}

/**
 * Per-locale message overrides for the active property.
 *
 * A runtime property carries its own inside the encoded config; a build-time one
 * reads `properties/<slug>/messages/`. Either way an unconfigured key falls
 * through to the brand-neutral base catalogue in `messages/`.
 */
export const messageOverrides: PropertyMessages =
  (runtime ? runtime.messages : propertyMessages) ?? {};

/** Brand name for a locale, falling back to the default locale then the slug. */
export function getPropertyName(locale: string): string {
  const property = getProperty();

  return (
    property.name[locale] ?? property.name[routing.defaultLocale] ?? property.slug
  );
}
