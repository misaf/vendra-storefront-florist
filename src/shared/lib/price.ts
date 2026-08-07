import type { PropertyConfig } from "@/shared/property/types";

/**
 * Currency label for a locale. The property can override the label per locale
 * (e.g. { fa: "تومان" }); otherwise the ISO code from `priceCurrency` is used.
 */
export function currencyLabel(
  property: Pick<PropertyConfig, "currency" | "priceCurrency">,
  locale: string
): string {
  return (
    property.currency?.label?.[locale] ??
    property.currency?.code ??
    property.priceCurrency
  );
}

function formatPrice(price: number | string | null | undefined): string {
  const parsedPrice =
    typeof price === "number" ? price : Number.parseFloat(String(price ?? ""));
  return Number.isFinite(parsedPrice) ? parsedPrice.toFixed(2) : "0.00";
}

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

/**
 * Renders a price for a locale against an already-resolved currency label.
 *
 * The label is a parameter rather than something this module reads from the
 * property, because every caller is a client component: reaching for the
 * property module here would pull a server-only module into the browser bundle,
 * where it cannot be evaluated. Client components should use `useFormatPrice`,
 * which binds the label from the property context.
 */
export function formatLocalizedPrice(
  price: number | string | null | undefined,
  locale: string,
  label: string,
  formattedPrice?: string | null
): string {
  const isPersian = locale === "fa";

  if (formattedPrice) {
    // A backend-formatted price (e.g. "1,200,000 IRT") — swap in the
    // configured per-locale currency label.
    return isPersian
      ? formattedPrice.replace(/\bIRT\b/gi, label)
      : formattedPrice;
  }

  const parsedPrice = parsePrice(price);

  if (!Number.isFinite(parsedPrice)) {
    return isPersian ? `۰ ${label}` : `${label} 0.00`;
  }

  if (isPersian) {
    const formatter = Number.isInteger(parsedPrice)
      ? FA_PRICE_FORMAT_INTEGER
      : FA_PRICE_FORMAT_DECIMAL;

    return `${formatter.format(parsedPrice)} ${label}`;
  }

  return `${label} ${formatPrice(parsedPrice)}`;
}
