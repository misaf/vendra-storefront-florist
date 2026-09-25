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

/**
 * How long a product still counts as a new arrival.
 *
 * The source design pins a "New" flag to a hand-listed set of ids. Nothing in
 * the catalogue says "new", but every product carries the day it was created,
 * and a florist's shelf turns over fast enough that a month is the honest
 * window — long enough that a shop adding stock weekly always has some, short
 * enough that the flag still means something.
 */
const NEW_ARRIVAL_DAYS = 30;

export function isNewArrival(
  product: { createdAt?: string },
  now: number = Date.now()
): boolean {
  if (!product.createdAt) return false;

  const created = Date.parse(product.createdAt);
  if (Number.isNaN(created)) return false;

  const age = now - created;
  return age >= 0 && age <= NEW_ARRIVAL_DAYS * 24 * 60 * 60 * 1000;
}
