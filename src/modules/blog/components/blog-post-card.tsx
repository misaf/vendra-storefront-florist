"use client";

import { Link } from "@/shared/i18n/navigation";
import Image from "next/image";
import { useState } from "react";
import { useTranslations } from "@/shared/hooks/use-translations";
import { Card, CardDescription, CardFooter, CardHeader } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { ArrowLeft, ArrowRight, Calendar, ImageOff } from "lucide-react";
import { cn, normalizeImageUrl } from "@/shared/lib/utils";
import { createReadableResourcePath } from "@/shared/lib/slug-url";
import { isRtlLocale } from "@/shared/lib/locale";
import type { Post as BlogPost } from "../types";
import { DynamicText } from "@/shared/components/dynamic-text";

interface BlogPostCardProps {
  post: BlogPost;
  formatDate: (dateString: string) => string;
  readMoreText?: string;
  showDate?: boolean;
  showReadMore?: boolean;
  showExcerpt?: boolean;
  showCategory?: boolean;
  compact?: boolean;
}

export function BlogPostCard({
  post,
  formatDate,
  readMoreText = "Read More",
  showDate = true,
  showReadMore = true,
  showExcerpt = true,
  showCategory = true,
  compact = false,
}: BlogPostCardProps) {
  const [hasImageError, setHasImageError] = useState(false);
  const { t, locale } = useTranslations();
  const ArrowIcon = isRtlLocale(locale) ? ArrowLeft : ArrowRight;

  return (
    <Link
      href={`/blog/${createReadableResourcePath(post.id, post.slug)}`}
      className="block rounded-xl"
    >
      <Card
        className={cn(
          "group relative flex h-full flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1",
          compact
            ? "gap-2 rounded-xl border-0 bg-transparent py-0 shadow-none"
            : "gap-3 rounded-none border-0 bg-transparent py-0 text-card-foreground shadow-none"
        )}
      >
        <div
          className={cn(
            "relative overflow-hidden bg-muted",
            compact ? "aspect-[3/2] rounded-xl" : "aspect-[4/3] rounded-xl"
          )}
        >
          {hasImageError ? (
            <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-storefront-brand-soft text-storefront-text-muted dark:bg-storefront-brand-soft dark:text-storefront-text-muted">
              <span className="flex size-12 items-center justify-center rounded-full bg-card/70 shadow-sm">
                <ImageOff className="h-6 w-6" />
              </span>
              <span className="text-xs font-semibold">
                {t("blog.imageUnavailable")}
              </span>
            </div>
          ) : (
            <Image
              src={normalizeImageUrl(post.thumbnail || post.image)}
              /* The title is inside the same link — see FeaturedBlogPostCard. */
              alt=""
              width={400}
              height={225}
              sizes={compact ? "(min-width: 1024px) 18rem, 45vw" : "(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              unoptimized
              onError={() => setHasImageError(true)}
            />
          )}
          {showCategory && post.category && (
            <Badge variant="secondary" className="store-dynamic-text absolute start-3 top-3 max-w-[calc(100%-1.5rem)] whitespace-normal bg-card/90 text-primary shadow-sm backdrop-blur">
              <DynamicText>{post.category}</DynamicText>
            </Badge>
          )}
        </div>
        <CardHeader className={cn("flex-1", compact ? "gap-1 px-0.5 py-0" : "gap-2 px-0 py-0")}>
          {showDate ? (
            <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" aria-hidden="true" />
              <time dateTime={post.publishedAt || post.createdAt}>
                {formatDate(post.publishedAt || post.createdAt)}
              </time>
            </div>
          ) : null}
          <h3
            className={cn(
              "store-dynamic-text line-clamp-2 font-semibold transition-colors",
              compact
                ? "text-sm leading-5 text-foreground group-hover:text-primary sm:text-base sm:leading-6"
                : "font-display text-2xl font-medium leading-7 group-hover:text-rose [.locale-fa_&]:leading-[1.65]"
            )}
          >
            <DynamicText>{post.title}</DynamicText>
          </h3>
          {showExcerpt ? (
            <CardDescription className="line-clamp-3 leading-6">
              {post.excerpt}
            </CardDescription>
          ) : null}
        </CardHeader>
        {showReadMore ? (
          <CardFooter className="px-0 pb-0">
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-foreground">
              {readMoreText}
              <ArrowIcon className="size-3.5" />
            </span>
          </CardFooter>
        ) : null}
      </Card>
    </Link>
  );
}
