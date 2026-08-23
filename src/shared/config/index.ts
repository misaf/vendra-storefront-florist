import { getStorefrontConfig } from "@/shared/config/storefront";
import {
  resolveApiUrl,
  resolveStorageUrl,
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
  return getStorefrontConfig().siteUrl.replace(/\/+$/, "");
}

export function getApiBaseUrl(): string {
  const apiUrl = resolveApiUrl();
  if (apiUrl) return apiUrl;

  const isBuild = process.env.NEXT_PHASE === "phase-production-build";
  if (process.env.NODE_ENV === "production" && !isBuild) {
    throw new Error(
      "VENDRA_API_URL is not set. A production storefront requires the " +
        "canonical Vendra API origin; see README.md."
    );
  }

  return "http://localhost/api";
}

/** Media host. Defaults to the API origin, which serves `/storage`. */
export function getStorageBaseUrl(): string {
  return resolveStorageUrl() ?? getApiBaseUrl().replace(/\/api$/, "");
}
