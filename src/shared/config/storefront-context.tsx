"use client";

import { useLocale } from "next-intl";
import type { LucideIcon } from "lucide-react";
import { createContext, useCallback, useContext } from "react";
import { getBrandIcon } from "@/shared/lib/brand-icon";
import { formatLocalizedPrice } from "@/shared/lib/price";
import { routing } from "@/shared/i18n/routing";
import type { StorefrontConfig } from "@/shared/config/types";

/**
 * The active store configuration, as client components see it.
 *
 * `getStorefrontConfig()` reads an environment variable that does not exist in
 * the browser, so the root layout resolves it during the server render and
 * hands it down through this context. Everything a client component needs from
 * the store — its name, its brand mark, its currency — is derived here rather
 * than in a module of its own, because each was a one-line read of the same
 * value.
 */
const StorefrontConfigContext = createContext<StorefrontConfig | null>(null);

export function StorefrontConfigProvider({
  children,
  value,
}: {
  children: React.ReactNode;
  value: StorefrontConfig;
}) {
  return (
    <StorefrontConfigContext.Provider value={value}>
      {children}
    </StorefrontConfigContext.Provider>
  );
}

export function useStorefrontConfig(): StorefrontConfig {
  const config = useContext(StorefrontConfigContext);

  if (!config) {
    throw new Error(
      "useStorefrontConfig must be used within StorefrontConfigProvider"
    );
  }

  return config;
}

/** Brand name of the active store in the current locale. */
export function useStorefrontName(): string {
  const locale = useLocale();
  const config = useStorefrontConfig();

  return (
    config.name[locale] ?? config.name[routing.defaultLocale] ?? config.slug
  );
}

/** The active store's brand mark, chosen from its schema.org business type. */
export function useBrandIcon(): LucideIcon {
  return getBrandIcon(useStorefrontConfig().businessType);
}

/** Price formatter bound to the active locale and the store's currency. */
export function useFormatPrice(): (
  price: number | string | null | undefined,
  formattedPrice?: string | null
) => string {
  const locale = useLocale();
  const { priceCurrency } = useStorefrontConfig();

  return useCallback(
    (price, formattedPrice) =>
      formatLocalizedPrice(price, locale, priceCurrency, formattedPrice),
    [locale, priceCurrency]
  );
}
