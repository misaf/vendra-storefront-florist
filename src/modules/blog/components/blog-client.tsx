"use client";

import Image from "next/image";
import { PageShell } from "@/shared/components/layout/page-shell";
import { PostGrid, PostGridSkeleton } from "./post-grid";
import { PageHeader } from "@/shared/components/layout/page-header";
import { BlogPostCard } from "./blog-post-card";
import { Link } from "@/shared/i18n/navigation";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { ErrorState } from "@/shared/components/ui/error-state";
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyMedia } from "@/shared/components/ui/empty";
import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useTranslations } from "@/shared/hooks/use-translations";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@/shared/i18n/navigation";
import { Loader2, BookOpen, ArrowLeft, ArrowRight, ImageOff } from "lucide-react";
import { usePostFeed } from "../lib/queries";
import type { FetchBlogPostsResult, Post as BlogPost } from "../types";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { formatLocaleDate } from "@/shared/lib/date";
import { createReadableResourcePath } from "@/shared/lib/slug-url";
import { normalizeImageUrl } from "@/shared/lib/utils";
import { isRtlLocale } from "@/shared/lib/locale";
import { buildBlogQueryKey } from "../lib/keys";
import { DynamicText } from "@/shared/components/dynamic-text";

interface BlogPostsClientProps {
  /** Page one as the server fetched it, or null when that call failed. */
  initialPage: FetchBlogPostsResult | null;
  /** The filters `initialPage` answers, so a stale page is not seeded. */
  initialQueryKey: string;
}

/* The featured lead — the journal opens on its most recent entry, set as an
   asymmetric editorial spread rather than a stock-photo hero. */
function FeaturedPost({
  post,
  metaText,
  dateText,
  dateValue,
  readMoreText,
  isRtl,
}: {
  post: BlogPost;
  metaText: string;
  dateText: string;
  dateValue: string;
  readMoreText: string;
  isRtl: boolean;
}) {
  const [hasImageError, setHasImageError] = useState(false);
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  return (
    <Link
      href={`/blog/${createReadableResourcePath(post.id, post.slug)}`}
      className="group block rounded-2xl"
    >
      <article className="grid items-center gap-[clamp(1.75rem,4vw,2.75rem)] [grid-template-columns:repeat(auto-fit,minmax(min(100%,20.625rem),1fr))]">
        <div className="organic-washed relative aspect-[16/10] overflow-hidden rounded-[2.125rem] bg-muted shadow-card">
          {hasImageError ? (
            <div className="flex h-full w-full items-center justify-center text-storefront-text-muted">
              <ImageOff className="h-8 w-8" />
            </div>
          ) : (
            <Image
              src={normalizeImageUrl(post.image)}
              /* The title is inside the same link, so an alt would repeat it. */
              alt=""
              fill
              sizes="(min-width: 1024px) 58vw, 100vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
              unoptimized
              preload
              onError={() => setHasImageError(true)}
            />
          )}
        </div>

        {/* The collection as a tag, then the headline, the standfirst and one
            dated line. It used to open on "LATEST ENTRY / GENERAL" in tracked
            capitals and close on a second dated line with a calendar glyph —
            three meta rows around two of content. */}
        <div>
          <Badge variant="sage" className="px-3 py-1 text-xs">
            <span className="store-dynamic-text">
              {post.category ? (
                <DynamicText>{post.category}</DynamicText>
              ) : (
                metaText
              )}
            </span>
          </Badge>

          <h2 className="store-dynamic-text font-display mt-4 text-[clamp(1.75rem,3vw,2.5rem)] leading-[1.1] text-foreground transition-colors group-hover:text-rose [.locale-fa_&]:leading-[1.45]">
            <DynamicText>{post.title}</DynamicText>
          </h2>

          {post.excerpt ? (
            <p className="store-lede mt-3.5 line-clamp-3 text-[0.96875rem] leading-[1.65] text-foreground/75">
              {post.excerpt}
            </p>
          ) : null}

          <p className="mt-4 text-[0.8125rem] text-foreground/60">
            <time dateTime={dateValue}>{dateText}</time>
          </p>

          <span className="store-text-action mt-3">
            {readMoreText}
            <ArrowIcon className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
          </span>
        </div>
      </article>
    </Link>
  );
}

