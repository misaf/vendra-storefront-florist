import { cache } from "react";
import { useQuery } from "@tanstack/react-query";
import { ApiClientError, apiClient } from "@/shared/api/client";
import { getLocalizedValue } from "@/shared/api/localized";
import { createApiQueryOptions, type ApiQueryOptions } from "@/shared/api/query-client";
import {
  MEDIA_SIZE_CARD,
  PLACEHOLDER_IMAGE,
  buildMediaUrl,
  type MediaSize,
} from "@/shared/lib/image";
import { getLeadingResourceId } from "@/shared/lib/slug-url";
import { stringifyRichText, stripHtml } from "@/shared/lib/rich-text";
import { parseNumericId } from "@/shared/lib/utils";
import type { JsonApiLinks, JsonApiMeta } from "@/shared/api/types";
import { postKeys } from "./keys";
import type {
  CollectionLinks,
  FetchPostsParams,
  FetchPostsResult,
  Pagination,
  Post,
  PostCategory,
  PostCategoryDto,
  PostDto,
  PostMedia,
} from "../types";

function appendOptionalQueryParam(
  queryParams: URLSearchParams,
  key: string,
  value: string | undefined
) {
  if (value) {
    queryParams.append(key, value);
  }
}

function createPageQueryParams(page: number, perPage: number): URLSearchParams {
  return new URLSearchParams({
    page: page.toString(),
    itemsPerPage: perPage.toString(),
  });
}

function extractCollectionLinks(links: JsonApiLinks | undefined): CollectionLinks {
  return {
    first: links?.first,
    last: links?.last,
    next: links?.next,
    prev: links?.prev,
  };
}

function getFirstResource<T>(data: T | T[]): T | null {
  return Array.isArray(data) ? data[0] ?? null : data ?? null;
}

function getFirstRelationship<T>(data: T | T[] | undefined): T | undefined {
  return Array.isArray(data) ? data[0] : data;
}

function getPagination(
  meta: JsonApiMeta | undefined,
  fallback: { page: number; perPage: number }
): Pagination {
  const currentPage = meta?.currentPage ?? meta?.page?.currentPage ?? fallback.page;
  const perPage = meta?.itemsPerPage ?? meta?.page?.perPage ?? fallback.perPage;
  const total = meta?.totalItems ?? meta?.page?.total ?? 0;

  return {
    currentPage,
    lastPage: meta?.page?.lastPage ?? Math.max(1, Math.ceil(total / perPage)),
    perPage,
    total,
    from: meta?.page?.from ?? (total === 0 ? 0 : (currentPage - 1) * perPage + 1),
    to: meta?.page?.to ?? Math.min(currentPage * perPage, total),
  };
}

function buildImageUrl(
  media?: PostMedia | null,
  size?: MediaSize
): string | null {
  if (!media) return null;
  return buildMediaUrl(
    {
      url: media.url,
      uuid: media.uuid,
      fileName: media.fileName ?? media.file_name,
      name: media.name,
      conversions: media.generatedConversions ?? media.generated_conversions,
    },
    size
  );
}

function getFirstRelatedImage(post: PostDto, size?: MediaSize): string {
  const media = getFirstRelationship(post.multimedia ?? post.media);
  return buildImageUrl(media, size) ?? "";
}

export function transformPost(
  post: PostDto,
  locale?: string,
  categories?: PostCategoryLookup
): Post {
  const content = getLocalizedValue(post.description, locale);
  const excerpt = stripHtml(content, 200);
  // The API embeds the category as a reference (id, type, label), so the slug
  // has to be resolved from the category collection.
  const reference = getFirstRelationship(post.blogPostCategory);
  const category = reference
    ? categories?.get(parseNumericId(reference.id))
    : undefined;

  return {
    id: parseNumericId(post.id),
    title: getLocalizedValue(post.name, locale) ?? "",
    content: stringifyRichText(content),
    richContent: content,
    excerpt,
    slug: getLocalizedValue(post.slug, locale) ?? "",
    image: getFirstRelatedImage(post),
    // The index and related grids draw at a fraction of the lead image's size.
    thumbnail: getFirstRelatedImage(post, MEDIA_SIZE_CARD),
    // Blog posts carry no separate publication date; creation is the closest
    // equivalent the API exposes.
    publishedAt: post.createdAt,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
    category: category?.name ?? reference?.label ?? undefined,
    categorySlug: category?.slug || undefined,
    status: post.active,
  };
}

