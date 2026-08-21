"use client";

import { useState } from "react";
import { Link } from "@/shared/i18n/navigation";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { ThemedProductImage } from "./themed-product-image";
import { ProductImageFallback } from "./product-image-fallback";
import { Button } from "@/shared/components/ui/button";
import { useCart } from "@/modules/cart";
import { cn, normalizeImageUrl } from "@/shared/lib/utils";
import { createReadableResourcePath } from "@/shared/lib/slug-url";
import { formatRemainingQuantity, isLowStock } from "../lib/format";
import { Price, getDiscountPercent } from "./price";
import type { Product } from "../types";
import { DynamicText } from "@/shared/components/dynamic-text";

type Translate = (key: string, values?: Record<string, string | number>) => string;

interface ProductCardProps {
  product: Product;
  locale: string;
  t: Translate;
  /** Rendered sizes attribute for the card image. */
  sizes: string;
  /** The first row of a grid can load eagerly; everything else waits. */
  eager?: boolean;
  /** Quick add is suppressed where the card is a pure cross-sell (related rail). */
  showAddToCart?: boolean;
  /** Shown above the title on the catalogue grid, where cards leave their category. */
  showCategory?: boolean;
  className?: string;
}

/**
 * One card, used by the catalogue grid, the homepage category rails and the
 * related-products rail. Those three used to each carry their own type sizes,
 * price weights and (missing) stock treatment, so the same product read as a
 * different object depending on where you met it.
 */
