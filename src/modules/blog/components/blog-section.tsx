"use client";

import { Link } from "@/shared/i18n/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { BlogPostCard } from "./blog-post-card";
import { FeaturedBlogPostCard } from "./featured-blog-post-card";
import { isRtlLocale } from "@/shared/lib/locale";
import { useCallback } from "react";
import { formatLocaleDate } from "@/shared/lib/date";
import { useTranslations } from "@/shared/hooks/use-translations";
import { SectionHeader } from "@/shared/components/layout/section-header";
import type { Post as BlogPost, PostCategory } from "../types";

// 1 featured lead post + 8 grid posts
const MAX_STOREFRONT_POSTS = 9;

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
  const [featuredPost, ...gridPosts] = posts;
  const blogHref = category
    ? {
        pathname: "/blog" as const,
        query: { category: category.slug },
      }
    : "/blog";

  return (
    <section className="storefront-view-panel store-section-lg store-scroll-anchor relative overflow-hidden bg-storefront-brand text-storefront-brand-foreground dark:bg-storefront-surface dark:text-foreground">
      <div className="store-container relative">
        {/* This heading used to run to text-6xl (60px), overshooting the
            section step the rest of the storefront holds to. */}
        <SectionHeader
          className="mb-12"
          tone="inverted"
          eyebrow={t("blog.eyebrow")}
          title={sectionTitle}
          action={
            <Link
              href={blogHref}
              className="group inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-storefront-brand-foreground/70 transition-colors hover:text-storefront-brand-foreground"
            >
              <span className="border-b border-white/30 pb-1 transition-colors group-hover:border-white">
                {t("blog.viewAllPosts") || "View All Posts"}
              </span>
              <ArrowIcon className="size-4 transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
            </Link>
          }
        />

        {posts.length === 0 ? (
          <div className="rounded-lg border border-dashed border-white/20 bg-white/5 px-5 py-8 text-sm leading-6 text-storefront-brand-foreground/75 dark:text-muted-foreground">
            {t("blog.noPosts") || "No posts found"}
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-12">
            <div className={gridPosts.length > 0 ? "lg:col-span-5" : "lg:col-span-12"}>
              <FeaturedBlogPostCard
                post={featuredPost}
                imageUnavailableText={t("blog.imageUnavailable")}
              />
            </div>
            {gridPosts.length > 0 ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:col-span-7 lg:grid-cols-3">
                {gridPosts.map((post) => (
                  <BlogPostCard
                    key={post.id}
                    post={post}
                    formatDate={formatDate}
                    showDate={false}
                    showExcerpt={false}
                    showReadMore={false}
                    showCategory={false}
                    compact
                  />
                ))}
              </div>
            ) : null}
          </div>
        )}
      </div>
    </section>
  );
}
