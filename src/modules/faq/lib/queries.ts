import { cache } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/shared/api/client";
import { getLocalizedValue } from "@/shared/api/localized";
import {
  createApiQueryOptions,
  type ApiQueryOptions,
} from "@/shared/api/query-client";
import { stringifyRichText } from "@/shared/lib/rich-text";
import { parseNumericId } from "@/shared/lib/utils";
import { faqKeys } from "./keys";
import type {
  Faq,
  FaqCategory,
  FaqCategoryDto,
  FaqCategorySummary,
  FaqDto,
  FetchFaqsParams,
} from "../types";

function getFirstRelationship<T>(data: T | T[] | undefined): T | undefined {
  return Array.isArray(data) ? data[0] : data;
}

function toPlainText(value: unknown): string {
  return stringifyRichText(value).replace(/<[^>]*>/g, "").trim();
}

function transformFaq(
  faq: FaqDto,
  locale?: string,
  categories?: FaqCategoryLookup
): Faq {
  // The API embeds the category as a reference (id, type, label), so the slug
  // has to be resolved from the category collection.
  const reference = getFirstRelationship<FaqCategorySummary>(faq.faqCategory);
  const category = reference
    ? categories?.get(parseNumericId(reference.id))
    : undefined;

  return {
    id: parseNumericId(faq.id),
    question: getLocalizedValue(faq.name, locale) ?? "",
    answer: toPlainText(getLocalizedValue(faq.description, locale)),
    position: parseNumericId(faq.position ?? 0),
    category: reference?.label ?? category?.name,
    categorySlug: category?.slug,
  };
}

function transformFaqCategory(
  category: FaqCategoryDto,
  locale?: string
): FaqCategory {
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

async function resolveFaqCategoryId(
  slug: string,
  locale?: string
): Promise<string | null> {
  const categories = await fetchFaqCategories(locale);
  const category = categories.find((item) => item.slug === slug);

  return category ? String(category.id) : null;
}

type FaqCategoryLookup = Map<number, FaqCategory>;

/**
 * Category slugs live on the category collection, so it is loaded alongside the
 * FAQ list. A failure only costs the category label, so it must not fail the
 * list itself.
 */
async function loadFaqCategoryLookup(
  locale?: string
): Promise<FaqCategoryLookup> {
  try {
    const categories = await fetchFaqCategories(locale);
    return new Map(categories.map((category) => [category.id, category]));
  } catch {
    return new Map();
  }
}

async function fetchFaqCollection(
  path: string,
  queryParams: URLSearchParams,
  locale?: string
): Promise<Faq[]> {
  const [response, categories] = await Promise.all([
    apiClient.get<FaqDto[]>(path, {
      query: queryParams,
      locale,
      next: { revalidate: 10 },
      mode: "cors",
      credentials: "omit",
    }),
    loadFaqCategoryLookup(locale),
  ]);

  return response.data
    .map((faq) => transformFaq(faq, locale, categories))
    .filter((faq) => faq.question);
}

function sortFaqs(faqs: Faq[]): Faq[] {
  return faqs.sort((a, b) => a.position - b.position || a.id - b.id);
}

function createFaqQueryParams(page: number, perPage: number): URLSearchParams {
  const queryParams = new URLSearchParams({
    page: page.toString(),
    itemsPerPage: perPage.toString(),
  });

  queryParams.append("sort[position]", "asc");
  return queryParams;
}

export async function fetchFaqs(params: FetchFaqsParams = {}): Promise<Faq[]> {
  const { page = 1, perPage = 20, locale, search, category } = params;
  const queryParams = createFaqQueryParams(page, perPage);
  const normalizedSearch = search?.trim();

  const path = "content/faqs";

  if (category) {
    const categoryId = await resolveFaqCategoryId(category, locale);

    if (!categoryId) {
      return [];
    }

    queryParams.append("categoryId", categoryId);
  }

  if (normalizedSearch) {
    queryParams.append("search", normalizedSearch);
  }

  return sortFaqs(await fetchFaqCollection(path, queryParams, locale));
}

// Cached per request: the FAQ page resolves the category list, and every FAQ
// fetch resolves category slugs through it, so without cache() the fetch +
// transform would run repeatedly for a single render.
export const fetchFaqCategories = cache(
  async (locale?: string): Promise<FaqCategory[]> => {
    const response = await apiClient.get<FaqCategoryDto[]>("content/faq-categories", {
      query: {
        itemsPerPage: "50",
      },
      locale,
      next: { revalidate: 10 },
      mode: "cors",
      credentials: "omit",
    });

    return response.data
      .map((category) => transformFaqCategory(category, locale))
      .filter((category) => category.status !== false && category.name);
  }
);

export function useFaqs(
  params: FetchFaqsParams = {},
  options?: ApiQueryOptions<Faq[]>
) {
  return useQuery(
    createApiQueryOptions(faqKeys.list(params), () => fetchFaqs(params), options)
  );
}

export function useFaqCategories(options?: ApiQueryOptions<FaqCategory[]>) {
  return useQuery(
    createApiQueryOptions(faqKeys.categories(), () => fetchFaqCategories(), options)
  );
}
