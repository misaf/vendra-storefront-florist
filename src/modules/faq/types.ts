import type { LocalizedValue } from "@/shared/api/localized";
import type { ResourceReference } from "@/shared/api/types";

export interface FaqResource {
  id: string | number;
  type?: string;
  relationshipNames?: string[];
}

export type FaqCategorySummary = ResourceReference;

export interface FaqDto extends FaqResource {
  name: LocalizedValue<string>;
  description?: LocalizedValue<unknown>;
  slug?: LocalizedValue<string>;
  position?: number | string;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
  faqCategory?: FaqCategorySummary | FaqCategorySummary[];
}

export interface FaqCategoryDto extends FaqResource {
  name: LocalizedValue<string>;
  slug: LocalizedValue<string>;
  description?: LocalizedValue<string>;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Faq {
  id: number;
  question: string;
  answer: string;
  position: number;
  category?: string;
  categorySlug?: string;
}

export interface FaqCategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
  status?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface FetchFaqsParams {
  page?: number;
  perPage?: number;
  locale?: string;
  search?: string;
  category?: string;
}
