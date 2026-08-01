import { fetchBlogPostCategories, fetchBlogPostsWithDetails } from "@/modules/blog";
import type { Post as BlogPost, PostCategory } from "@/modules/blog";
import {
  fetchProductCategories,
  fetchProductsWithDetails,
  type HomeProductCategory,
} from "@/modules/products";

const BLOG_PAGE_SIZE = 9;
const HOME_PRODUCTS_PER_CATEGORY = 20;
const HOME_CATEGORY_LIMIT = 3;

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
    // Try each category, then the unfiltered feed; use the first with posts.
    for (const category of [...blogCategories, null]) {
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

export async function loadInitialHomeProductCategories(
  locale: string
): Promise<HomeProductCategory[]> {
  try {
    const apiCategories = await fetchProductCategories(locale);
    const homeCategories = apiCategories.slice(0, HOME_CATEGORY_LIMIT);
    const results = await Promise.allSettled(
      homeCategories.map((category) =>
        fetchProductsWithDetails({
          category: category.slug,
          page: 1,
          perPage: HOME_PRODUCTS_PER_CATEGORY,
          locale,
        })
      )
    );

    return homeCategories.map((category, index) => {
      const result = results[index];

      if (result.status === "rejected") {
        console.error(
          `Error loading initial home products for category "${category.slug}":`,
          result.reason
        );
      }

      return {
        slug: category.slug,
        title: category.name,
        description: category.description,
        image: category.image,
        products: result.status === "fulfilled" ? result.value.products : [],
      };
    });
  } catch (error) {
    console.error("Error loading initial home categories:", error);
    return [];
  }
}
