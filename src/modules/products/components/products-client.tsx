"use client";
import { Link, useRouter } from "@/shared/i18n/navigation";
import { PageShell } from "@/shared/components/layout/page-shell";
import { Button } from "@/shared/components/ui/button";
import { ErrorState } from "@/shared/components/ui/error-state";
import { Input } from "@/shared/components/ui/input";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/shared/components/ui/empty";
import { ProductCard } from "./product-card";
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
import {
  ArrowUpDown,
  ChevronDown,
  Clock,
  Loader2,
  Package,
  SortAsc,
  SortDesc,
  Search,
} from "lucide-react";
import { fetchProductsWithDetails, useProductCategories } from "../lib/queries";
import type { FetchProductsResult, Product, ProductCategory } from "../types";
import { buildProductsQueryKey, getProductsApiSort } from "../lib/keys";
import { cn } from "@/shared/lib/utils";
import dynamic from "next/dynamic";
import { hasRichTextContent } from "@/shared/lib/rich-text";

// The TipTap renderer (and prosemirror underneath it) is the heaviest thing on
// these pages and is only reached when a record actually carries rich text, so
// it loads as its own chunk instead of riding along with the catalogue.
const RichText = dynamic(() =>
  import("@/shared/components/rich-text").then((m) => m.RichText)
);
import { useBrandIcon } from "@/shared/property/use-brand-icon";

type SortValue = "newest" | "oldest" | "price-asc" | "price-desc";
type EffectiveSortValue = SortValue | "api-order";

const SORT_OPTIONS: Array<{
  value: SortValue;
  labelKey: string;
  icon: typeof Clock;
}> = [
  { value: "newest", labelKey: "products.sortNewest", icon: Clock },
  { value: "oldest", labelKey: "products.sortOldest", icon: Clock },
  { value: "price-asc", labelKey: "products.sortPriceAsc", icon: SortAsc },
  { value: "price-desc", labelKey: "products.sortPriceDesc", icon: SortDesc },
];

const CATEGORY_PAGE_SIZE = 10;


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

