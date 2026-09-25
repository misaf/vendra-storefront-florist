"use client";

import { useState } from "react";
import { Link, useRouter } from "@/shared/i18n/navigation";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { ThemedProductImage } from "./themed-product-image";
import { ProductImageFallback } from "./product-image-fallback";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { useCart } from "@/modules/cart";
import { useFavorites } from "@/modules/account";
import { cn, normalizeImageUrl } from "@/shared/lib/utils";
import { createReadableResourcePath } from "@/shared/lib/slug-url";
import { formatRemainingQuantity, isLowStock, isNewArrival } from "../lib/format";
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
  const { addToCart } = useCart();
  const router = useRouter();
  const { toggleFavorite, isFavorite } = useFavorites();
  const [hasImageError, setHasImageError] = useState(false);
  const saved = isFavorite(product.id);

  const detailHref = `/products/${createReadableResourcePath(product.id, product.slug)}`;
  const inStock = product.inStock !== false;
  const price = Number(product.price) || 0;
  const originalPrice = Number(product.originalPrice) || 0;
  const hasPrice = price > 0;
  const isPurchasable = inStock && hasPrice;
  const hasDiscount = isPurchasable && originalPrice > price;
  const discountPercent = hasDiscount ? getDiscountPercent(product) : 0;
  const isLowQuantity = isLowStock(product);
  /* The design pins exactly one pill to the plate's foot. Three facts can want
     that corner, so they are ranked by what changes a decision: a reduction
     expires, a new arrival is a reason to look, low stock is a reason to
     hurry — and the availability line under the price says the last one
     again in words, so it is the one that yields. */
  const footBadge = hasDiscount
    ? {
        label: t("products.discountBadge", {
          percent: new Intl.NumberFormat(locale).format(discountPercent),
        }),
        tone: "bg-rose",
      }
    : isNewArrival(product)
      ? { label: t("products.newBadge"), tone: "bg-leaf" }
      : isLowQuantity
        ? { label: t("products.lowStockBadge"), tone: "bg-rose" }
        : null;
  // A sold-out product the shop expects back reads differently from one that
  // is simply gone, and the difference decides whether a customer waits.
  const outOfStockLabel = product.availableSoon
    ? t("products.backSoon")
    : t("products.outOfStock");

  const handleAddToCart = () => {
    addToCart(product);
    toast.success(t("common.addedToCart", { name: product.name }), {
      action: {
        label: t("common.viewCart"),
        onClick: () => router.push("/cart"),
      },
    });
  };

  return (
    <div className={cn("group relative flex h-full min-w-0 flex-col", className)}>
      <div
        /* A plain rounded plate, never the arch. The card pins a collection
           tag, a reduction badge and the save control to its own corners, and
           an arch's ~10rem head radius cuts straight through all three. The
           arch belongs to the plates that carry nothing but a picture — the
           hero and the collection tiles. */
        className={cn(
          "relative aspect-[4/5] overflow-hidden rounded-[1.625rem] bg-secondary",
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
          className="store-focus-inset organic-washed block h-full w-full rounded-[1.625rem]"
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
              /* `cover`, filling the plate edge to edge — the design draws a
                 catalogue tile as a photograph, not as a picture letterboxed
                 inside one. The 4:5 frame is measured, not assumed: across 113
                 catalogue photographs the shapes are 3:4 (70), taller portrait
                 (14), square (24) and 4:3 (5), so the common case crops by a
                 few percent of its height and a square loses its margins. The
                 `object-top` bias keeps that crop off the flowers — a bouquet
                 photographed on a stand has its stems and plinth at the foot,
                 which is the part worth losing. */
              className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.035]"
              unoptimized
              loading={eager ? "eager" : "lazy"}
              onError={() => setHasImageError(true)}
            />
          )}
        </Link>

        {/* The card's two corners, as the Organic system lays them out: what
            this is (the collection) at the head, what is true of it right now
            (sold out, reduced) at the foot. They used to share the top-start
            corner, so a discounted product in a named collection drew one on
            top of the other.
            `max-w` with a truncating label because a collection name comes from
            the catalogue and can be any length; the heart's corner is reserved
            out of the width so the two never collide. */}
        {showCategory && product.category ? (
          <Badge
            variant="clay"
            className="pointer-events-none absolute start-3 top-3 max-w-[calc(100%-3.875rem)] px-2.5 py-0.5 text-[0.65625rem]"
          >
            <span className="store-dynamic-text truncate">
              <DynamicText>{product.category}</DynamicText>
            </span>
          </Badge>
        ) : null}

        {footBadge ? (
          <span
            className={cn(
              "pointer-events-none absolute bottom-3 start-3 inline-flex h-6 items-center rounded-full px-[0.6875rem] text-[0.65625rem] font-semibold uppercase tracking-[0.04em] text-background [.locale-fa_&]:normal-case [.locale-fa_&]:tracking-normal",
              footBadge.tone
            )}
          >
            {footBadge.label}
          </span>
        ) : null}

        {/* Save, on the card rather than only on the detail page. The list is
            already persisted and already has a panel to read it back from; the
            grid was the one surface that could not write to it, which made
            comparing a shelf of bouquets a matter of opening each one. */}
        <button
          type="button"
          onClick={() => toggleFavorite(product)}
          aria-pressed={saved}
          aria-label={saved ? t("common.removeFromFavorites") : t("common.favorites")}
          className="absolute end-3 top-3 flex size-[2.125rem] items-center justify-center rounded-full bg-background text-foreground shadow-card transition-colors hover:text-rose"
        >
          <Heart
            className={cn("size-4", saved && "fill-current text-rose")}
            aria-hidden="true"
          />
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-1 pt-2.5">
        {/* <bdi> isolates a name written in the other script so it orders
            correctly, while the card keeps the page's own alignment — dir="auto"
            on the block pushed Persian titles to the far edge of an LTR grid.
            The design sets a product's name in the display face at 17px, the
            same face its price is set in — the two are one object. */}
        <h3 className="store-dynamic-text font-display text-base leading-[1.25] sm:text-[1.0625rem] [.locale-fa_&]:leading-normal">
          <Link
            href={detailHref}
            className="-my-1 line-clamp-2 rounded-sm py-1 transition-colors hover:text-rose"
          >
            <DynamicText>{product.name}</DynamicText>
          </Link>
        </h3>
      </div>

      {/* A sold-out product keeps its price. What it costs is what a shopper
          came to find out, and it is still true while the shop is restocking —
          the availability line below says the rest. Only a product the
          catalogue has given no price at all falls back to words. */}
      <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
        {hasPrice ? (
          <Price product={product} showDiscount={hasDiscount} />
        ) : (
          <span className="text-sm font-semibold leading-6 text-muted-foreground">
            {t("products.priceOnRequest")}
          </span>
        )}
      </div>

      {/* One availability line under the price, always — a coloured dot and the
          word for it. The card used to state availability only when stock ran
          low, so "in stock" was communicated by the *absence* of a line, which
          is not something a shopper can read. Colour never carries the meaning
          on its own (WCAG 1.4.1): the dot and the words say the same thing. */}
      <p className="mt-2 flex items-center gap-[0.4375rem] text-xs leading-5 text-muted-foreground">
        <span
          className={cn(
            "size-[0.4375rem] shrink-0 rounded-full",
            !inStock ? "bg-sand-400" : isLowQuantity ? "bg-rose" : "bg-leaf"
          )}
          aria-hidden="true"
        />
        <span className="truncate">
          {!inStock
            ? outOfStockLabel
            : isLowQuantity
              ? formatRemainingQuantity(t, locale, product.quantity as number)
              : t("common.inStock")}
        </span>
      </p>


      {showAddToCart ? (
        <div className="mt-2.5">
          {isPurchasable ? (
            /* No leading glyph: the design's card action is the label alone in
               an outlined pill, and a plus in front of it read as a stepper
               control rather than as "add to cart". */
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full text-[0.78125rem]"
              onClick={handleAddToCart}
            >
              <span className="truncate">{t("common.addToCart")}</span>
            </Button>
          ) : (
            /* Bordered like the buy action so it still reads as a control —
               just quieter, since there is nothing to buy here. */
            <Button asChild variant="outline" size="sm" className="w-full border-dashed text-[0.78125rem] text-muted-foreground">
              <Link href={detailHref}>{t("products.viewDetails")}</Link>
            </Button>
          )}
        </div>
      ) : null}
    </div>
  );
}
