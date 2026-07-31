import { propertyConfig, propertyMessages } from "@/generated/property";
import { routing } from "@/shared/i18n/routing";
import type { PropertyConfig, PropertyMessages } from "@/shared/property/types";

export type {
  PropertyAddress,
  PropertyConfig,
  PropertyContact,
  PropertyMessages,
  PropertySocial,
} from "@/shared/property/types";

function isPropertyConfig(value: unknown): value is PropertyConfig {
  if (typeof value !== "object" || value === null) return false;

  const candidate = value as Partial<PropertyConfig>;

  return (
    typeof candidate.slug === "string" &&
    candidate.slug.length > 0 &&
    candidate.theme === "default" &&
    typeof candidate.domain === "string" &&
    typeof candidate.siteUrl === "string" &&
    typeof candidate.name === "object" &&
    candidate.name !== null &&
    typeof candidate.businessType === "string" &&
    typeof candidate.priceCurrency === "string" &&
    typeof candidate.ogImage === "string" &&
    typeof candidate.address === "object" &&
    candidate.address !== null &&
    typeof candidate.contact === "object" &&
    candidate.contact !== null &&
    typeof candidate.social === "object" &&
    candidate.social !== null
  );
}

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

    return decoded;
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
