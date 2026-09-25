"use client";

import type { ComponentProps } from "react";
import { PriceView } from "@/shared/components/ui/price-view";
import { useTranslations } from "@/shared/hooks/use-translations";
import { useFormatPrice } from "@/shared/config/storefront-context";
import type { Product } from "../types";

interface PriceProps
  extends Pick<
    ComponentProps<typeof PriceView>,
    "size" | "className" | "valueClassName"
  > {
  product: Pick<
    Product,
    "price" | "formattedPrice" | "originalPrice" | "formattedOriginalPrice"
  >;
  /** Whether a discount may be shown — a sold-out row has no live sale. */
  showDiscount?: boolean;
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
 * the reduction is spoken as well as drawn. The drawing itself is `PriceView`,
 * in the shared kit; this wrapper supplies the locale's formatting and words.
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
    <PriceView
      size={size}
      className={className}
      valueClassName={valueClassName}
      value={formatPrice(product.price, product.formattedPrice)}
      originalValue={
        hasDiscount
          ? formatPrice(product.originalPrice, product.formattedOriginalPrice)
          : undefined
      }
      priceLabel={t("products.priceLabel")}
      saleLabel={t("products.salePrice")}
      originalLabel={t("products.originalPrice")}
    />
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
