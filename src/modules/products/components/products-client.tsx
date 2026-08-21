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
import { Breadcrumbs } from "@/shared/components/layout/breadcrumbs";
import { useTranslations } from "@/shared/hooks/use-translations";
import { useSearchParams } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Loader2, Package, SlidersHorizontal, X } from "lucide-react";
import { fetchProductsWithDetails, useProductCategories } from "../lib/queries";
import type { FetchProductsResult, Product, ProductCategory } from "../types";
import { buildProductsQueryKey, getProductsApiSort } from "../lib/keys";
import { cn } from "@/shared/lib/utils";
import dynamic from "next/dynamic";
import { hasRichTextContent } from "@/shared/lib/rich-text";
import { ProductFilters } from "./product-filters";
import {
  availabilityToInStock,
  normalizeAvailability,
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
    <section className="mt-10 rounded-lg border border-border bg-card p-5 text-card-foreground shadow-sm shadow-storefront-brand/[0.03] sm:p-6">
      <RichText content={content} density="compact" />
    </section>
  );
}

function isValidSort(value: string | null): value is SortValue {
  return SORT_OPTIONS.some((option) => option.value === value);
}

interface ProductsClientProps {
  initialProducts: Product[];
  initialPagination: FetchProductsResult["pagination"] | null;
  initialError: string | null;
  initialQueryKey: string;
  /** Resolved server-side so the heading and filters render named, not blank. */
  initialCategories: ProductCategory[];
}

