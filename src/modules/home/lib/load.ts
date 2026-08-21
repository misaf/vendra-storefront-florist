import { fetchBlogPostCategories, fetchBlogPostsWithDetails } from "@/modules/blog";
import type { Post as BlogPost, PostCategory } from "@/modules/blog";
import {
  fetchProductCategories,
  fetchProductsWithDetails,
  type Product,
  type ProductCategory,
} from "@/modules/products";

const BLOG_PAGE_SIZE = 3;
/**
 * Eight cards fill the arrivals rail. Twelve are requested because the API's
 * stock flag and its price record are separate facts: a product can be in stock
 * and still carry no sellable price, and a rail that shows "price on request"
 * cards is not a shop window.
 */
const ARRIVALS_LIMIT = 8;
const ARRIVALS_FETCH_SIZE = 12;

export interface InitialBlogData {
  initialBlogPosts: BlogPost[];
  initialBlogCategory: PostCategory | null;
}

export async function loadInitialBlog(locale: string): Promise<InitialBlogData> {
  let blogCategories: PostCategory[] = [];

  try {
    blogCategories = await fetchBlogPostCategories(locale);
  } catch (error) {
    console.error("Error loading blog post categories:", error);
  }

  try {
    // Prefer the actual latest feed so the homepage preview and its "view all"
    // destination describe the same collection. Categories remain fallbacks
    // for older APIs that cannot return an unfiltered feed.
    for (const category of [null, ...blogCategories]) {
      const { posts } = await fetchBlogPostsWithDetails({
        perPage: BLOG_PAGE_SIZE,
        page: 1,
        category: category?.slug,
        locale,
      });

      if (posts.length > 0) {
        return { initialBlogPosts: posts, initialBlogCategory: category };
      }
    }
  } catch (error) {
    console.error("Error loading initial blog posts:", error);
  }

  return { initialBlogPosts: [], initialBlogCategory: null };
}

export interface InitialHomeCatalogue {
  /** Every collection the shop sells, for the discovery band. */
  categories: ProductCategory[];
  /** The newest products a shopper can actually buy right now. */
  arrivals: Product[];
  /** How many products are in stock, or null when the catalogue did not say. */
  inStockTotal: number | null;
}

/**
 * The home page's catalogue data in one pass.
 *
 * The arrivals rail asks the catalogue a question it can answer itself —
 * *what is newest and buyable* — instead of the homepage inventing a ranking.
 * The previous edit round-robined four products across whichever three
 * categories happened to sort first, which no shopper could have predicted and
 * no shopkeeper could have influenced.
 *
 * `fetchProductCategories` is request-cached, so the discovery band and the
 * rail's category labels share the single category call.
 */
export async function loadInitialHomeCatalogue(
  locale: string
): Promise<InitialHomeCatalogue> {
  const [categories, arrivals] = await Promise.all([
    fetchProductCategories(locale).catch((error) => {
      console.error("Error loading product categories:", error);
      return [] as ProductCategory[];
    }),
    loadHomeArrivals(locale),
  ]);

  return { categories, ...arrivals };
}

async function loadHomeArrivals(
  locale: string
): Promise<Pick<InitialHomeCatalogue, "arrivals" | "inStockTotal">> {
  try {
    const { products, pagination } = await fetchProductsWithDetails({
      page: 1,
      perPage: ARRIVALS_FETCH_SIZE,
      inStock: true,
      sort: "desc",
      locale,
    });

    return {
      arrivals: products
        .filter((product) => Number(product.price) > 0)
        .slice(0, ARRIVALS_LIMIT),
      // The catalogue's own count of what is buyable, not the length of the
      // preview above it.
      inStockTotal:
        typeof pagination.total === "number" ? pagination.total : null,
    };
  } catch (error) {
    console.error("Error loading home arrivals:", error);
    return { arrivals: [], inStockTotal: null };
  }
}