function sortProductsStatic(
  items: Product[],
  sort: EffectiveSortValue,
  locale: string
): Product[] {
  const sortedItems = [...items];

  switch (sort) {
    case "api-order":
      break;
    case "oldest":
      sortedItems.sort((a, b) => a.id - b.id);
      break;
    case "price-asc":
      sortedItems.sort((a, b) => {
        const aPrice = Number(a.price) || 0;
        const bPrice = Number(b.price) || 0;

        if (aPrice !== bPrice) {
          return aPrice - bPrice;
        }

        return a.name.localeCompare(b.name, locale === "fa" ? "fa" : "en", {
          sensitivity: "base",
        });
      });
      break;
    case "price-desc":
      sortedItems.sort((a, b) => {
        const aPrice = Number(a.price) || 0;
        const bPrice = Number(b.price) || 0;

        if (aPrice !== bPrice) {
          return bPrice - aPrice;
        }

        return a.name.localeCompare(b.name, locale === "fa" ? "fa" : "en", {
          sensitivity: "base",
        });
      });
      break;
    case "newest":
    default:
      sortedItems.sort((a, b) => b.id - a.id);
      break;
  }

  return sortedItems;
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
  const BrandIcon = useBrandIcon();
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
  const search = searchParams.get("search")?.trim() || "";
  const sortParam = searchParams.get("sort");
  const explicitSort = isValidSort(sortParam) ? sortParam : undefined;
  const hasExplicitSort = Boolean(explicitSort);
  const sort: SortValue = explicitSort ?? "newest";
  const apiSort = getProductsApiSort(sort);
  const usesApiSortOrder = Boolean(apiSort);
  const effectiveSort: EffectiveSortValue =
    usesApiSortOrder ? "api-order" : sort;
  const queryKey = buildProductsQueryKey(
    locale,
    activeCategoryFilter,
    search,
    apiSort
  );
  const currentQueryKeyRef = useRef(queryKey);
  currentQueryKeyRef.current = queryKey;

  const [products, setProducts] = useState<Product[]>(() =>
    sortProductsStatic(initialProducts, effectiveSort, locale)
  );
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(initialError);
  const [categorySearch, setCategorySearch] = useState("");
  const [visibleCategoryCount, setVisibleCategoryCount] =
    useState(CATEGORY_PAGE_SIZE);
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

  const sortProducts = useCallback(
    (items: Product[]) => sortProductsStatic(items, effectiveSort, locale),
    [effectiveSort, locale]
  );
  const categoryOptions = useMemo(
    () => [
      { value: "all", label: t("products.categoryAll") },
      ...apiCategories.map((apiCategory) => ({
        value: apiCategory.slug,
        label: apiCategory.name,
      })),
    ],
    [apiCategories, t]
  );
  const filteredCategoryOptions = useMemo(() => {
    const query = categorySearch.trim().toLocaleLowerCase(locale);

    if (!query) {
      return categoryOptions;
    }

    return categoryOptions.filter((option) =>
      option.label.toLocaleLowerCase(locale).includes(query)
    );
  }, [categoryOptions, categorySearch, locale]);
  const visibleCategoryOptions = useMemo(
    () => filteredCategoryOptions.slice(0, visibleCategoryCount),
    [filteredCategoryOptions, visibleCategoryCount]
  );
  const hasMoreCategories =
    visibleCategoryCount < filteredCategoryOptions.length;
  const activeCategoryDescription = useMemo(() => {
    if (!activeCategoryFilter) {
      return "";
    }

    const match = apiCategories.find(
      (apiCategory) => apiCategory.slug === activeCategoryFilter
    );
    return match?.richDescription ?? match?.description ?? "";
  }, [activeCategoryFilter, apiCategories]);

  useEffect(() => {
    setProducts((previousProducts) => sortProducts(previousProducts));
  }, [sortProducts]);

  useEffect(() => {
    setVisibleCategoryCount(CATEGORY_PAGE_SIZE);
  }, [categorySearch]);

  const buildProductsUrl = useCallback(
    (next: { category?: string; search?: string; sort?: SortValue }) => {
      const params = new URLSearchParams();

      if (next.category && next.category !== "all") {
        params.set("category", next.category);
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
        setProducts([]);
      } else {
        setLoadingMore(true);
      }

      setError(null);

      try {
        const result = await fetchProductsWithDetails({
          page,
          perPage: 12,
          category: activeCategoryFilter,
          locale,
          search: search || undefined,
          sort: apiSort,
        });

        // Ignore a response from a filter that is no longer active.
        if (currentQueryKeyRef.current !== queryKey) return;

        setProducts((previousProducts) => {
          if (reset) return sortProducts(result.products);

          const existingIds = new Set(previousProducts.map((p) => p.id));
          const mergedProducts = [
            ...previousProducts,
            ...result.products.filter((incoming) => !existingIds.has(incoming.id)),
          ];

          return sortProducts(mergedProducts);
        });

        setPagination(result.pagination);
      } catch (err) {
        console.error("Error loading products:", err);
        setError(err instanceof Error ? err.message : "Failed to load products");
        if (reset) {
          setProducts([]);
        }
      } finally {
        if (
          loadingRequestRef.current?.queryKey === queryKey &&
          loadingRequestRef.current.page === page &&
          loadingRequestRef.current.reset === reset
        ) {
          loadingRequestRef.current = null;
        }

        if (reset) {
          setLoading(false);
        } else {
          setLoadingMore(false);
        }
      }
    },
    [activeCategoryFilter, apiSort, locale, queryKey, search, sortProducts]
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

  const handleCategoryChange = (newCategory: string) => {
    router.push(
      buildProductsUrl({
        category: newCategory,
        search,
        sort: hasExplicitSort ? sort : undefined,
      }),
      { scroll: false }
    );
  };

  const handleClearSearch = () => {
    router.push(
      buildProductsUrl({
        category: activeCategoryFilter,
        sort: hasExplicitSort ? sort : undefined,
      }),
      { scroll: false }
    );
  };

  const headingText = useMemo(() => {
    if (search) {
      return `${t("search.results") || "Search Results"} - "${search}"`;
    }

    if (activeCategoryFilter) {
      const match = categoryOptions.find(
        (option) => option.value === activeCategoryFilter
      );
      if (match) {
        return match.label;
      }
    }

    return t("products.allProducts");
  }, [search, activeCategoryFilter, categoryOptions, t]);

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
          <div className="grid min-w-0 gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:items-start lg:gap-10">
            <aside className="min-w-0 border-b border-border pb-4 text-card-foreground store-sticky-lg lg:rounded-xl lg:border lg:bg-card/55 lg:p-4">
              <div className="mb-2 flex items-center justify-between gap-3 px-1">
                <h2 className="text-xs font-bold uppercase text-muted-foreground">
                  {t("common.categories")}
                </h2>
                {categoriesLoading && (
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                )}
              </div>
              <div className="relative mb-2">
                <Search className="pointer-events-none absolute start-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  value={categorySearch}
                  onChange={(event) => setCategorySearch(event.target.value)}
                  aria-label={t("products.categorySearch")}
                  placeholder={t("products.categorySearch")}
                  className="h-11 rounded-xl bg-background px-9 text-xs dark:bg-storefront-brand-soft"
                />
              </div>
              <div className="store-scroll-row -mx-1 flex max-w-full gap-1.5 overflow-x-auto px-1 pb-2 lg:mx-0 lg:max-h-96 lg:flex-col lg:overflow-y-auto lg:overflow-x-hidden lg:px-0 lg:pb-0 lg:pe-1">
                {filteredCategoryOptions.length === 0 ? (
                  <p className="px-1 py-2 text-xs text-muted-foreground">
                    {t("products.noCategoryResults")}
                  </p>
                ) : (
                  visibleCategoryOptions.map((option) => {
                    const isActive = category === option.value;

                    return (
                      <button
                        key={option.value}
                        type="button"
                        aria-pressed={isActive}
                        onClick={() => handleCategoryChange(option.value)}
                        className={cn(
                          "flex min-h-11 max-w-44 shrink-0 items-center justify-between gap-2 rounded-full border px-3 py-1.5 text-sm font-semibold transition-colors lg:min-h-10 lg:w-full lg:max-w-none lg:rounded-xl lg:border-transparent lg:text-xs",
                          isActive
                            ? "border-primary bg-primary text-primary-foreground shadow-sm shadow-storefront-brand/10"
                            : "border-border bg-card text-card-foreground hover:border-primary/25 hover:bg-secondary hover:text-primary lg:bg-transparent"
                        )}
                      >
                        <span className="truncate">{option.label}</span>
                        {isActive && (
                          <BrandIcon className="h-3.5 w-3.5 shrink-0" />
                        )}
                      </button>
                    );
                  })
                )}
              </div>
              {hasMoreCategories && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="mt-2 w-full justify-center gap-1.5 rounded-md text-xs font-semibold text-primary hover:bg-muted hover:text-primary"
                  onClick={() =>
                    setVisibleCategoryCount((currentCount) =>
                      Math.min(
                        currentCount + CATEGORY_PAGE_SIZE,
                        filteredCategoryOptions.length
                      )
                    )
                  }
                >
                  {t("products.loadMoreCategories")}
                  <ChevronDown className="h-3.5 w-3.5" />
                </Button>
              )}
            </aside>

            <div className="min-w-0" aria-busy={loading || loadingMore}>
              <div className="flex w-full min-w-0 flex-col gap-3 text-start sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-x-4">
                {/* Sort stays a set of links so each order is a shareable URL,
                    but the selected one is marked with aria-current="true"
                    (these are not pages) and every option keeps a full-size
                    target at all widths rather than collapsing to bare text. */}
                <div
                  role="group"
                  aria-label={t("products.sortLabel")}
                  className="store-scroll-row -mx-1 flex max-w-full items-center gap-2 overflow-x-auto px-1 pb-1 sm:mx-0 sm:flex-wrap sm:gap-2.5 sm:px-0 sm:pb-0"
                >
                  <span className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-muted-foreground">
                    <ArrowUpDown className="size-4" aria-hidden="true" />
                    {t("products.sortBy")}
                  </span>
                  {SORT_OPTIONS.map((option) => {
                    const isActive = sort === option.value;

                    return (
                      <Link
                        key={option.value}
                        href={buildProductsUrl({
                          category: activeCategoryFilter,
                          search,
                          sort: option.value,
                        })}
                        scroll={false}
                        aria-current={isActive ? "true" : undefined}
                        className={cn(
                          "inline-flex min-h-11 shrink-0 items-center rounded-full border px-3 text-xs font-semibold transition-colors",
                          isActive
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-card text-muted-foreground hover:border-primary/30 hover:text-foreground"
                        )}
                      >
                        {t(option.labelKey)}
                      </Link>
                    );
                  })}
                </div>
                {!loading && pagination ? (
                  <span className="shrink-0 text-xs font-semibold text-muted-foreground sm:text-end" role="status" aria-live="polite">
                    {new Intl.NumberFormat(locale).format(pagination.total)}{" "}
                    {pagination.total === 1
                      ? t("common.productsAvailable") || "product"
                      : t("common.productsAvailablePlural") || "products"}
                  </span>
                ) : null}
              </div>

              <div className="mb-7 mt-5 border-t border-border" />

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

          {loading ? (
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
                <EmptyTitle>{t("products.noProducts") || "No products found"}</EmptyTitle>
                <EmptyDescription>
                  {search
                    ? `${t("products.noSearchResults") || "No matching products found for"} "${search}".`
                    : t("products.noProductsInCategory") ||
                      "There are no products available in this category."}
                </EmptyDescription>
              </EmptyHeader>
              {search ? (
                <Button onClick={handleClearSearch} className="mt-5 rounded-full">
                  {t("search.clearSearch") || "Clear search"}
                </Button>
              ) : (
                <Button asChild className="mt-5 rounded-full">
                  <Link href="/products">
                    {t("common.viewAllProducts") || "View all products"}
                  </Link>
                </Button>
              )}
            </Empty>
          ) : (
            <>
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

              {/* Infinite scroll sentinel (progressive enhancement) */}
              <div ref={observerTarget} className="h-px" aria-hidden="true" />
              {hasMore || loadingMore ? (
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
              {!hasMore && products.length > 0 && (
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
