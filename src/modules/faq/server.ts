import "server-only";

import { cache } from "react";
import { serverApiClient } from "@/shared/api/server-client";
import {
  fetchFaqCategories as fetchFaqCategoriesCore,
  fetchFaqs as fetchFaqsCore,
} from "./lib/queries";
import type { FetchFaqsParams } from "./types";

export const fetchFaqs = (params: FetchFaqsParams = {}) =>
  fetchFaqsCore(params, serverApiClient);

export const fetchFaqCategories = cache((locale?: string) =>
  fetchFaqCategoriesCore(locale, serverApiClient)
);

export type { Faq, FaqCategory, FetchFaqsParams } from "./types";
