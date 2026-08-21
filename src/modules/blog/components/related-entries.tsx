"use client";

import { use, useCallback } from "react";
import { Link } from "@/shared/i18n/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { BlogPostCard } from "./blog-post-card";
import { PostGrid } from "./post-grid";
import { useTranslations } from "@/shared/hooks/use-translations";
import { formatLocaleDate } from "@/shared/lib/date";
import { isRtlLocale } from "@/shared/lib/locale";
import type { Post as BlogPost } from "../types";

export function RelatedEntries({
  postsPromise,
  categoryName,
  categorySlug,
}: {
  postsPromise: Promise<BlogPost[]>;
  /** The current post's category, used to name the section when the row
   *  turned out to be entirely from it. */
  categoryName?: string;
  categorySlug?: string;
}) {
  const posts = use(postsPromise);
  const { t, locale } = useTranslations();
  const isRtl = isRtlLocale(locale);
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;
  const formatDate = useCallback(
    (dateString: string) => formatLocaleDate(dateString, locale),
    [locale]
  );

  if (posts.length === 0) return null;

  // "More in Bouquets" only when the row really is all bouquets. A topical
  // promise the cards below don't keep is worse than the generic heading.
  const isSingleCategory =
    Boolean(categorySlug && categoryName) &&
    posts.every((post) => post.categorySlug === categorySlug);

  const heading = isSingleCategory
    ? t("blog.relatedInCategory", { category: categoryName as string })
    : t("blog.moreEntries");

  return (
    <section
      aria-labelledby="related-entries"
      className="store-section border-t border-border bg-background"
    >
      <div className="store-container max-w-6xl">
        <div className="mb-8 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
          <h2
            id="related-entries"
            className="store-dynamic-text flex items-center gap-2.5 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground"
          >
            <span className="petal-dot" aria-hidden="true" />
            <bdi>{heading}</bdi>
          </h2>
          <Link
            href="/blog"
            className="group -my-2 inline-flex min-h-11 items-center gap-1.5 rounded-sm py-2 text-sm font-semibold text-foreground"
          >
            {t("blog.viewAllPosts")}
            <ArrowIcon className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
          </Link>
        </div>
        <PostGrid>
          {posts.map((post) => (
            <BlogPostCard
              key={post.id}
              post={post}
              formatDate={formatDate}
              readMoreText={t("blog.readMore")}
            />
          ))}
        </PostGrid>
      </div>
    </section>
  );
}
