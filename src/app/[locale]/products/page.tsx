import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import {
  ProductsClient,
  ProductsPageSkeleton,
  fetchProductCategories,
  loadProductsPage,
  normalizeAvailability,
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

/**
 * The page is a thin, synchronous shell so the `<Suspense>` fallback below can
 * actually paint: the awaits live in the child. This is where the catalogue's
 * loading skeleton lives now — it used to be a route-level `loading.tsx`, which
 * put a streaming boundary over the whole `products` segment and stopped the
 * nested `[slug]` route from ever returning a 404 status.
 */
export default function ProductsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <Suspense fallback={<ProductsPageSkeleton />}>
      <ProductsPageContent params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function ProductsPageContent({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  const query = await searchParams;
  const category = normalizeCategory(readFirst(query.category));
  const availability = normalizeAvailability(readFirst(query.availability));
  const search = normalizeSearch(readFirst(query.search));
  const sort = normalizeSort(readFirst(query.sort));

  // The catalogue render already resolves this list server-side (and
  // fetchProductCategories is request-cached), so handing it to the client
  // costs nothing and spares the page a hydration swap: without it the heading
  // renders "All Products" for a category URL until the browser's own copy of
  // the list arrives. A failure here only costs the labels, never the page.
  const [initial, categories] = await Promise.all([
    loadProductsPage({ locale, category, availability, search, sort }),
    fetchProductCategories(locale).catch(() => []),
  ]);

  return (
    <ProductsClient
      key={locale}
      initialProducts={initial.initialProducts}
      initialPagination={initial.initialPagination}
      initialError={initial.initialError}
      initialQueryKey={initial.initialQueryKey}
      initialCategories={categories}
    />
  );
}
