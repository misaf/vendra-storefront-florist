"use client";

import { useCart } from "../hooks/cart-context";
import { Link } from "@/shared/i18n/navigation";
import { Button } from "@/shared/components/ui/button";
import { ShoppingBag } from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { useTranslations } from "@/shared/hooks/use-translations";
import { useHydrated } from "@/shared/hooks/use-hydrated";

export function CartButton() {
  const hydrated = useHydrated();
  const { getTotalItems } = useCart();
  const { t, locale } = useTranslations();
  const totalItems = getTotalItems();
  const displayCount = new Intl.NumberFormat(locale).format(Math.min(totalItems, 99));

  return (
    <Button
      asChild
      /* The one filled control in the bar. The design gives the cart the
         accent and leaves every other header control outlined, so the row
         reads as "these are ways around, that is the way out".

         A link, not a button: the cart is a page with an address of its own,
         so it opens in a new tab, restores on Back, and can be shared between
         a phone and a desk the way any other page can. */
      size="icon"
      className="relative"
    >
      <Link
        href="/cart"
        aria-label={
          hydrated && totalItems > 0
            ? t("common.shoppingCartCount", { count: totalItems })
            : t("common.shoppingCart")
        }
      >
      <ShoppingBag className="size-4" />
      {hydrated && totalItems > 0 && (
        <Badge
          /* Sage, matching the saved-items count beside it: the two are the
             same kind of object and were reading as an alert and a total.
             A pill floored at 17px rather than locked to it: "99+" never fitted
             a fixed circle at `p-0`, and the count still has to stay readable
             when the shopper has raised their font size. The badge is
             absolutely positioned, so growing costs the header row nothing. */
          className="absolute -top-1 -end-1 flex min-h-[1.0625rem] min-w-[1.0625rem] items-center justify-center rounded-full border-transparent bg-leaf px-1 text-[0.625rem] font-semibold leading-none text-background"
        >
          {totalItems > 99 ? `${displayCount}+` : displayCount}
        </Badge>
      )}
      </Link>
    </Button>
  );
}
