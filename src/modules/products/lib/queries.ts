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
  originalValue?: number;
  originalFormatted?: string;
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

function resolvePriceCandidate(
  candidates: Array<ProductPriceField | undefined>
): ResolvedProductPrice {
  for (const candidate of candidates) {
    const parsed = parsePriceValue(candidate);
    if (parsed > 0) {
      return {
        value: parsed,
        formatted: getFormattedPriceValue(candidate),
      };
    }
  }

  return { value: 0 };
}

function resolveProductPriceResource(
  price?: ProductPriceDto | null
): ResolvedProductPrice {
  if (!price) return { value: 0 };

  const finalPrice = resolvePriceCandidate([
    price.final_price,
    price.attributes?.final_price,
  ]);
  const salePrice = resolvePriceCandidate([
    price.sale_price,
    price.attributes?.sale_price,
  ]);
  const basePrice = resolvePriceCandidate([
    price.price,
    price.attributes?.price,
  ]);
  const fallbackPrice = resolvePriceCandidate([
    price.amount,
    price.attributes?.amount,
    price.value,
    price.attributes?.value,
    price.minorAmount,
  ]);
  const currentPrice =
    finalPrice.value > 0
      ? finalPrice
      : salePrice.value > 0
        ? salePrice
        : basePrice.value > 0
          ? basePrice
          : fallbackPrice;
  const hasOriginalPrice =
    basePrice.value > 0 && basePrice.value > currentPrice.value;

  return {
    value: currentPrice.value,
    formatted: price.formatted ?? currentPrice.formatted,
    ...(hasOriginalPrice
      ? {
          originalValue: basePrice.value,
          originalFormatted: basePrice.formatted,
        }
      : {}),
  };
}

function resolveTopLevelProductPricing(product: ProductDto): ResolvedProductPrice {
  const finalPrice = resolvePriceCandidate([product.final_price]);
  const salePrice = resolvePriceCandidate([product.sale_price]);
  const basePrice = resolvePriceCandidate([product.price]);
  const currentPrice =
    finalPrice.value > 0
      ? finalPrice
      : salePrice.value > 0
        ? salePrice
        : basePrice;

  return {
    ...currentPrice,
    ...(basePrice.value > currentPrice.value
      ? {
          originalValue: basePrice.value,
          originalFormatted: basePrice.formatted,
        }
      : {}),
  };
}

function resolveProductPricing(product: ProductDto): ResolvedProductPrice {
  const topLevelPrice = resolveTopLevelProductPricing(product);
  const latestPriceResource = getFirstRelationship(
    product.latestProductPrice ?? product.latest_product_price
  );
  const latestPrice = resolveProductPriceResource(latestPriceResource);

  if (latestPrice.value > 0) {
    return {
      ...latestPrice,
      ...(!latestPrice.originalValue &&
      topLevelPrice.originalValue &&
      topLevelPrice.originalValue > latestPrice.value
        ? {
            originalValue: topLevelPrice.originalValue,
            originalFormatted: topLevelPrice.originalFormatted,
          }
        : {}),
    };
  }

  const firstPrice = getFirstRelationship(
    product.productPrices ?? product.product_prices
  );
  const firstPriceValue = resolveProductPriceResource(firstPrice);

  if (firstPriceValue.value > 0) {
    return {
      ...firstPriceValue,
      ...(!firstPriceValue.originalValue &&
      topLevelPrice.originalValue &&
      topLevelPrice.originalValue > firstPriceValue.value
        ? {
            originalValue: topLevelPrice.originalValue,
            originalFormatted: topLevelPrice.originalFormatted,
          }
        : {}),
    };
  }

  return topLevelPrice;
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
    name: category?.name ?? reference.label ?? undefined,
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
    originalPrice: pricing.originalValue,
    formattedOriginalPrice: pricing.originalFormatted,
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
    stockThreshold: product.stockThreshold ?? product.stock_threshold,
    availableSoon: product.availableSoon ?? product.available_soon,
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
  queryParams.append("include", "multimedia,latestProductPrice");

  if (sort === "random-position") {
    queryParams.append("random", "1");
  } else if (sort === "asc" || sort === "desc") {
    queryParams.append("sort[createdAt]", sort);
  }

  return queryParams;
}

async function fetchBrowserCatalogSearch(
  params: FetchProductsParams & { search: string }
): Promise<FetchProductsResult | null> {
  const {
    page = 1,
    perPage = 15,
    category,
    locale,
    search,
    sort,
  } = params;
  const fallbackParams = new URLSearchParams({
    query: search,
    locale: locale ?? "fa",
    page: String(page),
    perPage: String(perPage),
  });

  if (category) fallbackParams.set("category", category);
  if (sort) fallbackParams.set("sort", sort);

  const response = await fetch(`/api/catalog-search?${fallbackParams}`);
  if (!response.ok) return null;

  return (await response.json()) as FetchProductsResult;
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

  // Text queries in the browser need the localized catalog index. Starting
  // there avoids waiting for Vendra's token-oriented search to return an
  // empty response before the useful request can begin. Numeric product codes
  // continue to use Vendra directly.
  if (
    normalizedSearch &&
    !slug &&
    typeof window !== "undefined" &&
    !/^[0-9۰-۹٠-٩\s-]+$/.test(normalizedSearch)
  ) {
    const localizedResult = await fetchBrowserCatalogSearch({
      page,
      perPage,
      category,
      locale,
      search: normalizedSearch,
      sort,
    });

    if (localizedResult) return localizedResult;
  }

  if (normalizedSearch && !slug) {
    queryParams.append("search", normalizedSearch);
  }

  const result = await fetchProductCollection(
    path,
    queryParams,
    { page, perPage },
    locale
  );

  // Vendra's catalog search currently resolves product tokens reliably, but
  // some deployments do not index localized product names. Preserve the
  // canonical API search first, then fall back to a cached storefront-side
  // catalog match only when Vendra returns no result.
  if (normalizedSearch && !slug && result.pagination.total === 0) {
    if (typeof window !== "undefined") {
      return (
        (await fetchBrowserCatalogSearch({
          page,
          perPage,
          category,
          locale,
          search: normalizedSearch,
          sort,
        })) ?? result
      );
    }

    return searchCatalogProducts({
      page,
      perPage,
      category,
      locale,
      search: normalizedSearch,
      sort,
    });
  }

  return result;
}

