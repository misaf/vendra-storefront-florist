"use client";

import {
  ProductCard,
  type Product,
} from "@/modules/products";
import { SectionHeader } from "@/shared/components/layout/section-header";
import { Link } from "@/shared/i18n/navigation";
import { useTranslations } from "@/shared/hooks/use-translations";

interface FreshArrivalsProps {
  products: Product[];
}

/**
 * The home page's only product surface: the newest things a shopper can
 * actually buy, newest first.
 *
 * It replaces an edit that took one product from each of the first three
 * categories in turn. That selection was invisible to the shopper (nothing on
 * the page explained why those four), unreachable ("view all" led to the whole
 * unsorted catalogue, not to the four), and static — a shop that adds stock
 * daily saw the same four cards until its category order changed.
 *
 * What this rail shows, its heading states and its link reproduces exactly:
 * `/products?sort=newest&availability=in-stock` is the same query, unpaged. A
 * preview a shopper can step into is worth more than one they have to trust.
 *
 * On the page's own ground, not a tinted band: the design keeps every home
 * band on the cream and reserves the warm surface for the one that explains
 * how ordering works.
 *
 * Renders nothing at all when the catalogue returns nothing buyable. An empty
 * "no products" panel on a home page is worse than one section fewer: the rest
 * of the page still works, and the shop does not announce its own outage.
 */
export function FreshArrivals({ products }: FreshArrivalsProps) {
  const { t, locale } = useTranslations();

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="store-scroll-anchor bg-background">
      <div className="store-container pb-[4.375rem] pt-10">
        <SectionHeader
          title={t("home.arrivalsTitle")}
          action={
            <Link
              href={{
                pathname: "/products",
                query: { sort: "newest", availability: "in-stock" },
              }}
              className="store-text-action"
            >
              {t("home.arrivalsViewAll")}
            </Link>
          }
        />

        {/* `auto-fit` at the design's own 216px floor on a 22px gutter. With
            four cards that resolves to one flush row on a laptop and reflows
            by itself below; two up on a phone is stated separately, because
            `auto-fit` would give it a single column. */}
        <ul className="grid grid-cols-2 gap-x-4 gap-y-9 sm:grid-cols-[repeat(auto-fit,minmax(min(100%,13.5rem),1fr))] sm:gap-x-[1.375rem]">
          {products.map((product) => (
            <li key={product.id}>
              <ProductCard
                product={product}
                locale={locale}
                t={t}
                sizes="(min-width: 1280px) 18rem, (min-width: 768px) 22vw, (min-width: 640px) 46vw, 45vw"
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
