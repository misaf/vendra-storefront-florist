import { cache } from "react";
import { PRODUCTS_PAGE_SIZE } from "./queries";
import {
  fetchProductBySlug,
  fetchProductsWithDetails,
} from "./server-queries";
import {
  buildProductsQueryKey,
  getProductsApiSort,
  type ProductSortValue,
} from "./keys";
import type { FetchProductsResult, Product } from "../types";
import {
  availabilityToInStock,
  type ProductAvailability,
} from "./filter-state";

/** Deduplicate the product fetch across generateMetadata + the page render. */
export const getProduct = cache((slug: string, locale: string) =>
  fetchProductBySlug(slug, locale)
);

/**
 * Related products are secondary — fetched without blocking the product render
 * and streamed in via <Suspense> on the client. Errors degrade to an empty list.
 */
export async function loadRelatedProducts(
  product: Product,
  locale: string
): Promise<Product[]> {
  try {
    const currentProductId = product.id;
    const relatedResult = await fetchProductsWithDetails({
      page: 1,
      perPage: 16,
      category: product.categorySlug,
      locale,
      sort: "random-position",
    });

    const relatedProducts = relatedResult.products.filter(
      (candidate) => candidate.id !== currentProductId
    );

    if (relatedProducts.length < 8) {
      const fallbackResult = await fetchProductsWithDetails({
        page: 1,
        perPage: 16,
        locale,
        sort: "random-position",
      });
      const relatedIds = new Set(relatedProducts.map((item) => item.id));
      for (const candidate of fallbackResult.products) {
        if (candidate.id === currentProductId || relatedIds.has(candidate.id)) {
          continue;
        }
        relatedIds.add(candidate.id);
        relatedProducts.push(candidate);
      }
    }

    return relatedProducts.slice(0, 12);
  } catch {
    return [];
  }
}

export function normalizeCategory(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const category = value.trim();
  if (!category || category === "all") return undefined;
  return category;
}

export function normalizeSort(value: string | undefined): ProductSortValue | undefined {
  if (
    value === "newest" ||
    value === "oldest" ||
    value === "price-asc" ||
    value === "price-desc"
  ) {
    return value;
  }

  return undefined;
}

export interface LoadProductsPageResult {
  /**
   * Page one exactly as the catalogue returned it, or null when the call
   * failed. The client seeds React Query with it and, on null, fetches for
   * itself — so a transient server-side failure recovers instead of stranding
   * the shopper on an error with a manual retry.
   */
  initialPage: FetchProductsResult | null;
  /** The filters this page answers, so the client can tell whether its own
   *  (possibly newer) filters still match before seeding the cache with it. */
  initialQueryKey: string;
}

export async function loadProductsPage({
  locale,
  category,
  availability,
  search,
  sort,
}: {
  locale: string;
  category: string | undefined;
  availability: ProductAvailability | undefined;
  search: string;
  sort: ProductSortValue | undefined;
}): Promise<LoadProductsPageResult> {
  const apiSort = getProductsApiSort(sort);
  const inStock = availabilityToInStock(availability);
  const initialQueryKey = buildProductsQueryKey(
    locale,
    category,
    inStock,
    search,
    apiSort
  );

  try {
    const initialPage = await fetchProductsWithDetails({
      page: 1,
      perPage: PRODUCTS_PAGE_SIZE,
      category,
      inStock,
      locale,
      search: search || undefined,
      sort: apiSort,
    });

    return { initialPage, initialQueryKey };
  } catch (error) {
    console.error("Error loading the catalogue page:", error);
    return { initialPage: null, initialQueryKey };
  }
}
