import "server-only";

import { cache } from "react";
import { serverApiClient } from "@/shared/api/server-client";
import {
  fetchPost as fetchPostCore,
  fetchPostCategories as fetchPostCategoriesCore,
  fetchPosts as fetchPostsCore,
  fetchPostsWithDetails as fetchPostsWithDetailsCore,
} from "./queries";
import type { FetchPostsParams } from "../types";

export const fetchPosts = (params: FetchPostsParams = {}) =>
  fetchPostsCore(params, serverApiClient);

export const fetchPostsWithDetails = (params: FetchPostsParams = {}) =>
  fetchPostsWithDetailsCore(params, serverApiClient);

export const fetchPost = (slug: string, locale?: string) =>
  fetchPostCore(slug, locale, serverApiClient);

export const fetchPostCategories = cache((locale?: string) =>
  fetchPostCategoriesCore(locale, serverApiClient)
);

export const fetchBlogPosts = fetchPosts;
export const fetchBlogPostsWithDetails = fetchPostsWithDetails;
export const fetchBlogPost = fetchPost;
export const fetchBlogPostCategories = fetchPostCategories;
