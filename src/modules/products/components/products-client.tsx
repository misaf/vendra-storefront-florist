"use client";
import { Link, useRouter } from "@/shared/i18n/navigation";
import { PageShell } from "@/shared/components/layout/page-shell";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { Input } from "@/shared/components/ui/input";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/shared/components/ui/empty";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { ThemedProductImage } from "./themed-product-image";
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
  ImageOff,
  Loader2,
  Package,
  SortAsc,
  SortDesc,
  Search,
} from "lucide-react";
import { fetchProductsWithDetails, type FetchProductsResult } from "@/modules/products";
import { useProductCategories } from "@/modules/products";
import type { Product } from "@/modules/products";
import { buildProductsQueryKey, getProductsApiSort } from "../lib/keys";
import { createReadableResourcePath } from "@/shared/lib/slug-url";
import {cn, normalizeImageUrl} from "@/shared/lib/utils";
import { RichText, hasRichTextContent } from "@/shared/components/rich-text";
import { useBrandIcon } from "@/shared/property/use-brand-icon";
import { useFormatPrice } from "@/shared/property/use-format-price";

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
      <RichText
        content={content}
        className="space-y-4 text-sm leading-7 [&_.tableWrapper]:overflow-x-auto [&_.tableWrapper]:rounded-lg [&_.tableWrapper]:border [&_.tableWrapper]:border-border [&_a]:font-semibold [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-4 [&_a:hover]:text-primary/80 [&_blockquote]:border-s-2 [&_blockquote]:border-primary/30 [&_blockquote]:ps-4 [&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-[0.9em] [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-card-foreground [&_h3]:text-base [&_h3]:font-bold [&_h3]:text-card-foreground [&_img]:rounded-lg [&_ol]:list-inside [&_ol]:list-decimal [&_table]:w-full [&_table]:min-w-max [&_table]:border-collapse [&_tbody_tr:nth-child(even)]:bg-muted/35 [&_td]:border [&_td]:border-border [&_td]:px-3 [&_td]:py-2 [&_td]:align-top [&_th]:border [&_th]:border-border [&_th]:bg-muted [&_th]:px-3 [&_th]:py-2 [&_th]:text-start [&_th]:font-semibold [&_th]:text-card-foreground [&_ul]:list-inside [&_ul]:list-disc"
      />
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
}