function transformPosts(
  posts: PostDto[],
  locale?: string,
  categories?: PostCategoryLookup
): Post[] {
  return posts.map((post) => transformPost(post, locale, categories));
}

function transformPostCategory(
  category: PostCategoryDto,
  locale?: string
): PostCategory {
  return {
    id: parseNumericId(category.id),
    name: getLocalizedValue(category.name, locale) ?? "",
    slug: getLocalizedValue(category.slug, locale) ?? "",
    description: getLocalizedValue(category.description, locale),
    status: category.active,
    createdAt: category.createdAt,
    updatedAt: category.updatedAt,
  };
}

function getCategoryTimestamp(category: PostCategory): number {
  const timestamp = Date.parse(category.updatedAt || category.createdAt || "");
  return Number.isFinite(timestamp) ? timestamp : 0;
}

function transformPostCategories(
  categories: PostCategoryDto[],
  locale?: string
): PostCategory[] {
  return categories
    .map((category) => transformPostCategory(category, locale))
    .sort((a, b) => {
      const timestampDiff = getCategoryTimestamp(b) - getCategoryTimestamp(a);
      return timestampDiff || b.id - a.id;
    });
}

function withPlaceholderImage<T extends { image?: string }>(items: T[]): T[] {
  return items.map((item) => ({
    ...item,
    image: item.image || PLACEHOLDER_IMAGE,
  }));
}

function emptyPostsResult(page: number, perPage: number): FetchPostsResult {
  return {
    posts: [],
    pagination: getPagination(undefined, { page, perPage }),
    links: extractCollectionLinks(undefined),
  };
}

async function resolvePostCategoryId(
  slug: string,
  locale?: string
): Promise<string | null> {
  const categories = await fetchPostCategories(locale);
  const category = categories.find((item) => item.slug === slug);

  return category ? String(category.id) : null;
}

type PostCategoryLookup = Map<number, PostCategory>;

/**
 * Category slugs live on the category collection, so it is loaded alongside
 * every post fetch. A failure only costs the category label on a card, so it
 * must not fail the post list itself.
 */
async function loadPostCategoryLookup(
  locale?: string
): Promise<PostCategoryLookup> {
  try {
    const categories = await fetchPostCategories(locale);
    return new Map(categories.map((category) => [category.id, category]));
  } catch {
    return new Map();
  }
}

async function fetchPostCollection(
  path: string,
  queryParams: URLSearchParams,
  fallback: { page: number; perPage: number },
  locale?: string
): Promise<FetchPostsResult> {
  const [response, categories] = await Promise.all([
    apiClient.get<PostDto[]>(path, {
      query: queryParams,
      locale,
      next: { revalidate: 10 },
      mode: "cors",
      credentials: "omit",
    }),
    loadPostCategoryLookup(locale),
  ]);

  return {
    posts: transformPosts(response.data, locale, categories),
    pagination: getPagination(response.meta, fallback),
    links: extractCollectionLinks(response.links),
  };
}

function createPostQueryParams(page: number, perPage: number): URLSearchParams {
  const queryParams = createPageQueryParams(page, perPage);
  queryParams.append("include", "multimedia");
  // Drafts are a console state, not a storefront one. The filter takes 1/0 —
  // `true` is rejected as a validation error. Categories are filtered the same
  // way below, client-side, because that collection has no such parameter.
  queryParams.append("active", "1");
  return queryParams;
}

export async function fetchPosts(
  params: FetchPostsParams = {}
): Promise<FetchPostsResult> {
  const { page = 1, perPage = 15, category, locale, search, slug } = params;
  const queryParams = createPostQueryParams(page, perPage);
  const normalizedSearch = search?.trim();
  const path = "content/blog-posts";

  appendOptionalQueryParam(queryParams, "slug", slug);

  if (category) {
    const categoryId = await resolvePostCategoryId(category, locale);

    if (!categoryId) {
      return emptyPostsResult(page, perPage);
    }

    queryParams.append("categoryId", categoryId);
  }

  if (normalizedSearch && !slug) {
    queryParams.append("search", normalizedSearch);
  }

  return fetchPostCollection(path, queryParams, { page, perPage }, locale);
}