const SEARCH_CATALOG_TTL_MS = 60_000;
const searchCatalogCache = new Map<
  string,
  { expiresAt: number; products: Product[] }
>();

function normalizeCatalogSearchValue(value: string, locale?: string): string {
  const persianDigits = "۰۱۲۳۴۵۶۷۸۹";
  const arabicDigits = "٠١٢٣٤٥٦٧٨٩";

  return value
    .normalize("NFKC")
    .toLocaleLowerCase(locale)
    .replace(/[يى]/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/[۰-۹]/g, (digit) => String(persianDigits.indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String(arabicDigits.indexOf(digit)))
    .replace(/[\u200c\u200d]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function productSearchScore(
  product: Product,
  normalizedQuery: string,
  locale?: string
): number {
  const name = normalizeCatalogSearchValue(product.name, locale);
  const token = normalizeCatalogSearchValue(product.token ?? "", locale);
  const slug = normalizeCatalogSearchValue(product.slug ?? "", locale);
  const category = normalizeCatalogSearchValue(product.category ?? "", locale);
  const terms = normalizedQuery.split(" ").filter(Boolean);
  const searchableValue = `${name} ${token} ${slug} ${category}`;

  if (!terms.every((term) => searchableValue.includes(term))) return -1;
  if (token === normalizedQuery) return 100;
  if (name === normalizedQuery) return 90;
  if (name.startsWith(normalizedQuery)) return 75;
  if (name.includes(normalizedQuery)) return 60;
  if (token.includes(normalizedQuery)) return 50;
  if (category.includes(normalizedQuery)) return 35;
  return 20;
}

async function loadCatalogForSearch({
  category,
  locale,
  sort,
}: Pick<FetchProductsParams, "category" | "locale" | "sort">): Promise<Product[]> {
  const cacheKey = `${locale ?? "fa"}|${category ?? "all"}|${sort ?? "default"}`;
  const cached = searchCatalogCache.get(cacheKey);

  if (cached && cached.expiresAt > Date.now()) {
    return cached.products;
  }

  const perPage = 100;
  const firstPage = await fetchProducts({
    page: 1,
    perPage,
    category,
    locale,
    sort,
  });
  const remainingPageNumbers = Array.from(
    { length: Math.max(0, firstPage.pagination.lastPage - 1) },
    (_, index) => index + 2
  );
  const remainingPages = await Promise.all(
    remainingPageNumbers.map((page) =>
      fetchProducts({ page, perPage, category, locale, sort })
    )
  );
  const products = [
    ...firstPage.products,
    ...remainingPages.flatMap((result) => result.products),
  ];

  searchCatalogCache.set(cacheKey, {
    expiresAt: Date.now() + SEARCH_CATALOG_TTL_MS,
    products,
  });

  return products;
}

export async function searchCatalogProducts(
  params: FetchProductsParams = {}
): Promise<FetchProductsResult> {
  const {
    page = 1,
    perPage = 15,
    category,
    locale,
    search = "",
    sort,
  } = params;
  const normalizedQuery = normalizeCatalogSearchValue(search, locale);

  if (!normalizedQuery) {
    return emptyProductsResult(page, perPage);
  }

  const catalog = await loadCatalogForSearch({ category, locale, sort });
  const matches = catalog
    .map((product) => ({
      product,
      score: productSearchScore(product, normalizedQuery, locale),
    }))
    .filter((match) => match.score >= 0)
    .sort((left, right) => {
      if (left.score !== right.score) return right.score - left.score;
      return (
        Date.parse(right.product.updatedAt ?? "") -
        Date.parse(left.product.updatedAt ?? "")
      );
    })
    .map((match) => match.product);
  const start = (page - 1) * perPage;
  const paginatedProducts = matches.slice(start, start + perPage);
  const total = matches.length;

  return {
    products: paginatedProducts,
    pagination: {
      currentPage: page,
      lastPage: Math.max(1, Math.ceil(total / perPage)),
      perPage,
      total,
      from: total === 0 ? 0 : start + 1,
      to: Math.min(start + perPage, total),
    },
    links: {},
  };
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
        query: {
          include: "multimedia,latestProductPrice",
        },
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
          include: "multimedia",
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
  locale: string,
  params: FetchProductsParams = {},
  options?: ApiQueryOptions<FetchProductsResult>
) {
  const localizedParams = { ...params, locale };

  return useQuery(
    createApiQueryOptions(productKeys.list(localizedParams), () =>
      fetchProductsWithDetails(localizedParams),
    options)
  );
}

export function useProduct(
  id: string | number,
  locale: string,
  options?: ApiQueryOptions<Product | null>
) {
  return useQuery(
    createApiQueryOptions(
      productKeys.detail(locale, id),
      () => fetchProduct(id, locale),
      {
        enabled: Boolean(id),
        ...options,
      }
    )
  );
}

export function useProductCategories(
  locale: string,
  options?: ApiQueryOptions<ProductCategory[]>
) {
  return useQuery(
    createApiQueryOptions(
      productKeys.categories(locale),
      () => fetchProductCategories(locale),
      {
        staleTime: 5 * 60 * 1000,
        ...options,
      }
    )
  );
}
