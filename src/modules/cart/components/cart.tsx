"use client";

import { useState } from "react";
import { useCart } from "@/modules/cart";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/shared/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyMedia } from "@/shared/components/ui/empty";
import { Link } from "@/shared/i18n/navigation";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { useTranslations } from "@/shared/hooks/use-translations";

import { SafeImage } from "@/shared/components/ui/safe-image";
import { useBrandIcon } from "@/shared/property/use-brand-icon";
import { useFormatPrice } from "@/shared/property/use-format-price";

export function Cart() {
  const formatPrice = useFormatPrice();
  const {
    items,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalPrice,
    getTotalItems,
    isCartOpen,
    setCartOpen,
  } = useCart();
  const BrandIcon = useBrandIcon();
  const { t } = useTranslations();
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);

  return (
    <Sheet open={isCartOpen} onOpenChange={setCartOpen}>
      <SheetContent className="flex w-full flex-col sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            {t("common.shoppingCart")} ({getTotalItems()})
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-4">
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
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 rounded-lg border border-border bg-card p-4 text-card-foreground"
                >
                  <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md bg-muted">
                    <SafeImage
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <div className="flex flex-1 flex-col gap-2">
                    <div>
                      <h3 className="font-medium text-card-foreground">
                        {item.name}
                      </h3>
                      <p className="text-sm text-muted-foreground" dir="ltr">
                        {formatPrice(item.price, item.formattedPrice)}
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          disabled={item.quantity <= 1}
                          aria-label={t("common.decreaseQuantity")}
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-8 text-center text-sm font-medium">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
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
                        onClick={() => removeFromCart(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-sm font-medium text-card-foreground" dir="ltr">
                      {formatPrice(Number(item.price) * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <SheetFooter className="flex-col gap-2 sm:flex-row">
            <div className="flex w-full items-center justify-between border-t border-border pt-4">
              <span className="text-lg font-semibold text-foreground">
                {t("common.total")}:
              </span>
              <span className="text-xl font-bold text-foreground" dir="ltr">
                {formatPrice(getTotalPrice())}
              </span>
            </div>
            <div className="flex w-full gap-2">
              <Button
                variant="outline"
                onClick={() => setConfirmClearOpen(true)}
                className="flex-1"
              >
                {t("common.clearCart")}
              </Button>
              <Button asChild className="flex-1">
                <Link href="/checkout" onClick={() => setCartOpen(false)}>
                  {t("common.checkout")}
                </Link>
              </Button>
            </div>
          </SheetFooter>
        )}
      </SheetContent>

      <Dialog open={confirmClearOpen} onOpenChange={setConfirmClearOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{t("common.clearCartTitle")}</DialogTitle>
            <DialogDescription>{t("common.clearCartConfirm")}</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-2">
            <DialogClose asChild>
              <Button variant="outline" className="flex-1">
                {t("common.cancel")}
              </Button>
            </DialogClose>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={() => {
                clearCart();
                setConfirmClearOpen(false);
              }}
            >
              {t("common.clearCart")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Sheet>
  );
}
