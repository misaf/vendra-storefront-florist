import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import {
  ProductsClient,
  fetchProductCategories,
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

  // The catalogue render already resolves this list server-side (and
  // fetchProductCategories is request-cached), so handing it to the client
  // costs nothing and spares the page a hydration swap: without it the heading
  // renders "All Products" for a category URL until the browser's own copy of
  // the list arrives. A failure here only costs the labels, never the page.
  const [initial, categories] = await Promise.all([
    loadProductsPage({ locale, category, search, sort }),
    fetchProductCategories(locale).catch(() => []),
  ]);

  return (
    <Suspense fallback={null}>
      <ProductsClient
        key={locale}
        initialProducts={initial.initialProducts}
        initialPagination={initial.initialPagination}
        initialError={initial.initialError}
        initialQueryKey={initial.initialQueryKey}
        initialCategories={categories}
      />
    </Suspense>
  );
}
