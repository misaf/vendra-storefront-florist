"use client";

import { Link } from "@/shared/i18n/navigation";
import { PageShell } from "@/shared/components/layout/page-shell";
import { Button } from "@/shared/components/ui/button";
import { useOrders } from "@/modules/account";
import { useStorefrontConfig } from "@/shared/config/storefront-context";
import { useTranslations } from "@/shared/hooks/use-translations";
import { useHydrated } from "@/shared/hooks/use-hydrated";
import { useFormatPrice } from "@/shared/config/storefront-context";
import { formatLocaleDate } from "@/shared/lib/date";
import { CheckCircle2, MessageCircle, Phone } from "lucide-react";
import { telHref } from "@/shared/lib/utils";
import { whatsappUrl } from "@/shared/lib/social-url";

export default function CheckoutSuccess() {
  const { t, locale } = useTranslations();
  const { orders } = useOrders();
  const storefront = useStorefrontConfig();
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
      <div className="grid min-h-[calc(100vh-7rem)] lg:grid-cols-[0.9fr_1.1fr]">
        <section className="flex bg-storefront-brand px-6 py-14 text-storefront-brand-foreground sm:px-10 sm:py-20 lg:items-center lg:px-[max(3rem,8vw)]">
          <div className="max-w-xl">
            <div className="flex size-16 items-center justify-center rounded-t-full bg-storefront-brand-foreground text-storefront-brand">
              <CheckCircle2 className="size-8" aria-hidden="true" />
            </div>
            <p className="mt-8 font-mono text-xs font-semibold uppercase tracking-[0.22em] text-storefront-brand-foreground/65">
              {t("checkout.successEyebrow")}
            </p>
            <h1 className="font-display mt-4 text-4xl leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
              {t("checkout.successTitle")}
            </h1>
            <p className="mt-5 text-sm leading-7 text-storefront-brand-foreground/75 sm:text-base">
              {t("checkout.successDescription")}
            </p>
          </div>
        </section>

        <section className="flex items-center bg-background px-5 py-12 sm:px-10 sm:py-16 lg:px-[max(3rem,8vw)]">
          <div className="w-full max-w-xl">
            <p className="store-eyebrow">{t("checkout.stepConfirm")}</p>
            <h2 className="font-display mt-4 text-3xl leading-tight tracking-tight sm:text-4xl">
              {t("checkout.successNextTitle")}
            </h2>

            <div className="mt-8 space-y-6">
              {/* The reference, the date and what was paid. Without them the
                  screen said an order existed but gave the customer nothing to
                  quote back to the shop if anything went wrong. */}
              {latestOrder ? (
              <dl className="border-y border-border text-start text-sm">
                <div className="flex flex-wrap items-baseline justify-between gap-2 py-3.5">
                  <dt className="text-muted-foreground">
                    {t("common.orderReference")}
                  </dt>
                  <dd className="font-mono text-base font-bold tracking-wide text-foreground" dir="ltr">
                    {latestOrder.id}
                  </dd>
                </div>
                <div className="flex flex-wrap items-baseline justify-between gap-2 border-t border-border py-3.5">
                  <dt className="text-muted-foreground">{t("common.orderDate")}</dt>
                  <dd className="text-foreground">
                    {formatLocaleDate(latestOrder.date, locale)}
                  </dd>
                </div>
                <div className="flex flex-wrap items-baseline justify-between gap-2 border-t border-border py-3.5">
                  <dt className="text-muted-foreground">{t("common.orderTotal")}</dt>
                  <dd className="font-semibold text-foreground" dir="ltr">
                    {formatPrice(latestOrder.total)}
                  </dd>
                </div>
              </dl>
              ) : null}
              <div className="border-s-2 border-primary bg-secondary/45 px-5 py-4">
              <p className="text-sm leading-7 text-muted-foreground">
                {t("checkout.successDetails")}
              </p>
              </div>

            {/* No order endpoint exists. The primary next step therefore sends
                the complete request (items, total and delivery details), not a
                browser-only reference that the shop could never look up. */}
              <div className="grid gap-3 sm:grid-cols-2">
              <Button asChild className="w-full gap-2">
                <a
                  href={whatsappUrl(
                    storefront.social.whatsappPhone,
                    whatsappMessage
                  )}
                  target="_blank"
                  rel="noreferrer"
                >
                  <MessageCircle className="size-4" aria-hidden="true" />
                  {t("checkout.confirmOnWhatsApp")}
                </a>
              </Button>
              <Button asChild variant="outline" className="w-full gap-2">
                <a href={telHref(storefront.contact.mobilePhone)} dir="ltr">
                  <Phone className="size-4" aria-hidden="true" />
                  <span className="sr-only">{t("common.callStore")}</span>
                  {storefront.contact.mobilePhone}
                </a>
              </Button>
              </div>

              <div className="flex flex-col gap-2 border-t border-border pt-5 sm:flex-row">
              <Button asChild variant="outline" className="w-full sm:w-auto">
                <Link href="/products">{t("checkout.continueShopping")}</Link>
              </Button>
              <Button asChild variant="ghost" className="w-full sm:w-auto">
                <Link href="/">{t("checkout.backToHome")}</Link>
              </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </PageShell>
  );
}