export default function ProductsClient({
  initialProducts,
  initialPagination,
  initialError,
  initialQueryKey,
  initialCategories,
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
    apiSort
  );
  const currentQueryKeyRef = useRef(queryKey);
  currentQueryKeyRef.current = queryKey;

  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(initialError);
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [draftCategory, setDraftCategory] = useState(category);
  const [draftAvailability, setDraftAvailability] =
    useState<ProductAvailability | undefined>(availability);
  const [pagination, setPagination] = useState<FetchProductsResult["pagination"] | null>(
    initialPagination
  );
  const hasLoadedInitialQuery = useRef(false);
  const loadingRequestRef = useRef<{
    queryKey: string;
    page: number;
    reset: boolean;
  } | null>(null);
  const lastAppendRequestRef = useRef<{
    queryKey: string;
    page: number;
  } | null>(null);

  const observerTarget = useRef<HTMLDivElement>(null);
  const hasMore = pagination
    ? pagination.currentPage < pagination.lastPage
    : false;

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

      const query = params.toString();
      return `/products${query ? `?${query}` : ""}`;
    },
    []
  );

  const loadProducts = useCallback(
    async (page: number, reset: boolean = false) => {
      const request = loadingRequestRef.current;

      if (
        request &&
        request.queryKey === queryKey &&
        request.page === page &&
        request.reset === reset
      ) {
        return;
      }

      loadingRequestRef.current = { queryKey, page, reset };

      if (reset) {
        lastAppendRequestRef.current = null;
        setLoading(true);
        setLoadingMore(false);
      } else {
        setLoadingMore(true);
      }

      setError(null);

      try {
        const result = await fetchProductsWithDetails({
          page,
          perPage: 12,
          category: activeCategoryFilter,
          inStock,
          locale,
          search: search || undefined,
          sort: apiSort,
        });

        // Ignore a response from a filter that is no longer active.
        if (currentQueryKeyRef.current !== queryKey) return;

        setProducts((previousProducts) => {
          if (reset) return result.products;

          // Appended in arrival order: the fetch layer already returns each
          // page in the active sort, so re-ordering the merged list here would
          // only shuffle rows the shopper has already read past.
          const existingIds = new Set(previousProducts.map((p) => p.id));
          return [
            ...previousProducts,
            ...result.products.filter((incoming) => !existingIds.has(incoming.id)),
          ];
        });

        setPagination(result.pagination);
      } catch (err) {
        if (currentQueryKeyRef.current !== queryKey) return;
        console.error("Error loading products:", err);
        setError(err instanceof Error ? err.message : "Failed to load products");
        if (reset) {
          setProducts([]);
        }
      } finally {
        const isCurrentRequest =
          loadingRequestRef.current?.queryKey === queryKey &&
          loadingRequestRef.current.page === page &&
          loadingRequestRef.current.reset === reset;

        if (isCurrentRequest) {
          loadingRequestRef.current = null;
          if (reset) {
            setLoading(false);
          } else {
            setLoadingMore(false);
          }
        }
      }
    },
    [activeCategoryFilter, apiSort, inStock, locale, queryKey, search]
  );

  useEffect(() => {
    if (!hasLoadedInitialQuery.current) {
      hasLoadedInitialQuery.current = true;
      if (queryKey === initialQueryKey) {
        return;
      }
    }

    loadProducts(1, true);
  }, [initialQueryKey, loadProducts, queryKey]);

  useEffect(() => {
    if (!hasMore || loadingMore || loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          const nextPage = (pagination?.currentPage ?? 1) + 1;
          const lastAppendRequest = lastAppendRequestRef.current;

          if (
            lastAppendRequest?.queryKey === queryKey &&
            lastAppendRequest.page === nextPage
          ) {
            return;
          }

          lastAppendRequestRef.current = { queryKey, page: nextPage };
          loadProducts(nextPage, false);
        }
      },
      { threshold: 0.1 }
    );

    const target = observerTarget.current;
    if (target) observer.observe(target);

    return () => {
      if (target) observer.unobserve(target);
    };
  }, [hasMore, loadingMore, loading, loadProducts, pagination, queryKey]);

  const handleClearSearch = () => {
    router.push(
      buildProductsUrl({
        category: activeCategoryFilter,
        availability,
        sort: hasExplicitSort ? sort : undefined,
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
    Number(Boolean(activeCategoryFilter)) + Number(Boolean(availability));
  const hasActiveFilters = activeFilterCount > 0;

  const navigateWithFilters = useCallback(
    (nextCategory: string, nextAvailability: ProductAvailability | undefined) => {
      router.push(
        buildProductsUrl({
          category: nextCategory,
          availability: nextAvailability,
          search,
          sort: hasExplicitSort ? sort : undefined,
        }),
        { scroll: false }
      );
    },
    [buildProductsUrl, hasExplicitSort, router, search, sort]
  );

  const handleFilterSheetOpenChange = (open: boolean) => {
    if (open) {
      setDraftCategory(category);
      setDraftAvailability(availability);
    }
    setFilterSheetOpen(open);
  };

  const clearFiltersUrl = buildProductsUrl({
    search,
    sort: hasExplicitSort ? sort : undefined,
  });

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

      <section className="bg-background pb-16 dark:bg-background sm:pb-20">
        <PageHeader
          breadcrumbs={
            <Breadcrumbs
              label={t("products.breadcrumb")}
              items={[
                { label: t("common.home"), href: "/" },
                { label: t("common.products") },
              ]}
            />
          }
          eyebrow={t("products.title")}
          title={headingText}
          description={!search ? t("products.subtitle") : undefined}
          className="pb-7 sm:pb-9"
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
          <div className="grid min-w-0 gap-7 lg:grid-cols-[220px_minmax(0,1fr)] lg:items-start lg:gap-8 xl:grid-cols-[240px_minmax(0,1fr)] xl:gap-10">
            <aside
              className="hidden min-w-0 border-e border-border pe-6 text-card-foreground lg:block xl:pe-8"
              aria-label={t("products.filtersTitle")}
            >
              <div className="mb-6 flex items-center justify-between gap-3">
                <h2 className="text-lg font-bold text-foreground">
                  {t("products.filtersTitle")}
                </h2>
                {hasActiveFilters ? (
                  <Link
                    href={clearFiltersUrl}
                    scroll={false}
                    className="rounded-sm text-xs font-semibold text-primary underline-offset-4 hover:underline"
                  >
                    {t("products.clearFilters")}
                  </Link>
                ) : null}
              </div>
              <ProductFilters
                categories={apiCategories}
                category={category}
                availability={availability}
                categoriesLoading={categoriesLoading}
                locale={locale}
                onCategoryChange={(nextCategory) =>
                  navigateWithFilters(nextCategory, availability)
                }
                onAvailabilityChange={(nextAvailability) =>
                  navigateWithFilters(category, nextAvailability)
                }
                t={t}
              />
            </aside>

            <div className="min-w-0" aria-busy={loading || loadingMore}>
              <div className="flex min-w-0 flex-wrap items-center justify-between gap-3">
                <span
                  className="shrink-0 text-sm font-semibold text-foreground"
                  role="status"
                  aria-live="polite"
                >
                  {pagination ? (
                    <>
                      {new Intl.NumberFormat(locale).format(pagination.total)}{" "}
                      {pagination.total === 1
                        ? t("common.productsAvailable")
                        : t("common.productsAvailablePlural")}
                    </>
                  ) : (
                    t("common.loading")
                  )}
                </span>

                <div className="flex min-w-0 items-center gap-2">
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
                          categories={apiCategories}
                          category={draftCategory}
                          availability={draftAvailability}
                          categoriesLoading={categoriesLoading}
                          locale={locale}
                          onCategoryChange={setDraftCategory}
                          onAvailabilityChange={setDraftAvailability}
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
                          }}
                          disabled={
                            draftCategory === "all" && !draftAvailability
                          }
                        >
                          {t("products.clearFilters")}
                        </Button>
                        <Button
                          type="button"
                          onClick={() => {
                            navigateWithFilters(
                              draftCategory,
                              draftAvailability
                            );
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
                      })}
                      scroll={false}
                      className="inline-flex min-h-9 max-w-full items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground hover:bg-muted"
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
                      })}
                      scroll={false}
                      className="inline-flex min-h-9 items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground hover:bg-muted"
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
                  <Link
                    href={clearFiltersUrl}
                    scroll={false}
                    className="inline-flex min-h-9 items-center rounded-full px-2.5 text-xs font-semibold text-primary underline-offset-4 hover:underline"
                  >
                    {t("products.clearAllFilters")}
                  </Link>
                </section>
              ) : null}

              <div className="mb-7 mt-5 border-t border-border" />

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
                  onRetry={() => loadProducts(1, true)}
                  retryLabel={t("products.tryAgain") || "Try Again"}
                  retryingLabel={t("products.retrying")}
                  isRetrying={loading}
                />
              )}

              {loading && products.length === 0 ? (
                <ProductGridSkeleton />
              ) : products.length === 0 && !error ? (
            // Only for a successful response that genuinely returned nothing.
            // Showing this beside the load-failure alert told the customer the
            // category was empty when in fact the request never arrived.
            <Empty className="py-12">
              <EmptyHeader>
                <EmptyMedia
                  variant="icon"
                  className="size-14 rounded-full bg-secondary text-muted-foreground ring-1 ring-border"
                >
                  <Package className="h-6 w-6" />
                </EmptyMedia>
                <EmptyTitle role="heading" aria-level={2}>
                  {hasActiveFilters
                    ? t("products.noFilteredProducts")
                    : t("products.noProducts")}
                </EmptyTitle>
                <EmptyDescription>
                  {hasActiveFilters
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
                      loadProducts((pagination?.currentPage ?? 1) + 1, false);
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
