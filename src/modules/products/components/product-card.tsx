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
import { useFormatPrice } from "@/shared/property/use-format-price";
import { formatRemainingQuantity, isLowStock } from "../lib/format";
import type { Product } from "../types";

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
  const formatPrice = useFormatPrice();
  const { addToCart, openCart } = useCart();
  const [hasImageError, setHasImageError] = useState(false);

  const detailHref = `/products/${createReadableResourcePath(product.id, product.slug)}`;
  const inStock = product.inStock !== false;
  const price = Number(product.price) || 0;
  const originalPrice = Number(product.originalPrice) || 0;
  const hasPrice = price > 0;
  const isPurchasable = inStock && hasPrice;
  const hasDiscount = isPurchasable && originalPrice > price;
  const discountPercent = hasDiscount
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;
  const displayPrice = formatPrice(product.price, product.formattedPrice);
  const displayOriginalPrice = formatPrice(
    product.originalPrice,
    product.formattedOriginalPrice
  );
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
        {/* The link fills the clipped image frame, so its focus indicator is
            drawn inside — a 3px outset outline would be cut off by the frame. */}
        <Link
          href={detailHref}
          className="store-focus-inset block h-full w-full rounded-xl"
        >
          {hasImageError ? (
            <ProductImageFallback label={t("products.imageUnavailable")} />
          ) : (
            <ThemedProductImage
              src={normalizeImageUrl(product.image)}
              alt={product.name}
              width={480}
              height={600}
              sizes={sizes}
              className="h-full w-full object-contain p-3 transition-transform duration-500 group-hover:scale-[1.035] sm:p-4"
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
        {showCategory && product.category ? (
          <p className="store-dynamic-text line-clamp-1 text-xs font-semibold text-rose">
            <bdi>{product.category}</bdi>
          </p>
        ) : null}
        <h3 className="store-dynamic-text text-sm font-semibold leading-6 sm:text-base">
          <Link
            href={detailHref}
            className="-my-1 line-clamp-2 rounded-sm py-1 transition-colors hover:text-rose"
          >
            <bdi>{product.name}</bdi>
          </Link>
        </h3>
        {isLowQuantity ? (
          <p className="truncate text-xs font-semibold leading-4 text-rose">
            {formatRemainingQuantity(t, locale, product.quantity as number)}
          </p>
        ) : null}
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
        {inStock && hasPrice ? (
          <>
            <span
              dir="ltr"
              className="text-base font-bold leading-6 tabular-nums text-foreground"
              aria-label={`${t(hasDiscount ? "products.salePrice" : "products.priceLabel")}: ${displayPrice}`}
            >
              {displayPrice}
            </span>
            {hasDiscount ? (
              <span
                dir="ltr"
                aria-label={`${t("products.originalPrice")}: ${displayOriginalPrice}`}
              >
                <del
                  aria-hidden="true"
                  className="text-sm font-medium tabular-nums text-muted-foreground decoration-1"
                >
                  {displayOriginalPrice}
                </del>
              </span>
            ) : null}
          </>
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
