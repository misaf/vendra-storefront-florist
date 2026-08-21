import { getProperty } from "@/shared/property";
import {
  resolveApiUrl,
  resolveSiteUrl,
  resolveStorageUrl,
  resolveStorefrontKey,
  resolveStorefrontKeyHeader,
} from "@/shared/config/env";

/**
 * Public, canonical origin of the storefront (no trailing slash), e.g.
 * "https://example.com". Used for canonical URLs, hreflang alternates,
 * sitemap/robots, Open Graph and JSON-LD — and as the Origin the canonical API
 * resolves this property's tenant from, so it must be the registered domain.
 * Defaults to the selected property's `siteUrl`.
 */
export function getSiteUrl(): string {
  return resolveSiteUrl() ?? getProperty().siteUrl;
}

export function getApiBaseUrl(): string {
  return resolveApiUrl() ?? "http://localhost/api";
}

/** Media host. Defaults to the API origin, which serves `/storage`. */
export function getStorageBaseUrl(): string {
  return resolveStorageUrl() ?? getApiBaseUrl().replace(/\/api$/, "");
}

/**
 * This storefront's credential for the canonical API, or null when unset.
 *
 * Every property calls one API host, so the request Host no longer identifies
 * the tenant and an unverified origin must not be trusted to. This is the
 * server-validated channel that identity is meant to come from. Never send it
 * from the browser: server renders attach it directly, browser reads reach the
 * API only through the same-origin proxy, which attaches it on their behalf.
 */
export function getStorefrontKey(): string | null {
  return resolveStorefrontKey();
}

/** Header name the credential travels in. */
export function getStorefrontKeyHeader(): string {
  return resolveStorefrontKeyHeader();
}

/** Registered tenant domain for this property. */
export function getStorefrontDomain(): string {
  return getProperty().domain;
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
 * Contact details for the active store.
 *
 * Straight from the store configuration Vendra supplies — there is deliberately
 * no `CONTACT_*` environment override. Those existed when identity was chosen at
 * build time and a deployment needed a way to amend it; now the configuration is
 * itself a runtime input, so an override could only ever let a container
 * contradict Vendra about a store's own phone number.
 */
export function getContactInfo(): ContactInfo {
  return { ...getProperty().contact };
}
