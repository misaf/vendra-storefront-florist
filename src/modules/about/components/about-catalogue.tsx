import { getTranslations } from "next-intl/server";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { CategoryTile, type ProductCategory } from "@/modules/products";
import { Button } from "@/shared/components/ui/button";
import { Link } from "@/shared/i18n/navigation";
import { isRtlLocale } from "@/shared/lib/locale";

interface AboutCatalogueProps {
  categories: ProductCategory[];
  locale: string;
}

/**
 * The page's closing band, and the only place on it that asks for anything.
 *
 * An about page earns its keep by connecting what the shop says about itself to
 * what the shop actually makes, and the honest way to do that is to show the
 * work rather than describe it: four real collections, straight from the
 * catalogue, each one a link into it. The page used to end on a pair of buttons
 * under a headline about "finding the piece that fits your moment", which named
 * nothing the shop sells.
 *
 * With no categories to show — an unreachable catalogue, an empty shop — the
 * band still renders its heading and its two actions. Losing the tiles costs
 * the illustration, not the way out of the page.
 */
export async function AboutCatalogue({ categories, locale }: AboutCatalogueProps) {
  const t = await getTranslations({ locale });
  const ArrowIcon = isRtlLocale(locale) ? ArrowLeft : ArrowRight;

  return (
    <section className="bg-background">
      <div className="store-container store-section-lg">
        <div className="max-w-2xl">
          <p className="store-eyebrow">{t("about.catalogueEyebrow")}</p>
          <h2 className="store-section-title mt-4 text-foreground">
            {t("about.catalogueTitle")}
          </h2>
          <p className="store-lede mt-4 text-base text-muted-foreground sm:text-lg">
            {t("about.catalogueBody")}
          </p>
        </div>

        {categories.length > 0 ? (
          <ul className="mt-9 grid grid-cols-2 gap-4 min-[43.75rem]:grid-cols-4 lg:gap-5">
            {categories.map((category, index) => (
              <li key={category.id}>
                <CategoryTile
                  category={category}
                  locale={locale}
                  tone={index}
                  sizes="(min-width: 43.75rem) 22vw, 45vw"
                />
              </li>
            ))}
          </ul>
        ) : null}

        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button asChild size="lg" className="group justify-between px-7 sm:min-w-52">
            <Link href="/products">
              {t("about.finalCtaPrimary")}
              <ArrowIcon
                className="size-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none rtl:group-hover:-translate-x-0.5"
                aria-hidden="true"
              />
            </Link>
          </Button>
          <Link
            href="/contact"
            className="inline-flex min-h-11 items-center justify-center rounded-sm text-sm font-bold text-foreground underline decoration-border underline-offset-8 transition-colors hover:text-primary hover:decoration-primary sm:px-3"
          >
            {t("about.finalCtaSecondary")}
          </Link>
        </div>
      </div>
    </section>
  );
}
