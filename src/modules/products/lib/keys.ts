import type { FetchProductsParams } from "../types";

export type ProductSortValue = "newest" | "oldest" | "price-asc" | "price-desc";

/**
 * The fetch-layer sort token for a catalogue sort.
 *
 * Recency maps onto the API's own `sort[createdAt]`. Price has no server-side
 * parameter, so it is passed through as its own token and resolved over the
 * whole filtered catalogue in `fetchProducts` — it used to return `undefined`
 * here, which meant the API sent its default order and the client re-sorted
 * only the twelve rows already on screen. "Cheapest first" then showed the
 * cheapest of the twelve newest, not the cheapest in the shop.
 */
export function getProductsApiSort(
  sort: ProductSortValue | undefined
): string | undefined {
  if (!sort || sort === "newest") return "desc";
  if (sort === "oldest") return "asc";
  return sort;
}

export function buildProductsQueryKey(
  locale: string,
  category: string | undefined,
  inStock: boolean | undefined,
  search: string,
  apiSort: string | undefined,
  // The band is part of the identity of a catalogue page, not a display option:
  // leaving it out would let the server's page for "any price" be seeded under a
  // URL that asks for "up to 50", which is the same class of bug the key already
  // exists to prevent for category and availability.
  minPrice?: number,
  maxPrice?: number
): string {
  const order = apiSort ?? "client-sort";
  const availability =
    typeof inStock === "boolean" ? (inStock ? "in-stock" : "out-of-stock") : "all";
  const band = `${minPrice ?? ""}-${maxPrice ?? ""}`;
  return `${locale}|${category ?? "all"}|${availability}|${search}|${order}|${band}`;
}

export const productKeys = {
  all: ["products"] as const,
  lists: () => [...productKeys.all, "list"] as const,
  list: (params: FetchProductsParams = {}) =>
    [...productKeys.lists(), params] as const,
  details: () => [...productKeys.all, "detail"] as const,
  detail: (locale: string, id: string | number) =>
    [...productKeys.details(), locale, String(id)] as const,
  categories: (locale: string) =>
    [...productKeys.all, "categories", locale] as const,
};
