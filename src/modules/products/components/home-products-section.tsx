"use client";

import { Link } from "@/shared/i18n/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { ProductCard } from "./product-card";
import { Button } from "@/shared/components/ui/button";
import { SectionHeader } from "@/shared/components/layout/section-header";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/shared/components/ui/empty";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/shared/components/ui/carousel";
import { isRtlLocale } from "@/shared/lib/locale";
import type { Product } from "../types";
import { useBrandIcon } from "@/shared/property/use-brand-icon";
import { useTranslations } from "@/shared/hooks/use-translations";

export interface HomeProductCategory {
  slug: string;
  title: string;
  description: string | null;
  image?: string;
  products: Product[];
}

interface HomeProductsSectionProps {
  categories: HomeProductCategory[];
}

interface HomeProductsCarouselProps {
  products: Product[];
  label: string;
  locale: string;
  t: (key: string, values?: Record<string, string | number>) => string;
}

function HomeProductsCarousel({ products, label, locale, t }: HomeProductsCarouselProps) {
  const isRTL = isRtlLocale(locale);
  const numberFormat = new Intl.NumberFormat(locale);

  return (
    <Carousel
      opts={{
        align: "start",
        loop: false,
        direction: isRTL ? "rtl" : "ltr",
      }}
      className="w-full"
      aria-label={t("common.productCarousel", { name: label })}
    >
      <CarouselContent className="-ms-3 sm:-ms-4">
        {products.map((product, index) => (
          <CarouselItem
            key={product.id}
            aria-label={t("common.carouselItemPosition", {
              current: numberFormat.format(index + 1),
              total: numberFormat.format(products.length),
              name: product.name,
            })}
            className="basis-[74%] ps-3 min-[480px]:basis-1/2 sm:basis-1/3 sm:ps-4 lg:basis-1/4"
          >
            <ProductCard
              product={product}
              locale={locale}
              t={t}
              sizes="(min-width: 1280px) 19rem, (min-width: 1024px) 22vw, (min-width: 640px) 31vw, 74vw"
            />
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious
        className={`z-10 bg-card/95 shadow-md hover:bg-card ${
          isRTL ? "right-2 left-auto md:-right-4" : "left-2 right-auto md:-left-4"
        }`}
      >
        {isRTL ? (
          <ArrowRight className="h-4 w-4" />
        ) : (
          <ArrowLeft className="h-4 w-4" />
        )}
        <span className="sr-only">{t("common.previousSlide")}</span>
      </CarouselPrevious>
      <CarouselNext
        className={`z-10 bg-card/95 shadow-md hover:bg-card ${
          isRTL ? "left-2 right-auto md:-left-4" : "right-2 left-auto md:-right-4"
        }`}
      >
        {isRTL ? (
          <ArrowLeft className="h-4 w-4" />
        ) : (
          <ArrowRight className="h-4 w-4" />
        )}
        <span className="sr-only">{t("common.nextSlide")}</span>
      </CarouselNext>
    </Carousel>
  );
}

interface ProductCategorySectionHeaderProps {
  category: HomeProductCategory;
  t: (key: string, values?: Record<string, string | number>) => string;
  arrowIcon: typeof ArrowRight;
}

function ProductCategorySectionHeader({
  category,
  t,
  arrowIcon: ArrowIcon,
}: ProductCategorySectionHeaderProps) {
  return (
    <SectionHeader
      eyebrow={t("common.browseByCategory")}
      title={category.title}
      description={category.description}
      action={
        <Button
          asChild
          variant="outline"
          size="sm"
          className="w-fit gap-2 bg-card/70 hover:bg-card"
        >
          <Link
            href={{
              pathname: "/products",
              query: { category: category.slug },
            }}
          >
            {t("common.viewAllProducts") || "View All Products"}
            <ArrowIcon className="size-4" />
          </Link>
        </Button>
      }
    />
  );
}

export function HomeProductsSection({ categories }: HomeProductsSectionProps) {
  // Reads its own translations rather than taking `t` as a prop: a function
  // cannot cross the server/client boundary, so prop-drilling it forced the
  // whole home page to be one client tree.
  const { t, locale } = useTranslations();
  const BrandIcon = useBrandIcon();
  const isRTL = isRtlLocale(locale);
  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  return (
    <section className="w-full bg-background">
      {categories.length === 0 ? (
        <div className="store-container store-section">
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <BrandIcon className="h-6 w-6" />
              </EmptyMedia>
              <EmptyTitle>{t("products.noProducts") || "No products found"}</EmptyTitle>
              <EmptyDescription>
                {t("products.noProductsInCategory") ||
                  "There are no products available right now. Check back soon."}
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button asChild className="gap-2">
                <Link href="/products">
                  {t("common.shopNow") || "Shop Now"}
                  <ArrowIcon className="h-4 w-4" />
                </Link>
              </Button>
            </EmptyContent>
          </Empty>
        </div>
      ) : (
        <div className="storefront-product-sections divide-y divide-border/70">
          {categories.map((category) => (
            <article
              key={category.slug}
              className="storefront-view-panel store-section store-scroll-anchor w-full"
            >
              <div className="store-container flex flex-col gap-6 sm:gap-8">
                <ProductCategorySectionHeader
                  category={category}
                  t={t}
                  arrowIcon={ArrowIcon}
                />
                {category.products.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    {t("products.noProductsInCategory") ||
                      "There are no products available in this category."}
                  </p>
                ) : (
                  <HomeProductsCarousel
                    products={category.products}
                    label={category.title}
                    locale={locale}
                    t={t}
                  />
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
