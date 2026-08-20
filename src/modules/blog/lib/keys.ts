import type { FetchPostsParams } from "../types";

export function buildBlogQueryKey(
  locale: string,
  category: string,
  searchQuery: string
): string {
  return `${locale}|${category}|${searchQuery}`;
}

export const postKeys = {
  all: ["posts"] as const,
  lists: () => [...postKeys.all, "list"] as const,
  list: (params: FetchPostsParams = {}) => [...postKeys.lists(), params] as const,
  details: () => [...postKeys.all, "detail"] as const,
  detail: (locale: string, idOrSlug: string | number) =>
    [...postKeys.details(), locale, String(idOrSlug)] as const,
};
