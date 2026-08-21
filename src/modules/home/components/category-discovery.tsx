import { getTranslations } from "next-intl/server";
import { ArrowLeft, ArrowRight } from "lucide-react";
import {
  CategoryTile,
  getCategoryTileImage,
  type ProductCategory,
} from "@/modules/products";
import { SectionHeader } from "@/shared/components/layout/section-header";
import { Link } from "@/shared/i18n/navigation";
import { isRtlLocale } from "@/shared/lib/locale";

interface CategoryDiscoveryProps {
  categories: ProductCategory[];
  locale: string;
}

/** How many categories open the band at feature size. */
const LEAD_COUNT = 2;

/**
 * Which categories open the band.
 *
 * A feature tile is mostly photograph, so it goes to categories the catalogue
 * has actually given a photograph — in the shop's own order, never reordered by
 * size or by any ranking this storefront invents. Six of this shop's thirteen
 * categories carry media and the two it lists first are not among them, so
 * taking "the first two" outright opened the page on two drawn placeholder
 * tiles at the largest size on the band.
 *
 * With no media anywhere the split degrades to the plain order and every tile
 * is the drawn mark, which is the right uniform result rather than an accident.
 */
function splitLeadCategories(categories: ProductCategory[]): {
  lead: ProductCategory[];
  rest: ProductCategory[];
} {
  const illustrated = categories.filter((category) =>
    getCategoryTileImage(category)
  );
  const lead = (
    illustrated.length >= LEAD_COUNT ? illustrated : categories
  ).slice(0, LEAD_COUNT);
  const leadIds = new Set(lead.map((category) => category.id));

  return {
    lead,
    rest: categories.filter((category) => !leadIds.has(category.id)),
  };
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
 * Two tiers rather than thirteen equal tiles, because thirteen equal tiles is a
 * directory: the feature pair sets the scale and carries the catalogue's own
 * description, and the rest read as the range behind it.
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
  const { lead, rest } = splitLeadCategories(categories);

  return (
    <section id="collections" className="store-scroll-anchor bg-background">
      <div className="store-container store-section">
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

        {lead.length > 0 ? (
          <ul className="mt-8 grid gap-4 min-[43.75rem]:grid-cols-2 lg:gap-5">
            {lead.map((category, index) => (
              <li key={category.id}>
                <CategoryTile
                  category={category}
                  locale={locale}
                  tone={index}
                  aspect="aspect-[16/10]"
                  sizes="(min-width: 43.75rem) 44vw, calc(100vw - 2rem)"
                  /* The API has written a sentence for every category and
                     nothing in the storefront was reading it. */
                  showDescription
                />
              </li>
            ))}
          </ul>
        ) : null}

        {rest.length > 0 ? (
          <ul className="store-scroll-row -mx-4 mt-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-3 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 sm:pb-0 lg:mt-5 lg:grid-cols-6 lg:gap-5">
            {rest.map((category, index) => (
              <li
                key={category.id}
                className="w-[52vw] max-w-[15rem] shrink-0 snap-start sm:w-auto sm:max-w-none"
              >
                <CategoryTile
                  category={category}
                  locale={locale}
                  tone={index + LEAD_COUNT}
                  sizes="(min-width: 1024px) 13rem, (min-width: 640px) 30vw, 52vw"
                />
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}
