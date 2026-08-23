import "server-only";

import { cache } from "react";
import { serverApiClient } from "@/shared/api/server-client";
import {
  fetchProduct as fetchProductCore,
  fetchProductBySlug as fetchProductBySlugCore,
  fetchProductCategories as fetchProductCategoriesCore,
  fetchProducts as fetchProductsCore,
  fetchProductsWithDetails as fetchProductsWithDetailsCore,
  searchCatalogProducts as searchCatalogProductsCore,
} from "./queries";
import type { FetchProductsParams } from "../types";

export const fetchProducts = (params: FetchProductsParams = {}) =>
  fetchProductsCore(params, serverApiClient);

export const fetchProductsWithDetails = (params: FetchProductsParams = {}) =>
  fetchProductsWithDetailsCore(params, serverApiClient);

export const searchCatalogProducts = (params: FetchProductsParams = {}) =>
  searchCatalogProductsCore(params, serverApiClient);

export const fetchProduct = (
  id: string | number,
  locale?: string
) => fetchProductCore(id, locale, serverApiClient);

export const fetchProductBySlug = (slug: string, locale?: string) =>
  fetchProductBySlugCore(slug, locale, serverApiClient);

/** Deduplicate category reads shared by page composition and list transforms. */
export const fetchProductCategories = cache((locale?: string) =>
  fetchProductCategoriesCore(locale, serverApiClient)
);
