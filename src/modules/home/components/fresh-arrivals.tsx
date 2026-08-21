"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import {
  ProductCard,
  type Product,
} from "@/modules/products";
import { SectionHeader } from "@/shared/components/layout/section-header";
import { Link } from "@/shared/i18n/navigation";
import { useTranslations } from "@/shared/hooks/use-translations";
import { isRtlLocale } from "@/shared/lib/locale";

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
 * Renders nothing at all when the catalogue returns nothing buyable. An empty
 * "no products" panel on a home page is worse than one section fewer: the rest
 * of the page still works, and the shop does not announce its own outage.
 */
export function FreshArrivals({ products }: FreshArrivalsProps) {
  const { t, locale } = useTranslations();
  const ArrowIcon = isRtlLocale(locale) ? ArrowLeft : ArrowRight;

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="store-scroll-anchor bg-secondary/45">
      <div className="store-container store-section-lg">
        <SectionHeader
          eyebrow={t("home.arrivalsEyebrow")}
          title={t("home.arrivalsTitle")}
          description={t("home.arrivalsSubtitle")}
          action={
            <Link
              href={{
                pathname: "/products",
                query: { sort: "newest", availability: "in-stock" },
              }}
              className="group inline-flex min-h-11 items-center gap-2 rounded-sm text-sm font-bold text-foreground underline decoration-border underline-offset-8 transition-colors hover:text-primary hover:decoration-primary"
            >
              {t("home.arrivalsViewAll")}
              <ArrowIcon
                className="size-4 transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5"
                aria-hidden="true"
              />
            </Link>
          }
        />

        <ul className="store-scroll-row -mx-4 mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-0 min-[43.75rem]:grid-cols-4 lg:gap-x-6 lg:gap-y-10">
          {products.map((product) => (
            <li
              key={product.id}
              className="w-[72vw] max-w-[18rem] shrink-0 snap-start sm:w-auto sm:max-w-none"
            >
              <ProductCard
                product={product}
                locale={locale}
                t={t}
                showCategory
                sizes="(min-width: 1280px) 18rem, (min-width: 768px) 22vw, (min-width: 640px) 46vw, 72vw"
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
