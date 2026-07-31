import type { FetchProductsParams } from "../types";

export type ProductSortValue = "newest" | "oldest" | "price-asc" | "price-desc";

export function getProductsApiSort(
  sort: ProductSortValue | undefined
): string | undefined {
  if (!sort || sort === "newest") return "desc";
  if (sort === "oldest") return "asc";
  return undefined;
}

export function buildProductsQueryKey(
  category: string | undefined,
  search: string,
  apiSort: string | undefined
): string {
  const order = apiSort ?? "client-sort";
  return `${category ?? "all"}|${search}|${order}`;
}

export const productKeys = {
  all: ["products"] as const,
  lists: () => [...productKeys.all, "list"] as const,
  list: (params: FetchProductsParams = {}) =>
    [...productKeys.lists(), params] as const,
  details: () => [...productKeys.all, "detail"] as const,
  detail: (id: string | number) => [...productKeys.details(), String(id)] as const,
  categories: () => [...productKeys.all, "categories"] as const,
};
