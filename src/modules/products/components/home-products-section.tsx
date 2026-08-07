"use client";

import { Link } from "@/shared/i18n/navigation";
import { useState } from "react";
import { ArrowLeft, ArrowRight, ImageOff } from "lucide-react";
import { ThemedProductImage } from "@/modules/products";
import { Button } from "@/shared/components/ui/button";
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
import {cn, normalizeImageUrl} from "@/shared/lib/utils";
import { createReadableResourcePath } from "@/shared/lib/slug-url";
import { formatRemainingQuantity } from "../lib/format";
import { isRtlLocale } from "@/shared/lib/locale";
import type { Product } from "@/modules/products";
import { useBrandIcon } from "@/shared/property/use-brand-icon";
import { useFormatPrice } from "@/shared/property/use-format-price";

export interface HomeProductCategory {
  slug: string;
  title: string;
  description: string | null;
  image?: string;
  products: Product[];
}

interface HomeProductsSectionProps {
  locale: string;
  t: (key: string, values?: Record<string, string | number>) => string;
  categories: HomeProductCategory[];
}

interface HomeProductCardProps {
  product: Product;
  locale: string;
  t: (key: string, values?: Record<string, string | number>) => string;
}

function HomeProductCard({ product, locale, t }: HomeProductCardProps) {
  const formatPrice = useFormatPrice();
  const [hasImageError, setHasImageError] = useState(false);
  const detailHref = `/products/${createReadableResourcePath(
    product.id,
    product.slug
  )}`;
  const inStock = product.inStock !== false;
  const hasPrice = Number(product.price) > 0 && inStock;
  const displayPrice = formatPrice(product.price, product.formattedPrice);
  const isLowQuantity = product.quantity != null && product.quantity < 2;

  return (
    <div className="group relative flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card text-card-foreground shadow-sm transition-colors hover:bg-muted/40">
      {/* the swatch tab — a paint-chip of this band's bloom colour */}
      <div className="px-2.5 pt-2.5 lg:px-3 lg:pt-3">
        <span className="swatch-tab block w-8 lg:w-10" aria-hidden="true" />
      </div>

      <div className="relative mt-2 aspect-square overflow-hidden bg-secondary/50 sm:aspect-[5/6] lg:mt-3 lg:aspect-[4/5]">
        <Link
          href={detailHref}
          className="block h-full w-full rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          {hasImageError ? (
            <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-card text-muted-foreground">
              <span className="flex size-10 items-center justify-center rounded-full bg-background/75 shadow-sm ring-1 ring-border sm:size-12">
                <ImageOff className="h-5 w-5" />
              </span>
              <span className="max-w-24 text-center text-[11px] font-semibold leading-4">
                {t("products.imageUnavailable") || "Image unavailable"}
              </span>
            </div>
          ) : (
            <ThemedProductImage
              src={normalizeImageUrl(product.image)}
              alt={product.name}
              width={360}
              height={450}
              className="h-full w-full object-contain p-1.5 transition-transform duration-500 group-hover:scale-[1.04] sm:p-2 lg:p-3"
              unoptimized
              loading="lazy"
              onError={() => setHasImageError(true)}
            />
          )}
        </Link>
      </div>

      <div className="flex min-h-16 flex-1 flex-col gap-1.5 px-3 pb-1.5 pt-3 lg:min-h-20 lg:gap-2 lg:px-4 lg:pb-2 lg:pt-4">
        <h3 className="line-clamp-2 min-h-9 text-xs font-semibold leading-[1.35] sm:text-sm sm:leading-5 lg:min-h-10">
          <Link
            href={detailHref}
            className="flex items-start gap-2 rounded-sm outline-none transition-colors hover:text-foreground/70 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <span className="petal-dot mt-1 size-2 lg:mt-1.5 lg:size-2.5" aria-hidden="true" />
            <span className="min-w-0">{product.name}</span>
          </Link>
        </h3>
        {isLowQuantity ? (
          <p className="ms-4 truncate text-[11px] font-semibold leading-4 text-foreground lg:text-xs">
            {formatRemainingQuantity(t, locale, product.quantity as number)}
          </p>
        ) : null}
      </div>

      <div className="mt-auto flex justify-end px-3 pb-3 pt-1 text-end lg:px-4 lg:pb-4 lg:pt-2">
        <span
          dir="ltr"
          className={cn(
            "block truncate text-xs font-bold leading-5 sm:text-sm lg:text-base lg:leading-6",
            inStock ? "text-card-foreground" : "text-muted-foreground"
          )}
        >
          {inStock
            ? hasPrice
              ? displayPrice
              : t("products.priceOnRequest")
            : t("products.outOfStock")}
        </span>
      </div>
    </div>
  );
}

interface HomeProductsCarouselProps {
  products: Product[];
  locale: string;
  t: (key: string, values?: Record<string, string | number>) => string;
}

function HomeProductsCarousel({ products, locale, t }: HomeProductsCarouselProps) {
  const isRTL = isRtlLocale(locale);

  return (
    <Carousel
      opts={{
        align: "start",
        loop: false,
        direction: isRTL ? "rtl" : "ltr",
      }}
      className="w-full"
    >
      <CarouselContent className="-ms-1.5 sm:-ms-2">
        {products.map((product) => (
          <CarouselItem
            key={product.id}
            className="basis-[46%] ps-1.5 sm:basis-1/3 sm:ps-2 md:basis-1/4 lg:basis-1/4 xl:basis-1/5"
          >
            <HomeProductCard product={product} locale={locale} t={t} />
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
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <span className="mb-4 flex items-center gap-3">
          <span className="petal-dot" aria-hidden="true" />
          <span className="golzar-swatch-bar" aria-hidden="true" />
        </span>
        <h2 className="font-display truncate text-4xl leading-[1.05] text-foreground sm:text-5xl">
          {category.title}
        </h2>
        {category.description ? (
          <p className="mt-3 line-clamp-1 max-w-xl text-sm text-muted-foreground">
            {category.description}
          </p>
        ) : null}
      </div>

      <Button
        asChild
        variant="outline"
        size="sm"
        className="w-fit shrink-0 gap-2 rounded-full bg-card/70 backdrop-blur-sm hover:bg-card"
        style={
          {
            borderColor: "var(--border)",
          } as React.CSSProperties
        }
      >
        <Link
          href={{
            pathname: "/products",
            query: { category: category.slug },
          }}
        >
          {t("common.viewAllProducts") || "View All Products"}
          <ArrowIcon className="h-4 w-4" />
        </Link>
      </Button>
    </div>
  );
}

export function HomeProductsSection({
  locale,
  t,
  categories,
}: HomeProductsSectionProps) {
  const BrandIcon = useBrandIcon();
  const isRTL = isRtlLocale(locale);
  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  return (
    <section className="w-full">
      {categories.length === 0 ? (
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
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
        <div className="storefront-product-sections">
          {categories.map((category) => (
            <article
              key={category.slug}
              className="storefront-snap-panel w-full scroll-mt-24 px-4 py-12 sm:px-6 sm:py-16 lg:px-8 md:min-h-[100svh]"
            >
              <div className="mx-auto flex max-w-7xl flex-col justify-center gap-8 md:min-h-[calc(100svh-6rem)]">
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
                    products={category.products.slice(0, 20)}
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
