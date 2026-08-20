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
  /** Optional site-root-relative default social-share image. */
  ogImage?: string;
  /** Optional site-root-relative hero image. Defaults to the theme's own. */
  heroImage?: string;
  /** Optional site-root-relative About/newsletter image. Defaults to the theme's own. */
  aboutImage?: string;
  /**
   * Optional per-locale message overrides, deep-merged over `messages/`.
   *
   * This is how a runtime property supplies its own copy: it travels inside
   * `STOREFRONT_CONFIG_BASE64` because the shared image has no per-tenant files
   * to read from. Build-time properties use `properties/<slug>/messages/` instead.
   */
  messages?: PropertyMessages;
  address: PropertyAddress;
  contact: PropertyContact;
  social: PropertySocial;
  /** Optional checkout pricing. Defaults to the demo constants when unset. */
  checkout?: PropertyCheckout;
  /** Optional currency overrides. Defaults to `priceCurrency` + per-locale label. */
  currency?: PropertyCurrency;
  /** Optional Iranian trust seal (enamad). Hidden when unset. */
  trustSeal?: PropertyTrustSeal;
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

export interface PropertyCheckout {
  /** Fixed delivery fee in `priceCurrency`. Defaults to 10. */
  shippingFee?: number;
  /** Tax rate as a fraction of the subtotal (0.1 = 10%). Defaults to 0.1. */
  taxRate?: number;
}

export interface PropertyCurrency {
  /** ISO 4217 code used for formatting, e.g. "IRR". Defaults to `priceCurrency`. */
  code?: string;
  /** Per-locale display label, e.g. { fa: "تومان", en: "IRR" }. */
  label?: Record<string, string>;
}

export interface PropertyTrustSeal {
  /** Trust seal id, e.g. the enamad id. */
  id: string;
  /** Trust seal code, e.g. the enamad code. */
  code: string;
}

/** Per-locale message overrides, deep-merged over the base `messages/`. */
export type PropertyMessages = Record<string, Record<string, unknown>>;
