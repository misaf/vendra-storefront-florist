/**
 * Storefront presentation imagery for catalogue categories.
 *
 * Purely a presentation asset owned by this storefront. The category itself —
 * its id, slug, localized name, product membership and ordering — always comes
 * from the Vendra catalogue API and is never duplicated here. This map answers one presentation question:
 * *which picture does this storefront show for the category whose slug is X*, and
 * only when the shop has attached no media of its own in the catalogue.
 *
 * Keys are the catalogue's stable English slug. Values are files in `public/`.
 * A slug with no entry falls through to the drawn botanical tile
 * (`CategoryImageFallback`) rather than to a stand-in photograph, because a
 * single stock picture repeated across the seven categories that currently
 * carry no media reads as a fault, not as merchandising.
 *
 * Adding a photograph is a one-line change here plus the file. Nothing else in
 * the storefront needs to know.
 */
const THEME_CATEGORY_IMAGES: Record<string, string> = {};

/**
 * The picture for a category, or `null` to draw the fallback tile.
 *
 * The catalogue's own media wins: the shop's picture for its category always
 * beats anything the theme ships.
 */
export function resolveCategoryImage(
  slug: string,
  apiImage?: string | null
): string | null {
  if (apiImage) return apiImage;
  return THEME_CATEGORY_IMAGES[slug] ?? null;
}
