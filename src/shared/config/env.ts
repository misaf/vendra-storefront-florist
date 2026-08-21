/**
 * Environment resolution for the API and storage origins.
 *
 * Pure module — no `@/` alias imports, no React, no property lookup — so it can
 * be loaded from `next.config.ts` (which runs before the app's module graph
 * exists), from runtime config, and from a plain `node --test` run. This is the
 * single source of truth for env precedence; everything else reads through
 * these helpers.
 *
 * Every name below is server-only, deliberately. A `NEXT_PUBLIC_` variable is
 * inlined into the browser bundle at build time, so a public alias for any of
 * these would freeze one store's API host, storage host or canonical origin
 * into the image the whole fleet shares. The browser needs none of them: reads
 * go through the same-origin `/api/proxy` and `/api/storage` routes.
 */

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

/** Canonical API origin (with `/api` suffix), or null when unset. */
export function resolveApiUrl(): string | null {
  const value = process.env.API_BASE_URL || process.env.VENDRA_API_URL;

  return value ? withApiSegment(value) : null;
}

/** Media origin. Falls back to the API origin, which serves `/storage`. */
export function resolveStorageUrl(): string | null {
  const configured = process.env.STORAGE_BASE_URL;

  if (configured) return normalizeBaseUrl(configured);

  const apiUrl = resolveApiUrl();
  return apiUrl ? apiUrl.replace(/\/api$/, "") : null;
}

/** Public, canonical origin of the storefront (no trailing slash), or null. */
export function resolveSiteUrl(): string | null {
  const value = process.env.SITE_URL;
  return value ? normalizeBaseUrl(value) : null;
}

/**
 * Per-storefront credential the canonical API resolves the tenant from.
 *
 * Deliberately opaque: an API key, an HMAC token or a JWT all fit, so the
 * backend can settle on a mechanism without a storefront change. Server-only —
 * there is no `NEXT_PUBLIC_` variant, and there must never be one, because a
 * credential in the client bundle is a credential the fleet has published.
 */
export function resolveStorefrontKey(): string | null {
  return process.env.VENDRA_STOREFRONT_KEY?.trim() || null;
}

/** Header carrying the storefront credential. */
export function resolveStorefrontKeyHeader(): string {
  return process.env.VENDRA_STOREFRONT_KEY_HEADER?.trim() || "X-Storefront-Key";
}

/** Hostname from an origin URL, or the fallback when unparsable. */
export function hostnameOf(url: string | undefined, fallback: string): string {
  if (!url) return fallback;
  try {
    return new URL(url).hostname;
  } catch {
    return fallback;
  }
}