export default function BlogPostsClient({
  initialPage,
  initialQueryKey,
}: BlogPostsClientProps) {
  const { t, locale } = useTranslations();
  const searchParams = useSearchParams();
  const router = useRouter();
  const isRtl = isRtlLocale(locale);
  const selectedCategory = searchParams.get("category") || "all";
  const searchQuery = searchParams.get("search") || "";
  const queryKey = buildBlogQueryKey(locale, selectedCategory, searchQuery);
  const observerTarget = useRef<HTMLDivElement>(null);

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    refetch,
  } = usePostFeed(
    {
      locale,
      category: selectedCategory !== "all" ? selectedCategory : undefined,
      search: searchQuery || undefined,
    },
    {
      // Only when the server's page still answers the filters in the URL — see
      // the catalogue's twin for why an unconditional seed shows stale entries.
      initialPage:
        queryKey === initialQueryKey ? (initialPage ?? undefined) : undefined,
    }
  );

  const posts = useMemo(() => {
    const seen = new Set<number>();
    return (data?.pages ?? [])
      .flatMap((page) => page.posts)
      .filter((post) => !seen.has(post.id) && seen.add(post.id));
  }, [data]);

  const pagination = data?.pages.at(-1)?.pagination ?? null;
  const loading = isFetching && !isFetchingNextPage;
  const loadingMore = isFetchingNextPage;
  const hasMore = hasNextPage;

  useEffect(() => {
    const target = observerTarget.current;
    if (!hasNextPage || isFetching || !target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) fetchNextPage();
      },
      { threshold: 0.1 }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetching]);

  const formatDate = useCallback(
    (dateString: string) => formatLocaleDate(dateString, locale),
    [locale]
  );

  const navigate = useCallback(
    (next: { category?: string; search?: string }) => {
      const category = next.category ?? selectedCategory;
      const search = (next.search ?? searchQuery).trim();
      const params = new URLSearchParams();
      if (category && category !== "all") params.set("category", category);
      if (search) params.set("search", search);
      router.replace(
        {
          pathname: "/blog",
          query: Object.fromEntries(params),
        },
        { scroll: false }
      );
    },
    [router, selectedCategory, searchQuery]
  );

  /* Still reachable: the header's search palette can land here with a query,
     and this is the way back out of it. */
  const handleClearSearch = useCallback(() => {
    navigate({ search: "" });
  }, [navigate]);

  // The latest entry leads as a featured spread — but never while searching,
  // where a results grid reads more honestly.
  const showFeatured = !searchQuery && !loading && !error && posts.length > 0;
  const featuredPost = showFeatured ? posts[0] : null;
  const gridPosts = featuredPost ? posts.slice(1) : posts;

  const totalLabel = pagination
    ? `${new Intl.NumberFormat(locale).format(pagination.total)} ${
        pagination.total === 1
          ? t("blog.postAvailable") || "post"
          : t("blog.postsAvailable") || "posts"
      }`
    : null;

  return (
    <PageShell>
      <section className="bg-background pb-16 sm:pb-24">
        <PageHeader
          eyebrow={
            <Badge variant="clay" className="px-3 py-1 text-xs">
              {t("blog.eyebrow") || "Field notes"}
            </Badge>
          }
          title={t("blog.title") || "Blog"}
          description={t("blog.subtitle") || "Read our latest articles and updates"}
          className="pb-0 sm:pb-0"
        />

        <div className="store-container">
          {/* Results meta */}
          <div className="mt-8 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
            <p className="store-label">
              {searchQuery ? (
                <>
                  {t("blog.searchResults") || "Search results"}
                  <span className="text-foreground"> / “{searchQuery}”</span>
                </>
              ) : loading ? (
                <Loader2 className="inline h-3.5 w-3.5 animate-spin" />
              ) : (
                totalLabel
              )}
            </p>
            {searchQuery && (
              <button
                onClick={handleClearSearch}
                className="min-h-11 rounded-sm px-1 text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
              >
                {t("search.clearSearch") || "Clear search"}
              </button>
            )}
          </div>

          <div className="mt-8">
            {error && (
              <ErrorState
                className="mb-8"
                message={
                  t("blog.loadError") ||
                  "We couldn't load the journal just now. Please check your connection and try again."
                }
                onRetry={() => refetch()}
                retryLabel={t("products.tryAgain") || "Try Again"}
                retryingLabel={t("products.retrying")}
                isRetrying={loading}
              />
            )}

            {loading ? (
              <>
                {!searchQuery && (
                  <div className="mb-12 border-b border-border pb-12 sm:mb-14 sm:pb-14">
                    <div className="grid gap-6 lg:grid-cols-12 lg:items-center lg:gap-10">
                      <Skeleton className="aspect-[16/10] w-full rounded-2xl lg:col-span-7" />
                      <div className="lg:col-span-5">
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="mt-4 h-10 w-full" />
                        <Skeleton className="mt-3 h-10 w-3/4" />
                        <Skeleton className="mt-5 h-4 w-40" />
                      </div>
                    </div>
                  </div>
                )}
                <PostGridSkeleton />
              </>
            ) : posts.length === 0 ? (
              <Empty className="py-12">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <BookOpen className="h-6 w-6" />
                  </EmptyMedia>
                  <EmptyTitle>{t("blog.noPosts") || "No posts found"}</EmptyTitle>
                  <EmptyDescription>
                    {searchQuery
                      ? t("blog.noResultsDescription", { query: searchQuery })
                      : t("blog.noPostsDescription") ||
                        "There are no blog posts available yet. Check back soon."}
                  </EmptyDescription>
                </EmptyHeader>
                {searchQuery && (
                  <Button onClick={handleClearSearch} variant="outline">
                    {t("blog.clearSearch") || "Clear search"}
                  </Button>
                )}
              </Empty>
            ) : (
              <>
                {featuredPost && (
                  <div className="mb-12 border-b border-border pb-12 sm:mb-14 sm:pb-14">
                    <FeaturedPost
                      post={featuredPost}
                      metaText={t("blog.latestEntry") || "Latest entry"}
                      dateText={formatDate(
                        featuredPost.publishedAt || featuredPost.createdAt
                      )}
                      dateValue={featuredPost.publishedAt || featuredPost.createdAt}
                      readMoreText={t("blog.readMore") || "Read more"}
                      isRtl={isRtl}
                    />
                  </div>
                )}

                {gridPosts.length > 0 && (
                  <PostGrid>
                    {gridPosts.map((post) => (
                      <BlogPostCard
                        key={post.id}
                        post={post}
                        formatDate={formatDate}
                      />
                    ))}
                  </PostGrid>
                )}

                {/* Infinite scroll sentinel (progressive enhancement) */}
                <div ref={observerTarget} className="h-px" aria-hidden="true" />
                {loadingMore ? (
                  <div className="mt-8 flex items-center justify-center" role="status" aria-live="polite">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    <span className="ms-2 text-sm text-muted-foreground">
                      {t("blog.loadingMore") || "Loading more posts..."}
                    </span>
                  </div>
                ) : hasMore ? (
                  // Manual fallback so keyboard/screen-reader users can advance
                  // and everyone can reach the footer past the feed.
                  <div className="mt-8 flex justify-center">
                    <Button
                      variant="outline"
                      onClick={() =>
                        fetchNextPage()
                      }
                    >
                      {t("blog.loadMore") || "Load more posts"}
                    </Button>
                  </div>
                ) : null}
                {!hasMore && posts.length > 0 && (
                  <div className="mt-10">
                    <span className="store-seam mx-auto max-w-xs">
                      <span className="h-px flex-1" aria-hidden="true" />
                      <span className="store-label">
                        {t("blog.allPostsLoaded") || "All posts loaded"}
                      </span>
                      <span className="h-px flex-1" aria-hidden="true" />
                    </span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
