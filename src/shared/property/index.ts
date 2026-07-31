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

/**
 * The property this build serves, selected by `scripts/select-property.mjs`.
 *
 * Safe to import from client components: the config is a static import, so it
 * is bundled rather than read from the filesystem at runtime.
 */
export const property: PropertyConfig = propertyConfig;

/** Per-locale message overrides for this property. */
export const messageOverrides: PropertyMessages = propertyMessages;

/** Brand name for a locale, falling back to the default locale then the slug. */
export function getPropertyName(locale: string): string {
  return (
    property.name[locale] ?? property.name[routing.defaultLocale] ?? property.slug
  );
}
