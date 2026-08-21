import { cache } from "react";
import { fetchBlogPost, fetchBlogPostCategories, fetchBlogPostsWithDetails } from "./queries";
import { buildBlogQueryKey } from "./keys";
import type { FetchBlogPostsResult, Post as BlogPost, PostCategory } from "../types";

/** Deduplicate the post fetch across generateMetadata + the page render. */
export const getPost = cache((slug: string, locale: string) =>
  fetchBlogPost(slug, locale)
);

const RELATED_POST_COUNT = 3;

async function loadPostsExcluding(
  currentPostId: number,
  locale: string,
  category?: string
): Promise<BlogPost[]> {
  try {
    const result = await fetchBlogPostsWithDetails({
      page: 1,
      // One spare, so excluding the current post still fills the row.
      perPage: RELATED_POST_COUNT + 1,
      locale,
      category,
    });
    return result.posts.filter((entry) => entry.id !== currentPostId);
  } catch {
    return [];
  }
}

/**
 * The entries that close the article — fetched without blocking the render and
 * streamed in via <Suspense>. Errors degrade to an empty list.
 *
 * Posts from the same category come first: "three more on this subject" is a
 * reason to keep reading, where "three most recent posts" is only a shelf. The
 * latest entries top the row up when a category is thin or absent, so the
 * section never appears half-filled.
 */
export async function loadRelatedPosts(
  post: Pick<BlogPost, "id" | "categorySlug">,
  locale: string
): Promise<BlogPost[]> {
  const sameCategory = post.categorySlug
    ? await loadPostsExcluding(post.id, locale, post.categorySlug)
    : [];

  if (sameCategory.length >= RELATED_POST_COUNT) {
    return sameCategory.slice(0, RELATED_POST_COUNT);
  }

  const latest = await loadPostsExcluding(post.id, locale);
  const seen = new Set(sameCategory.map((entry) => entry.id));

  return [
    ...sameCategory,
    ...latest.filter((entry) => !seen.has(entry.id)),
  ].slice(0, RELATED_POST_COUNT);
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
  const initialQueryKey = buildBlogQueryKey(
    locale,
    selectedCategory,
    searchQuery
  );

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
