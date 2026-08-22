function parsePrice(price: number | string | null | undefined): number {
  return typeof price === "number"
    ? price
    : Number.parseFloat(String(price ?? "").replace(/,/g, ""));
}

// Hoisted so we don't construct a new Intl formatter on every price render.
const FA_PRICE_FORMAT_INTEGER = new Intl.NumberFormat("fa-IR", {
  maximumFractionDigits: 2,
  minimumFractionDigits: 0,
});
const FA_PRICE_FORMAT_DECIMAL = new Intl.NumberFormat("fa-IR", {
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
});
const EN_PRICE_FORMAT_INTEGER = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2,
  minimumFractionDigits: 0,
});
const EN_PRICE_FORMAT_DECIMAL = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
});

/**
 * Renders a price for a locale against an already-resolved currency label.
 *
 * The label is a parameter rather than something this module reads from the
 * store configuration, because every caller is a client component: reaching for
 * `@/shared/config/storefront` here would pull a server-only module into the
 * browser bundle, where it cannot be evaluated. Client components should use
 * `useFormatPrice`, which binds the label from the storefront context.
 */
export function formatLocalizedPrice(
  price: number | string | null | undefined,
  locale: string,
  label: string,
  formattedPrice?: string | null
): string {
  const isPersian = locale === "fa";

  // Persian storefront prices should use Persian digits and separators. The
  // numeric catalog value is also preferable to a backend display string: the
  // store configuration owns the customer-facing currency code, while a backend
  // string may use a conflicting one.
  const parsedPrice = parsePrice(price ?? formattedPrice);

  if (!Number.isFinite(parsedPrice)) {
    return isPersian ? `۰ ${label}` : `${label} 0`;
  }

  if (isPersian) {
    const formatter = Number.isInteger(parsedPrice)
      ? FA_PRICE_FORMAT_INTEGER
      : FA_PRICE_FORMAT_DECIMAL;

    return `${formatter.format(parsedPrice)} ${label}`;
  }

  const formatter = Number.isInteger(parsedPrice)
    ? EN_PRICE_FORMAT_INTEGER
    : EN_PRICE_FORMAT_DECIMAL;

  return `${label} ${formatter.format(parsedPrice)}`;
}
