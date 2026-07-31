"use client";

import { useLocale } from "next-intl";
import { getPropertyName } from "@/shared/property";

/** Brand name of the selected property in the active locale. */
export function usePropertyName(): string {
  return getPropertyName(useLocale());
}
