import { getTranslations } from "next-intl/server";
import { PhoneCall } from "lucide-react";
import Image from "next/image";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Link } from "@/shared/i18n/navigation";
import { toLocaleDigits } from "@/shared/lib/hours";
import { telHref } from "@/shared/lib/utils";
import { getStorefrontConfig, getStorefrontName } from "@/shared/config/storefront";

/**
 * The florist template's own hero art.
 *
 * Bundled rather than configured: Vendra's provisioner has no hero-image field,
 * so a config-driven source resolved to null in every real container and the
 * panel rendered empty. Imagery is what makes this image the *florist*
 * storefront — a shop that wants different art wants a different template.
 */
const HERO_ARTWORK = "/hero-florist-studio.webp";

interface HeroProps {
  locale: string;
  /** Buyable products in the catalogue right now, or null if unknown. */
  inStockTotal: number | null;
  /** How many collections the shop sells, for the breadth line. */
  collectionCount: number;
}

/**
 * The homepage's one job above the fold: say what the shop sells, and open the
 * catalogue.
 *
 * The Organic system composes this as a split rather than a full-bleed plate:
 * the words sit on the cream page at full contrast, and the photograph is cut
 * into an arch beside them. That is a straight trade of the old arrangement's
 * scrim — a 96%-opaque gradient laid over the picture so white text could
 * survive on top of it, which meant two thirds of the artwork was being paid
 * for in bytes and then covered up.
 *
 * The design floats a plaque off the arch's leading edge carrying one number
 * about the shop. Here that number is counted from the catalogue the page has
 * already loaded — how much is actually buyable — rather than hand-set, so it
 * cannot drift into a promise the storefront will not keep. With an
 * unreachable catalogue there is no number, and the plaque is simply not drawn.
 */
export async function Hero({
  locale,
  inStockTotal,
  collectionCount,
}: HeroProps) {
  const t = await getTranslations({ locale });
  const storeName = getStorefrontName(locale);
  const phone = getStorefrontConfig().contact.mobilePhone;

  const formatCount = new Intl.NumberFormat(locale);
  /* The plaque's number, set the way the design sets it: compact, so a large
     catalogue reads "11K" at the width the plate allows rather than spilling
     "11,482" across the label beside it. A small catalogue is unaffected —
     compact notation leaves anything under a thousand exactly as it is. */
  const formatPlaqueCount = new Intl.NumberFormat(locale, {
    notation: "compact",
    maximumFractionDigits: 1,
  });
  /* Three short assurances under the actions, as the design sets them: two
     from the shop's standing promises and one counted from the catalogue.
     "1 collection" is not a range worth advertising, so a shop with one simply
     does not make the claim. */
  const facts = [
    t("home.heroQuality"),
    t("home.heroDelivery"),
    collectionCount > 1
      ? t("home.heroCollections", { count: formatCount.format(collectionCount) })
      : null,
  ].filter((fact): fact is string => Boolean(fact));

  return (
    <section className="organic-hero-shell bg-background">
      <div className="store-container">
        <div className="grid items-center gap-[clamp(2.125rem,5vw,4rem)] [grid-template-columns:repeat(auto-fit,minmax(min(100%,23.75rem),1fr))]">
          <div>
            <Badge variant="sage" className="px-3.5 py-1.5 text-xs">
              {t("home.heroBadge")}
            </Badge>
            <h1 className="font-display mt-3.5 text-[clamp(2.875rem,5.6vw,5.125rem)] leading-[0.98] tracking-[-0.02em] text-foreground [.locale-fa_&]:leading-[1.3] [.locale-fa_&]:tracking-normal">
              {t("home.title")}
            </h1>
            <p className="store-lede mt-5 max-w-[44ch] text-lg leading-[1.62] text-foreground/78">
              {t("home.subtitle")}
            </p>

            {/* Two ways in, as the design pairs them: the catalogue, and the
                shop's phone. A florist sells the order that needs a
                conversation — a sympathy arrangement, a wedding, a date and a
                budget — by talking, and that line belongs here rather than only
                at the foot of the page. Tinted rather than outlined, so it
                reads as the quieter of two offers without becoming a second
                filled button beside the primary. */}
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Button asChild size="lg" className="h-12 px-[1.625rem] text-[0.9375rem]">
                <Link
                  href="/products"
                  aria-label={`${t("common.shopNow")} — ${storeName}`}
                >
                  {t("common.shopNow")}
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="secondary"
                className="h-12 gap-2.5 bg-clay-100 px-[1.375rem] text-[0.9375rem] text-clay-800 hover:bg-clay-200"
              >
                {/* A plain anchor: `tel:` is not an app route. */}
                <a href={telHref(phone)}>
                  <PhoneCall className="size-4" aria-hidden="true" />
                  <span className="sr-only">{t("common.callStore")}</span>
                  <span dir="ltr">{toLocaleDigits(phone, locale)}</span>
                </a>
              </Button>
            </div>

            {/* A list, not three headings: supporting facts under the action,
                marked by the system's dot rather than boxed in a pill. */}
            {facts.length > 0 ? (
              <ul className="mt-10 flex flex-wrap items-center gap-x-7 gap-y-2.5 text-[0.84375rem] text-foreground/70">
                {facts.map((fact) => (
                  <li key={fact} className="flex items-center gap-2.5">
                    <span
                      className="size-[0.4375rem] shrink-0 rounded-full bg-rose"
                      aria-hidden="true"
                    />
                    <span>{fact}</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          {/* The arch. `4/5` upright, round at the head, barely eased at the
              foot — the system's tall plate, and the one shape on the homepage
              that is not a rounded rectangle. */}
          <div className="relative">
            <div className="organic-arch-tall organic-washed relative aspect-[4/5] overflow-hidden bg-secondary shadow-panel max-lg:mx-auto max-lg:max-w-md">
              <Image
                src={HERO_ARTWORK}
                alt=""
                fill
                sizes="(min-width: 1024px) 38rem, (min-width: 640px) 28rem, calc(100vw - 2rem)"
                quality={85}
                priority
                className="object-cover object-[58%_center]"
              />
            </div>

            {/* The plaque, cut off the plate's leading edge. It is pinned
                inside the column on a phone — hung outside, it would sit under
                the viewport's own edge — and only steps out at the width where
                the two columns separate. */}
            {inStockTotal && inStockTotal > 0 ? (
              <div className="absolute bottom-8 start-2 flex items-center gap-3 rounded-full bg-background py-3.5 pe-[1.375rem] ps-[1.375rem] shadow-card lg:bottom-[3.375rem] lg:-start-[1.625rem]">
                <span className="font-display text-[1.625rem] leading-none text-rose">
                  {formatPlaqueCount.format(inStockTotal)}
                </span>
                <span className="max-w-[13ch] text-[0.78125rem] leading-[1.3] text-foreground/70">
                  {t("home.heroPlaqueLabel")}
                </span>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
