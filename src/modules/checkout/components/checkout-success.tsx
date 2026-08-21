"use client";

import { Link } from "@/shared/i18n/navigation";
import { PageShell } from "@/shared/components/layout/page-shell";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader } from "@/shared/components/ui/card";
import { useOrders } from "@/modules/account";
import { useProperty } from "@/shared/property/property-provider";
import { useTranslations } from "@/shared/hooks/use-translations";
import { useHydrated } from "@/shared/hooks/use-hydrated";
import { useFormatPrice } from "@/shared/property/use-format-price";
import { formatLocaleDate } from "@/shared/lib/date";
import { CheckCircle2, MessageCircle, Phone } from "lucide-react";
import { telHref } from "@/shared/lib/utils";

export default function CheckoutSuccess() {
  const { t, locale } = useTranslations();
  const { orders } = useOrders();
  const property = useProperty();
  const formatPrice = useFormatPrice();
  // Orders live in localStorage, so the first render cannot know them. Until
  // then the screen shows the confirmation without a reference rather than
  // flashing an empty one.
  const hydrated = useHydrated();
  const latestOrder = hydrated ? orders[0] : undefined;
  const numberFormat = new Intl.NumberFormat(locale);
  const whatsappMessage = latestOrder
    ? [
        t("checkout.orderMessage", { reference: latestOrder.id }),
        ...latestOrder.items.map(
          (item) =>
            `${numberFormat.format(item.quantity)} × ${item.name} — ${formatPrice(
              item.price * item.quantity
            )}`
        ),
        `${t("common.orderTotal")}: ${formatPrice(latestOrder.total)}`,
        latestOrder.shippingAddress
          ? [
              `${latestOrder.shippingAddress.firstName} ${latestOrder.shippingAddress.lastName}`,
              `${t("contact.phone")}: ${latestOrder.shippingAddress.phone}`,
              `${t("contact.address")}: ${latestOrder.shippingAddress.address}, ${latestOrder.shippingAddress.city}, ${latestOrder.shippingAddress.zipCode}, ${latestOrder.shippingAddress.country}`,
            ].join("\n")
          : "",
      ]
        .filter(Boolean)
        .join("\n")
    : "";

  return (
    <PageShell showFooter={false}>
      <div className="flex min-h-[calc(100vh-7rem)] items-center justify-center px-4 py-12">
        <Card className="w-full max-w-lg border-0 bg-card/70 px-2 py-8 text-center shadow-xl shadow-foreground/5 sm:px-6 sm:py-12">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h1 className="store-page-title">
              {t("checkout.successTitle")}
            </h1>
            <CardDescription className="text-base">
              {t("checkout.successDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* The reference, the date and what was paid. Without them the
                screen said an order existed but gave the customer nothing to
                quote back to the shop if anything went wrong. */}
            {latestOrder ? (
              <dl className="rounded-lg border border-border bg-card p-4 text-start text-sm">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <dt className="text-muted-foreground">
                    {t("common.orderReference")}
                  </dt>
                  <dd className="font-mono text-base font-bold tracking-wide text-foreground" dir="ltr">
                    {latestOrder.id}
                  </dd>
                </div>
                <div className="mt-2 flex flex-wrap items-baseline justify-between gap-2 border-t border-border pt-2">
                  <dt className="text-muted-foreground">{t("common.orderDate")}</dt>
                  <dd className="text-foreground">
                    {formatLocaleDate(latestOrder.date, locale)}
                  </dd>
                </div>
                <div className="mt-2 flex flex-wrap items-baseline justify-between gap-2 border-t border-border pt-2">
                  <dt className="text-muted-foreground">{t("common.orderTotal")}</dt>
                  <dd className="font-semibold text-foreground" dir="ltr">
                    {formatPrice(latestOrder.total)}
                  </dd>
                </div>
              </dl>
            ) : null}
            <div className="rounded-lg bg-muted p-4">
              <p className="text-sm text-muted-foreground">
                {t("checkout.successDetails")}
              </p>
            </div>

            {/* No order endpoint exists. The primary next step therefore sends
                the complete request (items, total and delivery details), not a
                browser-only reference that the shop could never look up. */}
            <div className="grid gap-2 sm:grid-cols-2">
              <Button asChild className="w-full gap-2">
                <a
                  href={`https://wa.me/${property.social.whatsappPhone.replace(/\D/g, "")}${
                    whatsappMessage
                      ? `?text=${encodeURIComponent(whatsappMessage)}`
                      : ""
                  }`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <MessageCircle className="size-4" aria-hidden="true" />
                  {t("checkout.confirmOnWhatsApp")}
                </a>
              </Button>
              <Button asChild variant="outline" className="w-full gap-2">
                <a href={telHref(property.contact.mobilePhone)} dir="ltr">
                  <Phone className="size-4" aria-hidden="true" />
                  <span className="sr-only">{t("common.callStore")}</span>
                  {property.contact.mobilePhone}
                </a>
              </Button>
            </div>

            <div className="flex flex-col gap-2">
              <Button asChild variant="outline" className="w-full">
                <Link href="/products">{t("checkout.continueShopping")}</Link>
              </Button>
              <Button asChild variant="ghost" className="w-full">
                <Link href="/">{t("checkout.backToHome")}</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
