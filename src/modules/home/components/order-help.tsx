import { getTranslations } from "next-intl/server";
import { MessageCircle, PhoneCall } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Link } from "@/shared/i18n/navigation";
import { getContactInfo } from "@/shared/lib/config";
import { formatBusinessHours, toLocaleDigits } from "@/shared/lib/hours";
import { telHref } from "@/shared/lib/utils";
import { getProperty } from "@/shared/property";

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
 * about response times, because nothing in the property configuration says so.
 *
 * Set on the warm brand surface rather than the ink one. Ink is what the footer
 * is made of, and an ink band directly above it merged into a single dark block
 * three screens tall — the page's last word lost its edges and read as chrome.
 */
export async function OrderHelp({ locale }: { locale: string }) {
  const t = await getTranslations({ locale });
  const contact = getContactInfo();
  const { social } = getProperty();
  const phone = contact.mobilePhone;
  const whatsappNumber = social.whatsappPhone?.trim();

  return (
    <section className="bg-storefront-brand-soft text-foreground">
      <div className="store-container store-section grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
        <div className="max-w-2xl">
          <h2 className="store-section-title text-foreground">
            {t("home.helpTitle")}
          </h2>
          <p className="store-lede mt-4 text-base text-foreground/80">
            {t("home.helpBody")}
          </p>
          <p className="mt-4 text-sm text-foreground/70">
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
                href={`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, "")}`}
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
            className="inline-flex min-h-11 items-center justify-center rounded-sm text-sm font-bold text-foreground underline decoration-foreground/35 underline-offset-8 transition-colors hover:text-primary hover:decoration-primary sm:px-2"
          >
            {t("home.helpContactLink")}
          </Link>
        </div>
      </div>
    </section>
  );
}
