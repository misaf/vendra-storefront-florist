import { getTranslations } from "next-intl/server";
import Image from "next/image";
import { Badge } from "@/shared/components/ui/badge";
import { DynamicText } from "@/shared/components/dynamic-text";
import { Link } from "@/shared/i18n/navigation";
import { getCategoryTileImage } from "./category-tile";
import { CategoryImageFallback } from "@/shared/components/ui/category-image-fallback";
import type { ProductCategory } from "../types";

interface CollectionsIndexProps {
  categories: ProductCategory[];
  locale: string;
}

/**
 * Every collection the shop sells, as the design's own card: a washed 16/11
 * plate bled to the top of a warm surface, with the name and the catalogue's
 * own sentence set underneath it inside the card.
 *
 * Deliberately a different object from the home page's discovery tile. There
 * the tile is a plate on the page with its name beneath it, one of a wall of
 * ways in; here the collection *is* the content, so it gets a card of its own
 * with room for the sentence the catalogue wrote about it.
 */
export async function CollectionsIndex({
  categories,
  locale,
}: CollectionsIndexProps) {
  const t = await getTranslations({ locale });

  return (
    <>
      <section className="bg-background">
        <div className="store-container store-section-head pb-10 sm:pb-10">
          <Badge variant="sage" className="px-3 py-1 text-xs">
            {t("collections.eyebrow")}
          </Badge>
          <h1 className="store-page-title mt-4 max-w-[22ch] text-foreground">
            {t("collections.title")}
          </h1>
          <p className="store-lede mt-4 max-w-[54ch] text-[1.0625rem] text-foreground/75">
            {t("collections.subtitle")}
          </p>
        </div>
      </section>

      <section className="bg-background">
        <div className="store-container pb-[6.25rem] pt-5">
          {categories.length === 0 ? (
            <p className="rounded-[2rem] bg-card px-6 py-10 text-center text-sm text-card-foreground/70">
              {t("common.noCategories")}
            </p>
          ) : (
            <ul className="grid gap-[1.625rem] sm:grid-cols-[repeat(auto-fit,minmax(min(100%,16.375rem),1fr))]">
              {categories.map((category, index) => {
                const src = getCategoryTileImage(category);

                return (
                  <li key={category.id}>
                    <Link
                      href={{
                        pathname: "/products",
                        query: { category: category.slug },
                      }}
                      className="group flex h-full flex-col overflow-hidden rounded-[2rem] bg-card text-card-foreground shadow-card transition-transform duration-300 hover:-translate-y-1 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
                    >
                      <div className="organic-washed relative aspect-[16/11] w-full overflow-hidden bg-secondary">
                        {src ? (
                          <Image
                            src={src}
                            /* Empty: the name is inside the same link. */
                            alt=""
                            fill
                            sizes="(min-width: 1024px) 22rem, (min-width: 640px) 45vw, calc(100vw - 2rem)"
                            unoptimized={src.startsWith("/api/storage/")}
                            className="object-cover object-center transition-transform duration-500 ease-out group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                          />
                        ) : (
                          <CategoryImageFallback tone={index} />
                        )}
                      </div>

                      <div className="flex flex-1 flex-col px-6 pb-[1.625rem] pt-[1.375rem]">
                        <h2 className="store-dynamic-text font-display text-[1.3125rem] leading-tight text-card-foreground transition-colors group-hover:text-rose [.locale-fa_&]:leading-normal">
                          <DynamicText>{category.name}</DynamicText>
                        </h2>
                        {category.description ? (
                          <p className="store-lede mt-2 line-clamp-3 text-[0.84375rem] text-card-foreground/70">
                            <DynamicText>{category.description}</DynamicText>
                          </p>
                        ) : null}
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>
    </>
  );
}
