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
import type { Locale } from "@/shared/i18n/routing";
import { toLocaleDigits } from "@/shared/lib/hours";
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
        // What the buyer asked for at the delivery step. Each line only
        // appears when it was actually chosen, so a request never carries a
        // preference the buyer did not express.
        latestOrder.delivery?.date
          ? `${t("checkout.deliveryDate")}: ${formatLocaleDate(latestOrder.delivery.date, locale as Locale)}`
          : "",
        latestOrder.delivery?.window
          ? `${t("checkout.deliveryWindow")}: ${latestOrder.delivery.window}`
          : "",
        latestOrder.delivery?.cardMessage
          ? `${t("checkout.cardMessage")}: ${latestOrder.delivery.cardMessage}`
          : "",
      ]
        .filter(Boolean)
        .join("\n")
    : "";

  return (
    <PageShell>
      {/* One centred column on the page's own ground. It was a full-height
          split with the confirmation reversed out of an ink panel beside the
          details — the storefront's last full-bleed dark slab outside the
          header and footer, and a composition that put the good news and what
          to do about it in two separate columns a reader had to cross between.
          Sage on the medallion, because sage is this system's colour for a
          thing that went right. */}
      <div className="store-container store-section-lg max-w-2xl text-center">
        <span className="mx-auto flex size-20 items-center justify-center rounded-full bg-leaf text-background">
          <CheckCircle2 className="size-9" aria-hidden="true" />
        </span>
        <p className="store-label mt-7">{t("checkout.successEyebrow")}</p>
        <h1 className="store-page-title mt-4">{t("checkout.successTitle")}</h1>
        <p className="store-lede mx-auto mt-5 max-w-[52ch] text-base text-muted-foreground">
          {t("checkout.successDescription")}
        </p>

        <section className="mt-12 text-start">
          <h2 className="store-section-title text-center text-foreground">
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
                  <dd className="text-base font-bold tabular-nums tracking-wide text-foreground" dir="ltr">
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
                  {toLocaleDigits(storefront.contact.mobilePhone, locale)}
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
        </section>
      </div>
    </PageShell>
  );
}
