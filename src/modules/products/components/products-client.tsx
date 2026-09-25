"use client";
import { Link, useRouter } from "@/shared/i18n/navigation";
import { PageShell } from "@/shared/components/layout/page-shell";
import { Button } from "@/shared/components/ui/button";
import { ErrorState } from "@/shared/components/ui/error-state";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/shared/components/ui/sheet";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/shared/components/ui/empty";
import { ProductCard } from "./product-card";
import { SortControl } from "./sort-control";
import {
  PRODUCT_GRID_IMAGE_SIZES,
  ProductGrid,
  ProductGridSkeleton,
} from "./product-grid";
import { PageHeader } from "@/shared/components/layout/page-header";
import { useTranslations } from "@/shared/hooks/use-translations";
import { useSearchParams } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Loader2, SlidersHorizontal, X } from "lucide-react";
import {
  matchesPriceRange,
  normalizeSearchQuery,
  orderProducts,
  rankProductsByQuery,
  useProductCatalogue,
  useProductCategories,
} from "../lib/queries";
import { useFavorites } from "@/modules/account";
import { useFormatPrice } from "@/shared/config/storefront-context";
import type {
  FetchProductsResult,
  ProductCategory,
  ProductPriceRange,
} from "../types";
import { buildProductsQueryKey, getProductsApiSort } from "../lib/keys";
import { cn } from "@/shared/lib/utils";
import dynamic from "next/dynamic";
import { hasRichTextContent } from "@/shared/lib/rich-text";
import { ProductFilters } from "./product-filters";
import {
  availabilityToInStock,
  isPriceRangeActive,
  normalizeAvailability,
  normalizePriceBound,
  resolvePriceRange,
  type ProductAvailability,
} from "../lib/filter-state";

// The TipTap renderer (and prosemirror underneath it) is the heaviest thing on
// these pages and is only reached when a record actually carries rich text, so
// it loads as its own chunk instead of riding along with the catalogue.
const RichText = dynamic(() =>
  import("@/shared/components/rich-text").then((m) => m.RichText)
);

type SortValue = "newest" | "oldest" | "price-asc" | "price-desc";

const SORT_OPTIONS: Array<{ value: SortValue; labelKey: string }> = [
  { value: "newest", labelKey: "products.sortNewest" },
  { value: "oldest", labelKey: "products.sortOldest" },
  { value: "price-asc", labelKey: "products.sortPriceAsc" },
  { value: "price-desc", labelKey: "products.sortPriceDesc" },
];

function CategoryRichTextDescription({ content }: { content: unknown }) {
  if (!hasRichTextContent(content)) {
    return null;
  }

  return (
    <section className="mt-10 border-s-2 border-rose/60 bg-secondary/35 px-5 py-6 text-card-foreground sm:px-7">
      <RichText content={content} density="compact" />
    </section>
  );
}

function isValidSort(value: string | null): value is SortValue {
  return SORT_OPTIONS.some((option) => option.value === value);
}

interface ProductsClientProps {
  /** Page one as the server fetched it, or null when that call failed. */
  initialPage: FetchProductsResult | null;
  /** The filters `initialPage` answers, so a stale page is not seeded. */
  initialQueryKey: string;
  /** Resolved server-side so the heading and filters render named, not blank. */
  initialCategories: ProductCategory[];
  /** The catalogue's price extent, or null when there is no band to draw. */
  priceRange: ProductPriceRange | null;
}

