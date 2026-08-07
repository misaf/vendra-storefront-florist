"use client";

import { useFavorites, useOrders, type Order } from "@/modules/account";
import { useCart } from "@/modules/cart";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/shared/components/ui/sheet";
import { Button } from "@/shared/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { Badge } from "@/shared/components/ui/badge";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/shared/components/ui/empty";
import { Link } from "@/shared/i18n/navigation";
import {
  Heart,
  Package,
  User,
  Trash2,
  ShoppingBag,
  Calendar,
  type LucideIcon,
} from "lucide-react";
import type { ComponentProps } from "react";
import { useTranslations } from "@/shared/hooks/use-translations";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { formatLocaleDate } from "@/shared/lib/date";
import { SafeImage } from "@/shared/components/ui/safe-image";
import { toast } from "sonner";
import { useFormatPrice } from "@/shared/property/use-format-price";

interface UserPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const STATUS_BADGE_VARIANT: Record<
  Order["status"],
  ComponentProps<typeof Badge>["variant"]
> = {
  pending: "outline",
  processing: "outline",
  shipped: "secondary",
  delivered: "default",
  cancelled: "destructive",
};

/** Shared empty state for the favorites/orders tabs: a neutral icon and a
 *  real "Shop Now" CTA that closes the panel. */
function EmptyTab({
  icon: Icon,
  title,
  description,
  onShop,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  onShop: () => void;
}) {
  const { t } = useTranslations();
  return (
    <Empty className="py-12">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Icon className="h-6 w-6" />
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button asChild>
          <Link href="/products" onClick={onShop}>
            {t("common.shopNow")}
          </Link>
        </Button>
      </EmptyContent>
    </Empty>
  );
}

export function UserPanel({ open, onOpenChange }: UserPanelProps) {
  const formatPrice = useFormatPrice();
  const { favorites, removeFromFavorites, addToFavorites } = useFavorites();
  const { orders } = useOrders();
  const { addToCart, openCart } = useCart();
  const { t, locale } = useTranslations();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {t("common.myAccount")}
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-4">
          <Tabs defaultValue="favorites" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="favorites" className="flex items-center gap-2">
                <Heart className="h-4 w-4" />
                {t("common.favorites")}
              </TabsTrigger>
              <TabsTrigger value="orders" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                {t("common.orderHistory")}
              </TabsTrigger>
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                {t("common.profile")}
              </TabsTrigger>
            </TabsList>

            {/* Favorites Tab */}
            <TabsContent value="favorites" className="mt-4">
              {favorites.length === 0 ? (
                <EmptyTab
                  icon={Heart}
                  title={t("common.emptyFavorites")}
                  description={t("common.addSomeFavorites")}
                  onShop={() => onOpenChange(false)}
                />
              ) : (
                <div className="space-y-4">
                  {favorites.map((item) => (
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
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => {
                              addToCart(item);
                              onOpenChange(false);
                              toast.success(
                                t("common.addedToCart", { name: item.name }),
                                {
                                  action: {
                                    label: t("common.viewCart"),
                                    onClick: openCart,
                                  },
                                }
                              );
                            }}
                          >
                            <ShoppingBag className="me-2 h-4 w-4" />
                            {t("common.addToCart")}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            aria-label={t("common.removeFromFavorites")}
                            onClick={() => {
                              removeFromFavorites(item.id);
                              toast.success(
                                t("common.removedFromFavorites", {
                                  name: item.name,
                                }),
                                {
                                  action: {
                                    label: t("common.undo"),
                                    onClick: () => addToFavorites(item),
                                  },
                                }
                              );
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Order History Tab */}
            <TabsContent value="orders" className="mt-4">
              {orders.length === 0 ? (
                <EmptyTab
                  icon={Package}
                  title={t("common.emptyOrders")}
                  description={t("common.startShopping")}
                  onShop={() => onOpenChange(false)}
                />
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <Card key={order.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">
                            {t("common.orderNumber")} {order.id.slice(-8).toUpperCase()}
                          </CardTitle>
                          <Badge variant={STATUS_BADGE_VARIANT[order.status]}>
                            {t(`common.${order.status}`)}
                          </Badge>
                        </div>
                        <CardDescription className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {formatLocaleDate(order.date, locale)}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {order.items.slice(0, 3).map((item) => (
                            <div key={item.id} className="flex gap-3">
                              <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-md bg-muted">
                                <SafeImage
                                  src={item.image}
                                  alt={item.name}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <div className="flex flex-1 flex-col">
                                <p className="text-sm font-medium text-card-foreground">
                                  {item.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {t("common.quantity")}: {item.quantity} ×{" "}
                                  <span dir="ltr">
                                    {formatPrice(item.price, item.formattedPrice)}
                                  </span>
                                </p>
                              </div>
                            </div>
                          ))}
                          {order.items.length > 3 && (
                            <p className="text-sm text-muted-foreground">
                              +{order.items.length - 3} {t("common.productsAvailablePlural")}
                            </p>
                          )}
                        </div>
                        <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                          <span className="text-sm font-medium text-card-foreground">
                            {t("common.orderTotal")}:
                          </span>
                          <span className="text-lg font-bold text-card-foreground" dir="ltr">
                            {formatPrice(order.total)}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Profile Tab */}
            <TabsContent value="profile" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>{t("common.profile")}</CardTitle>
                  <CardDescription>{t("common.myAccount")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                      <User className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {t("common.profileComingSoon")}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
}
