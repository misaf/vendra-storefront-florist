"use client";

import { useLocale } from "next-intl";
import { routing } from "@/shared/i18n/routing";
import { useProperty } from "@/shared/property/property-provider";

/** Brand name of the selected property in the active locale. */
export function usePropertyName(): string {
  const locale = useLocale();
  const property = useProperty();

  return (
    property.name[locale] ?? property.name[routing.defaultLocale] ?? property.slug
  );
}
