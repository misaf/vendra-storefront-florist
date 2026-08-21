/**
 * What the browser is allowed to read through `/api/proxy`.
 *
 * That hop attaches the storefront credential, so whatever it forwards is
 * requested *as this storefront*. Without a list it was a credentialed relay for
 * any GET the canonical API exposes — and catch-all route segments arrive
 * URL-decoded, so `%2e%2e` could also walk out of the `/api` prefix entirely.
 *
 * Pure and dependency-free so the rule can be tested directly, without a
 * running server or a store configuration.
 */

/** Collections the storefront's own client code already reads. */
export const ALLOWED_COLLECTIONS: ReadonlySet<string> = new Set([
  "catalog/products",
  "catalog/product-categories",
  "content/blog-posts",
  "content/blog-post-categories",
  "content/faqs",
  "content/faq-categories",
]);

/**
 * A single record id or slug: no separators, no leading dot, nothing that can
 * re-enter path resolution.
 */
const RESOURCE_ID = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;

/**
 * The upstream path for a proxied request, or null when it is not one the
 * storefront may make. Accepts `<collection>` and `<collection>/<id>` only.
 *
 * Adding a data source is a deliberate line in ALLOWED_COLLECTIONS, never an
 * accident of a new fetch call somewhere in the app.
 */
export function resolveUpstreamPath(
  segments: readonly string[] | undefined
): string | null {
  if (!segments || segments.length < 2 || segments.length > 3) return null;

  const collection = `${segments[0]}/${segments[1]}`;
  if (!ALLOWED_COLLECTIONS.has(collection)) return null;

  if (segments.length === 2) return collection;

  const id = segments[2];
  if (!RESOURCE_ID.test(id)) return null;

  return `${collection}/${encodeURIComponent(id)}`;
}
