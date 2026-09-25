"use client";

import { useCallback, useState } from "react";
import { useCart, type CartItem } from "../hooks/cart-context";
import { Button } from "@/shared/components/ui/button";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyMedia,
} from "@/shared/components/ui/empty";
import { Link } from "@/shared/i18n/navigation";
import { Minus, Plus, X } from "lucide-react";
import { useTranslations } from "@/shared/hooks/use-translations";
import { formatRemainingQuantity } from "@/modules/products";
import { SafeImage } from "@/shared/components/ui/safe-image";
import { useFormatPrice } from "@/shared/config/storefront-context";
import { createReadableResourcePath } from "@/shared/lib/slug-url";
import { PageShell } from "@/shared/components/layout/page-shell";
import { DynamicText } from "@/shared/components/dynamic-text";
import { toast } from "sonner";

/**
 * The cart, as a page.
 *
 * It replaces a slide-over drawer. The design gives the cart a page of its own
 * and the storefront now does too, for three reasons that outlast the design:
 * a cart is an address a shopper can return to and share between devices, it
 * has room for the line detail a 24rem drawer had to drop (the collection, the
 * unit price, the stock ceiling, the line total), and one cart surface cannot
 * drift from a second one.
 *
 * Composition is the design's own: the lines as warm plates down the left, the
 * summary as a raised card beside them, and both collapsing to one column at
 * the width where the pair stops fitting.
 */
