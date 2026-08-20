import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import {
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

export default async function BlogPosts({
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
    <Suspense fallback={null}>
      <BlogPostsClient
        key={locale}
        initialPosts={initial.initialPosts}
        initialPagination={initial.initialPagination}
        initialError={initial.initialError}
        initialQueryKey={initial.initialQueryKey}
        categories={initial.categories}
      />
    </Suspense>
  );
}
