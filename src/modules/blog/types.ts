import type {
  JsonApiLinks,
  JsonApiPageMeta,
  ResourceReference,
} from "@/shared/api/types";
import type { LocalizedValue } from "@/shared/api/localized";

export interface PostResource {
  id: string | number;
  type?: string;
  relationshipNames?: string[];
}

export interface PostMedia extends PostResource {
  url?: string;
  uuid?: string;
  generatedConversions?: Record<string, unknown>;
  fileName?: string;
  generated_conversions?: Record<string, unknown>;
  file_name?: string;
  name?: string;
}

export type PostCategorySummary = ResourceReference;

export interface PostCategoryDto extends PostResource {
  name: LocalizedValue<string>;
  slug: LocalizedValue<string>;
  description?: LocalizedValue<string>;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PostDto extends PostResource {
  name: LocalizedValue<string>;
  description?: LocalizedValue<unknown>;
  slug: LocalizedValue<string>;
  active?: boolean;
  createdAt: string;
  updatedAt: string;
  multimedia?: PostMedia | PostMedia[];
  media?: PostMedia | PostMedia[];
  blogPostCategory?: PostCategorySummary | PostCategorySummary[];
}

export type Pagination = Pick<
  JsonApiPageMeta,
  "currentPage" | "lastPage" | "perPage" | "total" | "from" | "to"
>;

export type CollectionLinks = Pick<
  JsonApiLinks,
  "first" | "last" | "next" | "prev"
>;

export interface Post {
  id: number;
  title: string;
  content: string;
  /** Raw TipTap rich-text document (or HTML/markdown string) for rendering. */
  richContent?: unknown;
  excerpt: string;
  slug: string;
  image?: string;
  /** The card-sized rendition of `image`, for the index and related grids. */
  thumbnail?: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  category?: string;
  /** `false` marks a draft the console has not published. */
  status?: boolean;
  /** Set only when the category resolved from the category collection — the
   *  embedded reference carries a label but no slug, and the journal index
   *  filters on the slug. */
  categorySlug?: string;
}

export interface PostCategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
  status?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface FetchPostsParams {
  page?: number;
  perPage?: number;
  category?: string;
  locale?: string;
  search?: string;
  slug?: string;
}

export interface FetchPostsResult {
  posts: Post[];
  pagination: Pagination;
  links: CollectionLinks;
}

export interface PostPayload {
  name?: string;
  description?: unknown;
  slug?: string;
  status?: boolean;
}

export type CreatePostPayload = PostPayload;

export interface UpdatePostVariables {
  id: string | number;
  data: PostPayload;
}

export type FetchBlogPostsParams = FetchPostsParams;
export type FetchBlogPostsResult = FetchPostsResult;
