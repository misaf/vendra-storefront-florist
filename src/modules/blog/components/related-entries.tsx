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
}: {
  postsPromise: Promise<BlogPost[]>;
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

  return (
    <section className="store-section border-t border-border bg-background">
      <div className="store-container">
        <div className="mb-8 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
          <h2 className="flex items-center gap-2.5 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            <span className="petal-dot" aria-hidden="true" />
            {t("blog.moreEntries") || "More from the Journal"}
          </h2>
          <Link
            href="/blog"
            className="group -my-2 inline-flex min-h-11 items-center gap-1.5 rounded-sm py-2 text-sm font-semibold text-foreground"
          >
            {t("blog.viewAllPosts") || "View All Posts"}
            <ArrowIcon className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
          </Link>
        </div>
        <PostGrid>
          {posts.map((post) => (
            <BlogPostCard
              key={post.id}
              post={post}
              formatDate={formatDate}
              readMoreText={t("blog.readMore") || "Read More"}
            />
          ))}
        </PostGrid>
      </div>
    </section>
  );
}