export default function ProductsClient({
  initialPage,
  initialQueryKey,
  initialCategories,
  priceRange,
}: ProductsClientProps) {
  const { t, locale } = useTranslations();
  const searchParams = useSearchParams();
  const router = useRouter();
  // Seeded from the server render, so the category heading, the sidebar and
  // the description are correct in the first paint instead of appearing once
  // the browser has fetched the same list again. An empty array means the
  // server call failed, and is left undefined so the client still tries.
  const { data: apiCategories = [], isLoading: categoriesLoading } =
    useProductCategories(locale, {
      initialData: initialCategories.length > 0 ? initialCategories : undefined,
    });

  const category = searchParams.get("category")?.trim() || "all";
  const activeCategoryFilter = category !== "all" ? category : undefined;
  const availability = normalizeAvailability(searchParams.get("availability"));
  const inStock = availabilityToInStock(availability);
  const search = searchParams.get("search")?.trim() || "";
  const sortParam = searchParams.get("sort");
  const explicitSort = isValidSort(sortParam) ? sortParam : undefined;
  const hasExplicitSort = Boolean(explicitSort);
  const sort: SortValue = explicitSort ?? "newest";
  // Resolved against the catalogue's own track, so a bound that sits on an end
  // is not treated as a filter — the same rule the server render applies, which
  // is what keeps the two agreeing on the query key below.
  const { minPrice, maxPrice } = resolvePriceRange(
    normalizePriceBound(searchParams.get("minPrice")),
    normalizePriceBound(searchParams.get("maxPrice")),
    priceRange
  );
  const hasPriceBand = isPriceRangeActive({ minPrice, maxPrice });
  const favoritesOnly = searchParams.get("favorites") === "1";
  // Every sort now resolves in the fetch layer — recency through the API's own
  // parameter, price over the whole filtered catalogue — so the list arrives in
  // the order it should be shown in and nothing re-sorts it here. Re-sorting on
  // the client is what made "cheapest first" mean "cheapest of this page".
  const apiSort = getProductsApiSort(sort);
  const queryKey = buildProductsQueryKey(
    locale,
    activeCategoryFilter,
    inStock,
    search,
    apiSort,
    minPrice,
    maxPrice
  );
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [draftCategory, setDraftCategory] = useState(category);
  const [draftAvailability, setDraftAvailability] =
    useState<ProductAvailability | undefined>(availability);
  const [draftPrice, setDraftPrice] = useState<{
    minPrice?: number;
    maxPrice?: number;
  }>({ minPrice, maxPrice });
  const [draftFavoritesOnly, setDraftFavoritesOnly] = useState(favoritesOnly);
  const observerTarget = useRef<HTMLDivElement>(null);

  const { favorites } = useFavorites();
  const formatPrice = useFormatPrice();
  // Favourites live in localStorage, so the first render — server and hydration
  // alike — sees an empty list. Until the stored list has been adopted, "you
  // have not saved anything yet" is a claim this component cannot yet make.
  const [favoritesReady, setFavoritesReady] = useState(false);
  useEffect(() => setFavoritesReady(true), []);

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    refetch,
  } = useProductCatalogue(
    {
      locale,
      category: activeCategoryFilter,
      inStock,
      search: search || undefined,
      sort: apiSort,
      minPrice,
      maxPrice,
    },
    {
      // Only when the server's page still answers the filters in the URL. A
      // client-side filter change updates the address before the new server
      // render lands, and seeding page one from the outgoing render would show
      // the previous filter's products under the new heading.
      initialPage:
        queryKey === initialQueryKey ? (initialPage ?? undefined) : undefined,
      // The saved view is answered entirely from the browser's own list, so the
      // catalogue is not fetched — and not paged — behind it.
      enabled: !favoritesOnly,
    }
  );

  const fetchedProducts = useMemo(() => {
    const seen = new Set<number>();
    // Appended in arrival order: the fetch layer already returns each page in
    // the active sort, so re-ordering the merged list here would only shuffle
    // rows the shopper has already read past. Ids are de-duplicated because a
    // product inserted upstream between two requests can straddle a page edge.
    return (data?.pages ?? [])
      .flatMap((page) => page.products)
      .filter((product) => !seen.has(product.id) && seen.add(product.id));
  }, [data]);

  /**
   * The saved view: the same filters, applied to the list the browser already
   * holds.
   *
   * This is the one surface that may narrow a list on the client, and only
   * because the list is not a page of a larger set — favourites are stored
   * whole, so filtering and ordering them locally is the complete answer rather
   * than the "cheapest of the twelve newest" that the same move would produce
   * against a paginated catalogue. Ordering and matching are the fetch layer's
   * own functions, so a sort means here what it means in the grid beside it.
   */
  const savedProducts = useMemo(() => {
    if (!favoritesOnly) return null;

    let list = favorites;

    if (activeCategoryFilter) {
      list = list.filter(
        (product) => product.categorySlug === activeCategoryFilter
      );
    }

    if (availability === "in-stock") {
      list = list.filter((product) => product.inStock !== false);
    } else if (availability === "out-of-stock") {
      list = list.filter((product) => product.inStock === false);
    }

    if (hasPriceBand) {
      list = list.filter((product) =>
        matchesPriceRange(product, minPrice, maxPrice)
      );
    }

    if (search) {
      const query = normalizeSearchQuery(search, locale);
      return query ? rankProductsByQuery(list, query, locale) : list;
    }

    return orderProducts(list, apiSort, locale);
  }, [
    activeCategoryFilter,
    apiSort,
    availability,
    favorites,
    favoritesOnly,
    hasPriceBand,
    locale,
    maxPrice,
    minPrice,
    search,
  ]);

  const products = savedProducts ?? fetchedProducts;
  /** The saved view, on, with nothing saved — as opposed to nothing matching. */
  const noSavedProducts =
    favoritesOnly && favoritesReady && favorites.length === 0;
  const pagination = data?.pages.at(-1)?.pagination ?? null;
  /** How many products answer the current filters, or null while unknown. */
  const resultTotal = savedProducts
    ? savedProducts.length
    : (pagination?.total ?? null);
  /** A reload of the whole list, as opposed to appending the next page. */
  const loading = !favoritesOnly && isFetching && !isFetchingNextPage;
  const loadingMore = !favoritesOnly && isFetchingNextPage;
  const hasMore = !favoritesOnly && hasNextPage;

  useEffect(() => {
    const target = observerTarget.current;
    if (favoritesOnly || !hasNextPage || isFetching || !target) return;

    // `fetchNextPage` is a no-op while a page is already in flight, so the
    // observer needs no in-flight bookkeeping of its own.
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) fetchNextPage();
      },
      { threshold: 0.1 }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [favoritesOnly, fetchNextPage, hasNextPage, isFetching]);

  const activeCategoryDescription = useMemo(() => {
    if (!activeCategoryFilter) {
      return "";
    }

    const match = apiCategories.find(
      (apiCategory) => apiCategory.slug === activeCategoryFilter
    );
    return match?.richDescription ?? match?.description ?? "";
  }, [activeCategoryFilter, apiCategories]);

  const buildProductsUrl = useCallback(
    (next: {
      category?: string;
      availability?: ProductAvailability;
      search?: string;
      sort?: SortValue;
      minPrice?: number;
      maxPrice?: number;
      favoritesOnly?: boolean;
    }) => {
      const params = new URLSearchParams();

      if (next.category && next.category !== "all") {
        params.set("category", next.category);
      }

      if (next.availability) {
        params.set("availability", next.availability);
      }

      if (next.search) {
        params.set("search", next.search);
      }

      if (next.sort && next.sort !== "newest") {
        params.set("sort", next.sort);
      }

      if (next.minPrice != null) {
        params.set("minPrice", String(next.minPrice));
      }

      if (next.maxPrice != null) {
        params.set("maxPrice", String(next.maxPrice));
      }

      if (next.favoritesOnly) {
        params.set("favorites", "1");
      }

      const query = params.toString();
      return `/products${query ? `?${query}` : ""}`;
    },
    []
  );

  const handleClearSearch = () => {
    router.push(
      buildProductsUrl({
        category: activeCategoryFilter,
        availability,
        sort: hasExplicitSort ? sort : undefined,
        minPrice,
        maxPrice,
        favoritesOnly,
      }),
      { scroll: false }
    );
  };

  const activeCategoryLabel = useMemo(() => {
    if (!activeCategoryFilter) return "";
    return (
      apiCategories.find((item) => item.slug === activeCategoryFilter)?.name ??
      activeCategoryFilter
    );
  }, [activeCategoryFilter, apiCategories]);
  const activeFilterCount =
    Number(Boolean(activeCategoryFilter)) +
    Number(Boolean(availability)) +
    Number(hasPriceBand) +
    Number(favoritesOnly);
  const hasActiveFilters = activeFilterCount > 0;

  /**
   * One navigation for any change to the rail.
   *
   * Every filter is named on each call so that changing one never silently
   * drops another: the earlier two-argument version rebuilt the URL from the
   * two filters it knew about, which is a shape that quietly loses whichever
   * filter is added to the rail next.
   */
  const navigateWithFilters = useCallback(
    (next: {
      category?: string;
      availability?: ProductAvailability;
      search?: string;
      minPrice?: number;
      maxPrice?: number;
      favoritesOnly?: boolean;
    }) => {
      router.push(
        buildProductsUrl({
          category: next.category ?? category,
          availability:
            "availability" in next ? next.availability : availability,
          minPrice: "minPrice" in next ? next.minPrice : minPrice,
          maxPrice: "maxPrice" in next ? next.maxPrice : maxPrice,
          favoritesOnly:
            "favoritesOnly" in next ? next.favoritesOnly : favoritesOnly,
          search: "search" in next ? next.search : search,
          sort: hasExplicitSort ? sort : undefined,
        }),
        { scroll: false }
      );
    },
    [
      availability,
      buildProductsUrl,
      category,
      favoritesOnly,
      hasExplicitSort,
      maxPrice,
      minPrice,
      router,
      search,
      sort,
    ]
  );

  const handleFilterSheetOpenChange = (open: boolean) => {
    if (open) {
      setDraftCategory(category);
      setDraftAvailability(availability);
      setDraftPrice({ minPrice, maxPrice });
      setDraftFavoritesOnly(favoritesOnly);
    }
    setFilterSheetOpen(open);
  };

  const clearFiltersUrl = buildProductsUrl({
    search,
    sort: hasExplicitSort ? sort : undefined,
  });

  /** The band as one readable phrase, for the chip and the sheet's summary. */
  const priceBandLabel = useMemo(() => {
    if (!hasPriceBand) return "";
    if (minPrice != null && maxPrice != null) {
      return `${formatPrice(minPrice)} – ${formatPrice(maxPrice)}`;
    }
    if (minPrice != null) {
      return t("products.priceFrom", { price: formatPrice(minPrice) });
    }
    return t("products.priceUpTo", { price: formatPrice(maxPrice ?? 0) });
  }, [formatPrice, hasPriceBand, maxPrice, minPrice, t]);

  const headingText = useMemo(() => {
    if (search) {
      // `search.results` is the *palette's* group heading — the single word
      // "Products" — so reusing it here rendered the catalogue's <h1> as
      // `Products - "rose"`. This heading needs a sentence of its own.
      return t("products.searchResultsTitle", { query: search });
    }

    if (activeCategoryFilter) {
      return activeCategoryLabel;
    }

    return t("products.allProducts");
  }, [search, activeCategoryFilter, activeCategoryLabel, t]);

  return (
    <PageShell>

      <section className="bg-background pb-16 dark:bg-background sm:pb-24">
        {/* No trail and no eyebrow. Both restated the heading immediately
            under them — "Products / Our Products / All Products" — and the
            design opens the catalogue on the heading itself. */}
        <PageHeader
          title={headingText}
          description={!search ? t("products.subtitle") : undefined}
          className="pb-[1.875rem] sm:pb-[1.875rem]"
        >
          {search ? (
            <button
              onClick={handleClearSearch}
              className="mt-2 rounded-sm text-sm text-muted-foreground underline hover:text-foreground"
            >
              {t("search.clearSearch") || "Clear search"}
            </button>
          ) : null}
        </PageHeader>

        <div className="store-container">
          <div className="grid min-w-0 gap-7 pt-6 lg:grid-cols-[minmax(14.125rem,15.75rem)_minmax(0,1fr)] lg:items-start lg:gap-[clamp(1.875rem,3.4vw,2.75rem)] lg:pt-8">
            {/* The rail rides with the results instead of scrolling away from
                them: a shopper eleven rows into 560 products is exactly the one
                who wants to narrow, and the design system pins it under the
                bar. It scrolls inside its own height so a shop with forty
                collections cannot push the page taller than the viewport.
                No rule down its edge — the grid's own gutter separates the two
                columns, and the border was a third vertical line beside the
                page's gutter and the card grid's. */}
            <aside
              className="store-sticky-lg hidden max-h-[calc(100vh-var(--store-header-h)-3rem)] min-w-0 flex-col items-start overflow-y-auto overscroll-contain pe-2.5 text-card-foreground lg:flex"
              aria-label={t("products.filtersTitle")}
            >
              <h2 className="sr-only">{t("products.filtersTitle")}</h2>
              <ProductFilters
                search={search}
                onSearchChange={(nextSearch) =>
                  navigateWithFilters({ search: nextSearch })
                }
                categories={apiCategories}
                category={category}
                availability={availability}
                categoriesLoading={categoriesLoading}
                locale={locale}
                onCategoryChange={(nextCategory) =>
                  navigateWithFilters({ category: nextCategory })
                }
                onAvailabilityChange={(nextAvailability) =>
                  navigateWithFilters({ availability: nextAvailability })
                }
                priceRange={priceRange}
                minPrice={minPrice}
                maxPrice={maxPrice}
                onPriceChange={(next) => navigateWithFilters(next)}
                favoritesOnly={favoritesOnly}
                onFavoritesOnlyChange={(next) =>
                  navigateWithFilters({ favoritesOnly: next })
                }
                favoritesCount={favorites.length}
                t={t}
              />
              {/* At the foot of the rail, under the groups it clears, rather
                  than above them where it read as the rail's own heading. */}
              {hasActiveFilters ? (
                <Link
                  href={clearFiltersUrl}
                  scroll={false}
                  className="store-text-action mt-6 text-[0.84375rem]"
                >
                  {t("products.clearFilters")}
                </Link>
              ) : null}
            </aside>

            <div className="min-w-0" aria-busy={loading || loadingMore}>
              {/* The results header, as the design system composes it: how
                  much there is, what is narrowing it, and the control that
                  reorders it — one row closed by a rule, rather than a count on
                  one line and its controls opposite.
                  The design also names the active collection at the head of
                  this row. Here the page's own <h1> already becomes that name
                  the moment a collection is chosen, so repeating it would print
                  the same words twice, one under the other. */}
              <div className="flex min-w-0 flex-wrap items-center gap-x-3.5 gap-y-3 border-b border-border pb-5">
                <span
                  className="shrink-0 text-[0.8125rem] text-muted-foreground"
                  role="status"
                  aria-live="polite"
                >
                  {resultTotal != null ? (
                    <>
                      {new Intl.NumberFormat(locale).format(resultTotal)}{" "}
                      {resultTotal === 1
                        ? t("common.productsAvailable")
                        : t("common.productsAvailablePlural")}
                    </>
                  ) : (
                    t("common.loading")
                  )}
                </span>

                <div className="flex min-w-0 items-center gap-2 ms-auto">
                  <Sheet
                    open={filterSheetOpen}
                    onOpenChange={handleFilterSheetOpenChange}
                  >
                    <SheetTrigger asChild>
                      <Button
                        variant="outline"
                        className="relative gap-2 rounded-full px-3.5 lg:hidden"
                        aria-label={
                          activeFilterCount > 0
                            ? t("products.filtersButtonCount", {
                                count: new Intl.NumberFormat(locale).format(
                                  activeFilterCount
                                ),
                              })
                            : t("products.filtersButton")
                        }
                      >
                        <SlidersHorizontal className="size-4" aria-hidden="true" />
                        <span>{t("products.filtersButton")}</span>
                        {activeFilterCount > 0 ? (
                          <span
                            className="inline-flex min-w-5 items-center justify-center rounded-full bg-primary px-1.5 py-0.5 text-[0.6875rem] leading-4 text-primary-foreground"
                            aria-hidden="true"
                          >
                            {new Intl.NumberFormat(locale).format(activeFilterCount)}
                          </span>
                        ) : null}
                      </Button>
                    </SheetTrigger>
                    <SheetContent
                      side="start"
                      closeLabel={t("common.close")}
                      className="w-[min(92vw,24rem)] gap-0 sm:max-w-md"
                    >
                      <SheetHeader className="border-b border-border px-5 py-5 pe-16">
                        <SheetTitle className="text-lg">
                          {t("products.filtersTitle")}
                        </SheetTitle>
                        <SheetDescription>
                          {t("products.filtersDescription")}
                        </SheetDescription>
                      </SheetHeader>
                      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6 overscroll-contain">
                        <ProductFilters
                          search={search}
                          onSearchChange={(nextSearch) =>
                            navigateWithFilters({ search: nextSearch })
                          }
                          categories={apiCategories}
                          category={draftCategory}
                          availability={draftAvailability}
                          categoriesLoading={categoriesLoading}
                          locale={locale}
                          onCategoryChange={setDraftCategory}
                          onAvailabilityChange={setDraftAvailability}
                          priceRange={priceRange}
                          minPrice={draftPrice.minPrice}
                          maxPrice={draftPrice.maxPrice}
                          onPriceChange={setDraftPrice}
                          favoritesOnly={draftFavoritesOnly}
                          onFavoritesOnlyChange={setDraftFavoritesOnly}
                          favoritesCount={favorites.length}
                          t={t}
                        />
                      </div>
                      <SheetFooter className="grid grid-cols-[auto_minmax(0,1fr)] gap-2 border-t border-border bg-background p-4">
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => {
                            setDraftCategory("all");
                            setDraftAvailability(undefined);
                            setDraftPrice({});
                            setDraftFavoritesOnly(false);
                          }}
                          disabled={
                            draftCategory === "all" &&
                            !draftAvailability &&
                            !isPriceRangeActive(draftPrice) &&
                            !draftFavoritesOnly
                          }
                        >
                          {t("products.clearFilters")}
                        </Button>
                        <Button
                          type="button"
                          onClick={() => {
                            navigateWithFilters({
                              category: draftCategory,
                              availability: draftAvailability,
                              minPrice: draftPrice.minPrice,
                              maxPrice: draftPrice.maxPrice,
                              favoritesOnly: draftFavoritesOnly,
                            });
                            setFilterSheetOpen(false);
                          }}
                        >
                          {t("products.applyFilters")}
                        </Button>
                      </SheetFooter>
                    </SheetContent>
                  </Sheet>

                  <SortControl
                    options={SORT_OPTIONS}
                    active={sort}
                    hrefFor={(value) =>
                      buildProductsUrl({
                        category: activeCategoryFilter,
                        availability,
                        search,
                        sort: value,
                      })
                    }
                    t={t}
                  />
                </div>
              </div>

              {hasActiveFilters ? (
                <section
                  aria-label={t("products.selectedFilters")}
                  className="mt-4 flex min-w-0 flex-wrap items-center gap-2"
                >
                  {activeCategoryFilter ? (
                    <Link
                      href={buildProductsUrl({
                        availability,
                        search,
                        sort: hasExplicitSort ? sort : undefined,
                        minPrice,
                        maxPrice,
                        favoritesOnly,
                      })}
                      scroll={false}
                      className="inline-flex min-h-9 max-w-full items-center gap-1.5 rounded-full border border-border bg-clay-100 px-3 py-1 text-xs font-semibold text-clay-800 transition-colors hover:bg-clay-200"
                      aria-label={t("products.removeSelectedFilter", {
                        filter: activeCategoryLabel,
                      })}
                    >
                      <span className="min-w-0 break-words" dir="auto">
                        {activeCategoryLabel}
                      </span>
                      <X className="size-3.5 shrink-0" aria-hidden="true" />
                    </Link>
                  ) : null}
                  {availability ? (
                    <Link
                      href={buildProductsUrl({
                        category: activeCategoryFilter,
                        search,
                        sort: hasExplicitSort ? sort : undefined,
                        minPrice,
                        maxPrice,
                        favoritesOnly,
                      })}
                      scroll={false}
                      className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-border bg-clay-100 px-3 py-1 text-xs font-semibold text-clay-800 transition-colors hover:bg-clay-200"
                      aria-label={t("products.removeSelectedFilter", {
                        filter:
                          availability === "in-stock"
                            ? t("common.inStock")
                            : t("products.outOfStock"),
                      })}
                    >
                      {availability === "in-stock"
                        ? t("common.inStock")
                        : t("products.outOfStock")}
                      <X className="size-3.5 shrink-0" aria-hidden="true" />
                    </Link>
                  ) : null}
                  {hasPriceBand ? (
                    <Link
                      href={buildProductsUrl({
                        category: activeCategoryFilter,
                        availability,
                        search,
                        sort: hasExplicitSort ? sort : undefined,
                        favoritesOnly,
                      })}
                      scroll={false}
                      className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-border bg-clay-100 px-3 py-1 text-xs font-semibold text-clay-800 transition-colors hover:bg-clay-200"
                      aria-label={t("products.removeSelectedFilter", {
                        filter: priceBandLabel,
                      })}
                    >
                      <span dir="auto">{priceBandLabel}</span>
                      <X className="size-3.5 shrink-0" aria-hidden="true" />
                    </Link>
                  ) : null}
                  {favoritesOnly ? (
                    <Link
                      href={buildProductsUrl({
                        category: activeCategoryFilter,
                        availability,
                        search,
                        sort: hasExplicitSort ? sort : undefined,
                        minPrice,
                        maxPrice,
                      })}
                      scroll={false}
                      className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-border bg-clay-100 px-3 py-1 text-xs font-semibold text-clay-800 transition-colors hover:bg-clay-200"
                      aria-label={t("products.removeSelectedFilter", {
                        filter: t("products.favoritesOnly"),
                      })}
                    >
                      {t("products.favoritesOnly")}
                      <X className="size-3.5 shrink-0" aria-hidden="true" />
                    </Link>
                  ) : null}
                  <Link
                    href={clearFiltersUrl}
                    scroll={false}
                    className="inline-flex min-h-9 items-center rounded-full px-2.5 text-xs font-semibold text-primary underline-offset-4 hover:underline"
                  >
                    {t("products.clearAllFilters")}
                  </Link>
                </section>
              ) : null}

              <div className="mb-[1.625rem] mt-5" />

              {loading && products.length > 0 ? (
                <div
                  className="mb-4 flex items-center gap-2 text-sm text-muted-foreground"
                  role="status"
                  aria-live="polite"
                >
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  {t("products.updatingResults")}
                </div>
              ) : null}

              {error && (
                <ErrorState
                  className="mb-8"
                  message={
                    t("products.loadError") ||
                    "We couldn't load the products just now. Please check your connection and try again."
                  }
                  onRetry={() => refetch()}
                  retryLabel={t("products.tryAgain") || "Try Again"}
                  retryingLabel={t("products.retrying")}
                  isRetrying={loading}
                />
              )}

              {(loading || (favoritesOnly && !favoritesReady)) &&
              products.length === 0 ? (
                // The saved list is read from storage after mount, so before
                // that this component cannot tell an empty shelf from an
                // unread one. It waits rather than guessing.
                <ProductGridSkeleton />
              ) : products.length === 0 && !error ? (
            // Only for a successful response that genuinely returned nothing.
            // Showing this beside the load-failure alert told the customer the
            // category was empty when in fact the request never arrived.
            <Empty className="py-12">
              <EmptyHeader>
                <EmptyMedia variant="blob" aria-hidden="true" />
                <EmptyTitle role="heading" aria-level={2}>
                  {/* An empty saved list is not an empty catalogue, and telling
                      a shopper "no products match" when they simply have not
                      saved anything yet sends them to clear filters that were
                      never the problem. */}
                  {noSavedProducts
                    ? t("products.noFavorites")
                    : hasActiveFilters
                      ? t("products.noFilteredProducts")
                      : t("products.noProducts")}
                </EmptyTitle>
                <EmptyDescription>
                  {noSavedProducts
                    ? t("products.noFavoritesDescription")
                    : hasActiveFilters
                      ? t("products.noFilteredProductsDescription")
                      : search
                        ? `${t("products.noSearchResults") || "No matching products found for"} "${search}".`
                        : t("products.noProductsInCategory") ||
                          "There are no products available in this category."}
                </EmptyDescription>
              </EmptyHeader>
              <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                {hasActiveFilters ? (
                  <Button asChild className="rounded-full">
                    <Link href={clearFiltersUrl} scroll={false}>
                      {t("products.clearFilters")}
                    </Link>
                  </Button>
                ) : null}
                {search ? (
                  <Button
                    onClick={handleClearSearch}
                    variant={hasActiveFilters ? "outline" : "default"}
                    className="rounded-full"
                  >
                    {t("search.clearSearch") || "Clear search"}
                  </Button>
                ) : null}
                {!hasActiveFilters ? (
                  <Button
                    asChild
                    variant={search ? "outline" : "default"}
                    className="rounded-full"
                  >
                    <Link href="/products">
                      {t("common.viewAllProducts") || "View all products"}
                    </Link>
                  </Button>
                ) : null}
              </div>
            </Empty>
              ) : (
                <>
              <div
                className={cn(
                  "transition-opacity duration-200",
                  loading && "pointer-events-none opacity-55"
                )}
                aria-hidden={loading || undefined}
              >
                <ProductGrid>
                  {products.map((product, index) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      locale={locale}
                      t={t}
                      showCategory
                      eager={index < 4}
                      sizes={PRODUCT_GRID_IMAGE_SIZES}
                    />
                  ))}
                </ProductGrid>
              </div>

              {/* Infinite scroll sentinel (progressive enhancement) */}
              <div ref={observerTarget} className="h-px" aria-hidden="true" />
              {!loading && (hasMore || loadingMore) ? (
                // Manual fallback so keyboard/screen-reader users can advance
                // and everyone can reach the footer past the grid. The button
                // carries its own busy state rather than being swapped for a
                // spinner: unmounting it mid-load threw keyboard focus back to
                // the top of the page on every page fetched.
                <div className="mt-8 flex justify-center">
                  <Button
                    variant="outline"
                    // aria-disabled, not disabled: disabling the focused
                    // element blurs it, which is what threw keyboard focus to
                    // the top of the page on every fetch. This keeps the button
                    // focusable and announces the busy state instead.
                    aria-disabled={loadingMore}
                    aria-busy={loadingMore}
                    className={cn(loadingMore && "opacity-70")}
                    onClick={() => {
                      if (loadingMore) return;
                      fetchNextPage();
                    }}
                  >
                    {loadingMore ? (
                      <>
                        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                        {t("products.loadingMore")}
                      </>
                    ) : (
                      t("products.loadMore")
                    )}
                  </Button>
                </div>
              ) : null}
              <span className="sr-only" role="status" aria-live="polite">
                {loadingMore ? t("products.loadingMore") : ""}
              </span>
              {!loading && !hasMore && products.length > 0 && (
                <div className="mt-8 text-center">
                  <p className="text-sm text-muted-foreground">
                    {t("products.allProductsLoaded") || "All products loaded"}
                  </p>
                </div>
              )}
                </>
              )}
              {!loading && activeCategoryDescription ? (
                <CategoryRichTextDescription content={activeCategoryDescription} />
              ) : null}
            </div>
          </div>
        </div>
      </section>

    </PageShell>
  );
}
