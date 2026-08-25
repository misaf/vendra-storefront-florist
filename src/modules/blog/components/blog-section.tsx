"use client";

import { Link } from "@/shared/i18n/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { BlogPostCard } from "./blog-post-card";
import { isRtlLocale } from "@/shared/lib/locale";
import { useCallback } from "react";
import { formatLocaleDate } from "@/shared/lib/date";
import { useTranslations } from "@/shared/hooks/use-translations";
import { SectionHeader } from "@/shared/components/layout/section-header";
import type { Post as BlogPost, PostCategory } from "../types";

// One lead story and two supporting entries keep editorial content useful but
// clearly secondary to shopping.
const MAX_STOREFRONT_POSTS = 3;

interface BlogSectionProps {
  allPosts: BlogPost[];
  category?: PostCategory | null;
}

export function BlogSection({ allPosts, category }: BlogSectionProps) {
  // Own translations and own date formatting: both used to arrive as function
  // props, which a server page cannot supply.
  const { t, locale } = useTranslations();
  const formatDate = useCallback(
    (dateString: string) => formatLocaleDate(dateString, locale),
    [locale]
  );
  const isRTL = isRtlLocale(locale);
  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;
  const sectionTitle = t("blog.title") || "Blog";
  const posts = allPosts.slice(0, MAX_STOREFRONT_POSTS);
  const blogHref = category
    ? {
        pathname: "/blog" as const,
        query: { category: category.slug },
      }
    : "/blog";

  return (
    <section className="store-section store-scroll-anchor bg-secondary/45">
      <div className="store-container relative">
        <SectionHeader
          className="mb-8 sm:mb-10"
          eyebrow={t("blog.eyebrow")}
          title={sectionTitle}
          description={t("blog.subtitle")}
          action={
            <Link
              href={blogHref}
              className="group inline-flex min-h-11 shrink-0 items-center gap-2 rounded-sm text-sm font-bold text-foreground underline decoration-border underline-offset-8 transition-colors hover:text-primary hover:decoration-primary"
            >
              {t("blog.viewAllPosts") || "View All Posts"}
              <ArrowIcon className="size-4 transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
            </Link>
          }
        />

        {posts.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border bg-background/50 px-5 py-8 text-sm leading-6 text-muted-foreground">
            {t("blog.noPosts") || "No posts found"}
          </div>
        ) : (
          /* Three equal cards. The band used to lead on one large entry with a
             scrim over its photograph and set the other two as small
             title-only tiles, which said the newest post was the important one
             — a ranking the journal never expressed. Three of the same object
             is what the design system draws here, and it is also what the
             content is: three recent entries, none of them featured. */
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
            {posts.map((post) => (
              <BlogPostCard
                key={post.id}
                post={post}
                formatDate={formatDate}
                showDate={false}
                compact
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
