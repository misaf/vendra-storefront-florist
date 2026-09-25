"use client";

import { Link } from "@/shared/i18n/navigation";
import Image from "next/image";
import { useState } from "react";
import { useTranslations } from "@/shared/hooks/use-translations";
import { ImageOff } from "lucide-react";
import { cn, normalizeImageUrl } from "@/shared/lib/utils";
import { createReadableResourcePath } from "@/shared/lib/slug-url";
import type { Post as BlogPost } from "../types";
import { DynamicText } from "@/shared/components/dynamic-text";

interface BlogPostCardProps {
  post: BlogPost;
  formatDate: (dateString: string) => string;
  /** The dated line under the title; off where the grid is a preview rail. */
  showDate?: boolean;
  showExcerpt?: boolean;
  showCategory?: boolean;
  /** A denser step for the home page's preview, where three sit beside a
   *  section heading rather than filling the page. */
  compact?: boolean;
}

/**
 * One entry in the journal, as the Organic system draws a content card: a solid
 * plate of the warm surface with the picture bled to its top edge, then a
 * kicker, the title and whatever supporting line the surface calls for.
 *
 * It replaces two different cards that had drifted apart — this one, which drew
 * a borderless transparent box, and a "featured" variant that laid white text
 * over a black gradient scrim on the photograph. The scrim is the pattern this
 * design system explicitly trades away: it costs the picture two thirds of its
 * contrast to make type survive on top of it, when the same type is legible for
 * free on the surface directly below.
 */
export function BlogPostCard({
  post,
  formatDate,
  showDate = true,
  showExcerpt = true,
  showCategory = true,
  compact = false,
}: BlogPostCardProps) {
  const [hasImageError, setHasImageError] = useState(false);
  const { t } = useTranslations();
  const date = post.publishedAt || post.createdAt;

  return (
    <Link
      href={`/blog/${createReadableResourcePath(post.id, post.slug)}`}
      className="group flex h-full flex-col overflow-hidden rounded-3xl bg-card text-card-foreground shadow-card transition-transform duration-300 hover:-translate-y-1 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
    >
      <div className="organic-washed relative aspect-[16/10] overflow-hidden bg-muted">
        {hasImageError ? (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-muted-foreground">
            <ImageOff className="size-6" aria-hidden="true" />
            <span className="text-xs font-semibold">
              {t("blog.imageUnavailable")}
            </span>
          </div>
        ) : (
          <Image
            src={normalizeImageUrl(post.thumbnail || post.image)}
            /* Empty on purpose: the title is inside the same link, so an alt
               here would make the link announce its own name twice. */
            alt=""
            fill
            sizes={
              compact
                ? "(min-width: 1024px) 24rem, (min-width: 640px) 45vw, calc(100vw - 2rem)"
                : "(min-width: 1024px) 30vw, (min-width: 640px) 45vw, calc(100vw - 2rem)"
            }
            className="object-cover transition-transform duration-500 group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
            unoptimized
            onError={() => setHasImageError(true)}
          />
        )}
      </div>

      <div
        className={cn(
          "flex flex-1 flex-col px-6 pb-[1.625rem] pt-1.5",
          compact && "px-[1.375rem] pb-6 pt-1"
        )}
      >
        {/* The kicker: the collection this entry belongs to, in the accent, at
            the smallest step the system sets. Not a filled tag — a tag on a
            card that is already a filled plate reads as a second surface. */}
        {showCategory && post.category ? (
          <p className="store-dynamic-text mb-2 line-clamp-1 text-[0.625rem] font-bold uppercase tracking-[0.1em] text-rose [.locale-fa_&]:tracking-normal [.locale-fa_&]:normal-case">
            <DynamicText>{post.category}</DynamicText>
          </p>
        ) : null}

        <h3
          className={cn(
            "store-dynamic-text font-display line-clamp-3 leading-[1.2] text-card-foreground transition-colors group-hover:text-rose [.locale-fa_&]:leading-[1.6]",
            compact ? "text-[1.1875rem]" : "text-xl"
          )}
        >
          <DynamicText>{post.title}</DynamicText>
        </h3>

        {showExcerpt && post.excerpt ? (
          <p className="store-lede mt-2 line-clamp-2 text-[0.84375rem] text-card-foreground/70">
            {post.excerpt}
          </p>
        ) : null}

        {showDate && date ? (
          <p className="mt-auto pt-4 text-xs text-muted-foreground">
            <time dateTime={date}>{formatDate(date)}</time>
          </p>
        ) : null}
      </div>
    </Link>
  );
}