export default function ProductsClient({
  initialProducts,
  initialPagination,
  initialError,
  initialQueryKey,
}: ProductsClientProps) {
  const formatPrice = useFormatPrice();
  const { t, locale } = useTranslations();
  const BrandIcon = useBrandIcon();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: apiCategories = [], isLoading: categoriesLoading } =
    useProductCategories();

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
  const queryKey = buildProductsQueryKey(activeCategoryFilter, search, apiSort);

  const [products, setProducts] = useState<Product[]>(() =>
    sortProductsStatic(initialProducts, effectiveSort, locale)
  );
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(initialError);
  const [imageErrorIds, setImageErrorIds] = useState<Set<number>>(new Set());
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
        setImageErrorIds(new Set());
      } else {
        setLoadingMore(true);
      }

      setError(null);

      try {
        const result = await fetchProductsWithDetails({
          page,
          perPage: 12,
          category: activeCategoryFilter,
          search: search || undefined,
          sort: apiSort,
        });

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
    [activeCategoryFilter, apiSort, queryKey, search, sortProducts]
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

  const markImageAsFailed = useCallback((productId: number) => {
    setImageErrorIds((previousIds) => {
      if (previousIds.has(productId)) {
        return previousIds;
      }

      const nextIds = new Set(previousIds);
      nextIds.add(productId);
      return nextIds;
    });
  }, []);

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

      <section className="bg-background pb-16 pt-24 dark:bg-background sm:pb-20 sm:pt-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-6 flex flex-col items-start gap-4 text-start sm:mb-8">
            <div>
              <span className="golzar-seam mb-3 max-w-[7rem]">
                <span className="petal-dot" aria-hidden="true" />
                <span className="h-px flex-1" aria-hidden="true" />
              </span>
              <h1 className="font-display text-2xl leading-tight tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                {headingText}
              </h1>
              {search && (
                <button
                  onClick={handleClearSearch}
                  className="mt-2 text-sm text-muted-foreground underline hover:text-foreground"
                >
                  {t("search.clearSearch") || "Clear search"}
                </button>
              )}
            </div>

          </div>

          <div className="grid min-w-0 gap-4 sm:gap-6 lg:grid-cols-[260px_minmax(0,1fr)] lg:items-start">
            <aside className="min-w-0 rounded-lg border border-border bg-card p-2.5 text-card-foreground shadow-sm shadow-storefront-brand/[0.03] sm:p-3 lg:sticky lg:top-24">
              <div className="mb-2 flex items-center justify-between gap-3 px-1">
                <h3 className="text-xs font-bold uppercase text-muted-foreground">
                  {t("common.categories")}
                </h3>
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
                  className="h-8 rounded-md bg-storefront-brand-soft px-8 text-xs dark:bg-storefront-brand-soft"
                />
              </div>
              <div className="-mx-1 flex max-w-full snap-x gap-1.5 overflow-x-auto px-1 pb-1 lg:mx-0 lg:max-h-96 lg:snap-none lg:flex-col lg:overflow-y-auto lg:overflow-x-hidden lg:px-0 lg:pb-0 lg:pe-1">
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
                          "flex min-h-9 max-w-44 shrink-0 snap-start items-center justify-between gap-2 rounded-full border px-3 py-1.5 text-sm font-semibold transition-colors lg:min-h-8 lg:w-full lg:max-w-none lg:rounded-md lg:py-1.5 lg:text-xs",
                          isActive
                            ? "border-primary bg-primary text-primary-foreground shadow-sm shadow-storefront-brand/10"
                            : "border-border bg-storefront-brand-soft text-card-foreground hover:border-primary/30 hover:bg-muted hover:text-primary"
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

            <div className="min-w-0">
              <div className="flex w-full min-w-0 flex-col gap-2 text-start sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-x-4">
                <div className="-mx-1 flex max-w-full items-center gap-3 overflow-x-auto px-1 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0">
                  <span className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-muted-foreground">
                    <ArrowUpDown className="h-4 w-4" />
                    {t("products.sortBy") || "Sort by"}
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
                        aria-current={isActive ? "page" : undefined}
                        className={cn(
                          "inline-flex min-h-8 shrink-0 items-center rounded-full border px-3 text-xs font-semibold transition-colors sm:min-h-0 sm:rounded-none sm:border-0 sm:px-0",
                          isActive
                            ? "border-primary/25 bg-storefront-brand-soft text-primary sm:bg-transparent sm:font-bold sm:underline sm:decoration-2 sm:underline-offset-4"
                            : "border-border bg-card text-muted-foreground hover:border-primary/30 hover:text-primary sm:bg-transparent"
                        )}
                      >
                        {t(option.labelKey)}
                      </Link>
                    );
                  })}
                </div>
                {!loading && pagination ? (
                  <span className="shrink-0 text-xs font-semibold text-muted-foreground sm:text-end">
                    {new Intl.NumberFormat(locale).format(pagination.total)}{" "}
                    {pagination.total === 1
                      ? t("common.productsAvailable") || "product"
                      : t("common.productsAvailablePlural") || "products"}
                  </span>
                ) : null}
              </div>

              <div className="mb-6 mt-4 border-t border-border" />

          {error && (
            <Alert variant="destructive" className="mb-8">
              <AlertDescription>
                <p>
                  {t("products.loadError") ||
                    "We couldn't load the products just now. Please check your connection and try again."}
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => loadProducts(1, true)}
                >
                  {t("products.tryAgain") || "Try Again"}
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {loading ? (
            <div className="grid grid-cols-2 items-stretch gap-px bg-border sm:grid-cols-2 xl:grid-cols-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="flex h-full flex-col bg-card">
                  <div className="aspect-square sm:aspect-[4/5]">
                    <Skeleton className="h-full w-full rounded-none" />
                  </div>
                  <div className="flex min-h-24 flex-1 flex-col gap-2 px-3 pb-2 pt-3 sm:px-4 sm:pt-4">
                    <Skeleton className="h-5 w-16 rounded-full" />
                    <Skeleton className="mt-1 h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                  <div className="flex justify-end px-3 pb-3 pt-2 sm:px-4 sm:pb-4">
                    <Skeleton className="h-4 w-20" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
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
              <div className="grid grid-cols-2 items-stretch gap-px bg-border sm:grid-cols-2 xl:grid-cols-4">
                {products.map((product) => {
                  const hasImageError = imageErrorIds.has(product.id);
                  const productImageUrl = normalizeImageUrl(product.image);
	                  const detailHref = `/products/${createReadableResourcePath(
	                    product.id,
	                    product.slug
	                  )}`;
	                  const inStock = product.inStock !== false;
                  const hasPrice = Number(product.price) > 0 && inStock;
                  const displayPrice = formatPrice(product.price, product.formattedPrice);

                  return (
	                    <div
	                      key={product.id}
                      className="group relative flex h-full flex-col bg-card text-card-foreground transition-colors hover:bg-muted/45"
	                    >
	                      <span
                        aria-hidden="true"
                        className="absolute inset-x-0 top-0 z-10 h-0.5 origin-center scale-x-0 bg-foreground transition-transform duration-300 group-hover:scale-x-100"
                      />
                      <div className="relative aspect-square overflow-hidden bg-card sm:aspect-[4/5]">
                        <Link
                          href={detailHref}
                          className="block h-full w-full rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
                        >
                          {hasImageError ? (
                            <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-card text-muted-foreground">
                              <span className="flex size-14 items-center justify-center rounded-full bg-background/75 shadow-sm ring-1 ring-border">
                                <ImageOff className="h-6 w-6" />
                              </span>
                              <span className="max-w-28 text-center text-xs font-semibold leading-5">
                                {t("products.imageUnavailable") || "Image unavailable"}
                              </span>
                            </div>
                          ) : (
                            <ThemedProductImage
	                              src={productImageUrl}
	                              alt={product.name}
	                              width={360}
	                              height={450}
                              className="h-full w-full object-contain p-1.5 transition-transform duration-500 group-hover:scale-[1.03] sm:p-2"
                              unoptimized
                              loading="lazy"
                              onError={() => markImageAsFailed(product.id)}
                            />
                          )}
                        </Link>
                        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/18 to-transparent" />

	                      </div>

	                      <div className="flex min-h-24 flex-1 flex-col gap-2 px-3 pb-2 pt-3 sm:px-4 sm:pt-4">
	                        {product.category && (
	                          <div>
	                            <Badge variant="secondary" className="rounded-full bg-storefront-brand-soft px-2 py-0.5 text-[11px] text-primary dark:bg-storefront-brand-soft dark:text-primary">
	                              {product.category}
	                            </Badge>
	                          </div>
	                        )}
	                        <h3 className="line-clamp-2 min-h-10 text-xs font-semibold leading-5 sm:text-sm">
                          <Link
                            href={detailHref}
                            className="flex items-start gap-2 rounded-sm outline-none transition-colors hover:text-foreground/70 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                          >
                            <span className="petal-dot mt-1.5" aria-hidden="true" />
                            <span className="min-w-0">{product.name}</span>
                          </Link>
                        </h3>
                      </div>

		                      <div className="mt-auto flex justify-end gap-3 px-3 pb-3 pt-2 text-end sm:px-4 sm:pb-4 sm:pt-3">
		                        <div className="min-w-0 self-center">
	                          <span
                              dir="ltr"
	                            className={cn(
	                              "block truncate text-xs font-bold leading-5 sm:text-sm",
	                              inStock
	                                ? "text-card-foreground"
	                                : "text-muted-foreground"
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
                    </div>
                  );
                })}
              </div>

              {/* Infinite scroll sentinel (progressive enhancement) */}
              <div ref={observerTarget} className="h-px" aria-hidden="true" />
              {loadingMore ? (
                <div className="mt-8 flex items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  <span className="ms-2 text-sm text-muted-foreground">
                    {t("products.loadingMore") || "Loading more products..."}
                  </span>
                </div>
              ) : hasMore ? (
                // Manual fallback so keyboard/screen-reader users can advance
                // and everyone can reach the footer past the grid.
                <div className="mt-8 flex justify-center">
                  <Button
                    variant="outline"
                    onClick={() =>
                      loadProducts((pagination?.currentPage ?? 1) + 1, false)
                    }
                  >
                    {t("products.loadMore") || "Load more products"}
                  </Button>
                </div>
              ) : null}
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
