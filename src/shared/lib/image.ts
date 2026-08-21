export const PLACEHOLDER_IMAGE = "/placeholder-product.svg";
export const DARK_PLACEHOLDER_IMAGE = "/placeholder-product-dark.svg";

export function isPlaceholderImage(
  imageUrl: string | null | undefined
): boolean {
  return imageUrl === PLACEHOLDER_IMAGE || imageUrl === DARK_PLACEHOLDER_IMAGE;
}

function getStorageRelativePath(pathname: string): string | null {
  const normalized = pathname.replace(/^\/+/, "");
  if (!normalized.startsWith("storage/")) {
    return null;
  }

  const relativePath = normalized.slice("storage/".length);
  return relativePath || null;
}

function toStorageProxyUrl(relativePath: string, search = ""): string {
  return `/api/storage/${relativePath}${search}`;
}

export function toAbsoluteStorageUrl(path: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    try {
      const url = new URL(path);
      const relativePath = getStorageRelativePath(url.pathname);
      if (!relativePath) {
        return path;
      }

      return toStorageProxyUrl(relativePath, url.search);
    } catch {
      return path;
    }
  }

  if (path.startsWith("/storage/")) {
    const relativePath = getStorageRelativePath(path);
    return relativePath ? toStorageProxyUrl(relativePath) : path;
  }

  if (path.startsWith("storage/")) {
    const relativePath = getStorageRelativePath(path);
    return relativePath ? toStorageProxyUrl(relativePath) : path;
  }

  return path;
}

export function normalizeImageUrl(imageUrl: string | null | undefined): string {
  if (!imageUrl) {
    return PLACEHOLDER_IMAGE;
  }

  return toAbsoluteStorageUrl(imageUrl);
}

/**
 * The renditions the media library generates, smallest first. A caller states
 * the *smallest* rendition that will still look right where it is drawn, and
 * the largest generated one at or above it is used.
 */
const MEDIA_CONVERSION_LADDER = [
  "thumb-table",
  "small",
  "medium",
  "large",
  "extra-large",
] as const;

export type MediaSize = (typeof MEDIA_CONVERSION_LADDER)[number];

/**
 * The conversion to request for a given intent.
 *
 * `card` covers every tile in a grid or rail (drawn at 130–330 CSS px, so 500px
 * of source carries a 2x screen); `full` covers the product page's gallery.
 */
export const MEDIA_SIZE_CARD: MediaSize = "medium";
export const MEDIA_SIZE_FULL: MediaSize = "extra-large";

/**
 * The best generated conversion at or above `minimum`, falling back down the
 * ladder when the backend generated nothing that large.
 */
function pickConversionName(
  conversions: Record<string, unknown>,
  minimum: MediaSize
): string | null {
  const floor = MEDIA_CONVERSION_LADDER.indexOf(minimum);
  const atOrAbove = MEDIA_CONVERSION_LADDER.slice(floor).find(
    (candidate) => conversions[candidate]
  );
  if (atOrAbove) return atOrAbove;

  // Nothing that large exists — take the largest that does rather than none.
  for (let index = floor - 1; index >= 0; index -= 1) {
    const candidate = MEDIA_CONVERSION_LADDER[index];
    if (conversions[candidate]) return candidate;
  }

  return null;
}

/** Normalized fields a Spatie media resource exposes for URL building. */
export interface MediaUrlFields {
  url?: string | null;
  uuid?: string | null;
  fileName?: string | null;
  name?: string | null;
  conversions?: Record<string, unknown> | null;
}

/**
 * Build a storage URL from a Spatie media-library resource.
 *
 * A generated conversion is preferred over the resource's own `url`, because
 * that URL is the *original upload* — a 3000x4000 camera JPEG, ~1.5MB, which
 * was being served into 130px catalogue tiles. The same picture as a `medium`
 * conversion is 500x670 and 19KB. `url` remains the fallback for a resource the
 * library never converted (and supplies nothing else to build a path from).
 */
export function buildMediaUrl(
  fields: MediaUrlFields | null | undefined,
  size: MediaSize = MEDIA_SIZE_FULL
): string | null {
  if (!fields) return null;
  const { url, uuid, fileName, name, conversions } = fields;

  if (uuid) {
    const conversionName = pickConversionName(conversions ?? {}, size);
    const baseName =
      fileName?.replace(/\.[^/.]+$/, "") || name?.replace(/-v\d+$/, "");

    if (conversionName && baseName) {
      return toAbsoluteStorageUrl(
        `storage/${uuid}/conversions/${baseName}-${conversionName}.webp`
      );
    }
  }

  if (url) return toAbsoluteStorageUrl(url);
  if (!uuid) return null;

  return fileName ? toAbsoluteStorageUrl(`storage/${uuid}/${fileName}`) : null;
}
