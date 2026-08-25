import { getTranslations } from "next-intl/server";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { CategoryTile, type ProductCategory } from "@/modules/products";
import { SectionHeader } from "@/shared/components/layout/section-header";
import { Link } from "@/shared/i18n/navigation";
import { isRtlLocale } from "@/shared/lib/locale";

interface CategoryDiscoveryProps {
  categories: ProductCategory[];
  locale: string;
}

/**
 * The home page's single discovery surface: every collection the shop sells, in
 * the shop's own order, in two tiers.
 *
 * It replaces a six-tile preview that hid seven categories behind "view all" —
 * including most of the occasions this florist actually trades on, since Bridal
 * Bouquets, Flower Stands and Luxury Flowers all sort below that cut. On a
 * florist storefront the occasion *is* the entry intent, so the band that
 * answers "what are you shopping for" has to be complete rather than a sample.
 *
 * One grid, every tile the same size. The band previously opened on two
 * feature-sized tiles above a rail of small ones, which put ~700px-wide plates
 * on the page and made the pair read as the shop's two *recommended* ways in —
 * a ranking the catalogue never expressed and the shopkeeper cannot influence.
 * The source design lays collections out as one even wall at ~15rem, on both
 * this page and the catalogue, and an even wall is also the honest shape: these
 * are alternatives, not a podium.
 */
export async function CategoryDiscovery({
  categories,
  locale,
}: CategoryDiscoveryProps) {
  const t = await getTranslations({ locale });

  if (categories.length === 0) {
    return null;
  }

  const ArrowIcon = isRtlLocale(locale) ? ArrowLeft : ArrowRight;

  return (
    <section id="collections" className="store-scroll-anchor bg-background">
      <div className="store-container store-section-lg">
        <SectionHeader
          eyebrow={t("home.collectionsEyebrow")}
          title={t("home.collectionsTitle")}
          description={t("home.collectionsSubtitle")}
          action={
            /* A text link, not a button: the band beneath it already holds every
               collection, so this is the unfiltered shelf rather than a second
               copy of the hero's action. */
            <Link
              href="/products"
              className="group inline-flex min-h-11 items-center gap-2 rounded-sm text-sm font-bold text-foreground underline decoration-border underline-offset-8 transition-colors hover:text-primary hover:decoration-primary"
            >
              {t("common.allProducts")}
              <ArrowIcon
                className="size-4 transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5"
                aria-hidden="true"
              />
            </Link>
          }
        />

        {/* Two up on a phone, then `auto-fit` at a 15rem floor so the wall
            reflows to three and four without a breakpoint per step — and a shop
            with three collections fills its row instead of leaving two gaps.
            The phone case is stated separately because `auto-fit` would give it
            a single column: thirteen full-width plates is most of a minute's
            scrolling to reach the products underneath. */}
        <ul className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-[repeat(auto-fit,minmax(min(100%,15rem),1fr))] sm:gap-5 lg:mt-10 lg:gap-6">
          {categories.map((category, index) => (
            <li key={category.id}>
              <CategoryTile
                category={category}
                locale={locale}
                tone={index}
                aspect="aspect-square"
                shape="arch"
                /* The API has written a sentence for every category and
                   nothing in the storefront was reading it. */
                showDescription
                sizes="(min-width: 1024px) 18rem, (min-width: 640px) 44vw, calc(100vw - 2rem)"
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
