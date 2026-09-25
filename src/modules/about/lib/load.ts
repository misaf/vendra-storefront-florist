import {
  fetchProductCategories,
  fetchProductsWithDetails,
  type ProductCategory,
} from "@/modules/products/server";
import { fetchBlogPostsWithDetails } from "@/modules/blog/server";

/**
 * The four numbers the story band sets beside the studio portrait.
 *
 * The source design hand-sets these — a founding year, bouquets tied, weddings
 * delivered, people in the studio — and not one of those facts exists anywhere
 * in this storefront's API. Printing them would be inventing a shop's history
 * on its own About page, which is the single worst place to do it.
 *
 * So the band keeps the design's composition and counts what the storefront
 * can actually see: how much is in the catalogue, how much of it is buyable
 * today, how many collections it is grouped into, and how much the shop has
 * written. Every one is a live figure, and any that cannot be read is simply
 * not drawn.
 */
export interface AboutStat {
  key: string;
  value: number;
}

export async function loadAboutStats(locale: string): Promise<AboutStat[]> {
  const [categories, catalogue, inStock, journal] = await Promise.all([
    fetchProductCategories(locale).catch(() => [] as ProductCategory[]),
    fetchProductsWithDetails({ page: 1, perPage: 1, locale }).catch(() => null),
    fetchProductsWithDetails({ page: 1, perPage: 1, inStock: true, locale }).catch(
      () => null
    ),
    fetchBlogPostsWithDetails({ page: 1, perPage: 1, locale }).catch(() => null),
  ]);

  const total = (result: { pagination: { total?: number } } | null) =>
    typeof result?.pagination.total === "number" ? result.pagination.total : null;

  return [
    { key: "catalogue", value: total(catalogue) },
    { key: "inStock", value: total(inStock) },
    { key: "collections", value: categories.length || null },
    { key: "journal", value: total(journal) },
  ].filter((stat): stat is AboutStat => stat.value != null && stat.value > 0);
}
