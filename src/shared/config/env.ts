/**
 * Environment resolution for the API and storage origins.
 *
 * Pure module — no `@/` alias imports, no React, no store-configuration
 * lookup — so it can be loaded from `next.config.ts` (which runs before the
 * app's module graph exists), from runtime config, and from a plain
 * `node --test` run. This is the single source of truth for env precedence;
 * everything else reads through these helpers.
 *
 * Every name below is server-only, deliberately. A `NEXT_PUBLIC_` variable is
 * inlined into the browser bundle at build time, so a public alias for any of
 * these would freeze one store's API host, storage host or canonical origin
 * into the image the whole fleet shares. The browser needs none of them: reads
 * go through the same-origin `/api/proxy` and `/api/storage` routes, and the
 * proxy is what states this store's origin to the API on their behalf.
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
  const value = process.env.VENDRA_API_URL;

  return value ? withApiSegment(value) : null;
}

/** Media origin. Falls back to the API origin, which serves `/storage`. */
export function resolveStorageUrl(): string | null {
  const configured = process.env.STORAGE_BASE_URL;

  if (configured) return normalizeBaseUrl(configured);

  const apiUrl = resolveApiUrl();
  return apiUrl ? apiUrl.replace(/\/api$/, "") : null;
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
