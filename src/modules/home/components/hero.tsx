import { getTranslations } from "next-intl/server";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Image from "next/image";
import { Button } from "@/shared/components/ui/button";
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
    <section className="boho-hero-shell bg-background">
      <div className="store-container">
        <div className="boho-hero relative isolate min-h-[36rem] overflow-hidden rounded-[2rem] bg-storefront-brand text-storefront-brand-foreground shadow-panel sm:min-h-[40rem] lg:min-h-[min(45rem,calc(100svh-8rem))]">
          <Image
            src={HERO_ARTWORK}
            alt=""
            fill
            sizes="(min-width: 1024px) 80rem, calc(100vw - 2rem)"
            quality={88}
            preload
            className="object-cover object-[66%_center] sm:object-[62%_center]"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(21,43,32,.96)_0%,rgba(21,43,32,.88)_34%,rgba(21,43,32,.22)_68%,rgba(21,43,32,.08)_100%)] max-lg:bg-[linear-gradient(180deg,rgba(21,43,32,.94)_0%,rgba(21,43,32,.78)_52%,rgba(21,43,32,.55)_100%)]" />
          <div className="boho-sun" aria-hidden="true" />

          <div className="relative flex min-h-[36rem] flex-col justify-between px-6 py-8 sm:min-h-[40rem] sm:px-10 sm:py-10 lg:min-h-[min(45rem,calc(100svh-8rem))] lg:px-14 lg:py-12 xl:px-16">
            <div className="max-w-2xl pt-6 sm:pt-10 lg:pt-14">
              <p className="store-eyebrow boho-hero-eyebrow">
                {t("home.heroBadge")}
              </p>
              <h1 className="font-display mt-5 max-w-[12ch] text-[clamp(3.15rem,10vw,5.8rem)] leading-[0.93] tracking-[-0.055em] text-white [.locale-fa_&]:leading-[1.35] [.locale-fa_&]:tracking-normal lg:mt-6">
                {t("home.title")}
              </h1>
              <p className="store-lede mt-6 max-w-xl text-base text-white/78 sm:text-lg">
                {t("home.subtitle")}
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-5">
                <Button
                  asChild
                  size="lg"
                  className="group min-w-44 justify-between bg-rose px-7 text-rose-foreground shadow-none hover:bg-rose/90"
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
                <a
                  href="#collections"
                  className="store-focus-invert inline-flex min-h-11 items-center rounded-sm text-sm font-bold text-white underline decoration-white/45 underline-offset-8 transition-colors hover:decoration-white"
                >
                  {t("home.heroExplore")}
                </a>
              </div>
            </div>

            {/* A list, not three headings: supporting facts under the action.
                  The separator is drawn between items so it never dangles at
                  the end of a wrapped row. With an unreachable catalogue there
                  are no facts to state, and the rule above them would be a line
                  under nothing. */}
            {facts.length > 0 ? (
              <ul className="mt-10 flex w-fit flex-wrap items-center gap-x-4 gap-y-2 rounded-full border border-white/30 bg-black/30 px-5 py-3 text-xs font-semibold text-white/85 backdrop-blur-sm sm:text-sm">
                {facts.map((fact, index) => (
                  <li key={fact} className="flex items-center gap-4">
                    {index > 0 ? (
                      <span className="size-1 rounded-full bg-white/50" aria-hidden="true" />
                    ) : null}
                    <span>{fact}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <span aria-hidden="true" />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
