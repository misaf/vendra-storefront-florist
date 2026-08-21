"use client";

import { useCallback, useState } from "react";
import { useCart, type CartItem } from "../hooks/cart-context";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/shared/components/ui/sheet";
import { Button } from "@/shared/components/ui/button";
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyMedia } from "@/shared/components/ui/empty";
import { Link } from "@/shared/i18n/navigation";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { useTranslations } from "@/shared/hooks/use-translations";
import { formatRemainingQuantity } from "@/modules/products";

import { SafeImage } from "@/shared/components/ui/safe-image";
import { useBrandIcon } from "@/shared/property/use-brand-icon";
import { useFormatPrice } from "@/shared/property/use-format-price";
import { createReadableResourcePath } from "@/shared/lib/slug-url";
import { toast } from "sonner";

export function Cart() {
  const formatPrice = useFormatPrice();
  const {
    items,
    restoreCartItem,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalPrice,
    getTotalItems,
    isCartOpen,
    setCartOpen,
    cartOpenerRef,
  } = useCart();
  const BrandIcon = useBrandIcon();
  const { t, locale } = useTranslations();
  const [recentlyRemovedItem, setRecentlyRemovedItem] =
    useState<CartItem | null>(null);
  const [recentlyClearedItems, setRecentlyClearedItems] =
    useState<CartItem[] | null>(null);
  const numberFormat = new Intl.NumberFormat(locale);

  const handleUndoRemove = useCallback(() => {
    const item = recentlyRemovedItem;
    if (!item) return;

    restoreCartItem(item);
    setRecentlyRemovedItem(null);
    toast.success(t("common.restoredToCart", { name: item.name }));
  }, [recentlyRemovedItem, restoreCartItem, t]);

  const handleRemove = (item: CartItem) => {
    setRecentlyClearedItems(null);
    setRecentlyRemovedItem(item);
    removeFromCart(item.id);
  };

  const handleClear = () => {
    setRecentlyRemovedItem(null);
    setRecentlyClearedItems(items);
    clearCart();
  };

  const handleUndoClear = () => {
    const clearedItems = recentlyClearedItems;
    if (!clearedItems) return;

    clearedItems.forEach(restoreCartItem);
    setRecentlyClearedItems(null);
    toast.success(t("common.cartRestored"));
  };

  return (
    <Sheet
      open={isCartOpen}
      onOpenChange={(open) => {
        setCartOpen(open);
        if (!open) {
          setRecentlyRemovedItem(null);
          setRecentlyClearedItems(null);
        }
      }}
    >
      <SheetContent
        side="end"
        closeLabel={t("common.close")}
        className="flex w-full gap-0 border-border bg-background p-0 sm:max-w-lg"
        // Without a Radix trigger there is nothing for it to hand focus back
        // to, so closing would drop a keyboard user at the top of the page.
        onCloseAutoFocus={(event) => {
          const opener = cartOpenerRef.current;
          if (opener && opener.isConnected) {
            event.preventDefault();
            opener.focus();
          }
        }}
      >
        <SheetHeader className="border-b border-border px-5 py-6 text-start sm:px-7">
          <SheetTitle className="font-display flex items-center gap-3 text-2xl">
            <span className="flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground"><ShoppingBag className="h-5 w-5" /></span>
            <span>{t("common.shoppingCart")} <span className="text-base text-muted-foreground">({numberFormat.format(getTotalItems())})</span></span>
          </SheetTitle>
          <SheetDescription className="sr-only">
            {t("common.cartDrawerDescription")}
          </SheetDescription>
        </SheetHeader>

        {recentlyRemovedItem || recentlyClearedItems ? (
          <div
            role="status"
            className="flex items-center justify-between gap-3 border-b border-border bg-secondary/60 px-5 py-2 sm:px-7"
          >
            <p className="store-dynamic-text line-clamp-2 text-sm text-muted-foreground" dir="auto">
              {recentlyRemovedItem
                ? t("common.removedFromCart", {
                    name: recentlyRemovedItem.name,
                  })
                : t("common.cartCleared")}
            </p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="min-h-11 shrink-0 px-3 text-primary"
              onClick={
                recentlyRemovedItem ? handleUndoRemove : handleUndoClear
              }
            >
              {t("common.undo")}
            </Button>
          </div>
        ) : null}

        <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-7">
          {items.length === 0 ? (
            <Empty className="py-12">
              <EmptyHeader>
                <EmptyMedia
                  variant="icon"
                  className="size-14 rounded-full bg-secondary text-muted-foreground ring-1 ring-border"
                >
                  <BrandIcon className="h-6 w-6" />
                </EmptyMedia>
                <EmptyTitle>{t("common.emptyCart")}</EmptyTitle>
                <EmptyDescription>
                  {t("common.addSomeProducts")}
                </EmptyDescription>
              </EmptyHeader>
              <Button
                asChild
                className="mt-5 rounded-full"
                onClick={() => setCartOpen(false)}
              >
                <Link href="/products">
                  {t("common.shopNow")}
                  <ArrowRight className="size-4 rtl:rotate-180" />
                </Link>
              </Button>
            </Empty>
          ) : (
            <div className="divide-y divide-border">
              {items.map((item) => {
                // The catalogue only tracks stock when it reports a count, so a
                // null ceiling means "as many as you like", not "none left".
                const atStockCeiling =
                  item.stock != null && item.quantity >= item.stock;

                return (
                <div
                  key={item.id}
                  className="flex gap-4 py-5 first:pt-0 last:pb-0"
                >
                  <Link
                    href={`/products/${createReadableResourcePath(item.id, item.slug)}`}
                    onClick={() => setCartOpen(false)}
                    aria-hidden="true"
                    tabIndex={-1}
                    className="relative h-24 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-secondary"
                  >
                    <SafeImage
                      src={item.thumbnail || item.image}
                      alt=""
                      fill
                      sizes="80px"
                      className="object-contain p-1 transition-transform duration-300 hover:scale-[1.03]"
                      unoptimized
                    />
                  </Link>
                  <div className="flex flex-1 flex-col gap-2">
                    <div>
                      <h3 className="store-dynamic-text line-clamp-2 font-semibold leading-5 text-card-foreground">
                        <Link
                          href={`/products/${createReadableResourcePath(item.id, item.slug)}`}
                          onClick={() => setCartOpen(false)}
                          className="rounded-sm transition-colors hover:text-primary"
                        >
                          <bdi>{item.name}</bdi>
                        </Link>
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        <span className="sr-only">{t("common.unitPrice")}: </span>
                        <span dir="ltr">
                          {formatPrice(item.price, item.formattedPrice)}
                        </span>
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={item.quantity <= 1}
                          aria-label={t("common.decreaseQuantity")}
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-8 text-center text-sm font-medium" aria-live="polite">
                          {numberFormat.format(item.quantity)}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={atStockCeiling}
                          aria-label={t("common.increaseQuantity")}
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        aria-label={t("common.removeItem")}
                        onClick={() => handleRemove(item)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    {/* Why the stepper stopped. Without it the + simply goes
                        dead and the shopper is left guessing whether the button
                        is broken or the shop is out. */}
                    {atStockCeiling && item.stock != null ? (
                      <p className="text-xs font-semibold text-primary">
                        {formatRemainingQuantity(t, locale, item.stock)}
                      </p>
                    ) : null}
                    <p className="text-sm font-medium text-card-foreground">
                      <span className="text-muted-foreground">
                        {t("common.lineTotal")}:{" "}
                      </span>
                      <span dir="ltr">
                        {formatPrice(Number(item.price) * item.quantity)}
                      </span>
                    </p>
                  </div>
                </div>
                );
              })}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <SheetFooter className="flex-col gap-3 border-t border-border bg-card/70 px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-5 backdrop-blur sm:px-7">
            <div className="flex w-full items-center justify-between">
              <span className="text-lg font-semibold text-foreground">
                {t("common.total")}:
              </span>
              <span className="text-xl font-bold text-foreground" dir="ltr" aria-live="polite">
                {formatPrice(getTotalPrice())}
              </span>
            </div>
            <div className="grid w-full grid-cols-[auto_1fr] gap-2">
              <Button
                variant="outline"
                onClick={handleClear}
                className="px-5"
              >
                {t("common.clearCart")}
              </Button>
              <Button asChild className="w-full">
                <Link href="/checkout" onClick={() => setCartOpen(false)}>
                  {t("common.checkout")}
                </Link>
              </Button>
            </div>
          </SheetFooter>
        )}
      </SheetContent>

    </Sheet>
  );
}
