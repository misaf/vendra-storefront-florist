import { getTranslations } from "next-intl/server";
import { MessageCircle, PhoneCall } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Link } from "@/shared/i18n/navigation";
import { getStorefrontConfig } from "@/shared/config/storefront";
import { formatBusinessHours, toLocaleDigits } from "@/shared/lib/hours";
import { telHref } from "@/shared/lib/utils";
import { whatsappUrl } from "@/shared/lib/social-url";

/**
 * The page's closing band, and its second conversion path.
 *
 * Not another "shop now": by this point the shopper has been offered the
 * catalogue three times and has read to the bottom without taking it, which
 * usually means the decision is the hard part — a sympathy arrangement, a
 * wedding car, a budget and a date. Every florist sells those by talking, so
 * the page ends by opening that line instead of repeating the first one.
 *
 * Every fact here is configuration the storefront already holds: the shop's
 * number, its messaging account and its opening hours. Nothing is promised
 * about response times, because nothing in the store configuration says so.
 *
 * Set on the system's warm card surface — the same one the assurances band
 * uses — so the two supporting bands on this page are made of the same
 * material. It was previously `--storefront-brand-soft`, which is sand-800:
 * an ink fill carrying `text-foreground`, so the heading measured 1.55:1
 * against its own background and the hours line below it worse. Nothing on the
 * page needs a third surface, and the one it was reaching for was unreadable.
 */
export async function OrderHelp({ locale }: { locale: string }) {
  const t = await getTranslations({ locale });
  const contact = getStorefrontConfig().contact;
  const { social } = getStorefrontConfig();
  const phone = contact.mobilePhone;
  const whatsappNumber = social.whatsappPhone?.trim();

  return (
    <section className="bg-card text-card-foreground">
      <div className="store-container store-section grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
        <div className="max-w-2xl">
          <h2 className="store-section-title text-card-foreground">
            {t("home.helpTitle")}
          </h2>
          <p className="store-lede mt-4 text-base text-muted-foreground">
            {t("home.helpBody")}
          </p>
          <p className="mt-4 text-sm text-muted-foreground">
            {t("home.helpHours", {
              hours: formatBusinessHours(
                contact.hoursOpen,
                contact.hoursClose,
                locale
              ),
            })}
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
          <Button asChild size="lg">
            {/* A plain anchor: `tel:` is not an app route. */}
            <a href={telHref(phone)}>
              <PhoneCall className="size-4" aria-hidden="true" />
              <span className="sr-only">{t("common.callStore")}</span>
              <span dir="ltr">{toLocaleDigits(phone, locale)}</span>
            </a>
          </Button>

          {whatsappNumber ? (
            <Button asChild size="lg" variant="outline" className="bg-transparent">
              <a
                href={whatsappUrl(whatsappNumber)}
                target="_blank"
                rel="noreferrer"
              >
                <MessageCircle className="size-4" aria-hidden="true" />
                {t("common.shareOnWhatsApp")}
              </a>
            </Button>
          ) : null}

          <Link
            href="/contact"
            className="inline-flex min-h-11 items-center justify-center rounded-sm text-sm font-bold text-card-foreground underline decoration-border underline-offset-8 transition-colors hover:text-primary hover:decoration-primary sm:px-2"
          >
            {t("home.helpContactLink")}
          </Link>
        </div>
      </div>
    </section>
  );
}
