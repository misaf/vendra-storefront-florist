type Translate = (key: string, values?: Record<string, string | number>) => string;

export function formatRemainingQuantity(
  t: Translate,
  locale: string,
  quantity: number
): string {
  return t("products.remainingQuantity", {
    quantity: new Intl.NumberFormat(locale).format(quantity),
  });
}

/**
 * Whether a product should carry a "only N left" warning.
 *
 * The catalogue sets `stockThreshold` per product; a zero or absent value means
 * the shop isn't tracking a threshold for it, in which case only the very last
 * unit is worth calling out. Previously this was a hardcoded `quantity < 2`,
 * which silently ignored the threshold the API already sends.
 */
export function isLowStock(product: {
  inStock?: boolean;
  quantity?: number | null;
  stockThreshold?: number | null;
}): boolean {
  if (product.inStock === false) return false;

  const quantity = product.quantity;
  if (quantity == null || quantity <= 0) return false;

  const threshold =
    product.stockThreshold != null && product.stockThreshold > 0
      ? product.stockThreshold
      : 1;

  return quantity <= threshold;
}
