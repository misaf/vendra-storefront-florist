"use client";

import { useLocale } from "next-intl";
import { useCallback } from "react";
import { currencyLabel, formatLocalizedPrice } from "@/shared/lib/price";
import { useProperty } from "@/shared/property/property-provider";

/**
 * Price formatter bound to the active locale and the property's currency.
 *
 * The property arrives through context from the server render, which is the
 * only way client components can read it: `getProperty()` reads an environment
 * variable that does not exist in the browser.
 */
export function useFormatPrice(): (
  price: number | string | null | undefined,
  formattedPrice?: string | null
) => string {
  const locale = useLocale();
  const property = useProperty();
  const label = currencyLabel(property, locale);

  return useCallback(
    (price, formattedPrice) =>
      formatLocalizedPrice(price, locale, label, formattedPrice),
    [locale, label]
  );
}
