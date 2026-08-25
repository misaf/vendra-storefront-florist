"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { useTranslations } from "@/shared/hooks/use-translations";
import { useFormatPrice } from "@/shared/config/storefront-context";
import { cn } from "@/shared/lib/utils";
import type { Product } from "../types";

/**
 * A price is set in the display face, in the clay accent, at every size. That
 * pairing is what makes the number read as the shop's own voice rather than as
 * a data field, and it is the one treatment the Organic system applies
 * identically on a catalogue tile, a cart line and a product masthead — so the
 * variants below change only the step, never the face or the colour.
 */
const priceVariants = cva(
  "font-display inline-flex flex-wrap items-baseline gap-x-2 text-rose",
  {
    variants: {
      size: {
        sm: "gap-x-2 text-sm leading-5",
        md: "gap-x-2 text-base leading-6",
        lg: "gap-x-3 gap-y-1 text-3xl sm:text-4xl",
      },
    },
    defaultVariants: { size: "md" },
  }
);

const originalVariants = cva("font-medium text-muted-foreground decoration-1", {
  variants: {
    size: {
      sm: "text-xs font-normal",
      md: "text-sm",
      lg: "text-base sm:text-lg",
    },
  },
  defaultVariants: { size: "md" },
});

interface PriceProps extends VariantProps<typeof priceVariants> {
  product: Pick<
    Product,
    "price" | "formattedPrice" | "originalPrice" | "formattedOriginalPrice"
  >;
  /** Whether a discount may be shown — a sold-out row has no live sale. */
  showDiscount?: boolean;
  className?: string;
  /** Applied to the current price itself, for per-surface truncation. */
  valueClassName?: string;
}

/**
 * A product's price, and the price it was struck down from.
 *
 * The catalogue grid, the product page and the search palette each rendered
 * this themselves, and all three made the same mistake: the old price sat in an
 * `aria-hidden` `<del>` inside a `<span aria-label="Original price: …">`. A
 * `<span>` has no role, so ARIA forbids naming it and assistive technology
 * drops the label — the hidden `<del>` was the only other thing there, so the
 * old price was announced as nothing at all. A shopper using a screen reader
 * heard one price and no indication anything was reduced.
 *
 * Both prices are now real text, each introduced by a visually hidden word, so
 * the reduction is spoken as well as drawn.
 */
export function Price({
  product,
  size,
  showDiscount = true,
  className,
  valueClassName,
}: PriceProps) {
  const { t } = useTranslations();
  const formatPrice = useFormatPrice();

  const price = Number(product.price) || 0;
  const originalPrice = Number(product.originalPrice) || 0;
  const hasDiscount = showDiscount && originalPrice > price;

  return (
    <span className={cn(priceVariants({ size }), className)} dir="ltr">
      <span className="sr-only">
        {t(hasDiscount ? "products.salePrice" : "products.priceLabel")}:{" "}
      </span>
      <span className={cn("tabular-nums", valueClassName)}>
        {formatPrice(product.price, product.formattedPrice)}
      </span>
      {hasDiscount ? (
        <>
          <span className="sr-only">{t("products.originalPrice")}: </span>
          <del className={cn(originalVariants({ size }), "tabular-nums")}>
            {formatPrice(product.originalPrice, product.formattedOriginalPrice)}
          </del>
        </>
      ) : null}
    </span>
  );
}

/**
 * The percentage a product is reduced by, or 0 when it is not. Shared so the
 * badge on a card and the badge on the product page cannot disagree.
 */
export function getDiscountPercent(
  product: Pick<Product, "price" | "originalPrice">
): number {
  const price = Number(product.price) || 0;
  const originalPrice = Number(product.originalPrice) || 0;
  if (originalPrice <= price) return 0;
  return Math.round(((originalPrice - price) / originalPrice) * 100);
}
