import { getTranslations } from "next-intl/server";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Image from "next/image";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Link } from "@/shared/i18n/navigation";
import { isRtlLocale } from "@/shared/lib/locale";
import { getStorefrontName } from "@/shared/config/storefront";

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
 * Under the buttons sit facts rather than slogans: how much is actually
 * buyable, and across how many collections. Both are counted from the
 * catalogue the page has already loaded, so neither can drift into a promise
 * the storefront cannot keep, and both answer the question the discovery band
 * below is about to act on. (The source design floats a hand-set "11k bouquets
 * tied by hand" plaque over the artwork; there is no such number in the API and
 * inventing one is the exact failure this paragraph exists to prevent, so the
 * plaque is not reproduced.)
 */
export async function Hero({
  locale,
  inStockTotal,
  collectionCount,
}: HeroProps) {
  const t = await getTranslations({ locale });
  const storeName = getStorefrontName(locale);
  const ArrowIcon = isRtlLocale(locale) ? ArrowLeft : ArrowRight;

  const formatCount = new Intl.NumberFormat(locale);
  const facts = [
    inStockTotal && inStockTotal > 0
      ? t("home.heroInStock", { count: formatCount.format(inStockTotal) })
      : null,
    // "1 collection" is not a range worth advertising, so a shop with one
    // simply does not make the claim.
    collectionCount > 1
      ? t("home.heroCollections", { count: formatCount.format(collectionCount) })
      : null,
  ].filter((fact): fact is string => Boolean(fact));

  return (
    <section className="organic-hero-shell bg-background">
      <div className="store-container">
        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <div>
            <Badge variant="sage" className="px-3.5 py-1.5 text-xs">
              {t("home.heroBadge")}
            </Badge>
            <h1 className="font-display mt-5 text-[clamp(2.6rem,5.6vw,4.15rem)] leading-[1.02] tracking-[-0.02em] text-foreground [.locale-fa_&]:leading-[1.3] [.locale-fa_&]:tracking-normal">
              {t("home.title")}
            </h1>
            <p className="store-lede mt-6 max-w-[44ch] text-base text-muted-foreground sm:text-lg">
              {t("home.subtitle")}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button asChild size="lg" className="group px-7">
                <Link
                  href="/products"
                  aria-label={`${t("common.shopNow")} — ${storeName}`}
                >
                  {t("common.shopNow")}
                  <ArrowIcon
                    className="size-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none rtl:group-hover:-translate-x-0.5"
                    aria-hidden="true"
                  />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="px-7">
                <a href="#collections">{t("home.heroExplore")}</a>
              </Button>
            </div>

            {/* A list, not three headings: supporting facts under the action,
                marked by the system's dot rather than boxed in a pill. With an
                unreachable catalogue there are no facts to state and the row
                disappears rather than leaving an empty rule. */}
            {facts.length > 0 ? (
              <ul className="mt-10 flex flex-wrap items-center gap-x-7 gap-y-3 text-sm text-muted-foreground">
                {facts.map((fact) => (
                  <li key={fact} className="flex items-center gap-2.5">
                    <span className="petal-dot" aria-hidden="true" />
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
          </div>
        </div>
      </div>
    </section>
  );
}