export function CartPage() {
  const formatPrice = useFormatPrice();
  const {
    items,
    restoreCartItem,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalPrice,
    getTotalItems,
  } = useCart();
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

  const totalItems = getTotalItems();

  return (
    <PageShell>
      <section className="bg-background">
        <div className="store-container mx-auto max-w-[68.75rem] store-section-head pb-5 sm:pb-5">
          <h1 className="store-page-title text-foreground">
            {t("common.shoppingCart")}
          </h1>
        </div>
      </section>

      {items.length === 0 ? (
        <section className="bg-background">
          <div className="store-container mx-auto max-w-[68.75rem] pb-[7.5rem] pt-6">
            <Empty className="py-10">
              <EmptyHeader>
                <EmptyMedia variant="blob" aria-hidden="true" />
                <EmptyTitle className="font-display text-[1.625rem]">
                  {t("common.emptyCart")}
                </EmptyTitle>
                <EmptyDescription>{t("common.addSomeProducts")}</EmptyDescription>
              </EmptyHeader>
              <Button asChild size="lg" className="mt-6 h-[2.875rem] px-[1.625rem] text-[0.9375rem]">
                <Link href="/products">{t("common.shopNow")}</Link>
              </Button>
            </Empty>
          </div>
        </section>
      ) : (
        <section className="bg-background">
          <div className="store-container mx-auto grid max-w-[68.75rem] items-start gap-[clamp(1.75rem,4vw,2.75rem)] pb-[6.875rem] pt-[1.875rem] [grid-template-columns:repeat(auto-fit,minmax(min(100%,20rem),1fr))]">
            <div className="flex flex-col gap-4">
              {recentlyRemovedItem || recentlyClearedItems ? (
                <div
                  role="status"
                  className="flex items-center justify-between gap-3 rounded-full bg-clay-100 px-5 py-2 text-clay-800"
                >
                  <p className="store-dynamic-text line-clamp-2 text-sm" dir="auto">
                    {recentlyRemovedItem
                      ? t("common.removedFromCart", {
                          name: recentlyRemovedItem.name,
                        })
                      : t("common.cartCleared")}
                  </p>
                  <button
                    type="button"
                    className="shrink-0 rounded-full px-3 py-1 text-sm font-semibold underline underline-offset-4"
                    onClick={
                      recentlyRemovedItem ? handleUndoRemove : handleUndoClear
                    }
                  >
                    {t("common.undo")}
                  </button>
                </div>
              ) : null}

              {items.map((item) => {
                // The catalogue only tracks stock when it reports a count, so a
                // null ceiling means "as many as you like", not "none left".
                const atStockCeiling =
                  item.stock != null && item.quantity >= item.stock;
                const detailHref = `/products/${createReadableResourcePath(item.id, item.slug)}`;

                return (
                  <div
                    key={item.id}
                    className="flex flex-wrap items-center gap-x-5 gap-y-4 rounded-[1.875rem] bg-card p-4 pe-[1.375rem] text-card-foreground"
                  >
                    <Link
                      href={detailHref}
                      aria-hidden="true"
                      tabIndex={-1}
                      className="store-focus-inset organic-washed relative h-[6.75rem] w-[5.75rem] shrink-0 overflow-hidden rounded-[1.375rem] bg-secondary"
                    >
                      <SafeImage
                        src={item.thumbnail || item.image}
                        alt=""
                        fill
                        sizes="92px"
                        className="object-cover object-top transition-transform duration-300 hover:scale-[1.03]"
                        unoptimized
                      />
                    </Link>

                    <div className="min-w-[9rem] flex-1">
                      <h2 className="store-dynamic-text font-display text-[1.1875rem] leading-tight [.locale-fa_&]:leading-normal">
                        <Link
                          href={detailHref}
                          className="rounded-sm transition-colors hover:text-rose"
                        >
                          <DynamicText>{item.name}</DynamicText>
                        </Link>
                      </h2>
                      {item.category ? (
                        <p className="store-dynamic-text mt-1 text-[0.8125rem] text-card-foreground/65">
                          <DynamicText>{item.category}</DynamicText>
                        </p>
                      ) : null}
                      <p className="mt-1 text-[0.8125rem] text-card-foreground/65">
                        <span className="sr-only">{t("common.unitPrice")}: </span>
                        <span dir="ltr">
                          {formatPrice(item.price, item.formattedPrice)}
                        </span>
                      </p>
                      {/* Why the stepper stopped. Without it the + simply goes
                          dead and the shopper is left guessing whether the
                          button is broken or the shop is out. */}
                      {atStockCeiling && item.stock != null ? (
                        <p className="mt-1 text-xs font-semibold text-rose">
                          {formatRemainingQuantity(t, locale, item.stock)}
                        </p>
                      ) : null}
                    </div>

                    <div className="flex h-10 shrink-0 items-center gap-1 rounded-full border border-border px-[0.3125rem]">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 min-h-8 min-w-8"
                        disabled={item.quantity <= 1}
                        aria-label={t("common.decreaseQuantity")}
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        <Minus className="size-4" />
                      </Button>
                      <span
                        className="font-display w-[1.375rem] text-center text-[0.9375rem]"
                        aria-live="polite"
                      >
                        {numberFormat.format(item.quantity)}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 min-h-8 min-w-8"
                        disabled={atStockCeiling}
                        aria-label={t("common.increaseQuantity")}
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus className="size-4" />
                      </Button>
                    </div>

                    <p
                      className="font-display min-w-[7rem] shrink-0 text-end text-lg text-rose"
                      dir="ltr"
                    >
                      <span className="sr-only">{t("common.lineTotal")}: </span>
                      <span className="tabular-nums">
                        {formatPrice(Number(item.price) * item.quantity)}
                      </span>
                    </p>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="shrink-0 text-muted-foreground hover:text-foreground"
                      aria-label={t("common.removeItem")}
                      onClick={() => handleRemove(item)}
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                );
              })}

              <div className="flex flex-wrap items-center justify-between gap-3">
                <Link href="/products" className="store-text-action">
                  {t("common.keepShopping")}
                </Link>
                <button
                  type="button"
                  onClick={handleClear}
                  className="rounded-full px-2 py-1 text-[0.84375rem] text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground"
                >
                  {t("common.clearCart")}
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-3.5 rounded-[2rem] bg-card p-7 text-card-foreground shadow-panel store-sticky-lg">
              <h2 className="font-display text-[1.3125rem] leading-tight">
                {t("checkout.orderSummary")}
              </h2>

              <div className="flex justify-between gap-3 text-[0.90625rem] text-card-foreground/80">
                <span>{t("checkout.subtotal")}</span>
                <span dir="ltr" className="tabular-nums">
                  {formatPrice(getTotalPrice())}
                </span>
              </div>
              <div className="flex justify-between gap-3 text-[0.90625rem] text-card-foreground/80">
                <span>{t("common.itemsCount", { count: totalItems })}</span>
                <span className="tabular-nums">
                  {numberFormat.format(totalItems)}
                </span>
              </div>

              <div className="font-display flex justify-between gap-3 border-t border-border pt-3.5 text-xl">
                <span>{t("common.total")}</span>
                <span className="text-rose" dir="ltr" aria-live="polite">
                  {formatPrice(getTotalPrice())}
                </span>
              </div>

              <Button asChild size="lg" className="mt-2 h-12 w-full text-[0.9375rem]">
                <Link href="/checkout">{t("common.checkout")}</Link>
              </Button>

              {/* Delivery is quoted by the studio once the address is known, so
                  the summary says so rather than printing a shipping line the
                  storefront would have to invent. */}
              <p className="text-[0.78125rem] leading-5 text-card-foreground/60">
                {t("common.cartDeliveryNote")}
              </p>
            </div>
          </div>
        </section>
      )}
    </PageShell>
  );
}
