import type { FetchFaqsParams } from "../types";

export const faqKeys = {
  all: ["faqs"] as const,
  lists: () => [...faqKeys.all, "list"] as const,
  list: (params: FetchFaqsParams = {}) => [...faqKeys.lists(), params] as const,
  categories: (locale: string) =>
    [...faqKeys.all, "categories", locale] as const,
};
