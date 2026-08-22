/**
 * The store configuration one container serves.
 *
 * Everything that identifies a single storefront lives here: no brand name,
 * phone number or handle belongs in `src/`. Vendra supplies it at container
 * startup as base64 JSON in `STOREFRONT_CONFIG_BASE64`, validated against
 * `config/storefront.schema.json`. `config/storefront.development.json` is the
 * same document, used only when running locally.
 *
 * Every field below is one Vendra actually sends — `StorefrontProvisionRequest`
 * supplies the identity four, `StorefrontConfigurationMap` the rest. Nothing is
 * declared here on the strength of a field the backend might add later: an
 * option the provisioner cannot set is not configuration, it is a constant
 * written in an indirect way.
 */
export interface StorefrontConfig {
  /** Vendra's identifier for the store, and the last-resort brand name. */
  slug: string;
  /** Public storefront domain. Must be an active tenant domain in Vendra — it is what the canonical API resolves the tenant from. */
  domain: string;
  /** Canonical public origin, no trailing slash. */
  siteUrl: string;
  /** Brand name per locale, for OG site name, title templates and JSON-LD. */
  name: Record<string, string>;
  /** schema.org business type for the Organization node, e.g. "Florist". */
  businessType: string;
  /** ISO 4217 code, used in Product JSON-LD offers and as the price label. */
  priceCurrency: string;
  /** Optional site-root-relative default social-share image. */
  ogImage?: string;
  /**
   * Optional per-locale message overrides, deep-merged over `messages/`.
   *
   * A store's copy travels inside `STOREFRONT_CONFIG_BASE64` because the shared
   * image has no per-store files to read from. Anything not overridden falls
   * through to the brand-neutral base catalogue in `messages/`.
   */
  messages?: StorefrontMessages;
  address: StorefrontAddress;
  contact: StorefrontContact;
  social: StorefrontSocial;
}

export interface StorefrontAddress {
  locality: string;
  /** ISO 3166-1 alpha-2 country code. */
  country: string;
}

export interface StorefrontContact {
  mobilePhone: string;
  officePhone: string;
  email: string;
  /** 24h, locale-neutral; formatted per locale in the UI. */
  hoursOpen: string;
  hoursClose: string;
  /** Map pin: "lat,lng" coordinates or a place query. */
  mapQuery: string;
}

export interface StorefrontSocial {
  /** International format, e.g. "+989129333034". */
  whatsappPhone: string;
  telegramUsername: string;
  instagramUsername: string;
}

/** Per-locale message overrides, deep-merged over the base `messages/`. */
export type StorefrontMessages = Record<string, Record<string, unknown>>;
