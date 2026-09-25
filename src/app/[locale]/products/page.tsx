import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import {
  ProductsClient,
  ProductsPageSkeleton,
} from "@/modules/products";
import {
  fetchProductCategories,
  loadCatalogPriceRange,
  loadProductsPage,
  normalizeAvailability,
  normalizeCategory,
  normalizePrice,
  normalizeSort,
  resolvePriceRange,
} from "@/modules/products/server";
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

  const requestedMin = normalizePrice(readFirst(query.minPrice));
  const requestedMax = normalizePrice(readFirst(query.maxPrice));
  const wantsBand = requestedMin != null || requestedMax != null;

  // The price track is wanted by every catalogue render — the rail draws it —
  // but it only *gates* the products fetch when the URL actually carries a
  // bound, because clamping a bound to the track is what decides whether it
  // narrows anything. So it is started here and awaited early only in that
  // case; on the ordinary page load it resolves alongside the products instead
  // of in front of them.
  const priceRangePromise = loadCatalogPriceRange(locale);
  const band = wantsBand
    ? resolvePriceRange(requestedMin, requestedMax, await priceRangePromise)
    : {};

  // The catalogue render already resolves this list server-side (and
  // fetchProductCategories is request-cached), so handing it to the client
  // costs nothing and spares the page a hydration swap: without it the heading
  // renders "All Products" for a category URL until the browser's own copy of
  // the list arrives. A failure here only costs the labels, never the page.
  const [initial, categories, priceRange] = await Promise.all([
    loadProductsPage({ locale, category, availability, search, sort, ...band }),
    fetchProductCategories(locale).catch(() => []),
    priceRangePromise,
  ]);

  return (
    <ProductsClient
      key={locale}
      initialPage={initial.initialPage}
      initialQueryKey={initial.initialQueryKey}
      initialCategories={categories}
      priceRange={priceRange}
    />
  );
}
