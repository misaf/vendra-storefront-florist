import { property } from "@/shared/property";

function normalizeBaseUrl(value: string): string {
  return value.replace(/\/+$/, "");
}

/**
 * The deploy template passes the canonical API as an origin
 * (`VENDRA_API_URL=https://api.<base>`), while the storefront addresses
 * resources below `/api`. Accept either form.
 */
function withApiSegment(value: string): string {
  const base = normalizeBaseUrl(value);
  return base.endsWith("/api") ? base : `${base}/api`;
}

/**
 * Public, canonical origin of the storefront (no trailing slash), e.g.
 * "https://example.com". Used for canonical URLs, hreflang alternates,
 * sitemap/robots, Open Graph and JSON-LD — and as the Origin the canonical API
 * resolves this property's tenant from, so it must be the registered domain.
 * Defaults to the selected property's `siteUrl`.
 */
export function getSiteUrl(): string {
  return normalizeBaseUrl(
    process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || property.siteUrl
  );
}

export function getApiBaseUrl(): string {
  return withApiSegment(
    process.env.API_BASE_URL ||
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      process.env.VENDRA_API_URL ||
      process.env.NEXT_PUBLIC_VENDRA_API_URL ||
      "http://localhost/api"
  );
}

/** Media host. Defaults to the API origin, which serves `/storage`. */
export function getStorageBaseUrl(): string {
  const configured =
    process.env.STORAGE_BASE_URL || process.env.NEXT_PUBLIC_STORAGE_BASE_URL;

  return configured
    ? normalizeBaseUrl(configured)
    : getApiBaseUrl().replace(/\/api$/, "");
}

export interface ContactInfo {
  mobilePhone: string;
  officePhone: string;
  email: string;
  hoursOpen: string;
  hoursClose: string;
  mapQuery: string;
}

/**
 * Contact details for the selected property. Every field can still be
 * overridden per environment, which is what keeps one image usable for a
 * staging deployment of the same property.
 */
export function getContactInfo(): ContactInfo {
  const { contact } = property;

  return {
    mobilePhone: process.env.CONTACT_MOBILE_PHONE || contact.mobilePhone,
    officePhone: process.env.CONTACT_OFFICE_PHONE || contact.officePhone,
    email: process.env.CONTACT_EMAIL || contact.email,
    hoursOpen: process.env.CONTACT_HOURS_OPEN || contact.hoursOpen,
    hoursClose: process.env.CONTACT_HOURS_CLOSE || contact.hoursClose,
    mapQuery: process.env.CONTACT_MAP_QUERY || contact.mapQuery,
  };
}
