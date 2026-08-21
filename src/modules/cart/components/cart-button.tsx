"use client";

import { useCart } from "../hooks/cart-context";
import { Button } from "@/shared/components/ui/button";
import { ShoppingBag } from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { useTranslations } from "@/shared/hooks/use-translations";
import { useHydrated } from "@/shared/hooks/use-hydrated";

export function CartButton() {
  const hydrated = useHydrated();
  const { getTotalItems, openCart } = useCart();
  const { t, locale } = useTranslations();
  const totalItems = getTotalItems();
  const displayCount = new Intl.NumberFormat(locale).format(Math.min(totalItems, 99));

  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative"
      onClick={openCart}
      aria-label={
        hydrated && totalItems > 0
          ? t("common.shoppingCartCount", { count: totalItems })
          : t("common.shoppingCart")
      }
    >
      <ShoppingBag className="h-5 w-5" />
      {hydrated && totalItems > 0 && (
        <Badge
          variant="destructive"
          /* A pill floored at 20px rather than locked to it: "99+" never fitted
             a fixed 20px circle at `p-0`, and the count still has to stay
             readable when the shopper has raised their font size. The badge is
             absolutely positioned, so growing costs the header row nothing. */
          className="absolute -top-1 -end-1 flex min-h-[20px] min-w-[20px] items-center justify-center rounded-full px-1 text-xs leading-none"
        >
          {totalItems > 99 ? `${displayCount}+` : displayCount}
        </Badge>
      )}
    </Button>
  );
}
