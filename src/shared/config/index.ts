import { getStorefrontConfig } from "@/shared/config/storefront";
import {
  resolveApiUrl,
  resolveSiteUrl,
  resolveStorageUrl,
  resolveStorefrontKey,
  resolveStorefrontKeyHeader,
} from "@/shared/config/env";

/**
 * The effective values the app runs on, resolved from two inputs: the
 * infrastructure origins in the environment (`./env`) and the store
 * configuration Vendra supplies (`./storefront`).
 *
 * The split matters. `./env` is estate-wide plumbing every container in the
 * fleet shares; `./storefront` is the one store this container serves. This
 * module is where a caller stops caring which of the two an answer came from.
 */

/**
 * Public, canonical origin of the storefront (no trailing slash), e.g.
 * "https://example.com". Used for canonical URLs, hreflang alternates,
 * sitemap/robots, Open Graph and JSON-LD — and as the Origin the canonical API
 * resolves this store's tenant from, so it must be the registered domain.
 * Defaults to the runtime store configuration's `siteUrl`.
 */
export function getSiteUrl(): string {
  return resolveSiteUrl() ?? getStorefrontConfig().siteUrl;
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
 * Every store calls one API host, so the request Host no longer identifies
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

/** Registered tenant domain for this store. */
export function getStorefrontDomain(): string {
  return getStorefrontConfig().domain;
}
