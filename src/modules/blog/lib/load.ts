import { cache } from "react";
import { fetchBlogPost, fetchBlogPostCategories, fetchBlogPostsWithDetails } from "./queries";
import { buildBlogQueryKey } from "./keys";
import type { FetchBlogPostsResult, Post as BlogPost, PostCategory } from "../types";

/** Deduplicate the post fetch across generateMetadata + the page render. */
export const getPost = cache((slug: string, locale: string) =>
  fetchBlogPost(slug, locale)
);

/**
 * The latest entries close the article — fetched without blocking the render
 * and streamed in via <Suspense>. Errors degrade to an empty list.
 */
export async function loadRelatedPosts(
  currentPostId: number,
  locale: string
): Promise<BlogPost[]> {
  try {
    const result = await fetchBlogPostsWithDetails({
      page: 1,
      perPage: 4,
      locale,
    });
    return result.posts
      .filter((entry) => entry.id !== currentPostId)
      .slice(0, 3);
  } catch {
    return [];
  }
}

export function normalizeCategory(value: string | undefined): string {
  const category = value?.trim();
  return category || "all";
}

export interface LoadPostsPageResult {
  initialPosts: BlogPost[];
  initialPagination: FetchBlogPostsResult["pagination"] | null;
  initialError: string | null;
  initialQueryKey: string;
  categories: PostCategory[];
}

export async function loadPostsPage({
  locale,
  category,
  search,
}: {
  locale: string;
  category: string;
  search: string;
}): Promise<LoadPostsPageResult> {
  const selectedCategory = normalizeCategory(category);
  const searchQuery = search.trim();
  const initialQueryKey = buildBlogQueryKey(selectedCategory, searchQuery);

  let initialPosts: BlogPost[] = [];
  let initialPagination: FetchBlogPostsResult["pagination"] | null = null;
  let initialError: string | null = null;
  let categories: PostCategory[] = [];

  const [postsResult, categoriesResult] = await Promise.allSettled([
    fetchBlogPostsWithDetails({
      page: 1,
      perPage: 12,
      category: selectedCategory !== "all" ? selectedCategory : undefined,
      locale,
      search: searchQuery || undefined,
    }),
    fetchBlogPostCategories(locale),
  ]);

  if (postsResult.status === "fulfilled") {
    initialPosts = postsResult.value.posts;
    initialPagination = postsResult.value.pagination;
  } else {
    initialError =
      postsResult.reason instanceof Error
        ? postsResult.reason.message
        : "Failed to load blog posts";
  }

  if (categoriesResult.status === "fulfilled") {
    categories = categoriesResult.value;
  }

  return {
    initialPosts,
    initialPagination,
    initialError,
    initialQueryKey,
    categories,
  };
}
