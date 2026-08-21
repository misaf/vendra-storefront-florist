import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import {
  BlogPageSkeleton,
  BlogPostsClient,
  loadPostsPage,
  normalizeCategory,
} from "@/modules/blog";
import { buildMetadata } from "@/shared/seo";
import { readFirst, normalizeSearch } from "@/shared/lib/search-params";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "blog" });

  return buildMetadata({
    locale,
    path: "/blog",
    title: t("metadataTitle"),
    description: t("metadataDescription"),
  });
}

/** Thin shell + awaiting child, so the skeleton below paints. See ProductsPage. */
export default function BlogPosts({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <Suspense fallback={<BlogPageSkeleton />}>
      <BlogPostsContent params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function BlogPostsContent({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  const query = await searchParams;
  const category = normalizeCategory(readFirst(query.category));
  const searchQuery = normalizeSearch(readFirst(query.search));

  const initial = await loadPostsPage({
    locale,
    category,
    search: searchQuery,
  });

  return (
    <BlogPostsClient
      key={locale}
      initialPosts={initial.initialPosts}
      initialPagination={initial.initialPagination}
      initialError={initial.initialError}
      initialQueryKey={initial.initialQueryKey}
      categories={initial.categories}
    />
  );
}