export function ProductCard({
  product,
  locale,
  t,
  sizes,
  eager = false,
  showAddToCart = true,
  showCategory = false,
  className,
}: ProductCardProps) {
  const { addToCart, openCart } = useCart();
  const [hasImageError, setHasImageError] = useState(false);

  const detailHref = `/products/${createReadableResourcePath(product.id, product.slug)}`;
  const inStock = product.inStock !== false;
  const price = Number(product.price) || 0;
  const originalPrice = Number(product.originalPrice) || 0;
  const hasPrice = price > 0;
  const isPurchasable = inStock && hasPrice;
  const hasDiscount = isPurchasable && originalPrice > price;
  const discountPercent = hasDiscount ? getDiscountPercent(product) : 0;
  const isLowQuantity = isLowStock(product);
  // A sold-out product the shop expects back reads differently from one that
  // is simply gone, and the difference decides whether a customer waits.
  const outOfStockLabel = product.availableSoon
    ? t("products.backSoon")
    : t("products.outOfStock");

  const handleAddToCart = () => {
    addToCart(product);
    toast.success(t("common.addedToCart", { name: product.name }), {
      action: { label: t("common.viewCart"), onClick: openCart },
    });
  };

  return (
    <div className={cn("group relative flex h-full min-w-0 flex-col", className)}>
      <div
        className={cn(
          "relative aspect-[4/5] overflow-hidden rounded-xl bg-secondary",
          !inStock && "opacity-90"
        )}
      >
        {/* A second route to the same product for a pointer, and nothing at all
            for anyone else: `tabIndex={-1}` keeps it out of the tab order and
            `aria-hidden` out of the accessibility tree, so a keyboard user gets
            one stop per card instead of two and a screen reader hears the
            product name once instead of twice. The picture's `alt` is empty for
            the same reason — the title link below carries the name. (Twelve
            cards were producing twenty-four links to twelve destinations.)
            The link still fills the clipped frame, so its focus indicator would
            be drawn inside; it simply never takes focus now. */}
        <Link
          href={detailHref}
          aria-hidden="true"
          tabIndex={-1}
          className="store-focus-inset block h-full w-full rounded-xl"
        >
          {hasImageError ? (
            <ProductImageFallback label={t("products.imageUnavailable")} />
          ) : (
            <ThemedProductImage
              /* The card-sized rendition. `image` is the gallery one — a
                 ~1.5MB original that this 130-330px tile never needed. */
              src={normalizeImageUrl(product.thumbnail || product.image)}
              alt=""
              width={480}
              height={600}
              sizes={sizes}
              /* `contain`, not `cover`: a bouquet cropped to fill loses its
                 stems or its vase.
                 The 4:5 frame is measured, not assumed. Across 113 catalogue
                 photographs the shapes are 3:4 (70), taller portrait (14),
                 square (24) and 4:3 (5); mean fill under `contain` is 0.90 in a
                 3:4 frame, 0.874 in this one and 0.788 in a square. 4:5 is
                 within three points of the best fit and keeps the card shorter,
                 so more of the grid stays above the fold.
                 What was actually costing the picture room was the padding that
                 used to sit here: `contain` already insets the image, and the
                 padding then shrank it again inside its own letterbox. */
              className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-[1.035]"
              unoptimized
              loading={eager ? "eager" : "lazy"}
              onError={() => setHasImageError(true)}
            />
          )}
        </Link>

        {/* Availability and discount are stated on the image, not left to the
            price slot alone — both carry a word as well as a colour. */}
        {!inStock ? (
          <span className="pointer-events-none absolute start-3 top-3 rounded-full bg-foreground/90 px-2.5 py-1 text-xs font-bold text-background">
            {outOfStockLabel}
          </span>
        ) : hasDiscount ? (
          <span className="pointer-events-none absolute start-3 top-3 rounded-full bg-rose px-2.5 py-1 text-xs font-bold text-rose-foreground">
            {t("products.discountBadge", { percent: new Intl.NumberFormat(locale).format(discountPercent) })}
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-1 pt-3">
        {/* <bdi> isolates a name written in the other script so it orders
            correctly, while the card keeps the page's own alignment — dir="auto"
            on the block pushed Persian titles to the far edge of an LTR grid. */}
        {/* Muted, not rose. The category is context for the name above the
            price; rose is the card's one accent and the stock warning below
            needs it more. Two rose lines stacked made neither one read.
            Set in the catalogue's own casing rather than uppercased: at 320px
            a two-up tile is ~135px wide and "FLORAL ARRANGEMENTS" clipped to
            "FLORAL…", which reads as a fault. The same words in sentence case
            fit, and the muted weight still separates the line from the title
            below it. */}
        {showCategory && product.category ? (
          <p className="store-dynamic-text line-clamp-1 text-xs font-semibold tracking-wide text-muted-foreground">
            <DynamicText>{product.category}</DynamicText>
          </p>
        ) : null}
        <h3 className="store-dynamic-text text-sm font-semibold leading-6 sm:text-base">
          <Link
            href={detailHref}
            className="-my-1 line-clamp-2 rounded-sm py-1 transition-colors hover:text-rose"
          >
            <DynamicText>{product.name}</DynamicText>
          </Link>
        </h3>
        {/* Inside the growth block on purpose: this line exists on a minority
            of cards, and hanging it between the price and the button pushed
            those cards' prices off the baseline the rest of the row sits on —
            which is the one alignment a grid built for comparison needs. */}
        {isLowQuantity ? (
          <p className="truncate text-xs font-semibold leading-4 text-rose">
            {formatRemainingQuantity(t, locale, product.quantity as number)}
          </p>
        ) : null}
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
        {inStock && hasPrice ? (
          <Price product={product} showDiscount={hasDiscount} />
        ) : (
          <span className="text-sm font-semibold leading-6 text-muted-foreground">
            {inStock ? t("products.priceOnRequest") : outOfStockLabel}
          </span>
        )}
      </div>


      {showAddToCart ? (
        <div className="mt-3">
          {isPurchasable ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full gap-1.5"
              onClick={handleAddToCart}
            >
              <Plus className="size-4" aria-hidden="true" />
              <span className="truncate">{t("common.addToCart")}</span>
            </Button>
          ) : (
            /* Bordered like the buy action so it still reads as a control —
               just quieter, since there is nothing to buy here. */
            <Button asChild variant="outline" size="sm" className="w-full border-dashed text-muted-foreground">
              <Link href={detailHref}>{t("products.viewDetails")}</Link>
            </Button>
          )}
        </div>
      ) : null}
    </div>
  );
}
