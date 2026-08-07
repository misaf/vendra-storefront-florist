import {
  Cake,
  Coffee,
  Flower2,
  Gift,
  Shirt,
  Store,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react";

/**
 * The brand mark, chosen from the property's schema.org `businessType`.
 *
 * One image serves every property, so the logo cannot be a florist icon
 * compiled into the bundle. Extending the fleet to a new vertical is one entry
 * in this map rather than an edit at every call site.
 */
const BUSINESS_TYPE_ICONS: Record<string, LucideIcon> = {
  bakery: Cake,
  cafeorcoffeeshop: Coffee,
  clothingstore: Shirt,
  florist: Flower2,
  giftshop: Gift,
  restaurant: UtensilsCrossed,
};

/** Icon component for a schema.org business type. Falls back to a neutral store. */
export function getBrandIcon(businessType: string): LucideIcon {
  return BUSINESS_TYPE_ICONS[businessType.toLowerCase()] ?? Store;
}