async function fetchPostById(
  id: string | number,
  locale?: string
): Promise<Post | null> {
  try {
    const [response, categories] = await Promise.all([
      apiClient.get<PostDto | PostDto[]>(`content/blog-posts/${id}`, {
        query: {
          include: "multimedia",
        },
        locale,
        next: { revalidate: 10 },
        mode: "cors",
        credentials: "omit",
      }),
      loadPostCategoryLookup(locale),
    ]);
    const post = getFirstResource(response.data);

    if (!post) {
      return null;
    }

    const transformed = transformPost(post, locale, categories);

    // Fetching by id bypasses the collection's `active` filter, so an
    // unpublished post would still render at a guessed URL. Absent means
    // "the API didn't say", which is not the same as "draft".
    return transformed.status === false ? null : transformed;
  } catch (error) {
    if (error instanceof ApiClientError && error.status === 404) return null;
    throw error;
  }
}

export async function fetchPost(
  slug: string,
  locale?: string
): Promise<Post | null> {
  const normalizedSlug = decodeURIComponent(slug).trim();
  const resourceId = getLeadingResourceId(normalizedSlug);

  if (!normalizedSlug) {
    return null;
  }

  if (resourceId) {
    return fetchPostById(resourceId, locale);
  }

  // Every link the storefront writes puts the id ahead of the slug, so this
  // walk only serves bare-slug URLs arriving from outside. The collection's own
  // `slug` filter looks like the obvious shortcut and is not: it only matches
  // when Accept-Language is a bare code, and this client sends a q-list, so it
  // answers 0 for every slug. Scanning the collection is what actually works.
  const perPage = 100;
  // A ceiling on an API-supplied page count, so a mistyped URL can never turn
  // into an unbounded request loop against a large archive.
  const maxPages = 20;
  let page = 1;
  let lastPage = 1;

  do {
    const result = await fetchPostsWithDetails({
      page,
      perPage,
      locale,
    });
    const post = result.posts.find(
      (candidate) => candidate.slug === normalizedSlug
    );

    if (post) {
      return (await fetchPostById(post.id, locale)) ?? post;
    }

    lastPage = Math.min(result.pagination.lastPage, maxPages);
    page += 1;
  } while (page <= lastPage);

  return null;
}

export async function fetchPostsWithDetails(
  params: FetchPostsParams = {}
): Promise<FetchPostsResult> {
  const result = await fetchPosts(params);
  return {
    ...result,
    posts: withPlaceholderImage(result.posts),
  };
}

// Cached per request: fetchPosts() resolves category names through this and
// the blog page also fetches the category list, so without cache() the fetch +
// transform would run twice for a single render.
export const fetchPostCategories = cache(
  async (locale?: string): Promise<PostCategory[]> => {
    const response = await apiClient.get<PostCategoryDto[]>(
      "content/blog-post-categories",
      {
        query: {
          itemsPerPage: "50",
        },
        locale,
        next: { revalidate: 10 },
        mode: "cors",
        credentials: "omit",
      }
    );

    return transformPostCategories(response.data, locale).filter(
      (category) => category.status !== false
    );
  }
);

export const fetchBlogPostCategories = fetchPostCategories;

export const fetchBlogPosts = fetchPosts;
export const fetchBlogPost = fetchPost;
export const fetchBlogPostsWithDetails = fetchPostsWithDetails;

export function usePosts(
  locale: string,
  params: FetchPostsParams = {},
  options?: ApiQueryOptions<FetchPostsResult>
) {
  const localizedParams = { ...params, locale };

  return useQuery(
    createApiQueryOptions(postKeys.list(localizedParams), () =>
      fetchPostsWithDetails(localizedParams),
    options)
  );
}

export function usePost(
  slug: string,
  locale: string,
  options?: ApiQueryOptions<Post | null>
) {
  return useQuery(
    createApiQueryOptions(
      postKeys.detail(locale, slug),
      () => fetchPost(slug, locale),
      {
        enabled: Boolean(slug),
        ...options,
      }
    )
  );
}
