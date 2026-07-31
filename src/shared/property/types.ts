/**
 * The shape of `properties/<slug>/property.config.json`.
 *
 * Everything that identifies a single storefront lives here: no brand name,
 * phone number or handle belongs in `src/`. The selected property is resolved
 * at build time by `scripts/select-property.mjs`, which validates the file
 * against these fields before generating `src/generated/property.ts`.
 */
export interface PropertyConfig {
  /** Directory name under `properties/`, also used as the build identifier. */
  slug: string;
  /** Build-time storefront implementation selected from src/themes/<id>. */
  theme: string;
  /** Public storefront domain. Must be an active tenant domain in Vendra — it is what the canonical API resolves the tenant from. */
  domain: string;
  /** Canonical public origin, no trailing slash. */
  siteUrl: string;
  /** Brand name per locale, for OG site name, title templates and JSON-LD. */
  name: Record<string, string>;
  /** schema.org business type for the Organization node, e.g. "Florist". */
  businessType: string;
  /** ISO 4217 code used in Product JSON-LD offers. */
  priceCurrency: string;
  /** Site-root-relative default social-share image. */
  ogImage: string;
  address: PropertyAddress;
  contact: PropertyContact;
  social: PropertySocial;
}

export interface PropertyAddress {
  locality: string;
  /** ISO 3166-1 alpha-2 country code. */
  country: string;
}

export interface PropertyContact {
  mobilePhone: string;
  officePhone: string;
  email: string;
  /** 24h, locale-neutral; formatted per locale in the UI. */
  hoursOpen: string;
  hoursClose: string;
  /** Map pin: "lat,lng" coordinates or a place query. */
  mapQuery: string;
}

export interface PropertySocial {
  /** International format, e.g. "+989129333034". */
  whatsappPhone: string;
  telegramUsername: string;
  instagramUsername: string;
}

/** Per-locale message overrides, deep-merged over the base `messages/`. */
export type PropertyMessages = Record<string, Record<string, unknown>>;
