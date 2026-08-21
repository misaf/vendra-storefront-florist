import { fetchProductCategories, type ProductCategory } from "@/modules/products";

/** Four tiles: one row on desktop, two on a phone. */
const ABOUT_CATEGORY_LIMIT = 4;

/**
 * The collections the about page shows as the work itself.
 *
 * Image-led, so categories the catalogue has photographed come first; the
 * shop's own order decides everything after that. The band is presentation
 * only — it never asserts that these four are the shop's best or busiest,
 * because the catalogue does not say that and this page must not invent it.
 *
 * A failure returns nothing and the band disappears. The about page's story
 * does not depend on the catalogue being reachable.
 */
export async function loadAboutCategories(
  locale: string
): Promise<ProductCategory[]> {
  try {
    const categories = await fetchProductCategories(locale);
    const illustrated = categories.filter((category) => category.image);

    return (
      illustrated.length >= ABOUT_CATEGORY_LIMIT ? illustrated : categories
    ).slice(0, ABOUT_CATEGORY_LIMIT);
  } catch (error) {
    console.error("Error loading about page categories:", error);
    return [];
  }
}
