import { getTranslations } from "next-intl/server";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { HeroArtwork } from "./hero-artwork";
import { Button } from "@/shared/components/ui/button";
import { Link } from "@/shared/i18n/navigation";
import { isRtlLocale } from "@/shared/lib/locale";
import { getRequestTheme } from "@/shared/lib/theme-server";
import { getProperty, getPropertyName } from "@/shared/property";

interface HeroProps {
  locale: string;
  /** Buyable products in the catalogue right now, or null if unknown. */
  inStockTotal: number | null;
  /** How many collections the shop sells, for the breadth line. */
  collectionCount: number;
}

/**
 * The homepage's one job above the fold: say what the shop sells, and open the
 * catalogue. One button, because a hero with two equal buttons has no primary
 * action — the discovery band directly below is the second path, and it is a
 * whole screen of real categories rather than a competing label.
 *
 * Under the button sit two facts rather than three slogans: how much is
 * actually buyable, and across how many collections. Both are counted from the
 * catalogue the page has already loaded, so neither can drift into a promise
 * the storefront cannot keep, and both answer the question the band directly
 * below is about to act on. Opening hours are stated once, at the foot of the
 * page beside the phone number a shopper would use them with; phone and address
 * stay in the utility bar and footer, where they already are.
 */
export async function Hero({
  locale,
  inStockTotal,
  collectionCount,
}: HeroProps) {
  const t = await getTranslations({ locale });
  const property = getProperty();
  const storeName = getPropertyName(locale);
  const ArrowIcon = isRtlLocale(locale) ? ArrowLeft : ArrowRight;
  const initialTheme = await getRequestTheme();
  const lightImage =
    property.heroImageLight?.trim() || property.heroImageDark?.trim() || null;
  const darkImage =
    property.heroImageDark?.trim() || property.heroImageLight?.trim() || null;

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
    <section className="store-section-sm bg-background">
      <div className="store-container">
        <div className="grid overflow-hidden rounded-3xl border border-border/80 bg-card shadow-panel lg:min-h-[min(34rem,calc(100svh-10rem))] lg:grid-cols-2">
          <div className="flex items-center px-6 py-10 sm:px-10 sm:py-12 lg:px-12 lg:py-14 xl:px-16">
            <div className="max-w-xl">
              <p className="store-eyebrow">{t("home.heroBadge")}</p>
              <h1 className="font-display mt-4 text-[clamp(2.5rem,9vw,4rem)] leading-[1.04] text-foreground [.locale-fa_&]:leading-[1.35] lg:mt-5 lg:text-[clamp(3rem,4vw,3.5rem)]">
                {t("home.title")}
              </h1>
              <p className="store-lede mt-5 max-w-lg text-base sm:text-lg">
                {t("home.subtitle")}
              </p>
              <Button
                asChild
                size="lg"
                className="group mt-7 min-w-44 justify-between px-7"
              >
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

              {/* A list, not three headings: supporting facts under the action.
                  The separator is drawn between items so it never dangles at
                  the end of a wrapped row. With an unreachable catalogue there
                  are no facts to state, and the rule above them would be a line
                  under nothing. */}
              {facts.length > 0 ? (
                <ul className="mt-7 flex flex-wrap items-center gap-x-3 gap-y-1.5 border-t border-border/70 pt-5 text-sm text-muted-foreground">
                  {facts.map((fact, index) => (
                    <li key={fact} className="flex items-center gap-3">
                      {index > 0 ? (
                        <span className="petal-dot" aria-hidden="true" />
                      ) : null}
                      <span>{fact}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </div>

          <div className="relative min-h-72 overflow-hidden bg-secondary sm:min-h-96 lg:min-h-0">
            <HeroArtwork
              lightImage={lightImage}
              darkImage={darkImage}
              initialTheme={initialTheme}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
