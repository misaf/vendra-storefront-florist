import { getTranslations } from "next-intl/server";
import { CategoryTile, type ProductCategory } from "@/modules/products";
import { SectionHeader } from "@/shared/components/layout/section-header";
import { Link } from "@/shared/i18n/navigation";

interface CategoryDiscoveryProps {
  categories: ProductCategory[];
  locale: string;
}

/**
 * The home page's way in by occasion: the design's single row of three, with
 * the whole set one click away.
 *
 * Three, not thirteen — and only because `/collections` now exists to hold the
 * rest. An earlier edit put every category here on the grounds that "view all"
 * hid seven of them behind a link that led to the *unfiltered catalogue*, which
 * answers a different question entirely. With a real collections page at the
 * end of that link, the home page can do what the design has it do: open the
 * subject and hand it on.
 *
 * The shop's own order decides which three. Nothing here ranks them — they are
 * the first three the catalogue returns, not a podium the shopkeeper cannot
 * influence.
 */
/** One row on the design's measure. */
const HOME_COLLECTION_LIMIT = 3;

export async function CategoryDiscovery({
  categories,
  locale,
}: CategoryDiscoveryProps) {
  const t = await getTranslations({ locale });

  if (categories.length === 0) {
    return null;
  }

  const shown = categories.slice(0, HOME_COLLECTION_LIMIT);

  return (
    <section id="collections" className="store-scroll-anchor bg-background">
      <div className="store-container store-section">
        <SectionHeader
          title={t("home.collectionsTitle")}
          action={
            /* A text link, not a button: this band shows the collections as a
               wall of plates, and the page it leads to gives each one a card
               with the catalogue's own sentence — the same set, read slowly. */
            <Link href="/collections" className="store-text-action">
              {t("collections.viewAll")}
            </Link>
          }
        />

        {/* `auto-fit` at the design's 244px floor, so three tiles fill the row
            on a laptop and reflow on their own below it. Two up on a phone is
            stated separately because `auto-fit` would give it one column. */}
        <ul className="grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-[repeat(auto-fit,minmax(min(100%,15.25rem),1fr))] sm:gap-[1.375rem]">
          {shown.map((category, index) => (
            <li key={category.id}>
              <CategoryTile
                category={category}
                tone={index}
                aspect="aspect-square"
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
