"use client";

import { Link } from "@/shared/i18n/navigation";
import { BlogPostCard } from "./blog-post-card";
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
  const sectionTitle = t("blog.title") || "Blog";
  const posts = allPosts.slice(0, MAX_STOREFRONT_POSTS);
  const blogHref = category
    ? {
        pathname: "/blog" as const,
        query: { category: category.slug },
      }
    : "/blog";

  return (
    <section className="store-scroll-anchor bg-background">
      <div className="store-container store-section-close relative">
        <SectionHeader
          title={sectionTitle}
          action={
            <Link href={blogHref} className="store-text-action">
              {t("blog.viewAllPosts") || "View All Posts"}
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
          <div className="grid gap-[1.375rem] sm:grid-cols-[repeat(auto-fit,minmax(min(100%,16.375rem),1fr))]">
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
