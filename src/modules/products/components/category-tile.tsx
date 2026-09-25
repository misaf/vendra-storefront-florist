import Image from "next/image";
import { DynamicText } from "@/shared/components/dynamic-text";
import { Link } from "@/shared/i18n/navigation";
import { normalizeImageUrl } from "@/shared/lib/utils";
import { resolveCategoryImage } from "../lib/category-images";
import type { ProductCategory } from "../types";
import { CategoryImageFallback } from "./category-image-fallback";

/**
 * The catalogue's picture for a category, or `null` to draw the fallback tile.
 * Exported because callers decide layout from it — the home page leads its
 * discovery band with categories that actually have a photograph.
 */
export function getCategoryTileImage(category: ProductCategory): string | null {
  const source = resolveCategoryImage(category.slug, category.image);
  return source ? normalizeImageUrl(source) : null;
}

/**
 * Catalogue images come from the API's storage host through the same-origin
 * proxy, which `/_next/image` cannot resolve (see next.config.ts), so those
 * stay unoptimized exactly as the product tiles do. Bundled art lives in
 * `public/` and is optimized normally, so the flag is decided per source rather
 * than once for the whole grid.
 */
function isProxiedStorageImage(src: string): boolean {
  return src.startsWith("/api/storage/");
}

interface CategoryTileProps {
  category: ProductCategory;
  /** Rendered `sizes` for the tile image, matched to the caller's grid. */
  sizes: string;
  /** Tailwind aspect utility for the image frame, e.g. `aspect-[5/4]`. */
  aspect?: string;
  /** Varies the drawn fallback's wash; the tile's index is the natural value. */
  tone?: number;
  /** Feature tiles caption themselves with the catalogue's own description. */
  showDescription?: boolean;
  /** An editorial arch for image-led home-page collection cards. */
  shape?: "soft" | "arch";
}

/**
 * One image-led link into a catalogue category, shared by the home page's
 * discovery band and the about page's closing band.
 *
 * Image-led because flowers are chosen by eye: the picture is the tile and the
 * name sits under it. Not over it — this shop's category photography is
 * high-key, white anthurium against white, and overlaid text needs a scrim
 * heavy enough to bruise the very picture it is being read against. Underneath,
 * the name sits on the page's own porcelain and stays legible against every
 * asset the catalogue can return.
 *
 * Deliberately no product count. A category holding thirteen stems reads as a
 * shop running dry, which is both discouraging and beside the point: the
 * question here is *what kind of flowers*, and the count belongs on the listing
 * page where it describes a result set the shopper is working through.
 */
export function CategoryTile({
  category,
  sizes,
  aspect = "aspect-[5/4]",
  tone = 0,
  showDescription = false,
  shape = "soft",
}: CategoryTileProps) {
  const src = getCategoryTileImage(category);

  return (
    <Link
      href={{ pathname: "/products", query: { category: category.slug } }}
      className="group flex h-full flex-col rounded-[1.75rem] outline-offset-4"
    >
      {/* Fixed aspect on a `fill` image reserves the row before media arrives. */}
      <div
        className={`organic-washed relative ${aspect} w-full overflow-hidden bg-secondary shadow-card transition-shadow duration-300 group-hover:shadow-panel ${
          shape === "arch" ? "organic-arch" : "rounded-[1.75rem]"
        }`}
      >
        {src ? (
          <Image
            src={src}
            /* Empty on purpose: the category's name is drawn directly below,
               inside the same link. An alt here would make the link announce
               itself twice. */
            alt=""
            fill
            sizes={sizes}
            unoptimized={isProxiedStorageImage(src)}
            /* Never priority: every caller places this below its own masthead,
               so no tile competes with the page's LCP image. */
            className="object-cover object-center transition-transform duration-500 ease-out group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
        ) : (
          <CategoryImageFallback tone={tone} />
        )}
      </div>

      {/* Name and caption on the page's own ground, under the plate — the
          design sets no arrow and no chip here. The picture is the affordance,
          and the whole tile is the link. */}
      <div className="flex flex-1 flex-col">
        <h3
          className={`store-dynamic-text font-display leading-tight text-foreground transition-colors group-hover:text-rose [.locale-fa_&]:leading-normal ${
            showDescription
              ? "mt-[1.125rem] text-xl sm:text-[1.375rem]"
              : "mt-3.5 text-base sm:text-lg"
          }`}
        >
          <DynamicText>{category.name}</DynamicText>
        </h3>
        {showDescription && category.description ? (
          <p className="store-lede mt-1 line-clamp-2 text-[0.84375rem] text-foreground/65">
            <DynamicText>{category.description}</DynamicText>
          </p>
        ) : null}
      </div>
    </Link>
  );
}
