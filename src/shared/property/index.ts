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

/** Runtime property configuration, falling back to the bundled example locally. */
export const property: PropertyConfig = runtimeProperty() ?? propertyConfig;

/** Runtime storefronts use the brand-neutral catalogue; the example keeps its overrides. */
export const messageOverrides: PropertyMessages = process.env.STOREFRONT_CONFIG_BASE64
  ? {}
  : propertyMessages;

/** Brand name for a locale, falling back to the default locale then the slug. */
export function getPropertyName(locale: string): string {
  return (
    property.name[locale] ?? property.name[routing.defaultLocale] ?? property.slug
  );
}
