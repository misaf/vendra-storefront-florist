import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import {
  ProductsClient,
  loadProductsPage,
  normalizeCategory,
  normalizeSort,
} from "@/modules/products";
import { buildMetadata } from "@/shared/seo";
import { readFirst, normalizeSearch } from "@/shared/lib/search-params";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "products" });

  return buildMetadata({
    locale,
    path: "/products",
    title: t("metadataTitle"),
    description: t("metadataDescription"),
  });
}

export default async function ProductsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  const query = await searchParams;
  const category = normalizeCategory(readFirst(query.category));
  const search = normalizeSearch(readFirst(query.search));
  const sort = normalizeSort(readFirst(query.sort));

  const initial = await loadProductsPage({ locale, category, search, sort });

  return (
    <Suspense fallback={null}>
      <ProductsClient
        initialProducts={initial.initialProducts}
        initialPagination={initial.initialPagination}
        initialError={initial.initialError}
        initialQueryKey={initial.initialQueryKey}
      />
    </Suspense>
  );
}
