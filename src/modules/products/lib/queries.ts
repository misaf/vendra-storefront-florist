import { cache } from "react";
import { useQuery } from "@tanstack/react-query";
import { ApiClientError, apiClient } from "@/shared/api/client";
import { getLocalizedValue } from "@/shared/api/localized";
import { createApiQueryOptions, type ApiQueryOptions } from "@/shared/api/query-client";
import { PLACEHOLDER_IMAGE, buildMediaUrl } from "@/shared/lib/image";
import { getLeadingResourceId } from "@/shared/lib/slug-url";
import { stripHtml } from "@/shared/lib/rich-text";
import { parseNumericId } from "@/shared/lib/utils";
import type { JsonApiLinks, JsonApiMeta } from "@/shared/api/types";
import { productKeys } from "./keys";
import type {
  CollectionLinks,
  FetchProductsParams,
  FetchProductsResult,
  Pagination,
  Product,
  ProductCategory,
  ProductCategoryDto,
  ProductDto,
  ProductMedia,
  ProductPriceField,
  ProductPriceDto,
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


interface ResolvedProductPrice {
  value: number;
  formatted?: string;
}

function parsePriceValue(value: ProductPriceField | undefined): number {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (typeof value === "string") {
    const parsed = Number.parseFloat(value.replace(/,/g, ""));
    return Number.isFinite(parsed) ? parsed : 0;
  }

  if (value && typeof value === "object") {
    return parsePriceValue(value.amount);
  }

  return 0;
}

function getFormattedPriceValue(value: ProductPriceField | undefined): string | undefined {
  if (value && typeof value === "object" && typeof value.formatted === "string") {
    return value.formatted;
  }

  return undefined;
}

function resolveProductPriceResource(
  price?: ProductPriceDto | null
): ResolvedProductPrice {
  if (!price) return { value: 0 };

  const candidates = [
    price.final_price,
    price.attributes?.final_price,
    price.sale_price,
    price.attributes?.sale_price,
    price.price,
    price.attributes?.price,
    price.amount,
    price.attributes?.amount,
    price.value,
    price.attributes?.value,
  ];

  for (const candidate of candidates) {
    const parsed = parsePriceValue(candidate);
    if (parsed > 0) {
      return {
        value: parsed,
        formatted: price.formatted ?? getFormattedPriceValue(candidate),
      };
    }
  }

  return { value: 0 };
}

function resolveProductPricing(product: ProductDto): ResolvedProductPrice {
  const latestPriceResource = getFirstRelationship(
    product.latestProductPrice ?? product.latest_product_price
  );
  const latestPrice = resolveProductPriceResource(latestPriceResource);

  if (latestPrice.value > 0) {
    return latestPrice;
  }

  const firstPrice = getFirstRelationship(
    product.productPrices ?? product.product_prices
  );
  const firstPriceValue = resolveProductPriceResource(firstPrice);

  if (firstPriceValue.value > 0) {
    return firstPriceValue;
  }

  const candidates = [product.final_price, product.sale_price, product.price];

  for (const candidate of candidates) {
    const parsed = parsePriceValue(candidate);
    if (parsed > 0) return { value: parsed };
  }

  return { value: 0 };
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

function buildImageUrl(media?: ProductMedia | null): string | null {
  if (!media) return null;
  return buildMediaUrl({
    url: media.url,
    uuid: media.uuid,
    fileName: media.fileName ?? media.file_name,
    name: media.name,
    conversions: media.generatedConversions ?? media.generated_conversions,
  });
}

function getFirstRelatedImage(product: ProductDto): string {
  const media = getFirstRelationship(product.multimedia ?? product.media);
  return buildImageUrl(media) ?? "";
}

function getRelatedImages(product: ProductDto): string[] {
  const media = product.multimedia ?? product.media;
  const list = Array.isArray(media) ? media : media ? [media] : [];
  const urls: string[] = [];
  const seen = new Set<string>();
  for (const item of list) {
    const url = buildImageUrl(item);
    if (url && !seen.has(url)) {
      seen.add(url);
      urls.push(url);
    }
  }
  return urls;
}

function getFirstRelatedCategoryImage(category: ProductCategoryDto): string {
  const media = getFirstRelationship(category.multimedia ?? category.media);
  return buildImageUrl(media) ?? "";
}

/**
 * The API embeds a product's category as a reference (id, type, label) rather
 * than a full resource, so the slug has to come from the category collection.
 */
function getProductCategoryInfo(
  product: ProductDto,
  categories?: ProductCategoryLookup
): {
  slug?: string;
  name?: string;
} {
  const reference = getFirstRelationship(
    product.productCategory ??
      product.productCategories ??
      product.product_category ??
      product.category ??
      product.categories
  );

  if (!reference) {
    return {};
  }

  const category = categories?.get(parseNumericId(reference.id));

  return {
    slug: category?.slug,
    name: reference.label ?? category?.name ?? undefined,
  };
}

export function transformProduct(
  product: ProductDto,
  locale?: string,
  categories?: ProductCategoryLookup
): Product {
  const categoryInfo = getProductCategoryInfo(product, categories);
  const pricing = resolveProductPricing(product);
  const description = getLocalizedValue(product.description, locale);

  return {
    id: parseNumericId(product.id),
    name: getLocalizedValue(product.name, locale) ?? "",
    price: pricing.value,
    formattedPrice: pricing.formatted,
    image: getFirstRelatedImage(product),
    images: getRelatedImages(product),
    description: stripHtml(description, 150),
    richDescription: description,
    category: categoryInfo.name || categoryInfo.slug,
    categorySlug: categoryInfo.slug,
    slug: getLocalizedValue(product.slug, locale),
    token: product.token,
    inStock: product.inStock ?? product.in_stock,
    quantity: product.quantity,
    createdAt: product.createdAt ?? product.created_at,
    updatedAt: product.updatedAt ?? product.updated_at,
  };
}

function transformProducts(
  products: ProductDto[],
  locale?: string,
  categories?: ProductCategoryLookup
): Product[] {
  return products.map((product) => transformProduct(product, locale, categories));
}

function transformCategory(
  category: ProductCategoryDto,
  locale?: string
): ProductCategory {
  const description = getLocalizedValue(category.description, locale);

  return {
    id: parseNumericId(category.id),
    name: getLocalizedValue(category.name, locale) ?? "",
    slug: getLocalizedValue(category.slug, locale) ?? "",
    description: stripHtml(description, 500) || null,
    richDescription: description,
    position: category.position,
    status: category.active,
    updated_at: category.updatedAt ?? category.updated_at,
    image: getFirstRelatedCategoryImage(category),
  };
}

function transformCategories(
  categories: ProductCategoryDto[],
  locale?: string
): ProductCategory[] {
  return categories
    .map((category) => transformCategory(category, locale))
    .sort((a, b) => a.position - b.position);
}

function withPlaceholderImage<T extends { image?: string }>(items: T[]): T[] {
  return items.map((item) => ({
    ...item,
    image: item.image || PLACEHOLDER_IMAGE,
  }));
}

function emptyProductsResult(page: number, perPage: number): FetchProductsResult {
  return {
    products: [],
    pagination: getPagination(undefined, { page, perPage }),
    links: extractCollectionLinks(undefined),
  };
}

async function resolveProductCategoryId(
  slug: string,
  locale?: string
): Promise<string | null> {
  const categories = await fetchProductCategories(locale);
  const category = categories.find((item) => item.slug === slug);

  return category ? String(category.id) : null;
}

type ProductCategoryLookup = Map<number, ProductCategory>;

/**
 * Category slugs are only available on the category collection, so it is loaded
 * alongside every product fetch. A failure here only costs the category label on
 * a card, so it must not fail the product list itself.
 */
async function loadProductCategoryLookup(
  locale?: string
): Promise<ProductCategoryLookup> {
  try {
    const categories = await fetchProductCategories(locale);
    return new Map(categories.map((category) => [category.id, category]));
  } catch {
    return new Map();
  }
}

async function fetchProductCollection(
  path: string,
  queryParams: URLSearchParams,
  fallback: { page: number; perPage: number },
  locale?: string
): Promise<FetchProductsResult> {
  const [response, categories] = await Promise.all([
    apiClient.get<ProductDto[]>(path, {
      query: queryParams,
      locale,
      next:
        queryParams.get("random") === "1"
          ? { revalidate: 0 }
          : { revalidate: 10 },
      mode: "cors",
      credentials: "omit",
    }),
    loadProductCategoryLookup(locale),
  ]);

  return {
    products: transformProducts(response.data, locale, categories),
    pagination: getPagination(response.meta, fallback),
    links: extractCollectionLinks(response.links),
  };
}

/**
 * `sort` carries the recency direction ("asc" | "desc") resolved by
 * getProductsApiSort, or "random-position" for the shuffled home listing. Price
 * ordering has no server-side parameter and is sorted client-side instead.
 */
function createProductQueryParams(
  page: number,
  perPage: number,
  sort: string | undefined
): URLSearchParams {
  const queryParams = createPageQueryParams(page, perPage);

  if (sort === "random-position") {
    queryParams.append("random", "1");
  } else if (sort === "asc" || sort === "desc") {
    queryParams.append("sort[createdAt]", sort);
  }

  return queryParams;
}

export async function fetchProducts(
  params: FetchProductsParams = {}
): Promise<FetchProductsResult> {
  const { page = 1, perPage = 15, category, locale, search, slug, sort } = params;
  const queryParams = createProductQueryParams(page, perPage, sort);
  const normalizedSearch = search?.trim();
  const path = "catalog/products";

  appendOptionalQueryParam(queryParams, "slug", slug);

  if (category) {
    const categoryId = await resolveProductCategoryId(category, locale);

    if (!categoryId) {
      return emptyProductsResult(page, perPage);
    }

    queryParams.append("categoryId", categoryId);
  }

  if (normalizedSearch && !slug) {
    queryParams.append("search", normalizedSearch);
  }

  return fetchProductCollection(path, queryParams, { page, perPage }, locale);
}

export async function fetchProductsWithDetails(
  params: FetchProductsParams = {}
): Promise<FetchProductsResult> {
  const result = await fetchProducts(params);

  return {
    ...result,
    products: withPlaceholderImage(result.products),
  };
}

export async function fetchProduct(
  id: string | number,
  locale?: string
): Promise<Product | null> {
  try {
    const [response, categories] = await Promise.all([
      apiClient.get<ProductDto | ProductDto[]>(`catalog/products/${id}`, {
        locale,
        next: { revalidate: 10 },
        mode: "cors",
        credentials: "omit",
      }),
      loadProductCategoryLookup(locale),
    ]);
    const product = getFirstResource(response.data);
    return product ? transformProduct(product, locale, categories) : null;
  } catch (error) {
    if (error instanceof ApiClientError && error.status === 404) return null;
    throw error;
  }
}

export async function fetchProductBySlug(
  slug: string,
  locale?: string
): Promise<Product | null> {
  const normalizedSlug = decodeURIComponent(slug).trim();
  const resourceId = getLeadingResourceId(normalizedSlug);

  if (!normalizedSlug) {
    return null;
  }

  if (resourceId) {
    return fetchProduct(resourceId, locale);
  }

  const perPage = 100;
  let page = 1;
  let lastPage = 1;

  do {
    const result = await fetchProductsWithDetails({
      page,
      perPage,
      locale,
    });
    const product = result.products.find(
      (candidate) => candidate.slug === normalizedSlug
    );

    if (product) {
      return (await fetchProduct(product.id, locale)) ?? product;
    }

    lastPage = result.pagination.lastPage;
    page += 1;
  } while (page <= lastPage);

  return null;
}

// Cached per request: the home page resolves the category list several times in
// one render (loadInitialHomeProductCategories plus each resolveProductCategoryId),
// so without cache() the fetch + transform would run repeatedly. Mirrors the blog
// side's fetchPostCategories.
export const fetchProductCategories = cache(
  async (locale?: string): Promise<ProductCategory[]> => {
    const response = await apiClient.get<ProductCategoryDto[]>(
      "catalog/product-categories",
      {
        query: {
          itemsPerPage: "100",
        },
        locale,
        next: { revalidate: 10 },
        mode: "cors",
        credentials: "omit",
      }
    );

    return transformCategories(response.data, locale);
  }
);

export function useProducts(
  params: FetchProductsParams = {},
  options?: ApiQueryOptions<FetchProductsResult>
) {
  return useQuery(
    createApiQueryOptions(productKeys.list(params), () =>
      fetchProductsWithDetails(params),
    options)
  );
}

export function useProduct(
  id: string | number,
  options?: ApiQueryOptions<Product | null>
) {
  return useQuery(
    createApiQueryOptions(productKeys.detail(id), () => fetchProduct(id), {
      enabled: Boolean(id),
      ...options,
    })
  );
}

export function useProductCategories(
  options?: ApiQueryOptions<ProductCategory[]>
) {
  return useQuery(
    createApiQueryOptions(
      productKeys.categories(),
      () => fetchProductCategories(),
      {
        staleTime: 5 * 60 * 1000,
        ...options,
      }
    )
  );
}
