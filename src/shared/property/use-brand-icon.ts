"use client";

import type { LucideIcon } from "lucide-react";
import { getBrandIcon } from "@/shared/property/brand-icon";
import { useProperty } from "@/shared/property/property-provider";

/**
 * The active property's brand mark.
 *
 * Reads through the provider rather than the module-scope `property`, because
 * on the client the runtime `STOREFRONT_CONFIG_BASE64` is not visible and the
 * module would fall back to whichever property was bundled at build time.
 */
export function useBrandIcon(): LucideIcon {
  return getBrandIcon(useProperty().businessType);
}
